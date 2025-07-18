#!/usr/bin/env python3
"""
Script to populate the database with sample data
"""

import sys
import os
from datetime import datetime, timedelta
import random

# Add the backend directory to the path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import SessionLocal, create_tables
from models import User, Product, Order, CartItem, AnalyticsEvent
from schemas import UserCreate, ProductCreate, AnalyticsEventCreate
from services import UserService, ProductService, AnalyticsService
from auth import get_password_hash

def create_sample_users():
    """Create sample users"""
    db = SessionLocal()
    user_service = UserService(db)
    
    users_data = [
        {
            "email": "admin@entropic.com",
            "username": "admin",
            "password": "admin123",
            "first_name": "Admin",
            "last_name": "User",
            "is_admin": True
        },
        {
            "email": "john.doe@example.com",
            "username": "johndoe",
            "password": "password123",
            "first_name": "John",
            "last_name": "Doe",
            "is_admin": False
        },
        {
            "email": "jane.smith@example.com",
            "username": "janesmith",
            "password": "password123",
            "first_name": "Jane",
            "last_name": "Smith",
            "is_admin": False
        },
        {
            "email": "bob.wilson@example.com",
            "username": "bobwilson",
            "password": "password123",
            "first_name": "Bob",
            "last_name": "Wilson",
            "is_admin": False
        },
        {
            "email": "alice.brown@example.com",
            "username": "alicebrown",
            "password": "password123",
            "first_name": "Alice",
            "last_name": "Brown",
            "is_admin": False
        }
    ]
    
    created_users = []
    for user_data in users_data:
        # Check if user already exists
        existing_user = user_service.get_user_by_email(user_data["email"])
        if existing_user:
            print(f"User {user_data['email']} already exists, skipping...")
            created_users.append(existing_user)
            continue
            
        # Create user
        user_create = UserCreate(
            email=user_data["email"],
            username=user_data["username"],
            password=user_data["password"],
            first_name=user_data["first_name"],
            last_name=user_data["last_name"]
        )
        
        user = user_service.create_user(user_create)
        
        # Set admin status if needed
        if user_data["is_admin"]:
            user.is_admin = True
            db.commit()
            
        created_users.append(user)
        print(f"Created user: {user.email}")
    
    db.close()
    return created_users

def create_sample_products():
    """Create sample products"""
    db = SessionLocal()
    product_service = ProductService(db)
    
    products_data = [
        {
            "name": "Wireless Bluetooth Headphones",
            "description": "High-quality wireless headphones with noise cancellation and 30-hour battery life.",
            "price": 199.99,
            "category": "Electronics",
            "stock_quantity": 50,
            "image_url": "https://example.com/images/headphones.jpg"
        },
        {
            "name": "Gaming Mechanical Keyboard",
            "description": "RGB backlit mechanical keyboard with Cherry MX switches, perfect for gaming.",
            "price": 129.99,
            "category": "Electronics",
            "stock_quantity": 30,
            "image_url": "https://example.com/images/keyboard.jpg"
        },
        {
            "name": "4K Webcam",
            "description": "Ultra HD 4K webcam with auto-focus and built-in microphone for streaming.",
            "price": 89.99,
            "category": "Electronics",
            "stock_quantity": 25,
            "image_url": "https://example.com/images/webcam.jpg"
        },
        {
            "name": "Organic Cotton T-Shirt",
            "description": "Comfortable organic cotton t-shirt in various colors and sizes.",
            "price": 29.99,
            "category": "Clothing",
            "stock_quantity": 100,
            "image_url": "https://example.com/images/tshirt.jpg"
        },
        {
            "name": "Denim Jacket",
            "description": "Classic denim jacket with vintage wash and comfortable fit.",
            "price": 79.99,
            "category": "Clothing",
            "stock_quantity": 40,
            "image_url": "https://example.com/images/jacket.jpg"
        },
        {
            "name": "Running Sneakers",
            "description": "Lightweight running shoes with advanced cushioning and breathable mesh.",
            "price": 149.99,
            "category": "Footwear",
            "stock_quantity": 60,
            "image_url": "https://example.com/images/sneakers.jpg"
        },
        {
            "name": "Leather Wallet",
            "description": "Premium leather wallet with RFID protection and multiple card slots.",
            "price": 49.99,
            "category": "Accessories",
            "stock_quantity": 75,
            "image_url": "https://example.com/images/wallet.jpg"
        },
        {
            "name": "Stainless Steel Water Bottle",
            "description": "Insulated stainless steel water bottle keeps drinks cold for 24 hours.",
            "price": 24.99,
            "category": "Accessories",
            "stock_quantity": 120,
            "image_url": "https://example.com/images/bottle.jpg"
        },
        {
            "name": "Yoga Mat",
            "description": "Non-slip yoga mat with extra cushioning for comfortable practice.",
            "price": 39.99,
            "category": "Sports",
            "stock_quantity": 80,
            "image_url": "https://example.com/images/yogamat.jpg"
        },
        {
            "name": "Protein Powder",
            "description": "Whey protein powder with 25g protein per serving, chocolate flavor.",
            "price": 34.99,
            "category": "Health",
            "stock_quantity": 90,
            "image_url": "https://example.com/images/protein.jpg"
        },
        {
            "name": "Coffee Beans",
            "description": "Premium single-origin coffee beans, medium roast with rich flavor.",
            "price": 19.99,
            "category": "Food",
            "stock_quantity": 200,
            "image_url": "https://example.com/images/coffee.jpg"
        },
        {
            "name": "Smartphone Case",
            "description": "Protective smartphone case with wireless charging compatibility.",
            "price": 19.99,
            "category": "Electronics",
            "stock_quantity": 150,
            "image_url": "https://example.com/images/phonecase.jpg"
        }
    ]
    
    created_products = []
    for product_data in products_data:
        # Check if product already exists
        existing_products = product_service.get_products()
        if any(p.name == product_data["name"] for p in existing_products):
            print(f"Product {product_data['name']} already exists, skipping...")
            continue
            
        product_create = ProductCreate(**product_data)
        product = product_service.create_product(product_create)
        created_products.append(product)
        print(f"Created product: {product.name}")
    
    db.close()
    return created_products

def create_sample_analytics():
    """Create sample analytics events"""
    db = SessionLocal()
    analytics_service = AnalyticsService(db)
    
    # Get existing users and products
    users = db.query(User).all()
    products = db.query(Product).all()
    
    if not users or not products:
        print("No users or products found. Please create users and products first.")
        db.close()
        return
    
    # Create various analytics events over the past 30 days
    events = []
    base_date = datetime.utcnow() - timedelta(days=30)
    
    event_types = [
        "page_view",
        "product_view",
        "add_to_cart",
        "remove_from_cart",
        "purchase",
        "search",
        "login",
        "logout",
        "register"
    ]
    
    # Generate random events
    for i in range(500):  # Create 500 random events
        event_date = base_date + timedelta(
            days=random.randint(0, 30),
            hours=random.randint(0, 23),
            minutes=random.randint(0, 59)
        )
        
        event_type = random.choice(event_types)
        user = random.choice(users) if random.random() > 0.3 else None  # 30% anonymous
        
        # Create event data based on type
        event_data = {
            "page": f"/page-{random.randint(1, 10)}",
            "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        }
        
        if event_type == "product_view":
            product = random.choice(products)
            event_data["product_id"] = product.id
            event_data["product_name"] = product.name
            event_data["page"] = f"/products/{product.id}"
        elif event_type == "search":
            search_terms = ["headphones", "shirt", "shoes", "laptop", "coffee", "phone"]
            event_data["search_query"] = random.choice(search_terms)
            event_data["page"] = "/search"
        elif event_type == "add_to_cart":
            product = random.choice(products)
            event_data["product_id"] = product.id
            event_data["quantity"] = random.randint(1, 3)
        elif event_type == "purchase":
            event_data["order_value"] = round(random.uniform(20, 500), 2)
            event_data["items_count"] = random.randint(1, 5)
        
        # Create the event
        event = AnalyticsEvent(
            event_type=event_type,
            user_id=user.id if user else None,
            session_id=f"session_{random.randint(1000, 9999)}",
            properties=event_data,
            created_at=event_date
        )
        
        db.add(event)
        events.append(event)
    
    db.commit()
    print(f"Created {len(events)} analytics events")
    db.close()
    return events

def main():
    """Main function to populate the database"""
    print("Creating database tables...")
    create_tables()
    
    print("\nCreating sample users...")
    users = create_sample_users()
    
    print("\nCreating sample products...")
    products = create_sample_products()
    
    print("\nCreating sample analytics events...")
    analytics = create_sample_analytics()
    
    print(f"\nDatabase populated successfully!")
    print(f"- {len(users)} users created")
    print(f"- {len(products)} products created")
    print(f"- {len(analytics)} analytics events created")
    
    print("\nAdmin credentials:")
    print("Email: admin@entropic.com")
    print("Password: admin123")
    
    print("\nSample user credentials:")
    print("Email: john.doe@example.com")
    print("Password: password123")

if __name__ == "__main__":
    main()
