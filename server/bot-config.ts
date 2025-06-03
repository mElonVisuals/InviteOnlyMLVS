// Simple Discord bot wrapper that handles production deployment
import { pool } from './db';

interface BotConfig {
  token: string | undefined;
  guildId: string | undefined;
  databaseUrl: string | undefined;
}

export function getBotConfig(): BotConfig {
  return {
    token: process.env.DISCORD_BOT_TOKEN,
    guildId: process.env.DISCORD_GUILD_ID,
    databaseUrl: process.env.DATABASE_URL
  };
}

export function isBotConfigured(): boolean {
  const config = getBotConfig();
  return !!(config.token && config.databaseUrl);
}

export async function createBotTables(): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS discord_requests (
      id SERIAL PRIMARY KEY,
      discord_user_id TEXT UNIQUE NOT NULL,
      invite_code TEXT NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

export function logBotStatus(): void {
  const config = getBotConfig();
  console.log('Discord Bot Configuration:');
  console.log(`- Token: ${config.token ? 'Present' : 'Missing'}`);
  console.log(`- Guild ID: ${config.guildId ? 'Present' : 'Missing'}`);
  console.log(`- Database: ${config.databaseUrl ? 'Present' : 'Missing'}`);
}