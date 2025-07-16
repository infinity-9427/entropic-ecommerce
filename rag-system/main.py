"""
RAG System for E-commerce Product Search and Recommendations
"""

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI(
    title="Entropic RAG System",
    description="Intelligent product search and recommendations using RAG",
    version="1.0.0"
)

class SearchQuery(BaseModel):
    query: str
    limit: Optional[int] = 5
    category: Optional[str] = None

class ProductRecommendation(BaseModel):
    id: str
    name: str
    description: str
    price: float
    category: str
    similarity_score: float
    reason: str

class SearchResponse(BaseModel):
    query: str
    results: List[ProductRecommendation]
    total_results: int
    processing_time: float

# Mock RAG implementation for demo
class RAGSystem:
    def __init__(self):
        self.products = [
            {
                "id": "1",
                "name": "Wireless Headphones",
                "description": "Premium wireless headphones with noise cancellation and long battery life",
                "price": 99.99,
                "category": "Electronics"
            },
            {
                "id": "2",
                "name": "Smartphone",
                "description": "Latest generation smartphone with advanced camera and fast processor",
                "price": 699.99,
                "category": "Electronics"
            },
            {
                "id": "3",
                "name": "Running Shoes",
                "description": "Comfortable running shoes with excellent support and cushioning",
                "price": 129.99,
                "category": "Sports"
            },
            {
                "id": "4",
                "name": "Coffee Maker",
                "description": "Programmable coffee maker with thermal carafe and auto-brew feature",
                "price": 89.99,
                "category": "Home & Kitchen"
            },
            {
                "id": "5",
                "name": "Laptop",
                "description": "High-performance laptop for work and gaming with fast SSD storage",
                "price": 1299.99,
                "category": "Electronics"
            }
        ]
    
    def search(self, query: str, limit: int = 5, category: Optional[str] = None) -> List[ProductRecommendation]:
        """
        Perform semantic search using RAG
        In a real implementation, this would:
        1. Convert query to embeddings
        2. Search vector database
        3. Retrieve relevant product context
        4. Generate enhanced recommendations using LLM
        """
        import time
        import random
        
        # Filter by category if specified
        filtered_products = self.products
        if category:
            filtered_products = [p for p in self.products if p['category'].lower() == category.lower()]
        
        # Mock semantic similarity scoring
        results = []
        for product in filtered_products[:limit]:
            similarity_score = random.uniform(0.7, 0.95)
            reason = f"Matches your search for '{query}' based on product features and customer reviews"
            
            results.append(ProductRecommendation(
                id=product['id'],
                name=product['name'],
                description=product['description'],
                price=product['price'],
                category=product['category'],
                similarity_score=similarity_score,
                reason=reason
            ))
        
        # Sort by similarity score
        results.sort(key=lambda x: x.similarity_score, reverse=True)
        return results

# Initialize RAG system
rag_system = RAGSystem()

@app.get("/")
async def root():
    return {"message": "Entropic RAG System API", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "rag-system"}

@app.post("/search", response_model=SearchResponse)
async def search_products(query: SearchQuery):
    """
    Search for products using natural language queries
    """
    import time
    start_time = time.time()
    
    try:
        results = rag_system.search(
            query=query.query,
            limit=query.limit or 5,
            category=query.category
        )
        
        processing_time = time.time() - start_time
        
        return SearchResponse(
            query=query.query,
            results=results,
            total_results=len(results),
            processing_time=processing_time
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")

@app.get("/recommendations/{product_id}")
async def get_recommendations(product_id: str, limit: int = 5):
    """
    Get product recommendations based on a specific product
    """
    try:
        # Mock recommendation logic
        recommendations = rag_system.search(
            query=f"products similar to product {product_id}",
            limit=limit
        )
        
        return {
            "product_id": product_id,
            "recommendations": recommendations,
            "total": len(recommendations)
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Recommendation failed: {str(e)}")

@app.get("/categories")
async def get_categories():
    """
    Get available product categories
    """
    categories = list(set(product['category'] for product in rag_system.products))
    return {"categories": categories}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
