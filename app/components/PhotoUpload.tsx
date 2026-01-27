'use client'

import { useState, useRef, useCallback } from 'react'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const MAX_PHOTOS = 5
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

export interface SelectedPhoto {
  file: File
  previewUrl: string
  id: string
}

interface PhotoUploadProps {
  photos: SelectedPhoto[]
  onPhotosChange: (photos: SelectedPhoto[]) => void
  error?: string
  disabled?: boolean
}

export default function PhotoUpload({
  photos,
  onPhotosChange,
  error,
  disabled = false,
}: PhotoUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return `"${file.name}" is not a valid image type. Please upload JPG, PNG, or WebP.`
    }
    if (file.size > MAX_FILE_SIZE) {
      return `"${file.name}" is too large. Maximum size is 5MB.`
    }
    return null
  }

  const processFiles = useCallback((files: FileList | File[]) => {
    const fileArray = Array.from(files)
    const remainingSlots = MAX_PHOTOS - photos.length

    if (fileArray.length > remainingSlots) {
      setValidationError(`Maximum ${MAX_PHOTOS} photos allowed. You can add ${remainingSlots} more.`)
      return
    }

    const validPhotos: SelectedPhoto[] = []
    let hasError = false

    for (const file of fileArray) {
      const error = validateFile(file)
      if (error) {
        setValidationError(error)
        hasError = true
        break
      }

      validPhotos.push({
        file,
        previewUrl: URL.createObjectURL(file),
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      })
    }

    if (!hasError) {
      setValidationError(null)
      onPhotosChange([...photos, ...validPhotos])
    }
  }, [photos, onPhotosChange])

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (disabled) return

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files)
    }
  }, [disabled, processFiles])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files)
    }
    // Reset input so the same file can be selected again
    e.target.value = ''
  }

  const handleRemove = (idToRemove: string) => {
    const photoToRemove = photos.find(p => p.id === idToRemove)
    if (photoToRemove) {
      URL.revokeObjectURL(photoToRemove.previewUrl)
    }
    onPhotosChange(photos.filter(p => p.id !== idToRemove))
    setValidationError(null)
  }

  const handleClick = () => {
    if (!disabled) {
      inputRef.current?.click()
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className="space-y-4">
      <label className="block text-sm font-semibold text-gray-700">
        Photos (Optional)
      </label>

      {/* Upload Zone */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer
          ${dragActive ? 'border-brand-blue bg-brand-blue/5' : 'border-gray-300 hover:border-gray-400'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          ${photos.length >= MAX_PHOTOS ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          multiple
          onChange={handleChange}
          className="hidden"
          disabled={disabled || photos.length >= MAX_PHOTOS}
        />

        <div className="flex flex-col items-center gap-2">
          {/* Camera Icon */}
          <svg
            className={`w-12 h-12 ${dragActive ? 'text-brand-blue' : 'text-gray-400'}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>

          <div className="text-sm">
            <span className="font-semibold text-brand-blue">Click to upload</span>
            <span className="text-gray-500"> or drag and drop</span>
          </div>

          <p className="text-xs text-gray-500">
            JPG, PNG, or WebP. Max {MAX_PHOTOS} photos, 5MB each.
          </p>

          {photos.length > 0 && (
            <p className="text-xs text-gray-600">
              {photos.length} of {MAX_PHOTOS} photos selected
            </p>
          )}
        </div>
      </div>

      {/* Validation Error */}
      {(validationError || error) && (
        <div className="flex items-center gap-2 text-red-600 text-sm">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <span>{validationError || error}</span>
        </div>
      )}

      {/* Photo Previews */}
      {photos.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {photos.map((photo, index) => (
            <div
              key={photo.id}
              className="relative group aspect-square rounded-lg overflow-hidden bg-gray-100"
            >
              <img
                src={photo.previewUrl}
                alt={`Preview ${index + 1}`}
                className="w-full h-full object-cover"
              />

              {/* Remove Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  handleRemove(photo.id)
                }}
                disabled={disabled}
                className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 disabled:opacity-50"
                aria-label={`Remove photo ${index + 1}`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Photo Number Badge */}
              <div className="absolute bottom-1 left-1 bg-black/60 text-white text-xs px-2 py-0.5 rounded">
                {index + 1}
              </div>

              {/* File Size */}
              <div className="absolute bottom-1 right-1 bg-black/60 text-white text-xs px-2 py-0.5 rounded">
                {formatFileSize(photo.file.size)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/**
 * Convert a File to base64 string
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result)
      } else {
        reject(new Error('Failed to read file as base64'))
      }
    }
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}
