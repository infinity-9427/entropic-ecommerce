# Entropic E-commerce: Scalable Database Architecture

## 🏗️ Architecture Overview

This e-commerce platform uses a **hybrid database approach** to maximize scalability, performance, and capabilities:

### **Primary Database: Neon PostgreSQL**
- **Purpose**: Transactional data (ACID compliance required)
- **Data**: Users, Products, Orders, Cart, Analytics
- **Benefits**: 
  - ACID transactions for financial data
  - Complex queries and joins
  - Mature ecosystem
  - Serverless scaling with Neon

### **Secondary Database: Supabase**
- **Purpose**: Real-time features and vector embeddings
- **Data**: Product search embeddings, real-time notifications
- **Benefits**:
  - Built-in vector similarity search
  - Real-time subscriptions
  - Built-in auth (backup)
  - Edge functions

### **Media Storage: Cloudinary**
- **Purpose**: Image and media asset management
- **Features**:
  - Automatic optimization
  - Multiple size variants
  - CDN delivery
  - AI-powered cropping

---

## 📊 Database Schema

### Enhanced Product Model
```python
class Product:
    # Core product information
    id, name, description, price, category, brand, sku
    
    # Enhanced image handling (REQUIRED)
    images: List[ProductImage]  # Multiple images with metadata
    primary_image_url: str      # Main display image (required)
    
    # Inventory management
    stock_quantity, cost_price, compare_at_price
    
    # Physical attributes
    weight, dimensions (JSON: {length, width, height})
    
    # SEO and discoverability
    meta_title, meta_description, slug, tags
    
    # Product status
    is_active, is_featured, is_digital
```

### Enhanced User Model
```python
class User:
    # Authentication
    email, username, hashed_password
    
    # Personal information
    first_name, last_name, phone, date_of_birth
    
    # Addresses (JSON storage for flexibility)
    shipping_address, billing_address
    
    # Preferences
    preferred_currency, preferred_language
    newsletter_subscribed, marketing_emails
    
    # Account status
    is_active, is_admin, is_verified
    verification_token, last_login
```

### Enhanced Order System
```python
class Order:
    # Order identification
    id, order_number, user_id
    
    # Financial breakdown
    subtotal, tax_amount, shipping_amount, discount_amount, total_amount
    
    # Status tracking
    status, fulfillment_status, payment_status
    
    # Shipping information
    shipping_method, tracking_number, carrier
    estimated_delivery, actual_delivery
    
    # Addresses and payment
    shipping_address, billing_address, payment_method, payment_id

class OrderItem:
    # Product details (snapshot at purchase time)
    product_name, product_sku, variant_name
    unit_price, quantity, total_price
    
    # References
    product_id, product_variant_id, order_id
```

---

## 🔍 Search & Discovery

### Vector Search with Supabase
```sql
-- Supabase table for embeddings
CREATE TABLE product_embeddings (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    embedding VECTOR(1536),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vector similarity index
CREATE INDEX ON product_embeddings 
USING ivfflat (embedding vector_cosine_ops) 
WITH (lists = 100);
```

### Search Function
```sql
-- PostgreSQL function for semantic search
CREATE OR REPLACE FUNCTION search_products(
    query_embedding VECTOR(1536),
    similarity_threshold FLOAT DEFAULT 0.7,
    match_count INT DEFAULT 10
)
RETURNS TABLE (
    product_id INT,
    content TEXT,
    similarity FLOAT
)
LANGUAGE SQL
AS $$
    SELECT 
        product_id,
        content,
        1 - (embedding <=> query_embedding) AS similarity
    FROM product_embeddings
    WHERE 1 - (embedding <=> query_embedding) > similarity_threshold
    ORDER BY similarity DESC
    LIMIT match_count;
$$;
```

---

## 🚀 Getting Started

### 1. Environment Setup
```bash
# Copy environment variables
cp .env.example .env

# Configure your .env file:
NEON_PSQL_URL=postgresql://user:pass@host/db
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_API_KEY=your-anon-key
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
OPEN_ROUTER_API_KEY=your-openrouter-key
```

### 2. Install Dependencies
```bash
cd backend
pip install -e .
```

### 3. Database Setup
```bash
# Run the setup script
python setup_database.py
```

### 4. Start the Server
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

---

## 📸 Image Management

### Required Image Structure
Every product **must** have at least one image:

```python
# Product image schema
{
    "url": "https://cloudinary.com/image.jpg",
    "public_id": "product_123_main",
    "alt_text": "Product description",
    "width": 800,
    "height": 600,
    "is_primary": True  # One image must be primary
}
```

### Image Upload Process
1. **Upload to Cloudinary**: Multiple sizes auto-generated
2. **Store metadata**: URLs, dimensions, public_ids
3. **Set primary image**: Required for product display
4. **Update search index**: Include image data in embeddings

### Multiple Image Support
```python
# Upload multiple images
POST /api/products/{id}/images
Content-Type: multipart/form-data

# Response includes all image variants
{
    "images": [
        {
            "url": "https://res.cloudinary.com/...",
            "thumbnail_url": "https://res.cloudinary.com/.../c_thumb,w_150,h_150/...",
            "medium_url": "https://res.cloudinary.com/.../c_fit,w_400,h_400/...",
            "large_url": "https://res.cloudinary.com/.../c_fit,w_800,h_800/..."
        }
    ]
}
```

---

## 🔧 API Endpoints

### Products
- `GET /api/products` - List products with filters
- `POST /api/products` - Create product (requires images)
- `PUT /api/products/{id}` - Update product
- `POST /api/products/{id}/images` - Upload product images
- `GET /api/search/products?q={query}` - Semantic search

### Orders
- `POST /api/orders` - Create order from cart
- `GET /api/orders/{id}` - Get order details
- `PUT /api/orders/{id}/status` - Update order status
- `GET /api/orders/{id}/tracking` - Get tracking info

### Users
- `POST /api/users/register` - User registration
- `POST /api/users/login` - User authentication
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile
- `POST /api/users/addresses` - Add address

---

## 🧪 Testing the Setup

### 1. Check Database Connection
```bash
curl http://localhost:8000/health
```

### 2. Create Test Product
```bash
curl -X POST "http://localhost:8000/api/products" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Product",
    "description": "A test product",
    "price": 99.99,
    "category": "Electronics",
    "images": [{
      "url": "https://via.placeholder.com/400",
      "public_id": "test_main",
      "alt_text": "Test product",
      "is_primary": true
    }],
    "primary_image_url": "https://via.placeholder.com/400",
    "stock_quantity": 10,
    "sku": "TEST-001"
  }'
```

### 3. Test Search
```bash
curl "http://localhost:8000/api/search/products?q=electronics"
```

---

## 🚀 Production Deployment

### Environment Variables
- Set all production URLs and keys
- Use strong JWT secrets
- Configure proper CORS origins

### Database Migrations
- Use Alembic for schema changes
- Backup before migrations
- Test on staging first

### Monitoring
- Set up logging for search queries
- Monitor embedding generation costs
- Track API performance metrics

---

## 📈 Scalability Features

1. **Horizontal Scaling**: Neon auto-scales based on demand
2. **Caching**: Redis for session and frequently accessed data
3. **CDN**: Cloudinary provides global image delivery
4. **Search Performance**: Vector indexes for fast semantic search
5. **Real-time Updates**: Supabase for live inventory/order updates

This architecture provides a solid foundation for a production e-commerce platform that can scale from hundreds to millions of products while maintaining excellent search capabilities and user experience.
