'use client';

import { useState, useMemo } from 'react';
import { Header } from '@/components/header';
import { ProductCard } from '@/components/product-card';
import { ProductFilters } from '@/components/product-filters';
import { products } from '@/lib/data';

export default function Home() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('relevance');

  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'relevance':
        default:
          // Default relevance: match score + alphabetical
          const aScore = (product: typeof a) => {
            let score = 0;
            if (searchTerm) {
              const searchLower = searchTerm.toLowerCase();
              const nameLower = product.name.toLowerCase();
              const descLower = product.description.toLowerCase();
              
              // Exact name match gets highest score
              if (nameLower.includes(searchLower)) score += 100;
              // Description match gets lower score
              if (descLower.includes(searchLower)) score += 50;
            }
            return score;
          };
          
          const scoreA = aScore(a);
          const scoreB = aScore(b);
          
          if (scoreA !== scoreB) {
            return scoreB - scoreA; // Higher score first
          }
          
          // If same score, sort alphabetically
          return a.name.localeCompare(b.name);
      }
    });

    return filtered;
  }, [searchTerm, selectedCategory, sortBy]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight mb-2">
            Welcome to Entropic
          </h1>
          <p className="text-muted-foreground text-lg">
            Discover amazing products at great prices
          </p>
        </div>

        <ProductFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          sortBy={sortBy}
          onSortChange={setSortBy}
        />

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-sm text-muted-foreground">
            {filteredAndSortedProducts.length} {filteredAndSortedProducts.length === 1 ? 'result' : 'results'}
            {searchTerm && ` for "${searchTerm}"`}
            {selectedCategory !== 'All' && ` in ${selectedCategory}`}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">{filteredAndSortedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {filteredAndSortedProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg mb-2">
              No products found
            </p>
            <p className="text-muted-foreground text-sm">
              Try adjusting your search or filter criteria
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
