import { NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

/*
 * Database Schema for Restaurant Fields:
 *
 * ALTER TABLE reviews ADD COLUMN healthy_options BOOLEAN;
 * ALTER TABLE reviews ADD COLUMN vegetarian_options BOOLEAN;
 * ALTER TABLE reviews ADD COLUMN vegan_options BOOLEAN;
 * ALTER TABLE reviews ADD COLUMN gluten_free_options BOOLEAN;
 */

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

    // Insert the review with all fields
    const result = await sql`
      INSERT INTO reviews (
        category,
        airport_code,
        location_name,
        address,
        latitude,
        longitude,
        overall_rating,
        review_text,
        visit_date,
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
        parking_situation,
        breakfast_available,
        breakfast_quality,
        crew_recognition,
        laundry_available,
        fitness_center,
        shuttle_service,
        distance_from_airport,
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
        created_at
      ) VALUES (
        ${body.category},
        ${body.airport.toUpperCase()},
        ${body.locationName},
        ${body.address},
        ${body.latitude || null},
        ${body.longitude || null},
        ${body.overallRating},
        ${body.reviewText},
        ${body.visitDate || null},
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
        ${body.parkingSituation || null},
        ${body.breakfastAvailable || null},
        ${body.breakfastQuality || null},
        ${body.crewRecognition || null},
        ${body.laundryAvailable || null},
        ${body.fitnessCenter || null},
        ${body.shuttleService || null},
        ${body.distanceFromAirport || null},
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
