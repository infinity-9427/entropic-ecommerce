# Entropic E-commerce Makefile
# Comprehensive build and development commands

.PHONY: help setup build dev test clean deploy down logs restart status

# Default target
help:
	@echo "🚀 Entropic E-commerce - Available Commands"
	@echo "===========================================" 
	@echo ""
	@echo "🏗️  Setup & Installation:"
	@echo "  make setup          - Install all dependencies and setup environment"
	@echo "  make setup-backend  - Setup backend Python environment"
	@echo "  make setup-frontend - Setup frontend Node.js environment"
	@echo ""
	@echo "🚀 Development:"
	@echo "  make dev            - Start development servers (interactive)"
	@echo "  make dev-backend    - Start backend development server"
	@echo "  make dev-frontend   - Start frontend development server"
	@echo "  make dev-db         - Start database services only"
	@echo ""
	@echo "🏗️  Build & Deploy:"
	@echo "  make build          - Build all Docker images"
	@echo "  make deploy         - Deploy to production (with health checks)"
	@echo "  make deploy-dev     - Deploy development environment"
	@echo ""
	@echo "🔍 Monitoring:"
	@echo "  make logs           - View all service logs"
	@echo "  make logs-backend   - View backend logs"
	@echo "  make logs-frontend  - View frontend logs"
	@echo "  make logs-db        - View database logs"
	@echo "  make status         - Show service status"
	@echo ""
	@echo "🧪 Testing:"
	@echo "  make test           - Run all tests"
	@echo "  make test-backend   - Run backend tests"
	@echo "  make test-frontend  - Run frontend tests"
	@echo ""
	@echo "🧹 Cleanup:"
	@echo "  make clean          - Interactive cleanup menu"
	@echo "  make clean-all      - Clean all build artifacts"
	@echo "  make clean-docker   - Clean Docker resources"
	@echo "  make down           - Stop all services"
	@echo "  make restart        - Restart all services"
	@echo ""

# =============================================================================
# Setup Commands
# =============================================================================

setup: setup-backend setup-frontend
	@echo "✅ Full setup completed!"

setup-backend:
	@echo "🐍 Setting up backend environment..."
	@cd backend && python -m venv .venv || python3 -m venv .venv
	@cd backend && source .venv/bin/activate && pip install -r requirements.txt || pip install -e .
	@echo "✅ Backend setup completed!"

setup-frontend:
	@echo "📦 Setting up frontend environment..."
	@cd frontend && npm install
	@echo "✅ Frontend setup completed!"

# =============================================================================
# Development Commands
# =============================================================================

dev:
	@echo "🚀 Starting development servers..."
	@./scripts/dev-start.sh

dev-backend:
	@echo "🐍 Starting backend development server..."
	@cd backend && source .venv/bin/activate && uvicorn main:app --reload --host 0.0.0.0 --port 8000

dev-frontend:
	@echo "📦 Starting frontend development server..."
	@cd frontend && npm run dev

dev-db:
	@echo "🗄️  Starting database services..."
	@cd docker && docker-compose up -d postgres redis

# =============================================================================
# Build Commands
# =============================================================================

build:
	@echo "🏗️  Building all Docker images..."
	@cd docker && docker-compose build --no-cache

build-backend:
	@echo "🐍 Building backend Docker image..."
	@cd docker && docker-compose build --no-cache backend

build-frontend:
	@echo "📦 Building frontend Docker image..."
	@cd docker && docker-compose build --no-cache frontend

# =============================================================================
# Deployment Commands
# =============================================================================

deploy:
	@echo "🚀 Deploying to production..."
	@./scripts/deploy-prod.sh

deploy-dev:
	@echo "🚀 Deploying development environment..."
	@cd docker && docker-compose up -d

# =============================================================================
# Monitoring Commands
# =============================================================================

logs:
	@echo "📋 Viewing all service logs..."
	@cd docker && docker-compose logs -f

logs-backend:
	@echo "📋 Viewing backend logs..."
	@cd docker && docker-compose logs -f backend

logs-frontend:
	@echo "📋 Viewing frontend logs..."
	@cd docker && docker-compose logs -f frontend

logs-db:
	@echo "📋 Viewing database logs..."
	@cd docker && docker-compose logs -f postgres

status:
	@echo "📊 Service status:"
	@cd docker && docker-compose ps

# =============================================================================
# Testing Commands
# =============================================================================

test:
	@echo "🧪 Running all tests..."
	@make test-backend
	@make test-frontend

test-backend:
	@echo "🧪 Running backend tests..."
	@cd backend && source .venv/bin/activate && python -m pytest tests/ -v

test-frontend:
	@echo "🧪 Running frontend tests..."
	@cd frontend && npm test

# =============================================================================
# Cleanup Commands
# =============================================================================

clean:
	@echo "🧹 Starting interactive cleanup..."
	@./scripts/cleanup.sh

clean-all:
	@echo "🧹 Cleaning all build artifacts..."
	@find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	@find . -type f -name "*.pyc" -delete 2>/dev/null || true
	@find . -type d -name ".pytest_cache" -exec rm -rf {} + 2>/dev/null || true
	@cd frontend && rm -rf node_modules .next 2>/dev/null || true
	@echo "✅ Build artifacts cleaned!"

clean-docker:
	@echo "🧹 Cleaning Docker resources..."
	@cd docker && docker-compose down -v --remove-orphans
	@docker system prune -f
	@echo "✅ Docker resources cleaned!"

down:
	@echo "⏹️  Stopping all services..."
	@cd docker && docker-compose down

restart:
	@echo "🔄 Restarting all services..."
	@cd docker && docker-compose restart

# =============================================================================
# Utility Commands
# =============================================================================

shell-backend:
	@echo "🐍 Opening backend shell..."
	@cd docker && docker-compose exec backend bash

shell-db:
	@echo "🗄️  Opening database shell..."
	@cd docker && docker-compose exec postgres psql -U entropic -d entropic_ecommerce

health:
	@echo "🏥 Health check..."
	@curl -f http://localhost:8000/health || echo "Backend not responding"
	@curl -f http://localhost:3000 || echo "Frontend not responding"

# =============================================================================
# Database Commands
# =============================================================================

db-migrate:
	@echo "🗄️  Running database migrations..."
	@cd docker && docker-compose exec backend python -c "from database import engine; from models import Base; Base.metadata.create_all(bind=engine)"

db-reset:
	@echo "⚠️  Resetting database..."
	@cd docker && docker-compose down -v
	@cd docker && docker-compose up -d postgres
	@sleep 5
	@make db-migrate

db-backup:
	@echo "💾 Creating database backup..."
	@cd docker && docker-compose exec postgres pg_dump -U entropic entropic_ecommerce > backup_$(shell date +%Y%m%d_%H%M%S).sql

# =============================================================================
# Security Commands
# =============================================================================

security-check:
	@echo "🔒 Running security checks..."
	@cd backend && source .venv/bin/activate && pip install safety bandit
	@cd backend && source .venv/bin/activate && safety check
	@cd backend && source .venv/bin/activate && bandit -r .
	@cd frontend && npm audit

# =============================================================================
# Performance Commands
# =============================================================================

performance-test:
	@echo "⚡ Running performance tests..."
	@cd docker && docker-compose exec backend python -c "import time; start = time.time(); import main; print(f'Backend startup time: {time.time() - start:.2f}s')"

# =============================================================================
# Documentation Commands
# =============================================================================

docs:
	@echo "📚 Generating documentation..."
	@cd backend && source .venv/bin/activate && pip install sphinx
	@cd backend && source .venv/bin/activate && sphinx-build -b html docs/ docs/_build/

# =============================================================================
# Environment Commands
# =============================================================================

env-check:
	@echo "🔍 Checking environment variables..."
	@echo "Backend .env file:"
	@test -f backend/.env && echo "✅ Found" || echo "❌ Missing"
	@echo "Frontend .env.local file:"
	@test -f frontend/.env.local && echo "✅ Found" || echo "❌ Missing"
