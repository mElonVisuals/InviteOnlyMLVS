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

// Robust Discord bot initialization with proper error handling
async function startDiscordBot() {
  const token = process.env.DISCORD_BOT_TOKEN;
  const guildId = process.env.DISCORD_GUILD_ID;

  if (!token) {
    log('Discord bot: Token not provided, skipping initialization');
    return;
  }

  log('Discord bot: Starting initialization...');

  try {
    // First, ensure database schema is correct
    await initializeDatabase();
    
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
      
      // Register slash commands
      try {
        const commands = [
          new SlashCommandBuilder()
            .setName('request-access')
            .setDescription('Request an access code for MLVS District'),
        ].map(command => command.toJSON());

        if (guildId) {
          await client.application?.commands.set(commands, guildId);
          log('Discord bot: Guild commands registered');
        } else {
          await client.application?.commands.set(commands);
          log('Discord bot: Global commands registered');
        }
      } catch (error) {
        log(`Discord bot: Command registration failed: ${error}`);
      }
    });

    client.on('interactionCreate', async (interaction: any) => {
      if (!interaction.isChatInputCommand()) return;

      if (interaction.commandName === 'request-access') {
        try {
          // Check rate limiting
          const recentRequest = await pool.query(`
            SELECT created_at FROM discord_requests 
            WHERE discord_user_id = $1 
            AND created_at > NOW() - INTERVAL '1 hour'
          `, [interaction.user.id]);

          if (recentRequest.rows.length > 0) {
            await interaction.reply({
              content: 'You can only request access once per hour. Please wait before requesting again.',
              ephemeral: true
            });
            return;
          }

          // Generate unique invite code
          const code = await generateUniqueCode();
          
          // Save to database with Discord user info
          await pool.query(
            'INSERT INTO invite_codes (code, is_used, discord_user_id, discord_username) VALUES ($1, $2, $3, $4)',
            [code, 'false', interaction.user.id, interaction.user.username]
          );

          // Record request for rate limiting
          await pool.query(
            'INSERT INTO discord_requests (discord_user_id, created_at) VALUES ($1, NOW()) ON CONFLICT (discord_user_id) DO UPDATE SET created_at = NOW()',
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

async function initializeDatabase() {
  try {
    // Add Discord columns to invite_codes if they don't exist
    await pool.query(`
      ALTER TABLE invite_codes 
      ADD COLUMN IF NOT EXISTS discord_user_id TEXT,
      ADD COLUMN IF NOT EXISTS discord_username TEXT;
    `);

    // Clean up any existing discord_requests table and create fresh
    await pool.query(`DROP TABLE IF EXISTS discord_requests CASCADE;`);
    await pool.query(`
      CREATE TABLE discord_requests (
        id SERIAL PRIMARY KEY,
        discord_user_id TEXT NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(discord_user_id)
      );
    `);

    log('Discord bot: Database schema initialized');
  } catch (error) {
    log(`Discord bot: Database initialization error: ${error}`);
    throw error;
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

async function codeExists(code: string): Promise<boolean> {
  try {
    const result = await pool.query('SELECT code FROM invite_codes WHERE code = $1', [code]);
    return result.rows.length > 0;
  } catch (error) {
    log(`Discord bot: Error checking code existence: ${error}`);
    return false;
  }
}

async function generateUniqueCode(): Promise<string> {
  let code: string;
  let attempts = 0;
  const maxAttempts = 100;
  
  do {
    code = generateInviteCode();
    attempts++;
    
    if (attempts >= maxAttempts) {
      throw new Error('Unable to generate unique code after maximum attempts');
    }
  } while (await codeExists(code));
  
  return code;
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

async function initializeAppDatabase() {
  try {
    log('Initializing database...');
    
    // Create invite_codes table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS invite_codes (
        id SERIAL PRIMARY KEY,
        code TEXT NOT NULL UNIQUE,
        is_used TEXT NOT NULL DEFAULT 'false',
        used_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        discord_user_id TEXT,
        discord_username TEXT
      );
    `);

    // Create sessions table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS sessions (
        id SERIAL PRIMARY KEY,
        invite_code_id INTEGER NOT NULL,
        access_time TIMESTAMP DEFAULT NOW() NOT NULL,
        user_agent TEXT
      );
    `);

    // Initialize default invite codes if empty
    const existingCodes = await pool.query('SELECT COUNT(*) FROM invite_codes');
    if (parseInt(existingCodes.rows[0].count) === 0) {
      const defaultCodes = ['ALPHA-2024', 'BETA-ACCESS', 'EARLY-BIRD', 'VIP-MEMBER'];
      for (const code of defaultCodes) {
        await pool.query(
          'INSERT INTO invite_codes (code, is_used) VALUES ($1, $2)',
          [code, 'false']
        );
      }
      log('Default invite codes initialized');
    }

    log('Database initialization complete');
  } catch (error) {
    log(`Database initialization error: ${error}`);
    throw error;
  }
}

async function main() {
  const app = express();
  const port = parseInt(process.env.PORT || '5000');

  log('Starting MLVS District Application...');
  log(`Environment: ${process.env.NODE_ENV || 'development'}`);

  // Environment check
  const envVars = ['DATABASE_URL', 'DISCORD_BOT_TOKEN', 'DISCORD_GUILD_ID'];
  envVars.forEach(varName => {
    const value = process.env[varName];
    log(`${varName}: ${value ? 'Present' : 'Missing'}`);
  });

  try {
    // Initialize application database
    await initializeAppDatabase();
    
    // Start Discord bot
    await startDiscordBot();
    
    // Setup routes and middleware
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));
    
    const server = await registerRoutes(app);
    serveStatic(app);
    
    server.listen(port, "0.0.0.0", () => {
      log(`Server running on port ${port}`);
      log('Application startup complete');
    });

  } catch (error) {
    log(`Application startup failed: ${error}`);
    process.exit(1);
  }
}

main().catch((error) => {
  log(`Unhandled error: ${error}`);
  process.exit(1);
});