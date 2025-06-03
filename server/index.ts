import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { pool } from "./db";
import { startDiscordBot } from "./discord-bot";

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

(async () => {
  await initializeDatabase();
  
  // Start Discord bot alongside the web server
  startDiscordBot().catch(error => {
    log(`Discord bot startup failed: ${error.message}`);
  });
  
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
