"""
RAG System API Endpoints
Provides intelligent product search and recommendations using vector similarity and LLM
"""

from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
import logging

from app.database import get_db
from app.models import Product
from app.services.rag_service import RAGService

# Initialize router and services
router = APIRouter(prefix="/rag", tags=["rag"])
rag_service = RAGService()
logger = logging.getLogger(__name__)

# Request/Response Models
class ChatMessage(BaseModel):
    message: str = Field(..., description="User's chat message or question")
    context: Optional[str] = Field(None, description="Optional conversation context")

class ChatResponse(BaseModel):
    response: str
    products: List[Dict[str, Any]]
    suggestions: List[str]
    success: bool

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
    ai_explanation: str
    target_product: Dict[str, Any]
    success: bool

class UpdateEmbeddingsResponse(BaseModel):
    success: bool
    statistics: Dict[str, int]
    message: str

# API Endpoints

@router.post("/chat", response_model=ChatResponse)
async def chat_with_rag(message: ChatMessage) -> ChatResponse:
    """
    Interactive chat interface with RAG capabilities
    Provides conversational product assistance with context awareness
    """
    try:
        logger.info(f"Chat request: {message.message}")
        
        # Generate RAG response
        result = rag_service.generate_response(
            query=message.message,
            context=message.context
        )
        
        return ChatResponse(
            response=result["response"],
            products=result.get("products", []),
            suggestions=result.get("suggestions", []),
            success=True
        )
        
    except Exception as e:
        logger.error(f"Chat error: {str(e)}")
        return ChatResponse(
            response="I apologize, but I'm having trouble processing your request right now. Please try again.",
            products=[],
            suggestions=["Try rephrasing your question", "Check your spelling", "Be more specific"],
            success=False
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

@router.post("/search/metadata", response_model=EnhancedSearchResponse)
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

@router.post("/search", response_model=ProductSearchResponse)
async def search_products(request: ProductSearchRequest) -> ProductSearchResponse:
    """
    Search for products using natural language queries with AI-powered insights
    """
    try:
        logger.info(f"Search request: {request.query}, category: {request.category}")
        
        # Perform RAG-powered search
        result = rag_service.generate_response(
            query=request.query,
            context=f"Category filter: {request.category}" if request.category else None
        )
        
        # Filter by category if specified
        products = result.get("products", [])
        if request.category:
            products = [p for p in products if p.get("category", "").lower() == request.category.lower()]
        
        # Limit results
        products = products[:request.limit]
        
        return ProductSearchResponse(
            products=products,
            ai_insights=result.get("response", ""),
            query=request.query,
            category=request.category,
            total_found=len(products),
            success=True
        )
        
    except Exception as e:
        logger.error(f"Search error: {str(e)}")
        return ProductSearchResponse(
            products=[],
            ai_insights="I apologize, but I encountered an error while searching for products.",
            query=request.query,
            category=request.category,
            total_found=0,
            success=False
        )

@router.post("/recommendations/{product_id}", response_model=ProductRecommendationsResponse)
async def get_product_recommendations(product_id: int) -> ProductRecommendationsResponse:
    """
    Get AI-powered product recommendations based on a specific product
    """
    try:
        logger.info(f"Recommendations request for product: {product_id}")
        
        # Get recommendations using RAG service
        result = rag_service.get_product_recommendations(
            product_id=str(product_id),
            limit=5
        )
        
        return ProductRecommendationsResponse(
            recommendations=result.get("recommendations", []),
            ai_explanation=result.get("response", ""),
            target_product=result.get("target_product", {}),
            success=True
        )
        
    except Exception as e:
        logger.error(f"Recommendations error: {str(e)}")
        return ProductRecommendationsResponse(
            recommendations=[],
            ai_explanation="I apologize, but I couldn't generate recommendations at this time.",
            target_product={},
            success=False
        )

@router.get("/health")
async def health_check() -> Dict[str, Any]:
    """
    Health check endpoint for RAG system
    """
    try:
        # Test vector service
        vector_status = "healthy" if rag_service.vector_service else "unavailable"
        
        # Test LLM service
        llm_status = "healthy" if rag_service.openai_client else "unavailable"
        
        return {
            "status": "healthy",
            "services": {
                "vector_search": vector_status,
                "llm_service": llm_status
            },
            "timestamp": "2024-01-01T00:00:00Z"
        }
        
    except Exception as e:
        logger.error(f"Health check error: {str(e)}")
        return {
            "status": "unhealthy",
            "error": str(e),
            "timestamp": "2024-01-01T00:00:00Z"
        }

@router.post("/embeddings/update", response_model=UpdateEmbeddingsResponse)
async def update_product_embeddings(
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
) -> UpdateEmbeddingsResponse:
    """
    Update embeddings for all products in the database
    Runs as a background task for better performance
    """
    try:
        logger.info("Starting product embeddings update")
        
        # Run embedding update in background
        background_tasks.add_task(rag_service.update_product_embeddings, db)
        
        return UpdateEmbeddingsResponse(
            success=True,
            statistics={"status": "background_task_started"},
            message="Product embeddings update started in background"
        )
        
    except Exception as e:
        logger.error(f"Embeddings update error: {str(e)}")
        return UpdateEmbeddingsResponse(
            success=False,
            statistics={"error_count": 1},
            message=f"Failed to start embeddings update: {str(e)}"
        )

@router.get("/embeddings/status")
async def get_embeddings_status(db: Session = Depends(get_db)) -> Dict[str, Any]:
    """
    Get status information about product embeddings
    """
    try:
        # Count total products
        total_products = db.query(Product).filter(Product.is_active == True).count()
        
        # This would need a proper implementation to check Supabase embeddings
        # For now, return basic stats
        
        return {
            "total_products": total_products,
            "embeddings_status": "needs_implementation",
            "last_update": None,
            "success": True
        }
        
    except Exception as e:
        logger.error(f"Embeddings status error: {str(e)}")
        return {
            "error": str(e),
            "success": False
        }
