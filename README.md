# Entropic E-Commerce Platform

A modern, full-stack e-commerce platform built with Next.js 15, React 19, and FastAPI backend, featuring AI-powered search, real-time analytics, and production-ready containerization.

## 🏗️ Architecture

```
├── frontend/          # Next.js 15 + React 19 + TypeScript
├── backend/           # FastAPI with Alpine Linux
├── analytics/         # Streamlit dashboard + data science
├── rag-system/        # AI-powered product search
├── docker/            # Multi-stage Alpine containers
├── k8s/               # Kubernetes manifests
└── scripts/           # Development and deployment automation
```

## ✨ Features

- 🛒 **Modern E-Commerce Frontend**: Next.js 15 with App Router, React 19, TypeScript, and Tailwind CSS
- 🎨 **Brand Ticker Component**: Animated scrolling brand logos with customizable speed and direction
- 🚀 **FastAPI Backend**: High-performance API with PostgreSQL, Redis, and Celery integration
- 📊 **Analytics Dashboard**: Interactive Streamlit dashboard with real-time insights
- 🤖 **RAG System**: AI-powered product search and recommendations
- 🐳 **Alpine Linux Containers**: Lightweight Docker images with multi-stage builds
- ☸️ **Kubernetes Ready**: Production-ready K8s manifests with health checks
- � **Responsive Design**: Mobile-first approach with Radix UI components
- 🔄 **State Management**: Zustand for client-side state management
- 🛡️ **Type Safety**: Full TypeScript implementation across the stack

## 🚀 Quick Start

### Prerequisites
```bash
# Required tools
- Node.js 22+ (with pnpm)
- Python 3.11+
- Docker & Docker Compose
- kubectl (for Kubernetes deployment)
```

### Development Setup

1. **Clone and install dependencies**
   ```bash
   git clone https://github.com/infinity-9427/entropic-ecommerce.git
   cd entropic-ecommerce
   
   # Automated setup
   make setup
   ```

2. **Start development servers**
   ```bash
   # All services at once
   make dev
   
   # Or individually
   make frontend    # http://localhost:3000
   make backend     # http://localhost:8000
   make analytics   # http://localhost:8501
   make rag        # http://localhost:8001
   ```

### Production Deployment

#### Docker Compose (Local)
```bash
# Build and start all services
docker-compose -f docker/docker-compose.yml up -d

# Frontend + Backend only
docker-compose -f docker/docker-compose.yml up -d frontend backend --no-deps
```

#### Kubernetes (Production)
```bash
# Deploy to Kubernetes
kubectl apply -f k8s/
```

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** with App Router and React 19
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Radix UI** components with shadcn/ui
- **Zustand** for state management
- **Lucide React** icons
- **pnpm** package manager

### Backend
- **FastAPI** with Uvicorn server
- **PostgreSQL** database
- **Redis** for caching
- **SQLAlchemy** ORM
- **Celery** for background tasks
- **Pydantic** for data validation

### Analytics & AI
- **Streamlit** dashboard
- **Pandas** and **NumPy** for data processing
- **RAG System** with vector search
- **Apache Kafka** for event streaming
- **ClickHouse** for analytics storage

### Infrastructure
- **Docker** with Alpine Linux (Node.js 22, Python 3.12)
- **Docker Compose** for orchestration
- **Kubernetes** manifests
- **Nginx** reverse proxy
- **Multi-stage builds** for optimization

## 🎯 Key Features

### 🛒 E-Commerce Frontend
- **Modern UI**: Clean, responsive design with Tailwind CSS
- **Product Grid**: Filterable and sortable product listings
- **Shopping Cart**: Full cart functionality with Zustand state management
- **Brand Ticker**: Animated scrolling brand logos (customizable speed/direction)
- **TypeScript**: Full type safety across components

### 🚀 Backend API
- **FastAPI**: High-performance async API
- **Health Checks**: Built-in monitoring endpoints
- **Database**: PostgreSQL with SQLAlchemy ORM
- **Caching**: Redis integration for performance
- **Background Tasks**: Celery for async processing

### 📊 Analytics Dashboard
- **Streamlit**: Interactive web dashboard
- **Real-time Metrics**: Live data visualization
- **Data Processing**: Pandas and NumPy integration
- **Export Capabilities**: CSV and report generation

### 🤖 RAG System
- **AI Search**: Natural language product search
- **Recommendations**: Intelligent product suggestions
- **Vector Database**: Chroma for semantic search
- **API Integration**: RESTful endpoints for AI features

### 🐳 Production Ready
- **Alpine Linux**: Lightweight containers (Node.js 22, Python 3.12)
- **Multi-stage Builds**: Optimized Docker images
- **Kubernetes**: Production-ready manifests
- **Health Checks**: Container health monitoring
- **Nginx**: Reverse proxy configuration

## 🔧 Development Commands

```bash
# Setup and Development
make setup          # Initialize development environment
make dev           # Start all services in development mode
make frontend      # Start frontend only (localhost:3000)
make backend       # Start backend only (localhost:8000)
make analytics     # Start analytics dashboard (localhost:8501)
make rag          # Start RAG system (localhost:8001)

# Building and Testing
make build         # Build all Docker images
make test          # Run all tests
make lint          # Run linting
make format        # Format code

# Deployment
make deploy-local  # Deploy with Docker Compose
make deploy-k8s    # Deploy to Kubernetes
make logs          # View Docker logs
make clean         # Clean build artifacts
```

## 🏗️ Project Structure

```
entropic-ecommerce/
├── frontend/                    # Next.js 15 Frontend
│   ├── src/
│   │   ├── app/                # App Router pages
│   │   │   ├── page.tsx       # Homepage with product grid
│   │   │   ├── cart/          # Shopping cart
│   │   │   ├── deals/         # Deals page
│   │   │   └── brand-ticker-demo/
│   │   ├── components/         # Reusable components
│   │   │   ├── brand-ticker.tsx
│   │   │   ├── header.tsx
│   │   │   ├── footer.tsx
│   │   │   ├── product-card.tsx
│   │   │   └── ui/            # Radix UI components
│   │   ├── lib/               # Utils and data
│   │   │   ├── brands.ts      # Brand ticker data
│   │   │   ├── data.ts        # Mock product data
│   │   │   └── store.ts       # Zustand store
│   │   └── styles/
│   ├── public/                # Static assets
│   ├── package.json           # Dependencies
│   └── next.config.ts         # Next.js config
├── backend/                    # FastAPI Backend
│   ├── main.py               # FastAPI application
│   ├── pyproject.toml        # Python dependencies
│   └── README.md
├── analytics/                  # Data Analytics
│   ├── dashboards/
│   │   └── streamlit_dashboard.py
│   ├── notebooks/            # Jupyter notebooks
│   └── pyproject.toml
├── rag-system/                # RAG Implementation
│   ├── main.py              # RAG FastAPI service
│   └── pyproject.toml
├── docker/                    # Docker Configuration
│   ├── Dockerfile.frontend   # Node.js 22 Alpine
│   ├── Dockerfile.backend    # Python 3.12 Alpine
│   └── docker-compose.yml    # Full stack orchestration
├── k8s/                      # Kubernetes Manifests
│   ├── frontend/
│   ├── backend/
│   ├── database/
│   └── ingress/
├── scripts/                  # Automation Scripts
│   ├── deploy.sh            # Deployment automation
│   └── setup-dev.sh         # Development setup
├── init-scripts/            # Database initialization
├── Makefile                 # Development commands
└── README.md
```

## 🌐 API Endpoints

### Frontend URLs
- **Homepage**: http://localhost:3000
- **Cart**: http://localhost:3000/cart
- **Deals**: http://localhost:3000/deals
- **Brand Ticker Demo**: http://localhost:3000/brand-ticker-demo

### Backend APIs
- **Main API**: http://localhost:8000
- **Health Check**: http://localhost:8000/health
- **API Docs**: http://localhost:8000/docs
- **OpenAPI**: http://localhost:8000/openapi.json

### Analytics & AI
- **Analytics Dashboard**: http://localhost:8501
- **RAG System**: http://localhost:8001
- **RAG Health**: http://localhost:8001/health
- **RAG Search**: http://localhost:8001/search

## 🔧 Environment Configuration

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NODE_ENV=development
```

### Backend (.env)
```env
DATABASE_URL=postgresql://entropic_user:entropic_password@localhost:5432/entropic_db
REDIS_URL=redis://localhost:6379/0
SECRET_KEY=your-secret-key-change-in-production
ENVIRONMENT=development
```

### RAG System (.env)
```env
OPENAI_API_KEY=your-openai-api-key
CHROMA_HOST=localhost
CHROMA_PORT=8001
ENVIRONMENT=development
```

## 🐳 Docker Deployment

### Frontend + Backend Only
```bash
# Build and start core services
docker-compose -f docker/docker-compose.yml up -d frontend backend --no-deps

# Check status
docker-compose -f docker/docker-compose.yml ps
```

### Full Stack with Analytics
```bash
# Start all services including PostgreSQL, Redis, Analytics
docker-compose -f docker/docker-compose.yml up -d

# View logs
docker-compose -f docker/docker-compose.yml logs -f
```


## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with [Next.js](https://nextjs.org/) and [FastAPI](https://fastapi.tiangolo.com/)
- UI components from [Radix UI](https://www.radix-ui.com/) and [shadcn/ui](https://ui.shadcn.com/)
- Icons from [Lucide](https://lucide.dev/)
- Containerization with [Docker](https://www.docker.com/) and [Alpine Linux](https://alpinelinux.org/)

---

**Created by [Infinity Dev](https://www.theinfinitydev.com/en)** ❤️
