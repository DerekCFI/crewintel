# Database Migration Instructions

## Critical: Run This SQL in Neon Database Console

The reviews table is missing several columns that are required by the API. Run the following SQL statements in your Neon database console to add all missing columns:

```sql
-- Migration: Add new form fields to reviews table
-- Run this in your Neon database console
-- This adds ALL missing columns that are in the API INSERT statement but missing from the original schema

-- Universal fields
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS phone VARCHAR(50);
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS would_recommend BOOLEAN;

-- Hotel fields
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS room_temperature_control VARCHAR(50);
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS breakfast VARCHAR(50);
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS breakfast_start_time VARCHAR(100);
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS room_location_recommendation TEXT;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS distance_to_restaurants VARCHAR(50);
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS dry_cleaning_available BOOLEAN;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS in_room_coffee VARCHAR(50);
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS in_room_microwave BOOLEAN;

-- Restaurant fields
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS healthy_options BOOLEAN;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS vegetarian_options BOOLEAN;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS vegan_options BOOLEAN;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS gluten_free_options BOOLEAN;
```

## Optional Cleanup (After Migration)

The following columns are deprecated and can be dropped after verifying no data needs to be migrated:

```sql
-- Optional: Drop deprecated breakfast columns
-- Only run these if you're sure you don't need the old data
-- ALTER TABLE reviews DROP COLUMN IF EXISTS breakfast_available;
-- ALTER TABLE reviews DROP COLUMN IF EXISTS breakfast_quality;
```

## What These Changes Add

### Universal Fields
- **phone** - Phone number from Google Places API
- **would_recommend** - Boolean checkbox indicating if user would recommend the location

### Hotel Fields
- **room_temperature_control** - Quality rating (poor/fair/good/excellent)
- **breakfast** - Type of breakfast (not available, included, purchase, complimentary continental)
- **breakfast_start_time** - Text description of breakfast hours
- **room_location_recommendation** - Text recommendations for which rooms/floors to request
- **distance_to_restaurants** - How far to nearby restaurants (walking, 5-15 min, over 15 min)
- **dry_cleaning_available** - Boolean for dry cleaning service
- **in_room_coffee** - Type of coffee machine (single-cup, multi-cup, none)
- **in_room_microwave** - Boolean for in-room microwave

### Restaurant Fields
- **healthy_options** - Boolean for healthy menu items
- **vegetarian_options** - Boolean for vegetarian menu items
- **vegan_options** - Boolean for vegan menu items
- **gluten_free_options** - Boolean for gluten-free menu items

## Verification

After running the migration, verify the columns exist:

```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'reviews'
AND column_name IN (
  'phone', 'would_recommend', 'room_temperature_control', 'breakfast',
  'breakfast_start_time', 'room_location_recommendation', 'distance_to_restaurants',
  'dry_cleaning_available', 'in_room_coffee', 'in_room_microwave',
  'healthy_options', 'vegetarian_options', 'vegan_options', 'gluten_free_options'
)
ORDER BY column_name;
```

You should see all 14 new columns listed.
