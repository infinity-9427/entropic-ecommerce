# 🏗️ Entropic E-Commerce: Current Application Flow & Architecture

## 📋 Table of Contents
1. [Overview](#overview)
2. [Current Architecture](#current-architecture)
3. [Docker Setup](#docker-setup)
4. [Development Flow](#development-flow)
5. [API Flow](#api-flow)
6. [Frontend Flow](#frontend-flow)
7. [Database Schema](#database-schema)
8. [Completed Features](#completed-features)
9. [Pending Implementation](#pending-implementation)
10. [Development Commands](#development-commands)

---

## 🎯 Overview

**Entropic E-Commerce** is a full-stack e-commerce platform built with modern technologies:

- **Backend**: FastAPI with PostgreSQL database
- **Frontend**: Next.js 15.4.1 with React 19.1.0 and Tailwind CSS
- **Database**: PostgreSQL with Redis caching
- **Containerization**: Docker Compose for development and production
- **Image Management**: Cloudinary integration for product images
- **Analytics**: ClickHouse for advanced analytics
- **Authentication**: JWT-based authentication (currently bypassed for development)

---

## 🏛️ Current Architecture

### System Architecture
```
┌─────────────────────────────────────────────────────────────────┐
│                    Docker Compose Setup                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐         │
│  │   Frontend  │    │   Backend   │    │  PostgreSQL │         │
│  │   Next.js   │◄───┤   FastAPI   │◄───┤   Database  │         │
│  │   Port 3000 │    │   Port 8000 │    │   Port 5432 │         │
│  └─────────────┘    └─────────────┘    └─────────────┘         │
│         │                   │                   │              │
│         │                   │                   │              │
│         │                   ▼                   │              │
│         │          ┌─────────────┐              │              │
│         │          │    Redis    │              │              │
│         │          │    Cache    │              │              │
│         │          │  Port 6379  │              │              │
│         │          └─────────────┘              │              │
│         │                   │                   │              │
│         │                   │                   │              │
│         ▼                   ▼                   ▼              │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐         │
│  │    Nginx    │    │ ClickHouse  │    │   Kafka     │         │
│  │   Reverse   │    │ Analytics   │    │ Event Bus   │         │
│  │   Proxy     │    │ Port 8123   │    │ Port 9092   │         │
│  └─────────────┘    └─────────────┘    └─────────────┘         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

External Services:
├── Cloudinary (Image Storage & Processing)
├── Stripe (Payment Processing - Test Mode)
└── ChromaDB (Vector Database - Port 8001)
```

### Service Dependencies
```
Frontend (Next.js) → Backend (FastAPI) → PostgreSQL
                            ↓
                        Redis Cache
                            ↓
                    ClickHouse Analytics
                            ↓
                        Kafka Events
```

---

## 🐳 Docker Setup

### Current Docker Compose Configuration

**Location**: `/docker/docker-compose.yml`

#### Services Overview:

1. **PostgreSQL Database** (Port 5432)
   - Image: `postgres:15-alpine`
   - Database: `entropic_db`
   - User: `entropic_user`
   - Health checks enabled

2. **Redis Cache** (Port 6379)
   - Image: `redis:7-alpine`
   - Data persistence enabled

3. **Backend API** (Port 8000)
   - FastAPI application
   - Built from `docker/Dockerfile.backend`
   - Environment: Production mode
   - Health checks on `/health` endpoint

4. **Frontend** (Port 3000)
   - Next.js application
   - Built from `docker/Dockerfile.frontend`
   - Environment: Production mode

5. **Nginx Reverse Proxy** (Port 80/443)
   - Alpine-based nginx
   - SSL ready configuration
   - Routes traffic to frontend/backend

6. **ClickHouse Analytics** (Port 8123/9000)
   - Analytics database
   - User behavior tracking
   - Sales metrics storage

7. **Kafka & Zookeeper** (Port 9092/2181)
   - Event streaming
   - Async processing
   - Analytics event pipeline

8. **ChromaDB** (Port 8001)
   - Vector database
   - AI/ML features (future)

### Docker Network
- **Network**: `entropic-network`
- **Type**: Bridge network
- **Internal communication**: Service-to-service via container names

---

## 🔄 Development Flow

### 1. Local Development Setup

#### Prerequisites:
- Docker & Docker Compose
- Node.js (for local frontend development)
- Python 3.11+ (for local backend development)

#### Quick Start:
```bash
# Option 1: Full Docker setup (recommended)
make dev
# or
cd docker && docker-compose up -d

# Option 2: Mixed development (local code, Docker services)
make dev-db        # Start only databases
make dev-backend   # Start backend locally
make dev-frontend  # Start frontend locally
```

#### Development Scripts:
```bash
# Setup development environment
./scripts/setup-dev.sh

# Start development servers
./scripts/dev-start.sh

# Production deployment
./scripts/deploy-prod.sh
```

### 2. Environment Configuration

#### Backend Environment (`.env`):
```bash
# Database
DATABASE_URL=postgresql://entropic_user:entropic_password@localhost:5432/entropic_db
REDIS_URL=redis://localhost:6379

# Security
JWT_SECRET_KEY=your-secret-key-here
JWT_ALGORITHM=HS256

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Development
DEBUG=true
CORS_ORIGINS=http://localhost:3000
```

#### Frontend Environment (`.env.local`):
```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Development
NODE_ENV=development
NEXT_PUBLIC_DEBUG=true
```

---

## 🔌 API Flow

### Backend API Structure

#### Core Endpoints:

**Authentication** (Development bypass active):
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/refresh` - Token refresh

**Products**:
- `GET /products` - List all products
- `GET /products/{id}` - Get product details
- `POST /products` - Create product (admin)
- `PUT /products/{id}` - Update product (admin)
- `DELETE /products/{id}` - Delete product (admin)

**Cart**:
- `GET /cart` - Get user's cart
- `POST /cart/items` - Add item to cart
- `PUT /cart/items/{id}` - Update cart item
- `DELETE /cart/items/{id}` - Remove cart item

**Orders**:
- `POST /orders` - Create order
- `GET /orders` - List user orders
- `GET /orders/{id}` - Get order details

**Analytics**:
- `GET /analytics/dashboard` - Dashboard metrics
- `POST /analytics/track` - Track user events

**File Upload**:
- `POST /upload/image` - Upload product images to Cloudinary

### API Response Format:
```json
{
  "success": true,
  "data": { /* response data */ },
  "message": "Success message",
  "timestamp": "2025-01-18T10:30:00Z"
}
```

### Error Handling:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": { /* error details */ }
  },
  "timestamp": "2025-01-18T10:30:00Z"
}
```

---

## 🎨 Frontend Flow

### Next.js Application Structure

#### App Router Structure:
```
src/app/
├── (App)/                 # Public routes
│   ├── page.tsx          # Homepage
│   ├── cart/             # Shopping cart
│   ├── contact/          # Contact page
│   ├── deals/            # Deals page
│   └── new-arrivals/     # New arrivals
├── (Dashboard)/          # Admin routes
│   └── dashboard/
│       ├── products/     # Product management
│       ├── orders/       # Order management
│       └── analytics/    # Analytics dashboard
└── (Login)/              # Auth routes
    ├── login/            # Login page
    └── register/         # Registration page
```

#### Key Components:

**Product Management**:
- `ProductCard` - Product display with image error handling
- `ProductFilters` - Product filtering UI
- `ProductForm` - Admin product creation/editing

**Cart & Checkout**:
- `CartProvider` - Cart state management
- `CartItem` - Individual cart item
- `CheckoutForm` - Order placement

**UI Components**:
- `Header` - Navigation with cart indicator
- `Footer` - Site footer
- `BrandTicker` - Animated brand showcase

#### State Management:
- **Zustand**: Global state management
- **React Context**: Authentication state
- **Local State**: Component-specific state

#### Image Handling:
- **Cloudinary Integration**: Optimized image delivery
- **Error Handling**: Fallback to package icons
- **Format Support**: WebP with automatic optimization

---

## 🗄️ Database Schema

### PostgreSQL Tables:

#### Users Table:
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    is_admin BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Products Table:
```sql
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    sku VARCHAR(100) UNIQUE NOT NULL,
    stock_quantity INTEGER DEFAULT 0,
    category VARCHAR(100),
    brand VARCHAR(100),
    image_url TEXT,
    images JSONB,
    metadata JSONB,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Orders Table:
```sql
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    status VARCHAR(50) DEFAULT 'pending',
    total_amount DECIMAL(10,2) NOT NULL,
    shipping_address JSONB,
    payment_info JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Cart Items Table:
```sql
CREATE TABLE cart_items (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    product_id INTEGER REFERENCES products(id),
    quantity INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Analytics Events Table:
```sql
CREATE TABLE analytics_events (
    id SERIAL PRIMARY KEY,
    event_type VARCHAR(50) NOT NULL,
    user_id INTEGER REFERENCES users(id),
    product_id INTEGER REFERENCES products(id),
    properties JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);
```

---

## ✅ Completed Features

### Backend Features:
- ✅ **FastAPI Application**: RESTful API with automatic documentation
- ✅ **PostgreSQL Database**: Fully configured with SQLAlchemy ORM
- ✅ **User Authentication**: JWT-based authentication system
- ✅ **Product Management**: Full CRUD operations for products
- ✅ **Shopping Cart**: Add/remove/update cart items
- ✅ **Order Management**: Order creation and tracking
- ✅ **Image Upload**: Cloudinary integration for product images
- ✅ **Analytics Tracking**: User behavior and sales metrics
- ✅ **Error Handling**: Comprehensive error handling and logging
- ✅ **Health Checks**: API health monitoring endpoints
- ✅ **CORS Configuration**: Cross-origin request handling

### Frontend Features:
- ✅ **Next.js 15.4.1**: Modern React framework with App Router
- ✅ **Responsive Design**: Mobile-first responsive UI
- ✅ **Product Catalog**: Browse and filter products
- ✅ **Shopping Cart**: Add to cart and checkout flow
- ✅ **Admin Dashboard**: Product management interface
- ✅ **Image Optimization**: Next.js image optimization with fallbacks
- ✅ **Form Handling**: React Hook Form with validation
- ✅ **State Management**: Zustand for global state
- ✅ **Drag & Drop**: FormKit drag-and-drop for product management
- ✅ **Error Boundaries**: React error boundary implementation
- ✅ **Loading States**: Skeleton loaders and loading indicators

### DevOps Features:
- ✅ **Docker Containerization**: Multi-service Docker setup
- ✅ **Development Scripts**: Automated setup and deployment
- ✅ **Database Migrations**: Automated schema management
- ✅ **Health Monitoring**: Container health checks
- ✅ **Environment Configuration**: Flexible environment setup
- ✅ **Nginx Reverse Proxy**: Production-ready load balancing
- ✅ **Redis Caching**: Session and data caching

---

## 🔄 Pending Implementation

### Phase 1: Core Functionality (High Priority)
- [ ] **Payment Integration**: Complete Stripe payment processing
- [ ] **User Registration**: Enable user registration form
- [ ] **Authentication Flow**: Remove development bypass
- [ ] **Order Completion**: Complete checkout process
- [ ] **Email Notifications**: Order confirmation emails
- [ ] **Password Reset**: Forgot password functionality
- [ ] **User Profile**: User account management

### Phase 2: Enhanced Features (Medium Priority)
- [ ] **Product Search**: Advanced search functionality
- [ ] **Product Reviews**: User reviews and ratings
- [ ] **Wishlist**: Save products for later
- [ ] **Inventory Management**: Stock level tracking
- [ ] **Discount Codes**: Coupon and promotion system
- [ ] **Multi-image Support**: Multiple product images
- [ ] **Product Variants**: Size, color, etc. variations

### Phase 3: Analytics & Monitoring (Medium Priority)
- [ ] **ClickHouse Integration**: Complete analytics setup
- [ ] **User Behavior Tracking**: Enhanced analytics
- [ ] **Sales Reporting**: Detailed sales reports
- [ ] **Performance Monitoring**: Application performance metrics
- [ ] **Error Tracking**: Sentry integration
- [ ] **A/B Testing**: Feature testing framework

### Phase 4: Production Deployment (Low Priority)
- [ ] **AWS EC2 Deployment**: Cloud infrastructure setup
- [ ] **CI/CD Pipeline**: GitHub Actions deployment
- [ ] **SSL Certificates**: Let's Encrypt integration
- [ ] **Database Backup**: Automated backup strategy
- [ ] **Load Balancing**: Multi-instance scaling
- [ ] **CDN Integration**: CloudFront for static assets
- [ ] **Monitoring & Alerting**: CloudWatch integration

### Phase 5: Advanced Features (Future)
- [ ] **AI Recommendations**: Product recommendation engine
- [ ] **Chat Support**: Customer support integration
- [ ] **Multi-language**: Internationalization
- [ ] **Mobile App**: React Native mobile application
- [ ] **Social Login**: OAuth integration
- [ ] **Advanced Analytics**: Machine learning insights

---

## 🛠️ Development Commands

### Docker Commands:
```bash
# Start all services
make dev
cd docker && docker-compose up -d

# View logs
make logs              # All services
make logs-backend      # Backend only
make logs-frontend     # Frontend only
make logs-db           # Database only

# Service management
make status            # Check service status
make restart           # Restart all services
make down              # Stop all services
make clean-docker      # Clean Docker resources
```

### Development Commands:
```bash
# Setup development environment
./scripts/setup-dev.sh

# Start development servers
make dev-backend       # Backend only
make dev-frontend      # Frontend only
make dev-db           # Database only

# Testing
make test             # Run all tests
make test-backend     # Backend tests
make test-frontend    # Frontend tests
```

### Database Commands:
```bash
# Database operations
make db-migrate       # Run migrations
make db-reset         # Reset database
make db-backup        # Create backup
make shell-db         # Open database shell
```

### Utility Commands:
```bash
# Health checks
make health           # Check service health
make shell-backend    # Open backend shell

# Security
make security-check   # Run security scans

# Performance
make performance-test # Run performance tests
```

---

## 🚀 Quick Start Guide

### 1. Clone and Setup:
```bash
git clone https://github.com/infinity-9427/entropic-ecommerce.git
cd entropic-ecommerce

# Setup development environment
./scripts/setup-dev.sh
```

### 2. Start Development:
```bash
# Start all services with Docker
make dev

# Or start individually
make dev-db        # Start databases
make dev-backend   # Start backend (local)
make dev-frontend  # Start frontend (local)
```

### 3. Access Services:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Admin Dashboard**: http://localhost:3000/dashboard

### 4. Test Features:
- Browse products at homepage
- Add products to cart
- Access admin dashboard for product management
- Test drag-and-drop product creation
- Monitor logs for debugging

---

## 📝 Notes

### Development Status:
- **Backend**: Fully functional API with all core features
- **Frontend**: Complete UI with admin dashboard
- **Database**: PostgreSQL with all required tables
- **Authentication**: Currently bypassed for development
- **Docker**: Full containerization with all services

### Known Issues:
- Authentication bypass active (development mode)
- Payment integration incomplete
- Some analytics features pending
- Production deployment not configured

### Next Steps:
1. Complete payment integration
2. Remove authentication bypass
3. Implement remaining analytics features
4. Set up production deployment
5. Add monitoring and alerting

This documentation provides a comprehensive overview of the current application state and serves as a guide for continued development.
