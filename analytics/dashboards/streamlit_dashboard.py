# E-Commerce Analytics Dashboard

import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from datetime import datetime, timedelta
import numpy as np

# Configure page
st.set_page_config(
    page_title="Entropic Analytics",
    page_icon="📊",
    layout="wide"
)

# Title and header
st.title("📊 Entropic E-Commerce Analytics Dashboard")
st.markdown("---")

# Sidebar for filters
st.sidebar.header("Filters")
date_range = st.sidebar.date_input(
    "Select Date Range",
    value=(datetime.now() - timedelta(days=30), datetime.now()),
    max_value=datetime.now()
)

# Mock data generation for demo
@st.cache_data
def generate_mock_data():
    np.random.seed(42)
    dates = pd.date_range(start=date_range[0], end=date_range[1], freq='D')
    
    # Sales data
    sales_data = pd.DataFrame({
        'date': dates,
        'revenue': np.random.normal(10000, 2000, len(dates)),
        'orders': np.random.normal(150, 30, len(dates)),
        'conversion_rate': np.random.normal(3.5, 0.5, len(dates))
    })
    
    # Product categories
    categories = ['Electronics', 'Clothing', 'Books', 'Home & Garden', 'Sports']
    category_data = pd.DataFrame({
        'category': categories,
        'revenue': np.random.normal(50000, 10000, len(categories)),
        'orders': np.random.normal(800, 150, len(categories))
    })
    
    # User behavior
    user_data = pd.DataFrame({
        'metric': ['Page Views', 'Unique Visitors', 'Bounce Rate', 'Avg Session Duration'],
        'value': [25000, 8500, 35.2, 4.3],
        'change': [12.5, 8.2, -5.1, 15.6]
    })
    
    return sales_data, category_data, user_data

sales_data, category_data, user_data = generate_mock_data()

# Main metrics row
col1, col2, col3, col4 = st.columns(4)

with col1:
    total_revenue = sales_data['revenue'].sum()
    st.metric(
        label="Total Revenue",
        value=f"${total_revenue:,.0f}",
        delta=f"{np.random.uniform(5, 15):.1f}%"
    )

with col2:
    total_orders = sales_data['orders'].sum()
    st.metric(
        label="Total Orders",
        value=f"{total_orders:,.0f}",
        delta=f"{np.random.uniform(3, 12):.1f}%"
    )

with col3:
    avg_order_value = total_revenue / total_orders
    st.metric(
        label="Avg Order Value",
        value=f"${avg_order_value:.2f}",
        delta=f"{np.random.uniform(-2, 8):.1f}%"
    )

with col4:
    avg_conversion = sales_data['conversion_rate'].mean()
    st.metric(
        label="Conversion Rate",
        value=f"{avg_conversion:.2f}%",
        delta=f"{np.random.uniform(-1, 3):.1f}%"
    )

st.markdown("---")

# Charts row
col1, col2 = st.columns(2)

with col1:
    # Revenue trend
    st.subheader("📈 Revenue Trend")
    fig_revenue = px.line(
        sales_data, 
        x='date', 
        y='revenue',
        title="Daily Revenue",
        labels={'revenue': 'Revenue ($)', 'date': 'Date'}
    )
    fig_revenue.update_layout(showlegend=False)
    st.plotly_chart(fig_revenue, use_container_width=True)

with col2:
    # Orders trend
    st.subheader("📦 Orders Trend")
    fig_orders = px.area(
        sales_data, 
        x='date', 
        y='orders',
        title="Daily Orders",
        labels={'orders': 'Number of Orders', 'date': 'Date'}
    )
    fig_orders.update_layout(showlegend=False)
    st.plotly_chart(fig_orders, use_container_width=True)

# Category analysis
st.markdown("---")
st.subheader("🏷️ Category Performance")

col1, col2 = st.columns(2)

with col1:
    # Revenue by category
    fig_cat_revenue = px.pie(
        category_data, 
        values='revenue', 
        names='category',
        title="Revenue by Category"
    )
    st.plotly_chart(fig_cat_revenue, use_container_width=True)

with col2:
    # Orders by category
    fig_cat_orders = px.bar(
        category_data, 
        x='category', 
        y='orders',
        title="Orders by Category",
        labels={'orders': 'Number of Orders', 'category': 'Category'}
    )
    st.plotly_chart(fig_cat_orders, use_container_width=True)

# User behavior metrics
st.markdown("---")
st.subheader("👥 User Behavior Metrics")

# Create metrics in columns
cols = st.columns(len(user_data))
for i, (_, row) in enumerate(user_data.iterrows()):
    with cols[i]:
        delta_color = "normal" if row['change'] >= 0 else "inverse"
        st.metric(
            label=row['metric'],
            value=f"{row['value']:,.1f}" + ("%" if "Rate" in row['metric'] else ""),
            delta=f"{row['change']:+.1f}%"
        )

# Top products table
st.markdown("---")
st.subheader("🏆 Top Performing Products")

# Mock top products data
top_products = pd.DataFrame({
    'Product': ['Wireless Headphones', 'Smartphone', 'Running Shoes', 'Coffee Maker', 'Laptop'],
    'Revenue': [15420, 12850, 9630, 8420, 7250],
    'Orders': [154, 18, 74, 84, 8],
    'Avg Rating': [4.8, 4.6, 4.9, 4.5, 4.7]
})

st.dataframe(
    top_products.style.format({
        'Revenue': '${:,.0f}',
        'Orders': '{:,}',
        'Avg Rating': '{:.1f}'
    }),
    use_container_width=True
)

# Footer
st.markdown("---")
st.markdown("**Data last updated:** " + datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
st.markdown("*This dashboard provides real-time insights into your e-commerce performance.*")
