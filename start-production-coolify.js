#!/usr/bin/env node

// Production startup script for Coolify deployment
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Starting MLVS District production server...');
console.log('📅 Timestamp:', new Date().toISOString());

// Environment check
const requiredEnvVars = ['DATABASE_URL'];
const optionalEnvVars = [
  'DISCORD_BOT_TOKEN',
  'DISCORD_GUILD_ID', 
  'VITE_DISCORD_CLIENT_ID',
  'DISCORD_CLIENT_SECRET'
];

console.log('\n🔍 Environment Check:');
requiredEnvVars.forEach(envVar => {
  if (process.env[envVar]) {
    console.log(`✅ ${envVar}: configured`);
  } else {
    console.log(`❌ ${envVar}: missing (REQUIRED)`);
    process.exit(1);
  }
});

optionalEnvVars.forEach(envVar => {
  if (process.env[envVar]) {
    console.log(`✅ ${envVar}: configured`);
  } else {
    console.log(`⚠️  ${envVar}: missing (optional)`);
  }
});

// Features check
console.log('\n🎯 Feature Status:');
const hasDiscordBot = !!(process.env.DISCORD_BOT_TOKEN && process.env.DISCORD_GUILD_ID);
const hasDiscordOAuth = !!(process.env.VITE_DISCORD_CLIENT_ID && process.env.DISCORD_CLIENT_SECRET);

console.log(`📱 Discord Bot: ${hasDiscordBot ? '✅ enabled' : '❌ disabled'}`);
console.log(`🔐 Discord OAuth2: ${hasDiscordOAuth ? '✅ enabled' : '❌ disabled'}`);
console.log(`💾 Database: ✅ enabled`);
console.log(`🎫 Invite Codes: ✅ enabled`);

// Start the production server
console.log('\n🌟 Starting production server...');

const serverPath = path.join(__dirname, 'server', 'production-complete.ts');
const child = spawn('npx', ['tsx', serverPath], {
  stdio: 'inherit',
  env: {
    ...process.env,
    NODE_ENV: 'production'
  }
});

child.on('error', (error) => {
  console.error('💥 Failed to start server:', error);
  process.exit(1);
});

child.on('exit', (code) => {
  console.log(`🏁 Server exited with code ${code}`);
  process.exit(code);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully...');
  child.kill('SIGTERM');
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully...');
  child.kill('SIGINT');
});