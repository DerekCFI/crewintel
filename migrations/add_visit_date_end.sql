-- Migration: Add visit_date_end column to reviews table for date range support
-- Run this in your Neon database console
-- This adds the end date column for date range functionality (check-out/end date)

-- Add visit_date_end column (nullable DATE type for backward compatibility)
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS visit_date_end DATE;

-- Note: The existing visit_date column serves as the start date (check-in/start date)
-- For restaurants, only visit_date will be used (single date)
-- For hotels, FBOs, and car rentals, both visit_date and visit_date_end can be used
