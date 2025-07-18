"""
Entropic E-commerce Backend API - Working Version
FastAPI-based REST API with database integration
"""

from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta
from pydantic import BaseModel
import os
import traceback

from database import get_db, create_tables
from models import User, Product, Order, OrderItem, CartItem, AnalyticsEvent

# Pydantic models for API
class ProductCreate(BaseModel):
    name: str
    description: str
    price: float
    category: str
    image_url: str
    stock_quantity: int = 0

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    category: Optional[str] = None
    image_url: Optional[str] = None
    stock_quantity: Optional[int] = None

class UserCreate(BaseModel):
    email: str
    username: str
    password: str
    first_name: str
    last_name: str

class UserLogin(BaseModel):
    email: str
    password: str

class CartItemCreate(BaseModel):
    product_id: int
    quantity: int

class OrderCreate(BaseModel):
    shipping_address: Optional[dict] = None
    billing_address: Optional[dict] = None
    payment_method: Optional[str] = None

class AnalyticsEventCreate(BaseModel):
    event_type: str
    user_id: Optional[int] = None
    product_id: Optional[int] = None
    session_id: Optional[str] = None
    properties: Optional[dict] = None

# Create tables on startup
try:
    create_tables()
    print("✅ Database tables created successfully")
except Exception as e:
    print(f"❌ Error creating tables: {e}")
    traceback.print_exc()

# Initialize FastAPI app
app = FastAPI(
    title="Entropic E-commerce API",
    description="Backend API for Entropic e-commerce platform",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "https://entropic.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Root endpoint
@app.get("/")
async def root():
    return {
        "message": "Entropic E-commerce API v2.0",
        "version": "2.0.0",
        "docs": "/docs",
        "features": ["User Management", "Product Catalog", "Shopping Cart", "Order Management", "Analytics"],
        "database": "SQLAlchemy with PostgreSQL/SQLite fallback"
    }

# Health check
@app.get("/health")
async def health_check(db: Session = Depends(get_db)):
    """Health check with database connection test"""
    try:
        # Test database connection
        result = db.execute("SELECT 1 as test").fetchone()
        db_status = "connected" if result else "disconnected"
    except Exception as e:
        db_status = f"error: {str(e)}"
    
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "service": "backend-api",
        "version": "2.0.0",
        "database": db_status
    }

# Authentication endpoints
@app.post("/auth/register")
async def register(user: UserCreate, db: Session = Depends(get_db)):
    """Register a new user"""
    try:
        # Check if user already exists
        existing_user = db.query(User).filter(User.email == user.email).first()
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already registered")
        
        # Create new user (simplified password hashing)
        db_user = User(
            email=user.email,
            username=user.username,
            hashed_password=f"hashed_{user.password}",  # Simplified for now
            first_name=user.first_name,
            last_name=user.last_name
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        
        return {"message": "User registered successfully", "user_id": db_user.id}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Registration failed: {str(e)}")

@app.post("/auth/login")
async def login(credentials: UserLogin, db: Session = Depends(get_db)):
    """Login user and get access token"""
    try:
        user = db.query(User).filter(User.email == credentials.email).first()
        if not user:
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
        # Simplified token generation
        return {
            "access_token": f"mock_token_{user.id}",
            "token_type": "bearer",
            "user": {
                "id": user.id,
                "email": user.email,
                "username": user.username,
                "is_admin": user.is_admin
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Login failed: {str(e)}")

# Users endpoints
@app.get("/users")
async def get_users(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get all users with pagination"""
    try:
        users = db.query(User).offset(skip).limit(limit).all()
        return users
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch users: {str(e)}")

@app.get("/users/{user_id}")
async def get_user(user_id: int, db: Session = Depends(get_db)):
    """Get a specific user by ID"""
    try:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return user
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch user: {str(e)}")

# Products endpoints
@app.get("/products")
async def get_products(
    skip: int = 0,
    limit: int = 100,
    category: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get all products with optional filtering"""
    try:
        query = db.query(Product).filter(Product.is_active == True)
        if category:
            query = query.filter(Product.category.ilike(f"%{category}%"))
        
        products = query.offset(skip).limit(limit).all()
        return [{
            "id": p.id,
            "name": p.name,
            "description": p.description,
            "price": p.price,
            "category": p.category,
            "image_url": p.image_url,
            "stock_quantity": p.stock_quantity,
            "is_active": p.is_active,
            "created_at": p.created_at.isoformat() if p.created_at else None
        } for p in products]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch products: {str(e)}")

@app.get("/products/{product_id}")
async def get_product(product_id: int, db: Session = Depends(get_db)):
    """Get a specific product by ID"""
    try:
        product = db.query(Product).filter(Product.id == product_id).first()
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
        
        return {
            "id": product.id,
            "name": product.name,
            "description": product.description,
            "price": product.price,
            "category": product.category,
            "image_url": product.image_url,
            "stock_quantity": product.stock_quantity,
            "is_active": product.is_active,
            "created_at": product.created_at.isoformat() if product.created_at else None
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch product: {str(e)}")

@app.post("/products", status_code=status.HTTP_201_CREATED)
async def create_product(product: ProductCreate, db: Session = Depends(get_db)):
    """Create a new product"""
    try:
        db_product = Product(
            name=product.name,
            description=product.description,
            price=product.price,
            category=product.category,
            image_url=product.image_url,
            stock_quantity=product.stock_quantity
        )
        db.add(db_product)
        db.commit()
        db.refresh(db_product)
        
        return {
            "id": db_product.id,
            "name": db_product.name,
            "description": db_product.description,
            "price": db_product.price,
            "category": db_product.category,
            "image_url": db_product.image_url,
            "stock_quantity": db_product.stock_quantity,
            "is_active": db_product.is_active,
            "created_at": db_product.created_at.isoformat() if db_product.created_at else None
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create product: {str(e)}")

@app.put("/products/{product_id}")
async def update_product(
    product_id: int,
    product_update: ProductUpdate,
    db: Session = Depends(get_db)
):
    """Update a product"""
    try:
        db_product = db.query(Product).filter(Product.id == product_id).first()
        if not db_product:
            raise HTTPException(status_code=404, detail="Product not found")
        
        update_data = product_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_product, field, value)
        
        db.commit()
        db.refresh(db_product)
        
        return {
            "id": db_product.id,
            "name": db_product.name,
            "description": db_product.description,
            "price": db_product.price,
            "category": db_product.category,
            "image_url": db_product.image_url,
            "stock_quantity": db_product.stock_quantity,
            "is_active": db_product.is_active,
            "created_at": db_product.created_at.isoformat() if db_product.created_at else None
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to update product: {str(e)}")

@app.delete("/products/{product_id}")
async def delete_product(product_id: int, db: Session = Depends(get_db)):
    """Delete a product (soft delete)"""
    try:
        db_product = db.query(Product).filter(Product.id == product_id).first()
        if not db_product:
            raise HTTPException(status_code=404, detail="Product not found")
        
        # Soft delete by setting is_active to False
        db_product.is_active = False
        db.commit()
        return {"message": "Product deleted successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to delete product: {str(e)}")

# Search and categories
@app.get("/search")
async def search_products(q: str, category: Optional[str] = None, db: Session = Depends(get_db)):
    """Search products by name or description"""
    try:
        query = db.query(Product).filter(
            Product.is_active == True,
            (Product.name.ilike(f"%{q}%")) | (Product.description.ilike(f"%{q}%"))
        )
        if category:
            query = query.filter(Product.category.ilike(f"%{category}%"))
        
        products = query.all()
        results = [{
            "id": p.id,
            "name": p.name,
            "description": p.description,
            "price": p.price,
            "category": p.category,
            "image_url": p.image_url,
            "stock_quantity": p.stock_quantity
        } for p in products]
        
        return {"query": q, "results": results, "total": len(results)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")

@app.get("/categories")
async def get_categories(db: Session = Depends(get_db)):
    """Get all available product categories"""
    try:
        categories = db.query(Product.category).filter(Product.is_active == True).distinct().all()
        return {"categories": [cat[0] for cat in categories if cat[0]]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch categories: {str(e)}")

# Cart endpoints
@app.post("/cart/add")
async def add_to_cart(item: CartItemCreate, db: Session = Depends(get_db)):
    """Add item to cart"""
    try:
        # For now, use user_id = 1 (mock user)
        user_id = 1
        
        # Check if item already exists
        existing_item = db.query(CartItem).filter(
            CartItem.user_id == user_id,
            CartItem.product_id == item.product_id
        ).first()
        
        if existing_item:
            existing_item.quantity += item.quantity
        else:
            cart_item = CartItem(
                user_id=user_id,
                product_id=item.product_id,
                quantity=item.quantity
            )
            db.add(cart_item)
        
        db.commit()
        return {"message": "Item added to cart"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to add to cart: {str(e)}")

@app.get("/cart")
async def get_cart(db: Session = Depends(get_db)):
    """Get user's cart"""
    try:
        user_id = 1  # Mock user
        cart_items = db.query(CartItem).filter(CartItem.user_id == user_id).all()
        
        items = []
        total_amount = 0
        
        for item in cart_items:
            product = item.product
            item_total = item.quantity * product.price
            total_amount += item_total
            
            items.append({
                "id": item.id,
                "product_id": item.product_id,
                "quantity": item.quantity,
                "product": {
                    "id": product.id,
                    "name": product.name,
                    "price": product.price,
                    "image_url": product.image_url
                },
                "item_total": item_total
            })
        
        return {
            "items": items,
            "total_items": len(items),
            "total_amount": total_amount
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch cart: {str(e)}")

@app.delete("/cart/{product_id}")
async def remove_from_cart(product_id: int, db: Session = Depends(get_db)):
    """Remove item from cart"""
    try:
        user_id = 1  # Mock user
        cart_item = db.query(CartItem).filter(
            CartItem.user_id == user_id,
            CartItem.product_id == product_id
        ).first()
        
        if not cart_item:
            raise HTTPException(status_code=404, detail="Cart item not found")
        
        db.delete(cart_item)
        db.commit()
        return {"message": "Item removed from cart"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to remove from cart: {str(e)}")

# Orders endpoints
@app.post("/orders", status_code=status.HTTP_201_CREATED)
async def create_order(order_data: OrderCreate, db: Session = Depends(get_db)):
    """Create a new order"""
    try:
        user_id = 1  # Mock user
        
        # Get cart items
        cart_items = db.query(CartItem).filter(CartItem.user_id == user_id).all()
        if not cart_items:
            raise HTTPException(status_code=400, detail="Cart is empty")
        
        # Calculate total
        total_amount = sum(item.quantity * item.product.price for item in cart_items)
        
        # Create order
        order = Order(
            user_id=user_id,
            total_amount=total_amount,
            shipping_address=order_data.shipping_address,
            billing_address=order_data.billing_address,
            payment_method=order_data.payment_method
        )
        db.add(order)
        db.commit()
        db.refresh(order)
        
        # Clear cart
        db.query(CartItem).filter(CartItem.user_id == user_id).delete()
        db.commit()
        
        return {
            "message": "Order created successfully",
            "order_id": order.id,
            "order_number": order.order_number,
            "total_amount": order.total_amount
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create order: {str(e)}")

@app.get("/orders")
async def get_orders(db: Session = Depends(get_db)):
    """Get user's orders with user and items details"""
    try:
        user_id = 1  # Mock user
        orders = db.query(Order).filter(Order.user_id == user_id).order_by(Order.created_at.desc()).all()
        
        result = []
        for order in orders:
            # Get user info
            user = db.query(User).filter(User.id == order.user_id).first()
            
            # Get order items with product info
            items = db.query(OrderItem).filter(OrderItem.order_id == order.id).all()
            order_items = []
            for item in items:
                product = db.query(Product).filter(Product.id == item.product_id).first()
                order_items.append({
                    "id": item.id,
                    "product_id": item.product_id,
                    "quantity": item.quantity,
                    "price": float(item.price),
                    "product": {
                        "name": product.name if product else "Unknown Product",
                        "image_url": product.image_url if product else "/placeholder-brand.svg"
                    }
                })
            
            result.append({
                "id": order.id,
                "user_id": order.user_id,
                "order_number": order.order_number,
                "total_amount": float(order.total_amount),
                "status": order.status,
                "payment_status": order.payment_status,
                "created_at": order.created_at.isoformat() if hasattr(order.created_at, 'isoformat') else str(order.created_at),
                "items": order_items,
                "user": {
                    "first_name": user.first_name if user else "Unknown",
                    "last_name": user.last_name if user else "User",
                    "email": user.email if user else "unknown@email.com"
                }
            })
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch orders: {str(e)}")

# Analytics endpoints
@app.post("/analytics/track")
async def track_event(event: AnalyticsEventCreate, db: Session = Depends(get_db)):
    """Track an analytics event"""
    try:
        db_event = AnalyticsEvent(
            event_type=event.event_type,
            user_id=event.user_id,
            product_id=event.product_id,
            session_id=event.session_id,
            properties=event.properties
        )
        db.add(db_event)
        db.commit()
        return {"message": "Event tracked successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to track event: {str(e)}")

@app.get("/analytics/dashboard")
async def get_dashboard_metrics(db: Session = Depends(get_db)):
    """Get dashboard analytics data"""
    try:
        from sqlalchemy import func
        
        # Basic metrics
        total_users = db.query(User).count()
        total_products = db.query(Product).filter(Product.is_active == True).count()
        total_orders = db.query(Order).count()
        total_revenue = db.query(func.sum(Order.total_amount)).scalar() or 0
        
        # Calculate derived metrics
        avg_order_value = total_revenue / total_orders if total_orders > 0 else 0
        
        # Event-based metrics
        page_views = db.query(AnalyticsEvent).filter(AnalyticsEvent.event_type == "page_view").count()
        product_views = db.query(AnalyticsEvent).filter(AnalyticsEvent.event_type == "product_view").count()
        conversion_rate = (total_orders / page_views * 100) if page_views > 0 else 0
        
        # Category distribution
        category_stats = db.query(
            Product.category,
            func.count(Product.id).label("count")
        ).filter(Product.is_active == True).group_by(Product.category).all()
        
        # Recent orders count
        recent_orders = db.query(Order).order_by(Order.created_at.desc()).limit(10).all()
        
        return {
            "total_users": total_users,
            "total_products": total_products,
            "total_orders": total_orders,
            "total_revenue": float(total_revenue),
            "avg_order_value": float(avg_order_value),
            "conversion_rate": float(conversion_rate),
            "page_views": page_views,
            "product_views": product_views,
            "top_categories": [{"category": cat[0], "count": cat[1]} for cat in category_stats],
            "recent_orders_count": len(recent_orders),
            "recent_orders": [{
                "id": order.id,
                "order_number": order.order_number,
                "total_amount": order.total_amount,
                "status": order.status,
                "created_at": order.created_at.isoformat() if order.created_at else None
            } for order in recent_orders]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch analytics: {str(e)}")

@app.get("/analytics/sales")
async def get_sales_metrics(days: int = 30, db: Session = Depends(get_db)):
    """Get sales metrics"""
    try:
        from sqlalchemy import func
        
        # Daily sales for the last N days
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=days)
        
        daily_sales = db.query(
            func.date(Order.created_at).label("date"),
            func.sum(Order.total_amount).label("revenue"),
            func.count(Order.id).label("orders")
        ).filter(
            Order.created_at >= start_date,
            Order.status != "cancelled"
        ).group_by(func.date(Order.created_at)).all()
        
        # Top products by revenue
        top_products = db.query(
            Product.name,
            func.sum(Order.total_amount).label("revenue"),
            func.count(Order.id).label("orders")
        ).join(CartItem, Product.id == CartItem.product_id).join(Order, Order.user_id == CartItem.user_id).filter(
            Order.created_at >= start_date,
            Order.status != "cancelled"
        ).group_by(Product.id, Product.name).order_by(
            func.sum(Order.total_amount).desc()
        ).limit(10).all()
        
        return {
            "daily_sales": [
                {
                    "date": str(sale[0]) if sale[0] else "unknown",
                    "revenue": float(sale[1] or 0),
                    "orders": int(sale[2] or 0)
                }
                for sale in daily_sales
            ],
            "top_products": [
                {
                    "name": product[0],
                    "revenue": float(product[1] or 0),
                    "orders": int(product[2] or 0)
                }
                for product in top_products
            ],
            "period_days": days
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch sales metrics: {str(e)}")

@app.get("/analytics/users")
async def get_user_metrics(db: Session = Depends(get_db)):
    """Get user metrics"""
    try:
        from sqlalchemy import func
        
        today = datetime.utcnow().date()
        
        # New users today
        new_users_today = db.query(User).filter(
            func.date(User.created_at) == today
        ).count()
        
        # Total active users
        total_users = db.query(User).filter(User.is_active == True).count()
        
        # Users with orders
        users_with_orders = db.query(Order.user_id).distinct().count()
        
        return {
            "new_users_today": new_users_today,
            "total_users": total_users,
            "users_with_orders": users_with_orders,
            "conversion_rate": (users_with_orders / total_users * 100) if total_users > 0 else 0
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch user metrics: {str(e)}")

@app.get("/analytics/products")
async def get_product_metrics(db: Session = Depends(get_db)):
    """Get product metrics"""
    try:
        from sqlalchemy import func
        
        # Most viewed products
        most_viewed = db.query(
            Product.name,
            func.count(AnalyticsEvent.id).label("views")
        ).join(AnalyticsEvent, Product.id == AnalyticsEvent.product_id).filter(
            AnalyticsEvent.event_type == "product_view"
        ).group_by(Product.id, Product.name).order_by(
            func.count(AnalyticsEvent.id).desc()
        ).limit(10).all()
        
        # Low stock products
        low_stock = db.query(Product).filter(
            Product.stock_quantity < 10,
            Product.is_active == True
        ).all()
        
        return {
            "most_viewed_products": [
                {"name": product[0], "views": int(product[1])}
                for product in most_viewed
            ],
            "low_stock_products": [
                {"name": product.name, "stock": product.stock_quantity}
                for product in low_stock
            ],
            "total_products": db.query(Product).filter(Product.is_active == True).count()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch product metrics: {str(e)}")

# Seed data endpoint (for development)
@app.post("/seed-data")
async def seed_data(db: Session = Depends(get_db)):
    """Seed database with sample data"""
    try:
        # Check if data already exists
        if db.query(Product).count() > 0:
            return {"message": "Database already contains data"}
        
        # Create sample products
        sample_products = [
            Product(
                name="Wireless Headphones",
                description="Premium wireless headphones with noise cancellation",
                price=99.99,
                category="Electronics",
                image_url="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop",
                stock_quantity=50
            ),
            Product(
                name="Smartphone",
                description="Latest generation smartphone with advanced features",
                price=699.99,
                category="Electronics",
                image_url="https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&h=300&fit=crop",
                stock_quantity=30
            ),
            Product(
                name="Running Shoes",
                description="Comfortable running shoes with excellent support",
                price=129.99,
                category="Sports",
                image_url="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&h=300&fit=crop",
                stock_quantity=75
            ),
            Product(
                name="Coffee Maker",
                description="Automatic coffee maker with programmable settings",
                price=89.99,
                category="Home",
                image_url="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&h=300&fit=crop",
                stock_quantity=25
            ),
            Product(
                name="Gaming Mouse",
                description="High-precision gaming mouse with RGB lighting",
                price=49.99,
                category="Electronics",
                image_url="https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=300&h=300&fit=crop",
                stock_quantity=8  # Low stock for testing
            )
        ]
        
        for product in sample_products:
            db.add(product)
        
        # Create sample user
        sample_user = User(
            email="admin@entropic.com",
            username="admin",
            hashed_password="hashed_admin_password",
            first_name="Admin",
            last_name="User",
            is_admin=True
        )
        db.add(sample_user)
        
        # Create sample analytics events
        sample_events = [
            AnalyticsEvent(event_type="page_view", user_id=1, properties={"page": "home"}),
            AnalyticsEvent(event_type="page_view", user_id=1, properties={"page": "products"}),
            AnalyticsEvent(event_type="product_view", user_id=1, product_id=1),
            AnalyticsEvent(event_type="product_view", user_id=1, product_id=2),
            AnalyticsEvent(event_type="product_view", user_id=1, product_id=3),
            AnalyticsEvent(event_type="add_to_cart", user_id=1, product_id=1),
        ]
        
        for event in sample_events:
            db.add(event)
        
        db.commit()
        return {"message": "Sample data created successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to seed data: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
