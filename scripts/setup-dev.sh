#!/bin/bash

# Entropic E-commerce Development Environment Setup
# This script sets up the complete development environment

set -e

echo "🔧 Entropic E-commerce Development Environment Setup"
echo "====================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check prerequisites
check_prerequisites() {
    print_info "Checking prerequisites..."
    
    # Check Docker
    if command_exists docker; then
        print_status "Docker is installed"
    else
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    # Check Docker Compose
    if command_exists docker-compose; then
        print_status "Docker Compose is installed"
    else
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    # Check Node.js
    if command_exists node; then
        NODE_VERSION=$(node --version)
        print_status "Node.js is installed ($NODE_VERSION)"
    else
        print_warning "Node.js is not installed. Some features may not work in local development."
    fi
    
    # Check Python
    if command_exists python3; then
        PYTHON_VERSION=$(python3 --version)
        print_status "Python is installed ($PYTHON_VERSION)"
    else
        print_warning "Python is not installed. Some features may not work in local development."
    fi
    
    # Check Make
    if command_exists make; then
        print_status "Make is installed"
    else
        print_warning "Make is not installed. You'll need to run commands manually."
    fi
}

# Function to setup backend environment
setup_backend() {
    print_info "Setting up backend environment..."
    
    cd backend
    
    # Create virtual environment
    if [ ! -d ".venv" ]; then
        print_info "Creating Python virtual environment..."
        python3 -m venv .venv
        print_status "Virtual environment created"
    else
        print_status "Virtual environment already exists"
    fi
    
    # Activate virtual environment and install dependencies
    print_info "Installing Python dependencies..."
    source .venv/bin/activate
    
    # Check if requirements.txt exists
    if [ -f "requirements.txt" ]; then
        pip install -r requirements.txt
        print_status "Requirements installed from requirements.txt"
    elif [ -f "pyproject.toml" ]; then
        pip install -e .
        print_status "Package installed from pyproject.toml"
    else
        print_warning "No requirements.txt or pyproject.toml found. Installing basic dependencies..."
        pip install fastapi uvicorn sqlalchemy psycopg2-binary redis python-multipart
        print_status "Basic dependencies installed"
    fi
    
    # Create .env file if it doesn't exist
    if [ ! -f ".env" ]; then
        print_info "Creating backend .env file..."
        cat > .env << EOF
# Database
DATABASE_URL=postgresql://entropic:password@localhost:5432/entropic_ecommerce
REDIS_URL=redis://localhost:6379

# Security
JWT_SECRET_KEY=your-secret-key-here-change-in-production
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=30

# Cloudinary (optional - for image storage)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Development
DEBUG=true
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
EOF
        print_status "Backend .env file created"
    else
        print_status "Backend .env file already exists"
    fi
    
    cd ..
}

# Function to setup frontend environment
setup_frontend() {
    print_info "Setting up frontend environment..."
    
    cd frontend
    
    # Install dependencies
    if [ -f "package.json" ]; then
        print_info "Installing Node.js dependencies..."
        
        # Check if npm or pnpm is available
        if command_exists pnpm; then
            pnpm install
            print_status "Dependencies installed with pnpm"
        elif command_exists npm; then
            npm install
            print_status "Dependencies installed with npm"
        else
            print_error "Neither npm nor pnpm found. Please install Node.js first."
            cd ..
            return 1
        fi
    else
        print_warning "No package.json found in frontend directory"
    fi
    
    # Create .env.local file if it doesn't exist
    if [ ! -f ".env.local" ]; then
        print_info "Creating frontend .env.local file..."
        cat > .env.local << EOF
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Development
NODE_ENV=development
NEXT_PUBLIC_DEBUG=true
EOF
        print_status "Frontend .env.local file created"
    else
        print_status "Frontend .env.local file already exists"
    fi
    
    cd ..
}

# Function to setup Docker environment
setup_docker() {
    print_info "Setting up Docker environment..."
    
    cd docker
    
    # Check if docker-compose.yml exists
    if [ -f "docker-compose.yml" ]; then
        print_info "Building Docker images..."
        docker-compose build
        print_status "Docker images built"
    else
        print_warning "No docker-compose.yml found in docker directory"
    fi
    
    cd ..
}

# Function to initialize database
initialize_database() {
    print_info "Initializing database..."
    
    # Start PostgreSQL and Redis
    cd docker
    docker-compose up -d postgres redis
    
    # Wait for database to be ready
    print_info "Waiting for database to be ready..."
    sleep 10
    
    # Check if we can connect to the database
    if docker-compose exec postgres pg_isready -U entropic -d entropic_ecommerce >/dev/null 2>&1; then
        print_status "Database is ready"
    else
        print_warning "Database may not be ready. Please check manually."
    fi
    
    cd ..
}

# Function to create useful scripts
create_scripts() {
    print_info "Creating development scripts..."
    
    # Create a quick start script
    cat > start-dev.sh << 'EOF'
#!/bin/bash
echo "🚀 Starting Entropic E-commerce Development Environment"
echo "======================================================="

# Start databases
echo "Starting databases..."
cd docker && docker-compose up -d postgres redis
cd ..

# Start backend
echo "Starting backend..."
cd backend && source .venv/bin/activate && uvicorn main:app --reload --host 0.0.0.0 --port 8000 &
cd ..

# Start frontend
echo "Starting frontend..."
cd frontend && npm run dev &

echo "✅ Development environment started!"
echo "Frontend: http://localhost:3000"
echo "Backend: http://localhost:8000"
echo "API Docs: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop all services"
wait
EOF
    chmod +x start-dev.sh
    print_status "Development start script created"
}

# Main setup function
main() {
    print_info "Starting development environment setup..."
    
    # Check prerequisites
    check_prerequisites
    
    # Setup backend
    setup_backend
    
    # Setup frontend
    setup_frontend
    
    # Setup Docker
    setup_docker
    
    # Initialize database
    initialize_database
    
    # Create scripts
    create_scripts
    
    print_status "🎉 Development environment setup completed!"
    echo ""
    echo "📋 Next steps:"
    echo "1. Review and update environment files:"
    echo "   - backend/.env"
    echo "   - frontend/.env.local"
    echo ""
    echo "2. Start development servers:"
    echo "   - make dev (interactive)"
    echo "   - make dev-backend (backend only)"
    echo "   - make dev-frontend (frontend only)"
    echo "   - ./start-dev.sh (simple script)"
    echo ""
    echo "3. Access the applications:"
    echo "   - Frontend: http://localhost:3000"
    echo "   - Backend: http://localhost:8000"
    echo "   - API Docs: http://localhost:8000/docs"
    echo ""
    echo "4. Run tests:"
    echo "   - make test"
    echo ""
    echo "5. View logs:"
    echo "   - make logs"
    echo ""
    echo "For more commands, run: make help"
    echo ""
    echo "Happy coding! 🚀"
}

# Run main function
main
