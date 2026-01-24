import { v2 as cloudinary } from 'cloudinary'

// Configure Cloudinary with environment variables
// Note: NEXT_PUBLIC_ prefix makes cloud_name available client-side if needed
// API key and secret are server-only (no NEXT_PUBLIC_ prefix)
const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME
const apiKey = process.env.CLOUDINARY_API_KEY
const apiSecret = process.env.CLOUDINARY_API_SECRET

// Debug logging (remove in production)
if (!cloudName || !apiKey || !apiSecret) {
  console.error('Cloudinary config missing:', {
    cloudName: !!cloudName,
    apiKey: !!apiKey,
    apiSecret: !!apiSecret
  })
}

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
})

export interface UploadResult {
  url: string
  publicId: string
  thumbnailUrl: string
  width: number
  height: number
  bytes: number
}

export interface UploadError {
  message: string
  code?: string
}

/**
 * Upload an image to Cloudinary
 * @param fileBase64 - Base64 encoded image data (with or without data URI prefix)
 * @param category - Category for folder organization (hotels, fbos, restaurants, rentals)
 * @returns Upload result with URLs and metadata
 */
export async function uploadToCloudinary(
  fileBase64: string,
  category: string
): Promise<UploadResult> {
  try {
    // Ensure the base64 string has the data URI prefix
    const base64Data = fileBase64.startsWith('data:')
      ? fileBase64
      : `data:image/jpeg;base64,${fileBase64}`

    const result = await cloudinary.uploader.upload(base64Data, {
      folder: `crewintel/${category}`,
      resource_type: 'image',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      transformation: [
        { quality: 'auto', fetch_format: 'auto' }
      ],
    })

    // Generate thumbnail URL using Cloudinary transformations
    const thumbnailUrl = cloudinary.url(result.public_id, {
      width: 300,
      height: 300,
      crop: 'fill',
      quality: 'auto',
      fetch_format: 'auto',
    })

    return {
      url: result.secure_url,
      publicId: result.public_id,
      thumbnailUrl,
      width: result.width,
      height: result.height,
      bytes: result.bytes,
    }
  } catch (error: any) {
    console.error('Cloudinary upload error:', error)
    throw new Error(error.message || 'Failed to upload image to Cloudinary')
  }
}

/**
 * Delete an image from Cloudinary
 * @param publicId - The Cloudinary public_id of the image to delete
 */
export async function deleteFromCloudinary(publicId: string): Promise<void> {
  try {
    await cloudinary.uploader.destroy(publicId)
  } catch (error: any) {
    console.error('Cloudinary delete error:', error)
    throw new Error(error.message || 'Failed to delete image from Cloudinary')
  }
}

/**
 * Generate optimized image URL with transformations
 * @param publicId - Cloudinary public_id
 * @param options - Transformation options
 */
export function getOptimizedUrl(
  publicId: string,
  options: {
    width?: number
    height?: number
    crop?: string
    quality?: string
  } = {}
): string {
  return cloudinary.url(publicId, {
    width: options.width,
    height: options.height,
    crop: options.crop || 'fill',
    quality: options.quality || 'auto',
    fetch_format: 'auto',
  })
}

/**
 * Generate URLs for different image sizes
 * @param publicId - Cloudinary public_id
 */
export function getImageUrls(publicId: string) {
  return {
    thumbnail: getOptimizedUrl(publicId, { width: 300, height: 300 }),
    medium: getOptimizedUrl(publicId, { width: 800, height: 600 }),
    large: getOptimizedUrl(publicId, { width: 1200, height: 1200, crop: 'limit' }),
    original: cloudinary.url(publicId, { quality: 'auto', fetch_format: 'auto' }),
  }
}

export default cloudinary
