"""
Database configuration and session management for Entropic E-commerce
Hybrid approach: Neon for transactional data, Supabase for embeddings/search
"""

from sqlalchemy import create_engine, MetaData
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from supabase import create_client, Client
from dotenv import load_dotenv
from typing import Optional
import os

# Load environment variables from backend/.env
load_dotenv()  # This will look for .env in the current directory (backend/)

# Primary Database (Neon PostgreSQL) for transactional data
NEON_DATABASE_URL = os.getenv("NEON_PSQL_URL")
DATABASE_URL = NEON_DATABASE_URL or os.getenv(
    "DATABASE_URL", 
    "postgresql://entropic_user:entropic_password@localhost:5432/entropic_db"
)

print(f"Using database URL: {DATABASE_URL[:50]}...")

# Supabase configuration for embeddings and vector search
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_API_KEY")

print(f"Supabase URL: {SUPABASE_URL}")
print(f"Supabase Key: {'Set' if SUPABASE_KEY else 'Not set'}")

# Initialize Supabase client
supabase: Optional[Client] = None
if SUPABASE_URL and SUPABASE_KEY:
    try:
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
        print("✅ Supabase client initialized successfully")
    except Exception as e:
        print(f"❌ Failed to initialize Supabase client: {e}")
        supabase = None

# Create database engine with connection pooling
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    pool_recycle=300,
    echo=False,  # Set to True for SQL query logging
    pool_size=20,
    max_overflow=30,
    pool_timeout=30
)

# Create SessionLocal class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create Base class
Base = declarative_base()

# Database dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Supabase dependency
def get_supabase():
    if supabase is None:
        raise Exception("Supabase client not initialized. Check SUPABASE_URL and SUPABASE_API_KEY")
    return supabase

# Create tables
def create_tables():
    Base.metadata.create_all(bind=engine)

# Initialize database with sample data
def init_database():
    """Initialize database with tables and sample data if needed"""
    create_tables()
    print("✅ Database tables created successfully")
