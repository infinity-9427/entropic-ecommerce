"use client";

import {
  ShoppingCart,
  Menu,
  User,
  Heart,
  MapPin,
  Phone,
  Star,
  Truck,
  Gift,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCartStore } from "@/lib/store";
import { BrandTicker } from "@/components/brand-ticker";
import Link from "next/link";

export function Header() {
  const totalItems = useCartStore((state) => state.getTotalItems());

  return (
    <header className="sticky top-0 z-50 w-full bg-slate-900 shadow-sm">
      {/* Top Bar */}
      <div className="border-b border-slate-700 bg-slate-800 text-sm">
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="hidden md:flex items-center space-x-6 text-gray-300">
              <div className="flex items-center space-x-1">
                <Phone className="h-3 w-3" />
                <span>Support: +1 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-1">
                <MapPin className="h-3 w-3" />
                <span>Free shipping on orders over $50</span>
              </div>
            </div>
            <div className="flex items-center space-x-4 text-gray-300">
              <Link
                href="/track-order"
                className="hover:text-white transition-colors"
              >
                Track Order
              </Link>
              <Link
                href="/store-locator"
                className="hover:text-white transition-colors"
              >
                Store Locator
              </Link>
              <Link
                href="/help"
                className="hover:text-white transition-colors"
              >
                Help
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="bg-slate-900">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center space-x-3 flex-shrink-0"
            >
              <span className="font-bold text-3xl bg-gradient-to-r from-blue-400 via-purple-400 to-blue-600 bg-clip-text text-transparent drop-shadow-lg tracking-wide">
                Entropic
              </span>
            </Link>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              {/* Account */}
              <Button
                variant="ghost"
                size="sm"
                className="hidden md:flex flex-col items-center p-2 text-gray-300 hover:text-white hover:bg-slate-800"
              >
                <User className="h-5 w-5" />
                <span className="text-xs">Account</span>
              </Button>

              {/* Wishlist */}
              <Button
                variant="ghost"
                size="sm"
                className="hidden md:flex flex-col items-center p-2 relative text-gray-300 hover:text-white hover:bg-slate-800"
              >
                <Heart className="h-5 w-5" />
                <span className="text-xs">Wishlist</span>
              </Button>

              {/* Cart */}
              <Link href="/cart">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex flex-col items-center p-2 relative text-gray-300 hover:text-white hover:bg-slate-800"
                >
                  <ShoppingCart className="h-5 w-5" />
                  <span className="text-xs">Cart</span>
                  {totalItems > 0 && (
                    <Badge
                      variant="destructive"
                      className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                    >
                      {totalItems}
                    </Badge>
                  )}
                </Button>
              </Link>

              {/* Mobile Menu */}
              <Button variant="ghost" size="sm" className="md:hidden text-gray-300 hover:text-white hover:bg-slate-800">
                <Menu className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Brand Ticker */}
      <BrandTicker 
        className="bg-slate-900 border-y-0 py-2" 
        speed={25}
        showGradientMask={false}
      />

      {/* Navigation Bar */}
      <div className="border-b border-slate-700 bg-slate-900">
        <div className="container mx-auto px-4">
          <nav className="flex items-center justify-between h-12">
            {/* Left Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              <Link
                href="/"
                className="text-sm font-medium transition-colors hover:text-blue-400 text-gray-300"
              >
                Home
              </Link>

              <Link
                href="/deals"
                className="text-sm font-medium transition-colors hover:text-red-400 text-red-400 flex items-center space-x-1"
              >
                <Star className="h-3 w-3" />
                <span>Today's Deals</span>
              </Link>

              <Link
                href="/new-arrivals"
                className="text-sm font-medium transition-colors hover:text-blue-400 text-gray-300 flex items-center space-x-1"
              >
                <Gift className="h-3 w-3" />
                <span>New Arrivals</span>
              </Link>
            </div>

            {/* Mobile Navigation */}
            <div className="flex md:hidden items-center space-x-4">
              <Link
                href="/"
                className="text-sm font-medium transition-colors hover:text-blue-400 text-gray-300"
              >
                Home
              </Link>
              <Link
                href="/deals"
                className="text-sm font-medium transition-colors hover:text-red-400 text-red-400"
              >
                Deals
              </Link>
            </div>

            {/* Right side promotions */}
            <div className="hidden lg:flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-1 text-green-400">
                <Truck className="h-4 w-4" />
                <span>Free Shipping</span>
              </div>
              <span className="text-gray-500">|</span>
              <Link href="/membership" className="text-blue-400 hover:text-blue-300 hover:underline">
                Join Premium
              </Link>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
