'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import StarRating from '../../components/StarRating'
import PriceRating from '../../components/PriceRating'
import PlacesAutocomplete from '../../components/PlacesAutocomplete'
import PhotoUpload, { SelectedPhoto, fileToBase64 } from '../../components/PhotoUpload'

function AddLocationForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useUser()
  const [formData, setFormData] = useState({
    // Universal fields
    category: '',
    airport: '',
    locationName: '',
    address: '',
    phone: '',
    latitude: undefined as number | undefined,
    longitude: undefined as number | undefined,
    overallRating: 0,
    reviewText: '',
    visitDate: '',
    visitDateEnd: '',
    wouldRecommend: false,

    // Aircraft type (FBOs)
    aircraftType: '',

    // Hotel fields
    bedQuality: 0,
    noiseLevel: '',
    blackoutCurtains: false,
    blackoutEffectiveness: 0,
    roomCleanliness: 0,
    checkinExperience: 0,
    staffResponsiveness: '',
    wifiQuality: 0,
    showerQuality: 0,
    roomTemperatureControl: '',
    parkingSituation: '',
    breakfast: '',
    breakfastStartTime: '',
    crewRecognition: false,
    laundryAvailable: '',
    dryCleaningAvailable: false,
    fitnessCenter: false,
    shuttleService: false,
    distanceFromAirport: '',
    roomLocationRecommendation: '',
    distanceToRestaurants: '',
    inRoomCoffee: '',
    inRoomMicrowave: false,

    // FBO fields
    serviceSpeed: 0,
    fuelPricing: '',
    crewLoungeQuality: 0,
    crewCarAvailability: '',
    staffAttitude: 0,
    passengerCrewFocus: '',
    parkingRampSpace: '',
    twentyfourSevenService: false,
    lateNightServiceSpeed: '',
    fboAmenitiesQuality: 0,
    communication: 0,
    hangarAvailability: '',
    cateringAvailable: false,
    bathroomQuality: 0,
    fboWifiQuality: 0,

    // Restaurant fields
    foodQuality: 0,
    restaurantServiceSpeed: 0,
    portionSize: '',
    pricePoint: 0,
    hoursOfOperation: '',
    takeoutQuality: 0,
    restaurantWifiAvailable: false,
    atmosphere: '',
    restaurantDistanceFromAirport: '',
    healthyOptions: false,
    vegetarianOptions: false,
    veganOptions: false,
    glutenFreeOptions: false,
    wasTakeoutDelivery: false,

    // Car Rental fields
    rentalProcessSpeed: 0,
    vehicleCondition: 0,
    upsellPressure: '',
    afterHoursAccess: false,
    fboDelivery: false,
    returnFlexibility: 0,
    staffHelpfulness: 0,
    pricingTransparency: '',
    crewRatesAvailable: false,
    rentalLocation: '',
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [selectedPhotos, setSelectedPhotos] = useState<SelectedPhoto[]>([])
  const [uploadingPhotos, setUploadingPhotos] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<string>('')

  // Track the previous category to detect changes
  const prevCategoryRef = useRef(formData.category)

  // Reset category-specific fields when category changes
  useEffect(() => {
    // Skip on initial mount (when prevCategory is empty)
    if (prevCategoryRef.current === '' && formData.category === '') {
      return
    }

    // Only reset if category actually changed
    if (prevCategoryRef.current !== formData.category && prevCategoryRef.current !== '') {
      // Reset all fields except category and airport
      setFormData(prev => ({
        // Preserve only these fields
        category: prev.category,
        airport: prev.airport,

        // Reset universal fields
        locationName: '',
        address: '',
        phone: '',
        latitude: undefined,
        longitude: undefined,
        visitDate: '',
        visitDateEnd: '',
        overallRating: 0,
        reviewText: '',
        wouldRecommend: false,

        // Reset aircraft type (FBO field)
        aircraftType: '',

        // Reset all hotel fields to defaults
        bedQuality: 0,
        noiseLevel: '',
        blackoutCurtains: false,
        blackoutEffectiveness: 0,
        roomCleanliness: 0,
        checkinExperience: 0,
        staffResponsiveness: '',
        wifiQuality: 0,
        showerQuality: 0,
        roomTemperatureControl: '',
        parkingSituation: '',
        breakfast: '',
        breakfastStartTime: '',
        crewRecognition: false,
        laundryAvailable: '',
        dryCleaningAvailable: false,
        fitnessCenter: false,
        shuttleService: false,
        distanceFromAirport: '',
        roomLocationRecommendation: '',
        distanceToRestaurants: '',
        inRoomCoffee: '',
        inRoomMicrowave: false,

        // Reset all FBO fields to defaults
        serviceSpeed: 0,
        fuelPricing: '',
        crewLoungeQuality: 0,
        crewCarAvailability: '',
        staffAttitude: 0,
        passengerCrewFocus: '',
        parkingRampSpace: '',
        twentyfourSevenService: false,
        lateNightServiceSpeed: '',
        fboAmenitiesQuality: 0,
        communication: 0,
        hangarAvailability: '',
        cateringAvailable: false,
        bathroomQuality: 0,
        fboWifiQuality: 0,

        // Reset all restaurant fields to defaults
        foodQuality: 0,
        restaurantServiceSpeed: 0,
        portionSize: '',
        pricePoint: 0,
        hoursOfOperation: '',
        takeoutQuality: 0,
        restaurantWifiAvailable: false,
        atmosphere: '',
        restaurantDistanceFromAirport: '',
        healthyOptions: false,
        vegetarianOptions: false,
        veganOptions: false,
        glutenFreeOptions: false,
        wasTakeoutDelivery: false,

        // Reset all car rental fields to defaults
        rentalProcessSpeed: 0,
        vehicleCondition: 0,
        upsellPressure: '',
        afterHoursAccess: false,
        fboDelivery: false,
        returnFlexibility: 0,
        staffHelpfulness: 0,
        pricingTransparency: '',
        crewRatesAvailable: false,
        rentalLocation: '',
      }))
    }

    // Update the ref to the current category
    prevCategoryRef.current = formData.category
  }, [formData.category])

  // Auto-fill form from URL parameters or draft on mount
  useEffect(() => {
    const category = searchParams.get('category')
    const name = searchParams.get('name')
    const address = searchParams.get('address')
    const draftId = searchParams.get('draft')

    // If draft ID is present, load the draft from the API
    if (draftId) {
      const loadDraft = async () => {
        try {
          const response = await fetch(`/api/reviews/${draftId}/expand`)
          if (!response.ok) throw new Error('Failed to load draft')
          const data = await response.json()
          const review = data.review

          if (review) {
            // Map database fields to form fields
            setFormData(prev => ({
              ...prev,
              category: review.category || '',
              airport: review.airport_code || '',
              locationName: review.location_name || '',
              address: review.address || '',
              phone: review.phone || '',
              latitude: review.latitude || undefined,
              longitude: review.longitude || undefined,
              overallRating: review.overall_rating || 0,
              reviewText: review.review_text || '',
              visitDate: review.visit_date ? review.visit_date.split('T')[0] : '',
              visitDateEnd: review.visit_date_end ? review.visit_date_end.split('T')[0] : '',
              wouldRecommend: review.would_recommend || false,
              aircraftType: review.aircraft_type || '',
              // Hotel fields
              bedQuality: review.bed_quality || 0,
              noiseLevel: review.noise_level || '',
              blackoutCurtains: review.blackout_curtains || false,
              blackoutEffectiveness: review.blackout_effectiveness || 0,
              roomCleanliness: review.room_cleanliness || 0,
              checkinExperience: review.checkin_experience || 0,
              staffResponsiveness: review.staff_responsiveness || '',
              wifiQuality: review.wifi_quality || 0,
              showerQuality: review.shower_quality || 0,
              roomTemperatureControl: review.room_temperature_control || '',
              parkingSituation: review.parking_situation || '',
              breakfast: review.breakfast || '',
              breakfastStartTime: review.breakfast_start_time || '',
              crewRecognition: review.crew_recognition || false,
              laundryAvailable: review.laundry_available || '',
              dryCleaningAvailable: review.dry_cleaning_available || false,
              fitnessCenter: review.fitness_center || false,
              shuttleService: review.shuttle_service || false,
              distanceFromAirport: review.distance_from_airport || '',
              roomLocationRecommendation: review.room_location_recommendation || '',
              distanceToRestaurants: review.distance_to_restaurants || '',
              inRoomCoffee: review.in_room_coffee || '',
              inRoomMicrowave: review.in_room_microwave || false,
              // FBO fields
              serviceSpeed: review.service_speed || 0,
              fuelPricing: review.fuel_pricing || '',
              crewLoungeQuality: review.crew_lounge_quality || 0,
              crewCarAvailability: review.crew_car_availability || '',
              staffAttitude: review.staff_attitude || 0,
              passengerCrewFocus: review.passenger_crew_focus || '',
              parkingRampSpace: review.parking_ramp_space || '',
              twentyfourSevenService: review.twentyfour_seven_service || false,
              lateNightServiceSpeed: review.late_night_service_speed || '',
              fboAmenitiesQuality: review.fbo_amenities_quality || 0,
              communication: review.communication || 0,
              hangarAvailability: review.hangar_availability || '',
              cateringAvailable: review.catering_available || false,
              bathroomQuality: review.bathroom_quality || 0,
              fboWifiQuality: review.fbo_wifi_quality || 0,
              // Restaurant fields
              foodQuality: review.food_quality || 0,
              restaurantServiceSpeed: review.restaurant_service_speed || 0,
              portionSize: review.portion_size || '',
              pricePoint: review.price_point || 0,
              hoursOfOperation: review.hours_of_operation || '',
              takeoutQuality: review.takeout_quality || 0,
              restaurantWifiAvailable: review.restaurant_wifi_available || false,
              atmosphere: review.atmosphere || '',
              restaurantDistanceFromAirport: review.restaurant_distance_from_airport || '',
              healthyOptions: review.healthy_options || false,
              vegetarianOptions: review.vegetarian_options || false,
              veganOptions: review.vegan_options || false,
              glutenFreeOptions: review.gluten_free_options || false,
              wasTakeoutDelivery: review.was_takeout_delivery || false,
              // Car Rental fields
              rentalProcessSpeed: review.rental_process_speed || 0,
              vehicleCondition: review.vehicle_condition || 0,
              upsellPressure: review.upsell_pressure || '',
              afterHoursAccess: review.after_hours_access || false,
              fboDelivery: review.fbo_delivery || false,
              returnFlexibility: review.return_flexibility || 0,
              staffHelpfulness: review.staff_helpfulness || 0,
              pricingTransparency: review.pricing_transparency || '',
              crewRatesAvailable: review.crew_rates_available || false,
              rentalLocation: review.rental_location || '',
            }))
          }
        } catch (err) {
          console.error('Failed to load draft:', err)
        }
      }
      loadDraft()
      return
    }

    // Only auto-fill if at least one parameter is present
    if (category || name || address) {
      setFormData(prev => ({
        ...prev,
        ...(category && { category }),
        ...(name && { locationName: name }),
        ...(address && { address })
      }))
    }
  }, []) // Empty dependency array - only run once on mount

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)
    setSubmitSuccess(false)

    // Client-side validation
    if (!formData.category) {
      setSubmitError('Please select a category')
      return
    }

    if (!formData.locationName || formData.locationName.trim().length === 0) {
      setSubmitError('Please enter a location name')
      return
    }

    if (!formData.overallRating || formData.overallRating === 0) {
      setSubmitError('Please select an overall rating')
      return
    }

    if (!formData.reviewText || formData.reviewText.trim().length < 50) {
      setSubmitError('Please write at least 50 characters in your review')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          userId: user?.id,
          userEmail: user?.primaryEmailAddress?.emailAddress,
        }),
      })

      if (response.ok) {
        const reviewData = await response.json()
        const reviewId = reviewData.id

        // Upload photos if any were selected
        if (selectedPhotos.length > 0 && reviewId) {
          setUploadingPhotos(true)
          setUploadProgress('Uploading photos...')

          try {
            // Convert photos to base64
            const photosToUpload = await Promise.all(
              selectedPhotos.map(async (photo, index) => {
                setUploadProgress(`Processing photo ${index + 1} of ${selectedPhotos.length}...`)
                const base64 = await fileToBase64(photo.file)
                return {
                  base64,
                  fileName: photo.file.name,
                  fileType: photo.file.type,
                  fileSize: photo.file.size,
                }
              })
            )

            setUploadProgress('Uploading to server...')

            const uploadResponse = await fetch('/api/upload-photos', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                photos: photosToUpload,
                reviewId,
                category: formData.category,
              }),
            })

            if (!uploadResponse.ok) {
              const uploadError = await uploadResponse.json()
              console.error('Photo upload error:', uploadError)
              // Don't fail the whole submission, just log the error
              // The review was already created successfully
            }
          } catch (photoError) {
            console.error('Error uploading photos:', photoError)
            // Don't fail the whole submission
          } finally {
            setUploadingPhotos(false)
            setUploadProgress('')
          }
        }

        setSubmitSuccess(true)
        // Short delay to show success message before redirect
        setTimeout(() => {
          router.push(`/${formData.category}?success=true`)
        }, 1500)
      } else {
        // Try to get error details from response
        let errorMessage = 'Failed to submit review. Please try again.'
        try {
          const errorData = await response.json()
          if (errorData.error) {
            errorMessage = errorData.error
          }
        } catch {
          // If JSON parsing fails, use default message
        }
        console.error('Server error:', response.status, errorMessage)
        setSubmitError(errorMessage)
      }
    } catch (error) {
      console.error('Error submitting review:', error)
      setSubmitError('Network error. Please check your connection and try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  const handlePlaceSelect = (place: { name: string; address: string; phone?: string; latitude?: number; longitude?: number }) => {
    setFormData(prev => ({
      ...prev,
      locationName: place.name,
      address: place.address,
      phone: place.phone || '',
      latitude: place.latitude,
      longitude: place.longitude
    }))
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-4xl font-bold text-brand-navy mb-2">Add a Location</h1>
          <p className="text-gray-600 mb-8">Share your crew experience to help fellow aviators</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Category Selection */}
            <div>
              <label htmlFor="category" className="block text-sm font-semibold text-gray-700 mb-2">
                Category *
              </label>
              <select
                id="category"
                name="category"
                required
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue text-brand-navy"
              >
                <option value="">Select a category</option>
                <option value="hotels">Hotel</option>
                <option value="fbos">FBO</option>
                <option value="rentals">Car Rental</option>
                <option value="restaurants">Restaurant</option>
              </select>
            </div>

            {/* Airport Code */}
            <div>
              <label htmlFor="airport" className="block text-sm font-semibold text-gray-700 mb-2">
                Airport Code (IATA or ICAO) *
              </label>
              <input
                type="text"
                id="airport"
                name="airport"
                required
                placeholder="e.g., ATL or KATL"
                value={formData.airport}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue text-brand-navy"
                maxLength={4}
              />
              <p className="text-xs text-gray-500 mt-1">Which airport did you fly into?</p>
            </div>

            {/* Places Autocomplete - Only show if category is selected */}
            {formData.category && (
              <PlacesAutocomplete
                onPlaceSelect={handlePlaceSelect}
                value={formData.locationName}
                category={formData.category}
              />
            )}

            {/* Show selected location details */}
            {formData.locationName && (
              <div className="bg-brand-blue/5 border border-brand-blue/20 rounded-lg p-4">
                <p className="text-sm font-semibold text-brand-navy">Selected Location:</p>
                <p className="text-sm text-gray-700">{formData.locationName}</p>
                <p className="text-xs text-gray-600">{formData.address}</p>
                {formData.phone && <p className="text-xs text-gray-600">Phone: {formData.phone}</p>}
              </div>
            )}

            {/* Visit Date(s) */}
            {formData.category === 'restaurants' ? (
              // Restaurant: Single date input
              <div>
                <label htmlFor="visitDate" className="block text-sm font-semibold text-gray-700 mb-2">
                  Date of Visit
                </label>
                <input
                  type="date"
                  id="visitDate"
                  name="visitDate"
                  value={formData.visitDate}
                  onChange={handleChange}
                  className="w-48 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue text-brand-navy"
                />
              </div>
            ) : (
              // Hotels, FBOs, Car Rentals: Date range inputs
              <div className="flex flex-wrap gap-4">
                <div>
                  <label htmlFor="visitDate" className="block text-sm font-semibold text-gray-700 mb-2">
                    {formData.category === 'hotels' || formData.category === 'rentals' ? 'Check-in/Start Date' : 'Start Date'}
                  </label>
                  <input
                    type="date"
                    id="visitDate"
                    name="visitDate"
                    value={formData.visitDate}
                    onChange={handleChange}
                    className="w-48 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue text-brand-navy"
                  />
                </div>
                <div>
                  <label htmlFor="visitDateEnd" className="block text-sm font-semibold text-gray-700 mb-2">
                    {formData.category === 'hotels' || formData.category === 'rentals' ? 'Check-out/End Date' : 'End Date'}
                  </label>
                  <input
                    type="date"
                    id="visitDateEnd"
                    name="visitDateEnd"
                    value={formData.visitDateEnd}
                    onChange={(e) => {
                      const endDate = e.target.value
                      // Validate end date is not before start date
                      if (formData.visitDate && endDate && endDate < formData.visitDate) {
                        alert('End date cannot be before start date')
                        return
                      }
                      handleChange(e)
                    }}
                    min={formData.visitDate || undefined}
                    className="w-48 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue text-brand-navy"
                  />
                  <p className="text-xs text-gray-500 mt-1">Optional</p>
                </div>
              </div>
            )}

            {/* Aircraft Type (FBOs only) */}
            {formData.category === 'fbos' && (
              <div>
                <label htmlFor="aircraftType" className="block text-sm font-semibold text-gray-700 mb-2">
                  Aircraft Type
                </label>
                <input
                  type="text"
                  id="aircraftType"
                  name="aircraftType"
                  placeholder="e.g., Citation CJ3, King Air 350"
                  value={formData.aircraftType}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue text-brand-navy"
                />
              </div>
            )}

            {/* Overall Rating */}
            <StarRating
              value={formData.overallRating}
              onChange={(value) => setFormData(prev => ({ ...prev, overallRating: value }))}
              label="Overall Rating"
              required={true}
            />

            {/* Would Recommend */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="wouldRecommend"
                name="wouldRecommend"
                checked={formData.wouldRecommend}
                onChange={handleChange}
                className="w-5 h-5 text-brand-blue border-gray-300 rounded focus:ring-brand-blue"
              />
              <label htmlFor="wouldRecommend" className="ml-3 text-sm font-semibold text-gray-700">
                Would Recommend
              </label>
            </div>

            <hr className="my-8 border-gray-200" />

            {/* HOTEL-SPECIFIC FIELDS */}
            {formData.category === 'hotels' && (
              <>
                <h3 className="text-2xl font-bold text-brand-navy mb-4">Hotel Details</h3>

                <div>
                  <label htmlFor="distanceFromAirport" className="block text-sm font-semibold text-gray-700 mb-2">
                    Distance from Airport *
                  </label>
                  <select
                    id="distanceFromAirport"
                    name="distanceFromAirport"
                    required
                    value={formData.distanceFromAirport}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue text-brand-navy"
                  >
                    <option value="">Select distance</option>
                    <option value="walking">Walking Distance</option>
                    <option value="under-5">Under 5 Minutes</option>
                    <option value="5-15">5-15 Minutes</option>
                    <option value="over-15">Over 15 Minutes</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="roomLocationRecommendation" className="block text-sm font-semibold text-gray-700 mb-2">
                    Room Location Recommendation
                  </label>
                  <textarea
                    id="roomLocationRecommendation"
                    name="roomLocationRecommendation"
                    rows={3}
                    placeholder="e.g., Upper floors quieter, avoid rooms near elevator, request courtyard view"
                    value={formData.roomLocationRecommendation}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue text-brand-navy"
                  />
                </div>

                <div>
                  <label htmlFor="distanceToRestaurants" className="block text-sm font-semibold text-gray-700 mb-2">
                    Distance to Restaurants
                  </label>
                  <select
                    id="distanceToRestaurants"
                    name="distanceToRestaurants"
                    value={formData.distanceToRestaurants}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue text-brand-navy"
                  >
                    <option value="">Select distance</option>
                    <option value="walking">Walking Distance</option>
                    <option value="5-15">5-15 Minute Drive</option>
                    <option value="over-15">Over 15 Minute Drive</option>
                  </select>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="shuttleService"
                    name="shuttleService"
                    checked={formData.shuttleService}
                    onChange={handleChange}
                    className="w-5 h-5 text-brand-blue border-gray-300 rounded focus:ring-brand-blue"
                  />
                  <label htmlFor="shuttleService" className="ml-3 text-sm font-semibold text-gray-700">
                    Shuttle Service Available
                  </label>
                </div>

                <div>
                  <label htmlFor="parkingSituation" className="block text-sm font-semibold text-gray-700 mb-2">
                    Parking Situation
                  </label>
                  <select
                    id="parkingSituation"
                    name="parkingSituation"
                    value={formData.parkingSituation}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue text-brand-navy"
                  >
                    <option value="">Select parking situation</option>
                    <option value="not-sure">Not Sure / Used Rideshare or Shuttle</option>
                    <option value="free-easy">Free & Easy</option>
                    <option value="free-tight">Free & Tight</option>
                    <option value="paid-self">Paid Self-Parking Only</option>
                    <option value="paid-valet">Paid Valet Only</option>
                    <option value="free-paid-options">Free & Paid Options Available</option>
                    <option value="street-only">Street Only</option>
                  </select>
                </div>

                <StarRating
                  value={formData.checkinExperience}
                  onChange={(value) => setFormData(prev => ({ ...prev, checkinExperience: value }))}
                  label="Check-In Experience"
                  required={true}
                />

                <div>
                  <label htmlFor="staffResponsiveness" className="block text-sm font-semibold text-gray-700 mb-2">
                    Staff Responsiveness (to noise complaints/requests) *
                  </label>
                  <select
                    id="staffResponsiveness"
                    name="staffResponsiveness"
                    required
                    value={formData.staffResponsiveness}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue text-brand-navy"
                  >
                    <option value="">Select responsiveness</option>
                    <option value="na">N/A</option>
                    <option value="unresponsive">Unresponsive</option>
                    <option value="slow">Slow</option>
                    <option value="adequate">Adequate</option>
                    <option value="responsive">Responsive</option>
                    <option value="very-responsive">Very Responsive</option>
                  </select>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="crewRecognition"
                    name="crewRecognition"
                    checked={formData.crewRecognition}
                    onChange={handleChange}
                    className="w-5 h-5 text-brand-blue border-gray-300 rounded focus:ring-brand-blue"
                  />
                  <label htmlFor="crewRecognition" className="ml-3 text-sm font-semibold text-gray-700">
                    Crew Recognition (crew rates, special treatment)
                  </label>
                </div>

                <StarRating
                  value={formData.roomCleanliness}
                  onChange={(value) => setFormData(prev => ({ ...prev, roomCleanliness: value }))}
                  label="Room Cleanliness"
                  required={true}
                />

                <StarRating
                  value={formData.bedQuality}
                  onChange={(value) => setFormData(prev => ({ ...prev, bedQuality: value }))}
                  label="Bed/Sleep Quality"
                  required={true}
                />

                <div>
                  <label htmlFor="noiseLevel" className="block text-sm font-semibold text-gray-700 mb-2">
                    Noise Level *
                  </label>
                  <select
                    id="noiseLevel"
                    name="noiseLevel"
                    required
                    value={formData.noiseLevel}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue text-brand-navy"
                  >
                    <option value="">Select noise level</option>
                    <option value="silent">Silent</option>
                    <option value="very-quiet">Very Quiet</option>
                    <option value="quiet">Quiet</option>
                    <option value="moderate">Moderate</option>
                    <option value="noisy">Noisy</option>
                    <option value="very-noisy">Very Noisy</option>
                  </select>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="blackoutCurtains"
                    name="blackoutCurtains"
                    checked={formData.blackoutCurtains}
                    onChange={handleChange}
                    className="w-5 h-5 text-brand-blue border-gray-300 rounded focus:ring-brand-blue"
                  />
                  <label htmlFor="blackoutCurtains" className="ml-3 text-sm font-semibold text-gray-700">
                    Blackout Curtains Available
                  </label>
                </div>

                {formData.blackoutCurtains && (
                  <StarRating
                    value={formData.blackoutEffectiveness}
                    onChange={(value) => setFormData(prev => ({ ...prev, blackoutEffectiveness: value }))}
                    label="Blackout Curtain Effectiveness"
                    required={true}
                  />
                )}

                <StarRating
                  value={formData.showerQuality}
                  onChange={(value) => setFormData(prev => ({ ...prev, showerQuality: value }))}
                  label="Shower Quality"
                  required={true}
                />

                <div>
                  <label htmlFor="roomTemperatureControl" className="block text-sm font-semibold text-gray-700 mb-2">
                    Room Temperature Control
                  </label>
                  <select
                    id="roomTemperatureControl"
                    name="roomTemperatureControl"
                    value={formData.roomTemperatureControl}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue text-brand-navy"
                  >
                    <option value="">Select quality</option>
                    <option value="poor">Poor</option>
                    <option value="fair">Fair</option>
                    <option value="good">Good</option>
                    <option value="excellent">Excellent</option>
                  </select>
                </div>

                <StarRating
                  value={formData.wifiQuality}
                  onChange={(value) => setFormData(prev => ({ ...prev, wifiQuality: value }))}
                  label="Wi-Fi Quality"
                  required={true}
                />

                <div>
                  <label htmlFor="breakfast" className="block text-sm font-semibold text-gray-700 mb-2">
                    Breakfast Quality
                  </label>
                  <select
                    id="breakfast"
                    name="breakfast"
                    value={formData.breakfast}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue text-brand-navy"
                  >
                    <option value="">Select option</option>
                    <option value="not-sure">Not Sure / Didn't Use</option>
                    <option value="not-available">Not Available</option>
                    <option value="included">Included in Rate</option>
                    <option value="purchase">Available for Purchase</option>
                    <option value="complimentary-continental">Complimentary Continental</option>
                  </select>
                </div>

                {formData.breakfast && formData.breakfast !== 'not-available' && (
                  <div>
                    <label htmlFor="breakfastStartTime" className="block text-sm font-semibold text-gray-700 mb-2">
                      Breakfast Start Time
                    </label>
                    <input
                      type="text"
                      id="breakfastStartTime"
                      name="breakfastStartTime"
                      placeholder="e.g., Weekday: 6am, Weekend: 7am"
                      value={formData.breakfastStartTime}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue text-brand-navy"
                    />
                  </div>
                )}

                <div>
                  <label htmlFor="laundryAvailable" className="block text-sm font-semibold text-gray-700 mb-2">
                    Self-Service Laundry Available
                  </label>
                  <select
                    id="laundryAvailable"
                    name="laundryAvailable"
                    value={formData.laundryAvailable}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue text-brand-navy"
                  >
                    <option value="">Select laundry option</option>
                    <option value="not-sure">Not Sure</option>
                    <option value="in-room">In-Room</option>
                    <option value="free-onsite">Free On-Site</option>
                    <option value="paid-onsite">Paid On-Site</option>
                    <option value="nearby">Nearby</option>
                    <option value="none">None</option>
                  </select>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="dryCleaningAvailable"
                    name="dryCleaningAvailable"
                    checked={formData.dryCleaningAvailable}
                    onChange={handleChange}
                    className="w-5 h-5 text-brand-blue border-gray-300 rounded focus:ring-brand-blue"
                  />
                  <label htmlFor="dryCleaningAvailable" className="ml-3 text-sm font-semibold text-gray-700">
                    Dry-Cleaning Available
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="fitnessCenter"
                    name="fitnessCenter"
                    checked={formData.fitnessCenter}
                    onChange={handleChange}
                    className="w-5 h-5 text-brand-blue border-gray-300 rounded focus:ring-brand-blue"
                  />
                  <label htmlFor="fitnessCenter" className="ml-3 text-sm font-semibold text-gray-700">
                    Fitness Center Available
                  </label>
                </div>

                <div>
                  <label htmlFor="inRoomCoffee" className="block text-sm font-semibold text-gray-700 mb-2">
                    In-Room Coffee
                  </label>
                  <select
                    id="inRoomCoffee"
                    name="inRoomCoffee"
                    value={formData.inRoomCoffee}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue text-brand-navy"
                  >
                    <option value="">Select option</option>
                    <option value="single-cup">Single-Cup Machine</option>
                    <option value="multi-cup">Multi-Cup Machine</option>
                    <option value="none">None</option>
                  </select>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="inRoomMicrowave"
                    name="inRoomMicrowave"
                    checked={formData.inRoomMicrowave}
                    onChange={handleChange}
                    className="w-5 h-5 text-brand-blue border-gray-300 rounded focus:ring-brand-blue"
                  />
                  <label htmlFor="inRoomMicrowave" className="ml-3 text-sm font-semibold text-gray-700">
                    In-Room Microwave
                  </label>
                </div>
              </>
            )}

            {/* FBO-SPECIFIC FIELDS */}
            {formData.category === 'fbos' && (
              <>
                <h3 className="text-2xl font-bold text-brand-navy mb-4">FBO Details</h3>

                <StarRating
                  value={formData.serviceSpeed}
                  onChange={(value) => setFormData(prev => ({ ...prev, serviceSpeed: value }))}
                  label="Service Speed"
                  required={true}
                />

                <div>
                  <label htmlFor="lateNightServiceSpeed" className="block text-sm font-semibold text-gray-700 mb-2">
                    Late-Night Service Speed
                  </label>
                  <select
                    id="lateNightServiceSpeed"
                    name="lateNightServiceSpeed"
                    value={formData.lateNightServiceSpeed}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue text-brand-navy"
                  >
                    <option value="">Select speed</option>
                    <option value="fast">Fast</option>
                    <option value="average">Average</option>
                    <option value="slow">Slow</option>
                    <option value="na">N/A</option>
                  </select>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="twentyfourSevenService"
                    name="twentyfourSevenService"
                    checked={formData.twentyfourSevenService}
                    onChange={handleChange}
                    className="w-5 h-5 text-brand-blue border-gray-300 rounded focus:ring-brand-blue"
                  />
                  <label htmlFor="twentyfourSevenService" className="ml-3 text-sm font-semibold text-gray-700">
                    24/7 Service Available
                  </label>
                </div>

                <StarRating
                  value={formData.staffAttitude}
                  onChange={(value) => setFormData(prev => ({ ...prev, staffAttitude: value }))}
                  label="Staff Attitude"
                  required={true}
                />

                <StarRating
                  value={formData.communication}
                  onChange={(value) => setFormData(prev => ({ ...prev, communication: value }))}
                  label="Communication"
                  required={true}
                />

                <div>
                  <label htmlFor="passengerCrewFocus" className="block text-sm font-semibold text-gray-700 mb-2">
                    Passenger vs Crew Focus *
                  </label>
                  <select
                    id="passengerCrewFocus"
                    name="passengerCrewFocus"
                    required
                    value={formData.passengerCrewFocus}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue text-brand-navy"
                  >
                    <option value="">Select focus</option>
                    <option value="crew-focused">Crew-Focused</option>
                    <option value="crew-friendly">Crew-Friendly</option>
                    <option value="balanced">Balanced</option>
                    <option value="passenger-focused">Passenger-Focused</option>
                    <option value="crew-overlooked">Crew-Overlooked</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="fuelPricing" className="block text-sm font-semibold text-gray-700 mb-2">
                    Fuel Pricing
                  </label>
                  <select
                    id="fuelPricing"
                    name="fuelPricing"
                    value={formData.fuelPricing}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue text-brand-navy"
                  >
                    <option value="">Select fuel pricing</option>
                    <option value="not-sure">Not Sure</option>
                    <option value="significantly-below">Significantly Below Average</option>
                    <option value="below">Below Average</option>
                    <option value="average">Average</option>
                    <option value="above">Above Average</option>
                    <option value="significantly-above">Significantly Above Average</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="parkingRampSpace" className="block text-sm font-semibold text-gray-700 mb-2">
                    Parking/Ramp Space *
                  </label>
                  <select
                    id="parkingRampSpace"
                    name="parkingRampSpace"
                    required
                    value={formData.parkingRampSpace}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue text-brand-navy"
                  >
                    <option value="">Select ramp space</option>
                    <option value="excellent">Excellent</option>
                    <option value="good">Good</option>
                    <option value="tight">Tight</option>
                    <option value="limited">Limited</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="hangarAvailability" className="block text-sm font-semibold text-gray-700 mb-2">
                    Hangar Availability
                  </label>
                  <select
                    id="hangarAvailability"
                    name="hangarAvailability"
                    value={formData.hangarAvailability}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue text-brand-navy"
                  >
                    <option value="">Select availability</option>
                    <option value="yes-easy">Yes - Easy</option>
                    <option value="yes-limited">Yes - Limited</option>
                    <option value="no">No</option>
                    <option value="na">N/A</option>
                  </select>
                </div>

                <StarRating
                  value={formData.crewLoungeQuality}
                  onChange={(value) => setFormData(prev => ({ ...prev, crewLoungeQuality: value }))}
                  label="Crew Lounge Quality"
                  required={false}
                />
                <p className="text-xs text-gray-500 -mt-4 mb-4">Leave unrated if you didn't use or not sure</p>

                <div>
                  <label htmlFor="crewCarAvailability" className="block text-sm font-semibold text-gray-700 mb-2">
                    Crew Car Availability
                  </label>
                  <select
                    id="crewCarAvailability"
                    name="crewCarAvailability"
                    value={formData.crewCarAvailability}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue text-brand-navy"
                  >
                    <option value="">Select availability</option>
                    <option value="not-sure">Not Sure / Didn't Use</option>
                    <option value="always">Always Available</option>
                    <option value="usually">Usually Available</option>
                    <option value="limited">Limited</option>
                    <option value="none">None</option>
                  </select>
                </div>

                <StarRating
                  value={formData.bathroomQuality}
                  onChange={(value) => setFormData(prev => ({ ...prev, bathroomQuality: value }))}
                  label="Bathroom Quality"
                  required={false}
                />

                <StarRating
                  value={formData.fboAmenitiesQuality}
                  onChange={(value) => setFormData(prev => ({ ...prev, fboAmenitiesQuality: value }))}
                  label="FBO Amenities Quality"
                  required={false}
                />

                <StarRating
                  value={formData.fboWifiQuality}
                  onChange={(value) => setFormData(prev => ({ ...prev, fboWifiQuality: value }))}
                  label="Wi-Fi Quality"
                  required={false}
                />

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="cateringAvailable"
                    name="cateringAvailable"
                    checked={formData.cateringAvailable}
                    onChange={handleChange}
                    className="w-5 h-5 text-brand-blue border-gray-300 rounded focus:ring-brand-blue"
                  />
                  <label htmlFor="cateringAvailable" className="ml-3 text-sm font-semibold text-gray-700">
                    Catering Available
                  </label>
                </div>
              </>
            )}

            {/* RESTAURANT-SPECIFIC FIELDS */}
            {formData.category === 'restaurants' && (
              <>
                <h3 className="text-2xl font-bold text-brand-navy mb-4">Restaurant Details</h3>

                <div>
                  <label htmlFor="restaurantDistanceFromAirport" className="block text-sm font-semibold text-gray-700 mb-2">
                    Distance from Airport *
                  </label>
                  <select
                    id="restaurantDistanceFromAirport"
                    name="restaurantDistanceFromAirport"
                    required
                    value={formData.restaurantDistanceFromAirport}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue text-brand-navy"
                  >
                    <option value="">Select distance</option>
                    <option value="walking">Walking Distance</option>
                    <option value="under-5">Under 5 Minutes</option>
                    <option value="5-15">5-15 Minutes</option>
                    <option value="over-15">Over 15 Minutes</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="hoursOfOperation" className="block text-sm font-semibold text-gray-700 mb-2">
                    Hours of Operation *
                  </label>
                  <select
                    id="hoursOfOperation"
                    name="hoursOfOperation"
                    required
                    value={formData.hoursOfOperation}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue text-brand-navy"
                  >
                    <option value="">Select hours</option>
                    <option value="24-hours">24 Hours</option>
                    <option value="late-night">Late Night (after 9pm)</option>
                    <option value="early-morning">Early Morning (before 7am)</option>
                    <option value="standard">Standard</option>
                  </select>
                </div>

                <StarRating
                  value={formData.foodQuality}
                  onChange={(value) => setFormData(prev => ({ ...prev, foodQuality: value }))}
                  label="Food Quality"
                  required={true}
                />

                <StarRating
                  value={formData.restaurantServiceSpeed}
                  onChange={(value) => setFormData(prev => ({ ...prev, restaurantServiceSpeed: value }))}
                  label="Service Speed"
                  required={true}
                />

                <div>
                  <label htmlFor="portionSize" className="block text-sm font-semibold text-gray-700 mb-2">
                    Portion Size *
                  </label>
                  <select
                    id="portionSize"
                    name="portionSize"
                    required
                    value={formData.portionSize}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue text-brand-navy"
                  >
                    <option value="">Select portion size</option>
                    <option value="small">Small</option>
                    <option value="modest">Modest</option>
                    <option value="adequate">Adequate</option>
                    <option value="generous">Generous</option>
                    <option value="very-generous">Very Generous</option>
                  </select>
                </div>

                <PriceRating
                  value={formData.pricePoint}
                  onChange={(value) => setFormData(prev => ({ ...prev, pricePoint: value }))}
                  label="Price Point"
                />

                {/* Takeout/Delivery Checkbox */}
                <div className="bg-brand-blue/5 border border-brand-blue/20 rounded-lg p-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="wasTakeoutDelivery"
                      name="wasTakeoutDelivery"
                      checked={formData.wasTakeoutDelivery}
                      onChange={(e) => {
                        const isChecked = e.target.checked
                        setFormData(prev => ({
                          ...prev,
                          wasTakeoutDelivery: isChecked,
                          atmosphere: isChecked ? '' : prev.atmosphere // Clear atmosphere if takeout
                        }))
                      }}
                      className="w-5 h-5 text-brand-blue border-gray-300 rounded focus:ring-brand-blue"
                    />
                    <label htmlFor="wasTakeoutDelivery" className="ml-3 text-sm font-semibold text-gray-700">
                      Takeout/Delivery Order
                    </label>
                  </div>
                  {formData.wasTakeoutDelivery && (
                    <p className="text-sm text-brand-blue mt-2 ml-8">
                      Atmosphere rating not applicable for takeout/delivery
                    </p>
                  )}
                </div>

                {/* Atmosphere - only shown if not takeout/delivery */}
                {!formData.wasTakeoutDelivery && (
                  <div>
                    <label htmlFor="atmosphere" className="block text-sm font-semibold text-gray-700 mb-2">
                      Atmosphere
                    </label>
                    <select
                      id="atmosphere"
                      name="atmosphere"
                      value={formData.atmosphere}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue text-brand-navy"
                    >
                      <option value="">Select atmosphere</option>
                      <option value="quiet">Quiet</option>
                      <option value="conversational">Conversational</option>
                      <option value="lively">Lively</option>
                      <option value="loud">Loud</option>
                      <option value="very-loud">Very Loud</option>
                    </select>
                  </div>
                )}

                <StarRating
                  value={formData.takeoutQuality}
                  onChange={(value) => setFormData(prev => ({ ...prev, takeoutQuality: value }))}
                  label="Takeout Quality"
                />

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="restaurantWifiAvailable"
                    name="restaurantWifiAvailable"
                    checked={formData.restaurantWifiAvailable}
                    onChange={handleChange}
                    className="w-5 h-5 text-brand-blue border-gray-300 rounded focus:ring-brand-blue"
                  />
                  <label htmlFor="restaurantWifiAvailable" className="ml-3 text-sm font-semibold text-gray-700">
                    Wi-Fi Available
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="healthyOptions"
                    name="healthyOptions"
                    checked={formData.healthyOptions}
                    onChange={handleChange}
                    className="w-5 h-5 text-brand-blue border-gray-300 rounded focus:ring-brand-blue"
                  />
                  <label htmlFor="healthyOptions" className="ml-3 text-sm font-semibold text-gray-700">
                    Healthy Options Available
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="vegetarianOptions"
                    name="vegetarianOptions"
                    checked={formData.vegetarianOptions}
                    onChange={handleChange}
                    className="w-5 h-5 text-brand-blue border-gray-300 rounded focus:ring-brand-blue"
                  />
                  <label htmlFor="vegetarianOptions" className="ml-3 text-sm font-semibold text-gray-700">
                    Vegetarian Options Available
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="veganOptions"
                    name="veganOptions"
                    checked={formData.veganOptions}
                    onChange={handleChange}
                    className="w-5 h-5 text-brand-blue border-gray-300 rounded focus:ring-brand-blue"
                  />
                  <label htmlFor="veganOptions" className="ml-3 text-sm font-semibold text-gray-700">
                    Vegan Options Available
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="glutenFreeOptions"
                    name="glutenFreeOptions"
                    checked={formData.glutenFreeOptions}
                    onChange={handleChange}
                    className="w-5 h-5 text-brand-blue border-gray-300 rounded focus:ring-brand-blue"
                  />
                  <label htmlFor="glutenFreeOptions" className="ml-3 text-sm font-semibold text-gray-700">
                    Gluten-Free Options Available
                  </label>
                </div>
              </>
            )}

            {/* CAR RENTAL-SPECIFIC FIELDS */}
            {formData.category === 'rentals' && (
              <>
                <h3 className="text-2xl font-bold text-brand-navy mb-4">Car Rental Details</h3>

                <div>
                  <label htmlFor="rentalLocation" className="block text-sm font-semibold text-gray-700 mb-2">
                    Rental Location *
                  </label>
                  <select
                    id="rentalLocation"
                    name="rentalLocation"
                    required
                    value={formData.rentalLocation}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue text-brand-navy"
                  >
                    <option value="">Select location</option>
                    <option value="on-airport">On-Airport</option>
                    <option value="shuttle-required">Shuttle Required</option>
                    <option value="off-airport">Off-Airport</option>
                  </select>
                </div>

                <StarRating
                  value={formData.rentalProcessSpeed}
                  onChange={(value) => setFormData(prev => ({ ...prev, rentalProcessSpeed: value }))}
                  label="Rental Process Speed"
                  required={true}
                />

                <StarRating
                  value={formData.staffHelpfulness}
                  onChange={(value) => setFormData(prev => ({ ...prev, staffHelpfulness: value }))}
                  label="Staff Helpfulness"
                  required={true}
                />

                <div>
                  <label htmlFor="upsellPressure" className="block text-sm font-semibold text-gray-700 mb-2">
                    Upsell Pressure *
                  </label>
                  <select
                    id="upsellPressure"
                    name="upsellPressure"
                    required
                    value={formData.upsellPressure}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue text-brand-navy"
                  >
                    <option value="">Select upsell pressure</option>
                    <option value="none">None</option>
                    <option value="minimal">Minimal</option>
                    <option value="moderate">Moderate</option>
                    <option value="aggressive">Aggressive</option>
                    <option value="excessive">Excessive</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="pricingTransparency" className="block text-sm font-semibold text-gray-700 mb-2">
                    Pricing Transparency *
                  </label>
                  <select
                    id="pricingTransparency"
                    name="pricingTransparency"
                    required
                    value={formData.pricingTransparency}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue text-brand-navy"
                  >
                    <option value="">Select transparency</option>
                    <option value="poor">Poor</option>
                    <option value="fair">Fair</option>
                    <option value="good">Good</option>
                    <option value="excellent">Excellent</option>
                  </select>
                </div>

                <StarRating
                  value={formData.vehicleCondition}
                  onChange={(value) => setFormData(prev => ({ ...prev, vehicleCondition: value }))}
                  label="Vehicle Condition"
                  required={true}
                />

                <StarRating
                  value={formData.returnFlexibility}
                  onChange={(value) => setFormData(prev => ({ ...prev, returnFlexibility: value }))}
                  label="Return Flexibility"
                  required={true}
                />

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="afterHoursAccess"
                    name="afterHoursAccess"
                    checked={formData.afterHoursAccess}
                    onChange={handleChange}
                    className="w-5 h-5 text-brand-blue border-gray-300 rounded focus:ring-brand-blue"
                  />
                  <label htmlFor="afterHoursAccess" className="ml-3 text-sm font-semibold text-gray-700">
                    After-Hours Access Available
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="fboDelivery"
                    name="fboDelivery"
                    checked={formData.fboDelivery}
                    onChange={handleChange}
                    className="w-5 h-5 text-brand-blue border-gray-300 rounded focus:ring-brand-blue"
                  />
                  <label htmlFor="fboDelivery" className="ml-3 text-sm font-semibold text-gray-700">
                    FBO Delivery Available
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="crewRatesAvailable"
                    name="crewRatesAvailable"
                    checked={formData.crewRatesAvailable}
                    onChange={handleChange}
                    className="w-5 h-5 text-brand-blue border-gray-300 rounded focus:ring-brand-blue"
                  />
                  <label htmlFor="crewRatesAvailable" className="ml-3 text-sm font-semibold text-gray-700">
                    Crew Rates Available
                  </label>
                </div>
              </>
            )}

            <hr className="my-8 border-gray-200" />

            {/* Review Text */}
            <div>
              <label htmlFor="reviewText" className="block text-sm font-semibold text-gray-700 mb-2">
                Your Review *
              </label>
              <textarea
                id="reviewText"
                name="reviewText"
                required
                rows={6}
                placeholder="Share your experience with fellow crew members. What made this location great (or not)? Any crew-specific tips?"
                value={formData.reviewText}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue text-brand-navy"
              />
              <p className="text-sm text-gray-500 mt-2">
                Minimum 50 characters ({formData.reviewText.length}/50)
              </p>
            </div>

            {/* Photo Upload */}
            <PhotoUpload
              photos={selectedPhotos}
              onPhotosChange={setSelectedPhotos}
              disabled={isSubmitting || uploadingPhotos}
            />

            {/* Upload Progress */}
            {uploadingPhotos && uploadProgress && (
              <div className="flex items-center gap-3 text-brand-blue">
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="text-sm">{uploadProgress}</span>
              </div>
            )}

            {/* Error Message */}
            {submitError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="font-medium">{submitError}</p>
                </div>
              </div>
            )}

            {/* Success Message */}
            {submitSuccess && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-start gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="font-medium">Review submitted successfully!</p>
                  <p className="text-sm">Redirecting you now...</p>
                </div>
              </div>
            )}

            {/* Submit Buttons */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={isSubmitting || uploadingPhotos || submitSuccess || formData.reviewText.length < 50 || !formData.category || !formData.locationName || !formData.overallRating}
                className="flex-1 bg-brand-navy text-white px-6 py-3 rounded-lg font-semibold hover:bg-brand-navy/90 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </>
                ) : submitSuccess ? (
                  'Submitted!'
                ) : (
                  'Submit Review'
                )}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                disabled={isSubmitting}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default function AddLocationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 py-8 px-4 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-brand-navy border-t-transparent rounded-full"></div>
      </div>
    }>
      <AddLocationForm />
    </Suspense>
  )
}
