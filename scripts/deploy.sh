#!/bin/bash

# Docker build and deployment script
# This script builds Docker images and deploys the application

set -e

# Configuration
REGISTRY="your-registry.com"
PROJECT_NAME="entropic"
VERSION=${1:-"latest"}

echo "🐳 Building and Deploying Entropic E-commerce Platform"
echo "======================================================"
echo "Version: $VERSION"
echo "Registry: $REGISTRY"
echo ""

# Build Docker images
build_images() {
    echo "🏗️  Building Docker images..."
    
    # Build frontend
    echo "📦 Building frontend image..."
    docker build -f docker/Dockerfile.frontend -t $REGISTRY/$PROJECT_NAME-frontend:$VERSION .
    
    # Build backend
    echo "🔧 Building backend image..."
    docker build -f docker/Dockerfile.backend -t $REGISTRY/$PROJECT_NAME-backend:$VERSION .
    
    echo "✅ Docker images built successfully"
}

# Push images to registry
push_images() {
    echo "📤 Pushing images to registry..."
    
    docker push $REGISTRY/$PROJECT_NAME-frontend:$VERSION
    docker push $REGISTRY/$PROJECT_NAME-backend:$VERSION
    
    echo "✅ Images pushed to registry"
}

# Deploy to Kubernetes
deploy_k8s() {
    echo "☸️  Deploying to Kubernetes..."
    
    # Apply namespace
    kubectl apply -f k8s/namespace/
    
    # Apply database resources
    kubectl apply -f k8s/database/
    
    # Wait for database to be ready
    echo "⏳ Waiting for database to be ready..."
    kubectl wait --for=condition=ready pod -l app=postgres -n entropic --timeout=300s
    
    # Apply backend
    kubectl apply -f k8s/backend/
    
    # Wait for backend to be ready
    echo "⏳ Waiting for backend to be ready..."
    kubectl wait --for=condition=ready pod -l app=backend -n entropic --timeout=300s
    
    # Apply frontend
    kubectl apply -f k8s/frontend/
    
    # Apply ingress
    kubectl apply -f k8s/ingress/
    
    echo "✅ Deployment completed"
}

# Start with Docker Compose (for local development)
start_local() {
    echo "🚀 Starting local development environment..."
    
    # Build and start services
    docker-compose -f docker/docker-compose.yml up --build -d
    
    echo "✅ Local environment started"
    echo ""
    echo "🔗 Services:"
    echo "- Frontend: http://localhost:3000"
    echo "- Backend: http://localhost:8000"
    echo "- Nginx: http://localhost:80"
    echo "- PostgreSQL: localhost:5432"
    echo "- Redis: localhost:6379"
    echo "- ClickHouse: localhost:8123"
    echo "- Chroma: localhost:8001"
}

# Stop local environment
stop_local() {
    echo "🛑 Stopping local development environment..."
    docker-compose -f docker/docker-compose.yml down
    echo "✅ Local environment stopped"
}

# Clean up Docker resources
cleanup() {
    echo "🧹 Cleaning up Docker resources..."
    
    # Remove stopped containers
    docker container prune -f
    
    # Remove unused images
    docker image prune -f
    
    # Remove unused volumes
    docker volume prune -f
    
    echo "✅ Cleanup completed"
}

# Display help
show_help() {
    echo "Usage: $0 [COMMAND] [VERSION]"
    echo ""
    echo "Commands:"
    echo "  build              Build Docker images"
    echo "  push               Push images to registry"
    echo "  deploy             Deploy to Kubernetes"
    echo "  start              Start local development environment"
    echo "  stop               Stop local development environment"
    echo "  cleanup            Clean up Docker resources"
    echo "  help               Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 build v1.0.0    Build images with version v1.0.0"
    echo "  $0 start           Start local development environment"
    echo "  $0 deploy          Deploy to Kubernetes cluster"
}

# Main function
main() {
    case "${1:-help}" in
        build)
            build_images
            ;;
        push)
            build_images
            push_images
            ;;
        deploy)
            build_images
            push_images
            deploy_k8s
            ;;
        start)
            start_local
            ;;
        stop)
            stop_local
            ;;
        cleanup)
            cleanup
            ;;
        help|*)
            show_help
            ;;
    esac
}

# Run the main function
main "$@"
