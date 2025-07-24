export interface Product {
  id: string | number;
  name: string;
  price: number;
  category: string;
  image: string;
  image_url?: string;
  images?: Array<{ url: string; public_id: string }>;
  description: string;
  stock_quantity?: number;
  is_active?: boolean;
  created_at?: string;
}

export const products: Product[] = [
  {
    id: "1",
    name: "Wireless Headphones",
    price: 99.99,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop",
    description: "Premium wireless headphones with noise cancellation"
  },
  {
    id: "2",
    name: "Smartphone",
    price: 699.99,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&h=300&fit=crop",
    description: "Latest generation smartphone with advanced features"
  },
  {
    id: "3",
    name: "Running Shoes",
    price: 129.99,
    category: "Sports",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&h=300&fit=crop",
    description: "Comfortable running shoes for all terrains"
  },
  {
    id: "4",
    name: "Coffee Maker",
    price: 199.99,
    category: "Home",
    image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&h=300&fit=crop",
    description: "Professional grade coffee maker for home use"
  },
  {
    id: "5",
    name: "Laptop",
    price: 1299.99,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=300&h=300&fit=crop",
    description: "High-performance laptop for work and gaming"
  },
  {
    id: "6",
    name: "Yoga Mat",
    price: 39.99,
    category: "Sports",
    image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=300&h=300&fit=crop",
    description: "Non-slip yoga mat for all skill levels"
  },
  {
    id: "7",
    name: "Desk Lamp",
    price: 79.99,
    category: "Home",
    image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=300&h=300&fit=crop",
    description: "Adjustable LED desk lamp with multiple brightness settings"
  },
  {
    id: "8",
    name: "Backpack",
    price: 89.99,
    category: "Fashion",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300&h=300&fit=crop",
    description: "Durable travel backpack with multiple compartments"
  }
];

export const categories = ["All", "Electronics", "Clothing"];
