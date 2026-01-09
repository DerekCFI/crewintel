import { list } from '@vercel/blob'
import { NextResponse } from 'next/server'

export async function GET(request, { params }) {
  const { id } = await params
  
  try {
    const { blobs } = await list()
    const fbosBlob = blobs.find(b => b.pathname === 'fbos.json')
    
    if (fbosBlob) {
      const response = await fetch(fbosBlob.url)
      const fbos = await response.json()
      const fbo = fbos.find(f => f.id === id)
      
      if (fbo) {
        return NextResponse.json(fbo)
      }
    }
    
    return NextResponse.json({ error: 'FBO not found' }, { status: 404 })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
