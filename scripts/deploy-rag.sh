#!/bin/bash

# RAG System Deployment Script
# Sets up vector database and initializes product embeddings

set -e

echo "🚀 Starting RAG System Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if required environment variables are set
check_env_vars() {
    echo -e "${BLUE}📋 Checking environment variables...${NC}"
    
    if [ -z "$SUPABASE_URL" ]; then
        echo -e "${RED}❌ SUPABASE_URL not set${NC}"
        exit 1
    fi
    
    if [ -z "$SUPABASE_API_KEY" ]; then
        echo -e "${RED}❌ SUPABASE_API_KEY not set${NC}"
        exit 1
    fi
    
    if [ -z "$OPEN_ROUTER_API_KEY" ]; then
        echo -e "${YELLOW}⚠️  OPEN_ROUTER_API_KEY not set - RAG responses will be limited${NC}"
    fi
    
    echo -e "${GREEN}✅ Environment variables checked${NC}"
}

# Install required Python packages
install_dependencies() {
    echo -e "${BLUE}📦 Installing Python dependencies...${NC}"
    cd backend
    
    # Install dependencies
    pip install -e . 2>/dev/null || {
        echo -e "${YELLOW}⚠️  Installing individual packages...${NC}"
        pip install sentence-transformers pgvector supabase openai numpy scikit-learn
    }
    
    echo -e "${GREEN}✅ Dependencies installed${NC}"
}

# Setup Supabase vector database
setup_vector_database() {
    echo -e "${BLUE}🗄️  Setting up Supabase vector database...${NC}"
    
    # Note: This would typically be run directly in Supabase SQL editor
    # or via a database migration tool
    echo -e "${YELLOW}📝 Please run the following SQL in your Supabase SQL editor:${NC}"
    echo "File: backend/sql/supabase_vector_setup.sql"
    echo ""
    echo -e "${BLUE}Or manually execute:${NC}"
    echo "1. Go to your Supabase project dashboard"
    echo "2. Navigate to SQL Editor"
    echo "3. Run the contents of backend/sql/supabase_vector_setup.sql"
    echo ""
    
    read -p "Press Enter after you've set up the database schema..."
}

# Test backend connection
test_backend() {
    echo -e "${BLUE}🔍 Testing backend connection...${NC}"
    
    # Start backend in background for testing
    cd backend
    python -m uvicorn main:app --host 0.0.0.0 --port 8000 &
    BACKEND_PID=$!
    
    # Wait for backend to start
    sleep 5
    
    # Test health endpoint
    if curl -s http://localhost:8000/health > /dev/null; then
        echo -e "${GREEN}✅ Backend is running${NC}"
    else
        echo -e "${RED}❌ Backend failed to start${NC}"
        kill $BACKEND_PID 2>/dev/null || true
        exit 1
    fi
    
    # Test RAG health endpoint
    if curl -s http://localhost:8000/api/v1/rag/health > /dev/null; then
        echo -e "${GREEN}✅ RAG system is operational${NC}"
    else
        echo -e "${YELLOW}⚠️  RAG system may have issues${NC}"
    fi
    
    # Stop test backend
    kill $BACKEND_PID 2>/dev/null || true
    cd ..
}

# Initialize product embeddings
initialize_embeddings() {
    echo -e "${BLUE}🧠 Initializing product embeddings...${NC}"
    
    cd backend
    
    # Create a simple Python script to initialize embeddings
    cat > init_embeddings.py << 'EOF'
import os
import sys
sys.path.append('.')

from app.services.rag_service import RAGService
from app.core import get_db

def main():
    print("🔄 Starting embeddings initialization...")
    
    try:
        rag_service = RAGService()
        
        # Get database session
        db = next(get_db())
        
        # Update embeddings
        result = rag_service.update_product_embeddings(db)
        
        if result['success']:
            print(f"✅ Successfully processed {result['statistics']['successful']} products")
            print(f"❌ Failed to process {result['statistics']['failed']} products")
        else:
            print(f"❌ Embeddings initialization failed: {result.get('message', 'Unknown error')}")
            
    except Exception as e:
        print(f"❌ Error during initialization: {str(e)}")
        
    finally:
        db.close()

if __name__ == "__main__":
    main()
EOF

    # Run the embeddings initialization
    python init_embeddings.py
    
    # Clean up
    rm init_embeddings.py
    cd ..
    
    echo -e "${GREEN}✅ Embeddings initialization completed${NC}"
}

# Setup frontend environment
setup_frontend() {
    echo -e "${BLUE}🎨 Setting up frontend...${NC}"
    
    cd frontend
    
    # Create or update .env.local with backend URL
    cat > .env.local << EOF
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
BACKEND_URL=http://localhost:8000
EOF
    
    # Install dependencies if needed
    if [ ! -d "node_modules" ]; then
        echo -e "${BLUE}📦 Installing frontend dependencies...${NC}"
        npm install
    fi
    
    cd ..
    echo -e "${GREEN}✅ Frontend setup completed${NC}"
}

# Run comprehensive tests
run_tests() {
    echo -e "${BLUE}🧪 Running RAG system tests...${NC}"
    
    cd backend
    
    # Create test script
    cat > test_rag.py << 'EOF'
import sys
sys.path.append('.')

from app.services.rag_service import RAGService
from app.services.vector_service import VectorService

def test_vector_service():
    print("Testing Vector Service...")
    try:
        vector_service = VectorService()
        results = vector_service.search_similar_products("test product", limit=1)
        print(f"✅ Vector search working - found {len(results)} results")
        return True
    except Exception as e:
        print(f"❌ Vector service error: {str(e)}")
        return False

def test_rag_service():
    print("Testing RAG Service...")
    try:
        rag_service = RAGService()
        response = rag_service.generate_response("What are your best products?")
        if response['success']:
            print("✅ RAG service working")
            return True
        else:
            print(f"❌ RAG service error: {response.get('error', 'Unknown')}")
            return False
    except Exception as e:
        print(f"❌ RAG service error: {str(e)}")
        return False

def main():
    print("🧪 Running RAG System Tests...")
    
    vector_ok = test_vector_service()
    rag_ok = test_rag_service()
    
    if vector_ok and rag_ok:
        print("✅ All tests passed!")
        return 0
    else:
        print("❌ Some tests failed")
        return 1

if __name__ == "__main__":
    exit(main())
EOF

    python test_rag.py
    TEST_RESULT=$?
    
    rm test_rag.py
    cd ..
    
    if [ $TEST_RESULT -eq 0 ]; then
        echo -e "${GREEN}✅ All tests passed${NC}"
    else
        echo -e "${YELLOW}⚠️  Some tests failed - check configuration${NC}"
    fi
}

# Main deployment function
main() {
    echo -e "${GREEN}🎯 RAG System Deployment for Entropic E-commerce${NC}"
    echo "=============================================="
    
    check_env_vars
    install_dependencies
    setup_vector_database
    test_backend
    initialize_embeddings
    setup_frontend
    run_tests
    
    echo ""
    echo -e "${GREEN}🎉 RAG System Deployment Complete!${NC}"
    echo ""
    echo -e "${BLUE}📋 Next Steps:${NC}"
    echo "1. Start the backend: cd backend && python -m uvicorn main:app --reload"
    echo "2. Start the frontend: cd frontend && npm run dev"
    echo "3. Open http://localhost:3000 to test the AI assistant"
    echo ""
    echo -e "${BLUE}🔧 RAG Features Available:${NC}"
    echo "• AI-powered product search and recommendations"
    echo "• Vector similarity search with pgvector"
    echo "• Natural language product queries"
    echo "• Voice assistant with speech recognition"
    echo "• Professional prompt engineering"
    echo "• Contextual product comparisons"
    echo ""
    echo -e "${YELLOW}💡 Try asking the AI assistant:${NC}"
    echo '• "Show me laptops under $1000"'
    echo '• "Compare the best phones"'
    echo '• "What are your recommended products for students?"'
    echo '• "Find me running shoes with good reviews"'
}

# Check if script is being run directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
