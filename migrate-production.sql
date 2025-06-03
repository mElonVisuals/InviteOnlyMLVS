-- Production Database Migration Script
-- Run this on your Coolify production database to add Discord tracking

-- Add Discord columns to invite_codes table
ALTER TABLE invite_codes ADD COLUMN IF NOT EXISTS discord_user_id TEXT;
ALTER TABLE invite_codes ADD COLUMN IF NOT EXISTS discord_username TEXT;

-- Remove old conflicting column if it exists
ALTER TABLE invite_codes DROP COLUMN IF EXISTS user_id;

-- Create discord_requests table for rate limiting
CREATE TABLE IF NOT EXISTS discord_requests (
  id SERIAL PRIMARY KEY,
  discord_user_id TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Add unique constraint for rate limiting
ALTER TABLE discord_requests ADD CONSTRAINT IF NOT EXISTS discord_requests_user_id_unique UNIQUE (discord_user_id);

-- Verify the schema
SELECT 'invite_codes columns:' as table_info;
SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'invite_codes' ORDER BY ordinal_position;

SELECT 'discord_requests columns:' as table_info;
SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'discord_requests' ORDER BY ordinal_position;