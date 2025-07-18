// Image upload service using Cloudinary
export interface UploadedImage {
  url: string
  public_id: string
}

export const uploadToCloudinary = async (file: File): Promise<UploadedImage> => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', 'ecommerce') // You need to configure this in Cloudinary
  formData.append('cloud_name', 'dlfgfgkyk') // Your Cloudinary cloud name

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/dlfgfgkyk/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    )

    if (!response.ok) {
      throw new Error('Failed to upload image')
    }

    const data = await response.json()
    
    return {
      url: data.secure_url,
      public_id: data.public_id,
    }
  } catch (error) {
    console.error('Cloudinary upload error:', error)
    throw error
  }
}

// Delete image from Cloudinary
export const deleteFromCloudinary = async (public_id: string): Promise<void> => {
  try {
    const response = await fetch('/api/cloudinary/delete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ public_id }),
    })

    if (!response.ok) {
      throw new Error('Failed to delete image')
    }
  } catch (error) {
    console.error('Cloudinary delete error:', error)
    throw error
  }
}
