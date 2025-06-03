// Test Discord.js import and basic functionality
console.log('Testing Discord.js import...');

try {
  const discord = require('discord.js');
  console.log('✓ Discord.js imported successfully');
  console.log('Version:', discord.version || 'Unknown');
  
  // Test basic client creation
  const client = new discord.Client({
    intents: [discord.GatewayIntentBits.Guilds]
  });
  console.log('✓ Discord client created successfully');
  
} catch (error) {
  console.error('❌ Discord.js test failed:', error.message);
  console.error('Full error:', error);
}

// Test environment variables
console.log('\nEnvironment variables:');
console.log('- DISCORD_BOT_TOKEN:', process.env.DISCORD_BOT_TOKEN ? 'Present' : 'Missing');
console.log('- DISCORD_GUILD_ID:', process.env.DISCORD_GUILD_ID ? 'Present' : 'Missing');
console.log('- DATABASE_URL:', process.env.DATABASE_URL ? 'Present' : 'Missing');