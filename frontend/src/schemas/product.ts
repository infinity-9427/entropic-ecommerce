import { z } from 'zod'

// Product validation schema based on backend model
export const productSchema = z.object({
  // Basic Information
  name: z.string()
    .min(1, 'Product name is required')
    .min(3, 'Product name must be at least 3 characters')
    .max(255, 'Product name must be less than 255 characters'),
  
  description: z.string()
    .min(10, 'Description must be at least 10 characters')
    .max(5000, 'Description must be less than 5000 characters')
    .optional(),
  
  // Pricing
  price: z.number()
    .min(0.01, 'Price must be greater than 0')
    .max(1000000, 'Price must be less than 1,000,000'),
  
  cost_price: z.number()
    .min(0, 'Cost price cannot be negative')
    .optional(),
  
  compare_at_price: z.number()
    .min(0, 'Compare at price cannot be negative')
    .optional(),
  
  // Categorization
  category: z.string()
    .min(1, 'Category is required'),
  
  brand: z.string()
    .min(1, 'Brand is required when specified')
    .max(100, 'Brand name must be less than 100 characters')
    .optional(),
  
  tags: z.array(z.string())
    .max(20, 'Maximum 20 tags allowed')
    .optional(),
  
  // Inventory
  stock_quantity: z.number()
    .int('Stock quantity must be a whole number')
    .min(0, 'Stock quantity cannot be negative'),
  
  sku: z.string()
    .min(3, 'SKU must be at least 3 characters')
    .max(50, 'SKU must be less than 50 characters')
    .regex(/^[A-Z0-9-_]+$/, 'SKU can only contain uppercase letters, numbers, hyphens, and underscores')
    .optional(),
  
  // Physical Properties
  weight: z.number()
    .min(0, 'Weight cannot be negative')
    .max(50000, 'Weight must be less than 50kg (50000g)')
    .optional(),
  
  dimensions: z.object({
    length: z.number().min(0, 'Length cannot be negative').optional(),
    width: z.number().min(0, 'Width cannot be negative').optional(),
    height: z.number().min(0, 'Height cannot be negative').optional(),
  }).optional(),
  
  // Product Type
  is_digital: z.boolean().default(false),
  
  // Images
  images: z.array(z.object({
    url: z.string().url('Invalid image URL'),
    public_id: z.string(),
    alt_text: z.string().optional(),
  })).min(1, 'At least one image is required'),
  
  primary_image_url: z.string().url('Invalid primary image URL'),
  
  // SEO
  meta_title: z.string()
    .max(60, 'Meta title should be less than 60 characters')
    .optional(),
  
  meta_description: z.string()
    .max(160, 'Meta description should be less than 160 characters')
    .optional(),
  
  slug: z.string()
    .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens')
    .optional(),
  
  // Status
  is_active: z.boolean().default(true),
  is_featured: z.boolean().default(false),
})

// Form schema with conditional validation
export const productFormSchema = z.object({
  // Basic fields (always shown)
  name: productSchema.shape.name,
  description: productSchema.shape.description.optional(),
  category: productSchema.shape.category,
  price: productSchema.shape.price,
  stock_quantity: productSchema.shape.stock_quantity,
  is_active: z.boolean().default(true),
  
  // Advanced fields (conditionally shown)
  brand: productSchema.shape.brand.optional(),
  sku: productSchema.shape.sku.optional(),
  cost_price: productSchema.shape.cost_price.optional(),
  compare_at_price: productSchema.shape.compare_at_price.optional(),
  tags: productSchema.shape.tags.optional(),
  
  // Physical product fields (shown when not digital)
  weight: productSchema.shape.weight.optional(),
  dimensions: productSchema.shape.dimensions.optional(),
  is_digital: z.boolean().default(false),
  
  // SEO fields (shown in advanced mode)
  meta_title: productSchema.shape.meta_title.optional(),
  meta_description: productSchema.shape.meta_description.optional(),
  slug: productSchema.shape.slug.optional(),
  
  // Marketing fields
  is_featured: z.boolean().default(false),
  
  // Images
  images: productSchema.shape.images.optional().default([]),
  primary_image_url: productSchema.shape.primary_image_url.optional(),
  image_url: z.string().optional(), // For compatibility with existing API
}).refine((data) => {
  // Custom validation: compare_at_price should be higher than price if provided
  if (data.compare_at_price && data.compare_at_price <= data.price) {
    return false
  }
  return true
}, {
  message: 'Compare at price should be higher than the selling price',
  path: ['compare_at_price']
}).refine((data) => {
  // Custom validation: cost_price should be lower than price if provided
  if (data.cost_price && data.cost_price >= data.price) {
    return false
  }
  return true
}, {
  message: 'Cost price should be lower than the selling price',
  path: ['cost_price']
})

export type ProductFormData = z.infer<typeof productFormSchema>
export type Product = z.infer<typeof productSchema>

// Validation for different form sections
export const basicInfoSchema = productFormSchema.pick({
  name: true,
  description: true,
  category: true,
  price: true,
  stock_quantity: true,
})

export const advancedInfoSchema = productFormSchema.pick({
  brand: true,
  sku: true,
  cost_price: true,
  compare_at_price: true,
  tags: true,
})

export const physicalInfoSchema = productFormSchema.pick({
  weight: true,
  dimensions: true,
  is_digital: true,
})

export const seoInfoSchema = productFormSchema.pick({
  meta_title: true,
  meta_description: true,
  slug: true,
})

export const marketingInfoSchema = productFormSchema.pick({
  is_featured: true,
  is_active: true,
})

// Categories enum for better type safety
export const PRODUCT_CATEGORIES = [
  'Electronics',
  'Clothing',
  'Footwear',
  'Accessories',
  'Sports & Outdoors',
  'Health & Beauty',
  'Food & Beverages',
  'Books & Media',
  'Home & Garden',
  'Toys & Games',
  'Automotive',
  'Industrial',
  'Jewelry',
  'Pet Supplies',
  'Office Supplies',
] as const

export type ProductCategory = typeof PRODUCT_CATEGORIES[number]
