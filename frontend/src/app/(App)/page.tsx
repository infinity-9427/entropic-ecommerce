'use client';

import { useState, useMemo, useEffect } from 'react';
import { Header } from '@/components/header';
import { ProductCard } from '@/components/product-card';
import { ProductGridSkeleton } from '@/components/ui/product-skeleton';
import { apiService, type Product } from '@/lib/api';
import { BounceLoader } from 'react-spinners';

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('relevance');
  const [searchError, setSearchError] = useState<string | null>(null);

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const data = await apiService.getProducts();
        
        if (!data || !Array.isArray(data)) {
          throw new Error('Invalid response from server');
        }
        
        // Filter for active products only
        const activeProducts = data.filter(product => product.is_active !== false);
        setProducts(activeProducts);
        setError(null); // Ensure error is cleared on success
        
      } catch (err) {
        console.error('API call failed:', err);
        const errorMessage = err instanceof Error && err.message.includes('timeout') 
          ? 'Connection timeout. Please check your internet connection and try again.'
          : 'We are experiencing technical issues. Please try again later.';
        setError(errorMessage);
        setProducts([]); // Clear any previous products on error
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Retry function for error state
  const handleRetry = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await apiService.getProducts();
      
      if (!data || !Array.isArray(data)) {
        throw new Error('Invalid response from server');
      }
      
      const activeProducts = data.filter(product => product.is_active !== false);
      setProducts(activeProducts);
      setError(null); // Ensure error is cleared on success
      
    } catch (err) {
      console.error('Retry failed:', err);
      const errorMessage = err instanceof Error && err.message.includes('timeout') 
        ? 'Connection timeout. Please check your internet connection and try again.'
        : 'We are experiencing technical issues. Please try again later.';
      setError(errorMessage);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredAndSortedProducts = useMemo(() => {
    // If we have an error or are loading, return empty array
    if (error || loading) {
      return [];
    }
    
    // Clear any search errors first
    setSearchError(null);
    
    // Search validation
    const trimmedSearch = searchTerm.trim();
    if (trimmedSearch.length > 0 && trimmedSearch.length < 2) {
      setSearchError('Search term must be at least 2 characters long');
      return [];
    }
    
    // Apply filters
    const filtered = products.filter((product) => {
      // Category filter: if "All" is selected, include all categories
      const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
      
      // Search filter: if empty search, include all products
      const matchesSearch = trimmedSearch === '' || 
        product.name.toLowerCase().includes(trimmedSearch.toLowerCase()) ||
        (product.description && product.description.toLowerCase().includes(trimmedSearch.toLowerCase()));
      
      return matchesCategory && matchesSearch;
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
          // Featured/relevance: match score + alphabetical
          const aScore = (product: typeof a) => {
            let score = 0;
            if (product.is_featured) score += 200; // Featured products get priority
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
  }, [products, searchTerm, selectedCategory, sortBy, loading, error]);

  return (
    <div className="min-h-screen bg-background w-full">
      <Header 
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        sortBy={sortBy}
        onSortChange={setSortBy}
      />

      {/* Fixed spacer to account for fixed header */}
      <div className="h-48"></div>

      <main className="container mx-auto px-4 py-6 w-full max-w-7xl">
        {/* Results Count or Welcome Message */}
        <div className="mb-6 w-full">
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : (
            // Only show results count when user is actively searching or filtering
            (searchTerm.trim() || selectedCategory !== 'All') ? (
              <p className="text-sm text-muted-foreground">
                {filteredAndSortedProducts.length} {filteredAndSortedProducts.length === 1 ? 'result' : 'results'}
                {searchTerm && ` for "${searchTerm}"`}
                {selectedCategory !== 'All' && ` in ${selectedCategory}`}
              </p>
            ) : (
              // Welcome message for homepage when no search/filter is active
              <div className="space-y-1">
                <h2 className="text-2xl font-bold text-gray-900">Discover Amazing Products</h2>
                <p className="text-sm text-muted-foreground">Find everything you need from top brands and quality sellers</p>
              </div>
            )
          )}
          
          {/* Search Error Message */}
          {searchError && (
            <p className="mt-2 text-sm text-gray-600">
              {searchError}
            </p>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <>
            <div className="flex flex-col items-center justify-center py-12">
              <BounceLoader
                color="#0ea5e9"
                size={50}
                speedMultiplier={1}
              />
              <p className="text-muted-foreground text-base mt-4">
                Loading amazing products...
              </p>
            </div>
            <ProductGridSkeleton count={8} />
          </>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="text-center max-w-md">
              <div className="text-6xl mb-4">⚠️</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Service Temporarily Unavailable
              </h3>
              <p className="text-red-600 text-sm mb-6 leading-relaxed">
                {error}
              </p>
              <button 
                onClick={handleRetry} 
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Products Grid */}
        {!loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full">
            {filteredAndSortedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {/* No Results State - only show when we have successfully loaded products but filters don't match */}
        {!loading && !error && products.length > 0 && filteredAndSortedProducts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="text-center max-w-md">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Oops, nothing matched your search!
              </h3>
              <p className="text-muted-foreground text-sm mb-4">
                Try using different keywords or filters to find what you're looking for.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
