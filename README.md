# Entropic E-commerce Platform

A modern, cloud-native e-commerce platform built with FastAPI, Next.js, and PostgreSQL, featuring Cloudinary image management and Docker containerization.

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 18+ (for local development)  
- Python 3.11+ (for local development)
- Make (optional, for convenience commands)

**Production Requirements:**
- Docker & Docker Compose (only requirements for production)
- 4GB+ RAM recommended for all services
- 10GB+ disk space for data persistence

### 🏗️ Setup & Installation

```bash
# Clone and enter the project
git clone <repository-url>
cd landing-store

# Full setup (installs all dependencies)
make setup

# Or setup components individually
make setup-backend   # Python environment
make setup-frontend  # Node.js environment
```

### 🐳 Docker Compose Setup

For the easiest setup experience, use Docker Compose:

```bash
# Option 1: Use the convenience command (recommended)
make dev

# Option 2: Use Docker Compose directly
cd docker && docker-compose up -d

# Option 3: Start only database services
make dev-db

# Option 4: Development with auto-reload
make dev-backend    # Backend only
make dev-frontend   # Frontend only
```

#### Docker Compose Files
- `docker/docker-compose.yml` - Complete production setup with all services
- **Services included**: PostgreSQL, Redis, Backend API, Frontend, Nginx, ClickHouse, Kafka, Zookeeper, ChromaDB

#### Service URLs
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Admin Dashboard**: http://localhost:3000/dashboard
- **Database**: localhost:5432 (PostgreSQL)
- **Redis**: localhost:6379
- **ClickHouse**: localhost:8123
- **Kafka**: localhost:9092

### 🚀 Development

```bash
# Start all development servers (interactive)
make dev

# Or start services individually
make dev-backend    # FastAPI on :8000
make dev-frontend   # Next.js on :3000
make dev-db         # PostgreSQL & Redis
```

### 🏗️ Production Deployment

```bash
# Deploy with health checks
make deploy

# Or deploy development environment
make deploy-dev
```

## 📋 Available Commands

Run `make help` or `make` to see all available commands:

### 🏗️ Setup & Installation
- `make setup` - Install all dependencies and setup environment
- `make setup-backend` - Setup backend Python environment
- `make setup-frontend` - Setup frontend Node.js environment

### 🚀 Development
- `make dev` - Start development servers (interactive)
- `make dev-backend` - Start backend development server
- `make dev-frontend` - Start frontend development server
- `make dev-db` - Start database services only

### 🏗️ Build & Deploy
- `make build` - Build all Docker images
- `make deploy` - Deploy to production (with health checks)
- `make deploy-dev` - Deploy development environment

### 🔍 Monitoring
- `make logs` - View all service logs
- `make status` - Show service status
- `make health` - Run health checks

### 🧪 Testing
- `make test` - Run all tests
- `make test-backend` - Run backend tests
- `make test-frontend` - Run frontend tests

### 🧹 Cleanup
- `make clean` - Interactive cleanup menu
- `make clean-all` - Clean all build artifacts
- `make clean-docker` - Clean Docker resources
- `make down` - Stop all services
- `make restart` - Restart all services

## 🏗️ Architecture

### Backend (FastAPI)
- **Framework**: FastAPI with SQLAlchemy ORM
- **Database**: PostgreSQL with Redis caching
- **Authentication**: JWT-based authentication
- **Image Storage**: Cloudinary with WebP conversion
- **API Documentation**: Automatic OpenAPI/Swagger docs
- **Analytics**: Comprehensive dashboard and sales analytics
- **Error Handling**: Professional error handling with fallback responses

### Frontend (Next.js)
- **Framework**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: React Context API
- **Authentication**: JWT token-based auth
- **Responsive Design**: Mobile-first approach
- **Admin Dashboard**: Comprehensive analytics and management interface
- **Error Handling**: Professional error boundaries with fallback UI

### Infrastructure
- **Containerization**: Docker & Docker Compose
- **Database**: PostgreSQL with automatic migrations
- **Caching**: Redis for session management
- **Analytics**: ClickHouse for advanced analytics
- **Messaging**: Kafka with Zookeeper for event streaming
- **Vector Database**: ChromaDB for AI/ML features
- **Reverse Proxy**: Nginx for production
- **Health Checks**: Comprehensive service monitoring

## ✨ Key Features

### E-commerce Core
- **Product Management**: Full CRUD operations with image uploads
- **Shopping Cart**: Persistent cart with real-time updates
- **Order Management**: Complete order lifecycle tracking
- **User Authentication**: Secure JWT-based authentication
- **Payment Integration**: Ready for payment gateway integration

### Admin Dashboard
- **Real-time Analytics**: Sales, revenue, user metrics
- **Product Analytics**: Most viewed products, low stock alerts
- **Order Tracking**: Recent orders with status updates
- **User Management**: User activity and conversion tracking
- **Professional Error Handling**: Fallback UI for all scenarios

### Advanced Features
- **Image Management**: Cloudinary integration with automatic WebP conversion
- **Responsive Design**: Mobile-first approach with modern UI
- **Professional Error Handling**: Comprehensive error boundaries
- **Health Monitoring**: Service health checks and monitoring
- **Analytics Pipeline**: ClickHouse for advanced analytics

## 🔧 Recent Improvements

### Backend Enhancements
- **Fixed SQLAlchemy Attribute Access**: Resolved Column type attribute access issues
- **Professional Error Handling**: Comprehensive try/catch blocks with fallback responses
- **Analytics API**: Full analytics endpoints for dashboard integration
- **Safe Database Operations**: Implemented helper functions for safe attribute access

### Frontend Improvements
- **Optional Chaining**: Professional error handling with \`?.\` operators
- **Array Safety**: Safe array operations with \`(array || []).map()\` patterns
- **Fallback UI**: Graceful degradation when data is unavailable
- **Dashboard Accessibility**: Temporary authentication bypass for development

### Code Quality
- **TypeScript Safety**: Improved type safety throughout the application
- **Error Boundaries**: Comprehensive error handling at all levels
- **Defensive Programming**: Safe data access patterns
- **Production Ready**: Professional error handling for production deployment

---

Built with ❤️ using FastAPI, Next.js, PostgreSQL, and Cloudinary.
