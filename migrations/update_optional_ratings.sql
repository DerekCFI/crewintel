-- Migration: Make certain rating fields optional and add takeout/delivery support
-- Run this migration to update the reviews table schema
-- Date: 2026-01-23

-- =====================================================
-- HOTELS: Make these fields nullable (optional)
-- =====================================================

-- Parking Situation - make nullable, add "Not Sure/Used Rideshare" option support
ALTER TABLE reviews ALTER COLUMN parking_situation DROP NOT NULL;

-- Laundry Available - make nullable, add "Not Sure" option support
ALTER TABLE reviews ALTER COLUMN laundry_available DROP NOT NULL;

-- Note: breakfast is already nullable (VARCHAR)
-- Note: shuttle_service is already a BOOLEAN (inherently optional)

-- =====================================================
-- FBOs: Make these fields nullable (optional)
-- =====================================================

-- Fuel Pricing - make nullable, add "Not Sure" option support
ALTER TABLE reviews ALTER COLUMN fuel_pricing DROP NOT NULL;

-- Crew Lounge Quality - make nullable (INTEGER rating)
ALTER TABLE reviews ALTER COLUMN crew_lounge_quality DROP NOT NULL;

-- Crew Car Availability - make nullable, add "Not Sure/Didn't Use" option support
ALTER TABLE reviews ALTER COLUMN crew_car_availability DROP NOT NULL;

-- Bathroom Quality - make nullable (INTEGER rating)
ALTER TABLE reviews ALTER COLUMN bathroom_quality DROP NOT NULL;

-- FBO Amenities Quality - make nullable (INTEGER rating)
ALTER TABLE reviews ALTER COLUMN fbo_amenities_quality DROP NOT NULL;

-- FBO WiFi Quality - make nullable (INTEGER rating)
ALTER TABLE reviews ALTER COLUMN fbo_wifi_quality DROP NOT NULL;

-- =====================================================
-- RESTAURANTS: Make atmosphere optional and add takeout/delivery flag
-- =====================================================

-- Atmosphere - make nullable (null for takeout/delivery orders)
ALTER TABLE reviews ALTER COLUMN atmosphere DROP NOT NULL;

-- Add was_takeout_delivery boolean column for restaurant reviews
-- When true, atmosphere rating is not applicable
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS was_takeout_delivery BOOLEAN DEFAULT FALSE;

-- =====================================================
-- Indexes for performance
-- =====================================================

-- Index for querying takeout/delivery restaurant reviews
CREATE INDEX IF NOT EXISTS idx_reviews_was_takeout_delivery
ON reviews (was_takeout_delivery)
WHERE category = 'restaurants';

-- =====================================================
-- Column comments for documentation
-- =====================================================

COMMENT ON COLUMN reviews.was_takeout_delivery IS 'True if this restaurant review was for a takeout/delivery order (atmosphere rating N/A)';
COMMENT ON COLUMN reviews.parking_situation IS 'Hotel parking situation - optional, includes "Not Sure/Used Rideshare" option';
COMMENT ON COLUMN reviews.laundry_available IS 'Hotel self-service laundry - optional, includes "Not Sure" option';
COMMENT ON COLUMN reviews.fuel_pricing IS 'FBO fuel pricing assessment - optional, includes "Not Sure" option';
COMMENT ON COLUMN reviews.crew_lounge_quality IS 'FBO crew lounge quality rating (1-5) - optional, null means "Not Sure"';
COMMENT ON COLUMN reviews.crew_car_availability IS 'FBO crew car availability - optional, includes "Not Sure/Didn''t Use" option';
COMMENT ON COLUMN reviews.bathroom_quality IS 'FBO bathroom quality rating (1-5) - optional';
COMMENT ON COLUMN reviews.fbo_amenities_quality IS 'FBO amenities quality rating (1-5) - optional';
COMMENT ON COLUMN reviews.fbo_wifi_quality IS 'FBO WiFi quality rating (1-5) - optional';
COMMENT ON COLUMN reviews.atmosphere IS 'Restaurant atmosphere - optional, null for takeout/delivery orders';
