-- Migration: Create feedback table for user feedback submissions
-- Run this in your Neon database console

CREATE TABLE IF NOT EXISTS feedback (
  id SERIAL PRIMARY KEY,
  user_id TEXT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'new',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create index on status for filtering
CREATE INDEX IF NOT EXISTS idx_feedback_status ON feedback(status);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON feedback(created_at DESC);
