import { put, list, del } from '@vercel/blob'
import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const newFBO = await request.json()
    
    newFBO.id = Date.now().toString()
    newFBO.createdAt = new Date().toISOString()
    
    let fbos = []
    let oldBlobUrl = null
    
    try {
      const { blobs } = await list()
      const fbosBlob = blobs.find(b => b.pathname === 'fbos.json')
      if (fbosBlob) {
        oldBlobUrl = fbosBlob.url
        const response = await fetch(fbosBlob.url)
        fbos = await response.json()
      }
    } catch (error) {
      console.log('No existing FBOs file')
    }
    
    fbos.push(newFBO)
    
    if (oldBlobUrl) {
      await del(oldBlobUrl)
    }
    
    await put('fbos.json', JSON.stringify(fbos, null, 2), {
      access: 'public',
      contentType: 'application/json',
    })
    
    return NextResponse.json({ success: true, fbo: newFBO })
  } catch (error) {
    console.error('Error saving FBO:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
