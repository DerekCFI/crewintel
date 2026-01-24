-- Migration: Create businesses table and normalize duplicate business data
-- Date: 2026-01-24
-- Purpose: Fix duplicate business entries by creating a proper businesses table

-- =====================================================
-- STEP 1: CREATE BUSINESSES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS businesses (
  id SERIAL PRIMARY KEY,
  business_slug VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL,
  location_name VARCHAR(255) NOT NULL,
  address TEXT,
  phone VARCHAR(50),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  airport_code VARCHAR(10),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Unique constraint: one business per slug per category
  CONSTRAINT unique_business_slug_category UNIQUE (business_slug, category)
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_businesses_slug ON businesses(business_slug);
CREATE INDEX IF NOT EXISTS idx_businesses_category ON businesses(category);
CREATE INDEX IF NOT EXISTS idx_businesses_airport ON businesses(airport_code);

-- =====================================================
-- STEP 2: FIND AND DISPLAY DUPLICATES (for verification)
-- Run this SELECT first to see what duplicates exist:
-- =====================================================

-- SELECT business_slug, category, COUNT(*) as variant_count,
--        array_agg(DISTINCT location_name) as names,
--        array_agg(DISTINCT address) as addresses
-- FROM reviews
-- GROUP BY business_slug, category
-- HAVING COUNT(DISTINCT location_name) > 1 OR COUNT(DISTINCT address) > 1;

-- =====================================================
-- STEP 3: POPULATE BUSINESSES TABLE FROM REVIEWS
-- Keep the most common/latest data for each business
-- =====================================================

INSERT INTO businesses (business_slug, category, location_name, address, phone, latitude, longitude, airport_code, created_at)
SELECT DISTINCT ON (business_slug, category)
  business_slug,
  category,
  location_name,
  address,
  phone,
  latitude,
  longitude,
  airport_code,
  MIN(created_at) OVER (PARTITION BY business_slug, category) as created_at
FROM reviews
WHERE business_slug IS NOT NULL
ORDER BY business_slug, category, created_at DESC
ON CONFLICT (business_slug, category) DO NOTHING;

-- =====================================================
-- STEP 4: ADD BUSINESS_ID COLUMN TO REVIEWS
-- =====================================================

ALTER TABLE reviews ADD COLUMN IF NOT EXISTS business_id INTEGER;

-- =====================================================
-- STEP 5: LINK REVIEWS TO BUSINESSES
-- =====================================================

UPDATE reviews r
SET business_id = b.id
FROM businesses b
WHERE r.business_slug = b.business_slug
AND r.category = b.category
AND r.business_id IS NULL;

-- =====================================================
-- STEP 6: ADD FOREIGN KEY CONSTRAINT
-- =====================================================

-- Note: Run this after verifying all reviews have business_id set
-- ALTER TABLE reviews
-- ADD CONSTRAINT fk_reviews_business
-- FOREIGN KEY (business_id) REFERENCES businesses(id);

-- =====================================================
-- STEP 7: NORMALIZE REVIEW DATA (optional)
-- Update reviews to use canonical business data
-- =====================================================

UPDATE reviews r
SET
  location_name = b.location_name,
  address = b.address,
  phone = COALESCE(r.phone, b.phone),
  latitude = COALESCE(r.latitude, b.latitude),
  longitude = COALESCE(r.longitude, b.longitude)
FROM businesses b
WHERE r.business_id = b.id
AND (r.location_name != b.location_name OR r.address != b.address);

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check for any reviews without a business_id:
-- SELECT COUNT(*) FROM reviews WHERE business_id IS NULL;

-- Check businesses table:
-- SELECT category, COUNT(*) FROM businesses GROUP BY category;

-- Verify no duplicates:
-- SELECT business_slug, category, COUNT(*)
-- FROM businesses
-- GROUP BY business_slug, category
-- HAVING COUNT(*) > 1;
