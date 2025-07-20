import { NextRequest, NextResponse } from 'next/server';

interface ChatRequest {
  query: string;
  context_type?: string;
}

interface RAGSearchResponse {
  products: Array<{
    id: string;
    name: string;
    category: string;
    description: string;
    price: number;
    brand: string;
    image_url: string;
    similarity: number;
    metadata: {
      is_active: boolean;
      created_at: string;
    };
  }>;
  ai_insights: string;
  query: string;
  category: string | null;
  total_found: number;
  success: boolean;
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

    // Call our backend RAG system using the working search endpoint
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000';
    const ragResponse = await fetch(`${backendUrl}/rag/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: body.query,
        limit: 5
      }),
    });

    if (!ragResponse.ok) {
      console.error('RAG system error:', ragResponse.status, ragResponse.statusText);
      
      // Fallback response if RAG system is down
      return NextResponse.json({
        response: `I understand you're asking about "${body.query}". While I'm having some technical difficulties right now, I'd be happy to help you browse our products or you can contact our customer service team for immediate assistance.`,
        products_found: 0,
        similar_products: [],
        context_type: body.context_type || 'general',
        success: true
      });
    }

    const ragData: RAGSearchResponse = await ragResponse.json();

    // Map the search response to the expected chat response format
    const chatResponse = {
      response: ragData.ai_insights,
      products_found: ragData.total_found,
      similar_products: ragData.products.map(product => ({
        product_id: parseInt(product.id),
        name: product.name,
        category: product.category,
        description: product.description,
        price: product.price,
        similarity: product.similarity,
        brand: product.brand,
        image_url: product.image_url
      })),
      context_type: body.context_type || 'search',
      success: ragData.success
    };

    return NextResponse.json(chatResponse);

  } catch (error) {
    console.error('Error in RAG chat API:', error);
    
    return NextResponse.json(
      {
        response: 'I apologize, but I\'m experiencing some technical difficulties. Please try again in a moment or contact our customer support team.',
        products_found: 0,
        similar_products: [],
        context_type: 'error',
        success: false,
        error: 'Internal server error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    {
      message: 'RAG Chat API is running',
      endpoints: {
        chat: 'POST /api/rag-chat',
        description: 'Send a query to the AI shopping assistant powered by RAG and vector search'
      },
      usage: {
        method: 'POST',
        body: {
          query: 'string (required) - Your question or search query',
          context_type: 'string (optional) - recommendation, comparison, general, inquiry'
        }
      }
    }
  );
}
