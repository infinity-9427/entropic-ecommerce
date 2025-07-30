'use client'

import { useState, useTransition } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { X, Package, DollarSign, Hash, FileText, Tag } from 'lucide-react'
import { createProduct, updateProduct } from './actions'
import DragDropUploader, { ImageFile } from '@/components/ui/drag-drop-uploader'
import { z } from 'zod'

// Minimal form schema with only essential fields
const simpleProductSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  price: z.number().min(0.01, 'Price must be greater than 0'),
  category: z.string().min(1, 'Category is required'),
  stock_quantity: z.number().min(0, 'Stock quantity cannot be negative'),
  description: z.string().optional(),
})

type SimpleFormData = z.infer<typeof simpleProductSchema>

// Essential product categories
const ESSENTIAL_CATEGORIES = [
  'Electronics',
  'Clothing',
  'Footwear',
  'Accessories',
  'Sports & Outdoors',
  'Health & Beauty',
  'Home & Garden',
  'Books & Media',
  'Food & Beverages',
  'Other',
]

interface Product {
  id: number
  name: string
  description: string
  price: number
  category: string
  image_url: string
  images?: Array<{ url: string; public_id: string }>
  stock_quantity: number
  is_active: boolean
  created_at: string
}

interface SimpleProductFormProps {
  product?: Product | null
  onSuccess: () => void
  onCancel: () => void
}

export default function SimpleProductForm({ product, onSuccess, onCancel }: SimpleProductFormProps) {
  const [isPending, startTransition] = useTransition()
  const [images, setImages] = useState<ImageFile[]>([])
  const [submitError, setSubmitError] = useState<string | null>(null)

  const form = useForm<SimpleFormData>({
    resolver: zodResolver(simpleProductSchema),
    defaultValues: {
      name: product?.name || '',
      price: product?.price || 0,
      category: product?.category || '',
      stock_quantity: product?.stock_quantity || 0,
      description: product?.description || '',
    },
    mode: 'onChange',
  })

  const { control, handleSubmit, formState: { errors, isValid } } = form

  const onSubmit = async (data: SimpleFormData) => {
    console.log('Form data:', data)
    console.log('Images:', images)
    
    // Clear any previous errors
    setSubmitError(null)
    
    // Prepare image data
    const imageData = images
      .filter(img => img.uploaded && img.url && img.public_id)
      .map(img => ({
        url: img.url!,
        public_id: img.public_id!,
        alt_text: data.name, // Use product name as alt text
        is_primary: false,
      }))

    // Set first image as primary
    if (imageData.length > 0) {
      imageData[0].is_primary = true
    }

    console.log('Processed images:', imageData)

    // Convert to API format that matches backend schema
    const apiData = {
      name: data.name,
      description: data.description || '',
      price: data.price,
      category: data.category,
      stock_quantity: data.stock_quantity,
      brand: undefined, // Use undefined instead of empty string to avoid unique constraint issues
      sku: undefined,   // Use undefined instead of empty string to avoid unique constraint issues
      is_active: true,
      is_featured: false,
      is_digital: false,
      // Backend expects these specific fields (now optional):
      images: imageData,
      primary_image_url: imageData.length > 0 ? imageData[0].url : null,
    }

    console.log('Final API data:', apiData)

    startTransition(async () => {
      try {
        let result
        if (product) {
          console.log('Updating existing product:', product.id)
          result = await updateProduct(product.id, apiData)
        } else {
          console.log('Creating new product')
          result = await createProduct(apiData)
        }

        console.log('API result:', result)

        if (result.success) {
          console.log('Product operation successful!')
          onSuccess()
        } else {
          console.error('Product operation failed:', result.error)
          setSubmitError(result.error || 'An unexpected error occurred')
        }
      } catch (error) {
        console.error('Form submission error:', error)
        setSubmitError('Network error: Please check your connection and try again.')
      }
    })
  }

  const handleImagesChange = (newImages: ImageFile[]) => {
    setImages(newImages)
  }

  return (
    <div className="fixed inset-0 bg-gray-900/20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden border border-white/20">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-blue-50/50 to-indigo-50/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
                <Package className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {product ? 'Edit Product' : 'Add New Product'}
                </h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  {product ? 'Update product details' : 'Create a new product quickly'}
                </p>
              </div>
            </div>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Form Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-180px)]">
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
            {/* Product Images Upload */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-3">
                <div className="w-5 h-5 rounded bg-green-100 flex items-center justify-center mr-2">
                  <div className="w-3 h-3 rounded bg-green-500"></div>
                </div>
                Product Images
              </label>
              <DragDropUploader
                onImagesChange={handleImagesChange}
                maxFiles={5}
                maxSize={5 * 1024 * 1024}
                acceptedTypes={['image/*']}
                initialImages={product?.images?.filter(img => img.url && img.url.trim() !== '').map(img => ({
                  file: new File([], ''),
                  preview: img.url,
                  url: img.url,
                  public_id: img.public_id,
                  uploaded: true,
                })) || []}
                disabled={isPending}
              />
              <p className="mt-2 text-xs text-gray-500">
                Upload up to 5 high-quality product images (max 5MB each). The first image will be used as the main product image.
              </p>
            </div>

            {/* Essential Fields Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Product Name */}
              <div className="md:col-span-2">
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <div>
                      <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                        <Tag className="w-4 h-4 mr-2 text-blue-500" />
                        Product Name *
                      </label>
                      <input
                        {...field}
                        type="text"
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                          errors.name ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                        }`}
                        placeholder="Enter product name"
                      />
                      {errors.name && (
                        <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                      )}
                    </div>
                  )}
                />
              </div>

              {/* Price */}
              <Controller
                name="price"
                control={control}
                render={({ field }) => (
                  <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                      <DollarSign className="w-4 h-4 mr-2 text-green-500" />
                      Price *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                      <input
                        {...field}
                        type="number"
                        step="0.01"
                        min="0"
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        className={`w-full pl-8 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                          errors.price ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                        }`}
                        placeholder="0.00"
                      />
                    </div>
                    {errors.price && (
                      <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
                    )}
                  </div>
                )}
              />

              {/* Stock Quantity */}
              <Controller
                name="stock_quantity"
                control={control}
                render={({ field }) => (
                  <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                      <Hash className="w-4 h-4 mr-2 text-purple-500" />
                      Stock *
                    </label>
                    <input
                      {...field}
                      type="number"
                      min="0"
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                        errors.stock_quantity ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                      placeholder="0"
                    />
                    {errors.stock_quantity && (
                      <p className="mt-1 text-sm text-red-600">{errors.stock_quantity.message}</p>
                    )}
                  </div>
                )}
              />

              {/* Category */}
              <div className="md:col-span-2">
                <Controller
                  name="category"
                  control={control}
                  render={({ field }) => (
                    <div>
                      <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                        <div className="w-4 h-4 rounded bg-orange-100 flex items-center justify-center mr-2">
                          <div className="w-2 h-2 rounded bg-orange-500"></div>
                        </div>
                        Category *
                      </label>
                      <select
                        {...field}
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                          errors.category ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <option value="">Select category</option>
                        {ESSENTIAL_CATEGORIES.map(category => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                      {errors.category && (
                        <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
                      )}
                    </div>
                  )}
                />
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <div>
                      <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                        <FileText className="w-4 h-4 mr-2 text-indigo-500" />
                        Description (Optional)
                      </label>
                      <textarea
                        {...field}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none hover:border-gray-300"
                        placeholder="Brief description of your product..."
                      />
                    </div>
                  )}
                />
              </div>
            </div>

            {/* Error Message */}
            {submitError && (
              <div className="flex items-center justify-center p-4 bg-red-50 border border-red-200 rounded-xl">
                <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center mr-3">
                  <div className="w-2 h-2 rounded-full bg-white"></div>
                </div>
                <div className="flex-1">
                  <span className="text-sm font-medium text-red-700">Error</span>
                  <p className="text-sm text-red-600 mt-1">{submitError}</p>
                </div>
              </div>
            )}

            {/* Success Indicator */}
            {isValid && !submitError && (
              <div className="flex items-center justify-center p-3 bg-green-50 border border-green-200 rounded-xl">
                <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center mr-2">
                  <div className="w-2 h-2 rounded-full bg-white"></div>
                </div>
                <span className="text-sm font-medium text-green-700">Ready to save!</span>
              </div>
            )}
          </form>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all"
              disabled={isPending}
            >
              Cancel
            </button>
            
            <button
              onClick={handleSubmit(onSubmit)}
              disabled={isPending || !isValid}
              className="px-8 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 border border-transparent rounded-xl hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-500/25"
            >
              {isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2 inline-block"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Package className="w-4 h-4 mr-2 inline-block" />
                  {product ? 'Update Product' : 'Create Product'}
                </>
              )}
            </button>
          </div>

          <div className="mt-3 text-center">
            <p className="text-xs text-gray-500">
              All fields marked with * are required. You can add more details later.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
