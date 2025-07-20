#!/usr/bin/env python3
"""
Simple server startup script for the RAG-enabled e-commerce backend
"""

import os
import sys
from pathlib import Path

# Add the backend directory to Python path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

if __name__ == "__main__":
    import uvicorn
    
    # Load environment variables
    from dotenv import load_dotenv
    load_dotenv()
    
    print("🚀 Starting Entropic E-commerce Backend with RAG System...")
    print("📝 Features: AI Assistant, Vector Search, Product Recommendations")
    print("🔗 API Documentation: http://localhost:8000/docs")
    print("🤖 RAG Endpoints: http://localhost:8000/api/v1/rag/")
    
    # Import and run the app
    from main import app
    
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        reload=True,
        reload_dirs=[str(backend_dir)],
        log_level="info"
    )
