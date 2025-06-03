# Docker Deployment Guide for MLVS District

## Quick Start

1. Copy environment configuration:
```bash
cp .env.example .env
```

2. Edit `.env` file with your configuration:
```bash
nano .env
```

3. Start the application:
```bash
docker-compose -f docker-compose.production.yml up -d
```

## Environment Variables

### Required
- `DATABASE_URL` - PostgreSQL connection string
- `POSTGRES_PASSWORD` - Database password

### Optional Discord Features
- `VITE_DISCORD_CLIENT_ID` - Discord OAuth2 client ID
- `DISCORD_CLIENT_SECRET` - Discord OAuth2 client secret  
- `DISCORD_BOT_TOKEN` - Discord bot token
- `DISCORD_GUILD_ID` - Discord server ID

## Discord Setup

### Discord OAuth2 (Returning User Login)
1. Visit https://discord.com/developers/applications
2. Create or select your application
3. Go to OAuth2 section
4. Copy Client ID → `VITE_DISCORD_CLIENT_ID`
5. Copy Client Secret → `DISCORD_CLIENT_SECRET`
6. Add redirect URL: `http://your-domain.com/api/discord/callback`

### Discord Bot (/report command)
1. In the same Discord application
2. Go to Bot section
3. Copy Bot Token → `DISCORD_BOT_TOKEN`
4. Get your Discord server ID → `DISCORD_GUILD_ID`

## Features Available

### Always Available (Core Features)
- Invite code validation system
- User dashboard and admin panel
- Session management
- Database persistence

### With Discord OAuth2 Variables
- Returning user authentication
- Discord login without invite codes
- Persistent user sessions

### With Discord Bot Variables
- `/request-access` command
- `/generate-bulk` command (admin)
- `/code-stats` command (admin)
- `/report` command (Bug Report, User Report, General Issue, Suggestion)

## Docker Commands

### Start services:
```bash
docker-compose -f docker-compose.production.yml up -d
```

### View logs:
```bash
docker-compose -f docker-compose.production.yml logs -f mlvs-district
```

### Stop services:
```bash
docker-compose -f docker-compose.production.yml down
```

### Rebuild and restart:
```bash
docker-compose -f docker-compose.production.yml up --build -d
```

### Check health:
```bash
curl http://localhost:5000/health
```

## Accessing the Application

- Main application: http://localhost:5000
- Health check: http://localhost:5000/health
- Admin panel: http://localhost:5000/admin (for user ID 952705075711729695)

## Testing

1. **Invite Codes**: Use test codes like "VIP-MEMBER", "EARLY-BIRD", "BETA-ACCESS"
2. **Discord OAuth2**: Click "Returning User? Sign In with Discord"
3. **Discord Bot**: Use commands in your Discord server

## Troubleshooting

### Check application logs:
```bash
docker-compose -f docker-compose.production.yml logs mlvs-district
```

### Check database connection:
```bash
docker-compose -f docker-compose.production.yml exec mlvs-district curl http://localhost:5000/health
```

### Verify environment variables:
```bash
docker-compose -f docker-compose.production.yml exec mlvs-district env | grep DISCORD
```