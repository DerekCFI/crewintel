import { NextResponse } from 'next/server'
import { isAdmin } from '@/app/lib/admin-auth'

export async function GET() {
  try {
    const authorized = await isAdmin()
    return NextResponse.json({ authenticated: authorized })
  } catch {
    return NextResponse.json({ authenticated: false })
  }
}
