# Fix Discord Bot Database Error on Coolify

## Problem
The Discord bot is failing with: `column "invite_code" of relation "discord_requests" does not exist`

## Solution
Run this SQL migration on your Coolify PostgreSQL database:

### Option 1: Using Coolify Database Terminal
1. Go to your Coolify dashboard
2. Navigate to your PostgreSQL database service
3. Open the terminal/console
4. Run this SQL:

```sql
-- Create discord_requests table with correct structure
CREATE TABLE IF NOT EXISTS discord_requests (
  id SERIAL PRIMARY KEY,
  discord_user_id TEXT NOT NULL,
  invite_code TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Add missing Discord columns to invite_codes table
ALTER TABLE invite_codes ADD COLUMN IF NOT EXISTS discord_user_id TEXT;
ALTER TABLE invite_codes ADD COLUMN IF NOT EXISTS discord_username TEXT;

-- Create reports table for Discord bot
CREATE TABLE IF NOT EXISTS reports (
  id SERIAL PRIMARY KEY,
  discord_user_id TEXT NOT NULL,
  discord_username TEXT NOT NULL,
  content TEXT NOT NULL,
  report_type TEXT NOT NULL,
  status TEXT DEFAULT 'open',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create persistent_users table for Discord OAuth
CREATE TABLE IF NOT EXISTS persistent_users (
  id SERIAL PRIMARY KEY,
  discord_user_id TEXT UNIQUE NOT NULL,
  discord_username TEXT NOT NULL,
  first_access TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_access TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

### Option 2: Using psql command line
If you have database access via psql:
```bash
psql $DATABASE_URL -f migrate-production-coolify.sql
```

## After Migration
1. Redeploy your application in Coolify
2. Add Discord bot environment variables:
   - `DISCORD_BOT_TOKEN`
   - `DISCORD_GUILD_ID`
3. Test the Discord bot commands

The Discord bot will then work correctly with invite code generation.