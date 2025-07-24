#!/usr/bin/env python3
"""
Simple server startup script for the backend
Ensures proper import paths and starts the FastAPI server
"""

import os
import sys
import uvicorn
from pathlib import Path

# Add the current directory to Python path for imports
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

# Load environment variables
from dotenv import load_dotenv
load_dotenv()

def start_server():
    """Start the FastAPI server with proper configuration"""
    print("🚀 Starting Entropic E-commerce Backend with RAG System...")
    print(f"📁 Backend directory: {backend_dir}")
    print(f"🐍 Python path: {sys.path[0]}")
    
    # Check environment variables
    print("\n🔍 Environment Check:")
    print(f"DATABASE_URL: {'✅' if os.getenv('DATABASE_URL') else '❌'}")
    print(f"NEON_PSQL_URL: {'✅' if os.getenv('NEON_PSQL_URL') else '❌'}")
    print(f"SUPABASE_URL: {'✅' if os.getenv('SUPABASE_URL') else '❌'}")
    print(f"SUPABASE_API_KEY: {'✅' if os.getenv('SUPABASE_API_KEY') else '❌'}")
    print(f"REDIS_URL: {'✅' if os.getenv('REDIS_URL') else '❌'}")
    print(f"SECRET_KEY: {'✅' if os.getenv('SECRET_KEY') else '❌'}")
    
    # Test imports
    print("\n📦 Testing imports...")
    try:
        from main import app
        print("✅ Main app import successful")
    except Exception as e:
        print(f"❌ Main app import failed: {e}")
        return 1
    
    try:
        from app.api.rag import router as rag_router
        print(f"✅ RAG router import successful ({len(rag_router.routes)} routes)")
    except Exception as e:
        print(f"❌ RAG router import failed: {e}")
        # Continue anyway
    
    print("\n🌐 Starting server on http://localhost:8000")
    print("📖 API docs available at http://localhost:8000/docs")
    print("🤖 RAG endpoints available at http://localhost:8000/api/v1/rag/")
    
    # Start the server
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )

if __name__ == "__main__":
    try:
        start_server()
    except KeyboardInterrupt:
        print("\n\n👋 Server stopped by user")
    except Exception as e:
        print(f"\n❌ Server startup failed: {e}")
        sys.exit(1)
