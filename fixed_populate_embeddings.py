#!/usr/bin/env python3
"""
Fixed Embeddings Population Script
Creates embeddings table and populates with real products from Neon
"""

import os
import json
import logging
from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from supabase import create_client
from sentence_transformers import SentenceTransformer

# Load environment variables
load_dotenv('backend/.env')

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def main():
    try:
        logger.info("🚀 Starting Fixed Embeddings Population...")
        
        # Get environment variables
        neon_url = os.getenv("NEON_PSQL_URL")
        supabase_url = os.getenv("SUPABASE_URL") 
        supabase_key = os.getenv("SUPABASE_API_KEY")
        
        if not all([neon_url, supabase_url, supabase_key]):
            logger.error("❌ Missing required environment variables")
            return False
        
        # Initialize connections
        logger.info("🔧 Connecting to databases...")
        neon_engine = create_engine(neon_url)
        supabase = create_client(supabase_url, supabase_key)
        
        # Load embedding model
        logger.info("🤖 Loading AI model...")
        model = SentenceTransformer('all-MiniLM-L6-v2')
        
        # Test Supabase connection
        logger.info("📋 Testing Supabase connection...")
        try:
            # Test with a simple query first
            test_result = supabase.table('product_embeddings').select('id').limit(1).execute()
            logger.info("✅ Supabase table accessible")
        except Exception as e:
            logger.error(f"❌ Supabase connection failed: {e}")
            return False
        
        # Get products from Neon database with correct column names
        logger.info("📦 Fetching products from Neon...")
        with neon_engine.connect() as conn:
            result = conn.execute(text("""
                SELECT id, name, description, category, price, brand, primary_image_url, is_active, created_at
                FROM products 
                WHERE is_active = true
                ORDER BY id
            """))
            products = result.fetchall()
            logger.info(f"📦 Found {len(products)} active products in Neon")
        
        # Sample products
        for i, p in enumerate(products[:3]):
            logger.info(f"   {i+1}. {p[1]} - ${p[4]} ({p[3]})")
        
        # Process products
        success_count = 0
        
        for i, product in enumerate(products, 1):
            try:
                product_id, name, description, category, price, brand, image_url, is_active, created_at = product
                
                logger.info(f"🔄 Processing {i}/{len(products)}: {name}")
                
                # Check if already exists
                existing = supabase.table('product_embeddings').select('*').eq('product_id', str(product_id)).execute()
                if existing.data:
                    logger.info(f"⏭️  Already exists: {name}")
                    continue
                
                # Create embedding text
                text_for_embedding = f"{name} {description or ''} {category or ''} {brand or ''}"
                
                # Generate embedding
                embedding_vector = model.encode(text_for_embedding).tolist()
                embedding_json = json.dumps(embedding_vector)
                
                # Prepare data
                product_data = {
                    'product_id': str(product_id),
                    'name': name,
                    'description': description or '',
                    'category': category or '',
                    'price': float(price) if price else 0.0,
                    'brand': brand or '',
                    'image_url': image_url or '',
                    'is_active': is_active,
                    'embedding_json': embedding_json
                }
                
                # Insert into Supabase
                result = supabase.table('product_embeddings').insert(product_data).execute()
                
                if result.data:
                    success_count += 1
                    logger.info(f"✅ Stored: {name}")
                else:
                    logger.error(f"❌ Failed: {name}")
                    
            except Exception as e:
                logger.error(f"💥 Error with product {product_id if 'product_id' in locals() else 'unknown'}: {e}")
        
        logger.info(f"""
🎯 Population Complete!
   Total: {len(products)}
   Successful: {success_count}
   Success rate: {success_count/len(products)*100:.1f}%

🔥 Your embeddings are ready! Test with:
   curl -X POST "http://localhost:8000/rag/search/enhanced" \\
   -H "Content-Type: application/json" \\
   -d '{{"query": "laptop"}}'
        """)
        
        return success_count > 0
        
    except Exception as e:
        logger.error(f"💥 Critical error: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = main()
    if success:
        logger.info("🚀 Ready to enhance your e-commerce with RAG!")
    else:
        logger.error("💥 Population failed")
