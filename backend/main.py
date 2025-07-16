"""
Entropic E-commerce Backend API
FastAPI-based REST API for the e-commerce platform
"""

from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import List, Optional
import os
from datetime import datetime

# Initialize FastAPI app
app = FastAPI(
    title="Entropic E-commerce API",
    description="Backend API for Entropic e-commerce platform",
    version="1.0.0",
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

# Pydantic models
class Product(BaseModel):
    id: str
    name: str
    price: float
    category: str
    image: str
    description: str
    stock: int = 100
    created_at: datetime = datetime.now()

class ProductCreate(BaseModel):
    name: str
    price: float
    category: str
    image: str
    description: str
    stock: int = 100

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    price: Optional[float] = None
    category: Optional[str] = None
    image: Optional[str] = None
    description: Optional[str] = None
    stock: Optional[int] = None

class User(BaseModel):
    id: str
    email: str
    name: str
    created_at: datetime = datetime.now()

class Order(BaseModel):
    id: str
    user_id: str
    products: List[dict]
    total: float
    status: str = "pending"
    created_at: datetime = datetime.now()

# Mock database
products_db = [
    Product(
        id="1",
        name="Wireless Headphones",
        price=99.99,
        category="Electronics",
        image="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop",
        description="Premium wireless headphones with noise cancellation",
        stock=50
    ),
    Product(
        id="2",
        name="Smartphone",
        price=699.99,
        category="Electronics",
        image="https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&h=300&fit=crop",
        description="Latest generation smartphone with advanced features",
        stock=30
    ),
    Product(
        id="3",
        name="Running Shoes",
        price=129.99,
        category="Sports",
        image="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&h=300&fit=crop",
        description="Comfortable running shoes with excellent support",
        stock=75
    ),
]

orders_db = []
users_db = []

# Root endpoint
@app.get("/")
async def root():
    return {
        "message": "Entropic E-commerce API",
        "version": "1.0.0",
        "docs": "/docs"
    }

# Health check
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "service": "backend-api"
    }

# Products endpoints
@app.get("/products", response_model=List[Product])
async def get_products(
    category: Optional[str] = None,
    limit: Optional[int] = None,
    skip: Optional[int] = 0
):
    """Get all products with optional filtering"""
    filtered_products = products_db
    
    if category:
        filtered_products = [p for p in filtered_products if p.category.lower() == category.lower()]
    
    if skip:
        filtered_products = filtered_products[skip:]
    
    if limit:
        filtered_products = filtered_products[:limit]
    
    return filtered_products

@app.get("/products/{product_id}", response_model=Product)
async def get_product(product_id: str):
    """Get a specific product by ID"""
    product = next((p for p in products_db if p.id == product_id), None)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@app.post("/products", response_model=Product, status_code=status.HTTP_201_CREATED)
async def create_product(product: ProductCreate):
    """Create a new product"""
    new_id = str(len(products_db) + 1)
    new_product = Product(id=new_id, **product.dict())
    products_db.append(new_product)
    return new_product

@app.put("/products/{product_id}", response_model=Product)
async def update_product(product_id: str, product_update: ProductUpdate):
    """Update a product"""
    product = next((p for p in products_db if p.id == product_id), None)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    update_data = product_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(product, field, value)
    
    return product

@app.delete("/products/{product_id}")
async def delete_product(product_id: str):
    """Delete a product"""
    global products_db
    products_db = [p for p in products_db if p.id != product_id]
    return {"message": "Product deleted successfully"}

# Categories endpoint
@app.get("/categories")
async def get_categories():
    """Get all available product categories"""
    categories = list(set(product.category for product in products_db))
    return {"categories": categories}

# Search endpoint
@app.get("/search")
async def search_products(q: str, category: Optional[str] = None):
    """Search products by name or description"""
    filtered_products = products_db
    
    if category:
        filtered_products = [p for p in filtered_products if p.category.lower() == category.lower()]
    
    search_results = [
        p for p in filtered_products 
        if q.lower() in p.name.lower() or q.lower() in p.description.lower()
    ]
    
    return {"query": q, "results": search_results, "total": len(search_results)}

# Orders endpoints
@app.post("/orders", response_model=Order, status_code=status.HTTP_201_CREATED)
async def create_order(order_data: dict):
    """Create a new order"""
    new_id = str(len(orders_db) + 1)
    new_order = Order(
        id=new_id,
        user_id=order_data.get("user_id", "guest"),
        products=order_data.get("products", []),
        total=order_data.get("total", 0.0)
    )
    orders_db.append(new_order)
    return new_order

@app.get("/orders/{order_id}", response_model=Order)
async def get_order(order_id: str):
    """Get a specific order by ID"""
    order = next((o for o in orders_db if o.id == order_id), None)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order

# Analytics endpoints
@app.get("/analytics/dashboard")
async def get_analytics_dashboard():
    """Get dashboard analytics data"""
    total_products = len(products_db)
    total_orders = len(orders_db)
    total_revenue = sum(order.total for order in orders_db)
    
    return {
        "total_products": total_products,
        "total_orders": total_orders,
        "total_revenue": total_revenue,
        "avg_order_value": total_revenue / max(total_orders, 1),
        "categories": len(set(p.category for p in products_db))
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
