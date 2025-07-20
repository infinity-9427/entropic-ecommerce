#!/usr/bin/env python3
"""
Populate product embeddings script
Run this to populate Supabase with product embeddings for vector search
"""

import os
import sys
import logging
from pathlib import Path

# Add the backend directory to the path
backend_dir = Path(__file__).parent.parent / 'backend'
sys.path.insert(0, str(backend_dir))

# Set up environment
os.environ.setdefault('PYTHONPATH', str(backend_dir))

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def populate_embeddings():
    """Populate embeddings for all products"""
    try:
        # Import after setting up path
        from app.services.rag_service import RAGService
        from app.core.database import get_db
        from app.models.models import Product
        
        logger.info("🚀 Starting embeddings population...")
        
        # Initialize RAG service
        rag_service = RAGService()
        
        # Get database session
        db = next(get_db())
        products = db.query(Product).all()
        
        logger.info(f"📊 Found {len(products)} products to process")
        
        # Process each product
        stats = {"processed": 0, "successful": 0, "failed": 0}
        
        for product in products:
            stats["processed"] += 1
            try:
                logger.info(f"🔄 Processing product {stats['processed']}/{len(products)}: {product.name}")
                
                # Create embedding
                embedding = rag_service.vector_service.create_product_embedding(product)
                
                # Store embedding in Supabase
                if rag_service.vector_service.store_product_embedding(product, embedding):
                    stats["successful"] += 1
                    logger.info(f"✅ Stored embedding for: {product.name}")
                else:
                    stats["failed"] += 1
                    logger.error(f"❌ Failed to store embedding for: {product.name}")
                    
            except Exception as e:
                stats["failed"] += 1
                logger.error(f"💥 Error processing {product.name}: {str(e)}")
        
        logger.info(f"""
🎯 Embeddings Population Complete!
📈 Statistics:
   - Processed: {stats['processed']}
   - Successful: {stats['successful']} 
   - Failed: {stats['failed']}
   - Success Rate: {(stats['successful']/stats['processed']*100):.1f}%
        """)
        
        return stats
        
    except Exception as e:
        logger.error(f"💥 Failed to populate embeddings: {str(e)}")
        return {"error": str(e)}

if __name__ == "__main__":
    result = populate_embeddings()
    if "error" in result:
        sys.exit(1)
    else:
        print("✅ Embeddings population completed successfully!")
