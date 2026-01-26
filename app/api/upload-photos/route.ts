import { NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'
import { auth } from '@clerk/nextjs/server'
import { uploadToCloudinary, deleteFromCloudinary } from '../../lib/cloudinary'
import { notifySlackError } from '../../lib/slack-notify'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const MAX_PHOTOS = 5
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

interface PhotoUpload {
  base64: string
  fileName: string
  fileType: string
  fileSize: number
}

interface UploadedPhoto {
  url: string
  publicId: string
  thumbnailUrl: string
  width: number
  height: number
  displayOrder: number
}

export async function POST(request: Request) {
  const { userId } = await auth()

  try {
    const body = await request.json()
    const { photos, reviewId, category } = body as {
      photos: PhotoUpload[]
      reviewId: number
      category: string
    }

    // Validate required fields
    if (!reviewId) {
      return NextResponse.json(
        { error: 'Review ID is required' },
        { status: 400 }
      )
    }

    if (!category) {
      return NextResponse.json(
        { error: 'Category is required' },
        { status: 400 }
      )
    }

    if (!photos || !Array.isArray(photos) || photos.length === 0) {
      return NextResponse.json(
        { error: 'No photos provided' },
        { status: 400 }
      )
    }

    if (photos.length > MAX_PHOTOS) {
      return NextResponse.json(
        { error: `Maximum ${MAX_PHOTOS} photos allowed per review` },
        { status: 400 }
      )
    }

    // Validate each photo
    for (const photo of photos) {
      if (!ALLOWED_TYPES.includes(photo.fileType)) {
        return NextResponse.json(
          { error: 'Please upload JPG, PNG, or WebP images only' },
          { status: 400 }
        )
      }

      if (photo.fileSize > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: 'Each photo must be under 5MB' },
          { status: 400 }
        )
      }
    }

    const sql = neon(process.env.DATABASE_URL!)

    // Verify the review exists
    const reviewCheck = await sql`
      SELECT id FROM reviews WHERE id = ${reviewId}
    `

    if (reviewCheck.length === 0) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      )
    }

    // Upload photos to Cloudinary and save to database
    const uploadedPhotos: UploadedPhoto[] = []
    const uploadErrors: string[] = []

    for (let i = 0; i < photos.length; i++) {
      const photo = photos[i]

      try {
        // Upload to Cloudinary
        const result = await uploadToCloudinary(photo.base64, category)

        // Save to database
        await sql`
          INSERT INTO review_photos (
            review_id,
            cloudinary_url,
            cloudinary_public_id,
            thumbnail_url,
            display_order,
            width,
            height,
            file_size
          ) VALUES (
            ${reviewId},
            ${result.url},
            ${result.publicId},
            ${result.thumbnailUrl},
            ${i},
            ${result.width},
            ${result.height},
            ${result.bytes}
          )
        `

        uploadedPhotos.push({
          url: result.url,
          publicId: result.publicId,
          thumbnailUrl: result.thumbnailUrl,
          width: result.width,
          height: result.height,
          displayOrder: i,
        })
      } catch (error: any) {
        console.error(`Failed to upload photo ${i + 1}:`, error)
        uploadErrors.push(`Photo ${i + 1}: ${error.message}`)

        // Notify Slack about the upload failure
        await notifySlackError(error as Error, {
          userId: userId || 'unknown',
          component: 'Photo Upload',
          action: 'Cloudinary Upload',
          additionalInfo: {
            fileName: photo.fileName,
            fileSize: photo.fileSize,
            fileType: photo.fileType,
            reviewId: reviewId,
            photoIndex: i + 1,
          }
        })

        // If we've uploaded some photos but failed on others,
        // we should still return partial success
      }
    }

    // If all uploads failed, return error
    if (uploadedPhotos.length === 0 && uploadErrors.length > 0) {
      return NextResponse.json(
        { error: 'Failed to upload photos', details: uploadErrors },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      photos: uploadedPhotos,
      uploadedCount: uploadedPhotos.length,
      errors: uploadErrors.length > 0 ? uploadErrors : undefined,
    })
  } catch (error: any) {
    console.error('Photo upload error:', error)

    // Notify Slack about the general upload error
    await notifySlackError(error as Error, {
      userId: userId || 'unknown',
      component: 'Photo Upload',
      action: 'Process Upload Request',
    })

    return NextResponse.json(
      { error: 'Failed to process photo upload' },
      { status: 500 }
    )
  }
}

// DELETE endpoint to remove a photo
export async function DELETE(request: Request) {
  const { userId } = await auth()
  const { searchParams } = new URL(request.url)
  const photoId = searchParams.get('id')
  const publicId = searchParams.get('publicId')

  try {

    if (!photoId || !publicId) {
      return NextResponse.json(
        { error: 'Photo ID and public ID are required' },
        { status: 400 }
      )
    }

    const sql = neon(process.env.DATABASE_URL!)

    // Delete from Cloudinary
    await deleteFromCloudinary(publicId)

    // Delete from database
    await sql`
      DELETE FROM review_photos WHERE id = ${parseInt(photoId)}
    `

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Photo delete error:', error)

    // Notify Slack about the delete error
    await notifySlackError(error as Error, {
      userId: userId || 'unknown',
      component: 'Photo Upload',
      action: 'Delete Photo',
      additionalInfo: {
        photoId,
        publicId,
      }
    })

    return NextResponse.json(
      { error: 'Failed to delete photo' },
      { status: 500 }
    )
  }
}
