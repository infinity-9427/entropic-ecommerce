"""
RAG System API Endpoints
Provides intelligent product search and recommendations using vector similarity and LLM
"""

from fastapi import APIRouter, Depends, HT@router.post("/search/metadata", response_model=EnhancedSearchResponse)
async def metadata_product_search(
    query: str,
    category: Optional[str] = None,
    brand: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    limit: int = Field(default=10, ge=1, le=20)
) -> EnhancedSearchResponse:
    """
    Advanced metadata-based product search
    Search products with specific category, brand, and price filters
    """
    try:
        logger.info(f"Metadata search: {query}, filters: category={category}, brand={brand}, price={min_price}-{max_price}")
        
        # Build metadata filters
        filters = {}
        if category:
            filters['category'] = category
        if brand:
            filters['brand'] = brand
        if min_price is not None and max_price is not None:
            filters['price_range'] = [min_price, max_price]
        elif min_price is not None:
            filters['price_range'] = [min_price, 999999]
        elif max_price is not None:
            filters['price_range'] = [0, max_price]
        
        # Perform metadata search
        result = rag_service.search_products_with_rag(
            query=query,
            filters=filters
        )
        
        return EnhancedSearchResponse(
            products=result.get("products", []),
            response=result.get("response", ""),
            analytics=result.get("analytics", {}),
            query_intent=result.get("query_intent", {}),
            filters_applied=filters,
            context_quality=result.get("context_quality", {}),
            success=True
        )
        
    except Exception as e:
        logger.error(f"Metadata search error: {str(e)}")
        return EnhancedSearchResponse(
            products=[],
            response="I apologize, but I encountered an error while searching with those filters.",
            analytics={},
            query_intent={},
            filters_applied=None,
            context_quality={},
            success=False
        )

@router.get("/analytics")
async def get_search_analytics(query: str) -> Dict[str, Any]:
    """
    Get search analytics for a query without performing the actual search
    Useful for understanding query patterns and system capabilities
    """
    try:
        # Analyze query intent
        query_intent = rag_service._analyze_query_intent(query)
        
        # Extract potential filters
        filters = rag_service._extract_filters_from_query(query)
        
        return {
            "query": query,
            "intent_analysis": query_intent,
            "extracted_filters": filters,
            "search_strategy_recommended": {
                "use_vector_search": True,
                "apply_metadata_filters": bool(filters),
                "expected_result_type": query_intent.get('type', 'general')
            },
            "success": True
        }
        
    except Exception as e:
        logger.error(f"Analytics error: {str(e)}")
        return {
            "query": query,
            "error": str(e),
            "success": False
        }

@router.post("/recommendations/{product_id}", response_model=ProductRecommendationsResponse)PException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
import logging

from app.core import get_db
from app.services.rag_service import RAGService
from app.services.vector_service import VectorService

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1/rag", tags=["RAG System"])

# Initialize services
rag_service = RAGService()
vector_service = VectorService()

# Pydantic models for request/response
class ChatRequest(BaseModel):
    query: str = Field(..., description="Customer query or question")
    context_type: str = Field(default="recommendation", description="Type of response: recommendation, comparison, general, inquiry")
    
class ChatResponse(BaseModel):
    response: str
    products_found: int
    similar_products: List[Dict[str, Any]]
    context_type: str
    success: bool
    error: Optional[str] = None

class ProductSearchRequest(BaseModel):
    query: str = Field(..., description="Natural language search query")
    category: Optional[str] = Field(None, description="Optional category filter")
    limit: int = Field(default=8, ge=1, le=20, description="Maximum number of results")

class EnhancedSearchRequest(BaseModel):
    query: str = Field(..., description="Natural language search query")
    filters: Optional[Dict[str, Any]] = Field(None, description="Optional metadata filters")
    limit: int = Field(default=10, ge=1, le=20, description="Maximum number of results")

class ProductSearchResponse(BaseModel):
    products: List[Dict[str, Any]]
    ai_insights: str
    query: str
    category: Optional[str]
    total_found: int
    success: bool

class EnhancedSearchResponse(BaseModel):
    products: List[Dict[str, Any]]
    response: str
    analytics: Dict[str, Any]
    query_intent: Dict[str, Any]
    filters_applied: Optional[Dict[str, Any]]
    context_quality: Dict[str, Any]
    success: bool

class ProductRecommendationsResponse(BaseModel):
    recommendations: List[Dict[str, Any]]
    explanation: str
    success: bool

class UpdateEmbeddingsResponse(BaseModel):
    success: bool
    statistics: Dict[str, int]
    message: str

@router.post("/chat", response_model=ChatResponse)
async def chat_with_ai(request: ChatRequest) -> ChatResponse:
    """
    Chat with AI assistant for product recommendations and shopping help
    
    This endpoint uses RAG (Retrieval-Augmented Generation) to provide intelligent responses
    by combining vector similarity search with large language model capabilities.
    """
    try:
        logger.info(f"Processing chat request: {request.query[:100]}...")
        
        result = rag_service.generate_response(
            query=request.query,
            context_type=request.context_type
        )
        
        return ChatResponse(**result)
        
    except Exception as e:
        logger.error(f"Error in chat endpoint: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Internal server error processing chat request"
        )

@router.post("/search/enhanced", response_model=EnhancedSearchResponse)
async def enhanced_product_search(request: EnhancedSearchRequest) -> EnhancedSearchResponse:
    """
    Enhanced product search with advanced RAG capabilities
    Includes metadata filtering, context analysis, and intelligent responses
    """
    try:
        logger.info(f"Enhanced search request: {request.query}")
        
        # Perform enhanced search with RAG
        result = rag_service.search_products_with_rag(
            query=request.query,
            filters=request.filters
        )
        
        return EnhancedSearchResponse(
            products=result.get("products", []),
            response=result.get("response", ""),
            analytics=result.get("analytics", {}),
            query_intent=result.get("query_intent", {}),
            filters_applied=result.get("filters_applied"),
            context_quality=result.get("context_quality", {}),
            success=True
        )
        
    except Exception as e:
        logger.error(f"Enhanced search error: {str(e)}")
        return EnhancedSearchResponse(
            products=[],
            response="I apologize, but I encountered an error while searching for products.",
            analytics={},
            query_intent={},
            filters_applied=None,
            context_quality={},
            success=False
        )

@router.post("/search", response_model=ProductSearchResponse)
async def ai_product_search(request: ProductSearchRequest) -> ProductSearchResponse:
    """
    AI-enhanced product search with natural language understanding
    
    Uses vector similarity search to find products matching natural language queries,
    then provides AI insights about the search results.
    """
    try:
        logger.info(f"Processing AI search: {request.query[:100]}...")
        
        result = rag_service.search_products_with_ai(
            query=request.query,
            category=request.category
        )
        
        # Limit results to requested amount
        if "products" in result and len(result["products"]) > request.limit:
            result["products"] = result["products"][:request.limit]
            result["total_found"] = len(result["products"])
        
        return ProductSearchResponse(**result)
        
    except Exception as e:
        logger.error(f"Error in AI search endpoint: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Internal server error processing search request"
        )

@router.get("/recommendations/{product_id}", response_model=ProductRecommendationsResponse)
async def get_product_recommendations(
    product_id: int,
    limit: int = 5
) -> ProductRecommendationsResponse:
    """
    Get AI-powered product recommendations for a specific product
    
    Returns products similar to the specified product along with AI-generated
    explanations of why these recommendations are valuable.
    """
    try:
        logger.info(f"Getting recommendations for product {product_id}")
        
        result = rag_service.get_product_recommendations(
            product_id=product_id,
            limit=limit
        )
        
        return ProductRecommendationsResponse(**result)
        
    except Exception as e:
        logger.error(f"Error getting recommendations for product {product_id}: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Internal server error getting product recommendations"
        )

@router.get("/similar/{product_id}")
async def get_similar_products(
    product_id: int,
    limit: int = 5,
    threshold: float = 0.7
):
    """
    Get products similar to a specific product using vector similarity
    
    This is a more technical endpoint that returns raw similarity scores
    without AI-generated explanations.
    """
    try:
        logger.info(f"Getting similar products for product {product_id}")
        
        # First get the product to generate query
        similar_products = vector_service.get_product_recommendations(
            product_id=product_id,
            limit=limit
        )
        
        return {
            "product_id": product_id,
            "similar_products": similar_products,
            "limit": limit,
            "threshold": threshold,
            "found": len(similar_products)
        }
        
    except Exception as e:
        logger.error(f"Error getting similar products: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Internal server error getting similar products"
        )

@router.post("/embeddings/update", response_model=UpdateEmbeddingsResponse)
async def update_product_embeddings(
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
) -> UpdateEmbeddingsResponse:
    """
    Update embeddings for all products in the database
    
    This endpoint triggers a background task to regenerate embeddings for all products.
    This should be run when new products are added or existing products are updated.
    """
    try:
        logger.info("Starting product embeddings update")
        
        # Run update in background for better performance
        background_tasks.add_task(
            rag_service.update_product_embeddings,
            db
        )
        
        return UpdateEmbeddingsResponse(
            success=True,
            statistics={"processed": 0, "successful": 0, "failed": 0},
            message="Embeddings update started in background. Check logs for progress."
        )
        
    except Exception as e:
        logger.error(f"Error starting embeddings update: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Internal server error starting embeddings update"
        )

@router.post("/embeddings/update-sync", response_model=UpdateEmbeddingsResponse)
async def update_product_embeddings_sync(
    db: Session = Depends(get_db)
) -> UpdateEmbeddingsResponse:
    """
    Synchronously update embeddings for all products
    
    This endpoint runs the embedding update synchronously and returns detailed statistics.
    Use this for smaller datasets or when you need immediate feedback.
    """
    try:
        logger.info("Starting synchronous product embeddings update")
        
        result = rag_service.update_product_embeddings(db)
        
        return UpdateEmbeddingsResponse(**result)
        
    except Exception as e:
        logger.error(f"Error in sync embeddings update: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Internal server error updating embeddings"
        )

@router.get("/vector/search")
async def vector_search(
    query: str,
    limit: int = 10,
    threshold: float = 0.6
):
    """
    Direct vector similarity search endpoint
    
    Performs raw vector similarity search without AI enhancement.
    Useful for testing and debugging the vector search functionality.
    """
    try:
        logger.info(f"Vector search: {query[:100]}...")
        
        results = vector_service.search_similar_products(
            query=query,
            limit=limit,
            threshold=threshold
        )
        
        return {
            "query": query,
            "results": results,
            "count": len(results),
            "threshold": threshold,
            "limit": limit
        }
        
    except Exception as e:
        logger.error(f"Error in vector search: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Internal server error in vector search"
        )

@router.get("/vector/search/category")
async def vector_search_by_category(
    query: str,
    category: str,
    limit: int = 10
):
    """
    Vector similarity search within a specific category
    
    Combines category filtering with vector similarity search.
    """
    try:
        logger.info(f"Category vector search: {category} - {query[:100]}...")
        
        results = vector_service.search_products_by_category(
            category=category,
            query=query,
            limit=limit
        )
        
        return {
            "query": query,
            "category": category,
            "results": results,
            "count": len(results),
            "limit": limit
        }
        
    except Exception as e:
        logger.error(f"Error in category vector search: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Internal server error in category vector search"
        )

@router.get("/health")
async def health_check():
    """
    Health check endpoint for RAG system
    
    Returns the status of various components in the RAG system.
    """
    try:
        # Test vector service
        vector_status = "operational"
        try:
            # Simple test search
            test_results = vector_service.search_similar_products("test", limit=1, threshold=0.9)
            vector_status = "operational" if isinstance(test_results, list) else "limited"
        except Exception:
            vector_status = "error"
        
        # Test RAG service
        rag_status = "operational" if rag_service.openai_client else "limited"
        
        return {
            "status": "healthy",
            "components": {
                "vector_service": vector_status,
                "rag_service": rag_status,
                "openai_client": "connected" if rag_service.openai_client else "not_configured"
            },
            "message": "RAG system is operational"
        }
        
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        return {
            "status": "unhealthy",
            "error": str(e),
            "message": "RAG system experiencing issues"
        }
