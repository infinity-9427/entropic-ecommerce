#!/usr/bin/env python3
"""
Migration script to update the products table schema
Making primary_image_url and images nullable for simplified product creation
"""

import os
import sys
from sqlalchemy import create_engine, text
from sqlalchemy.exc import SQLAlchemyError

# Add the parent directory to the path to import app modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.database import DATABASE_URL

def run_migration():
    """Run the database migration"""
    engine = create_engine(DATABASE_URL)
    
    try:
        with engine.connect() as connection:
            # Start a transaction
            trans = connection.begin()
            
            try:
                print("🔄 Starting database migration...")
                
                # 1. Make primary_image_url nullable
                print("📝 Making primary_image_url nullable...")
                connection.execute(text("""
                    ALTER TABLE products 
                    ALTER COLUMN primary_image_url DROP NOT NULL;
                """))
                
                # 2. Make images nullable  
                print("📝 Making images nullable...")
                connection.execute(text("""
                    ALTER TABLE products 
                    ALTER COLUMN images DROP NOT NULL;
                """))
                
                # 3. Update existing products with null primary_image_url to have empty string or null
                print("📝 Updating existing products...")
                result = connection.execute(text("""
                    UPDATE products 
                    SET primary_image_url = NULL 
                    WHERE primary_image_url = '' OR primary_image_url IS NULL;
                """))
                print(f"   Updated {result.rowcount} existing products")
                
                # 4. Update existing products with null images to have empty array
                result = connection.execute(text("""
                    UPDATE products 
                    SET images = '[]'::json 
                    WHERE images IS NULL;
                """))
                print(f"   Updated {result.rowcount} products with empty images array")
                
                # Commit the transaction
                trans.commit()
                print("✅ Migration completed successfully!")
                
                # Verify the changes
                print("\n🔍 Verifying schema changes...")
                result = connection.execute(text("""
                    SELECT column_name, is_nullable, data_type 
                    FROM information_schema.columns 
                    WHERE table_name = 'products' 
                    AND column_name IN ('primary_image_url', 'images')
                    ORDER BY column_name;
                """))
                
                for row in result:
                    print(f"   {row.column_name}: nullable={row.is_nullable}, type={row.data_type}")
                
            except Exception as e:
                # Rollback on error
                trans.rollback()
                raise e
                
    except SQLAlchemyError as e:
        print(f"❌ Migration failed: {e}")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False
    
    return True

if __name__ == "__main__":
    print("🚀 Products Table Migration Script")
    print("=" * 50)
    
    success = run_migration()
    
    if success:
        print("\n🎉 Migration completed successfully!")
        print("   The products table now supports optional images.")
        print("   You can create products without images.")
    else:
        print("\n💥 Migration failed!")
        print("   Please check the error messages above.")
        sys.exit(1)
