#!/bin/bash

# Entropic E-commerce Production Deployment Script
# This script handles production deployment with proper health checks

set -e

echo "🚀 Entropic E-commerce Production Deployment"
echo "=============================================="

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

# Function to check if Docker is running
check_docker() {
    if ! docker info >/dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker first."
        exit 1
    fi
    print_status "Docker is running"
}

# Function to check if docker-compose is available
check_docker_compose() {
    if ! command -v docker-compose >/dev/null 2>&1; then
        print_error "docker-compose is not installed. Please install it first."
        exit 1
    fi
    print_status "docker-compose is available"
}

# Function to validate environment files
validate_env_files() {
    print_info "Validating environment files..."
    
    # Check backend .env
    if [ ! -f "backend/.env" ]; then
        print_error "Backend .env file not found!"
        print_info "Please create backend/.env with required variables"
        exit 1
    fi
    
    # Check frontend .env.local
    if [ ! -f "frontend/.env.local" ]; then
        print_warning "Frontend .env.local not found. Using defaults."
    fi
    
    print_status "Environment files validated"
}

# Function to build and start services
deploy_services() {
    print_info "Building and starting production services..."
    
    # Navigate to docker directory
    cd docker
    
    # Stop any existing services
    print_info "Stopping existing services..."
    docker-compose down || true
    
    # Build and start services
    print_info "Building images..."
    docker-compose build --no-cache
    
    print_info "Starting services..."
    docker-compose up -d
    
    cd ..
}

# Function to wait for services to be healthy
wait_for_services() {
    print_info "Waiting for services to be healthy..."
    
    # Wait for database
    print_info "Waiting for database..."
    timeout=60
    counter=0
    while ! docker-compose -f docker/docker-compose.yml exec postgres pg_isready -U entropic -d entropic_ecommerce >/dev/null 2>&1; do
        if [ $counter -ge $timeout ]; then
            print_error "Database health check timed out"
            exit 1
        fi
        sleep 1
        counter=$((counter + 1))
    done
    print_status "Database is healthy"
    
    # Wait for backend
    print_info "Waiting for backend..."
    timeout=60
    counter=0
    while ! curl -f http://localhost:8000/health >/dev/null 2>&1; do
        if [ $counter -ge $timeout ]; then
            print_error "Backend health check timed out"
            exit 1
        fi
        sleep 1
        counter=$((counter + 1))
    done
    print_status "Backend is healthy"
    
    # Wait for frontend
    print_info "Waiting for frontend..."
    timeout=60
    counter=0
    while ! curl -f http://localhost:3000 >/dev/null 2>&1; do
        if [ $counter -ge $timeout ]; then
            print_error "Frontend health check timed out"
            exit 1
        fi
        sleep 1
        counter=$((counter + 1))
    done
    print_status "Frontend is healthy"
}

# Function to run database migrations
run_migrations() {
    print_info "Running database migrations..."
    
    # Run any pending migrations
    docker-compose -f docker/docker-compose.yml exec backend python -c "
from database import engine
from models import Base
Base.metadata.create_all(bind=engine)
print('Database tables created/updated')
"
    
    print_status "Database migrations completed"
}

# Function to show deployment summary
show_deployment_summary() {
    print_status "🎉 Production deployment completed successfully!"
    echo ""
    echo "🌐 Services are running:"
    echo "   Frontend: http://localhost:3000"
    echo "   Backend:  http://localhost:8000"
    echo "   API Docs: http://localhost:8000/docs"
    echo ""
    echo "🐳 Docker containers:"
    docker-compose -f docker/docker-compose.yml ps
    echo ""
    echo "📊 Resource usage:"
    docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}"
    echo ""
    echo "📋 Useful commands:"
    echo "   View logs:     make logs"
    echo "   Stop services: make down"
    echo "   Restart:       make restart"
    echo "   Update:        make deploy"
}

# Main deployment flow
main() {
    print_info "Starting production deployment..."
    
    # Pre-deployment checks
    check_docker
    check_docker_compose
    validate_env_files
    
    # Deploy services
    deploy_services
    
    # Wait for services to be ready
    wait_for_services
    
    # Run migrations
    run_migrations
    
    # Show summary
    show_deployment_summary
}

# Run main function
main
