#!/usr/bin/env python3
"""
Create sample data for Neon database
"""

from database import SessionLocal
from models import Product, User
from auth import get_password_hash
import json

def create_sample_data():
    db = SessionLocal()
    try:
        # Check if products already exist
        existing_products = db.query(Product).count()
        if existing_products > 0:
            print(f"✅ Database already has {existing_products} products")
            return
            
        print("📦 Creating sample products...")
        
        # Create sample products using the ORM
        products = [
            Product(
                name='Premium Wireless Headphones',
                description='High-quality wireless headphones with noise cancellation',
                price=299.99,
                category='Electronics',
                brand='TechSound',
                sku='TWH-001',
                stock_quantity=50,
                primary_image_url='https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
                images=json.dumps([{
                    'url': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
                    'public_id': 'headphones_main',
                    'alt_text': 'Premium Wireless Headphones',
                    'is_primary': True
                }]),
                tags=json.dumps(['wireless', 'bluetooth', 'noise-cancelling', 'premium']),
                weight=250.0,
                is_featured=True
            ),
            Product(
                name='Casual Cotton T-Shirt',
                description='Comfortable cotton t-shirt for everyday wear',
                price=29.99,
                category='Clothing',
                brand='ComfortWear',
                sku='CCT-001',
                stock_quantity=100,
                primary_image_url='https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
                images=json.dumps([{
                    'url': 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
                    'public_id': 'tshirt_main',
                    'alt_text': 'Casual Cotton T-Shirt',
                    'is_primary': True
                }]),
                tags=json.dumps(['cotton', 'casual', 'comfortable']),
                weight=200.0
            ),
            Product(
                name='Smart Home Security Camera',
                description='WiFi-enabled security camera with night vision',
                price=149.99,
                category='Electronics',
                brand='SecureHome',
                sku='SHC-001',
                stock_quantity=30,
                primary_image_url='https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400',
                images=json.dumps([{
                    'url': 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400',
                    'public_id': 'camera_main',
                    'alt_text': 'Smart Security Camera',
                    'is_primary': True
                }]),
                tags=json.dumps(['security', 'wifi', 'night-vision', 'smart-home']),
                weight=300.0,
                is_featured=True
            )
        ]
        
        for product in products:
            db.add(product)
        
        # Create admin user
        admin_user = User(
            email='admin@example.com',
            username='admin',
            hashed_password=get_password_hash('admin123'),
            first_name='Admin',
            last_name='User',
            is_admin=True,
            is_verified=True
        )
        db.add(admin_user)
        
        db.commit()
        print('✅ Sample products and admin user created successfully in Neon database!')
        
        # Check the products
        all_products = db.query(Product).all()
        print(f'📊 Total products: {len(all_products)}')
        for p in all_products:
            print(f'  - {p.name} (${p.price})')
            
        # Check users
        all_users = db.query(User).all()
        print(f'👥 Total users: {len(all_users)}')
        for u in all_users:
            print(f'  - {u.email} (admin: {u.is_admin})')
            
    except Exception as e:
        print(f"❌ Error creating sample data: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_sample_data()
