"""
Entropic E-commerce Backend API
FastAPI-based REST API for the e-commerce platform with PostgreSQL database
"""

from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta
import os

from .database import get_db, create_tables
from .models import User, Product, Order, CartItem, AnalyticsEvent
from .schemas import (
    UserCreate, UserResponse, UserLogin, Token,
    ProductCreate, ProductUpdate, ProductResponse,
    CartItemCreate, CartItemUpdate, CartItemResponse, CartResponse,
    OrderCreate, OrderResponse,
    AnalyticsEventCreate, AnalyticsEventResponse,
    DashboardMetrics, SalesMetrics, UserMetrics, ProductMetrics
)
from .services import UserService, ProductService, CartService, OrderService, AnalyticsService
from .auth import create_access_token, verify_token, ACCESS_TOKEN_EXPIRE_MINUTES

# Create tables on startup
create_tables()

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

# Security
security = HTTPBearer()

# Authentication dependency
def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    token = credentials.credentials
    email = verify_token(token)
    user_service = UserService(db)
    user = user_service.get_user_by_email(email)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user

# Optional authentication dependency
def get_current_user_optional(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    try:
        return get_current_user(credentials, db)
    except:
        return None

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

@app.post("/products", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
async def create_product(
    product: ProductCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new product (admin only)"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    product_service = ProductService(db)
    return product_service.create_product(product)

@app.put("/products/{product_id}", response_model=ProductResponse)
async def update_product(
    product_id: int,
    product_update: ProductUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a product (admin only)"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    product_service = ProductService(db)
    product = product_service.update_product(product_id, product_update)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@app.delete("/products/{product_id}")
async def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a product (admin only)"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    product_service = ProductService(db)
    success = product_service.delete_product(product_id)
    if not success:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"message": "Product deleted successfully"}

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
    cart_service = CartService(db)
    cart_items = cart_service.get_cart(current_user.id)
    total_amount = cart_service.get_cart_total(current_user.id)
    
    return {
        "items": cart_items,
        "total_items": len(cart_items),
        "total_amount": total_amount
    }

@app.post("/cart/add", response_model=CartItemResponse)
async def add_to_cart(
    item: CartItemCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Add item to cart"""
    cart_service = CartService(db)
    cart_item = cart_service.add_to_cart(current_user.id, item.product_id, item.quantity)
    return cart_item

@app.put("/cart/{product_id}", response_model=CartItemResponse)
async def update_cart_item(
    product_id: int,
    item_update: CartItemUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update cart item quantity"""
    cart_service = CartService(db)
    cart_item = cart_service.update_cart_item(current_user.id, product_id, item_update.quantity)
    if not cart_item:
        raise HTTPException(status_code=404, detail="Cart item not found")
    return cart_item

@app.delete("/cart/{product_id}")
async def remove_from_cart(
    product_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Remove item from cart"""
    cart_service = CartService(db)
    success = cart_service.remove_from_cart(current_user.id, product_id)
    if not success:
        raise HTTPException(status_code=404, detail="Cart item not found")
    return {"message": "Item removed from cart"}

@app.delete("/cart")
async def clear_cart(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Clear user's cart"""
    cart_service = CartService(db)
    cart_service.clear_cart(current_user.id)
    return {"message": "Cart cleared"}

# Orders endpoints
@app.post("/orders", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
async def create_order(
    order_data: OrderCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new order"""
    order_service = OrderService(db)
    try:
        order = order_service.create_order(current_user.id, order_data)
        return order
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/orders", response_model=List[OrderResponse])
async def get_orders(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's orders"""
    order_service = OrderService(db)
    orders = order_service.get_user_orders(current_user.id, skip=skip, limit=limit)
    return orders

@app.get("/orders/{order_id}", response_model=OrderResponse)
async def get_order(
    order_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific order"""
    order_service = OrderService(db)
    order = order_service.get_order(order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # Check if user owns the order or is admin
    if order.user_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    return order

# Analytics endpoints
@app.post("/analytics/track", response_model=AnalyticsEventResponse)
async def track_event(
    event: AnalyticsEventCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_optional)
):
    """Track an analytics event"""
    analytics_service = AnalyticsService(db)
    
    # Add user_id if authenticated
    if current_user:
        event.user_id = current_user.id
    
    db_event = analytics_service.track_event(event)
    return db_event

@app.get("/analytics/dashboard")
async def get_dashboard_metrics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get dashboard analytics data (admin only)"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    analytics_service = AnalyticsService(db)
    metrics = analytics_service.get_dashboard_metrics()
    return metrics

@app.get("/analytics/sales")
async def get_sales_metrics(
    days: int = 30,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get sales metrics (admin only)"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    analytics_service = AnalyticsService(db)
    metrics = analytics_service.get_sales_metrics(days)
    return metrics

@app.get("/analytics/users")
async def get_user_metrics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get user metrics (admin only)"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    analytics_service = AnalyticsService(db)
    metrics = analytics_service.get_user_metrics()
    return metrics

@app.get("/analytics/products")
async def get_product_metrics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get product metrics (admin only)"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    analytics_service = AnalyticsService(db)
    metrics = analytics_service.get_product_metrics()
    return metrics

# Admin endpoints
@app.get("/admin/orders", response_model=List[OrderResponse])
async def get_all_orders(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all orders (admin only)"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    order_service = OrderService(db)
    orders = order_service.get_orders(skip=skip, limit=limit)
    return orders

@app.get("/admin/users", response_model=List[UserResponse])
async def get_all_users(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all users (admin only)"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    user_service = UserService(db)
    users = user_service.get_users(skip=skip, limit=limit)
    return users

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
