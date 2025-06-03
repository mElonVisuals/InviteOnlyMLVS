# Coolify Deployment Guide for MLVS District

## Environment Variables Required in Coolify

### Database (Required)
- `DATABASE_URL` - PostgreSQL connection string (automatically provided by Coolify)

### Discord Bot (Optional - for /report command)
- `DISCORD_BOT_TOKEN` - Bot token from Discord Developer Portal
- `DISCORD_GUILD_ID` - Your Discord server ID

### Discord OAuth2 (Optional - for returning user authentication)
- `VITE_DISCORD_CLIENT_ID` - Application Client ID from Discord Developer Portal
- `DISCORD_CLIENT_SECRET` - Application Client Secret from Discord Developer Portal

## Discord Developer Portal Setup

### For Discord Bot (/report command):
1. Go to https://discord.com/developers/applications
2. Create a new application or select existing
3. Go to "Bot" section
4. Copy the Bot Token → use as `DISCORD_BOT_TOKEN`
5. Get your Discord server ID → use as `DISCORD_GUILD_ID`

### For Discord OAuth2 (returning user login):
1. In the same Discord application
2. Go to "OAuth2" section
3. Copy Client ID → use as `VITE_DISCORD_CLIENT_ID`
4. Copy Client Secret → use as `DISCORD_CLIENT_SECRET`
5. Add redirect URL: `https://dev.melonvisuals.me/api/discord/callback`

## Coolify Configuration

### Build Settings:
- Build Command: `npm run build`
- Start Command: `node start-production-coolify.js`
- Port: `5000`

### Environment Variables in Coolify:
```
DATABASE_URL=(automatically provided)
DISCORD_BOT_TOKEN=your_bot_token_here
DISCORD_GUILD_ID=your_server_id_here
VITE_DISCORD_CLIENT_ID=your_client_id_here
DISCORD_CLIENT_SECRET=your_client_secret_here
```

## Features Available

### Always Available:
- Invite code validation system
- User dashboard and admin panel
- Session management
- Database persistence

### With Discord Bot Token:
- /request-access command
- /generate-bulk command (admin)
- /code-stats command (admin)  
- /report command (Bug Report, User Report, General Issue, Suggestion)

### With Discord OAuth2:
- Returning user authentication
- Discord login without new invite codes
- Persistent user sessions

## Testing

1. **Invite Codes**: Use test codes like "VIP-MEMBER", "EARLY-BIRD", "BETA-ACCESS"
2. **Discord OAuth2**: Click "Returning User? Sign In with Discord" on main page
3. **Discord Bot**: Use Discord commands in your server

## File Structure for Production:
- `start-production-coolify.js` - Production startup script
- `server/production-complete.ts` - Complete production server
- `server/production-discord-bot.ts` - Discord bot with command registration