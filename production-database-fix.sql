-- Complete database fix for production deployment
-- This will clean up the schema conflicts and establish proper Discord tracking

-- Step 1: Drop conflicting table
DROP TABLE IF EXISTS discord_requests;

-- Step 2: Add Discord columns to invite_codes if they don't exist
ALTER TABLE invite_codes ADD COLUMN IF NOT EXISTS discord_user_id TEXT;
ALTER TABLE invite_codes ADD COLUMN IF NOT EXISTS discord_username TEXT;

-- Step 3: Remove any conflicting columns
ALTER TABLE invite_codes DROP COLUMN IF EXISTS user_id;

-- Step 4: Create clean discord_requests table for rate limiting
CREATE TABLE discord_requests (
  id SERIAL PRIMARY KEY,
  discord_user_id TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Step 5: Verify final schema
\d invite_codes
\d discord_requests