#!/usr/bin/env python3
"""
Populate Embeddings from Neon PostgreSQL Products
Uses actual products from your database to create and store vector embeddings
"""

import os
import sys
import logging
from pathlib import Path

# Add backend directory to Python path
backend_dir = Path(__file__).parent / 'backend'
sys.path.insert(0, str(backend_dir))

# Change to backend directory for proper imports
os.chdir(backend_dir)

# Set environment variables if not already set
from dotenv import load_dotenv
load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def main():
    """Main function to populate embeddings"""
    try:
#!/usr/bin/env python3
"""
Populate Embeddings from Neon PostgreSQL Products
Uses actual products from your database to create and store vector embeddings
"""

import os
import sys
import logging
from pathlib import Path
from dotenv import load_dotenv
from sqlalchemy import create_engine, MetaData, Table, Column, Integer, String, Float, Boolean, Text, select
from sqlalchemy.orm import sessionmaker
from supabase import create_client
from sentence_transformers import SentenceTransformer

# Load environment variables
load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def main():
    """Main function to populate embeddings"""
    try:
        logger.info("🚀 Starting Real Product Embeddings Population...")
        
        # Database connections
        logger.info("🔗 Setting up database connections...")
        
        # Neon PostgreSQL connection
        neon_url = os.getenv("NEON_PSQL_URL") or os.getenv("DATABASE_URL")
        if not neon_url:
            logger.error("❌ No Neon database URL found in environment variables")
            return False
            
        # Supabase connection  
        supabase_url = os.getenv("SUPABASE_URL")
        supabase_key = os.getenv("SUPABASE_API_KEY")
        if not supabase_url or not supabase_key:
            logger.error("❌ Supabase credentials not found in environment variables")
            return False
        
        # Initialize connections
        logger.info("🔧 Initializing database connections...")
        neon_engine = create_engine(neon_url)
        supabase = create_client(supabase_url, supabase_key)
        
        # Initialize sentence transformer
        logger.info("🤖 Loading sentence transformer model...")
        model = SentenceTransformer('all-MiniLM-L6-v2')
        
        # Test Supabase connection
        logger.info("🔗 Testing Supabase connection...")
        try:
            result = supabase.table('product_embeddings').select('count').execute()
            logger.info("✅ Supabase connection successful")
        except Exception as e:
            logger.error(f"❌ Supabase connection failed: {e}")
            return False
        
        # Fetch products from Neon
        logger.info("📊 Fetching products from Neon PostgreSQL...")
        
        with neon_engine.connect() as conn:
            # Query products directly
            result = conn.execute("SELECT id, name, description, category, price, brand, image_url, is_active, created_at FROM products WHERE is_active = true")
            products = result.fetchall()
        
        if not products:
            logger.error("❌ No active products found in Neon database!")
            return False
            
        logger.info(f"📦 Found {len(products)} active products in Neon database")
        
        # Display first few products for verification
        logger.info("🔍 Sample products found:")
        for i, product in enumerate(products[:3]):
            logger.info(f"   {i+1}. {product[1]} - ${product[4]} ({product[3]})")  # name, price, category
        
        # Process each product
        stats = {"processed": 0, "successful": 0, "failed": 0, "skipped": 0}
        
        for i, product in enumerate(products, 1):
            stats["processed"] += 1
            
            try:
                product_id, name, description, category, price, brand, image_url, is_active, created_at = product
                
                logger.info(f"🔄 Processing {i}/{len(products)}: {name}")
                
                # Check if embedding already exists
                existing = supabase.table('product_embeddings').select('*').eq('product_id', str(product_id)).execute()
                
                if existing.data:
                    logger.info(f"⏭️  Embedding already exists for: {name}")
                    stats["skipped"] += 1
                    continue
                
                # Create embedding text from product data
                embedding_text = f"{name} {description or ''} {category or ''}"
                if brand:
                    embedding_text += f" {brand}"
                
                logger.info(f"📝 Creating embedding for: {embedding_text[:100]}...")
                
                # Generate embedding
                embedding = model.encode(embedding_text).tolist()
                
                # Prepare product data for Supabase
                product_data = {
                    'product_id': str(product_id),
                    'name': name,
                    'description': description or '',
                    'category': category or '',
                    'price': float(price) if price else 0.0,
                    'brand': brand or '',
                    'image_url': image_url or '',
                    'is_active': is_active,
                    'created_at': created_at.isoformat() if created_at else None,
                    'embedding': embedding
                }
                
                # Store in Supabase
                result = supabase.table('product_embeddings').insert(product_data).execute()
                
                if result.data:
                    stats["successful"] += 1
                    logger.info(f"✅ Stored embedding for: {name}")
                else:
                    stats["failed"] += 1
                    logger.error(f"❌ Failed to store embedding for: {name}")
                    logger.error(f"   Error: {result}")
                    
            except Exception as e:
                stats["failed"] += 1
                logger.error(f"💥 Error processing {name if 'name' in locals() else 'unknown product'}: {str(e)}")
        
        # Final statistics
        success_rate = (stats["successful"] / stats["processed"] * 100) if stats["processed"] > 0 else 0
        
        logger.info(f"""
🎯 Embeddings Population Complete!

📈 Final Statistics:
   Total Products: {len(products)}
   Processed: {stats['processed']}
   Successful: {stats['successful']}
   Failed: {stats['failed']}
   Skipped (already exists): {stats['skipped']}
   Success Rate: {success_rate:.1f}%

🔍 Next Steps:
   1. Test vector search: curl "http://localhost:8000/rag/search/enhanced" -X POST -d '{{"query": "laptop"}}'
   2. Check Supabase dashboard for embeddings
   3. Try the voice assistant in the frontend
        """)
        
        return stats["successful"] > 0
        
    except Exception as e:
        logger.error(f"💥 Critical error: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = main()
    if success:
        print("\n✅ Embeddings population completed successfully!")
        sys.exit(0)
    else:
        print("\n❌ Embeddings population failed!")
        sys.exit(1)
        
    except Exception as e:
        logger.error(f"💥 Critical error: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = main()
    if success:
        print("\n✅ Embeddings population completed successfully!")
        sys.exit(0)
    else:
        print("\n❌ Embeddings population failed!")
        sys.exit(1)
