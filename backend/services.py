"""
Service layer for business logic
"""

from sqlalchemy.orm import Session
from sqlalchemy import func, desc, and_, or_
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import uuid

try:
    from . import models, schemas, auth
except ImportError:
    import models, schemas, auth


class UserService:
    def __init__(self, db: Session):
        self.db = db

    def get_user_by_email(self, email: str) -> Optional[models.User]:
        return self.db.query(models.User).filter(models.User.email == email).first()

    def get_user_by_id(self, user_id: int) -> Optional[models.User]:
        return self.db.query(models.User).filter(models.User.id == user_id).first()

    def create_user(self, user: schemas.UserCreate) -> models.User:
        hashed_password = auth.get_password_hash(user.password)
        db_user = models.User(
            email=user.email,
            username=user.username,
            hashed_password=hashed_password,
            first_name=user.first_name,
            last_name=user.last_name
        )
        self.db.add(db_user)
        self.db.commit()
        self.db.refresh(db_user)
        return db_user

    def authenticate_user(self, email: str, password: str) -> Optional[models.User]:
        user = self.get_user_by_email(email)
        if not user:
            return None
        if not auth.verify_password(password, str(user.hashed_password)):
            return None
        return user

    def get_users(self, skip: int = 0, limit: int = 100) -> List[models.User]:
        return self.db.query(models.User).offset(skip).limit(limit).all()


class ProductService:
    def __init__(self, db: Session):
        self.db = db

    def get_product(self, product_id: int) -> Optional[models.Product]:
        return self.db.query(models.Product).filter(models.Product.id == product_id).first()

    def get_products(self, skip: int = 0, limit: int = 100, category: Optional[str] = None) -> List[models.Product]:
        query = self.db.query(models.Product).filter(models.Product.is_active == True)
        if category:
            query = query.filter(models.Product.category.ilike(f"%{category}%"))
        return query.offset(skip).limit(limit).all()

    def create_product(self, product: schemas.ProductCreate) -> models.Product:
        db_product = models.Product(**product.dict())
        self.db.add(db_product)
        self.db.commit()
        self.db.refresh(db_product)
        return db_product

    def update_product(self, product_id: int, product: schemas.ProductUpdate) -> Optional[models.Product]:
        db_product = self.get_product(product_id)
        if not db_product:
            return None
        
        update_data = product.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_product, field, value)
        
        self.db.commit()
        self.db.refresh(db_product)
        return db_product

    def delete_product(self, product_id: int) -> bool:
        db_product = self.get_product(product_id)
        if not db_product:
            return False
        
        db_product.is_active = False
        self.db.commit()
        return True

    def search_products(self, query: str, category: Optional[str] = None) -> List[models.Product]:
        db_query = self.db.query(models.Product).filter(
            models.Product.is_active == True,
            or_(
                models.Product.name.ilike(f"%{query}%"),
                models.Product.description.ilike(f"%{query}%")
            )
        )
        if category:
            db_query = db_query.filter(models.Product.category.ilike(f"%{category}%"))
        return db_query.all()


class CartService:
    def __init__(self, db: Session):
        self.db = db

    def get_cart(self, user_id: int) -> List[models.CartItem]:
        return self.db.query(models.CartItem).filter(models.CartItem.user_id == user_id).all()

    def add_to_cart(self, user_id: int, product_id: int, quantity: int) -> models.CartItem:
        # Check if item already exists in cart
        existing_item = self.db.query(models.CartItem).filter(
            models.CartItem.user_id == user_id,
            models.CartItem.product_id == product_id
        ).first()

        if existing_item:
            existing_item.quantity += quantity
            self.db.commit()
            self.db.refresh(existing_item)
            return existing_item
        else:
            cart_item = models.CartItem(
                user_id=user_id,
                product_id=product_id,
                quantity=quantity
            )
            self.db.add(cart_item)
            self.db.commit()
            self.db.refresh(cart_item)
            return cart_item

    def update_cart_item(self, user_id: int, product_id: int, quantity: int) -> Optional[models.CartItem]:
        cart_item = self.db.query(models.CartItem).filter(
            models.CartItem.user_id == user_id,
            models.CartItem.product_id == product_id
        ).first()
        
        if not cart_item:
            return None
        
        cart_item.quantity = quantity
        self.db.commit()
        self.db.refresh(cart_item)
        return cart_item

    def remove_from_cart(self, user_id: int, product_id: int) -> bool:
        cart_item = self.db.query(models.CartItem).filter(
            models.CartItem.user_id == user_id,
            models.CartItem.product_id == product_id
        ).first()
        
        if not cart_item:
            return False
        
        self.db.delete(cart_item)
        self.db.commit()
        return True

    def clear_cart(self, user_id: int) -> bool:
        self.db.query(models.CartItem).filter(models.CartItem.user_id == user_id).delete()
        self.db.commit()
        return True

    def get_cart_total(self, user_id: int) -> float:
        cart_items = self.get_cart(user_id)
        total = 0.0
        for item in cart_items:
            total += item.product.price * item.quantity
        return total


class OrderService:
    def __init__(self, db: Session):
        self.db = db

    def create_order(self, user_id: int, order_data: schemas.OrderCreate) -> models.Order:
        # Get cart items
        cart_service = CartService(self.db)
        cart_items = cart_service.get_cart(user_id)
        
        if not cart_items:
            raise ValueError("Cart is empty")
        
        # Calculate total
        total_amount = sum(item.product.price * item.quantity for item in cart_items)
        
        # Create order
        order = models.Order(
            user_id=user_id,
            order_number=str(uuid.uuid4()),
            total_amount=total_amount,
            shipping_address=order_data.shipping_address,
            billing_address=order_data.billing_address,
            payment_method=order_data.payment_method
        )
        self.db.add(order)
        self.db.commit()
        self.db.refresh(order)
        
        # Create order items
        for cart_item in cart_items:
            order_item = models.OrderItem(
                order_id=order.id,
                product_id=cart_item.product_id,
                quantity=cart_item.quantity,
                price=cart_item.product.price
            )
            self.db.add(order_item)
        
        # Clear cart
        cart_service.clear_cart(user_id)
        
        self.db.commit()
        self.db.refresh(order)
        return order

    def get_order(self, order_id: int) -> Optional[models.Order]:
        return self.db.query(models.Order).filter(models.Order.id == order_id).first()

    def get_user_orders(self, user_id: int, skip: int = 0, limit: int = 100) -> List[models.Order]:
        return self.db.query(models.Order).filter(
            models.Order.user_id == user_id
        ).order_by(desc(models.Order.created_at)).offset(skip).limit(limit).all()

    def get_orders(self, skip: int = 0, limit: int = 100) -> List[models.Order]:
        return self.db.query(models.Order).order_by(desc(models.Order.created_at)).offset(skip).limit(limit).all()


class AnalyticsService:
    def __init__(self, db: Session):
        self.db = db

    def track_event(self, event: schemas.AnalyticsEventCreate) -> models.AnalyticsEvent:
        db_event = models.AnalyticsEvent(**event.dict())
        self.db.add(db_event)
        self.db.commit()
        self.db.refresh(db_event)
        return db_event

    def get_dashboard_metrics(self) -> Dict[str, Any]:
        # Basic metrics
        total_users = self.db.query(models.User).count()
        total_products = self.db.query(models.Product).filter(models.Product.is_active == True).count()
        total_orders = self.db.query(models.Order).count()
        total_revenue = self.db.query(func.sum(models.Order.total_amount)).scalar() or 0
        
        # Average order value
        avg_order_value = total_revenue / total_orders if total_orders > 0 else 0
        
        # Conversion rate (orders / page views)
        page_views = self.db.query(models.AnalyticsEvent).filter(
            models.AnalyticsEvent.event_type == "page_view"
        ).count()
        conversion_rate = (total_orders / page_views * 100) if page_views > 0 else 0
        
        # Top categories
        top_categories = self.db.query(
            models.Product.category,
            func.count(models.Product.id).label("count")
        ).filter(models.Product.is_active == True).group_by(models.Product.category).all()
        
        # Recent orders
        recent_orders = self.db.query(models.Order).order_by(
            desc(models.Order.created_at)
        ).limit(10).all()
        
        return {
            "total_users": total_users,
            "total_products": total_products,
            "total_orders": total_orders,
            "total_revenue": float(total_revenue),
            "avg_order_value": float(avg_order_value),
            "conversion_rate": float(conversion_rate),
            "top_categories": [{"category": cat[0], "count": cat[1]} for cat in top_categories],
            "recent_orders": recent_orders
        }

    def get_sales_metrics(self, days: int = 30) -> Dict[str, Any]:
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days)
        
        # Daily sales
        daily_sales = self.db.query(
            func.date(models.Order.created_at).label("date"),
            func.sum(models.Order.total_amount).label("revenue"),
            func.count(models.Order.id).label("orders")
        ).filter(
            models.Order.created_at >= start_date,
            models.Order.status != "cancelled"
        ).group_by(func.date(models.Order.created_at)).all()
        
        # Top products
        top_products = self.db.query(
            models.Product.name,
            func.sum(models.OrderItem.quantity).label("total_sold"),
            func.sum(models.OrderItem.price * models.OrderItem.quantity).label("revenue")
        ).join(models.OrderItem).join(models.Order).filter(
            models.Order.created_at >= start_date,
            models.Order.status != "cancelled"
        ).group_by(models.Product.id, models.Product.name).order_by(
            desc(func.sum(models.OrderItem.quantity))
        ).limit(10).all()
        
        return {
            "daily_sales": [
                {
                    "date": sale[0].strftime("%Y-%m-%d"),
                    "revenue": float(sale[1] or 0),
                    "orders": int(sale[2])
                }
                for sale in daily_sales
            ],
            "top_products": [
                {
                    "name": product[0],
                    "total_sold": int(product[1]),
                    "revenue": float(product[2])
                }
                for product in top_products
            ]
        }

    def get_user_metrics(self) -> Dict[str, Any]:
        today = datetime.now().date()
        
        # New users today
        new_users_today = self.db.query(models.User).filter(
            func.date(models.User.created_at) == today
        ).count()
        
        # Active users (users who have logged in in the last 30 days)
        # For now, we'll use users who have made events in the last 30 days
        thirty_days_ago = datetime.now() - timedelta(days=30)
        active_users = self.db.query(models.AnalyticsEvent.user_id).filter(
            models.AnalyticsEvent.created_at >= thirty_days_ago,
            models.AnalyticsEvent.user_id.isnot(None)
        ).distinct().count()
        
        return {
            "new_users_today": new_users_today,
            "active_users": active_users,
            "user_retention_rate": 0.0,  # Placeholder
            "user_activity": []  # Placeholder
        }

    def get_product_metrics(self) -> Dict[str, Any]:
        # Most viewed products
        most_viewed = self.db.query(
            models.Product.name,
            func.count(models.AnalyticsEvent.id).label("views")
        ).join(models.AnalyticsEvent).filter(
            models.AnalyticsEvent.event_type == "product_view"
        ).group_by(models.Product.id, models.Product.name).order_by(
            desc(func.count(models.AnalyticsEvent.id))
        ).limit(10).all()
        
        # Low stock products
        low_stock = self.db.query(models.Product).filter(
            models.Product.stock_quantity < 10,
            models.Product.is_active == True
        ).all()
        
        return {
            "most_viewed_products": [
                {"name": product[0], "views": int(product[1])}
                for product in most_viewed
            ],
            "low_stock_products": [
                {"name": product.name, "stock": product.stock_quantity}
                for product in low_stock
            ],
            "product_performance": [],  # Placeholder
            "category_performance": []  # Placeholder
        }
