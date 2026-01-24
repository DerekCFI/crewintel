-- ============================================================
-- CREWINTEL DUPLICATE BUSINESS FIX - COMPLETE DIAGNOSTIC & FIX
-- Run this script in your Neon SQL console step by step
-- ============================================================

-- ============================================================
-- STEP 1: DIAGNOSTIC - Check current state
-- ============================================================

-- 1a. Check if businesses table exists
SELECT
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'businesses') as column_count
FROM information_schema.tables
WHERE table_name = 'businesses';

-- 1b. If businesses table exists, show all records
SELECT id, business_slug, category, location_name, created_at
FROM businesses
ORDER BY business_slug, category;

-- 1c. Check for the specific duplicate
SELECT * FROM businesses WHERE business_slug = 'jw-marriott-houston-downtown';

-- 1d. Check constraints on businesses table
SELECT
  tc.constraint_name,
  tc.constraint_type,
  kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'businesses';

-- 1e. Show duplicate slugs in businesses table
SELECT business_slug, category, COUNT(*) as duplicate_count
FROM businesses
GROUP BY business_slug, category
HAVING COUNT(*) > 1;

-- 1f. Show reviews grouped by business_slug to see data variations
SELECT
  business_slug,
  COUNT(*) as review_count,
  COUNT(DISTINCT location_name) as name_variants,
  COUNT(DISTINCT address) as address_variants,
  array_agg(DISTINCT location_name) as all_names
FROM reviews
WHERE business_slug = 'jw-marriott-houston-downtown'
GROUP BY business_slug;

-- ============================================================
-- STEP 2: ENSURE UNIQUE CONSTRAINT EXISTS
-- Run this to add constraint (will fail harmlessly if exists)
-- ============================================================

-- First drop any duplicate records so constraint can be added
-- This keeps the record with the lowest ID (earliest created)
DELETE FROM businesses a
USING businesses b
WHERE a.business_slug = b.business_slug
  AND a.category = b.category
  AND a.id > b.id;

-- Now add the unique constraint
ALTER TABLE businesses
ADD CONSTRAINT IF NOT EXISTS unique_business_slug_category
UNIQUE (business_slug, category);

-- If above fails with "constraint already exists", that's fine!
-- If it fails with "duplicate key", run the DELETE again

-- ============================================================
-- STEP 3: ALTERNATIVE - If constraint add fails due to duplicates
-- Run these queries one by one
-- ============================================================

-- 3a. Find and show duplicates with their IDs
SELECT
  id,
  business_slug,
  category,
  location_name,
  created_at,
  (SELECT COUNT(*) FROM reviews WHERE business_id = businesses.id) as review_count
FROM businesses
WHERE business_slug IN (
  SELECT business_slug
  FROM businesses
  GROUP BY business_slug, category
  HAVING COUNT(*) > 1
)
ORDER BY business_slug, category, id;

-- 3b. For each duplicate set, update reviews to point to the keeper (lowest ID)
-- Then delete the duplicates
WITH duplicates AS (
  SELECT
    business_slug,
    category,
    MIN(id) as keep_id,
    array_agg(id ORDER BY id) as all_ids
  FROM businesses
  GROUP BY business_slug, category
  HAVING COUNT(*) > 1
)
UPDATE reviews r
SET business_id = d.keep_id
FROM duplicates d
WHERE r.business_id = ANY(d.all_ids)
  AND r.business_id != d.keep_id;

-- 3c. Now delete the duplicate business records
DELETE FROM businesses
WHERE id IN (
  SELECT b.id
  FROM businesses b
  JOIN (
    SELECT business_slug, category, MIN(id) as keep_id
    FROM businesses
    GROUP BY business_slug, category
    HAVING COUNT(*) > 1
  ) dups ON b.business_slug = dups.business_slug
        AND b.category = dups.category
        AND b.id != dups.keep_id
);

-- 3d. Now try adding the constraint again
ALTER TABLE businesses
ADD CONSTRAINT unique_business_slug_category
UNIQUE (business_slug, category);

-- ============================================================
-- STEP 4: VERIFY THE FIX
-- ============================================================

-- 4a. Confirm no duplicates remain
SELECT business_slug, category, COUNT(*)
FROM businesses
GROUP BY business_slug, category
HAVING COUNT(*) > 1;
-- Should return 0 rows

-- 4b. Confirm constraint exists
SELECT constraint_name, constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'businesses' AND constraint_type = 'UNIQUE';

-- 4c. Check the specific business
SELECT * FROM businesses WHERE business_slug = 'jw-marriott-houston-downtown';
-- Should return exactly 1 row

-- 4d. Test that constraint works (this should FAIL with duplicate key error)
-- INSERT INTO businesses (business_slug, category, location_name)
-- VALUES ('jw-marriott-houston-downtown', 'hotels', 'Test Duplicate');

-- ============================================================
-- STEP 5: VERIFY REVIEWS ARE LINKED
-- ============================================================

-- Check reviews have business_id set
SELECT
  category,
  COUNT(*) as total_reviews,
  COUNT(business_id) as with_business_id,
  COUNT(*) - COUNT(business_id) as missing_business_id
FROM reviews
GROUP BY category;

-- If any are missing, link them
UPDATE reviews r
SET business_id = b.id
FROM businesses b
WHERE r.business_slug = b.business_slug
  AND r.category = b.category
  AND r.business_id IS NULL;
