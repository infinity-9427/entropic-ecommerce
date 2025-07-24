'use client';

import Image from 'next/image';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Package } from 'lucide-react';
import { Product } from '@/lib/api';
import { useCartStore } from '@/lib/store';
import { useState } from 'react';
import { apiService } from '@/lib/api';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const addToCart = useCartStore((state) => state.addToCart);
  const [imageError, setImageError] = useState(false);

  const handleAddToCart = () => {
    addToCart(product);
  };

  const handleImageError = () => {
    setImageError(true);
  };

  // Get the primary image URL using the API service helper
  const imageUrl = apiService.getProductImageUrl(product);

  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-shadow h-full flex flex-col p-0 gap-0">
      <div className="aspect-square overflow-hidden bg-gray-100 flex items-center justify-center">
        {imageError || !imageUrl ? (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
            <Package className="h-16 w-16 text-gray-400" />
          </div>
        ) : (
          <Image
            src={imageUrl}
            alt={product.name}
            width={300}
            height={300}
            className="w-full h-full object-cover transition-transform group-hover:scale-105"
            onError={handleImageError}
            unoptimized
          />
        )}
      </div>
      <CardContent className="p-4 flex-1 flex flex-col justify-between">
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold line-clamp-2 text-sm flex-1">{product.name}</h3>
            <Badge variant="secondary" className="text-xs shrink-0">
              {product.category}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground line-clamp-2">
            {product.description}
          </p>
          {product.brand && (
            <p className="text-xs text-muted-foreground font-medium">
              {product.brand}
            </p>
          )}
        </div>
        <div className="mt-4">
          <span className="font-bold text-lg">${product.price}</span>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button 
          onClick={handleAddToCart}
          className="w-full" 
          size="sm"
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
}
