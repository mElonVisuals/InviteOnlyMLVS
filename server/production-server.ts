import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { pool } from "./db";
import { initializeDiscordBot } from "./discord-bot-simple";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function log(message: string, source = "express") {
  const timestamp = new Date().toLocaleTimeString();
  console.log(`${timestamp} [${source}] ${message}`);
}

function serveStatic(app: express.Express) {
  const clientPath = path.resolve(__dirname, "../client");
  const distPath = path.resolve(clientPath, "dist");
  
  app.use(express.static(distPath));
  
  app.get("*", (req, res) => {
    if (req.path.startsWith("/api/")) {
      return res.status(404).json({ message: "API endpoint not found" });
    }
    res.sendFile(path.join(distPath, "index.html"));
  });
}

function logEnvironmentCheck() {
  log("Environment Check:");
  log(`- NODE_ENV: ${process.env.NODE_ENV}`);
  log(`- PORT: ${process.env.PORT || '5000'}`);
  log(`- DATABASE_URL: ${process.env.DATABASE_URL ? 'Present' : 'Missing'}`);
  log(`- DISCORD_BOT_TOKEN: ${process.env.DISCORD_BOT_TOKEN ? 'Present' : 'Missing'}`);
  log(`- DISCORD_GUILD_ID: ${process.env.DISCORD_GUILD_ID ? 'Present' : 'Missing'}`);
}

async function initializeDatabase() {
  try {
    log('Initializing database tables...');
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS invite_codes (
        id SERIAL PRIMARY KEY,
        code TEXT UNIQUE NOT NULL,
        is_used TEXT NOT NULL DEFAULT 'false',
        used_at TIMESTAMP,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS sessions (
        id SERIAL PRIMARY KEY,
        invite_code_id SERIAL NOT NULL,
        access_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        user_agent TEXT
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS discord_requests (
        id SERIAL PRIMARY KEY,
        discord_user_id TEXT UNIQUE NOT NULL,
        invite_code TEXT NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    const initialCodes = ['ALPHA-2024', 'BETA-ACCESS', 'EARLY-BIRD', 'VIP-MEMBER', 'DEMO-CODE'];
    
    for (const code of initialCodes) {
      await pool.query(`
        INSERT INTO invite_codes (code) 
        VALUES ($1) 
        ON CONFLICT (code) DO NOTHING;
      `, [code]);
    }

    log('Database initialization complete');
    
  } catch (error) {
    log(`Database initialization error: ${error}`);
    throw error;
  }
}

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  logEnvironmentCheck();
  
  await initializeDatabase();
  
  // Start Discord bot with detailed logging
  log('Attempting to start Discord bot...');
  try {
    await initializeDiscordBot();
    log('Discord bot startup completed');
  } catch (error: any) {
    log(`Discord bot startup failed: ${error.message || error}`);
    log(`Discord bot error stack: ${error.stack || 'No stack trace'}`);
  }
  
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  serveStatic(app);

  const port = process.env.PORT || 5000;
  server.listen({
    port: Number(port),
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`Server serving on port ${port}`);
    log(`Application startup complete`);
  });
})();