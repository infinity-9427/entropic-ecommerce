'use client'

import { useState, useTransition, useMemo } from 'react'
import { useForm, Controller, SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { X } from 'lucide-react'
import { createProduct, updateProduct, type ProductFormData as APIProductFormData } from './actions'
import { productFormSchema, type ProductFormData, PRODUCT_CATEGORIES } from '@/schemas/product'
import DragDropUploader, { ImageFile } from '@/components/ui/drag-drop-uploader'
import 'remixicon/fonts/remixicon.css'

// Types
interface Product {
  id: number
  name: string
  description: string
  price: number
  category: string
  brand?: string
  sku?: string
  cost_price?: number
  compare_at_price?: number
  tags?: string[]
  weight?: number
  dimensions?: {
    length?: number
    width?: number
    height?: number
  }
  is_digital?: boolean
  meta_title?: string
  meta_description?: string
  slug?: string
  is_featured?: boolean
  image_url: string
  images?: Array<{ url: string; public_id: string; alt_text?: string }>
  stock_quantity: number
  is_active: boolean
  created_at: string
}

interface ProductFormProps {
  product?: Product | null
  onSuccess: () => void
  onCancel: () => void
}

// Form sections configuration
const FORM_SECTIONS = {
  BASIC: 'basic',
  ADVANCED: 'advanced',
  PHYSICAL: 'physical',
  SEO: 'seo',
  MARKETING: 'marketing',
  IMAGES: 'images',
} as const

type FormSection = typeof FORM_SECTIONS[keyof typeof FORM_SECTIONS]

export default function EnhancedProductForm({ product, onSuccess, onCancel }: ProductFormProps) {
  const [isPending, startTransition] = useTransition()
  const [activeSection, setActiveSection] = useState<FormSection>(FORM_SECTIONS.BASIC)
  const [images, setImages] = useState<ImageFile[]>([])
  const [showAdvancedSections, setShowAdvancedSections] = useState(false)

  // Initialize form with default values
  const defaultValues = useMemo((): Partial<ProductFormData> => ({
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price || 0,
    category: product?.category || '',
    brand: product?.brand || '',
    sku: product?.sku || '',
    cost_price: product?.cost_price || undefined,
    compare_at_price: product?.compare_at_price || undefined,
    tags: product?.tags || [],
    weight: product?.weight || undefined,
    dimensions: product?.dimensions || { length: undefined, width: undefined, height: undefined },
    is_digital: product?.is_digital || false,
    meta_title: product?.meta_title || '',
    meta_description: product?.meta_description || '',
    slug: product?.slug || '',
    is_featured: product?.is_featured || false,
    stock_quantity: product?.stock_quantity || 0,
    is_active: product?.is_active ?? true,
    images: product?.images || [],
    primary_image_url: product?.image_url || '',
  }), [product])

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    defaultValues,
    mode: 'onChange',
  })

  const { control, handleSubmit, formState: { errors, isValid }, watch, setValue } = form
  
  // Watch form fields for conditional rendering
  const watchedCategory = watch('category')
  const watchedIsDigital = watch('is_digital')
  const watchedName = watch('name')

  // Auto-generate slug from name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  // Update slug when name changes
  useState(() => {
    if (watchedName && !form.getValues('slug')) {
      setValue('slug', generateSlug(watchedName))
    }
  })

  const onSubmit: SubmitHandler<ProductFormData> = async (data) => {
    // Prepare image data
    const imageData = images
      .filter(img => img.uploaded && img.url && img.public_id)
      .map(img => ({
        url: img.url!,
        public_id: img.public_id!,
        alt_text: data.name, // Use product name as alt text
      }))

    // Convert to API format
    const apiData: APIProductFormData = {
      name: data.name,
      description: data.description,
      price: data.price,
      category: data.category,
      brand: data.brand,
      sku: data.sku,
      cost_price: data.cost_price,
      compare_at_price: data.compare_at_price,
      tags: data.tags,
      weight: data.weight,
      dimensions: data.dimensions,
      is_digital: data.is_digital,
      meta_title: data.meta_title,
      meta_description: data.meta_description,
      slug: data.slug,
      is_featured: data.is_featured,
      stock_quantity: data.stock_quantity,
      is_active: data.is_active,
      images: imageData,
      primary_image_url: imageData.length > 0 ? imageData[0].url : data.primary_image_url || '',
      image_url: imageData.length > 0 ? imageData[0].url : data.primary_image_url || '',
    }

    startTransition(async () => {
      try {
        let result
        if (product) {
          result = await updateProduct(product.id, apiData)
        } else {
          result = await createProduct(apiData)
        }

        if (result.success) {
          onSuccess()
        }
      } catch (error) {
        console.error('Form submission error:', error)
      }
    })
  }

  const handleImagesChange = (newImages: ImageFile[]) => {
    setImages(newImages)
    if (newImages.length > 0 && newImages[0].url) {
      setValue('primary_image_url', newImages[0].url)
    }
  }

  // Render field with conditional logic
  const renderConditionalFields = () => {
    switch (activeSection) {
      case FORM_SECTIONS.BASIC:
        return renderBasicFields()
      case FORM_SECTIONS.ADVANCED:
        return renderAdvancedFields()
      case FORM_SECTIONS.PHYSICAL:
        return renderPhysicalFields()
      case FORM_SECTIONS.SEO:
        return renderSEOFields()
      case FORM_SECTIONS.MARKETING:
        return renderMarketingFields()
      case FORM_SECTIONS.IMAGES:
        return renderImageFields()
      default:
        return renderBasicFields()
    }
  }

  const renderBasicFields = () => (
    <div className="space-y-6">
      {/* Product Name */}
      <Controller
        name="name"
        control={control}
        render={({ field }) => (
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <i className="ri-edit-box-line mr-2 text-blue-500"></i>
              Product Name *
            </label>
            <input
              {...field}
              type="text"
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              placeholder="Enter a compelling product name"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <i className="ri-error-warning-line mr-1"></i>
                {errors.name.message}
              </p>
            )}
          </div>
        )}
      />

      {/* Category */}
      <Controller
        name="category"
        control={control}
        render={({ field }) => (
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <i className="ri-folder-line mr-2 text-green-500"></i>
              Category *
            </label>
            <select
              {...field}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                errors.category ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
            >
              <option value="">Select a category</option>
              {PRODUCT_CATEGORIES.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <i className="ri-error-warning-line mr-1"></i>
                {errors.category.message}
              </p>
            )}
          </div>
        )}
      />

      {/* Price */}
      <Controller
        name="price"
        control={control}
        render={({ field }) => (
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <i className="ri-money-dollar-circle-line mr-2 text-yellow-500"></i>
              Selling Price *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
              <input
                {...field}
                type="number"
                step="0.01"
                min="0"
                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                className={`w-full pl-8 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  errors.price ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="0.00"
              />
            </div>
            {errors.price && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <i className="ri-error-warning-line mr-1"></i>
                {errors.price.message}
              </p>
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
              <i className="ri-stack-line mr-2 text-purple-500"></i>
              Stock Quantity *
            </label>
            <input
              {...field}
              type="number"
              min="0"
              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                errors.stock_quantity ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              placeholder="Enter available quantity"
            />
            {errors.stock_quantity && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <i className="ri-error-warning-line mr-1"></i>
                {errors.stock_quantity.message}
              </p>
            )}
          </div>
        )}
      />

      {/* Description */}
      <Controller
        name="description"
        control={control}
        render={({ field }) => (
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <i className="ri-file-text-line mr-2 text-indigo-500"></i>
              Description
            </label>
            <textarea
              {...field}
              rows={4}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none ${
                errors.description ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              placeholder="Describe your product in detail..."
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <i className="ri-error-warning-line mr-1"></i>
                {errors.description.message}
              </p>
            )}
          </div>
        )}
      />

      {/* Active Status */}
      <Controller
        name="is_active"
        control={control}
        render={({ field: { value, onChange, ...field } }) => (
          <div className="flex items-center">
            <input
              {...field}
              type="checkbox"
              checked={value}
              onChange={(e) => onChange(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="ml-3 flex items-center text-sm text-gray-700">
              <i className="ri-eye-line mr-2 text-green-500"></i>
              Product is active and visible to customers
            </label>
          </div>
        )}
      />
    </div>
  )

  // Additional field renderers (keeping them modular)
  const renderAdvancedFields = () => (
    <div className="space-y-6">
      {/* Brand */}
      <Controller
        name="brand"
        control={control}
        render={({ field }) => (
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <i className="ri-award-line mr-2 text-orange-500"></i>
              Brand
            </label>
            <input
              {...field}
              type="text"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="Enter brand name"
            />
          </div>
        )}
      />

      {/* SKU */}
      <Controller
        name="sku"
        control={control}
        render={({ field }) => (
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <i className="ri-barcode-line mr-2 text-gray-500"></i>
              SKU (Stock Keeping Unit)
            </label>
            <input
              {...field}
              type="text"
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors uppercase ${
                errors.sku ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              placeholder="PROD-001"
              onChange={(e) => field.onChange(e.target.value.toUpperCase())}
            />
            {errors.sku && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <i className="ri-error-warning-line mr-1"></i>
                {errors.sku.message}
              </p>
            )}
          </div>
        )}
      />

      {/* Cost Price & Compare at Price */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Controller
          name="cost_price"
          control={control}
          render={({ field }) => (
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <i className="ri-shopping-cart-line mr-2 text-blue-500"></i>
                Cost Price
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <input
                  {...field}
                  type="number"
                  step="0.01"
                  min="0"
                  onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                  className={`w-full pl-8 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    errors.cost_price ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="0.00"
                />
              </div>
              {errors.cost_price && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <i className="ri-error-warning-line mr-1"></i>
                  {errors.cost_price.message}
                </p>
              )}
            </div>
          )}
        />

        <Controller
          name="compare_at_price"
          control={control}
          render={({ field }) => (
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <i className="ri-price-tag-3-line mr-2 text-red-500"></i>
                Compare at Price
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <input
                  {...field}
                  type="number"
                  step="0.01"
                  min="0"
                  onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                  className={`w-full pl-8 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    errors.compare_at_price ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="0.00"
                />
              </div>
              {errors.compare_at_price && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <i className="ri-error-warning-line mr-1"></i>
                  {errors.compare_at_price.message}
                </p>
              )}
            </div>
          )}
        />
      </div>
    </div>
  )

  const renderPhysicalFields = () => (
    <div className="space-y-6">
      {/* Product Type Toggle */}
      <Controller
        name="is_digital"
        control={control}
        render={({ field }) => (
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <i className={`mr-3 text-xl ${field.value ? 'ri-download-cloud-line text-blue-500' : 'ri-box-3-line text-green-500'}`}></i>
              <div>
                <p className="font-medium text-gray-900">
                  {field.value ? 'Digital Product' : 'Physical Product'}
                </p>
                <p className="text-sm text-gray-600">
                  {field.value ? 'No shipping required' : 'Requires physical shipping'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => field.onChange(!field.value)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                field.value ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  field.value ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        )}
      />

      {/* Physical Product Fields */}
      {!watchedIsDigital && (
        <>
          {/* Weight */}
          <Controller
            name="weight"
            control={control}
            render={({ field }) => (
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <i className="ri-scales-3-line mr-2 text-purple-500"></i>
                  Weight (grams)
                </label>
                <input
                  {...field}
                  type="number"
                  min="0"
                  onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="Enter weight in grams"
                />
              </div>
            )}
          />

          {/* Dimensions */}
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <i className="ri-ruler-line mr-2 text-orange-500"></i>
              Dimensions (cm)
            </label>
            <div className="grid grid-cols-3 gap-4">
              <Controller
                name="dimensions.length"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="number"
                    min="0"
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="Length"
                  />
                )}
              />
              <Controller
                name="dimensions.width"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="number"
                    min="0"
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="Width"
                  />
                )}
              />
              <Controller
                name="dimensions.height"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="number"
                    min="0"
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="Height"
                  />
                )}
              />
            </div>
          </div>
        </>
      )}
    </div>
  )

  const renderSEOFields = () => (
    <div className="space-y-6">
      {/* SEO Title */}
      <Controller
        name="meta_title"
        control={control}
        render={({ field }) => (
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <i className="ri-seo-line mr-2 text-green-500"></i>
              SEO Title
            </label>
            <input
              {...field}
              type="text"
              maxLength={60}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="Optimized title for search engines"
            />
            <p className="mt-1 text-xs text-gray-500">
              {field.value?.length || 0}/60 characters
            </p>
          </div>
        )}
      />

      {/* SEO Description */}
      <Controller
        name="meta_description"
        control={control}
        render={({ field }) => (
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <i className="ri-file-text-line mr-2 text-blue-500"></i>
              SEO Description
            </label>
            <textarea
              {...field}
              rows={3}
              maxLength={160}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
              placeholder="Brief description for search results"
            />
            <p className="mt-1 text-xs text-gray-500">
              {field.value?.length || 0}/160 characters
            </p>
          </div>
        )}
      />

      {/* Slug */}
      <Controller
        name="slug"
        control={control}
        render={({ field }) => (
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <i className="ri-link mr-2 text-purple-500"></i>
              URL Slug
            </label>
            <div className="flex">
              <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                /products/
              </span>
              <input
                {...field}
                type="text"
                className={`flex-1 px-4 py-3 border rounded-r-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  errors.slug ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="product-url-slug"
                onChange={(e) => field.onChange(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
              />
            </div>
            {errors.slug && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <i className="ri-error-warning-line mr-1"></i>
                {errors.slug.message}
              </p>
            )}
          </div>
        )}
      />
    </div>
  )

  const renderMarketingFields = () => (
    <div className="space-y-6">
      {/* Featured Product */}
      <Controller
        name="is_featured"
        control={control}
        render={({ field: { value, onChange, ...field } }) => (
          <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="flex items-center">
              <i className="ri-star-line mr-3 text-xl text-yellow-500"></i>
              <div>
                <p className="font-medium text-gray-900">Featured Product</p>
                <p className="text-sm text-gray-600">
                  Featured products appear prominently on your store
                </p>
              </div>
            </div>
            <input
              {...field}
              type="checkbox"
              checked={value}
              onChange={(e) => onChange(e.target.checked)}
              className="h-5 w-5 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
            />
          </div>
        )}
      />
    </div>
  )

  const renderImageFields = () => (
    <div className="space-y-6">
      <div>
        <label className="flex items-center text-sm font-medium text-gray-700 mb-4">
          <i className="ri-image-line mr-2 text-green-500"></i>
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
            alt_text: img.alt_text
          })) || []}
          disabled={isPending}
        />
        <p className="mt-2 text-sm text-gray-500">
          Upload up to 5 high-quality images. The first image will be used as the primary product image.
        </p>
      </div>
    </div>
  )

  // Section navigation
  const sections = [
    { key: FORM_SECTIONS.BASIC, label: 'Basic Info', icon: 'ri-information-line', required: true },
    { key: FORM_SECTIONS.IMAGES, label: 'Images', icon: 'ri-image-line', required: true },
    { key: FORM_SECTIONS.ADVANCED, label: 'Advanced', icon: 'ri-settings-3-line' },
    { key: FORM_SECTIONS.PHYSICAL, label: 'Physical', icon: 'ri-box-3-line' },
    { key: FORM_SECTIONS.SEO, label: 'SEO', icon: 'ri-seo-line' },
    { key: FORM_SECTIONS.MARKETING, label: 'Marketing', icon: 'ri-megaphone-line' },
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {product ? 'Edit Product' : 'Create New Product'}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {product ? 'Update your product information' : 'Add a new product to your catalog'}
              </p>
            </div>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="flex h-[calc(90vh-120px)]">
          {/* Sidebar Navigation */}
          <div className="w-64 bg-gray-50 border-r border-gray-200 p-4 overflow-y-auto">
            <div className="space-y-2">
              {sections.map((section) => (
                <button
                  key={section.key}
                  type="button"
                  onClick={() => setActiveSection(section.key)}
                  className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                    activeSection === section.key
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <i className={`${section.icon} mr-3 text-lg`}></i>
                  <span className="font-medium">{section.label}</span>
                  {section.required && (
                    <span className="ml-auto text-red-500">*</span>
                  )}
                </button>
              ))}
            </div>

            {/* Progress Indicator */}
            <div className="mt-6 p-4 bg-white rounded-lg border border-gray-200">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Completion</h4>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${isValid ? '100' : Object.keys(errors).length === 0 ? '70' : '30'}%` 
                  }}
                ></div>
              </div>
              <p className="text-xs text-gray-600 mt-2">
                {isValid ? 'Ready to save!' : 'Fill required fields to continue'}
              </p>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto">
            <form onSubmit={handleSubmit(onSubmit)} className="p-6">
              {renderConditionalFields()}

              {/* Form Actions */}
              <div className="flex items-center justify-between pt-8 border-t border-gray-200 mt-8">
                <div className="flex items-center space-x-4">
                  <button
                    type="button"
                    onClick={onCancel}
                    className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                    disabled={isPending}
                  >
                    Cancel
                  </button>
                  
                  {activeSection !== FORM_SECTIONS.BASIC && (
                    <button
                      type="button"
                      onClick={() => {
                        const currentIndex = sections.findIndex(s => s.key === activeSection)
                        if (currentIndex > 0) {
                          setActiveSection(sections[currentIndex - 1].key)
                        }
                      }}
                      className="px-6 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                    >
                      <i className="ri-arrow-left-line mr-2"></i>
                      Previous
                    </button>
                  )}
                </div>

                <div className="flex items-center space-x-4">
                  {activeSection !== FORM_SECTIONS.MARKETING && (
                    <button
                      type="button"
                      onClick={() => {
                        const currentIndex = sections.findIndex(s => s.key === activeSection)
                        if (currentIndex < sections.length - 1) {
                          setActiveSection(sections[currentIndex + 1].key)
                        }
                      }}
                      className="px-6 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                    >
                      Next
                      <i className="ri-arrow-right-line ml-2"></i>
                    </button>
                  )}
                  
                  <button
                    type="submit"
                    disabled={isPending || !isValid}
                    className="px-8 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isPending ? (
                      <>
                        <i className="ri-loader-4-line mr-2 animate-spin"></i>
                        Saving...
                      </>
                    ) : (
                      <>
                        <i className="ri-save-line mr-2"></i>
                        {product ? 'Update Product' : 'Create Product'}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
