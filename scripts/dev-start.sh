#!/bin/bash

# Entropic E-commerce Development Start Script
# This script starts the development servers

set -e

echo "🚀 Starting Entropic E-commerce Development Servers"
echo "===================================================="

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

# Function to check if a port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# Function to start backend
start_backend() {
    print_info "Starting backend server..."
    cd backend
    
    if [ -f ".env" ]; then
        print_status "Found backend .env file"
    else
        print_warning "No backend .env file found. Using defaults."
    fi
    
    if check_port 8000; then
        print_warning "Port 8000 is already in use. Backend may already be running."
    else
        print_status "Starting FastAPI backend on port 8000..."
        if [ -d ".venv" ]; then
            source .venv/bin/activate
        fi
        uvicorn main:app --reload --host 0.0.0.0 --port 8000 &
        BACKEND_PID=$!
        print_status "Backend started with PID $BACKEND_PID"
    fi
    
    cd ..
}

# Function to start frontend
start_frontend() {
    print_info "Starting frontend server..."
    cd frontend
    
    if [ -f ".env.local" ]; then
        print_status "Found frontend .env.local file"
    else
        print_warning "No frontend .env.local file found. Using defaults."
    fi
    
    if check_port 3000; then
        print_warning "Port 3000 is already in use. Frontend may already be running."
    else
        print_status "Starting Next.js frontend on port 3000..."
        npm run dev &
        FRONTEND_PID=$!
        print_status "Frontend started with PID $FRONTEND_PID"
    fi
    
    cd ..
}

# Function to start database services
start_databases() {
    print_info "Starting database services..."
    cd docker
    
    if docker-compose ps | grep -q "postgres"; then
        print_status "PostgreSQL is already running"
    else
        print_status "Starting PostgreSQL..."
        docker-compose up -d postgres
    fi
    
    if docker-compose ps | grep -q "redis"; then
        print_status "Redis is already running"
    else
        print_status "Starting Redis..."
        docker-compose up -d redis
    fi
    
    cd ..
}

# Function to cleanup on exit
cleanup() {
    echo ""
    print_info "Shutting down development servers..."
    
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null || true
        print_status "Backend server stopped"
    fi
    
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null || true
        print_status "Frontend server stopped"
    fi
    
    exit 0
}

# Set up trap to cleanup on exit
trap cleanup EXIT INT TERM

# Start services
start_databases
sleep 2

start_backend
sleep 2

start_frontend
sleep 2

print_status "All development servers started!"
echo ""
echo "🎉 Development servers are running:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:8000"
echo "   API Docs: http://localhost:8000/docs"
echo ""
echo "📋 Logs:"
echo "   Backend logs will appear above"
echo "   Frontend logs will appear above"
echo ""
echo "⏹️  Press Ctrl+C to stop all servers"
echo ""

# Wait for user input or until processes die
while true; do
    if [ ! -z "$BACKEND_PID" ] && ! kill -0 $BACKEND_PID 2>/dev/null; then
        print_error "Backend server died unexpectedly"
        break
    fi
    
    if [ ! -z "$FRONTEND_PID" ] && ! kill -0 $FRONTEND_PID 2>/dev/null; then
        print_error "Frontend server died unexpectedly"
        break
    fi
    
    sleep 1
done
