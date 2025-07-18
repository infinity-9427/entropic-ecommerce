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

# User schemas
class UserBase(BaseModel):
    email: EmailStr
    username: str
    first_name: str
    last_name: str

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    is_active: bool
    is_admin: bool
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

# Product schemas
class ProductBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: float = Field(..., gt=0)
    category: str
    image_url: Optional[str] = None
    stock_quantity: int = Field(..., ge=0)

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = Field(None, gt=0)
    category: Optional[str] = None
    image_url: Optional[str] = None
    stock_quantity: Optional[int] = Field(None, ge=0)
    is_active: Optional[bool] = None

class ProductResponse(ProductBase):
    id: int
    is_active: bool
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

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

# Order schemas
class OrderItemBase(BaseModel):
    product_id: int
    quantity: int = Field(..., gt=0)
    price: float = Field(..., gt=0)

class OrderItemResponse(OrderItemBase):
    id: int
    product: ProductResponse
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

class OrderBase(BaseModel):
    shipping_address: Optional[Dict[str, Any]] = None
    billing_address: Optional[Dict[str, Any]] = None
    payment_method: Optional[str] = None

class OrderCreate(OrderBase):
    pass

class OrderResponse(OrderBase):
    id: int
    order_number: str
    total_amount: float
    status: OrderStatus
    payment_status: PaymentStatus
    order_items: List[OrderItemResponse]
    created_at: datetime
    updated_at: datetime
    
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
