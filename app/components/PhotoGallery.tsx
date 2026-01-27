'use client'

import { useState } from 'react'
import PhotoLightbox from './PhotoLightbox'

export interface Photo {
  id: number
  url: string
  thumbnailUrl: string
  publicId?: string
  width?: number
  height?: number
}

interface PhotoGalleryProps {
  photos: Photo[]
  businessName: string
  maxDisplay?: number
  variant?: 'grid' | 'hero' | 'compact'
}

export default function PhotoGallery({
  photos,
  businessName,
  maxDisplay = 6,
  variant = 'grid',
}: PhotoGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)

  if (!photos || photos.length === 0) {
    return null
  }

  const displayPhotos = photos.slice(0, maxDisplay)
  const remainingCount = photos.length - maxDisplay

  const openLightbox = (index: number) => {
    setLightboxIndex(index)
    setLightboxOpen(true)
  }

  // Hero variant - larger first image with smaller grid
  if (variant === 'hero' && photos.length >= 3) {
    return (
      <>
        <div className="grid grid-cols-4 gap-2 rounded-lg overflow-hidden">
          {/* Large featured photo */}
          <button
            onClick={() => openLightbox(0)}
            className="col-span-2 row-span-2 relative aspect-[4/3] overflow-hidden group"
          >
            <img
              src={photos[0].thumbnailUrl || photos[0].url}
              alt={`${businessName} - Photo 1`}
              className="w-full h-full object-cover transition-transform group-hover:scale-105"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
          </button>

          {/* Smaller photos */}
          {displayPhotos.slice(1, 5).map((photo, index) => (
            <button
              key={photo.id}
              onClick={() => openLightbox(index + 1)}
              className="relative aspect-square overflow-hidden group"
            >
              <img
                src={photo.thumbnailUrl || photo.url}
                alt={`${businessName} - Photo ${index + 2}`}
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />

              {/* Show remaining count on last visible photo */}
              {index === 3 && remainingCount > 0 && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <span className="text-white text-xl font-bold">+{remainingCount}</span>
                </div>
              )}
            </button>
          ))}
        </div>

        {/* View all photos button */}
        {photos.length > 5 && (
          <button
            onClick={() => openLightbox(0)}
            className="mt-2 text-sm text-brand-blue hover:text-brand-blue/80 font-medium"
          >
            View all {photos.length} photos
          </button>
        )}

        {lightboxOpen && (
          <PhotoLightbox
            photos={photos}
            initialIndex={lightboxIndex}
            onClose={() => setLightboxOpen(false)}
            businessName={businessName}
          />
        )}
      </>
    )
  }

  // Compact variant - horizontal scroll
  if (variant === 'compact') {
    return (
      <>
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-2 px-2 scrollbar-thin scrollbar-thumb-gray-300">
          {displayPhotos.map((photo, index) => (
            <button
              key={photo.id}
              onClick={() => openLightbox(index)}
              className="relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden group"
            >
              <img
                src={photo.thumbnailUrl || photo.url}
                alt={`${businessName} - Photo ${index + 1}`}
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
                loading="lazy"
              />

              {/* Show remaining count on last visible photo */}
              {index === maxDisplay - 1 && remainingCount > 0 && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <span className="text-white text-sm font-bold">+{remainingCount}</span>
                </div>
              )}
            </button>
          ))}
        </div>

        {lightboxOpen && (
          <PhotoLightbox
            photos={photos}
            initialIndex={lightboxIndex}
            onClose={() => setLightboxOpen(false)}
            businessName={businessName}
          />
        )}
      </>
    )
  }

  // Default grid variant
  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
        {displayPhotos.map((photo, index) => (
          <button
            key={photo.id}
            onClick={() => openLightbox(index)}
            className="relative aspect-square rounded-lg overflow-hidden group"
          >
            <img
              src={photo.thumbnailUrl || photo.url}
              alt={`${businessName} - Photo ${index + 1}`}
              className="w-full h-full object-cover transition-transform group-hover:scale-105"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />

            {/* Show remaining count on last visible photo */}
            {index === maxDisplay - 1 && remainingCount > 0 && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <span className="text-white text-xl font-bold">+{remainingCount}</span>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Photo count */}
      {photos.length > 0 && (
        <p className="text-sm text-gray-500 mt-2">
          {photos.length} photo{photos.length !== 1 ? 's' : ''}
          {remainingCount > 0 && (
            <button
              onClick={() => openLightbox(0)}
              className="ml-2 text-brand-blue hover:text-brand-blue/80 font-medium"
            >
              View all
            </button>
          )}
        </p>
      )}

      {lightboxOpen && (
        <PhotoLightbox
          photos={photos}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxOpen(false)}
          businessName={businessName}
        />
      )}
    </>
  )
}
