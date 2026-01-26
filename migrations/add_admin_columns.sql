-- Add admin moderation columns

-- Add approved column to businesses table (default to true for existing)
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS approved BOOLEAN DEFAULT true;

-- Add flagged column to reviews table (default to false)
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS flagged BOOLEAN DEFAULT false;
