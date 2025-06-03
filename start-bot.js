// Simple bot starter with better error handling
const { Client, GatewayIntentBits } = require('discord.js');

console.log('Starting Discord bot...');
console.log('Environment check:');
console.log('- Bot token available:', !!process.env.DISCORD_BOT_TOKEN);
console.log('- Database URL available:', !!process.env.DATABASE_URL);

if (!process.env.DISCORD_BOT_TOKEN) {
  console.error('❌ DISCORD_BOT_TOKEN environment variable is required');
  console.log('Add your bot token to environment variables or .env file');
  process.exit(1);
}

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is required');
  process.exit(1);
}

// Load the main bot
try {
  require('./discord-bot.js');
} catch (error) {
  console.error('Bot startup error:', error);
  process.exit(1);
}