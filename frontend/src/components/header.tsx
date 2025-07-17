"use client";

import {
  ShoppingCart,
  Menu,
  User,
  Heart,
  MapPin,
  Phone,
  Search,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCartStore } from "@/lib/store";
import { BrandTicker } from "@/components/brand-ticker";
import { categories } from "@/lib/data";
import Link from "next/link";

interface HeaderProps {
  searchTerm?: string;
  onSearchChange?: (value: string) => void;
  selectedCategory?: string;
  onCategoryChange?: (value: string) => void;
  sortBy?: string;
  onSortChange?: (value: string) => void;
}

export function Header({
  searchTerm = "",
  onSearchChange,
  selectedCategory = "All",
  onCategoryChange,
  sortBy = "relevance",
  onSortChange
}: HeaderProps) {
  const totalItems = useCartStore((state) => state.getTotalItems());

  return (
    <header className="fixed top-0 left-0 right-0 z-[100] w-full bg-slate-900 shadow-lg backdrop-blur-md">
      {/* Top Bar with Brand Name and Contact Info */}
      <div className="border-b border-slate-700 bg-slate-800/95 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-2 max-w-full">
          <div className="flex items-center justify-between">
            {/* Left - Brand Name */}
            <div className="flex items-center">
              <Link
                href="/"
                className="flex items-center space-x-3"
              >
                <span className="font-bold text-2xl bg-gradient-to-r from-blue-400 via-purple-400 to-blue-600 bg-clip-text text-transparent drop-shadow-lg tracking-wide">
                  Entropic
                </span>
              </Link>
            </div>

            {/* Center - Contact Info */}
            <div className="hidden md:flex items-center space-x-4 text-xs text-gray-300">
              <div className="flex items-center space-x-1">
                <Phone className="h-3 w-3" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-1">
                <MapPin className="h-3 w-3" />
                <span>Free shipping on orders over $50</span>
              </div>
            </div>

            {/* Right - User Actions */}
            <div className="flex items-center space-x-3">
              <div className="hidden md:flex items-center space-x-3 text-xs text-gray-300">
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

              {/* Action Buttons */}
              <div className="flex items-center space-x-1">
                {/* Account */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="hidden md:flex flex-col items-center p-1 text-gray-300 hover:text-white hover:bg-slate-800 text-xs"
                >
                  <User className="h-4 w-4" />
                  <span className="text-xs">Account</span>
                </Button>

                {/* Wishlist */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="hidden md:flex flex-col items-center p-1 relative text-gray-300 hover:text-white hover:bg-slate-800 text-xs"
                >
                  <Heart className="h-4 w-4" />
                  <span className="text-xs">Wishlist</span>
                </Button>

                {/* Cart */}
                <Link href="/cart">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex flex-col items-center p-1 relative text-gray-300 hover:text-white hover:bg-slate-800 text-xs"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    <span className="text-xs">Cart</span>
                    {totalItems > 0 && (
                      <Badge
                        className="absolute -top-1 -right-1 h-4 w-4 rounded-full p-0 flex items-center justify-center text-xs bg-blue-500 hover:bg-blue-600 text-white font-medium border-0"
                      >
                        {totalItems}
                      </Badge>
                    )}
                  </Button>
                </Link>

                {/* Mobile Menu */}
                <Button variant="ghost" size="sm" className="md:hidden text-gray-300 hover:text-white hover:bg-slate-800">
                  <Menu className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Brand Ticker */}
      <div className="border-b border-slate-700 bg-slate-900/95 backdrop-blur-sm">
        <div className="w-full max-w-full overflow-hidden">
          <BrandTicker 
            className="bg-slate-900/95 border-y-0 py-2 w-full" 
            speed={25}
            showGradientMask={false}
          />
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-slate-900/95 border-b border-slate-700 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-3 max-w-full">
          <div className="flex items-center justify-between gap-4 w-full min-w-0">
            {/* Category Filter - Left */}
            <div className="flex items-center space-x-2 flex-shrink-0 min-w-0">
              <span className="text-sm text-gray-300 font-medium whitespace-nowrap">Category:</span>
              <Select
                value={selectedCategory}
                onValueChange={onCategoryChange}
              >
                <SelectTrigger className="w-36 bg-slate-800 border-slate-600 text-white text-sm flex-shrink-0">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600 z-[200]">
                  {categories.map((category) => (
                    <SelectItem 
                      key={category} 
                      value={category}
                      className="text-white hover:bg-slate-700"
                    >
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Search Bar - Center */}
            <div className="flex-1 max-w-2xl min-w-0 mx-4">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 z-10" />
                <Input
                  type="text"
                  placeholder="Search for products, brands and more..."
                  value={searchTerm}
                  onChange={(e) => onSearchChange?.(e.target.value)}
                  className="w-full pl-10 pr-10 py-2 bg-slate-800 border-slate-600 text-white placeholder:text-gray-400 focus:border-blue-400 shadow-none hover:shadow-none focus:shadow-none focus-visible:shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 outline-none"
                />
                {searchTerm && (
                  <button
                    onClick={() => onSearchChange?.('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors z-10"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Sort Filter - Right */}
            <div className="flex items-center space-x-2 flex-shrink-0 min-w-0">
              <span className="text-sm text-gray-300 font-medium whitespace-nowrap">Sort:</span>
              <Select
                value={sortBy}
                onValueChange={onSortChange}
              >
                <SelectTrigger className="w-40 bg-slate-800 border-slate-600 text-white text-sm flex-shrink-0">
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600 z-[200]">
                  <SelectItem value="relevance" className="text-white hover:bg-slate-700">Featured</SelectItem>
                  <SelectItem value="price-low" className="text-white hover:bg-slate-700">Low to High</SelectItem>
                  <SelectItem value="price-high" className="text-white hover:bg-slate-700">High to Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
