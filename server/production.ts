import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { pool } from "./db";
import path from "path";
import fs from "fs";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

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

function serveStatic(app: express.Express) {
  const distPath = path.resolve(import.meta.dirname, "..", "public");

  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist
  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
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
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // Serve static files in production
  serveStatic(app);

  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();