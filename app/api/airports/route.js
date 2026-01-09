import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')?.toUpperCase() || ''
  
  try {
    const filePath = path.join(process.cwd(), 'public', 'data', 'airports.json')
    const fileContents = fs.readFileSync(filePath, 'utf8')
    const airports = JSON.parse(fileContents)
    
    if (!query) {
      return NextResponse.json(airports.slice(0, 10)) // Return first 10 if no query
    }
    
    // Search by code, city, or name
    const filtered = airports.filter(airport => 
      airport.code.includes(query) ||
      airport.city.toUpperCase().includes(query) ||
      airport.name.toUpperCase().includes(query)
    )
    
    return NextResponse.json(filtered.slice(0, 10)) // Return top 10 matches
  } catch (error) {
    console.error('Error loading airports:', error)
    return NextResponse.json([])
  }
}
