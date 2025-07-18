"""
Cloudinary service for image upload and management
"""

import os
import cloudinary
from cloudinary import CloudinaryImage
import cloudinary.uploader
import cloudinary.api
from typing import Optional, Dict, Any
from fastapi import HTTPException, UploadFile
from PIL import Image
import io
import uuid
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class CloudinaryService:
    def __init__(self):
        # Configure Cloudinary
        cloudinary.config(
            cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
            api_key=os.getenv("CLOUDINARY_API_KEY"),
            api_secret=os.getenv("CLOUDINARY_API_SECRET"),
            secure=True
        )
        
        self.upload_preset = os.getenv("CLOUDINARY_UPLOAD_PRESET", "ecommerce")
        
        # Log configuration (without sensitive data)
        print(f"Cloudinary configured with cloud_name: {os.getenv('CLOUDINARY_CLOUD_NAME')}")
    
    async def upload_product_image(self, file: UploadFile, product_id: int) -> Dict[str, Any]:
        """
        Upload product image to Cloudinary with WebP optimization
        
        Args:
            file: The uploaded file
            product_id: The product ID for naming
            
        Returns:
            Dictionary with image URLs and metadata
        """
        try:
            # Validate file type
            if not file.content_type or not file.content_type.startswith('image/'):
                raise HTTPException(status_code=400, detail="File must be an image")
            
            # Read file content
            contents = await file.read()
            
            # Generate unique public ID
            public_id = f"products/product_{product_id}_{uuid.uuid4().hex[:8]}"
            
            # Upload to Cloudinary with WebP format and optimization
            upload_result = cloudinary.uploader.upload(
                contents,
                public_id=public_id,
                folder="ecommerce/products",
                resource_type="image",
                format="webp",
                quality="auto:best",
                fetch_format="auto",
                crop="fill",
                width=800,
                height=600,
                gravity="auto",
                upload_preset=self.upload_preset,
                unique_filename=False,
                overwrite=True,
                tags=["product", f"product_{product_id}"]
            )
            
            # Generate different sizes for responsive images
            thumbnail_url = CloudinaryImage(upload_result['public_id']).build_url(
                width=300, height=225, crop="fill", quality="auto:best", format="webp"
            )
            
            medium_url = CloudinaryImage(upload_result['public_id']).build_url(
                width=600, height=450, crop="fill", quality="auto:best", format="webp"
            )
            
            large_url = CloudinaryImage(upload_result['public_id']).build_url(
                width=1200, height=900, crop="fill", quality="auto:best", format="webp"
            )
            
            return {
                "public_id": upload_result['public_id'],
                "original_url": upload_result['secure_url'],
                "thumbnail_url": thumbnail_url,
                "medium_url": medium_url,
                "large_url": large_url,
                "format": upload_result['format'],
                "width": upload_result['width'],
                "height": upload_result['height'],
                "bytes": upload_result['bytes'],
                "created_at": upload_result['created_at']
            }
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Image upload failed: {str(e)}")
    
    async def upload_image_from_url(self, image_url: str, product_id: int) -> Dict[str, Any]:
        """
        Upload image from URL to Cloudinary with WebP optimization
        
        Args:
            image_url: URL of the image to upload
            product_id: The product ID for naming
            
        Returns:
            Dictionary with image URLs and metadata
        """
        try:
            # Generate unique public ID
            public_id = f"products/product_{product_id}_{uuid.uuid4().hex[:8]}"
            
            # Upload to Cloudinary with WebP format and optimization
            upload_result = cloudinary.uploader.upload(
                image_url,
                public_id=public_id,
                folder="ecommerce/products",
                resource_type="image",
                format="webp",
                quality="auto:best",
                fetch_format="auto",
                crop="fill",
                width=800,
                height=600,
                gravity="auto",
                upload_preset=self.upload_preset,
                unique_filename=False,
                overwrite=True,
                tags=["product", f"product_{product_id}"]
            )
            
            # Generate different sizes for responsive images
            thumbnail_url = CloudinaryImage(upload_result['public_id']).build_url(
                width=300, height=225, crop="fill", quality="auto:best", format="webp"
            )
            
            medium_url = CloudinaryImage(upload_result['public_id']).build_url(
                width=600, height=450, crop="fill", quality="auto:best", format="webp"
            )
            
            large_url = CloudinaryImage(upload_result['public_id']).build_url(
                width=1200, height=900, crop="fill", quality="auto:best", format="webp"
            )
            
            return {
                "public_id": upload_result['public_id'],
                "original_url": upload_result['secure_url'],
                "thumbnail_url": thumbnail_url,
                "medium_url": medium_url,
                "large_url": large_url,
                "format": upload_result['format'],
                "width": upload_result['width'],
                "height": upload_result['height'],
                "bytes": upload_result['bytes'],
                "created_at": upload_result['created_at']
            }
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Image upload failed: {str(e)}")
    
    def delete_image(self, public_id: str) -> Dict[str, Any]:
        """
        Delete image from Cloudinary
        
        Args:
            public_id: The public ID of the image to delete
            
        Returns:
            Deletion result
        """
        try:
            result = cloudinary.uploader.destroy(public_id)
            return result
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Image deletion failed: {str(e)}")
    
    def get_image_info(self, public_id: str) -> Dict[str, Any]:
        """
        Get image information from Cloudinary
        
        Args:
            public_id: The public ID of the image
            
        Returns:
            Image information
        """
        try:
            result = cloudinary.api.resource(public_id)
            return result
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to get image info: {str(e)}")
    
    def transform_image(self, public_id: str, width: int = 400, height: int = 300, crop: str = "fill") -> str:
        """
        Generate transformed image URL
        
        Args:
            public_id: The public ID of the image
            width: Target width
            height: Target height
            crop: Crop mode
            
        Returns:
            Transformed image URL
        """
        return CloudinaryImage(public_id).build_url(
            width=width, 
            height=height, 
            crop=crop, 
            quality="auto:best", 
            format="webp"
        )

# Global instance
cloudinary_service = CloudinaryService()
