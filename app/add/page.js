'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AddLocationPage() {
  const router = useRouter()
  const [category, setCategory] = useState('hotel')
  const [formData, setFormData] = useState({
    // Common fields
    name: '',
    city: '',
    state: '',
    rating: '',
    
    // Hotel-specific
    has24HourCheckin: false,
    hasBlackoutCurtains: false,
    noiseLevel: 'Quiet',
    
    // FBO-specific
    airport: '',
    hasCrewLounge: false,
    hasSnoozeRoom: false,
    bathroomQuality: 'Good',
    
    // Restaurant-specific
    cuisine: '',
    lateNightService: false,
    easyParking: false,
    hasHealthyOptions: false,
    priceRange: '$$',
    
    // Car Rental-specific
    airportPickup: false,
    afterHoursReturn: false,
    crewDiscounts: false,
    vehicleSelection: 'Good',
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Build the payload with only relevant fields
    let payload = {
      name: formData.name,
      city: formData.city,
      state: formData.state,
      rating: parseFloat(formData.rating)
    }
    
    if (category === 'hotel') {
      payload = {
        ...payload,
        has24HourCheckin: formData.has24HourCheckin,
        hasBlackoutCurtains: formData.hasBlackoutCurtains,
        noiseLevel: formData.noiseLevel
      }
    } else if (category === 'fbo') {
      payload = {
        ...payload,
        airport: formData.airport,
        hasCrewLounge: formData.hasCrewLounge,
        hasSnoozeRoom: formData.hasSnoozeRoom,
        bathroomQuality: formData.bathroomQuality
      }
    } else if (category === 'restaurant') {
      payload = {
        ...payload,
        cuisine: formData.cuisine,
        lateNightService: formData.lateNightService,
        easyParking: formData.easyParking,
        hasHealthyOptions: formData.hasHealthyOptions,
        priceRange: formData.priceRange
      }
    } else if (category === 'rental') {
      payload = {
        ...payload,
        airportPickup: formData.airportPickup,
        afterHoursReturn: formData.afterHoursReturn,
        crewDiscounts: formData.crewDiscounts,
        vehicleSelection: formData.vehicleSelection
      }
    }
    
    try {
      const response = await fetch(`/api/${category}s/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      
      if (response.ok) {
        alert(`${category.charAt(0).toUpperCase() + category.slice(1)} saved successfully!`)
        // Force refresh and navigate
        router.refresh()
        setTimeout(() => {
          router.push(`/${category}s`)
        }, 100)
      } else {
        alert(`Error saving ${category}`)
      }
    } catch (error) {
      alert('Error: ' + error.message)
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-blue-600 mb-8">Add Location</h1>
        
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
          {/* Category Selector */}
          <div>
            <label className="block text-sm font-medium mb-2">Category</label>
            <select
              className="w-full border rounded p-2 text-lg font-semibold"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="hotel">Hotel</option>
              <option value="fbo">FBO</option>
              <option value="restaurant">Restaurant</option>
              <option value="rental">Car Rental</option>
            </select>
          </div>

          {/* Common Fields */}
          <div>
            <label className="block text-sm font-medium mb-2">
              {category === 'hotel' ? 'Hotel' : category === 'fbo' ? 'FBO' : category === 'restaurant' ? 'Restaurant' : 'Car Rental Company'} Name
            </label>
            <input
              type="text"
              required
              className="w-full border rounded p-2"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>

          {/* FBO Airport Code */}
          {category === 'fbo' && (
            <div>
              <label className="block text-sm font-medium mb-2">Airport Code (e.g., DFW)</label>
              <input
                type="text"
                required
                maxLength="4"
                className="w-full border rounded p-2"
                value={formData.airport}
                onChange={(e) => setFormData({...formData, airport: e.target.value.toUpperCase()})}
              />
            </div>
          )}

          {/* Restaurant Cuisine */}
          {category === 'restaurant' && (
            <div>
              <label className="block text-sm font-medium mb-2">Cuisine Type</label>
              <input
                type="text"
                required
                placeholder="e.g., Italian, Mexican, American"
                className="w-full border rounded p-2"
                value={formData.cuisine}
                onChange={(e) => setFormData({...formData, cuisine: e.target.value})}
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">City</label>
              <input
                type="text"
                required
                className="w-full border rounded p-2"
                value={formData.city}
                onChange={(e) => setFormData({...formData, city: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">State</label>
              <input
                type="text"
                required
                maxLength="2"
                className="w-full border rounded p-2"
                value={formData.state}
                onChange={(e) => setFormData({...formData, state: e.target.value.toUpperCase()})}
              />
            </div>
          </div>

          <div>
  <label className="block text-sm font-medium mb-2">Rating</label>
  <div className="flex gap-2">
    {[1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        type="button"
        onClick={() => setFormData({...formData, rating: star.toString()})}
        onMouseEnter={(e) => {
          // Highlight this star and all before it on hover
          const buttons = e.currentTarget.parentElement.querySelectorAll('button');
          buttons.forEach((btn, idx) => {
            if (idx < star) {
              btn.style.color = '#93c5fd'; // Light blue on hover
            } else {
              btn.style.color = parseFloat(formData.rating) > idx ? '#2563eb' : '#d1d5db'; // Keep selected or gray
            }
          });
        }}
        onMouseLeave={(e) => {
          // Reset to actual rating when not hovering
          const buttons = e.currentTarget.parentElement.querySelectorAll('button');
          buttons.forEach((btn, idx) => {
            btn.style.color = parseFloat(formData.rating) > idx ? '#2563eb' : '#d1d5db';
          });
        }}
        className="text-4xl transition-colors"
        style={{ color: parseFloat(formData.rating) >= star ? '#2563eb' : '#d1d5db' }}
      >
        ★
      </button>
    ))}
    <span className="ml-2 text-gray-600 self-center">({formData.rating}/5)</span>
  </div>
</div>


          {/* Hotel-Specific Fields */}
          {category === 'hotel' && (
            <>
              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.has24HourCheckin}
                    onChange={(e) => setFormData({...formData, has24HourCheckin: e.target.checked})}
                  />
                  <span>24-Hour Check-in Available</span>
                </label>
              </div>

              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.hasBlackoutCurtains}
                    onChange={(e) => setFormData({...formData, hasBlackoutCurtains: e.target.checked})}
                  />
                  <span>Blackout Curtains</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Noise Level</label>
                <select
                  className="w-full border rounded p-2"
                  value={formData.noiseLevel}
                  onChange={(e) => setFormData({...formData, noiseLevel: e.target.value})}
                >
                  <option>Quiet</option>
                  <option>Moderate</option>
                  <option>Loud</option>
                </select>
              </div>
            </>
          )}

          {/* FBO-Specific Fields */}
          {category === 'fbo' && (
            <>
              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.hasCrewLounge}
                    onChange={(e) => setFormData({...formData, hasCrewLounge: e.target.checked})}
                  />
                  <span>Crew Lounge Available</span>
                </label>
              </div>

              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.hasSnoozeRoom}
                    onChange={(e) => setFormData({...formData, hasSnoozeRoom: e.target.checked})}
                  />
                  <span>Snooze Room Available</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Bathroom Quality</label>
                <select
                  className="w-full border rounded p-2"
                  value={formData.bathroomQuality}
                  onChange={(e) => setFormData({...formData, bathroomQuality: e.target.value})}
                >
                  <option>Excellent</option>
                  <option>Good</option>
                  <option>Fair</option>
                  <option>Poor</option>
                </select>
              </div>
            </>
          )}

          {/* Restaurant-Specific Fields */}
          {category === 'restaurant' && (
            <>
              <div>
                <label className="block text-sm font-medium mb-2">Price Range</label>
                <select
                  className="w-full border rounded p-2"
                  value={formData.priceRange}
                  onChange={(e) => setFormData({...formData, priceRange: e.target.value})}
                >
                  <option value="$">$ - Budget</option>
                  <option value="$$">$$ - Moderate</option>
                  <option value="$$$">$$$ - Upscale</option>
                  <option value="$$$$">$$$$ - Fine Dining</option>
                </select>
              </div>

              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.lateNightService}
                    onChange={(e) => setFormData({...formData, lateNightService: e.target.checked})}
                  />
                  <span>Late Night Service (Open past 10pm)</span>
                </label>
              </div>

              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.easyParking}
                    onChange={(e) => setFormData({...formData, easyParking: e.target.checked})}
                  />
                  <span>Easy Parking</span>
                </label>
              </div>

              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.hasHealthyOptions}
                    onChange={(e) => setFormData({...formData, hasHealthyOptions: e.target.checked})}
                  />
                  <span>Healthy Options Available</span>
                </label>
              </div>
            </>
          )}

          {/* Car Rental-Specific Fields */}
          {category === 'rental' && (
            <>
              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.airportPickup}
                    onChange={(e) => setFormData({...formData, airportPickup: e.target.checked})}
                  />
                  <span>Airport Pickup Available</span>
                </label>
              </div>

              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.afterHoursReturn}
                    onChange={(e) => setFormData({...formData, afterHoursReturn: e.target.checked})}
                  />
                  <span>After Hours Return Available</span>
                </label>
              </div>

              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.crewDiscounts}
                    onChange={(e) => setFormData({...formData, crewDiscounts: e.target.checked})}
                  />
                  <span>Crew Discounts Available</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Vehicle Selection</label>
                <select
                  className="w-full border rounded p-2"
                  value={formData.vehicleSelection}
                  onChange={(e) => setFormData({...formData, vehicleSelection: e.target.value})}
                >
                  <option>Excellent</option>
                  <option>Good</option>
                  <option>Fair</option>
                  <option>Limited</option>
                </select>
              </div>
            </>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white rounded py-3 font-semibold hover:bg-blue-700"
          >
            Add {category.charAt(0).toUpperCase() + category.slice(1)}
          </button>
        </form>
      </div>
    </main>
  )
}
