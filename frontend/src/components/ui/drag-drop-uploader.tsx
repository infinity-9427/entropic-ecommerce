'use client'

import { useState, useRef, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X, Loader2 } from 'lucide-react'
import { dragAndDrop } from '@formkit/drag-and-drop'
import { uploadToCloudinary } from '@/lib/cloudinary'
import Image from 'next/image'

export interface ImageFile {
  file: File
  preview: string
  url?: string
  public_id?: string
  uploading?: boolean
  uploaded?: boolean
  error?: string
}

interface DragDropUploaderProps {
  onImagesChange: (images: ImageFile[]) => void
  maxFiles?: number
  maxSize?: number
  acceptedTypes?: string[]
  initialImages?: ImageFile[]
  className?: string
  disabled?: boolean
}

export default function DragDropUploader({
  onImagesChange,
  maxFiles = 5,
  maxSize = 5 * 1024 * 1024, // 5MB
  acceptedTypes = ['image/*'],
  initialImages = [],
  className = '',
  disabled = false
}: DragDropUploaderProps) {
  const [images, setImages] = useState<ImageFile[]>(initialImages)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const sortableRef = useRef<{ destroy?: () => void } | null>(null)

  // Initialize FormKit drag and drop
  useEffect(() => {
    if (containerRef.current && images.length > 0) {
      sortableRef.current = dragAndDrop({
        parent: containerRef.current,
        getValues: () => images,
        setValues: (newImages) => {
          setImages(newImages)
          onImagesChange(newImages)
        },
        config: {
          sortable: true,
        }
      }) as unknown as { destroy?: () => void }
    }

    return () => {
      if (sortableRef.current) {
        sortableRef.current.destroy?.()
      }
    }
  }, [images.length, onImagesChange, images])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: acceptedTypes.reduce((acc, type) => {
      acc[type] = []
      return acc
    }, {} as Record<string, string[]>),
    maxSize,
    disabled,
    onDrop: (acceptedFiles) => {
      const newImages = acceptedFiles.map(file => ({
        file,
        preview: URL.createObjectURL(file),
        uploading: false,
        uploaded: false
      }))

      const updatedImages = [...images, ...newImages].slice(0, maxFiles)
      setImages(updatedImages)
      onImagesChange(updatedImages)
    },
    onDropRejected: (fileRejections) => {
      const errors = fileRejections.map(rejection => ({
        file: rejection.file.name,
        errors: rejection.errors.map(error => error.message)
      }))
      console.error('File upload errors:', errors)
    }
  })

  const removeImage = (index: number) => {
    const imageToRemove = images[index]
    if (imageToRemove.preview) {
      URL.revokeObjectURL(imageToRemove.preview)
    }
    
    const updatedImages = images.filter((_, i) => i !== index)
    setImages(updatedImages)
    onImagesChange(updatedImages)
  }

  const updateImageStatus = (index: number, status: Partial<ImageFile>) => {
    const updatedImages = images.map((img, i) => 
      i === index ? { ...img, ...status } : img
    )
    setImages(updatedImages)
    onImagesChange(updatedImages)
  }

  // Real upload function - replace the mock implementation
  const uploadImage = async (image: ImageFile, index: number) => {
    updateImageStatus(index, { uploading: true })
    
    try {
      // Real Cloudinary upload
      const uploadedImage = await uploadToCloudinary(image.file)
      
      updateImageStatus(index, { 
        uploading: false, 
        uploaded: true, 
        url: uploadedImage.url,
        public_id: uploadedImage.public_id 
      })
    } catch (error) {
      updateImageStatus(index, { 
        uploading: false, 
        error: error instanceof Error ? error.message : 'Upload failed' 
      })
    }
  }

  const canAddMore = images.length < maxFiles

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Drop Zone */}
      {canAddMore && (
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
            ${isDragActive 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <input {...getInputProps()} />
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-lg font-medium text-gray-700 mb-2">
            {isDragActive ? 'Drop images here' : 'Drag & drop images here'}
          </p>
          <p className="text-sm text-gray-500 mb-4">
            or click to select files
          </p>
          <p className="text-xs text-gray-400">
            Up to {maxFiles} images, max {(maxSize / (1024 * 1024)).toFixed(0)}MB each
          </p>
        </div>
      )}

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">
              Images ({images.length}/{maxFiles})
            </h3>
            <p className="text-sm text-gray-500">
              Drag to reorder
            </p>
          </div>

          <div 
            ref={containerRef}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
          >
            {images.map((image, index) => (
              <div
                key={`${image.preview}-${index}`}
                data-draggable
                className={`
                  relative group bg-gray-100 rounded-lg overflow-hidden aspect-square
                  ${draggedIndex === index ? 'opacity-50' : ''}
                  ${image.uploaded ? 'ring-2 ring-green-500' : ''}
                  ${image.error ? 'ring-2 ring-red-500' : ''}
                `}
              >
                {/* Drag Handle */}
                <div
                  data-drag-handle
                  className="absolute top-2 left-2 z-10 bg-white/80 rounded p-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-move"
                >
                  <div className="w-4 h-4 bg-gray-400 rounded grid grid-cols-2 gap-0.5">
                    <div className="bg-gray-600 rounded-sm"></div>
                    <div className="bg-gray-600 rounded-sm"></div>
                    <div className="bg-gray-600 rounded-sm"></div>
                    <div className="bg-gray-600 rounded-sm"></div>
                  </div>
                </div>

                {/* Remove Button */}
                <button
                  onClick={() => removeImage(index)}
                  className="absolute top-2 right-2 z-10 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                >
                  <X className="h-4 w-4" />
                </button>

                {/* Image */}
                <Image
                  src={image.preview}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-full object-cover"
                  width={200}
                  height={200}
                  unoptimized
                />

                {/* Status Overlay */}
                {image.uploading && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="text-white text-center">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                      <p className="text-sm">Uploading...</p>
                    </div>
                  </div>
                )}

                {image.uploaded && (
                  <div className="absolute bottom-2 left-2 bg-green-500 text-white px-2 py-1 rounded text-xs">
                    ✓ Uploaded
                  </div>
                )}

                {image.error && (
                  <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center">
                    <div className="text-red-700 text-center">
                      <p className="text-sm font-medium">Upload failed</p>
                      <button
                        onClick={() => uploadImage(image, index)}
                        className="text-xs underline mt-1"
                      >
                        Retry
                      </button>
                    </div>
                  </div>
                )}

                {/* Primary Image Badge */}
                {index === 0 && (
                  <div className="absolute top-2 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-2 py-1 rounded text-xs">
                    Primary
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Upload All Button */}
          {images.some(img => !img.uploaded && !img.uploading) && (
            <div className="flex justify-center">
              <button
                onClick={() => {
                  images.forEach((image, index) => {
                    if (!image.uploaded && !image.uploading) {
                      uploadImage(image, index)
                    }
                  })
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Upload All Images
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
