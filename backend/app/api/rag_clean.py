"""
Enhanced RAG System API Endpoints
Clean API with only Ollama Llama3 and vector search endpoints
"""

from fastapi import APIRouter, HTTPException
from typing import Dict, Any, Optional, List
from pydantic import BaseModel, Field
import logging

from app.services.enhanced_rag_service import EnhancedRAGService

# Initialize router and service
router = APIRouter(prefix="/rag", tags=["rag"])
enhanced_rag_service = EnhancedRAGService()
logger = logging.getLogger(__name__)

# Request/Response Models
class EnhancedRAGRequest(BaseModel):
    query: str = Field(..., description="Customer query or question")
    limit: int = Field(default=5, ge=1, le=20, description="Maximum number of products to return")
    threshold: Optional[float] = Field(None, ge=0.0, le=1.0, description="Similarity threshold for products")

class EnhancedRAGResponse(BaseModel):
    success: bool
    query: str
    intent: str
    products: List[Dict[str, Any]]
    ai_response: str
    confidence: float
    context_analysis: Dict[str, Any]
    search_params: Dict[str, Any]
    processing_time: float
    products_found: int
    thought_process: List[str]

# API Endpoints

@router.post("/enhanced", response_model=EnhancedRAGResponse)
async def enhanced_rag_query(request: EnhancedRAGRequest) -> EnhancedRAGResponse:
    """
    Enhanced RAG query using Ollama Llama3 with vector search
    Returns real product data with AI-generated responses
    """
    try:
        logger.info(f"Enhanced RAG request: {request.query}")
        
        # Use Enhanced RAG Service with Ollama
        result = enhanced_rag_service.generate_ecommerce_response(
            query=request.query,
            limit=request.limit,
            threshold=request.threshold
        )
        
        # Check if we got real products and AI response
        if not result.get("success"):
            raise HTTPException(
                status_code=500, 
                detail=f"Enhanced RAG failed: {result.get('error', 'Unknown error')}"
            )
        
        if result.get("products_found", 0) == 0:
            raise HTTPException(
                status_code=404,
                detail="No products found matching the query criteria"
            )
        
        # Verify we have a real AI response (not fallback)
        ai_response = result.get("ai_response", "")
        if "technical difficulties" in ai_response.lower() or "try again" in ai_response.lower():
            raise HTTPException(
                status_code=503,
                detail="AI service unavailable"
            )
        
        return EnhancedRAGResponse(
            success=result["success"],
            query=result["query"],
            intent=result["intent"],
            products=result["products"],
            ai_response=result["ai_response"],
            confidence=result["confidence"],
            context_analysis=result["context_analysis"],
            search_params=result["search_params"],
            processing_time=result["processing_time"],
            products_found=result["products_found"],
            thought_process=result["thought_process"]
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Enhanced RAG error: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail=f"Enhanced RAG system error: {str(e)}"
        )

@router.get("/enhanced/status")
async def enhanced_rag_status() -> Dict[str, Any]:
    """
    Check status of Enhanced RAG system components
    """
    try:
        status = enhanced_rag_service.get_service_status()
        
        # Check all components are working
        all_healthy = (
            status["ollama"]["connected"] and 
            status["ollama"]["target_model_available"] and
            status["vector_service"]["connected"]
        )
        
        return {
            "status": "healthy" if all_healthy else "degraded",
            "components": status,
            "ready_for_testing": all_healthy,
            "features": [
                "Local Ollama Llama3 integration",
                "Neon PostgreSQL with pgvector search",
                "Intent analysis and context evaluation",
                "Confidence scoring and thought process"
            ]
        }
        
    except Exception as e:
        logger.error(f"Enhanced RAG status error: {str(e)}")
        return {
            "status": "unhealthy",
            "error": str(e),
            "ready_for_testing": False
        }

@router.get("/health")
async def health_check() -> Dict[str, Any]:
    """
    Health check endpoint for Enhanced RAG system
    """
    try:
        status = enhanced_rag_service.get_service_status()
        
        return {
            "status": "healthy",
            "service": "Enhanced RAG with Ollama Llama3",
            "components": {
                "ollama": status["ollama"]["connected"],
                "vector_search": status["vector_service"]["connected"],
                "model": status["ollama"]["target_model_available"]
            }
        }
        
    except Exception as e:
        logger.error(f"Health check error: {str(e)}")
        return {
            "status": "unhealthy",
            "error": str(e)
        }

@router.get("/")
async def rag_info() -> Dict[str, Any]:
    """
    Information about the Enhanced RAG system
    """
    return {
        "service": "Enhanced RAG System",
        "model": "Ollama Llama3",
        "features": [
            "Local AI processing with Ollama",
            "Vector similarity search with Neon PostgreSQL",
            "Real-time product recommendations",
            "Intent analysis and confidence scoring",
            "No fallback responses - real AI only"
        ],
        "endpoints": {
            "enhanced": "POST /rag/enhanced - Main chat endpoint",
            "status": "GET /rag/enhanced/status - System status",
            "health": "GET /rag/health - Health check"
        },
        "usage": {
            "method": "POST /rag/enhanced",
            "body": {
                "query": "string (required) - Your question or search query",
                "limit": "integer (optional, 1-20, default 5) - Max products to return",
                "threshold": "float (optional, 0.0-1.0) - Similarity threshold"
            }
        }
    }
