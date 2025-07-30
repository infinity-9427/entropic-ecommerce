'use client';

import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Minus, Plus, Trash2, ShoppingBag, Heart, Star, TrendingUp, Package } from 'lucide-react';
import { useCartStore } from '@/lib/store';
import { apiService } from '@/lib/api';
import Image from 'next/image';
import Link from 'next/link';

export default function CartPage() {
  const { items, updateQuantity, removeFromCart, getTotalPrice, clearCart } = useCartStore();

  // Enhanced empty cart component
  const EmptyCartState = () => (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 pt-40">
        <div className="max-w-4xl mx-auto">
          {/* Main empty cart section */}
          <div className="text-center py-12 mb-12">
            <div className="mb-8">
              <div className="relative inline-block">
                <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                  <ShoppingBag className="w-16 h-16 text-blue-500" strokeWidth={1.5} />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-gray-800">0</span>
                </div>
              </div>
            </div>
            
            <h1 className="text-4xl font-bold mb-4 text-gray-900">Your cart is empty</h1>
            <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
              Ready to start shopping? Browse our featured collections and discover amazing products.
            </p>
          </div>

          {/* Featured sections */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {/* Popular Categories */}
            <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-2 hover:border-blue-200">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <TrendingUp className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Popular Categories</h3>
                <p className="text-gray-600 text-sm mb-4">Discover what's trending now</p>
                <Link href="/">
                  <Button variant="outline" size="sm" className="w-full">
                    Browse All Products
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Featured Products */}
            <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-2 hover:border-green-200">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Star className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Featured Products</h3>
                <p className="text-gray-600 text-sm mb-4">Handpicked items just for you</p>
                <Link href="/">
                  <Button variant="outline" size="sm" className="w-full">
                    View All Products
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* New Arrivals */}
            <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-2 hover:border-orange-200">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Package className="w-8 h-8 text-orange-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">New Arrivals</h3>
                <p className="text-gray-600 text-sm mb-4">Fresh products just added</p>
                <Link href="/new-arrivals">
                  <Button variant="outline" size="sm" className="w-full">
                    See New Items
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Shopping benefits */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 mb-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Why Shop With Us?</h2>
              <p className="text-gray-600">Enjoy these amazing benefits when you shop</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-blue-100 flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <h3 className="font-semibold mb-1">Free Shipping</h3>
                <p className="text-sm text-gray-600">On orders over $50</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-green-100 flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-semibold mb-1">Easy Returns</h3>
                <p className="text-sm text-gray-600">30-day return policy</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-purple-100 flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="font-semibold mb-1">Secure Payment</h3>
                <p className="text-sm text-gray-600">100% secure checkout</p>
              </div>
            </div>
          </div>

          {/* Call to action */}
          <div className="text-center">
            <Link href="/">
              <Button size="lg" className="px-8 py-3 text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105 transition-all duration-200">
                Start Shopping Now
              </Button>
            </Link>
            <p className="text-sm text-gray-500 mt-3">
              Need help? <Link href="/" className="text-blue-600 hover:underline">Visit our help center</Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );

  if (items.length === 0) {
    return <EmptyCartState />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 pt-40">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Shopping Cart</h1>
          <p className="text-muted-foreground flex items-center gap-2">
            <ShoppingBag className="w-4 h-4" />
            {items.length} {items.length === 1 ? 'item' : 'items'} in your cart
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {/* Cart header with actions */}
            <div className="flex items-center justify-between mb-4 p-4 bg-blue-50 rounded-lg border">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-green-700 font-medium">
                  Free shipping on your order
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearCart}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Clear all
              </Button>
            </div>

            {items.map((item) => (
              <Card key={item.id} className="hover:shadow-md transition-shadow duration-200">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-24 h-24">
                      {apiService.getProductImageUrl(item) ? (
                        <Image
                          src={apiService.getProductImageUrl(item)!}
                          alt={item.name}
                          width={96}
                          height={96}
                          className="rounded-md object-cover w-full h-full border"
                        />
                      ) : (
                        <div className="w-full h-full p-2 border rounded-md bg-gray-50">
                          <Skeleton className="w-full h-full rounded-md" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="mb-2">
                        <h3 className="font-semibold text-lg leading-tight">{item.name}</h3>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Package className="w-3 h-3" />
                          {item.category}
                        </p>
                        {item.brand && (
                          <p className="text-xs text-muted-foreground">Brand: {item.brand}</p>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 mb-3">
                        <div className="flex items-center space-x-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="h-8 w-8 p-0"
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-12 text-center text-sm font-medium border rounded px-2 py-1">
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="h-8 w-8 p-0"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFromCart(item.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8"
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Remove
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 h-8"
                          >
                            <Heart className="h-3 w-3 mr-1" />
                            Save for later
                          </Button>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-green-600 font-medium">
                          In Stock
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">
                            ${item.price} each
                          </p>
                          <p className="font-bold text-lg">
                            ${(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {/* Recommended products section */}
            <Card className="mt-8">
              <CardHeader>
                <CardTitle className="text-lg">Customers who bought these items also bought</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Recommended products will appear here</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5" />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal ({items.reduce((total, item) => total + item.quantity, 0)} items)</span>
                    <span>${getTotalPrice().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Shipping & Handling</span>
                    <span className="text-green-600 font-medium">FREE</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Tax</span>
                    <span>Calculated at checkout</span>
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Order Total</span>
                    <span className="text-orange-600">${getTotalPrice().toFixed(2)}</span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <Button className="w-full" size="lg">
                    Proceed to Checkout
                  </Button>
                  
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground mb-2">
                      🔒 Secure 256-bit SSL encryption
                    </p>
                  </div>
                  
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={clearCart}
                  >
                    Clear Cart
                  </Button>
                </div>
                
                {/* Payment methods */}
                <div className="pt-4 border-t">
                  <p className="text-sm font-medium mb-2">We accept:</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <div className="px-2 py-1 bg-blue-100 rounded">VISA</div>
                    <div className="px-2 py-1 bg-red-100 rounded">MASTER</div>
                    <div className="px-2 py-1 bg-yellow-100 rounded">PAYPAL</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
