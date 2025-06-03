import express, { type Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { pool } from "./db";
import { storage } from "./storage";
import { validateInviteSchema } from "@shared/schema";
import { z } from "zod";
import { productionDiscordBot } from "./production-discord-bot";
import sirv from "sirv";
import path from "path";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

function log(message: string, source = "express") {
  const timestamp = new Date().toLocaleString();
  console.log(`${timestamp} [${source}] ${message}`);
}

// Serve static files in production
function serveStatic(app: express.Express) {
  const distPath = path.resolve(process.cwd(), "dist/public");
  app.use(sirv(distPath, { 
    single: true,
    dev: false,
    gzip: true,
    brotli: true,
    setHeaders: (res: any, pathname: string) => {
      if (pathname.endsWith('.html')) {
        res.setHeader('Cache-Control', 'no-cache');
      } else {
        res.setHeader('Cache-Control', 'public, max-age=31536000');
      }
    }
  }));
}

async function initializeDatabase() {
  try {
    log('Initializing production database...');
    
    // Create all necessary tables with proper schema
    await pool.query(`
      CREATE TABLE IF NOT EXISTS invite_codes (
        id SERIAL PRIMARY KEY,
        code TEXT UNIQUE NOT NULL,
        is_used TEXT NOT NULL DEFAULT 'false',
        used_at TIMESTAMP,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        discord_user_id TEXT,
        discord_username TEXT
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS sessions (
        id SERIAL PRIMARY KEY,
        invite_code_id INTEGER REFERENCES invite_codes(id),
        access_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        user_agent TEXT,
        discord_user_id TEXT,
        discord_username TEXT
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS persistent_users (
        id SERIAL PRIMARY KEY,
        discord_user_id TEXT UNIQUE NOT NULL,
        discord_username TEXT NOT NULL,
        first_access TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        last_access TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create discord_requests table with proper error handling
    await pool.query(`
      CREATE TABLE IF NOT EXISTS discord_requests (
        id SERIAL PRIMARY KEY,
        discord_user_id TEXT NOT NULL,
        invite_code TEXT NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Add missing columns to existing tables if they don't exist
    try {
      await pool.query(`
        DO $$ 
        BEGIN
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                         WHERE table_name = 'discord_requests' AND column_name = 'invite_code') THEN
            ALTER TABLE discord_requests ADD COLUMN invite_code TEXT NOT NULL DEFAULT '';
          END IF;
        END $$;
      `);
    } catch (error) {
      // Column might already exist, continue
      log('Discord_requests table structure verified');
    }

    await pool.query(`
      CREATE TABLE IF NOT EXISTS reports (
        id SERIAL PRIMARY KEY,
        discord_user_id TEXT NOT NULL,
        discord_username TEXT NOT NULL,
        content TEXT NOT NULL,
        report_type TEXT NOT NULL,
        status TEXT DEFAULT 'open',
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Initialize default invite codes if none exist
    const codeCount = await pool.query('SELECT COUNT(*) FROM invite_codes');
    if (parseInt(codeCount.rows[0].count) === 0) {
      const defaultCodes = ['VIP-MEMBER', 'EARLY-BIRD', 'BETA-ACCESS', 'ALPHA-2024', 'DEMO-CODE'];
      for (const code of defaultCodes) {
        await pool.query('INSERT INTO invite_codes (code) VALUES ($1) ON CONFLICT (code) DO NOTHING', [code]);
      }
      log(`Initialized ${defaultCodes.length} default invite codes`);
    }

    log('Database initialization complete');
  } catch (error) {
    log(`Database initialization failed: ${error}`);
    throw error;
  }
}

function registerRoutes(app: express.Express): Server {
  const server = createServer(app);

  // Health check endpoint
  app.get("/health", (req, res) => {
    res.status(200).json({ status: "healthy", timestamp: new Date().toISOString() });
  });

  // Discord OAuth2 callback handler
  app.get("/api/discord/callback", async (req, res) => {
    try {
      const { code, error } = req.query;
      
      if (error) {
        return res.redirect(`/?error=discord_${error}`);
      }
      
      if (!code) {
        return res.redirect('/?error=direct_access_not_allowed');
      }

      const clientId = process.env.VITE_DISCORD_CLIENT_ID;
      const clientSecret = process.env.DISCORD_CLIENT_SECRET;
      const redirectUri = `${req.protocol}://${req.get('host')}/api/discord/callback`;

      if (!clientId || !clientSecret) {
        return res.redirect('/?error=oauth_not_configured');
      }

      // Exchange code for access token
      const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          grant_type: 'authorization_code',
          code: code as string,
          redirect_uri: redirectUri,
        }),
      });

      if (!tokenResponse.ok) {
        return res.redirect('/?error=token_exchange_failed');
      }

      const tokenData = await tokenResponse.json();
      
      // Get user information from Discord
      const userResponse = await fetch('https://discord.com/api/users/@me', {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
        },
      });

      if (!userResponse.ok) {
        return res.redirect('/?error=user_fetch_failed');
      }

      const userData = await userResponse.json();
      
      // Check if user exists in persistent_users table
      const existingUser = await storage.getUserByDiscord(userData.id);
      
      if (!existingUser) {
        return res.redirect('/?error=no_previous_access');
      }

      // Create new session for returning user
      const session = await storage.createSession({
        inviteCodeId: undefined,
        userAgent: req.headers['user-agent'] || null,
        discordUserId: userData.id,
        discordUsername: userData.username
      });

      // Redirect to dashboard with session data
      const sessionData = {
        sessionId: session.id,
        accessTime: session.accessTime,
        inviteCode: 'DISCORD_OAUTH',
        discordUsername: userData.username,
        discordUserId: userData.id,
        userAgent: req.headers['user-agent'] || null,
        usedAt: new Date().toISOString()
      };
      
      const encodedSession = encodeURIComponent(JSON.stringify(sessionData));
      res.redirect(`/dashboard?auth=success&session=${encodedSession}`);
    } catch (error) {
      log(`Discord OAuth callback error: ${error}`);
      res.redirect('/?error=oauth_failed');
    }
  });

  // Validate invite code
  app.post("/api/validate-invite", async (req, res) => {
    try {
      const { code } = validateInviteSchema.parse(req.body);

      const inviteCode = await storage.getInviteCodeByCode(code);
      
      if (!inviteCode) {
        return res.status(400).json({ 
          success: false, 
          message: "Invalid invite code. Please check and try again." 
        });
      }

      if (inviteCode.isUsed === "true") {
        return res.status(400).json({ 
          success: false, 
          message: "This invite code has already been used." 
        });
      }

      // Mark as used and create session
      await storage.markInviteCodeAsUsed(inviteCode.id);
      
      // Create persistent user record if Discord info is available
      if (inviteCode.discordUserId && inviteCode.discordUsername) {
        try {
          await storage.createPersistentUser(inviteCode.discordUserId, inviteCode.discordUsername);
        } catch (error) {
          // User might already exist, continue
        }
      }

      const session = await storage.createSession({
        inviteCodeId: inviteCode.id,
        userAgent: req.headers['user-agent'] || null,
        discordUserId: inviteCode.discordUserId,
        discordUsername: inviteCode.discordUsername
      });

      res.json({ 
        success: true, 
        message: "Invite code verified successfully!",
        session: {
          id: session.id,
          accessTime: session.accessTime,
          discordUsername: inviteCode.discordUsername,
        }
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          success: false, 
          message: error.errors[0]?.message || "Invalid input" 
        });
      }
      
      log(`Error validating invite: ${error}`);
      res.status(500).json({ 
        success: false, 
        message: "Internal server error" 
      });
    }
  });

  // Get session data with Discord usernames
  app.get("/api/sessions", async (req, res) => {
    try {
      const result = await storage.getSessionsWithDiscordData();
      res.json({ sessions: result });
    } catch (error) {
      log(`Error fetching sessions: ${error}`);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });

  // Get reports
  app.get("/api/reports", async (req, res) => {
    try {
      const reports = await storage.getReports();
      res.json({ reports });
    } catch (error) {
      log(`Error fetching reports: ${error}`);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });

  // System metrics endpoint
  app.get("/api/system-metrics", (req, res) => {
    const uptime = process.uptime();
    const memUsage = process.memoryUsage();
    
    res.json({
      cpuUsage: Math.round(Math.random() * 30 + 20), // Simulated
      memoryUsage: Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100),
      diskUsage: Math.round(Math.random() * 40 + 30), // Simulated
      networkIn: "2.1 MB",
      networkOut: "1.8 MB", 
      uptime: formatUptime(uptime)
    });
  });

  // Admin users endpoint
  app.get("/api/admin/users", async (req, res) => {
    try {
      const users = await storage.getUsersWithMemberRole();
      res.json({ users });
    } catch (error) {
      log(`Error fetching admin users: ${error}`);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });

  return server;
}

function formatUptime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
}

async function main() {
  try {
    // Initialize database first
    await initializeDatabase();
    
    // Start Discord bot with automatic command registration
    productionDiscordBot.start().catch((error: any) => {
      log(`Discord bot startup failed: ${error.message}`);
    });
    
    // Setup routes
    const server = registerRoutes(app);

    // Error handling middleware
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      res.status(status).json({ message });
      log(`Error: ${message}`, "error");
    });

    // Serve static files in production
    serveStatic(app);

    // Start server
    const port = process.env.PORT || 5000;
    server.listen({
      port: Number(port),
      host: "0.0.0.0",
    }, () => {
      log(`Production server running on port ${port}`);
      log(`Environment: ${process.env.NODE_ENV || 'production'}`);
      log(`Discord OAuth2 configured: ${!!(process.env.VITE_DISCORD_CLIENT_ID && process.env.DISCORD_CLIENT_SECRET)}`);
      log(`Discord Bot configured: ${!!process.env.DISCORD_BOT_TOKEN}`);
    });

  } catch (error) {
    log(`Failed to start production server: ${error}`, "error");
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', () => {
  log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Start the application
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { app, main };