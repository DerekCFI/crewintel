-- Migration: Create review_photos table for storing Cloudinary image references
-- Date: 2026-01-23

-- =====================================================
-- CREATE REVIEW PHOTOS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS review_photos (
  id SERIAL PRIMARY KEY,
  review_id INTEGER NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  cloudinary_url TEXT NOT NULL,
  cloudinary_public_id TEXT NOT NULL,
  thumbnail_url TEXT,
  display_order INTEGER DEFAULT 0,
  width INTEGER,
  height INTEGER,
  file_size INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Index for fetching photos by review
CREATE INDEX IF NOT EXISTS idx_review_photos_review_id
ON review_photos(review_id);

-- Index for ordering photos within a review
CREATE INDEX IF NOT EXISTS idx_review_photos_display_order
ON review_photos(review_id, display_order);

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON TABLE review_photos IS 'Stores Cloudinary photo references for review photos';
COMMENT ON COLUMN review_photos.review_id IS 'Foreign key to reviews table';
COMMENT ON COLUMN review_photos.cloudinary_url IS 'Full Cloudinary URL for the image';
COMMENT ON COLUMN review_photos.cloudinary_public_id IS 'Cloudinary public_id for transformations and deletion';
COMMENT ON COLUMN review_photos.thumbnail_url IS 'Pre-generated thumbnail URL (300x300)';
COMMENT ON COLUMN review_photos.display_order IS 'Order of photos within a review (0-indexed)';
COMMENT ON COLUMN review_photos.width IS 'Original image width in pixels';
COMMENT ON COLUMN review_photos.height IS 'Original image height in pixels';
COMMENT ON COLUMN review_photos.file_size IS 'Original file size in bytes';
