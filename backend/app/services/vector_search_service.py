"""
Vector Database Service using Supabase pgvector
Handles embedding generation and vector similarity search for products
"""

import os
import json
import numpy as np
import time
from typing import List, Dict, Any, Optional, Tuple
from sentence_transformers import SentenceTransformer
from supabase import create_client, Client
import logging
from app.models import Product
from sqlalchemy.orm import Session

logger = logging.getLogger(__name__)

class VectorService:
    def __init__(self):
        """Initialize the vector service with Supabase client and embedding model"""
        # Initialize Supabase client
        supabase_url = os.getenv("SUPABASE_URL")
        supabase_key = os.getenv("SUPABASE_API_KEY")
        
        if not supabase_url or not supabase_key:
            raise ValueError("SUPABASE_URL and SUPABASE_API_KEY must be set in environment variables")
        
        self.supabase: Client = create_client(supabase_url, supabase_key)
        
        # Initialize sentence transformer model for embeddings
        self.model = SentenceTransformer('all-MiniLM-L6-v2')  # Fast, efficient model
        self.embedding_dimension = 384  # Dimension of all-MiniLM-L6-v2 model
        
        logger.info(f"Vector service initialized with model: {self.model}")
    
    def create_product_embedding(self, product: Product) -> np.ndarray:
        """
        Create embedding for a product based on its text content
        
        Args:
            product: Product object from database
            
        Returns:
            numpy array of embeddings
        """
        # Combine product information into a single text
        product_text = self._prepare_product_text(product)
        
        # Generate embedding
        embedding = self.model.encode(product_text)
        return embedding
    
    def _prepare_product_text(self, product: Product) -> str:
        """
        Prepare product text for embedding generation
        
        Args:
            product: Product object
            
        Returns:
            Combined text representation of the product
        """
        text_parts = []
        
        # Add product name (most important)
        if hasattr(product, 'name') and product.name is not None:
            text_parts.append(f"Product: {product.name}")
        
        # Add category
        if hasattr(product, 'category') and product.category is not None:
            text_parts.append(f"Category: {product.category}")
        
        # Add brand
        if hasattr(product, 'brand') and product.brand is not None:
            text_parts.append(f"Brand: {product.brand}")
        
        # Add description
        if hasattr(product, 'description') and product.description is not None:
            text_parts.append(f"Description: {product.description}")
        
        # Add price information
        if hasattr(product, 'price') and product.price is not None:
            text_parts.append(f"Price: ${product.price}")
        
        # Add tags if available
        if hasattr(product, 'tags') and product.tags is not None:
            if isinstance(product.tags, list):
                text_parts.append(f"Tags: {', '.join(product.tags)}")
            elif isinstance(product.tags, str):
                text_parts.append(f"Tags: {product.tags}")
        
        # Combine all parts
        return " | ".join(text_parts)
    
    def store_product_embedding(self, product: Product, embedding: np.ndarray) -> bool:
        """
        Store product embedding in Supabase vector database
        
        Args:
            product: Product object
            embedding: numpy array of embeddings
            
        Returns:
            True if successful, False otherwise
        """
        try:
            # Convert numpy array to list for JSON serialization
            embedding_list = embedding.tolist()
            
            # Prepare product data for vector storage
            vector_data = {
                "product_id": product.id,
                "name": product.name,
                "category": product.category,
                "description": product.description,
                "price": float(product.price) if product.price is not None else 0,
                "embedding": embedding_list,
                "text_content": self._prepare_product_text(product)
            }
            
            # Upsert data to Supabase (insert or update if exists)
            result = self.supabase.table("product_embeddings").upsert(vector_data).execute()
            
            if result.data:
                logger.info(f"Successfully stored embedding for product {product.id}")
                return True
            else:
                logger.error(f"Failed to store embedding for product {product.id}")
                return False
                
        except Exception as e:
            logger.error(f"Error storing embedding for product {product.id}: {str(e)}")
            return False
    
    def search_similar_products(self, query: str, limit: int = 5, threshold: float = 0.7, category_filter: Optional[str] = None, price_range: Optional[Tuple[float, float]] = None) -> List[Dict[str, Any]]:
        """
        Enhanced search for products similar to the query with advanced filtering
        Uses cosine similarity on stored embeddings
        
        Args:
            query: Search query text
            limit: Maximum number of results to return
            threshold: Minimum similarity threshold (0-1)
            category_filter: Optional category to filter by
            price_range: Optional price range tuple (min_price, max_price)
            
        Returns:
            List of similar products with similarity scores and metadata
        """
        try:
            # Generate embedding for the query
            query_embedding = self.model.encode(query)
            
            # Get all embeddings from Supabase
            result = self.supabase.table('product_embeddings').select('*').execute()
            
            if not result.data:
                return []
            
            products_with_similarity = []
            
            for product in result.data:
                try:
                    # Parse stored embedding
                    stored_embedding = json.loads(product['embedding_json'])
                    stored_array = np.array(stored_embedding)
                    
                    # Calculate cosine similarity
                    similarity = np.dot(query_embedding, stored_array) / (
                        np.linalg.norm(query_embedding) * np.linalg.norm(stored_array)
                    )
                    
                    # Apply filters
                    if category_filter and product.get('category', '').lower() != category_filter.lower():
                        continue
                        
                    if price_range:
                        product_price = float(product.get('price', 0))
                        if not (price_range[0] <= product_price <= price_range[1]):
                            continue
                    
                    # Apply threshold
                    if similarity >= threshold:
                        product_dict = {
                            'id': product['product_id'],
                            'name': product['name'],
                            'description': product['description'],
                            'category': product['category'],
                            'price': product['price'],
                            'brand': product['brand'],
                            'image_url': product['image_url'],
                            'similarity': float(similarity),
                            'metadata': {
                                'is_active': product['is_active'],
                                'created_at': product['created_at']
                            }
                        }
                        products_with_similarity.append(product_dict)
                        
                except Exception as e:
                    print(f"Error processing product {product.get('product_id')}: {e}")
                    continue
            
            # Sort by similarity and limit results
            products_with_similarity.sort(key=lambda x: x['similarity'], reverse=True)
            return products_with_similarity[:limit]
            
        except Exception as e:
            print(f"❌ Error in similarity search: {e}")
            return []
    
    def search_products_by_category(self, category: str, query: str, limit: int = 10) -> List[Dict[str, Any]]:
        """
        Search for products within a specific category using vector similarity
        
        Args:
            category: Product category to filter by
            query: Search query text
            limit: Maximum number of results to return
            
        Returns:
            List of similar products in the specified category
        """
        try:
            # Generate embedding for the query
            query_embedding = self.model.encode(query)
            query_embedding_list = query_embedding.tolist()
            
            # Search with category filter
            result = self.supabase.rpc(
                "search_products_by_category",
                {
                    "query_embedding": query_embedding_list,
                    "category_filter": category,
                    "match_count": limit
                }
            ).execute()
            
            if result.data:
                logger.info(f"Found {len(result.data)} products in category '{category}' for query: {query}")
                return result.data
            else:
                logger.info(f"No products found in category '{category}' for query: {query}")
                return []
                
        except Exception as e:
            logger.error(f"Error searching products by category: {str(e)}")
            return []
    
    def get_product_recommendations(self, product_id: int, limit: int = 5) -> List[Dict[str, Any]]:
        """
        Get product recommendations based on a specific product
        
        Args:
            product_id: ID of the product to base recommendations on
            limit: Maximum number of recommendations to return
            
        Returns:
            List of recommended products
        """
        try:
            # Get the product embedding from database
            result = self.supabase.table("product_embeddings").select("*").eq("product_id", product_id).execute()
            
            if not result.data:
                logger.warning(f"Product {product_id} not found in embeddings database")
                return []
            
            product_embedding = result.data[0]["embedding"]
            
            # Find similar products (excluding the original product)
            similar_result = self.supabase.rpc(
                "get_product_recommendations",
                {
                    "target_product_id": product_id,
                    "query_embedding": product_embedding,
                    "match_count": limit
                }
            ).execute()
            
            if similar_result.data:
                logger.info(f"Found {len(similar_result.data)} recommendations for product {product_id}")
                return similar_result.data
            else:
                logger.info(f"No recommendations found for product {product_id}")
                return []
                
        except Exception as e:
            logger.error(f"Error getting recommendations for product {product_id}: {str(e)}")
            return []
    
    def search_with_metadata_filters(self, query: str, metadata_filters: Dict[str, Any], limit: int = 10) -> List[Dict[str, Any]]:
        """
        Search products with advanced metadata filtering
        Similar to your metadata filtering approach
        
        Args:
            query: Search query text
            metadata_filters: Dictionary of metadata filters
            limit: Maximum number of results
            
        Returns:
            List of filtered products
        """
        try:
            # Generate embedding for the query
            query_embedding = self.model.encode(query)
            query_embedding_list = query_embedding.tolist()
            
            # Build filter conditions
            category_filter = metadata_filters.get('category')
            price_range = metadata_filters.get('price_range')
            brand_filter = metadata_filters.get('brand')
            
            # Use appropriate search function based on filters
            if category_filter and price_range and brand_filter:
                # Complex multi-filter search
                result = self.supabase.rpc(
                    "search_products_complex",
                    {
                        "query_embedding": query_embedding_list,
                        "match_count": limit,
                        "category_filter": category_filter,
                        "min_price": price_range[0] if price_range else 0,
                        "max_price": price_range[1] if price_range else 999999,
                        "brand_filter": brand_filter
                    }
                ).execute()
            else:
                # Use the enhanced search we already have
                result = self.supabase.rpc(
                    "search_products_advanced",
                    {
                        "query_embedding": query_embedding_list,
                        "match_threshold": 0.5,
                        "match_count": limit,
                        "category_filter": category_filter,
                        "min_price": price_range[0] if price_range else 0,
                        "max_price": price_range[1] if price_range else 999999
                    }
                ).execute()
            
            if result.data:
                # Add metadata information to results
                enhanced_results = []
                for product in result.data:
                    enhanced_product = dict(product)
                    enhanced_product['filter_metadata'] = {
                        'matched_filters': metadata_filters,
                        'filter_count': len([f for f in metadata_filters.values() if f is not None])
                    }
                    enhanced_results.append(enhanced_product)
                
                logger.info(f"Metadata search found {len(enhanced_results)} products")
                return enhanced_results
            else:
                logger.info("No products found with metadata filters")
                return []
                
        except Exception as e:
            logger.error(f"Error in metadata search: {str(e)}")
            return []
    
    def get_search_analytics(self, query: str, results: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Generate search analytics similar to your thought process tracking
        
        Args:
            query: Original search query
            results: Search results
            
        Returns:
            Analytics dictionary with insights
        """
        if not results:
            return {
                'query_analysis': query,
                'result_count': 0,
                'avg_similarity': 0,
                'categories_found': [],
                'price_range_found': None,
                'search_insights': ['No matching products found', 'Consider broader search terms']
            }
        
        # Calculate analytics
        similarities = [r.get('similarity', 0) for r in results]
        avg_similarity = sum(similarities) / len(similarities)
        max_similarity = max(similarities)
        
        categories = list(set(r.get('category', 'Unknown') for r in results))
        prices = [r.get('price', 0) for r in results if r.get('price')]
        price_range = (min(prices), max(prices)) if prices else None
        
        # Generate insights
        insights = []
        if avg_similarity > 0.8:
            insights.append('High relevance matches found')
        elif avg_similarity > 0.6:
            insights.append('Good matches with moderate relevance')
        else:
            insights.append('Limited relevance - consider refining search')
        
        if len(categories) > 1:
            insights.append(f'Results span {len(categories)} categories')
        
        if price_range:
            insights.append(f'Price range: ${price_range[0]:.2f} - ${price_range[1]:.2f}')
        
        return {
            'query_analysis': query,
            'result_count': len(results),
            'avg_similarity': avg_similarity,
            'max_similarity': max_similarity,
            'categories_found': categories,
            'price_range_found': price_range,
            'search_insights': insights
        }

# Alias for backward compatibility
ProductVectorStore = VectorService

# Create a global instance
vector_search_service = ProductVectorStore()
