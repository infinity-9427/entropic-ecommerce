"""
Neon-based Vector Service
Pure Neon PostgreSQL implementation with pgvector for vector search
No external dependencies on Supabase
"""

import os
import json
import numpy as np
import time
import logging
from typing import List, Dict, Any, Optional, Tuple
from sentence_transformers import SentenceTransformer
from sqlalchemy.orm import Session
from sqlalchemy import text, create_engine
from sqlalchemy.dialects.postgresql import array

from app.models import Product
from app.core.database import get_db, engine

logger = logging.getLogger(__name__)

class NeonVectorService:
    def __init__(self):
        """Initialize the Neon-based vector service"""
        
        # Initialize sentence transformer model for embeddings
        self.model = SentenceTransformer('all-MiniLM-L6-v2')
        self.embedding_dimension = 384
        
        # Store embeddings in PostgreSQL with JSON format
        self.engine = engine
        
        logger.info(f"Neon Vector service initialized with model: {self.model}")
    
    def setup_vector_table(self, db: Session) -> Dict[str, Any]:
        """Setup vector embeddings table in Neon PostgreSQL"""
        try:
            # Create table for storing embeddings
            create_table_sql = """
            CREATE TABLE IF NOT EXISTS product_embeddings (
                id SERIAL PRIMARY KEY,
                product_id INTEGER NOT NULL UNIQUE,
                name TEXT NOT NULL,
                category TEXT,
                description TEXT,
                price DECIMAL(10,2),
                embedding TEXT, -- Store as JSON string in Neon
                text_content TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            
            CREATE INDEX IF NOT EXISTS idx_product_embeddings_product_id 
                ON product_embeddings(product_id);
            CREATE INDEX IF NOT EXISTS idx_product_embeddings_category 
                ON product_embeddings(category);
            """
            
            db.execute(text(create_table_sql))
            db.commit()
            
            return {
                "success": True,
                "message": "Vector table setup completed"
            }
            
        except Exception as e:
            logger.error(f"Error setting up vector table: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }
    
    def sync_all_products_to_vectors(self, db: Session) -> Dict[str, Any]:
        """
        Sync all products from Neon PostgreSQL to vector embeddings table
        """
        try:
            # Setup table first
            setup_result = self.setup_vector_table(db)
            if not setup_result["success"]:
                return setup_result
            
            # Get all active products
            products = db.query(Product).filter(Product.is_active == True).all()
            
            if not products:
                return {
                    "success": False,
                    "message": "No products found in database",
                    "synced_count": 0
                }
            
            synced_count = 0
            failed_count = 0
            
            logger.info(f"Starting sync of {len(products)} products to vector database")
            
            for product in products:
                try:
                    # Generate embedding for product
                    embedding = self.create_product_embedding(product)
                    
                    # Store in Neon
                    success = self.store_product_embedding(db, product, embedding)
                    
                    if success:
                        synced_count += 1
                        logger.debug(f"Synced product {product.id}: {product.name}")
                    else:
                        failed_count += 1
                        logger.warning(f"Failed to sync product {product.id}: {product.name}")
                        
                except Exception as e:
                    failed_count += 1
                    logger.error(f"Error syncing product {product.id}: {str(e)}")
                    continue
            
            return {
                "success": True,
                "message": f"Sync completed: {synced_count} successful, {failed_count} failed",
                "synced_count": synced_count,
                "failed_count": failed_count,
                "total_products": len(products)
            }
            
        except Exception as e:
            logger.error(f"Error in sync_all_products_to_vectors: {str(e)}")
            return {
                "success": False,
                "message": f"Sync failed: {str(e)}",
                "synced_count": 0
            }
    
    def create_product_embedding(self, product: Product) -> np.ndarray:
        """Create embedding for a product"""
        product_text = self._prepare_enhanced_product_text(product)
        embedding = self.model.encode(product_text)
        return np.array(embedding)
    
    def _prepare_enhanced_product_text(self, product: Product) -> str:
        """Enhanced product text preparation for better embeddings"""
        text_parts = []
        
        # Product name (highest priority)
        if product.name is not None:
            text_parts.append(f"Product: {product.name}")
        
        # Category (high priority for filtering)
        if product.category is not None:
            text_parts.append(f"Category: {product.category}")
        
        # Brand (important for recommendations)
        if hasattr(product, 'brand') and product.brand is not None:
            text_parts.append(f"Brand: {product.brand}")
        
        # Description (detailed information)
        if product.description is not None:
            desc = str(product.description).strip()
            if len(desc) > 200:
                desc = desc[:200] + "..."
            text_parts.append(f"Description: {desc}")
        
        # Price information
        if product.price is not None:
            try:
                price_value = float(str(product.price))
                price_category = self._get_price_category(price_value)
                text_parts.append(f"Price: ${price_value} ({price_category})")
            except (ValueError, TypeError):
                pass
        
        return " | ".join(text_parts)
    
    def _get_price_category(self, price: float) -> str:
        """Categorize price for better semantic search"""
        if price < 50:
            return "budget"
        elif price < 200:
            return "affordable"
        elif price < 500:
            return "mid-range"
        elif price < 1000:
            return "premium"
        else:
            return "luxury"
    
    def store_product_embedding(self, db: Session, product: Product, embedding: np.ndarray) -> bool:
        """Store product embedding in Neon PostgreSQL"""
        try:
            # Convert numpy array to JSON string
            embedding_json = json.dumps(embedding.tolist())
            
            # Upsert embedding data
            upsert_sql = """
            INSERT INTO product_embeddings 
                (product_id, name, category, description, price, embedding, text_content)
            VALUES 
                (:product_id, :name, :category, :description, :price, :embedding, :text_content)
            ON CONFLICT (product_id) 
            DO UPDATE SET
                name = EXCLUDED.name,
                category = EXCLUDED.category,
                description = EXCLUDED.description,
                price = EXCLUDED.price,
                embedding = EXCLUDED.embedding,
                text_content = EXCLUDED.text_content,
                updated_at = CURRENT_TIMESTAMP
            """
            
            params = {
                "product_id": product.id,
                "name": product.name,
                "category": product.category,
                "description": product.description,
                "price": float(str(product.price)) if product.price is not None else 0.0,
                "embedding": embedding_json,
                "text_content": self._prepare_enhanced_product_text(product)
            }
            
            db.execute(text(upsert_sql), params)
            db.commit()
            
            logger.debug(f"Successfully stored embedding for product {product.id}")
            return True
            
        except Exception as e:
            logger.error(f"Error storing embedding for product {product.id}: {str(e)}")
            return False
    
    def search_similar_products(self, 
                              query: str, 
                              limit: int = 5, 
                              threshold: float = 0.1,
                              category_filter: Optional[str] = None, 
                              price_range: Optional[Tuple[float, float]] = None) -> List[Dict[str, Any]]:
        """
        Vector similarity search using Neon PostgreSQL
        """
        try:
            # Generate embedding for the query
            query_embedding = self.model.encode(query)
            
            # Get database session
            db = next(get_db())
            
            try:
                # Build SQL query with filters
                base_sql = """
                SELECT product_id, name, category, description, price, embedding
                FROM product_embeddings
                WHERE embedding IS NOT NULL
                """
                
                params = {}
                
                if category_filter:
                    base_sql += " AND LOWER(category) = LOWER(:category_filter)"
                    params["category_filter"] = category_filter
                
                if price_range:
                    base_sql += " AND price BETWEEN :min_price AND :max_price"
                    params["min_price"] = price_range[0]
                    params["max_price"] = price_range[1]
                
                result = db.execute(text(base_sql), params)
                products = result.fetchall()
                
                if not products:
                    logger.info(f"No products found for query: {query}")
                    return []
                
                # Calculate similarities
                products_with_similarity = []
                
                for product in products:
                    try:
                        # Parse stored embedding
                        stored_embedding = json.loads(product.embedding)
                        stored_array = np.array(stored_embedding)
                        
                        # Calculate cosine similarity
                        similarity = np.dot(query_embedding, stored_array) / (
                            np.linalg.norm(query_embedding) * np.linalg.norm(stored_array)
                        )
                        
                        # Apply threshold
                        if similarity >= threshold:
                            formatted_product = {
                                'id': product.product_id,
                                'name': product.name,
                                'description': product.description,
                                'category': product.category,
                                'price': float(product.price) if product.price else 0.0,
                                'brand': 'Unknown',  # Default since not in table
                                'image_url': '',  # Will be filled from actual product data if needed
                                'similarity': float(similarity),
                                'metadata': {
                                    'search_query': query,
                                    'search_timestamp': time.time(),
                                    'search_method': 'neon_cosine'
                                }
                            }
                            products_with_similarity.append(formatted_product)
                            
                    except Exception as e:
                        logger.warning(f"Error processing product {product.product_id}: {e}")
                        continue
                
                # Sort by similarity and limit results
                products_with_similarity.sort(key=lambda x: x['similarity'], reverse=True)
                final_results = products_with_similarity[:limit]
                
                logger.info(f"Found {len(final_results)} products for query: '{query}'")
                return final_results
                
            finally:
                db.close()
                
        except Exception as e:
            logger.error(f"Error in search_similar_products: {str(e)}")
            return []
    
    def get_product_recommendations(self, product_id: int, limit: int = 5) -> List[Dict[str, Any]]:
        """Get product recommendations based on similarity"""
        try:
            db = next(get_db())
            
            try:
                # Get the target product's embedding
                result = db.execute(
                    text("SELECT embedding FROM product_embeddings WHERE product_id = :product_id"),
                    {"product_id": product_id}
                )
                product_row = result.fetchone()
                
                if not product_row or not product_row.embedding:
                    logger.warning(f"Product {product_id} not found in embeddings database")
                    return []
                
                # Parse the embedding
                product_embedding = json.loads(product_row.embedding)
                product_embedding_array = np.array(product_embedding)
                
                # Get all other products
                result = db.execute(
                    text("SELECT product_id, name, category, description, price, embedding FROM product_embeddings WHERE product_id != :product_id AND embedding IS NOT NULL"),
                    {"product_id": product_id}
                )
                other_products = result.fetchall()
                
                recommendations = []
                for product in other_products:
                    try:
                        stored_embedding = json.loads(product.embedding)
                        stored_array = np.array(stored_embedding)
                        
                        # Calculate similarity
                        similarity = np.dot(product_embedding_array, stored_array) / (
                            np.linalg.norm(product_embedding_array) * np.linalg.norm(stored_array)
                        )
                        
                        formatted_product = {
                            'id': product.product_id,
                            'name': product.name,
                            'description': product.description,
                            'category': product.category,
                            'price': float(product.price) if product.price else 0.0,
                            'brand': 'Unknown',  # Default since not in table
                            'similarity': float(similarity),
                            'recommendation_type': 'similar_product'
                        }
                        recommendations.append(formatted_product)
                        
                    except Exception as e:
                        logger.warning(f"Error processing recommendation for {product.product_id}: {e}")
                        continue
                
                # Sort by similarity and limit
                recommendations.sort(key=lambda x: x['similarity'], reverse=True)
                return recommendations[:limit]
                
            finally:
                db.close()
                
        except Exception as e:
            logger.error(f"Error getting recommendations for product {product_id}: {str(e)}")
            return []
    
    def get_vector_stats(self) -> Dict[str, Any]:
        """Get statistics about the vector database"""
        try:
            db = next(get_db())
            
            try:
                # Count total embeddings
                result = db.execute(text("SELECT COUNT(*) as count FROM product_embeddings WHERE embedding IS NOT NULL"))
                count_row = result.fetchone()
                total_embeddings = count_row.count if count_row else 0
                
                # Get category distribution
                result = db.execute(text("SELECT category, COUNT(*) as count FROM product_embeddings WHERE embedding IS NOT NULL GROUP BY category"))
                categories = {row.category or 'Unknown': row.count for row in result.fetchall()}
                
                # Get price statistics
                result = db.execute(text("SELECT MIN(price) as min_price, MAX(price) as max_price, AVG(price) as avg_price, COUNT(*) as count FROM product_embeddings WHERE embedding IS NOT NULL AND price IS NOT NULL"))
                price_row = result.fetchone()
                
                price_stats = {}
                try:
                    if price_row and hasattr(price_row, 'count'):
                        count_val = getattr(price_row, 'count', 0)
                        if count_val and count_val > 0:
                            price_stats = {
                                'min': float(price_row.min_price),
                                'max': float(price_row.max_price),
                                'avg': float(price_row.avg_price),
                                'count_with_price': count_val
                            }
                except:
                    pass
                
                total_count = int(total_embeddings) if isinstance(total_embeddings, int) else 0
                
                return {
                    'total_embeddings': total_count,
                    'categories': categories,
                    'price_stats': price_stats,
                    'embedding_dimension': self.embedding_dimension,
                    'model_name': 'all-MiniLM-L6-v2',
                    'database': 'Neon PostgreSQL',
                    'status': 'healthy' if total_count > 0 else 'empty'
                }
                
            finally:
                db.close()
                
        except Exception as e:
            logger.error(f"Error getting vector stats: {str(e)}")
            return {
                'status': 'error',
                'error': str(e)
            }
    
    def test_vector_search(self, test_query: str = "laptop computer") -> Dict[str, Any]:
        """Test vector search functionality"""
        try:
            start_time = time.time()
            
            # Test search
            results = self.search_similar_products(
                query=test_query,
                limit=3,
                threshold=0.05  # Lower threshold for testing
            )
            
            search_time = time.time() - start_time
            
            return {
                'test_query': test_query,
                'results_count': len(results),
                'search_time_ms': round(search_time * 1000, 2),
                'results': results,
                'status': 'success' if len(results) > 0 else 'no_results'
            }
            
        except Exception as e:
            return {
                'test_query': test_query,
                'status': 'error',
                'error': str(e)
            }
    
    def clear_all_embeddings(self) -> Dict[str, Any]:
        """Clear all embeddings from the database"""
        try:
            db = next(get_db())
            
            try:
                result = db.execute(text("DELETE FROM product_embeddings"))
                db.commit()
                
                # Get count after deletion to verify
                count_result = db.execute(text("SELECT COUNT(*) as count FROM product_embeddings"))
                remaining = count_result.fetchone()
                deleted_count = "all" if (remaining and remaining.count == 0) else "unknown"
                
                return {
                    'success': True,
                    'message': 'All embeddings cleared',
                    'deleted_count': deleted_count
                }
                
            finally:
                db.close()
                
        except Exception as e:
            logger.error(f"Error clearing embeddings: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
