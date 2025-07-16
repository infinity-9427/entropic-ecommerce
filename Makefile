# Entropic E-commerce Platform Makefile
# Quick commands for development and deployment

.PHONY: help setup dev build test clean deploy-local deploy-k8s

# Default target
help:
	@echo "🚀 Entropic E-commerce Platform"
	@echo "==============================="
	@echo ""
	@echo "Available commands:"
	@echo ""
	@echo "Development:"
	@echo "  setup         Setup development environment"
	@echo "  dev           Start development servers"
	@echo "  frontend      Start frontend development server"
	@echo "  backend       Start backend development server"
	@echo "  analytics     Start analytics dashboard"
	@echo "  rag           Start RAG system"
	@echo ""
	@echo "Building:"
	@echo "  build         Build all Docker images"
	@echo "  build-frontend Build frontend Docker image"
	@echo "  build-backend  Build backend Docker image"
	@echo ""
	@echo "Testing:"
	@echo "  test          Run all tests"
	@echo "  test-frontend Run frontend tests"
	@echo "  test-backend  Run backend tests"
	@echo ""
	@echo "Deployment:"
	@echo "  deploy-local  Deploy with Docker Compose"
	@echo "  deploy-k8s    Deploy to Kubernetes"
	@echo "  stop-local    Stop local deployment"
	@echo ""
	@echo "Utilities:"
	@echo "  clean         Clean up build artifacts"
	@echo "  logs          Show Docker logs"
	@echo "  shell-backend Shell into backend container"
	@echo "  db-migrate    Run database migrations"

# Setup development environment
setup:
	@echo "🔧 Setting up development environment..."
	./scripts/setup-dev.sh

# Development commands
dev:
	@echo "🚀 Starting all development servers..."
	@echo "Frontend will be available at http://localhost:3000"
	@echo "Backend will be available at http://localhost:8000"
	@echo "Press Ctrl+C to stop all servers"
	@make -j4 frontend backend analytics rag

frontend:
	@echo "🎨 Starting frontend development server..."
	cd frontend && pnpm dev

backend:
	@echo "🔧 Starting backend development server..."
	cd backend && python main.py

analytics:
	@echo "📊 Starting analytics dashboard..."
	cd analytics && streamlit run dashboards/streamlit_dashboard.py --server.port 8501

rag:
	@echo "🤖 Starting RAG system..."
	cd rag-system && python main.py

# Build commands
build:
	@echo "🏗️ Building all Docker images..."
	./scripts/deploy.sh build

build-frontend:
	@echo "🏗️ Building frontend Docker image..."
	docker build -f docker/Dockerfile.frontend -t entropic/frontend:latest .

build-backend:
	@echo "🏗️ Building backend Docker image..."
	docker build -f docker/Dockerfile.backend -t entropic/backend:latest .

# Testing commands
test:
	@echo "🧪 Running all tests..."
	@make test-frontend
	@make test-backend

test-frontend:
	@echo "🧪 Running frontend tests..."
	cd frontend && pnpm test

test-backend:
	@echo "🧪 Running backend tests..."
	cd backend && python -m pytest

# Deployment commands
deploy-local:
	@echo "🐳 Deploying with Docker Compose..."
	./scripts/deploy.sh start

deploy-k8s:
	@echo "☸️ Deploying to Kubernetes..."
	./scripts/deploy.sh deploy

stop-local:
	@echo "🛑 Stopping local deployment..."
	./scripts/deploy.sh stop

# Database commands
db-migrate:
	@echo "📊 Running database migrations..."
	cd backend && alembic upgrade head

db-reset:
	@echo "🗄️ Resetting database..."
	cd backend && alembic downgrade base && alembic upgrade head

# Utility commands
clean:
	@echo "🧹 Cleaning up build artifacts..."
	./scripts/deploy.sh cleanup
	cd frontend && rm -rf .next out node_modules/.cache
	find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	find . -type f -name "*.pyc" -delete

logs:
	@echo "📋 Showing Docker logs..."
	docker-compose -f docker/docker-compose.yml logs -f

shell-backend:
	@echo "🐚 Opening shell in backend container..."
	docker-compose -f docker/docker-compose.yml exec backend /bin/bash

shell-frontend:
	@echo "🐚 Opening shell in frontend container..."
	docker-compose -f docker/docker-compose.yml exec frontend /bin/sh

# Install dependencies
install:
	@echo "📦 Installing all dependencies..."
	cd frontend && pnpm install
	cd backend && pip install -e .
	cd analytics && pip install -e .
	cd rag-system && pip install -e .

# Format code
format:
	@echo "✨ Formatting code..."
	cd frontend && pnpm run prettier
	cd backend && black . && isort .
	cd analytics && black . && isort .
	cd rag-system && black . && isort .

# Lint code
lint:
	@echo "🔍 Linting code..."
	cd frontend && pnpm run lint
	cd backend && flake8 . && mypy .
	cd analytics && flake8 . && mypy .
	cd rag-system && flake8 . && mypy .

# Security scan
security:
	@echo "🔐 Running security scans..."
	cd backend && safety check
	cd analytics && safety check
	cd rag-system && safety check

# Generate documentation
docs:
	@echo "📚 Generating documentation..."
	cd backend && python -c "import uvicorn; uvicorn.run('main:app', host='0.0.0.0', port=8000)" &
	sleep 5
	curl -o api-docs.json http://localhost:8000/openapi.json
	pkill -f uvicorn

# Backup database
backup:
	@echo "💾 Creating database backup..."
	docker-compose -f docker/docker-compose.yml exec postgres pg_dump -U entropic_user entropic_db > backup_$(shell date +%Y%m%d_%H%M%S).sql

# Restore database
restore:
	@echo "📥 Restoring database from backup..."
	@read -p "Enter backup file path: " backup_file; \
	docker-compose -f docker/docker-compose.yml exec -T postgres psql -U entropic_user entropic_db < $$backup_file

# Monitor services
monitor:
	@echo "📊 Monitoring services..."
	watch -n 2 'docker-compose -f docker/docker-compose.yml ps'

# Show system status
status:
	@echo "📊 System Status"
	@echo "==============="
	@echo ""
	@echo "Docker Containers:"
	@docker-compose -f docker/docker-compose.yml ps
	@echo ""
	@echo "Kubernetes Pods:"
	@kubectl get pods -n entropic 2>/dev/null || echo "Kubernetes not available"
	@echo ""
	@echo "Disk Usage:"
	@df -h . | tail -1
	@echo ""
	@echo "Memory Usage:"
	@free -h | grep Mem
