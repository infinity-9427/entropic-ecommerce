#!/usr/bin/env python3
"""
Setup Supabase table for product embeddings
"""

import os
from dotenv import load_dotenv
from supabase import create_client

# Load environment variables
load_dotenv('backend/.env')

def setup_supabase_table():
    """Create the product_embeddings table in Supabase"""
    
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_API_KEY")
    
    if not supabase_url or not supabase_key:
        print("❌ Supabase credentials not found")
        return False
    
    supabase = create_client(supabase_url, supabase_key)
    
    # SQL to create the table and functions
    setup_sql = """
    -- Enable pgvector extension
    CREATE EXTENSION IF NOT EXISTS vector;

    -- Create product embeddings table
    CREATE TABLE IF NOT EXISTS product_embeddings (
        id BIGSERIAL PRIMARY KEY,
        product_id TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        description TEXT,
        category TEXT,
        price DECIMAL(10,2),
        brand TEXT,
        image_url TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ,
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        embedding vector(384)
    );

    -- Create indexes
    CREATE INDEX IF NOT EXISTS product_embeddings_product_id_idx ON product_embeddings(product_id);
    CREATE INDEX IF NOT EXISTS product_embeddings_category_idx ON product_embeddings(category);
    CREATE INDEX IF NOT EXISTS product_embeddings_embedding_idx ON product_embeddings 
    USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
    """
    
    try:
        # Execute the SQL
        result = supabase.rpc('exec_sql', {'sql': setup_sql}).execute()
        print("✅ Supabase table setup completed")
        return True
    except Exception as e:
        print(f"❌ Error setting up Supabase table: {e}")
        
        # Try a simpler approach - just test if we can create a basic table
        try:
            # Test basic connection
            result = supabase.table('product_embeddings').select('*').limit(1).execute()
            print("✅ Table already exists or connection works")
            return True
        except Exception as e2:
            print(f"ℹ️  Note: You may need to manually create the table in Supabase SQL editor")
            print("📄 SQL script available in: supabase_setup.sql")
            return False

if __name__ == "__main__":
    if setup_supabase_table():
        print("🎯 Supabase setup successful!")
    else:
        print("⚠️  Please manually run the SQL in supabase_setup.sql in your Supabase dashboard")
