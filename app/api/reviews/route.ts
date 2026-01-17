import { NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'
import { calculateHotelRating, calculateFBORating, calculateRestaurantRating, calculateRentalRating } from '@/lib/ratings'

/*
 * Database Schema Updates:
 *
 * -- Universal fields
 * ALTER TABLE reviews ADD COLUMN phone VARCHAR(50);
 * ALTER TABLE reviews ADD COLUMN would_recommend BOOLEAN;
 *
 * -- Hotel fields
 * ALTER TABLE reviews ADD COLUMN room_temperature_control VARCHAR(50);
 * ALTER TABLE reviews DROP COLUMN breakfast_available;
 * ALTER TABLE reviews DROP COLUMN breakfast_quality;
 * ALTER TABLE reviews ADD COLUMN breakfast VARCHAR(50);
 * ALTER TABLE reviews ADD COLUMN breakfast_start_time VARCHAR(100);
 * ALTER TABLE reviews ADD COLUMN room_location_recommendation TEXT;
 * ALTER TABLE reviews ADD COLUMN distance_to_restaurants VARCHAR(50);
 * ALTER TABLE reviews ADD COLUMN dry_cleaning_available BOOLEAN;
 * ALTER TABLE reviews ADD COLUMN in_room_coffee VARCHAR(50);
 * ALTER TABLE reviews ADD COLUMN in_room_microwave BOOLEAN;
 *
 * -- Restaurant fields
 * ALTER TABLE reviews ADD COLUMN healthy_options BOOLEAN;
 * ALTER TABLE reviews ADD COLUMN vegetarian_options BOOLEAN;
 * ALTER TABLE reviews ADD COLUMN vegan_options BOOLEAN;
 * ALTER TABLE reviews ADD COLUMN gluten_free_options BOOLEAN;
 */

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    
    if (!category) {
      return NextResponse.json(
        { error: 'Category is required' },
        { status: 400 }
      )
    }

    const sql = neon(process.env.DATABASE_URL!)
    
    const reviews = await sql`
      SELECT * FROM reviews 
      WHERE category = ${category}
      ORDER BY created_at DESC
    `

    return NextResponse.json({ reviews })
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Validate required fields
    if (!body.category || !body.airport || !body.locationName || !body.address || !body.overallRating || !body.reviewText) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate review length
    if (body.reviewText.length < 50) {
      return NextResponse.json(
        { error: 'Review must be at least 50 characters' },
        { status: 400 }
      )
    }

    const sql = neon(process.env.DATABASE_URL!)

    // Generate business slug from location name
    const businessSlug = body.locationName
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special chars except spaces and hyphens
      .replace(/\s+/g, '-')          // Replace spaces with hyphens
      .replace(/-+/g, '-')           // Replace multiple hyphens with single
      .trim()

    // Calculate detailed rating based on category
    let calculatedRating = null;
    switch (body.category) {
      case 'hotels':
        calculatedRating = calculateHotelRating(body);
        break;
      case 'fbos':
        calculatedRating = calculateFBORating(body);
        break;
      case 'restaurants':
        calculatedRating = calculateRestaurantRating(body);
        break;
      case 'rentals':
        calculatedRating = calculateRentalRating(body);
        break;
    }

    // Insert the review with all fields
    const result = await sql`
      INSERT INTO reviews (
        category,
        airport_code,
        location_name,
        business_slug,
        address,
        phone,
        latitude,
        longitude,
        overall_rating,
        review_text,
        visit_date,
        would_recommend,
        aircraft_type,
        bed_quality,
        noise_level,
        blackout_curtains,
        blackout_effectiveness,
        room_cleanliness,
        checkin_experience,
        staff_responsiveness,
        wifi_quality,
        shower_quality,
        room_temperature_control,
        parking_situation,
        breakfast,
        breakfast_start_time,
        crew_recognition,
        laundry_available,
        dry_cleaning_available,
        fitness_center,
        shuttle_service,
        distance_from_airport,
        room_location_recommendation,
        distance_to_restaurants,
        in_room_coffee,
        in_room_microwave,
        service_speed,
        fuel_pricing,
        crew_lounge_quality,
        crew_car_availability,
        staff_attitude,
        passenger_crew_focus,
        parking_ramp_space,
        twentyfour_seven_service,
        late_night_service_speed,
        fbo_amenities_quality,
        communication,
        hangar_availability,
        catering_available,
        bathroom_quality,
        fbo_wifi_quality,
        food_quality,
        restaurant_service_speed,
        portion_size,
        price_point,
        hours_of_operation,
        takeout_quality,
        restaurant_wifi_available,
        atmosphere,
        restaurant_distance_from_airport,
        healthy_options,
        vegetarian_options,
        vegan_options,
        gluten_free_options,
        rental_process_speed,
        vehicle_condition,
        upsell_pressure,
        after_hours_access,
        fbo_delivery,
        return_flexibility,
        staff_helpfulness,
        pricing_transparency,
        crew_rates_available,
        rental_location,
        calculated_rating,
        user_id,
        user_email,
        created_at
      ) VALUES (
        ${body.category},
        ${body.airport.toUpperCase()},
        ${body.locationName},
        ${businessSlug},
        ${body.address},
        ${body.phone || null},
        ${body.latitude || null},
        ${body.longitude || null},
        ${body.overallRating},
        ${body.reviewText},
        ${body.visitDate || null},
        ${body.wouldRecommend || null},
        ${body.aircraftType || null},
        ${body.bedQuality || null},
        ${body.noiseLevel || null},
        ${body.blackoutCurtains || null},
        ${body.blackoutEffectiveness || null},
        ${body.roomCleanliness || null},
        ${body.checkinExperience || null},
        ${body.staffResponsiveness || null},
        ${body.wifiQuality || null},
        ${body.showerQuality || null},
        ${body.roomTemperatureControl || null},
        ${body.parkingSituation || null},
        ${body.breakfast || null},
        ${body.breakfastStartTime || null},
        ${body.crewRecognition || null},
        ${body.laundryAvailable || null},
        ${body.dryCleaningAvailable || null},
        ${body.fitnessCenter || null},
        ${body.shuttleService || null},
        ${body.distanceFromAirport || null},
        ${body.roomLocationRecommendation || null},
        ${body.distanceToRestaurants || null},
        ${body.inRoomCoffee || null},
        ${body.inRoomMicrowave || null},
        ${body.serviceSpeed || null},
        ${body.fuelPricing || null},
        ${body.crewLoungeQuality || null},
        ${body.crewCarAvailability || null},
        ${body.staffAttitude || null},
        ${body.passengerCrewFocus || null},
        ${body.parkingRampSpace || null},
        ${body.twentyfourSevenService || null},
        ${body.lateNightServiceSpeed || null},
        ${body.fboAmenitiesQuality || null},
        ${body.communication || null},
        ${body.hangarAvailability || null},
        ${body.cateringAvailable || null},
        ${body.bathroomQuality || null},
        ${body.fboWifiQuality || null},
        ${body.foodQuality || null},
        ${body.restaurantServiceSpeed || null},
        ${body.portionSize || null},
        ${body.pricePoint || null},
        ${body.hoursOfOperation || null},
        ${body.takeoutQuality || null},
        ${body.restaurantWifiAvailable || null},
        ${body.atmosphere || null},
        ${body.restaurantDistanceFromAirport || null},
        ${body.healthyOptions || null},
        ${body.vegetarianOptions || null},
        ${body.veganOptions || null},
        ${body.glutenFreeOptions || null},
        ${body.rentalProcessSpeed || null},
        ${body.vehicleCondition || null},
        ${body.upsellPressure || null},
        ${body.afterHoursAccess || null},
        ${body.fboDelivery || null},
        ${body.returnFlexibility || null},
        ${body.staffHelpfulness || null},
        ${body.pricingTransparency || null},
        ${body.crewRatesAvailable || null},
        ${body.rentalLocation || null},
        ${calculatedRating},
        ${body.userId || null},
        ${body.userEmail || null},
        NOW()
      )
      RETURNING id
    `

    return NextResponse.json({ 
      success: true,
      id: result[0].id
    })
  } catch (error) {
    console.error('Error creating review:', error)
    return NextResponse.json(
      { error: 'Failed to create review' },
      { status: 500 }
    )
  }
}
