'use server'

import { revalidatePath } from 'next/cache'

const API_URL = process.env.API_URL || 'http://localhost:8000'

export interface ProductFormData {
  name: string
  description?: string
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
  image_url?: string
  images?: Array<{ url: string; public_id: string; alt_text?: string }>
  primary_image_url?: string
  stock_quantity: number
  is_active?: boolean
}

export async function createProduct(formData: ProductFormData) {
  try {
    const response = await fetch(`${API_URL}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.detail || 'Failed to create product')
    }

    const product = await response.json()
    
    // Revalidate the products page to show the new product
    revalidatePath('/dashboard/products')
    
    return { success: true, product }
  } catch (error) {
    console.error('Create product error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to create product' 
    }
  }
}

export async function fetchProducts() {
  try {
    const response = await fetch(`${API_URL}/products`, {
      cache: 'no-store', // Always fetch fresh data
    })

    if (!response.ok) {
      throw new Error('Failed to fetch products')
    }

    return await response.json()
  } catch (error) {
    console.error('Fetch products error:', error)
    throw error
  }
}

export async function updateProduct(id: number, formData: ProductFormData) {
  try {
    const response = await fetch(`${API_URL}/products/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.detail || 'Failed to update product')
    }

    const product = await response.json()
    
    // Revalidate the products page to show the updated product
    revalidatePath('/dashboard/products')
    
    return { success: true, product }
  } catch (error) {
    console.error('Update product error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to update product' 
    }
  }
}

export async function deleteProduct(id: number) {
  try {
    const response = await fetch(`${API_URL}/products/${id}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.detail || 'Failed to delete product')
    }
    
    // Revalidate the products page to remove the deleted product
    revalidatePath('/dashboard/products')
    
    return { success: true }
  } catch (error) {
    console.error('Delete product error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to delete product' 
    }
  }
}
