# 🚀 Entropic E-commerce

**A developing e-commerce platform exploring modern web technologies and AI integration**

[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-336791?style=for-the-badge&logo=postgresql&logoColor=white)](https://postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://docker.com/)
[![Kubernetes](https://img.shields.io/badge/Kubernetes-326CE5?style=for-the-badge&logo=kubernetes&logoColor=white)](https://kubernetes.io/)

## 📋 **Complete Documentation**


This file contains the complete architecture overview, implementation status, and improvement roadmap.

## 🎯 **Current Implementation Status**

🚧 **AI/ML Features (In Progress)**
- Basic RAG system exploration with pgvector
- Simple semantic search using SentenceTransformers
- Basic query processing experiments
- Initial recommendation system concepts

🔧 **Backend Development**
- FastAPI foundation with basic API endpoints
- PostgreSQL setup with some schemas
- Redis integration for caching
- Basic authentication system

🎨 **Frontend Progress**
- Next.js 14 setup with TypeScript and Tailwind CSS
- Basic responsive design components
- Shopping cart and product display functionality
- Simple admin dashboard

🐳 **Development Environment**
- Docker containerization for local development
- Basic docker-compose setup
- Local development workflow

## 🏗️ **Architecture Overview**

```
┌─────────────────────────────────────────────────────────────────┐
│                    DEVELOPMENT ARCHITECTURE                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Frontend (Next.js) → FastAPI → PostgreSQL + pgvector          │
│                         ↓                                       │
│                     Redis Cache                                 │
│                                                                 │
│  Note: This is a learning/development setup, not production     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 🚀 **Quick Start & Local Demo**

### **🎬 Local Development Setup**
```bash
# Clone and start the development environment
git clone https://github.com/user/entropic-ecommerce.git
cd entropic-ecommerce

# Start development services with Docker Compose
cd docker && docker-compose up -d

# Wait for services to initialize
sleep 30

# Create sample data (if implemented)
docker exec entropic-backend python -m app.create_sample_data

# 🌐 Frontend: http://localhost:3000
# 🔧 API Docs: http://localhost:8000/docs  
```

### **🔍 Basic Search Demo**
```bash
# Test basic product search (if working)
curl "http://localhost:8000/products/search/laptop" | jq

# Note: AI features are still in development
```

## 📊 **Learning Objectives & Experiments**

### **🧠 AI/ML Exploration**
- Experimenting with natural language product queries
- Learning vector similarity search with pgvector
- Exploring intent analysis and basic recommendations
- Understanding RAG concepts in e-commerce context

### **⚡ Development Goals**
- Building responsive web applications
- Learning FastAPI and async Python patterns
- Understanding database design and optimization
- Practicing modern React/Next.js development

### **🏗️ Software Engineering Practice**
- Exploring microservices architecture concepts
- Learning Docker containerization
- Understanding API design principles
- Practicing clean code and documentation

## 🎯 **Learning Journey & Skills Developed**

### **For Backend Development**
- FastAPI framework exploration and API design
- PostgreSQL database modeling and basic optimization
- Redis caching implementation
- Basic authentication patterns

### **For AI/ML Learning**
- Vector embeddings and similarity search concepts
- Introduction to RAG (Retrieval-Augmented Generation)
- Natural language processing basics
- Machine learning model integration

### **For Frontend Development**
- Modern React/Next.js patterns and hooks
- TypeScript for type-safe development
- Responsive design with Tailwind CSS
- Component architecture and state management

### **For DevOps Learning**
- Docker containerization fundamentals
- Development environment setup
- Basic CI/CD concepts
- Infrastructure as code exploration

## 🔧 **Development Setup**

### Prerequisites
- Docker & Docker Compose
- Node.js 18+ (for local frontend development)  
- Python 3.11+ (for local backend development)
- Basic understanding of web development concepts

### 🐳 Docker Development Setup

```bash
# Start development environment
make dev

# Or use Docker Compose directly
cd docker && docker-compose up -d

# For individual services during development
make dev-backend    # Backend only
make dev-frontend   # Frontend only
```

#### Service URLs (Development)
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Database**: localhost:5432 (PostgreSQL)
- **Redis**: localhost:6379

## � Available Commands

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

---


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
- **Containerization**: Docker & Docker Compose for development
- **Database**: PostgreSQL with basic schemas
- **Caching**: Redis for session storage
- **Development Tools**: Hot reload and debugging setup

## ✨ Features & Functionality

### E-commerce Basics
- **Product Management**: Basic CRUD operations with image uploads
- **Shopping Cart**: Simple cart functionality 
- **User Authentication**: Basic JWT-based authentication
- **Order Management**: Simple order tracking
- **Admin Interface**: Basic admin dashboard

### Technical Features
- **Responsive Design**: Mobile-friendly interface
- **API Documentation**: Automatic OpenAPI/Swagger docs
- **Error Handling**: Basic error boundaries and fallbacks
- **Development Environment**: Hot reload and debugging tools

### Learning Experiments
- **Vector Search**: Exploring pgvector for product similarity
- **AI Integration**: Basic LLM integration experiments
- **Modern Stack**: Learning Next.js, FastAPI, and PostgreSQL together

## 🔧 Development Progress & Learning

### Recent Implementations
- **Database Setup**: PostgreSQL with pgvector extension for vector search
- **API Foundation**: FastAPI with basic endpoints and documentation
- **Frontend Structure**: Next.js with TypeScript and component library
- **Authentication**: Basic JWT implementation for user sessions

### Current Learning Areas
- **Vector Embeddings**: Exploring SentenceTransformers for product similarity
- **LLM Integration**: Experimenting with local Ollama for AI responses
- **Database Optimization**: Learning about indexes and query performance
- **Modern React Patterns**: Hooks, context, and component composition

### Development Practices
- **Code Organization**: Modular structure with clean separation of concerns
- **Error Handling**: Learning defensive programming patterns
- **Documentation**: API docs and inline code documentation
- **Version Control**: Git workflow and commit best practices

---



