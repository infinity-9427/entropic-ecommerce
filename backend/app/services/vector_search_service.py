"""
Enhanced Vector Search Service using Supabase for product embeddings
Handles embedding generation and advanced similarity search for products
Inspired by TimescaleDB vector patterns with Supabase adaptations
"""

import os
import openai
from typing import List, Dict, Any, Optional, Tuple, Union
from datetime import datetime
from supabase import Client
try:
    from ..core.database import get_supabase
except ImportError:
    from app.core.database import get_supabase
import json
import logging
import time

class ProductVectorStore:
    """Enhanced vector store for e-commerce product search with advanced filtering"""
    
    def __init__(self):
        try:
            self.supabase: Client = get_supabase()
            self.available = True
        except Exception as e:
            print(f"Vector search unavailable: {e}")
            self.supabase = None
            self.available = False
            
        # Use OpenRouter API for embeddings (following your pattern)
        if os.getenv("OPEN_ROUTER_API_KEY"):
            openai.api_key = os.getenv("OPEN_ROUTER_API_KEY")
            openai.api_base = "https://openrouter.ai/api/v1"
        
        self.embedding_model = os.getenv("LLM_MODEL", "text-embedding-3-small")
        self.table_name = "product_embeddings"
        
    def get_embedding(self, text: str) -> List[float]:
        """Generate embedding for given text (following your timing pattern)"""
        if not self.available:
            return [0.0] * 1536
            
        try:
            text = text.replace("\n", " ")
            start_time = time.time()
            
            # Updated for OpenAI 1.0+ API
            from openai import OpenAI
            client = OpenAI(
                api_key=os.getenv("OPEN_ROUTER_API_KEY"),
                base_url="https://openrouter.ai/api/v1"
            )
            
            response = client.embeddings.create(
                input=[text],
                model=self.embedding_model
            )
            embedding = response.data[0].embedding
            
            elapsed_time = time.time() - start_time
            logging.info(f"Embedding generated in {elapsed_time:.3f} seconds")
            return embedding
            
        except Exception as e:
            print(f"Error generating embedding: {e}")
            return [0.0] * 1536
    
    def store_product_embedding(self, product_data: Dict[str, Any]) -> bool:
        """Store product embedding with enhanced metadata (following your prepare_record pattern)"""
        if not self.available:
            return False
            
        try:
            # Create comprehensive searchable content
            content_parts = [
                f"Product: {product_data['name']}",
                f"Description: {product_data.get('description', '')}",
                f"Brand: {product_data.get('brand', '')}",
                f"Category: {product_data.get('category', '')}",
                f"Tags: {', '.join(product_data.get('tags', []))}",
                f"Price: ${product_data.get('price', 0)}"
            ]
            content = "\n".join(filter(None, content_parts))
            
            # Generate embedding
            embedding = self.get_embedding(content)
            
            # Enhanced metadata following your structure
            metadata = {
                "product_id": product_data['id'],
                "name": product_data['name'],
                "category": product_data.get('category'),
                "brand": product_data.get('brand'),
                "price": product_data.get('price'),
                "tags": product_data.get('tags', []),
                "is_featured": product_data.get('is_featured', False),
                "stock_quantity": product_data.get('stock_quantity', 0),
                "created_at": datetime.now().isoformat(),
            }
            
            # Store in Supabase
            result = self.supabase.table(self.table_name).insert({
                'product_id': product_data['id'],
                'content': content,
                'embedding': embedding,
                'metadata': metadata
            }).execute()
            
            return True
        except Exception as e:
            print(f"Error storing product embedding: {e}")
            return False
    
    def search(
        self,
        query_text: str,
        limit: int = 10,
        similarity_threshold: float = 0.7,
        metadata_filter: Optional[Dict[str, Any]] = None,
        category_filter: Optional[str] = None,
        brand_filter: Optional[str] = None,
        price_range: Optional[Tuple[float, float]] = None,
        in_stock_only: bool = False,
        featured_only: bool = False,
        return_products: bool = True
    ) -> List[Dict[str, Any]]:
        """
        Advanced product search with multiple filtering options
        
        Args:
            query_text: Search query
            limit: Maximum results to return
            similarity_threshold: Minimum similarity score
            metadata_filter: Custom metadata filters
            category_filter: Filter by product category
            brand_filter: Filter by brand
            price_range: Tuple of (min_price, max_price)
            in_stock_only: Only return products in stock
            featured_only: Only return featured products
            return_products: Return full product data vs just embeddings
            
        Examples:
            Basic search:
                search("wireless headphones")
            
            Category-specific search:
                search("bluetooth speaker", category_filter="Electronics")
            
            Price-filtered search:
                search("laptop", price_range=(500, 1500))
            
            Complex filtering:
                search("phone", 
                      brand_filter="Apple", 
                      price_range=(800, 1200),
                      in_stock_only=True,
                      featured_only=True)
        """
        if not self.available:
            return []
            
        try:
            start_time = time.time()
            
            # Generate query embedding
            query_embedding = self.get_embedding(query_text)
            
            # Build the RPC call with similarity search
            rpc_params = {
                'query_embedding': query_embedding,
                'match_threshold': similarity_threshold,
                'match_count': limit
            }
            
            # Execute similarity search
            result = self.supabase.rpc('match_products', rpc_params).execute()
            
            if not result.data:
                return []
            
            # Apply additional filters (simulating your predicates pattern)
            filtered_results = self._apply_filters(
                result.data,
                metadata_filter=metadata_filter,
                category_filter=category_filter,
                brand_filter=brand_filter,
                price_range=price_range,
                in_stock_only=in_stock_only,
                featured_only=featured_only
            )
            
            elapsed_time = time.time() - start_time
            logging.info(f"Vector search completed in {elapsed_time:.3f} seconds")
            
            if return_products:
                return self._enrich_with_product_data(filtered_results)
            else:
                return filtered_results
                
        except Exception as e:
            print(f"Error searching products: {e}")
            return []
    
    def _apply_filters(
        self, 
        results: List[Dict], 
        metadata_filter: Optional[Dict] = None,
        category_filter: Optional[str] = None,
        brand_filter: Optional[str] = None,
        price_range: Optional[Tuple[float, float]] = None,
        in_stock_only: bool = False,
        featured_only: bool = False
    ) -> List[Dict]:
        """Apply advanced filtering to search results (following your predicates pattern)"""
        
        filtered = []
        
        for result in results:
            metadata = result.get('metadata', {})
            
            # Category filter
            if category_filter and metadata.get('category') != category_filter:
                continue
                
            # Brand filter
            if brand_filter and metadata.get('brand') != brand_filter:
                continue
                
            # Price range filter
            if price_range:
                price = metadata.get('price', 0)
                if not (price_range[0] <= price <= price_range[1]):
                    continue
            
            # Stock filter
            if in_stock_only and metadata.get('stock_quantity', 0) <= 0:
                continue
                
            # Featured filter
            if featured_only and not metadata.get('is_featured', False):
                continue
                
            # Custom metadata filter
            if metadata_filter:
                match = True
                for key, value in metadata_filter.items():
                    if metadata.get(key) != value:
                        match = False
                        break
                if not match:
                    continue
            
            filtered.append(result)
        
        return filtered
    
    def _enrich_with_product_data(self, results: List[Dict]) -> List[Dict]:
        """Enrich search results with full product data from main database"""
        try:
            from ..core.database import SessionLocal
        except ImportError:
            from app.core.database import SessionLocal
        from models import Product
        
        if not results:
            return []
            
        product_ids = [r.get('product_id') for r in results]
        
        db = SessionLocal()
        try:
            products = db.query(Product).filter(Product.id.in_(product_ids)).all()
            product_map = {p.id: p for p in products}
            
            enriched_results = []
            for result in results:
                product_id = result.get('product_id')
                if product_id and product_id in product_map:
                    product = product_map[product_id]
                    enriched_results.append({
                        'product': {
                            'id': product.id,
                            'name': product.name,
                            'description': product.description,
                            'price': product.price,
                            'category': product.category,
                            'brand': product.brand,
                            'images': product.images,
                            'primary_image_url': product.primary_image_url,
                            'tags': product.tags,
                            'is_featured': product.is_featured,
                            'stock_quantity': product.stock_quantity
                        },
                        'similarity': result.get('similarity', 0),
                        'relevance_content': result.get('content', '')
                    })
            
            return enriched_results
            
        finally:
            db.close()
    
    def search_by_category_insights(self, category: str, limit: int = 5) -> Dict[str, Any]:
        """Generate category-specific insights (following your thought process pattern)"""
        results = self.search(
            f"popular products in {category}",
            limit=limit,
            category_filter=category,
            featured_only=True
        )
        
        return {
            "category": category,
            "featured_products": results,
            "insights": {
                "total_found": len(results),
                "avg_price": sum(r['product']['price'] for r in results) / len(results) if results else 0,
                "brands": list(set(r['product']['brand'] for r in results if r['product']['brand'])),
                "query_context": f"Category analysis for {category}"
            }
        }
    
    def update_product_embedding(self, product_id: int, product_data: Dict[str, Any]) -> bool:
        """Update existing product embedding"""
        if not self.available:
            return False
            
        try:
            # Delete existing embedding
            self.supabase.table(self.table_name).delete().eq('product_id', product_id).execute()
            
            # Create new embedding
            return self.store_product_embedding(product_data)
        except Exception as e:
            print(f"Error updating product embedding: {e}")
            return False
    
    def delete_product_embedding(self, product_id: int) -> bool:
        """Delete product embedding"""
        if not self.available:
            return False
            
        try:
            self.supabase.table(self.table_name).delete().eq('product_id', product_id).execute()
            return True
        except Exception as e:
            print(f"Error deleting product embedding: {e}")
            return False

# Initialize enhanced service
vector_search_service = ProductVectorStore()
