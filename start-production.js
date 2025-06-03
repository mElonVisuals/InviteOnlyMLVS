import { spawn } from 'child_process';

console.log('Starting MLVS District Application...');
console.log('Environment:', process.env.NODE_ENV || 'production');

// Log environment variables for debugging
console.log('Environment Check:');
console.log('- DATABASE_URL:', process.env.DATABASE_URL ? 'Present' : 'Missing');
console.log('- DISCORD_BOT_TOKEN:', process.env.DISCORD_BOT_TOKEN ? 'Present' : 'Missing');
console.log('- DISCORD_GUILD_ID:', process.env.DISCORD_GUILD_ID ? 'Present' : 'Missing');
console.log('- PORT:', process.env.PORT || '5000');

// Start the main application directly using tsx
const app = spawn('npx', ['tsx', 'server/production.ts'], {
  stdio: 'inherit',
  env: process.env
});

app.on('error', (error) => {
  console.error('Application failed to start:', error);
  process.exit(1);
});

app.on('exit', (code) => {
  console.log(`Application exited with code ${code}`);
  process.exit(code);
});