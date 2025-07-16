# Entropic E-Commerce Platform

A full-stack e-commerce platform built with Next.js frontend and FastAPI/Django backend, featuring data analytics, RAG system, and cloud-native deployment.

## Architecture

```
├── frontend/          # Next.js 15 application with React 19
├── backend/           # FastAPI/Django REST API
├── analytics/         # Data analytics and insights
├── rag-system/        # RAG system for intelligent search
├── docker/            # Docker configurations
├── k8s/               # Kubernetes manifests
└── scripts/           # Development and deployment scripts
```

## Features

- 🛒 **E-Commerce Frontend**: Modern Next.js app with TypeScript, Tailwind CSS, and Zustand state management
- 🚀 **REST API Backend**: FastAPI/Django backend with authentication, product management, and order processing
- 📊 **Analytics Dashboard**: Real-time insights and metrics for business intelligence
- 🤖 **RAG System**: Intelligent product search and recommendations using vector databases
- 🐳 **Containerized**: Full Docker support with multi-stage builds
- ☸️ **Kubernetes Ready**: Production-ready Kubernetes manifests
- 📈 **Monitoring**: Integrated metrics, logging, and observability

## Quick Start

### Development

```bash
# Start all services
docker-compose up -dev

# Or start individually
cd frontend && pnpm dev
cd backend && python -m uvicorn main:app --reload
```

### Production

```bash
# Build and deploy
kubectl apply -f k8s/
```

## Tech Stack

**Frontend:**
- Next.js 15 with App Router
- React 19
- TypeScript
- Tailwind CSS
- Zustand (State Management)
- Radix UI Components

**Backend:**
- FastAPI (or Django)
- PostgreSQL
- Redis
- Celery (Background Tasks)

**Analytics:**
- Python Data Stack (Pandas, NumPy, Matplotlib)
- Apache Kafka (Event Streaming)
- ClickHouse (Analytics Database)

**RAG System:**
- LangChain
- Vector Database (Pinecone/Chroma)
- OpenAI/Local LLM

**Infrastructure:**
- Docker & Docker Compose
- Kubernetes
- Nginx (Reverse Proxy)
- Prometheus & Grafana (Monitoring)

## Development Setup

1. **Prerequisites**
   ```bash
   # Required tools
   - Node.js 18+
   - Python 3.11+
   - Docker & Docker Compose
   - kubectl (for Kubernetes)
   - pnpm (frontend package manager)
   ```

2. **Clone and Setup**
   ```bash
   git clone <repository-url>
   cd entropic-ecommerce
   
   # Setup frontend
   cd frontend
   pnpm install
   
   # Setup backend
   cd ../backend
   pip install -r requirements.txt
   ```

3. **Environment Variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

## Project Structure

```
entropic-ecommerce/
├── frontend/                 # Next.js Frontend
│   ├── src/
│   │   ├── app/             # App Router pages
│   │   ├── components/      # Reusable components
│   │   └── lib/             # Utilities and data
│   ├── public/              # Static assets
│   └── package.json
├── backend/                  # FastAPI Backend
│   ├── app/
│   │   ├── api/             # API routes
│   │   ├── models/          # Database models
│   │   ├── services/        # Business logic
│   │   └── core/            # Core configuration
│   └── requirements.txt
├── analytics/               # Data Analytics
│   ├── notebooks/           # Jupyter notebooks
│   ├── dashboards/          # Analytics dashboards
│   └── etl/                 # Data pipelines
├── rag-system/              # RAG Implementation
│   ├── embeddings/          # Vector embeddings
│   ├── retrieval/           # Information retrieval
│   └── generation/          # Response generation
├── docker/                  # Docker configurations
│   ├── Dockerfile.frontend
│   ├── Dockerfile.backend
│   └── docker-compose.yml
└── k8s/                     # Kubernetes manifests
    ├── frontend/
    ├── backend/
    └── infrastructure/
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details
