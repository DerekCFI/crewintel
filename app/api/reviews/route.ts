import { NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'
import { calculateHotelRating, calculateFBORating, calculateRestaurantRating, calculateRentalRating } from '../../lib/ratings'
import { checkForSpam } from '../../lib/spam-detection'
import { sendNewReviewNotification, sendNewLocationNotification } from '../../lib/notifications'

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

    // Helper function to convert "not-sure" values to null
    const nullIfNotSure = (value: string | null | undefined): string | null => {
      if (!value || value === 'not-sure') return null
      return value
    }

    // Generate business slug from location name
    const businessSlug = body.locationName
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()

    // Calculate detailed rating based on category
    let calculatedRating = null
    switch (body.category) {
      case 'hotels':
        calculatedRating = calculateHotelRating(body)
        break
      case 'fbos':
        calculatedRating = calculateFBORating(body)
        break
      case 'restaurants':
        calculatedRating = calculateRestaurantRating(body)
        break
      case 'rentals':
        calculatedRating = calculateRentalRating(body)
        break
    }

    // Run spam detection
    const spamCheck = checkForSpam({
      reviewText: body.reviewText,
      userEmail: body.userEmail,
      locationName: body.locationName,
      overallRating: body.overallRating
    })

    // Check if this is a new location
    const existingBusiness = await sql`
      SELECT id FROM businesses
      WHERE business_slug = ${businessSlug} AND category = ${body.category}
      LIMIT 1
    `
    const isNewLocation = existingBusiness.length === 0

    // Upsert business record - NEW locations require approval (approved = false)
    const businessResult = await sql`
      INSERT INTO businesses (
        business_slug,
        category,
        location_name,
        address,
        phone,
        latitude,
        longitude,
        airport_code,
        approved,
        created_at,
        updated_at
      ) VALUES (
        ${businessSlug},
        ${body.category},
        ${body.locationName},
        ${body.address},
        ${body.phone || null},
        ${body.latitude || null},
        ${body.longitude || null},
        ${body.airport.toUpperCase()},
        false,
        NOW(),
        NOW()
      )
      ON CONFLICT (business_slug, category) DO UPDATE SET
        updated_at = NOW(),
        phone = COALESCE(EXCLUDED.phone, businesses.phone),
        latitude = COALESCE(EXCLUDED.latitude, businesses.latitude),
        longitude = COALESCE(EXCLUDED.longitude, businesses.longitude)
      RETURNING id, approved
    `

    const businessId = businessResult[0].id

    // Insert the review - auto-flag if spam detected
    const result = await sql`
      INSERT INTO reviews (
        category,
        airport_code,
        location_name,
        business_slug,
        business_id,
        address,
        phone,
        latitude,
        longitude,
        overall_rating,
        review_text,
        visit_date,
        visit_date_end,
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
        was_takeout_delivery,
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
        flagged,
        spam_score,
        created_at
      ) VALUES (
        ${body.category},
        ${body.airport.toUpperCase()},
        ${body.locationName},
        ${businessSlug},
        ${businessId},
        ${body.address},
        ${body.phone || null},
        ${body.latitude || null},
        ${body.longitude || null},
        ${body.overallRating},
        ${body.reviewText},
        ${body.visitDate || null},
        ${body.visitDateEnd || null},
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
        ${nullIfNotSure(body.parkingSituation)},
        ${nullIfNotSure(body.breakfast)},
        ${body.breakfastStartTime || null},
        ${body.crewRecognition || null},
        ${nullIfNotSure(body.laundryAvailable)},
        ${body.dryCleaningAvailable || null},
        ${body.fitnessCenter || null},
        ${body.shuttleService || null},
        ${body.distanceFromAirport || null},
        ${body.roomLocationRecommendation || null},
        ${body.distanceToRestaurants || null},
        ${body.inRoomCoffee || null},
        ${body.inRoomMicrowave || null},
        ${body.serviceSpeed || null},
        ${nullIfNotSure(body.fuelPricing)},
        ${body.crewLoungeQuality || null},
        ${nullIfNotSure(body.crewCarAvailability)},
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
        ${body.wasTakeoutDelivery || false},
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
        ${spamCheck.autoFlag},
        ${spamCheck.score},
        NOW()
      )
      RETURNING id
    `

    const reviewId = result[0].id

    // Send email notifications (don't block the response)
    Promise.all([
      sendNewReviewNotification({
        id: reviewId,
        locationName: body.locationName,
        category: body.category,
        airportCode: body.airport.toUpperCase(),
        overallRating: body.overallRating,
        reviewText: body.reviewText,
        userEmail: body.userEmail,
        isNewLocation,
        spamScore: spamCheck.score,
        spamReasons: spamCheck.reasons,
        autoFlagged: spamCheck.autoFlag
      }),
      isNewLocation ? sendNewLocationNotification({
        id: businessId,
        locationName: body.locationName,
        category: body.category,
        airportCode: body.airport.toUpperCase(),
        address: body.address
      }) : Promise.resolve()
    ]).catch(err => console.error('Failed to send notifications:', err))

    return NextResponse.json({
      success: true,
      id: reviewId
    })
  } catch (error) {
    console.error('Error creating review:', error)
    return NextResponse.json(
      { error: 'Failed to create review' },
      { status: 500 }
    )
  }
}
