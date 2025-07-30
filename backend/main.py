"""
Entropic E-commerce Backend API
FastAPI-based REST API for the e-commerce platform with PostgreSQL database
"""

from fastapi import FastAPI, HTTPException, Depends, status, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta
import os

from app.core import get_db, create_tables, create_access_token, verify_token, ACCESS_TOKEN_EXPIRE_MINUTES
from app.models import User, Product, Order, CartItem, AnalyticsEvent
from app.schemas import (
    UserCreate, UserResponse, UserLogin, Token,
    ProductCreate, ProductUpdate, ProductResponse,
    CartItemCreate, CartItemUpdate, CartItemResponse, CartResponse,
    OrderCreate, OrderResponse,
    AnalyticsEventCreate, AnalyticsEventResponse,
    DashboardMetrics, ImageUploadResponse
)
from app.services import UserService, ProductService, CartService, OrderService, AnalyticsService, CloudinaryService
from app.api.rag import router as rag_router

# Create tables on startup
create_tables()

# Initialize services
cloudinary_service = CloudinaryService()

# Initialize FastAPI app
app = FastAPI(
    title="Entropic E-commerce API",
    description="Backend API for Entropic e-commerce platform with PostgreSQL",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://entropic.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers
app.include_router(rag_router)

# Security
security = HTTPBearer()

# Authentication dependency
def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    # TODO: Remove this development bypass before production
    # Development bypass for testing - always return admin user
    user_service = UserService(db)
    
    # First check if any admin user exists
    admin_user = db.query(User).filter(User.is_admin == True).first()
    if admin_user:
        print(f"✅ Using existing admin user: {admin_user.username} ({admin_user.email})")
        return admin_user
    
    # If no admin user found, create one for development
    from app.schemas import UserCreate
    from app.core import get_password_hash
    
    print("🔧 Creating admin user for development...")
    
    try:
        # Create admin user directly in database
        hashed_password = get_password_hash("admin123")
        admin_user = User(
            email="admin@entropic.com",
            username="admin",
            hashed_password=hashed_password,
            first_name="Admin",
            last_name="User",
            is_admin=True,
            is_active=True,
            is_verified=False
        )
        db.add(admin_user)
        db.flush()  # Flush to catch IntegrityError before commit
        db.commit()
        db.refresh(admin_user)
        print(f"✅ Created admin user: {admin_user.username}")
        return admin_user
        
    except Exception as e:
        print(f"❌ Error creating admin user: {str(e)}")
        db.rollback()
        
        # Check one more time if admin user exists (race condition or existing user)
        admin_user = db.query(User).filter(User.is_admin == True).first()
        if admin_user:
            print(f"✅ Retrieved existing admin user after error: {admin_user.username}")
            return admin_user
        
        # If we still can't get the admin user, raise an error
        raise HTTPException(status_code=500, detail="Failed to create or retrieve admin user")

# Optional authentication dependency
def get_current_user_optional(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security), db: Session = Depends(get_db)):
    try:
        if credentials:
            return get_current_user(credentials, db)
        else:
            # For development, return admin user even without credentials
            user_service = UserService(db)
            admin_user = db.query(User).filter(User.is_admin == True).first()
            return admin_user
    except:
        return None

# Helper function to safely get user attributes
def get_user_attr(user: User, attr: str, default=None):
    """Safely get user attribute handling SQLAlchemy Column types"""
    try:
        if user is None:
            return default
        value = getattr(user, attr, default)
        # For SQLAlchemy models, attributes are directly accessible
        return value
    except Exception:
        return default

# Root endpoint
@app.get("/")
async def root():
    return {
        "message": "Entropic E-commerce API v2.0",
        "version": "2.0.0",
        "docs": "/docs",
        "features": ["User Management", "Product Catalog", "Shopping Cart", "Order Management", "Analytics"]
    }

# Health check
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "service": "backend-api",
        "version": "2.0.0"
    }

# Authentication endpoints
@app.post("/auth/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user: UserCreate, db: Session = Depends(get_db)):
    """Register a new user"""
    user_service = UserService(db)
    
    # Check if user already exists
    if user_service.get_user_by_email(user.email):
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )
    
    db_user = user_service.create_user(user)
    return db_user

@app.post("/auth/login", response_model=Token)
async def login(user_credentials: UserLogin, db: Session = Depends(get_db)):
    """Login user and get access token"""
    user_service = UserService(db)
    user = user_service.authenticate_user(user_credentials.email, user_credentials.password)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/auth/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    """Get current user profile"""
    return current_user

# Products endpoints
@app.get("/products", response_model=List[ProductResponse])
async def get_products(
    skip: int = 0,
    limit: int = 100,
    category: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get all products with optional filtering"""
    product_service = ProductService(db)
    products = product_service.get_products(skip=skip, limit=limit, category=category)
    return products

@app.get("/products/{product_id}", response_model=ProductResponse)
async def get_product(product_id: int, db: Session = Depends(get_db)):
    """Get a specific product by ID"""
    product_service = ProductService(db)
    product = product_service.get_product(product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@app.get("/products/search/{query}")
async def search_products_vector(
    query: str,
    limit: int = 10,
    similarity_threshold: float = 0.7,
    category: Optional[str] = None,
    brand: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    in_stock_only: bool = False,
    featured_only: bool = False
):
    """Basic product search - for advanced AI-powered search use /rag/enhanced"""
    try:
        # Use basic product service search instead of vector search
        product_service = ProductService(db=next(get_db()))
        products = product_service.search_products(query, category)
        
        # Apply additional filters
        if brand:
            products = [p for p in products if p.brand and brand.lower() in p.brand.lower()]
        if min_price is not None:
            products = [p for p in products if p.price >= min_price]
        if max_price is not None:
            products = [p for p in products if p.price <= max_price]
        if in_stock_only:
            products = [p for p in products if p.inventory_count > 0]
        if featured_only:
            products = [p for p in products if p.is_featured]
        
        # Limit results
        products = products[:limit]
        
        return {
            "query": query,
            "filters": {
                "category": category,
                "brand": brand,
                "min_price": min_price,
                "max_price": max_price,
                "in_stock_only": in_stock_only,
                "featured_only": featured_only
            },
            "results": [{"id": p.id, "name": p.name, "price": p.price, "category": p.category} for p in products],
            "count": len(products),
            "note": "For AI-powered search with vector similarity, use /rag/enhanced"
        }
    except Exception as e:
        return {
            "query": query,
            "results": [],
            "count": 0,
            "error": f"Search error: {str(e)}"
        }

@app.get("/products/search/category/{category}/insights")
async def get_category_insights(category: str, limit: int = 5):
    """Basic category insights - for AI-powered insights use /rag/enhanced"""
    try:
        product_service = ProductService(db=next(get_db()))
        products = product_service.get_products(category=category, limit=limit)
        
        return {
            "category": category,
            "insights": f"Found {len(products)} products in {category} category",
            "top_products": [{"id": p.id, "name": p.name, "price": p.price} for p in products[:limit]],
            "note": "For AI-powered category insights, use /rag/enhanced"
        }
    except Exception as e:
        return {
            "category": category,
            "error": f"Failed to generate insights: {str(e)}"
        }

@app.post("/products", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
async def create_product(
    product: ProductCreate,
    db: Session = Depends(get_db)
):
    """Create a new product (admin only)"""
    # TODO: Re-enable authentication check for production
    # if not get_user_attr(current_user, 'is_admin', False):
    #     raise HTTPException(status_code=403, detail="Not enough permissions")
    
    product_service = ProductService(db)
    return product_service.create_product(product)

@app.put("/products/{product_id}", response_model=ProductResponse)
async def update_product(
    product_id: int,
    product_update: ProductUpdate,
    db: Session = Depends(get_db)
):
    """Update a product (admin only)"""
    # TODO: Re-enable authentication check for production
    # if not get_user_attr(current_user, 'is_admin', False):
    #     raise HTTPException(status_code=403, detail="Not enough permissions")
    
    product_service = ProductService(db)
    product = product_service.update_product(product_id, product_update)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@app.delete("/products/{product_id}")
async def delete_product(
    product_id: int,
    db: Session = Depends(get_db)
):
    """Delete a product (admin only)"""
    # TODO: Re-enable authentication check for production
    # if not get_user_attr(current_user, 'is_admin', False):
    #     raise HTTPException(status_code=403, detail="Not enough permissions")
    
    product_service = ProductService(db)
    success = product_service.delete_product(product_id)
    if not success:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"message": "Product deleted successfully"}

@app.delete("/products/{product_id}/hard-delete")
async def hard_delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Permanently delete a product and its image (admin only)"""
    if not getattr(current_user, 'is_admin', False):
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    product_service = ProductService(db)
    success = product_service.hard_delete_product(product_id)
    if not success:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"message": "Product permanently deleted successfully"}

# Image upload endpoints
@app.post("/products/{product_id}/upload-image", response_model=ImageUploadResponse)
async def upload_product_image(
    product_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Upload image for a product (admin only)"""
    if not get_user_attr(current_user, 'is_admin', False):
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    # Check if product exists
    product_service = ProductService(db)
    product = product_service.get_product(product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Upload image to Cloudinary
    try:
        image_data = await cloudinary_service.upload_product_image(file, product_id)
        
        # Update product with image URLs
        image_urls = {
            "thumbnail": image_data["thumbnail_url"],
            "medium": image_data["medium_url"],
            "large": image_data["large_url"],
            "original": image_data["original_url"]
        }
        
        # Also update the cloudinary_public_id in the database
        product_service.update_product_cloudinary_id(product_id, image_data["public_id"])
        
        return ImageUploadResponse(**image_data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Image upload failed: {str(e)}")

@app.post("/products/{product_id}/upload-image-from-url", response_model=ImageUploadResponse)
async def upload_product_image_from_url(
    product_id: int,
    image_url: str = Form(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Upload image from URL for a product (admin only)"""
    if not get_user_attr(current_user, 'is_admin', False):
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    # Check if product exists
    product_service = ProductService(db)
    product = product_service.get_product(product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Upload image to Cloudinary
    try:
        image_data = await cloudinary_service.upload_image_from_url(image_url, product_id)
        
        # Update product with image URLs
        image_urls = {
            "thumbnail": image_data["thumbnail_url"],
            "medium": image_data["medium_url"],
            "large": image_data["large_url"],
            "original": image_data["original_url"]
        }
        
        # Also update the cloudinary_public_id in the database
        product_service.update_product_cloudinary_id(product_id, image_data["public_id"])
        
        return ImageUploadResponse(**image_data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Image upload failed: {str(e)}")

@app.delete("/products/{product_id}/delete-image")
async def delete_product_image(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete image for a product (admin only)"""
    if not get_user_attr(current_user, 'is_admin', False):
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    # Check if product exists
    product_service = ProductService(db)
    product = product_service.get_product(product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Delete image from Cloudinary if it exists
    cloudinary_public_id = get_user_attr(product, 'cloudinary_public_id')
    if cloudinary_public_id:
        try:
            cloudinary_service.delete_image(cloudinary_public_id)
        except Exception as e:
            print(f"Failed to delete image from Cloudinary: {str(e)}")
    
    # Update product to remove image URLs
    product_service.update_product_cloudinary_id(product_id, None)
    
    return {"message": "Product image deleted successfully"}

# Search endpoint
@app.get("/search")
async def search_products(
    q: str,
    category: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Search products by name or description"""
    product_service = ProductService(db)
    products = product_service.search_products(q, category)
    return {"query": q, "results": products, "total": len(products)}

# Categories endpoint
@app.get("/categories")
async def get_categories(db: Session = Depends(get_db)):
    """Get all available product categories"""
    product_service = ProductService(db)
    products = product_service.get_products(limit=1000)  # Get all products
    categories = list(set(product.category for product in products))
    return {"categories": categories}

# Cart endpoints
@app.get("/cart", response_model=CartResponse)
async def get_cart(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's cart"""
    try:
        cart_service = CartService(db)
        user_id = current_user.id  # Direct access since current_user is required
        cart_items = cart_service.get_cart(user_id)
        total_amount = cart_service.get_cart_total(user_id)
        
        return {
            "items": cart_items or [],
            "total_items": len(cart_items or []),
            "total_amount": total_amount or 0.0
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get cart: {str(e)}")

@app.post("/cart/add", response_model=CartItemResponse)
async def add_to_cart(
    item: CartItemCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Add item to cart"""
    try:
        cart_service = CartService(db)
        user_id = get_user_attr(current_user, 'id')
        cart_item = cart_service.add_to_cart(user_id, item.product_id, item.quantity)
        return cart_item
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to add to cart: {str(e)}")

@app.put("/cart/{product_id}", response_model=CartItemResponse)
async def update_cart_item(
    product_id: int,
    item_update: CartItemUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update cart item quantity"""
    try:
        cart_service = CartService(db)
        user_id = get_user_attr(current_user, 'id')
        cart_item = cart_service.update_cart_item(user_id, product_id, item_update.quantity)
        if not cart_item:
            raise HTTPException(status_code=404, detail="Cart item not found")
        return cart_item
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update cart item: {str(e)}")

@app.delete("/cart/{product_id}")
async def remove_from_cart(
    product_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Remove item from cart"""
    try:
        cart_service = CartService(db)
        user_id = get_user_attr(current_user, 'id')
        success = cart_service.remove_from_cart(user_id, product_id)
        if not success:
            raise HTTPException(status_code=404, detail="Cart item not found")
        return {"message": "Item removed from cart"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to remove from cart: {str(e)}")

@app.delete("/cart")
async def clear_cart(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Clear user's cart"""
    try:
        cart_service = CartService(db)
        user_id = get_user_attr(current_user, 'id')
        cart_service.clear_cart(user_id)
        return {"message": "Cart cleared"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to clear cart: {str(e)}")

# Orders endpoints
@app.post("/orders", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
async def create_order(
    order_data: OrderCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new order"""
    try:
        order_service = OrderService(db)
        user_id = get_user_attr(current_user, 'id')
        order = order_service.create_order(user_id, order_data)
        return order
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create order: {str(e)}")

@app.get("/orders", response_model=List[OrderResponse])
async def get_orders(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's orders"""
    try:
        order_service = OrderService(db)
        user_id = get_user_attr(current_user, 'id')
        orders = order_service.get_user_orders(user_id, skip=skip, limit=limit)
        return orders or []
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get orders: {str(e)}")

@app.get("/orders/{order_id}", response_model=OrderResponse)
async def get_order(
    order_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific order"""
    try:
        order_service = OrderService(db)
        order = order_service.get_order(order_id)
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        
        # Check if user owns the order or is admin
        user_id = get_user_attr(current_user, 'id')
        is_admin = get_user_attr(current_user, 'is_admin', False)
        order_user_id = get_user_attr(order, 'user_id')
        
        if order_user_id != user_id and not is_admin:
            raise HTTPException(status_code=403, detail="Not enough permissions")
        
        return order
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get order: {str(e)}")

# Analytics endpoints
@app.post("/analytics/track", response_model=AnalyticsEventResponse)
async def track_event(
    event: AnalyticsEventCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_optional)
):
    """Track an analytics event"""
    try:
        analytics_service = AnalyticsService(db)
        
        # Add user_id if authenticated
        if current_user:
            user_id = get_user_attr(current_user, 'id')
            if user_id:
                event.user_id = user_id
        
        db_event = analytics_service.track_event(event)
        return db_event
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to track event: {str(e)}")

@app.get("/analytics/dashboard")
async def get_dashboard_metrics(
    db: Session = Depends(get_db)
):
    """Get dashboard analytics data (temporarily accessible to all users)"""
    try:
        analytics_service = AnalyticsService(db)
        metrics = analytics_service.get_dashboard_metrics()
        return metrics
    except Exception as e:
        # Return fallback data if there's an error
        return {
            "total_users": 0,
            "total_products": 0,
            "total_orders": 0,
            "total_revenue": 0.0,
            "avg_order_value": 0.0,
            "conversion_rate": 0.0,
            "page_views": 0,
            "product_views": 0,
            "top_categories": [],
            "recent_orders_count": 0,
            "recent_orders": []
        }

@app.get("/analytics/sales")
async def get_sales_metrics(
    days: int = 30,
    db: Session = Depends(get_db)
):
    """Get sales metrics (temporarily accessible to all users)"""
    try:
        analytics_service = AnalyticsService(db)
        metrics = analytics_service.get_sales_metrics(days)
        return metrics
    except Exception as e:
        # Return fallback data if there's an error
        return {
            "daily_sales": [],
            "top_products": [],
            "period_days": days
        }

@app.get("/analytics/users")
async def get_user_metrics(
    db: Session = Depends(get_db)
):
    """Get user metrics (temporarily accessible to all users)"""
    try:
        analytics_service = AnalyticsService(db)
        metrics = analytics_service.get_user_metrics()
        return metrics
    except Exception as e:
        # Return fallback data if there's an error
        return {
            "new_users_today": 0,
            "total_users": 0,
            "users_with_orders": 0,
            "conversion_rate": 0.0
        }

@app.get("/analytics/products")
async def get_product_metrics(
    db: Session = Depends(get_db)
):
    """Get product metrics (temporarily accessible to all users)"""
    try:
        analytics_service = AnalyticsService(db)
        metrics = analytics_service.get_product_metrics()
        return metrics
    except Exception as e:
        # Return fallback data if there's an error
        return {
            "most_viewed_products": [],
            "low_stock_products": [],
            "total_products": 0
        }

# Admin endpoints
@app.get("/admin/orders", response_model=List[OrderResponse])
async def get_all_orders(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    # TODO: Re-enable authentication for production
    # current_user: User = Depends(get_current_user)
):
    """Get all orders (admin only) - Temporarily accessible without auth for development"""
    # TODO: Re-enable admin check for production
    # if not get_user_attr(current_user, 'is_admin', False):
    #     raise HTTPException(status_code=403, detail="Not enough permissions")
    
    try:
        order_service = OrderService(db)
        orders = order_service.get_orders(skip=skip, limit=limit)
        return orders or []
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get orders: {str(e)}")

@app.get("/admin/users", response_model=List[UserResponse])
async def get_all_users(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    # TODO: Re-enable authentication for production
    # current_user: User = Depends(get_current_user)
):
    """Get all users (admin only) - Temporarily accessible without auth for development"""
    # TODO: Re-enable admin check for production
    # if not get_user_attr(current_user, 'is_admin', False):
    #     raise HTTPException(status_code=403, detail="Not enough permissions")
    
    try:
        user_service = UserService(db)
        users = user_service.get_users(skip=skip, limit=limit)
        return users or []
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get users: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
