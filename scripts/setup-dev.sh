#!/bin/bash

# Development setup script for Entropic E-commerce Platform
# This script sets up the development environment

set -e

echo "🚀 Setting up Entropic E-commerce Development Environment"
echo "=================================================="

# Check if required tools are installed
check_requirements() {
    echo "📋 Checking requirements..."
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        echo "❌ Node.js is not installed. Please install Node.js 18+ first."
        exit 1
    fi
    
    # Check pnpm
    if ! command -v pnpm &> /dev/null; then
        echo "📦 Installing pnpm..."
        npm install -g pnpm
    fi
    
    # Check Python
    if ! command -v python3 &> /dev/null; then
        echo "❌ Python 3 is not installed. Please install Python 3.11+ first."
        exit 1
    fi
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        echo "⚠️  Docker is not installed. Some features will not be available."
    fi
    
    echo "✅ Requirements check completed"
}

# Setup frontend
setup_frontend() {
    echo "🎨 Setting up frontend..."
    cd frontend
    
    echo "📦 Installing frontend dependencies..."
    pnpm install
    
    echo "🏗️  Building frontend..."
    pnpm build
    
    cd ..
    echo "✅ Frontend setup completed"
}

# Setup backend
setup_backend() {
    echo "🔧 Setting up backend..."
    cd backend
    
    echo "🐍 Creating Python virtual environment..."
    python3 -m venv venv
    source venv/bin/activate
    
    echo "📦 Installing backend dependencies..."
    pip install -e .
    
    cd ..
    echo "✅ Backend setup completed"
}

# Setup analytics
setup_analytics() {
    echo "📊 Setting up analytics..."
    cd analytics
    
    echo "🐍 Creating Python virtual environment..."
    python3 -m venv venv
    source venv/bin/activate
    
    echo "📦 Installing analytics dependencies..."
    pip install -e .
    
    cd ..
    echo "✅ Analytics setup completed"
}

# Setup RAG system
setup_rag() {
    echo "🤖 Setting up RAG system..."
    cd rag-system
    
    echo "🐍 Creating Python virtual environment..."
    python3 -m venv venv
    source venv/bin/activate
    
    echo "📦 Installing RAG system dependencies..."
    pip install -e .
    
    cd ..
    echo "✅ RAG system setup completed"
}

# Create environment files
create_env_files() {
    echo "🔐 Creating environment files..."
    
    # Backend .env
    if [ ! -f backend/.env ]; then
        cat > backend/.env << EOL
# Database
DATABASE_URL=postgresql://entropic_user:entropic_password@localhost:5432/entropic_db

# Redis
REDIS_URL=redis://localhost:6379/0

# JWT
SECRET_KEY=your-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Environment
ENVIRONMENT=development
DEBUG=true

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
EOL
        echo "📄 Created backend/.env"
    fi
    
    # Frontend .env.local
    if [ ! -f frontend/.env.local ]; then
        cat > frontend/.env.local << EOL
# API URL
NEXT_PUBLIC_API_URL=http://localhost:8000

# Environment
NODE_ENV=development
EOL
        echo "📄 Created frontend/.env.local"
    fi
    
    # RAG system .env
    if [ ! -f rag-system/.env ]; then
        cat > rag-system/.env << EOL
# OpenAI (optional)
OPENAI_API_KEY=your-openai-api-key

# Chroma DB
CHROMA_HOST=localhost
CHROMA_PORT=8001

# Environment
ENVIRONMENT=development
DEBUG=true
EOL
        echo "📄 Created rag-system/.env"
    fi
    
    echo "✅ Environment files created"
}

# Main setup function
main() {
    echo "Starting setup process..."
    
    check_requirements
    create_env_files
    setup_frontend
    setup_backend
    setup_analytics
    setup_rag
    
    echo ""
    echo "🎉 Setup completed successfully!"
    echo ""
    echo "📝 Next steps:"
    echo "1. Start PostgreSQL and Redis (via Docker or locally)"
    echo "2. Run 'pnpm dev' in the frontend directory"
    echo "3. Run 'python main.py' in the backend directory"
    echo "4. Run 'python main.py' in the rag-system directory"
    echo "5. Run 'streamlit run dashboards/streamlit_dashboard.py' in the analytics directory"
    echo ""
    echo "🔗 URLs:"
    echo "- Frontend: http://localhost:3000"
    echo "- Backend API: http://localhost:8000"
    echo "- API Docs: http://localhost:8000/docs"
    echo "- RAG System: http://localhost:8001"
    echo "- Analytics Dashboard: http://localhost:8501"
    echo ""
    echo "📚 Read the README.md for more detailed instructions."
}

# Run the main function
main
