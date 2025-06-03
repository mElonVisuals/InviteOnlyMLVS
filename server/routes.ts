import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { validateInviteSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint for deployment platforms
  app.get("/health", (req, res) => {
    res.status(200).json({ status: "healthy", timestamp: new Date().toISOString() });
  });

  // Test Discord bot configuration
  app.get("/api/test-discord", async (req, res) => {
    try {
      const botToken = process.env.DISCORD_BOT_TOKEN;
      const guildId = process.env.DISCORD_GUILD_ID;
      
      if (!botToken || !guildId) {
        return res.json({ 
          success: false, 
          message: "Environment variables missing",
          config: { hasBotToken: !!botToken, hasGuildId: !!guildId }
        });
      }

      // Test bot connection
      const testResponse = await fetch(`https://discord.com/api/v10/guilds/${guildId}`, {
        headers: {
          'Authorization': `Bot ${botToken}`,
        }
      });

      if (!testResponse.ok) {
        const error = await testResponse.text();
        return res.json({
          success: false,
          message: `Bot cannot access server. Status: ${testResponse.status}`,
          error: error
        });
      }

      const guildData = await testResponse.json();
      res.json({
        success: true,
        message: "Bot configuration is working",
        guild: { name: guildData.name, id: guildData.id }
      });
    } catch (error) {
      res.json({
        success: false,
        message: "Test failed",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Request Discord invite
  app.post("/api/request-invite", async (req, res) => {
    try {
      // Discord bot integration - requires DISCORD_BOT_TOKEN and DISCORD_GUILD_ID
      const botToken = process.env.DISCORD_BOT_TOKEN;
      const guildId = process.env.DISCORD_GUILD_ID;
      
      if (!botToken || !guildId) {
        console.log('Discord config check:', { 
          hasBotToken: !!botToken, 
          hasGuildId: !!guildId,
          nodeEnv: process.env.NODE_ENV 
        });
        return res.status(500).json({ 
          success: false, 
          message: "Discord bot configuration missing. Add DISCORD_BOT_TOKEN and DISCORD_GUILD_ID environment variables." 
        });
      }

      // Get first available channel for invite creation
      const channelsResponse = await fetch(`https://discord.com/api/v10/guilds/${guildId}/channels`, {
        headers: {
          'Authorization': `Bot ${botToken}`,
        }
      });

      if (!channelsResponse.ok) {
        console.error('Failed to get channels:', channelsResponse.status);
        return res.status(500).json({ 
          success: false, 
          message: "Bot cannot access server channels. Check bot permissions." 
        });
      }

      const channels = await channelsResponse.json();
      const textChannel = channels.find((ch: any) => ch.type === 0); // Text channel

      if (!textChannel) {
        return res.status(500).json({ 
          success: false, 
          message: "No accessible text channels found. Bot needs channel access." 
        });
      }

      // Create Discord invite using bot
      const discordResponse = await fetch(`https://discord.com/api/v10/channels/${textChannel.id}/invites`, {
        method: 'POST',
        headers: {
          'Authorization': `Bot ${botToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          max_age: 3600, // 1 hour expiry
          max_uses: 1,    // Single use
          temporary: false,
          unique: true
        })
      });

      if (!discordResponse.ok) {
        const error = await discordResponse.text();
        console.error('Discord API error:', discordResponse.status, error);
        return res.status(500).json({ 
          success: false, 
          message: `Failed to generate Discord invite. Status: ${discordResponse.status}. Please check bot permissions.` 
        });
      }

      const inviteData = await discordResponse.json();
      
      res.json({ 
        success: true,
        invite: `https://discord.gg/${inviteData.code}`,
        message: "Discord invite generated successfully!"
      });
    } catch (error) {
      console.error('Request invite error:', error);
      res.status(500).json({ 
        success: false, 
        message: "Internal server error. Please try again later." 
      });
    }
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

      // Redirect to dashboard with session data as URL params (temporary solution)
      const sessionData = {
        sessionId: session.id,
        accessTime: session.accessTime,
        inviteCode: 'DISCORD_OAUTH',
        discordUsername: userData.username,
        discordUserId: userData.id,
        userAgent: req.headers['user-agent'] || null,
        usedAt: new Date().toISOString()
      };
      
      // Encode session data for URL
      const encodedSession = encodeURIComponent(JSON.stringify(sessionData));
      res.redirect(`/dashboard?auth=success&session=${encodedSession}`);
    } catch (error) {
      console.error("Discord OAuth callback error:", error);
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
      const session = await storage.createSession({
        inviteCodeId: inviteCode.id,
        userAgent: req.headers['user-agent'] || null,
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
      
      console.error("Error validating invite:", error);
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
      console.error("Error fetching sessions:", error);
      res.status(500).json({ 
        success: false, 
        message: "Internal server error" 
      });
    }
  });

  // Get real-time system metrics
  app.get("/api/system-metrics", async (req, res) => {
    try {
      const metrics = {
        cpuUsage: Math.floor(Math.random() * 30) + 15, // 15-45% simulated load
        memoryUsage: Math.floor(Math.random() * 40) + 30, // 30-70% simulated usage
        diskUsage: Math.floor(Math.random() * 20) + 40, // 40-60% simulated usage
        networkIn: `${(Math.random() * 50 + 10).toFixed(1)} MB`,
        networkOut: `${(Math.random() * 30 + 5).toFixed(1)} MB`,
        uptime: calculateSystemUptime()
      };
      res.json(metrics);
    } catch (error) {
      console.error("Error fetching system metrics:", error);
      res.status(500).json({ 
        success: false, 
        message: "Internal server error" 
      });
    }
  });

  // Get reports from Discord bot
  app.get("/api/reports", async (req, res) => {
    try {
      const result = await storage.getReports();
      res.json({ reports: result });
    } catch (error) {
      console.error("Error fetching reports:", error);
      res.status(500).json({ 
        success: false, 
        message: "Internal server error" 
      });
    }
  });

  // Update user profile (email and Discord connection)
  app.post("/api/profile", async (req, res) => {
    try {
      const { sessionId, email, discordConnected } = req.body;
      
      if (!sessionId || !email) {
        return res.status(400).json({
          success: false,
          message: "Session ID and email are required"
        });
      }

      await storage.updateUserProfile(sessionId, email, discordConnected);
      
      res.json({
        success: true,
        message: "Profile updated successfully"
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ 
        success: false, 
        message: "Internal server error" 
      });
    }
  });

  // Discord login endpoint
  app.post("/api/discord-login", async (req, res) => {
    try {
      const { discordUserId, discordUsername } = req.body;
      
      if (!discordUserId || !discordUsername) {
        return res.status(400).json({
          success: false,
          message: "Discord user ID and username are required"
        });
      }

      // Check if user exists and has previous access
      const existingUser = await storage.getUserByDiscord(discordUserId);
      if (!existingUser) {
        return res.status(404).json({
          success: false,
          message: "No previous access found. Please request a new invite code."
        });
      }

      // Create new session for returning user
      const newSession = await storage.createSession({
        inviteCodeId: existingUser.id,
        userAgent: req.headers['user-agent']
      });

      // Update persistent user login time
      await storage.createPersistentUser(discordUserId, discordUsername);

      res.json({
        success: true,
        message: "Login successful",
        session: {
          id: newSession.id,
          accessTime: newSession.accessTime,
          discordUsername: existingUser.discord_username
        }
      });
    } catch (error) {
      console.error("Error with Discord login:", error);
      res.status(500).json({ 
        success: false, 
        message: "Internal server error" 
      });
    }
  });

  // Admin panel - Check admin status
  app.get("/api/admin/check", async (req, res) => {
    try {
      const { discordUserId } = req.query;
      const ADMIN_USER_ID = "952705075711729695";
      
      const isAdmin = discordUserId === ADMIN_USER_ID;
      
      res.json({
        success: true,
        isAdmin
      });
    } catch (error) {
      console.error("Error checking admin status:", error);
      res.status(500).json({ 
        success: false, 
        message: "Internal server error" 
      });
    }
  });

  // Admin panel - Get all users with member role
  app.get("/api/admin/users", async (req, res) => {
    try {
      const { discordUserId } = req.query;
      const ADMIN_USER_ID = "952705075711729695";
      
      if (discordUserId !== ADMIN_USER_ID) {
        return res.status(403).json({
          success: false,
          message: "Access denied. Admin privileges required."
        });
      }

      const users = await storage.getUsersWithMemberRole();
      res.json({ 
        success: true,
        users 
      });
    } catch (error) {
      console.error("Error fetching admin users:", error);
      res.status(500).json({ 
        success: false, 
        message: "Internal server error" 
      });
    }
  });

  function calculateSystemUptime() {
    const startTime = new Date('2024-06-01');
    const now = new Date();
    const uptimeMs = now.getTime() - startTime.getTime();
    const days = Math.floor(uptimeMs / (24 * 60 * 60 * 1000));
    const hours = Math.floor((uptimeMs % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    return `${days}d ${hours}h`;
  }

  const httpServer = createServer(app);
  return httpServer;
}
