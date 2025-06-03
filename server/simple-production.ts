import express from "express";
import { registerRoutes } from "./routes";
import { pool } from "./db";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function log(message: string) {
  const timestamp = new Date().toLocaleTimeString();
  console.log(`${timestamp} [server] ${message}`);
}

// Simple Discord bot initialization without external dependencies
async function startDiscordBot() {
  const token = process.env.DISCORD_BOT_TOKEN;
  const guildId = process.env.DISCORD_GUILD_ID;

  if (!token) {
    log('Discord bot: Token not provided, skipping initialization');
    return;
  }

  log('Discord bot: Starting initialization...');

  try {
    // Ensure database schema is up to date
    await pool.query(`
      ALTER TABLE invite_codes ADD COLUMN IF NOT EXISTS discord_user_id TEXT;
      ALTER TABLE invite_codes ADD COLUMN IF NOT EXISTS discord_username TEXT;
    `);
    
    // Handle discord_requests table schema migration
    try {
      // Check if table exists with wrong schema and fix it
      const tableExists = await pool.query(`
        SELECT column_name FROM information_schema.columns 
        WHERE table_name = 'discord_requests' AND column_name = 'invite_code'
      `);
      
      if (tableExists.rows.length > 0) {
        // Table has old schema, recreate it
        await pool.query(`DROP TABLE discord_requests`);
      }
      
      await pool.query(`
        CREATE TABLE IF NOT EXISTS discord_requests (
          id SERIAL PRIMARY KEY,
          discord_user_id TEXT UNIQUE NOT NULL,
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
      `);
    } catch (error) {
      log(`Discord bot: Database migration error: ${error}`);
    }

    // Import Discord.js dynamically
    const { Client, GatewayIntentBits, SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = await import('discord.js');

    const client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
      ],
    });

    client.once('ready', async () => {
      log(`Discord bot: Connected as ${client.user?.tag}`);

      // Register commands
      const commands = [
        new SlashCommandBuilder()
          .setName('request-access')
          .setDescription('Request an invite code for MLVS District'),
      ];

      try {
        if (guildId) {
          const guild = client.guilds.cache.get(guildId);
          if (guild) {
            await guild.commands.set(commands);
            log('Discord bot: Commands registered successfully');
          }
        }
      } catch (error) {
        log(`Discord bot: Command registration failed: ${error}`);
      }
    });

    client.on('interactionCreate', async (interaction: any) => {
      if (!interaction.isChatInputCommand()) return;

      if (interaction.commandName === 'request-access') {
        try {
          // Generate invite code
          const code = generateInviteCode();
          
          // Save to database with Discord user info
          await pool.query(
            'INSERT INTO invite_codes (code, is_used, discord_user_id, discord_username) VALUES ($1, $2, $3, $4)',
            [code, 'false', interaction.user.id, interaction.user.username]
          );

          await pool.query(
            'INSERT INTO discord_requests (discord_user_id) VALUES ($1) ON CONFLICT (discord_user_id) DO UPDATE SET created_at = NOW()',
            [interaction.user.id]
          );

          // Send response
          await interaction.reply({
            content: `Your invite code: **${code}**\n\nUse this code on the MLVS District website to gain access.`,
            ephemeral: true
          });

          log(`Discord bot: Generated code ${code} for user ${interaction.user.tag}`);
        } catch (error) {
          log(`Discord bot: Error handling request: ${error}`);
          await interaction.reply({
            content: 'An error occurred while generating your invite code.',
            ephemeral: true
          });
        }
      } else if (interaction.commandName === 'report') {
        try {
          const reportType = interaction.options.getString('type');
          const content = interaction.options.getString('content');

          // Save report to database
          await pool.query(`
            INSERT INTO reports (discord_user_id, discord_username, content, report_type, status, created_at)
            VALUES ($1, $2, $3, $4, 'pending', NOW())
          `, [interaction.user.id, interaction.user.username, content, reportType]);

          await interaction.reply({
            content: `Your ${reportType} report has been submitted successfully. Thank you for your feedback!\n\nReport ID: #${Date.now().toString().slice(-6)}`,
            ephemeral: true
          });

          log(`Discord bot: Report submitted by ${interaction.user.tag}: ${reportType}`);
        } catch (error) {
          log(`Discord bot: Error handling report: ${error}`);
          await interaction.reply({
            content: 'An error occurred while submitting your report. Please try again.',
            ephemeral: true
          });
        }
      }
    });

    client.on('error', (error) => {
      log(`Discord bot: Runtime error: ${error}`);
    });

    await client.login(token);
    log('Discord bot: Login completed');

  } catch (error) {
    log(`Discord bot: Initialization failed: ${error}`);
  }
}

function generateInviteCode(): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const segments = [];
  
  for (let i = 0; i < 3; i++) {
    let segment = '';
    for (let j = 0; j < 4; j++) {
      segment += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    segments.push(segment);
  }
  
  return segments.join('-');
}

function serveStatic(app: express.Express) {
  const distPath = path.resolve(__dirname, "../dist/public");
  
  app.use(express.static(distPath));
  
  app.get("*", (req, res) => {
    if (req.path.startsWith("/api/")) {
      return res.status(404).json({ message: "API endpoint not found" });
    }
    res.sendFile(path.join(distPath, "index.html"));
  });
}

async function initializeDatabase() {
  try {
    log('Initializing database...');
    
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
        invite_code_id SERIAL NOT NULL,
        access_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        user_agent TEXT
      );
    `);

    // Add initial codes
    const initialCodes = ['ALPHA-2024', 'BETA-ACCESS', 'EARLY-BIRD', 'VIP-MEMBER'];
    for (const code of initialCodes) {
      await pool.query(
        'INSERT INTO invite_codes (code) VALUES ($1) ON CONFLICT (code) DO NOTHING',
        [code]
      );
    }

    log('Database initialization complete');
  } catch (error) {
    log(`Database error: ${error}`);
    throw error;
  }
}

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    if (req.path.startsWith("/api")) {
      const duration = Date.now() - start;
      log(`${req.method} ${req.path} ${res.statusCode} in ${duration}ms`);
    }
  });
  next();
});

(async () => {
  log('Starting MLVS District Application...');
  log(`Environment: ${process.env.NODE_ENV || 'production'}`);
  log(`Database: ${process.env.DATABASE_URL ? 'Connected' : 'Missing'}`);
  log(`Discord Token: ${process.env.DISCORD_BOT_TOKEN ? 'Present' : 'Missing'}`);
  log(`Discord Guild: ${process.env.DISCORD_GUILD_ID ? 'Present' : 'Missing'}`);

  await initializeDatabase();
  
  // Start Discord bot
  await startDiscordBot();
  
  // Setup routes
  const server = await registerRoutes(app);

  // Error handling
  app.use((err: any, req: any, res: any, next: any) => {
    const status = err.status || 500;
    res.status(status).json({ message: err.message || "Internal Server Error" });
  });

  // Serve static files
  serveStatic(app);

  const port = process.env.PORT || 5000;
  server.listen(Number(port), "0.0.0.0", () => {
    log(`Server running on port ${port}`);
    log('Application startup complete');
  });
})();