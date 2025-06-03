-- Migration script for Coolify production database
-- Run this to fix the Discord bot database issues

-- Create discord_requests table if it doesn't exist
CREATE TABLE IF NOT EXISTS discord_requests (
  id SERIAL PRIMARY KEY,
  discord_user_id TEXT NOT NULL,
  invite_code TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Add missing columns to existing tables if they don't exist
DO $$ 
BEGIN
  -- Add invite_code column to discord_requests if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'discord_requests' AND column_name = 'invite_code') THEN
    ALTER TABLE discord_requests ADD COLUMN invite_code TEXT NOT NULL DEFAULT '';
  END IF;
  
  -- Add discord columns to invite_codes if they don't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'invite_codes' AND column_name = 'discord_user_id') THEN
    ALTER TABLE invite_codes ADD COLUMN discord_user_id TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'invite_codes' AND column_name = 'discord_username') THEN
    ALTER TABLE invite_codes ADD COLUMN discord_username TEXT;
  END IF;
END $$;

-- Ensure reports table exists
CREATE TABLE IF NOT EXISTS reports (
  id SERIAL PRIMARY KEY,
  discord_user_id TEXT NOT NULL,
  discord_username TEXT NOT NULL,
  content TEXT NOT NULL,
  report_type TEXT NOT NULL,
  status TEXT DEFAULT 'open',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Ensure persistent_users table exists
CREATE TABLE IF NOT EXISTS persistent_users (
  id SERIAL PRIMARY KEY,
  discord_user_id TEXT UNIQUE NOT NULL,
  discord_username TEXT NOT NULL,
  first_access TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_access TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);