-- Migration: Add Quick Log support
-- Date: 2026-01-28
-- Purpose: Add status, updated_at to reviews, create search_logs table

-- =====================================================
-- STEP 1: ADD STATUS COLUMN TO REVIEWS
-- =====================================================

ALTER TABLE reviews ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'published';

-- Create index for filtering by status
CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);

-- Create composite index for user's reviews with status
CREATE INDEX IF NOT EXISTS idx_reviews_user_status ON reviews(user_id, status);

-- =====================================================
-- STEP 2: ADD UPDATED_AT COLUMN TO REVIEWS
-- =====================================================

ALTER TABLE reviews ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Backfill updated_at from created_at for existing reviews
UPDATE reviews SET updated_at = created_at WHERE updated_at IS NULL;

-- =====================================================
-- STEP 3: CREATE TRIGGER FOR AUTO-UPDATING updated_at
-- =====================================================

CREATE OR REPLACE FUNCTION update_reviews_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_reviews_updated_at ON reviews;

CREATE TRIGGER trigger_reviews_updated_at
    BEFORE UPDATE ON reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_reviews_updated_at();

-- =====================================================
-- STEP 4: CREATE SEARCH_LOGS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS search_logs (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255),
    airport_code VARCHAR(4),
    location_searched VARCHAR(255),
    category VARCHAR(50),
    searched_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for analytics queries
CREATE INDEX IF NOT EXISTS idx_search_logs_user ON search_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_search_logs_searched_at ON search_logs(searched_at);

-- =====================================================
-- STEP 5: ADD IS_QUICK_LOG FLAG TO REVIEWS
-- =====================================================

ALTER TABLE reviews ADD COLUMN IF NOT EXISTS is_quick_log BOOLEAN DEFAULT false;

-- =====================================================
-- STEP 6: ADD APPROVED COLUMN TO REVIEWS FOR ADMIN APPROVAL
-- =====================================================

-- NULL = not yet reviewed, true = approved, false = rejected
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS approved BOOLEAN DEFAULT NULL;

-- Index for filtering by approval status
CREATE INDEX IF NOT EXISTS idx_reviews_approved ON reviews(approved);
