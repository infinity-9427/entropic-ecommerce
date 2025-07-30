"""
Database models for Entropic E-commerce platform
"""

from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, ForeignKey, Text, JSON, Index
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime
import uuid

try:
    from ..core.database import Base
except ImportError:
    from app.core.database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    
    # Personal information
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    phone = Column(String)
    date_of_birth = Column(DateTime)
    
    # Address information
    shipping_address = Column(JSON)  # Default shipping address
    billing_address = Column(JSON)   # Default billing address
    
    # User preferences and settings
    preferred_currency = Column(String, default="USD")
    preferred_language = Column(String, default="en")
    newsletter_subscribed = Column(Boolean, default=True)
    marketing_emails = Column(Boolean, default=True)
    
    # Account status and permissions
    is_active = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)
    is_verified = Column(Boolean, default=False)
    verification_token = Column(String)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login = Column(DateTime)
    
    # Relationships
    orders = relationship("Order", back_populates="user")
    cart_items = relationship("CartItem", back_populates="user")
    analytics_events = relationship("AnalyticsEvent", back_populates="user")
    addresses = relationship("UserAddress", back_populates="user")
    
    def __repr__(self):
        return f"<User(id={self.id}, email='{self.email}')>"

class UserAddress(Base):
    __tablename__ = "user_addresses"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    address_type = Column(String, nullable=False)  # 'shipping' or 'billing'
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    company = Column(String)
    address_line_1 = Column(String, nullable=False)
    address_line_2 = Column(String)
    city = Column(String, nullable=False)
    state = Column(String, nullable=False)
    postal_code = Column(String, nullable=False)
    country = Column(String, nullable=False)
    phone = Column(String)
    is_default = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="addresses")
    
    def __repr__(self):
        return f"<UserAddress(id={self.id}, user_id={self.user_id}, type='{self.address_type}')>"

class Product(Base):
    __tablename__ = "products"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    description = Column(Text)
    price = Column(Float, nullable=False)
    category = Column(String, nullable=False, index=True)
    brand = Column(String, index=True)  # Added brand field
    sku = Column(String, unique=True, index=True)  # Added SKU for inventory management
    
    # Enhanced image handling - now supports multiple images and optional
    images = Column(JSON, nullable=True)  # Array of image objects with url, public_id, alt_text
    primary_image_url = Column(String, nullable=True)  # Main product image (optional)
    
    # Inventory and pricing
    stock_quantity = Column(Integer, default=0)
    cost_price = Column(Float)  # Wholesale/cost price
    compare_at_price = Column(Float)  # Original price for discounts
    
    # Product attributes
    weight = Column(Float)  # In grams
    dimensions = Column(JSON)  # {length, width, height} in cm
    tags = Column(JSON)  # Array of tags for better categorization
    
    # SEO and metadata
    meta_title = Column(String)
    meta_description = Column(Text)
    slug = Column(String, unique=True, index=True)  # URL-friendly identifier
    
    # Product status and visibility
    is_active = Column(Boolean, default=True)
    is_featured = Column(Boolean, default=False)
    is_digital = Column(Boolean, default=False)  # For digital products
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    cart_items = relationship("CartItem", back_populates="product")
    order_items = relationship("OrderItem", back_populates="product")
    analytics_events = relationship("AnalyticsEvent", back_populates="product")
    product_variants = relationship("ProductVariant", back_populates="product")
    
    def __repr__(self):
        return f"<Product(id={self.id}, name='{self.name}', sku='{self.sku}')>"

class ProductVariant(Base):
    __tablename__ = "product_variants"
    
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    name = Column(String, nullable=False)  # e.g., "Size", "Color"
    value = Column(String, nullable=False)  # e.g., "Large", "Red"
    sku = Column(String, unique=True, index=True)
    price_adjustment = Column(Float, default=0.0)  # Price difference from base product
    stock_quantity = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    product = relationship("Product", back_populates="product_variants")
    
    def __repr__(self):
        return f"<ProductVariant(id={self.id}, name='{self.name}', value='{self.value}')>"

class Category(Base):
    __tablename__ = "categories"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, unique=True, index=True)
    description = Column(Text)
    slug = Column(String, unique=True, index=True)
    parent_id = Column(Integer, ForeignKey("categories.id"), nullable=True)
    image_url = Column(String)
    is_active = Column(Boolean, default=True)
    sort_order = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Self-referential relationship for subcategories
    parent = relationship("Category", remote_side=[id])
    
    def __repr__(self):
        return f"<Category(id={self.id}, name='{self.name}')>"

class CartItem(Base):
    __tablename__ = "cart_items"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    quantity = Column(Integer, nullable=False, default=1)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="cart_items")
    product = relationship("Product", back_populates="cart_items")
    
    # Indexes
    __table_args__ = (
        Index('idx_user_product', 'user_id', 'product_id'),
    )
    
    def __repr__(self):
        return f"<CartItem(id={self.id}, user_id={self.user_id}, product_id={self.product_id})>"

class Order(Base):
    __tablename__ = "orders"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    order_number = Column(String, unique=True, nullable=False, default=lambda: str(uuid.uuid4())[:8].upper())
    
    # Order totals
    subtotal = Column(Float, nullable=False)
    tax_amount = Column(Float, default=0.0)
    shipping_amount = Column(Float, default=0.0)
    discount_amount = Column(Float, default=0.0)
    total_amount = Column(Float, nullable=False)
    
    # Order status and fulfillment
    status = Column(String, default="pending")  # pending, confirmed, processing, shipped, delivered, cancelled, refunded
    fulfillment_status = Column(String, default="unfulfilled")  # unfulfilled, partial, fulfilled
    
    # Addresses
    shipping_address = Column(JSON, nullable=False)
    billing_address = Column(JSON, nullable=False)
    
    # Payment information
    payment_method = Column(String)  # credit_card, debit_card, paypal, stripe, etc.
    payment_status = Column(String, default="pending")  # pending, paid, failed, refunded, partially_refunded
    payment_id = Column(String)  # External payment provider ID
    
    # Shipping information
    shipping_method = Column(String)
    tracking_number = Column(String)
    carrier = Column(String)  # UPS, FedEx, DHL, etc.
    estimated_delivery = Column(DateTime)
    actual_delivery = Column(DateTime)
    
    # Additional metadata
    notes = Column(Text)  # Internal notes
    customer_notes = Column(Text)  # Customer notes/instructions
    currency = Column(String, default="USD")
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    confirmed_at = Column(DateTime)
    shipped_at = Column(DateTime)
    delivered_at = Column(DateTime)
    
    # Relationships
    user = relationship("User", back_populates="orders")
    order_items = relationship("OrderItem", back_populates="order")
    
    def __repr__(self):
        return f"<Order(id={self.id}, order_number='{self.order_number}', status='{self.status}')>"

class OrderItem(Base):
    __tablename__ = "order_items"
    
    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    product_variant_id = Column(Integer, ForeignKey("product_variants.id"), nullable=True)
    
    # Product details at time of purchase (for historical accuracy)
    product_name = Column(String, nullable=False)
    product_sku = Column(String)
    variant_name = Column(String)
    
    # Pricing
    quantity = Column(Integer, nullable=False)
    unit_price = Column(Float, nullable=False)  # Price per unit at time of purchase
    total_price = Column(Float, nullable=False)  # unit_price * quantity
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    order = relationship("Order", back_populates="order_items")
    product = relationship("Product", back_populates="order_items")
    
    def __repr__(self):
        return f"<OrderItem(id={self.id}, order_id={self.order_id}, product='{self.product_name}')>"

class AnalyticsEvent(Base):
    __tablename__ = "analytics_events"
    
    id = Column(Integer, primary_key=True, index=True)
    event_type = Column(String, nullable=False, index=True)  # page_view, product_view, add_to_cart, purchase, etc.
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=True)
    session_id = Column(String, index=True)
    properties = Column(JSON)  # Additional event properties
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    
    # Relationships
    user = relationship("User", back_populates="analytics_events")
    product = relationship("Product", back_populates="analytics_events")
    
    # Indexes
    __table_args__ = (
        Index('idx_event_type_created', 'event_type', 'created_at'),
        Index('idx_user_created', 'user_id', 'created_at'),
        Index('idx_product_created', 'product_id', 'created_at'),
    )
    
    def __repr__(self):
        return f"<AnalyticsEvent(id={self.id}, event_type='{self.event_type}')>"

class DashboardMetrics(Base):
    __tablename__ = "dashboard_metrics"
    
    id = Column(Integer, primary_key=True, index=True)
    metric_name = Column(String, nullable=False, index=True)
    metric_value = Column(Float, nullable=False)
    metric_date = Column(DateTime, default=datetime.utcnow, index=True)
    properties = Column(JSON)  # Additional metric properties
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Indexes
    __table_args__ = (
        Index('idx_metric_name_date', 'metric_name', 'metric_date'),
    )
    
    def __repr__(self):
        return f"<DashboardMetrics(id={self.id}, metric_name='{self.metric_name}')>"

# Product Search and Embeddings (stored in Supabase)
class ProductSearch(Base):
    __tablename__ = "product_search"
    
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    search_text = Column(Text, nullable=False)  # Combined searchable text
    embedding_id = Column(String)  # Reference to Supabase embedding
    last_updated = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    product = relationship("Product")
    
    def __repr__(self):
        return f"<ProductSearch(id={self.id}, product_id={self.product_id})>"

# Inventory tracking
class InventoryTransaction(Base):
    __tablename__ = "inventory_transactions"
    
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    product_variant_id = Column(Integer, ForeignKey("product_variants.id"), nullable=True)
    transaction_type = Column(String, nullable=False)  # 'in', 'out', 'adjustment'
    quantity_change = Column(Integer, nullable=False)  # Positive or negative
    reason = Column(String, nullable=False)  # 'sale', 'restock', 'damage', 'adjustment'
    reference_id = Column(String)  # Order ID, PO number, etc.
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    created_by = Column(Integer, ForeignKey("users.id"))
    
    # Relationships
    product = relationship("Product")
    
    def __repr__(self):
        return f"<InventoryTransaction(id={self.id}, product_id={self.product_id}, type='{self.transaction_type}')>"
