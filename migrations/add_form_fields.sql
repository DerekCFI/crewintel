-- Migration: Add new form fields to reviews table
-- Run this in your Neon database console

-- Universal fields
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS phone VARCHAR(50);
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS would_recommend BOOLEAN;

-- Hotel fields
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS room_temperature_control VARCHAR(50);
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS breakfast VARCHAR(50);
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS breakfast_start_time VARCHAR(100);
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS distance_to_restaurants VARCHAR(50);
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS dry_cleaning_available BOOLEAN;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS in_room_coffee VARCHAR(50);
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS in_room_microwave BOOLEAN;

-- Restaurant fields
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS healthy_options BOOLEAN;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS vegetarian_options BOOLEAN;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS vegan_options BOOLEAN;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS gluten_free_options BOOLEAN;

-- Optional: Drop old breakfast fields if they're no longer needed
-- Only run these if you're sure you don't need the old data
-- ALTER TABLE reviews DROP COLUMN IF EXISTS breakfast_available;
-- ALTER TABLE reviews DROP COLUMN IF EXISTS breakfast_quality;
