# Entropic E-commerce Backend with Cloudinary Integration

## Overview

This backend implementation provides a complete e-commerce API with integrated image management using Cloudinary. The system stores product data in PostgreSQL and automatically converts all uploaded images to WebP format for optimal performance.

## Features

- ✅ **Product Management**: Complete CRUD operations for products
- ✅ **Image Upload**: Support for both file uploads and URL imports
- ✅ **WebP Optimization**: All images automatically converted to WebP format
- ✅ **Responsive Images**: Multiple image sizes generated (thumbnail, medium, large)
- ✅ **PostgreSQL Database**: Robust data storage with Docker support
- ✅ **Cloudinary Integration**: Professional image management and CDN
- ✅ **Automatic Cleanup**: Images deleted from Cloudinary when products are deleted
- ✅ **Soft & Hard Delete**: Both soft delete (deactivate) and hard delete (permanent) options

## Prerequisites

- Python 3.11+
- Docker and Docker Compose
- PostgreSQL (via Docker)
- Cloudinary Account

## Installation

1. **Clone the repository and navigate to backend**
   ```bash
   cd /home/dev/code/portfolio/landing-store/backend
   ```

2. **Install dependencies**
   ```bash
   pip install cloudinary python-dotenv pillow
   ```

3. **Set up environment variables**
   Create a `.env` file with your Cloudinary credentials:
   ```env
   # Database Configuration
   DATABASE_URL=postgresql://entropic_user:entropic_password@localhost:5432/entropic_db
   
   # Cloudinary Configuration
   CLOUDINARY_CLOUD_NAME=dlfgfgkyk
   CLOUDINARY_API_KEY=848987724493125
   CLOUDINARY_API_SECRET=CDzkDsvOGLKLHEflDf_NZmLgNJA
   CLOUDINARY_UPLOAD_PRESET=ecommerce
   ```

4. **Start PostgreSQL with Docker**
   ```bash
   docker-compose -f docker-compose.dev.yml up -d
   ```

5. **Test Cloudinary integration**
   ```bash
   python test_cloudinary.py
   ```

## Running the Server

### Development Server (Test)
```bash
# Note: Test server files have been removed for production readiness
# Use the main server instead
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Production Server (Main)
```bash
uvicorn main:app --host 0.0.0.0 --port 8000
```

## API Endpoints

### Products

- `GET /products` - List all products
- `GET /products/{id}` - Get specific product
- `POST /products` - Create new product
- `PUT /products/{id}` - Update product
- `DELETE /products/{id}` - Soft delete product (deactivates product and deletes Cloudinary image)
- `DELETE /products/{id}/hard-delete` - Permanently delete product and Cloudinary image

### Image Management

- `POST /products/{id}/upload-image` - Upload image file
- `POST /products/{id}/upload-image-from-url` - Upload image from URL
- `DELETE /products/{id}/delete-image` - Delete product image

## Usage Examples

### 1. Create a Product

```bash
curl -X POST http://localhost:8000/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Nike Air Max 270",
    "description": "Comfortable running shoes",
    "price": 129.99,
    "category": "Shoes",
    "stock_quantity": 50
  }'
```

### 2. Upload Image from URL

```bash
curl -X POST http://localhost:8000/products/1/upload-image-from-url \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "image_url=https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco/99486859-0ff3-46b4-949b-2d16af2ad421/air-max-270-mens-shoes-KkLcGR.png"
```

### 3. Upload Image File

```bash
curl -X POST http://localhost:8000/products/1/upload-image \
  -H "Content-Type: multipart/form-data" \
  -F "file=@/path/to/your/image.jpg"
```

### 4. Get Product with Images

```bash
curl -X GET http://localhost:8000/products/1
```

Response includes multiple image sizes:
```json
{
  "id": 1,
  "name": "Nike Air Max 270",
  "price": 129.99,
  "image_url": "https://res.cloudinary.com/dlfgfgkyk/image/upload/v1752808727/ecommerce/products/products/product_1_760afe48.webp",
  "image_urls": {
    "thumbnail": "https://res.cloudinary.com/dlfgfgkyk/image/upload/c_fill,h_225,q_auto:best,w_300/v1/ecommerce/products/products/product_1_760afe48.webp",
    "medium": "https://res.cloudinary.com/dlfgfgkyk/image/upload/c_fill,h_450,q_auto:best,w_600/v1/ecommerce/products/products/product_1_760afe48.webp",
    "large": "https://res.cloudinary.com/dlfgfgkyk/image/upload/c_fill,h_900,q_auto:best,w_1200/v1/ecommerce/products/products/product_1_760afe48.webp"
  },
  "cloudinary_public_id": "ecommerce/products/products/product_1_760afe48"
}
```

## Key Features

### Automatic Image Cleanup
When a product is deleted (either soft or hard delete), the associated Cloudinary image is automatically deleted to prevent storage waste and keep your Cloudinary account clean.

### Soft vs Hard Delete
- **Soft Delete** (`DELETE /products/{id}`): Deactivates the product but keeps the database record
- **Hard Delete** (`DELETE /products/{id}/hard-delete`): Permanently removes the product from the database
- **Both methods** automatically delete the associated Cloudinary image

### Automatic WebP Conversion
All uploaded images are automatically converted to WebP format for optimal performance:
- Smaller file sizes (20-35% smaller than JPEG)
- Better compression
- Maintained quality

### Multiple Image Sizes
The system generates multiple image sizes for responsive design:
- **Thumbnail**: 300x225px (for cards, lists)
- **Medium**: 600x450px (for product details)
- **Large**: 1200x900px (for hero images, zoom)
- **Original**: 800x600px (default size)

### Smart Cropping
All images use intelligent cropping (`gravity="auto"`) to focus on the most important parts of the image.

## Database Schema

### Products Table
```sql
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL,
    description TEXT,
    price FLOAT NOT NULL,
    category VARCHAR NOT NULL,
    image_url VARCHAR,
    image_urls JSON,
    cloudinary_public_id VARCHAR,
    stock_quantity INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Project Structure

```
backend/
├── .env                        # Environment variables
├── cloudinary_service.py       # Cloudinary integration service
├── models.py                   # Database models with Cloudinary fields
├── schemas.py                  # Pydantic schemas with image fields
├── services.py                 # Business logic with image cleanup
├── main.py                     # Production FastAPI app
├── database.py                 # Database configuration
├── auth.py                     # Authentication utilities
├── populate_db.py              # Database population script
└── pyproject.toml              # Dependencies with Cloudinary
```

## Testing

### 1. Test Cloudinary Integration
The backend includes automatic Cloudinary image cleanup when products are deleted. This ensures:
- No orphaned images in your Cloudinary account
- Clean storage management
- Automatic cost optimization

### 2. Test API Endpoints
Visit `http://localhost:8000/docs` for interactive API documentation.

### 3. Test Database Connection
The server will automatically fall back to SQLite if PostgreSQL is not available.

### 4. Test Image Cleanup
```bash
# Create a product
curl -X POST http://localhost:8000/products -H "Content-Type: application/json" -d '{"name": "Test Product", "price": 29.99, "category": "Test", "stock_quantity": 10}'

# Upload an image
curl -X POST http://localhost:8000/products/1/upload-image-from-url -H "Content-Type: application/x-www-form-urlencoded" -d "image_url=https://example.com/image.jpg"

# Delete the product (this will also delete the Cloudinary image)
curl -X DELETE http://localhost:8000/products/1
```

## Docker Deployment

### 1. Full Stack Deployment
```bash
cd /home/dev/code/portfolio/landing-store/docker
docker-compose up -d
```

### 2. Database Only
```bash
cd /home/dev/code/portfolio/landing-store/backend
docker-compose -f docker-compose.dev.yml up -d
```

## Configuration

### Environment Variables
- `DATABASE_URL`: PostgreSQL connection string
- `CLOUDINARY_CLOUD_NAME`: Your Cloudinary cloud name
- `CLOUDINARY_API_KEY`: Your Cloudinary API key
- `CLOUDINARY_API_SECRET`: Your Cloudinary API secret
- `CLOUDINARY_UPLOAD_PRESET`: Upload preset name

### Cloudinary Settings
- **Format**: WebP (automatic)
- **Quality**: auto:best
- **Crop**: fill with auto gravity
- **Folder**: ecommerce/products
- **Security**: Secure HTTPS URLs

## Performance Optimizations

1. **WebP Format**: 20-35% smaller file sizes
2. **Auto Quality**: Optimal quality/size balance
3. **CDN Delivery**: Global content delivery network
4. **Lazy Loading**: Multiple sizes for responsive images
5. **Database Indexing**: Optimized queries

## Security Features

- Secure HTTPS image URLs
- Input validation for file types
- SQL injection protection
- Environment variable protection
- Error handling and logging

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Ensure PostgreSQL is running: `docker-compose -f docker-compose.dev.yml up -d`
   - Check DATABASE_URL in .env file

2. **Cloudinary Upload Fails**
   - Verify credentials in .env file
   - Test with `python test_cloudinary.py`

3. **Image Not Displaying**
   - Check if image_url is properly saved in database
   - Verify Cloudinary public_id exists

### Logs and Debugging

- Server logs: Check uvicorn output
- Database queries: Set SQLAlchemy echo=True
- Cloudinary errors: Check API response details

## Next Steps

1. **Add Authentication**: Implement JWT-based user authentication
2. **Add Rate Limiting**: Protect against abuse
3. **Add Batch Upload**: Multiple image upload support
4. **Add Image Variants**: Different crops and filters
5. **Add Analytics**: Track image performance
6. **Add Caching**: Redis for frequently accessed data

## API Documentation

Interactive API documentation is available at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Support

For issues or questions, check the logs and ensure all dependencies are properly installed and configured.

---

**Status**: ✅ **WORKING** - Cloudinary integration is fully functional with PostgreSQL database, WebP optimization, and responsive image generation.
