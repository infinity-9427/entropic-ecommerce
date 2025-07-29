import { NextRequest, NextResponse } from 'next/server';

interface ChatRequest {
  query: string;
  context_type?: string;
}

interface EnhancedRAGResponse {
  success: boolean;
  query: string;
  intent: string;
  products: Array<{
    id?: string;
    product_id?: number;
    name: string;
    category: string;
    description: string;
    price: number;
    brand?: string;
    image_url?: string;
    similarity: number;
  }>;
  ai_response: string;
  confidence: number;
  context_analysis: {
    sufficient_context: boolean;
    confidence_level: string;
    recommendation_strategy: string;
  };
  search_params: Record<string, any>;
  processing_time: number;
  products_found: number;
  thought_process: string[];
}

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json();
    
    if (!body.query || body.query.trim().length === 0) {
      return NextResponse.json(
        { 
          error: 'Query is required',
          success: false 
        },
        { status: 400 }
      );
    }

    // Call our enhanced RAG system using the enhanced endpoint
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000';
    const ragResponse = await fetch(`${backendUrl}/rag/enhanced`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: body.query,
        limit: 5,
        threshold: 0.5
      }),
    });

    if (!ragResponse.ok) {
      console.error('Enhanced RAG system error:', ragResponse.status, ragResponse.statusText);
      
      // NO FALLBACK RESPONSES - Return error for debugging
      return NextResponse.json(
        {
          response: 'RAG system is currently unavailable. Please check the backend service.',
          products_found: 0,
          similar_products: [],
          context_type: 'error',
          success: false,
          error: `Backend error: ${ragResponse.status} ${ragResponse.statusText}`
        },
        { status: 503 }
      );
    }

    const ragData: EnhancedRAGResponse = await ragResponse.json();

    // Validate that we got real data (no fallbacks)
    if (!ragData.success) {
      return NextResponse.json(
        {
          response: 'Enhanced RAG service failed to process the request.',
          products_found: 0,
          similar_products: [],
          context_type: 'error',
          success: false,
          error: 'Enhanced RAG service returned unsuccessful response'
        },
        { status: 500 }
      );
    }

    // Map the enhanced RAG response to the expected chat response format
    const chatResponse = {
      response: ragData.ai_response,
      products_found: ragData.products_found,
      similar_products: ragData.products.map((product: {
        id?: string;
        product_id?: number;
        name: string;
        category: string;
        description: string;
        price: number;
        brand?: string;
        image_url?: string;
        similarity: number;
      }) => ({
        product_id: product.product_id || product.id || 0,
        name: product.name,
        category: product.category,
        description: product.description,
        price: product.price,
        similarity: product.similarity,
        brand: product.brand,
        image_url: product.image_url
      })),
      context_type: body.context_type || ragData.intent,
      success: ragData.success,
      confidence: ragData.confidence,
      processing_time: ragData.processing_time
    };

    return NextResponse.json(chatResponse);

  } catch (error) {
    console.error('Error in RAG chat API:', error);
    
    return NextResponse.json(
      {
        response: 'Enhanced RAG system encountered an error. Please check the backend logs for details.',
        products_found: 0,
        similar_products: [],
        context_type: 'error',
        success: false,
        error: 'Internal server error in enhanced RAG processing'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    {
      message: 'Enhanced RAG Chat API is running',
      backend_integration: 'Enhanced RAG Service with Ollama Llama3',
      endpoints: {
        chat: 'POST /api/rag-chat',
        description: 'Send a query to the enhanced AI shopping assistant powered by Ollama Llama3 and vector search'
      },
      features: [
        'Local Ollama Llama3 integration',
        'Neon PostgreSQL with pgvector search',
        'Intent analysis and context evaluation',
        'No fallback responses - real AI only',
        'Confidence scoring and thought process'
      ],
      usage: {
        method: 'POST',
        body: {
          query: 'string (required) - Your question or search query',
          context_type: 'string (optional) - recommendation, comparison, general, inquiry'
        },
        response: {
          response: 'AI-generated response from Ollama',
          products_found: 'Number of relevant products',
          similar_products: 'Array of matching products with similarity scores',
          confidence: 'Response confidence score (0-1)',
          processing_time: 'Time taken to process request'
        }
      }
    }
  );
}
