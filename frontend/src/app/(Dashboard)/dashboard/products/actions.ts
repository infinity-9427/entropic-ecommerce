'use server'

import { revalidatePath } from 'next/cache'

const API_URL = process.env.API_URL || 'http://localhost:8001'

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
  images?: Array<{ url: string; public_id: string; alt_text?: string; is_primary?: boolean }>
  primary_image_url?: string | null
  stock_quantity: number
  is_active?: boolean
}

export async function createProduct(formData: ProductFormData) {
  try {
    console.log('Creating product with data:', formData)
    
    const response = await fetch(`${API_URL}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    })

    console.log('Response status:', response.status)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('API Error Response:', errorText)
      
      let errorMessage = 'Failed to create product'
      try {
        const errorData = JSON.parse(errorText)
        errorMessage = errorData.detail || errorData.message || errorMessage
        
        // Handle specific error types
        if (errorMessage.includes('duplicate key') || errorMessage.includes('unique constraint')) {
          errorMessage = 'A product with this SKU already exists. Please use a different SKU.'
        } else if (errorMessage.includes('validation')) {
          errorMessage = 'Please check your input values and try again.'
        }
      } catch (parseError) {
        errorMessage = `Server error: ${response.status} ${response.statusText}`
      }
      
      return { 
        success: false, 
        error: errorMessage 
      }
    }

    const product = await response.json()
    console.log('Product created successfully:', product)
    
    // Revalidate the products page to show the new product
    revalidatePath('/dashboard/products')
    
    return { success: true, product }
  } catch (error) {
    console.error('Create product error:', error)
    
    // Better error serialization for server actions
    const errorMessage = error instanceof Error 
      ? error.message 
      : typeof error === 'string' 
        ? error 
        : 'Failed to create product due to network error'
    
    return { 
      success: false, 
      error: errorMessage 
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
    console.log('Updating product with data:', formData)
    
    const response = await fetch(`${API_URL}/products/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    })

    console.log('Update response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('API Error Response:', errorText)
      
      let errorMessage = 'Failed to update product'
      try {
        const errorData = JSON.parse(errorText)
        errorMessage = errorData.detail || errorData.message || errorMessage
        
        // Handle specific error types
        if (errorMessage.includes('duplicate key') || errorMessage.includes('unique constraint')) {
          errorMessage = 'A product with this SKU already exists. Please use a different SKU.'
        } else if (errorMessage.includes('validation')) {
          errorMessage = 'Please check your input values and try again.'
        }
      } catch (parseError) {
        errorMessage = `Server error: ${response.status} ${response.statusText}`
      }
      
      return { 
        success: false, 
        error: errorMessage 
      }
    }

    const product = await response.json()
    console.log('Product updated successfully:', product)
    
    // Revalidate the products page to show the updated product
    revalidatePath('/dashboard/products')
    
    return { success: true, product }
  } catch (error) {
    console.error('Update product error:', error)
    
    // Better error serialization for server actions
    const errorMessage = error instanceof Error 
      ? error.message 
      : typeof error === 'string' 
        ? error 
        : 'Failed to update product due to network error'
    
    return { 
      success: false, 
      error: errorMessage 
    }
  }
}

export async function deleteProduct(id: number) {
  try {
    const response = await fetch(`${API_URL}/products/${id}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('API Error Response:', errorText)
      
      let errorMessage = 'Failed to delete product'
      try {
        const errorData = JSON.parse(errorText)
        errorMessage = errorData.detail || errorData.message || errorMessage
      } catch (parseError) {
        errorMessage = `Server error: ${response.status} ${response.statusText}`
      }
      
      return { 
        success: false, 
        error: errorMessage 
      }
    }
    
    // Revalidate the products page to remove the deleted product
    revalidatePath('/dashboard/products')
    
    return { success: true }
  } catch (error) {
    console.error('Delete product error:', error)
    
    // Better error serialization for server actions
    const errorMessage = error instanceof Error 
      ? error.message 
      : typeof error === 'string' 
        ? error 
        : 'Failed to delete product due to network error'
    
    return { 
      success: false, 
      error: errorMessage 
    }
  }
}
