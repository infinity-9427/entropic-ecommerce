#!/usr/bin/env python3
"""
Database migration script to add the images column to existing products table.
"""

import sqlite3
import json
import os
from pathlib import Path

# Get the database path
db_path = Path(__file__).parent.parent / "entropic_ecommerce.db"

def migrate_database():
    """Add images column to products table and migrate existing data."""
    
    if not db_path.exists():
        print(f"Database file not found at {db_path}")
        print("Creating new database with updated schema...")
        return
    
    print(f"Migrating database at {db_path}")
    
    # Connect to the database
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        # Check if images column already exists
        cursor.execute("PRAGMA table_info(products)")
        columns = [column[1] for column in cursor.fetchall()]
        
        if 'images' in columns:
            print("Images column already exists. Migration not needed.")
            return
        
        print("Adding images column to products table...")
        
        # Add the images column
        cursor.execute("ALTER TABLE products ADD COLUMN images TEXT")
        
        # Migrate existing image_url data to images format
        print("Migrating existing image_url data to images format...")
        
        # Get all products with image_url
        cursor.execute("SELECT id, image_url FROM products WHERE image_url IS NOT NULL AND image_url != ''")
        products_with_images = cursor.fetchall()
        
        # Update each product with images array
        for product_id, image_url in products_with_images:
            # Create the images array with the existing image_url
            images_data = json.dumps([{
                "url": image_url,
                "public_id": f"legacy_image_{product_id}"
            }])
            
            cursor.execute(
                "UPDATE products SET images = ? WHERE id = ?",
                (images_data, product_id)
            )
        
        # Set empty images array for products without images
        cursor.execute("UPDATE products SET images = '[]' WHERE images IS NULL")
        
        conn.commit()
        print(f"Successfully migrated {len(products_with_images)} products with images.")
        print("Migration completed successfully!")
        
    except Exception as e:
        print(f"Error during migration: {e}")
        conn.rollback()
        raise
    
    finally:
        conn.close()

if __name__ == "__main__":
    migrate_database()
