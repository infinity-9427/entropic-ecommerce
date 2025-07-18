#!/bin/bash

# Entropic E-commerce Cleanup Script
# This script provides comprehensive cleanup options

set -e

echo "🧹 Entropic E-commerce Cleanup Utility"
echo "======================================="

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

# Function to clean Docker resources
clean_docker() {
    print_info "Cleaning Docker resources..."
    
    # Stop all containers
    if docker-compose -f docker/docker-compose.yml ps -q | grep -q .; then
        print_info "Stopping Docker containers..."
        docker-compose -f docker/docker-compose.yml down
        print_status "Docker containers stopped"
    fi
    
    # Remove project-specific containers
    if docker ps -a --filter "name=entropic" -q | grep -q .; then
        print_info "Removing project containers..."
        docker rm -f $(docker ps -a --filter "name=entropic" -q)
        print_status "Project containers removed"
    fi
    
    # Remove project-specific images
    if docker images --filter "reference=*entropic*" -q | grep -q .; then
        print_info "Removing project images..."
        docker rmi -f $(docker images --filter "reference=*entropic*" -q)
        print_status "Project images removed"
    fi
    
    # Remove unused volumes
    if docker volume ls -q | grep -q .; then
        print_info "Removing unused volumes..."
        docker volume prune -f
        print_status "Unused volumes removed"
    fi
    
    # Remove unused networks
    if docker network ls --filter "name=entropic" -q | grep -q .; then
        print_info "Removing project networks..."
        docker network rm $(docker network ls --filter "name=entropic" -q) 2>/dev/null || true
        print_status "Project networks removed"
    fi
}

# Function to clean Python cache
clean_python_cache() {
    print_info "Cleaning Python cache files..."
    
    # Remove __pycache__ directories
    find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
    
    # Remove .pyc files
    find . -type f -name "*.pyc" -delete 2>/dev/null || true
    
    # Remove .pyo files
    find . -type f -name "*.pyo" -delete 2>/dev/null || true
    
    # Remove .pytest_cache
    find . -type d -name ".pytest_cache" -exec rm -rf {} + 2>/dev/null || true
    
    # Remove .coverage files
    find . -type f -name ".coverage*" -delete 2>/dev/null || true
    
    print_status "Python cache cleaned"
}

# Function to clean Node.js cache
clean_node_cache() {
    print_info "Cleaning Node.js cache files..."
    
    # Remove node_modules in frontend
    if [ -d "frontend/node_modules" ]; then
        print_info "Removing frontend node_modules..."
        rm -rf frontend/node_modules
        print_status "Frontend node_modules removed"
    fi
    
    # Remove .next build cache
    if [ -d "frontend/.next" ]; then
        print_info "Removing Next.js build cache..."
        rm -rf frontend/.next
        print_status "Next.js build cache removed"
    fi
    
    # Remove package-lock.json if it exists
    if [ -f "frontend/package-lock.json" ]; then
        rm -f frontend/package-lock.json
        print_status "package-lock.json removed"
    fi
    
    # Clear npm cache
    if command -v npm >/dev/null 2>&1; then
        npm cache clean --force 2>/dev/null || true
        print_status "npm cache cleaned"
    fi
}

# Function to clean database files
clean_database_files() {
    print_info "Cleaning database files..."
    
    # Remove SQLite database files
    find . -name "*.db" -type f -delete 2>/dev/null || true
    find . -name "*.db-*" -type f -delete 2>/dev/null || true
    
    # Remove database dumps
    find . -name "*.sql" -path "*/dumps/*" -type f -delete 2>/dev/null || true
    
    print_status "Database files cleaned"
}

# Function to clean log files
clean_logs() {
    print_info "Cleaning log files..."
    
    # Remove log files
    find . -name "*.log" -type f -delete 2>/dev/null || true
    find . -name "*.log.*" -type f -delete 2>/dev/null || true
    
    # Remove temporary files
    find . -name "*.tmp" -type f -delete 2>/dev/null || true
    find . -name "*.temp" -type f -delete 2>/dev/null || true
    
    print_status "Log files cleaned"
}

# Function to clean build artifacts
clean_build_artifacts() {
    print_info "Cleaning build artifacts..."
    
    # Remove Python build artifacts
    find . -type d -name "build" -exec rm -rf {} + 2>/dev/null || true
    find . -type d -name "dist" -exec rm -rf {} + 2>/dev/null || true
    find . -type d -name "*.egg-info" -exec rm -rf {} + 2>/dev/null || true
    
    # Remove frontend build artifacts
    if [ -d "frontend/out" ]; then
        rm -rf frontend/out
        print_status "Frontend build artifacts removed"
    fi
    
    print_status "Build artifacts cleaned"
}

# Function to clean environment files (with confirmation)
clean_env_files() {
    print_warning "This will remove all environment files (.env, .env.local, etc.)"
    read -p "Are you sure you want to continue? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_info "Removing environment files..."
        
        # Remove backend .env files
        find backend -name ".env*" -type f -delete 2>/dev/null || true
        
        # Remove frontend .env files
        find frontend -name ".env*" -type f -delete 2>/dev/null || true
        
        # Remove root .env files
        find . -maxdepth 1 -name ".env*" -type f -delete 2>/dev/null || true
        
        print_status "Environment files removed"
    else
        print_info "Skipping environment files cleanup"
    fi
}

# Function to show cleanup menu
show_menu() {
    echo ""
    echo "🧹 Cleanup Options:"
    echo "1) Clean Docker resources (containers, images, volumes)"
    echo "2) Clean Python cache (__pycache__, .pyc files)"
    echo "3) Clean Node.js cache (node_modules, .next)"
    echo "4) Clean database files (.db files)"
    echo "5) Clean log files and temporary files"
    echo "6) Clean build artifacts"
    echo "7) Clean environment files (.env) - DESTRUCTIVE!"
    echo "8) Full cleanup (all of the above except env files)"
    echo "9) Nuclear cleanup (everything including env files) - DESTRUCTIVE!"
    echo "0) Exit"
    echo ""
}

# Function to perform full cleanup
full_cleanup() {
    print_warning "Performing full cleanup (excluding environment files)..."
    clean_docker
    clean_python_cache
    clean_node_cache
    clean_database_files
    clean_logs
    clean_build_artifacts
    print_status "Full cleanup completed!"
}

# Function to perform nuclear cleanup
nuclear_cleanup() {
    print_error "⚠️  NUCLEAR CLEANUP - THIS IS DESTRUCTIVE!"
    print_warning "This will remove EVERYTHING including environment files!"
    read -p "Are you absolutely sure? Type 'NUKE' to confirm: " -r
    echo
    if [[ $REPLY == "NUKE" ]]; then
        print_info "Performing nuclear cleanup..."
        clean_docker
        clean_python_cache
        clean_node_cache
        clean_database_files
        clean_logs
        clean_build_artifacts
        # Skip interactive prompt for env files in nuclear mode
        find . -name ".env*" -type f -delete 2>/dev/null || true
        print_status "Nuclear cleanup completed!"
    else
        print_info "Nuclear cleanup cancelled"
    fi
}

# Main menu loop
main() {
    while true; do
        show_menu
        read -p "Select an option (0-9): " -n 1 -r
        echo
        
        case $REPLY in
            1)
                clean_docker
                ;;
            2)
                clean_python_cache
                ;;
            3)
                clean_node_cache
                ;;
            4)
                clean_database_files
                ;;
            5)
                clean_logs
                ;;
            6)
                clean_build_artifacts
                ;;
            7)
                clean_env_files
                ;;
            8)
                full_cleanup
                ;;
            9)
                nuclear_cleanup
                ;;
            0)
                print_info "Goodbye!"
                exit 0
                ;;
            *)
                print_error "Invalid option. Please try again."
                ;;
        esac
        
        echo ""
        read -p "Press Enter to continue..."
    done
}

# Run main function
main
