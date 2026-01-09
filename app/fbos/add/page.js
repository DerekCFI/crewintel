'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AddFBOPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    airport: '',
    city: '',
    state: '',
    rating: 5,
    hasCrewLounge: false,
    hasSnoozeRoom: false,
    bathroomQuality: 'Good'
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      const response = await fetch('/api/fbos/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      if (response.ok) {
        alert('FBO saved successfully!')
        router.push('/fbos')
      } else {
        alert('Error saving FBO')
      }
    } catch (error) {
      alert('Error: ' + error.message)
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-blue-600 mb-8">Add FBO</h1>
        
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">FBO Name</label>
            <input
              type="text"
              required
              className="w-full border rounded p-2"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>

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
            <label className="block text-sm font-medium mb-2">Rating (1-5)</label>
            <input
              type="number"
              min="1"
              max="5"
              step="0.5"
              className="w-full border rounded p-2"
              value={formData.rating}
              onChange={(e) => setFormData({...formData, rating: parseFloat(e.target.value)})}
            />
          </div>

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

          <button
            type="submit"
            className="w-full bg-blue-600 text-white rounded py-3 font-semibold hover:bg-blue-700"
          >
            Add FBO
          </button>
        </form>
      </div>
    </main>
  )
}
