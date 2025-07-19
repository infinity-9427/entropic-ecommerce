"""
Pydantic schemas for API request/response models
"""

from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum

class UserRole(str, Enum):
    USER = "user"
    ADMIN = "admin"

class OrderStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"

class PaymentStatus(str, Enum):
    PENDING = "pending"
    PAID = "paid"
    FAILED = "failed"
    REFUNDED = "refunded"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

# Image schema for product images
class ProductImage(BaseModel):
    url: str
    public_id: str
    alt_text: Optional[str] = None
    width: Optional[int] = None
    height: Optional[int] = None
    is_primary: bool = False

# Product schemas
class ProductBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: float = Field(..., gt=0)
    category: str
    brand: Optional[str] = None
    sku: Optional[str] = None
    
    # Enhanced image handling - now required
    images: List[ProductImage] = Field(..., min_length=1)  # At least one image required
    primary_image_url: str  # Required main product image
    
    # Inventory and pricing
    stock_quantity: int = Field(..., ge=0)
    cost_price: Optional[float] = Field(None, gt=0)
    compare_at_price: Optional[float] = Field(None, gt=0)
    
    # Product attributes
    weight: Optional[float] = Field(None, gt=0)
    dimensions: Optional[Dict[str, float]] = None  # {length, width, height}
    tags: Optional[List[str]] = None
    
    # SEO and metadata
    meta_title: Optional[str] = None
    meta_description: Optional[str] = None
    slug: Optional[str] = None
    
    # Product status
    is_featured: bool = False
    is_digital: bool = False

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = Field(None, gt=0)
    category: Optional[str] = None
    brand: Optional[str] = None
    sku: Optional[str] = None
    images: Optional[List[ProductImage]] = None
    primary_image_url: Optional[str] = None
    stock_quantity: Optional[int] = Field(None, ge=0)
    cost_price: Optional[float] = Field(None, gt=0)
    compare_at_price: Optional[float] = Field(None, gt=0)
    weight: Optional[float] = Field(None, gt=0)
    dimensions: Optional[Dict[str, float]] = None
    tags: Optional[List[str]] = None
    meta_title: Optional[str] = None
    meta_description: Optional[str] = None
    slug: Optional[str] = None
    is_active: Optional[bool] = None
    is_featured: Optional[bool] = None
    is_digital: Optional[bool] = None

class ProductResponse(ProductBase):
    id: int
    is_active: bool
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

# Product Variant schemas
class ProductVariantBase(BaseModel):
    name: str
    value: str
    sku: Optional[str] = None
    price_adjustment: float = 0.0
    stock_quantity: int = Field(..., ge=0)

class ProductVariantCreate(ProductVariantBase):
    product_id: int

class ProductVariantResponse(ProductVariantBase):
    id: int
    product_id: int
    is_active: bool
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

# Category schemas
class CategoryBase(BaseModel):
    name: str
    description: Optional[str] = None
    slug: Optional[str] = None
    parent_id: Optional[int] = None
    image_url: Optional[str] = None
    sort_order: int = 0

class CategoryCreate(CategoryBase):
    pass

class CategoryResponse(CategoryBase):
    id: int
    is_active: bool
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

# Enhanced User schemas
class UserBase(BaseModel):
    email: EmailStr
    username: str
    first_name: str
    last_name: str
    phone: Optional[str] = None
    preferred_currency: str = "USD"
    preferred_language: str = "en"
    newsletter_subscribed: bool = True
    marketing_emails: bool = True

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    preferred_currency: Optional[str] = None
    preferred_language: Optional[str] = None
    newsletter_subscribed: Optional[bool] = None
    marketing_emails: Optional[bool] = None
    shipping_address: Optional[Dict[str, Any]] = None
    billing_address: Optional[Dict[str, Any]] = None

class UserResponse(UserBase):
    id: int
    is_active: bool
    is_admin: bool
    is_verified: bool
    created_at: datetime
    last_login: Optional[datetime] = None
    
    model_config = ConfigDict(from_attributes=True)

# Address schemas
class AddressBase(BaseModel):
    address_type: str  # 'shipping' or 'billing'
    first_name: str
    last_name: str
    company: Optional[str] = None
    address_line_1: str
    address_line_2: Optional[str] = None
    city: str
    state: str
    postal_code: str
    country: str
    phone: Optional[str] = None
    is_default: bool = False

class AddressCreate(AddressBase):
    pass

class AddressResponse(AddressBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

# Image upload schemas
class ImageUploadResponse(BaseModel):
    public_id: str
    original_url: str
    thumbnail_url: str
    medium_url: str
    large_url: str
    format: str
    width: int
    height: int
    bytes: int
    created_at: str

# Cart schemas
class CartItemBase(BaseModel):
    product_id: int
    quantity: int = Field(..., gt=0)

class CartItemCreate(CartItemBase):
    pass

class CartItemUpdate(BaseModel):
    quantity: int = Field(..., gt=0)

class CartItemResponse(CartItemBase):
    id: int
    product: ProductResponse
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

class CartResponse(BaseModel):
    items: List[CartItemResponse]
    total_items: int
    total_amount: float

# Enhanced Order schemas
class OrderItemBase(BaseModel):
    product_id: int
    product_variant_id: Optional[int] = None
    quantity: int = Field(..., gt=0)
    unit_price: float = Field(..., gt=0)

class OrderItemCreate(OrderItemBase):
    pass

class OrderItemResponse(OrderItemBase):
    id: int
    product_name: str
    product_sku: Optional[str] = None
    variant_name: Optional[str] = None
    total_price: float
    product: Optional[ProductResponse] = None
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

class OrderBase(BaseModel):
    shipping_address: Dict[str, Any]
    billing_address: Dict[str, Any]
    payment_method: Optional[str] = None
    shipping_method: Optional[str] = None
    customer_notes: Optional[str] = None

class OrderCreate(OrderBase):
    items: List[OrderItemCreate] = Field(..., min_length=1)

class OrderUpdate(BaseModel):
    status: Optional[str] = None
    fulfillment_status: Optional[str] = None
    payment_status: Optional[str] = None
    tracking_number: Optional[str] = None
    carrier: Optional[str] = None
    notes: Optional[str] = None

class OrderResponse(OrderBase):
    id: int
    order_number: str
    subtotal: float
    tax_amount: float
    shipping_amount: float
    discount_amount: float
    total_amount: float
    status: str
    fulfillment_status: str
    payment_status: str
    tracking_number: Optional[str] = None
    carrier: Optional[str] = None
    estimated_delivery: Optional[datetime] = None
    order_items: List[OrderItemResponse]
    created_at: datetime
    updated_at: datetime
    confirmed_at: Optional[datetime] = None
    shipped_at: Optional[datetime] = None
    delivered_at: Optional[datetime] = None
    
    model_config = ConfigDict(from_attributes=True)

# Analytics schemas
class AnalyticsEventBase(BaseModel):
    event_type: str
    user_id: Optional[int] = None
    product_id: Optional[int] = None
    session_id: Optional[str] = None
    properties: Optional[Dict[str, Any]] = None

class AnalyticsEventCreate(AnalyticsEventBase):
    pass

class AnalyticsEventResponse(AnalyticsEventBase):
    id: int
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

# Dashboard schemas
class DashboardMetrics(BaseModel):
    total_users: int
    total_products: int
    total_orders: int
    total_revenue: float
    avg_order_value: float
    conversion_rate: float
    top_categories: List[Dict[str, Any]]
    recent_orders: List[OrderResponse]

class SalesMetrics(BaseModel):
    daily_sales: List[Dict[str, Any]]
    monthly_sales: List[Dict[str, Any]]
    top_products: List[Dict[str, Any]]
    sales_by_category: List[Dict[str, Any]]

class UserMetrics(BaseModel):
    new_users_today: int
    active_users: int
    user_retention_rate: float
    user_activity: List[Dict[str, Any]]

class ProductMetrics(BaseModel):
    most_viewed_products: List[Dict[str, Any]]
    low_stock_products: List[Dict[str, Any]]
    product_performance: List[Dict[str, Any]]
    category_performance: List[Dict[str, Any]]
