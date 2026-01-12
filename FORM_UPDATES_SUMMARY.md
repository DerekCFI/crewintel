# Form Updates Summary

## Changes Made

### 1. Universal Fields (All Categories)
- **Added:** "Would Recommend" checkbox after Overall Rating

### 2. Hotel Section Updates

#### Modified Fields:
- **Staff Responsiveness** → Label changed to "Staff Responsiveness (to noise complaints/requests)"
- **Laundry Available** → Label changed to "Self-Service Laundry Available"
- **Breakfast** → Changed from checkbox to dropdown with options:
  - Not Available
  - Included in Rate
  - Available for Purchase
  - Complimentary Continental

#### New Fields Added:
1. **Distance to Restaurants** (after Distance from Airport)
   - Type: Dropdown
   - Options: Walking Distance, 5-15 Minute Drive, Over 15 Minute Drive

2. **Room Temperature Control** (after Shower Quality)
   - Type: Dropdown
   - Options: Poor, Fair, Good, Excellent

3. **Breakfast Start Time** (conditional - only shows if breakfast is not "Not Available")
   - Type: Text input
   - Placeholder: "e.g., Weekday: 6am, Weekend: 7am"

4. **Dry-Cleaning Available** (after Self-Service Laundry)
   - Type: Checkbox

5. **In-Room Coffee** (before In-Room Microwave)
   - Type: Dropdown
   - Options: Single-Cup Machine, Multi-Cup Machine, None

6. **In-Room Microwave** (after In-Room Coffee)
   - Type: Checkbox

### 3. Restaurant Section
No changes to existing fields. The dietary options (Healthy, Vegetarian, Vegan, Gluten-Free) were already added in a previous update.

### 4. Form Reset Fix
Updated the category change reset logic to now reset ALL fields except:
- category (keeps new selection)
- airport (keeps value)

Now resets (previously preserved):
- overallRating → 0
- locationName → empty string
- address → empty string
- phone → empty string
- latitude → undefined
- longitude → undefined
- reviewText → empty string
- Google Places search input clears visually

All category-specific fields continue to reset as before.

## Database Schema Changes

### New Columns to Add:
```sql
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

-- Restaurant fields (already added previously)
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS healthy_options BOOLEAN;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS vegetarian_options BOOLEAN;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS vegan_options BOOLEAN;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS gluten_free_options BOOLEAN;
```

### Deprecated Columns:
The following columns are no longer used but are kept for backward compatibility:
- `breakfast_available` (replaced by `breakfast`)
- `breakfast_quality` (removed - no longer needed with new breakfast structure)

You can optionally drop these columns after ensuring no data needs to be migrated:
```sql
-- Optional cleanup (only after data migration if needed)
-- ALTER TABLE reviews DROP COLUMN IF EXISTS breakfast_available;
-- ALTER TABLE reviews DROP COLUMN IF EXISTS breakfast_quality;
```

## Files Modified

1. **app/add/page.tsx**
   - Updated form state with new fields
   - Fixed category reset logic to reset more fields
   - Added new hotel form fields
   - Added "Would Recommend" universal field

2. **app/components/PlacesAutocomplete.tsx**
   - Added useEffect to sync with external value changes (enables visual clearing on reset)

3. **app/api/reviews/route.ts**
   - Updated INSERT statement with new columns
   - Updated VALUES section with new field mappings
   - Updated schema comments

4. **migrations/add_form_fields.sql** (NEW)
   - Complete SQL migration script for Neon database

## Next Steps

1. Run the SQL migration script in your Neon database console:
   ```
   See: /workspaces/crewbase/migrations/add_form_fields.sql
   ```

2. Test the form:
   - Verify all new fields appear correctly
   - Test category switching to ensure proper reset behavior
   - Test conditional fields (Breakfast Start Time, Blackout Effectiveness)
   - Submit a test review to ensure data persists correctly

3. Optional: Migrate existing breakfast data from old columns to new structure if needed
