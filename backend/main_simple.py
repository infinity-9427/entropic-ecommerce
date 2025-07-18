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

# Mock data for testing (will be replaced with database)
mock_products = [
    {
        "id": 1,
        "name": "Wireless Headphones",
        "price": 99.99,
        "category": "Electronics",
        "image_url": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop",
        "description": "Premium wireless headphones with noise cancellation",
        "stock_quantity": 50,
        "is_active": True
    },
    {
        "id": 2,
        "name": "Smartphone",
        "price": 699.99,
        "category": "Electronics",
        "image_url": "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&h=300&fit=crop",
        "description": "Latest generation smartphone with advanced features",
        "stock_quantity": 30,
        "is_active": True
    },
    {
        "id": 3,
        "name": "Running Shoes",
        "price": 129.99,
        "category": "Sports",
        "image_url": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&h=300&fit=crop",
        "description": "Comfortable running shoes with excellent support",
        "stock_quantity": 75,
        "is_active": True
    },
]

mock_users = []
mock_orders = []
mock_cart_items = []
mock_analytics_events = []

# Root endpoint
@app.get("/")
async def root():
    return {
        "message": "Entropic E-commerce API v2.0",
        "version": "2.0.0",
        "docs": "/docs",
        "features": ["User Management", "Product Catalog", "Shopping Cart", "Order Management", "Analytics"],
        "status": "Development - Database models ready, integrating with PostgreSQL"
    }

# Health check
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "service": "backend-api",
        "version": "2.0.0",
        "database": "PostgreSQL (ready)",
        "features": {
            "authentication": "JWT tokens",
            "database": "SQLAlchemy + PostgreSQL",
            "analytics": "Event tracking",
            "cart": "Session-based shopping cart",
            "orders": "Full order management"
        }
    }

# Authentication endpoints (Mock implementation)
@app.post("/auth/register")
async def register(user_data: dict):
    """Register a new user"""
    # Mock implementation
    user_id = len(mock_users) + 1
    user = {
        "id": user_id,
        "email": user_data.get("email"),
        "username": user_data.get("username"),
        "first_name": user_data.get("first_name"),
        "last_name": user_data.get("last_name"),
        "is_active": True,
        "is_admin": False,
        "created_at": datetime.utcnow().isoformat()
    }
    mock_users.append(user)
    return {"message": "User registered successfully", "user": user}

@app.post("/auth/login")
async def login(credentials: dict):
    """Login user and get access token"""
    # Mock implementation
    return {
        "access_token": "mock_jwt_token_here",
        "token_type": "bearer",
        "expires_in": 1800,
        "user": {
            "id": 1,
            "email": credentials.get("email"),
            "username": "user1",
            "is_admin": False
        }
    }

# Products endpoints
@app.get("/products")
async def get_products(
    skip: int = 0,
    limit: int = 100,
    category: Optional[str] = None
):
    """Get all products with optional filtering"""
    products = mock_products
    
    if category:
        products = [p for p in products if p["category"].lower() == category.lower()]
    
    return products[skip:skip+limit]

@app.get("/products/{product_id}")
async def get_product(product_id: int):
    """Get a specific product by ID"""
    product = next((p for p in mock_products if p["id"] == product_id), None)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@app.post("/products")
async def create_product(product_data: dict):
    """Create a new product (admin only)"""
    product_id = len(mock_products) + 1
    product = {
        "id": product_id,
        "name": product_data.get("name"),
        "price": product_data.get("price"),
        "category": product_data.get("category"),
        "image_url": product_data.get("image_url"),
        "description": product_data.get("description"),
        "stock_quantity": product_data.get("stock_quantity", 0),
        "is_active": True,
        "created_at": datetime.utcnow().isoformat()
    }
    mock_products.append(product)
    return product

# Search endpoint
@app.get("/search")
async def search_products(q: str, category: Optional[str] = None):
    """Search products by name or description"""
    products = mock_products
    
    if category:
        products = [p for p in products if p["category"].lower() == category.lower()]
    
    results = [
        p for p in products
        if q.lower() in p["name"].lower() or q.lower() in p["description"].lower()
    ]
    
    return {"query": q, "results": results, "total": len(results)}

# Categories endpoint
@app.get("/categories")
async def get_categories():
    """Get all available product categories"""
    categories = list(set(p["category"] for p in mock_products))
    return {"categories": categories}

# Cart endpoints
@app.get("/cart")
async def get_cart():
    """Get user's cart"""
    return {
        "items": mock_cart_items,
        "total_items": len(mock_cart_items),
        "total_amount": sum(item["price"] * item["quantity"] for item in mock_cart_items)
    }

@app.post("/cart/add")
async def add_to_cart(item_data: dict):
    """Add item to cart"""
    cart_item = {
        "id": len(mock_cart_items) + 1,
        "product_id": item_data.get("product_id"),
        "quantity": item_data.get("quantity", 1),
        "price": 99.99,  # Mock price
        "created_at": datetime.utcnow().isoformat()
    }
    mock_cart_items.append(cart_item)
    return cart_item

@app.delete("/cart/{product_id}")
async def remove_from_cart(product_id: int):
    """Remove item from cart"""
    global mock_cart_items
    mock_cart_items = [item for item in mock_cart_items if item["product_id"] != product_id]
    return {"message": "Item removed from cart"}

# Orders endpoints
@app.post("/orders")
async def create_order(order_data: dict):
    """Create a new order"""
    order_id = len(mock_orders) + 1
    order = {
        "id": order_id,
        "user_id": 1,  # Mock user ID
        "order_number": f"ORD-{order_id:06d}",
        "total_amount": sum(item["price"] * item["quantity"] for item in mock_cart_items),
        "status": "pending",
        "payment_status": "pending",
        "items": mock_cart_items.copy(),
        "created_at": datetime.utcnow().isoformat()
    }
    mock_orders.append(order)
    mock_cart_items.clear()  # Clear cart after order
    return order

@app.get("/orders")
async def get_orders():
    """Get user's orders"""
    return mock_orders

@app.get("/orders/{order_id}")
async def get_order(order_id: int):
    """Get a specific order"""
    order = next((o for o in mock_orders if o["id"] == order_id), None)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order

# Analytics endpoints
@app.post("/analytics/track")
async def track_event(event_data: dict):
    """Track an analytics event"""
    event = {
        "id": len(mock_analytics_events) + 1,
        "event_type": event_data.get("event_type"),
        "user_id": event_data.get("user_id"),
        "product_id": event_data.get("product_id"),
        "session_id": event_data.get("session_id"),
        "properties": event_data.get("properties", {}),
        "created_at": datetime.utcnow().isoformat()
    }
    mock_analytics_events.append(event)
    return event

@app.get("/analytics/dashboard")
async def get_dashboard_metrics():
    """Get dashboard analytics data"""
    total_users = len(mock_users)
    total_products = len(mock_products)
    total_orders = len(mock_orders)
    total_revenue = sum(order["total_amount"] for order in mock_orders)
    
    # Calculate metrics
    avg_order_value = total_revenue / total_orders if total_orders > 0 else 0
    page_views = len([e for e in mock_analytics_events if e["event_type"] == "page_view"])
    conversion_rate = (total_orders / page_views * 100) if page_views > 0 else 0
    
    # Top categories
    category_counts = {}
    for product in mock_products:
        category = product["category"]
        category_counts[category] = category_counts.get(category, 0) + 1
    
    top_categories = [{"category": cat, "count": count} for cat, count in category_counts.items()]
    
    return {
        "total_users": total_users,
        "total_products": total_products,
        "total_orders": total_orders,
        "total_revenue": float(total_revenue),
        "avg_order_value": float(avg_order_value),
        "conversion_rate": float(conversion_rate),
        "top_categories": top_categories,
        "recent_orders": mock_orders[-10:] if mock_orders else []
    }

@app.get("/analytics/sales")
async def get_sales_metrics(days: int = 30):
    """Get sales metrics"""
    # Mock sales data
    daily_sales = [
        {"date": "2025-01-15", "revenue": 1250.00, "orders": 8},
        {"date": "2025-01-16", "revenue": 980.50, "orders": 6},
        {"date": "2025-01-17", "revenue": 1420.75, "orders": 10},
    ]
    
    top_products = [
        {"name": "Wireless Headphones", "total_sold": 25, "revenue": 2499.75},
        {"name": "Smartphone", "total_sold": 15, "revenue": 10499.85},
        {"name": "Running Shoes", "total_sold": 30, "revenue": 3899.70},
    ]
    
    return {
        "daily_sales": daily_sales,
        "top_products": top_products
    }

@app.get("/analytics/users")
async def get_user_metrics():
    """Get user metrics"""
    return {
        "new_users_today": 5,
        "active_users": 150,
        "user_retention_rate": 75.5,
        "user_activity": [
            {"date": "2025-01-15", "active_users": 145},
            {"date": "2025-01-16", "active_users": 152},
            {"date": "2025-01-17", "active_users": 148},
        ]
    }

@app.get("/analytics/products")
async def get_product_metrics():
    """Get product metrics"""
    return {
        "most_viewed_products": [
            {"name": "Wireless Headphones", "views": 245},
            {"name": "Smartphone", "views": 198},
            {"name": "Running Shoes", "views": 167},
        ],
        "low_stock_products": [
            {"name": "Wireless Headphones", "stock": 8},
            {"name": "Gaming Mouse", "stock": 5},
        ],
        "product_performance": [
            {"name": "Wireless Headphones", "sales": 25, "views": 245, "conversion": 10.2},
            {"name": "Smartphone", "sales": 15, "views": 198, "conversion": 7.6},
        ],
        "category_performance": [
            {"category": "Electronics", "sales": 40, "revenue": 12999.60},
            {"category": "Sports", "sales": 30, "revenue": 3899.70},
        ]
    }

# Admin endpoints
@app.get("/admin/orders")
async def get_all_orders():
    """Get all orders (admin only)"""
    return mock_orders

@app.get("/admin/users")
async def get_all_users():
    """Get all users (admin only)"""
    return mock_users

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
