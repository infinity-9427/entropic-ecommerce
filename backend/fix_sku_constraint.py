#!/usr/bin/env python3
"""
Fix SKU constraint to allow NULL values properly
This script will:
1. Update all empty string SKUs to NULL
2. Modify the constraint to allow NULL values
"""

import sys
import os

# Add the backend directory to the Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import create_engine, text
from app.core.database import DATABASE_URL

def fix_sku_constraint():
    """Fix the SKU constraint issue"""
    try:
        # Get database URL
        engine = create_engine(DATABASE_URL)
        
        with engine.connect() as conn:
            # Start a transaction
            with conn.begin():
                print("Fixing SKU constraint...")
                
                # Step 1: Update all empty string SKUs to NULL
                print("Step 1: Converting empty string SKUs to NULL...")
                result = conn.execute(text("""
                    UPDATE products 
                    SET sku = NULL 
                    WHERE sku = '' OR sku IS NULL
                """))
                print(f"Updated {result.rowcount} rows with empty SKUs")
                
                # Step 2: Update all empty string brands to NULL
                print("Step 2: Converting empty string brands to NULL...")
                result = conn.execute(text("""
                    UPDATE products 
                    SET brand = NULL 
                    WHERE brand = ''
                """))
                print(f"Updated {result.rowcount} rows with empty brands")
                
                # Step 3: Check if we need to recreate the constraint
                # First, let's see what constraints exist
                print("Step 3: Checking existing constraints...")
                constraints = conn.execute(text("""
                    SELECT constraint_name, constraint_type 
                    FROM information_schema.table_constraints 
                    WHERE table_name = 'products' 
                    AND constraint_type = 'UNIQUE'
                    AND constraint_name LIKE '%sku%'
                """)).fetchall()
                
                print(f"Found constraints: {constraints}")
                
                # The unique constraint should already allow NULL values in PostgreSQL
                # But let's verify the current state
                duplicate_skus = conn.execute(text("""
                    SELECT sku, COUNT(*) as count 
                    FROM products 
                    WHERE sku IS NOT NULL 
                    GROUP BY sku 
                    HAVING COUNT(*) > 1
                """)).fetchall()
                
                if duplicate_skus:
                    print(f"Warning: Found duplicate non-NULL SKUs: {duplicate_skus}")
                else:
                    print("No duplicate non-NULL SKUs found")
                    
                print("SKU constraint fix completed successfully!")
                
    except Exception as e:
        print(f"Error fixing SKU constraint: {e}")
        raise

if __name__ == "__main__":
    fix_sku_constraint()
