# Brand Ticker Integration Examples

This document shows real-world examples of how to integrate the Brand Ticker component into different parts of your application.

## 1. Home Page Hero Section

```tsx
// src/app/page.tsx
import { BrandTicker } from '@/components/brand-ticker';

export default function HomePage() {
  return (
    <div>
      <section className="bg-background">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-4xl font-bold text-center mb-2">
            Welcome to Our Store
          </h1>
          <p className="text-muted-foreground text-lg text-center">
            Discover products from world-class brands
          </p>
        </div>
        
        {/* Brand Ticker in hero */}
        <BrandTicker className="mb-8" />
      </section>
      
      {/* Rest of your content */}
    </div>
  );
}
```

## 2. Category Pages

```tsx
// src/app/deals/page.tsx
import { BrandTickerCompact } from '@/components/brand-ticker';

export default function DealsPage() {
  return (
    <div>
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-4">Today's Deals</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Amazing discounts from top brands
        </p>
        
        {/* Compact ticker for category pages */}
        <BrandTickerCompact className="my-8" speed={20} />
        
        {/* Deal content */}
      </main>
    </div>
  );
}
```

## 3. Footer Integration

```tsx
// src/components/footer.tsx
import { BrandTickerCompact } from '@/components/brand-ticker';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      {/* Main footer content */}
      <div className="container mx-auto px-4 py-12">
        {/* Footer links and content */}
      </div>
      
      {/* Brand ticker in footer */}
      <BrandTickerCompact 
        className="border-0 bg-gray-800/50" 
        speed={35} 
        direction="right"
      />
      
      {/* Copyright section */}
      <div className="border-t border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <p>&copy; 2025 Your Company. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
```

## 4. Product Showcase Section

```tsx
// src/components/product-showcase.tsx
import { BrandTicker } from '@/components/brand-ticker';

export function ProductShowcase() {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8">
          Featured Products
        </h2>
        
        {/* Product grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Product cards */}
        </div>
        
        {/* Brand ticker to show partnerships */}
        <div className="text-center mb-6">
          <h3 className="text-lg font-semibold text-muted-foreground">
            Trusted by leading brands
          </h3>
        </div>
        <BrandTicker 
          speed={25}
          className="rounded-lg bg-muted/30"
        />
      </div>
    </section>
  );
}
```

## 5. About/Partnership Section

```tsx
// src/app/about/page.tsx
import { BrandTickerSlow } from '@/components/brand-ticker';

export default function AboutPage() {
  return (
    <div>
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">
            Our Partners
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            We're proud to work with industry-leading brands to bring you 
            the best products at competitive prices.
          </p>
          
          {/* Slow-moving ticker for emphasis */}
          <BrandTickerSlow showGradientMask={false} />
        </div>
      </section>
    </div>
  );
}
```

## 6. E-commerce Product Page

```tsx
// src/app/products/[id]/page.tsx
import { BrandTickerCompact } from '@/components/brand-ticker';

export default function ProductPage() {
  return (
    <div>
      {/* Product details */}
      <main className="container mx-auto px-4 py-8">
        {/* Product info */}
      </main>
      
      {/* Related brands section */}
      <section className="border-t">
        <div className="py-6">
          <p className="text-center text-sm text-muted-foreground mb-4">
            Explore more brands
          </p>
          <BrandTickerCompact 
            speed={30} 
            pauseOnHover={false}
            className="bg-muted/20"
          />
        </div>
      </section>
    </div>
  );
}
```

## 7. Loading/Placeholder State

```tsx
// src/components/brand-ticker-loading.tsx
export function BrandTickerLoading() {
  return (
    <div className="relative w-full overflow-hidden bg-background/50 border-y border-border py-6">
      <div className="flex items-center space-x-8 animate-pulse">
        {Array.from({ length: 8 }).map((_, i) => (
          <div 
            key={i}
            className="flex-shrink-0 h-16 w-32 bg-muted rounded-md"
          />
        ))}
      </div>
    </div>
  );
}

// Usage in suspense boundary
import { Suspense } from 'react';
import { BrandTicker } from '@/components/brand-ticker';
import { BrandTickerLoading } from '@/components/brand-ticker-loading';

export function HomePage() {
  return (
    <div>
      <Suspense fallback={<BrandTickerLoading />}>
        <BrandTicker />
      </Suspense>
    </div>
  );
}
```

## 8. Mobile-Optimized Implementation

```tsx
// src/components/mobile-brand-section.tsx
'use client';

import { useEffect, useState } from 'react';
import { BrandTicker, BrandTickerCompact } from '@/components/brand-ticker';

export function MobileBrandSection() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <section className="py-8">
      {isMobile ? (
        <BrandTickerCompact 
          speed={20} 
          className="bg-muted/50"
        />
      ) : (
        <BrandTicker 
          speed={30}
          showGradientMask={true}
        />
      )}
    </section>
  );
}
```

## 9. Theme-Aware Implementation

```tsx
// src/components/themed-brand-ticker.tsx
'use client';

import { useTheme } from 'next-themes';
import { BrandTicker } from '@/components/brand-ticker';

export function ThemedBrandTicker() {
  const { theme } = useTheme();
  
  return (
    <BrandTicker 
      className={
        theme === 'dark' 
          ? 'bg-background/80 border-border/50' 
          : 'bg-background/90 border-border'
      }
      speed={25}
    />
  );
}
```

## 10. Animation Control

```tsx
// src/components/controlled-brand-ticker.tsx
'use client';

import { useState } from 'react';
import { BrandTicker } from '@/components/brand-ticker';
import { Button } from '@/components/ui/button';

export function ControlledBrandTicker() {
  const [isPaused, setIsPaused] = useState(false);
  
  return (
    <div>
      <div className="flex justify-center mb-4">
        <Button 
          onClick={() => setIsPaused(!isPaused)}
          variant="outline"
        >
          {isPaused ? 'Resume' : 'Pause'} Animation
        </Button>
      </div>
      
      <BrandTicker 
        pauseOnHover={!isPaused}
        // Force pause by setting very slow speed
        speed={isPaused ? 999999 : 30}
      />
    </div>
  );
}
```

## Best Practices

### Performance
- Use `BrandTickerCompact` for multiple instances on the same page
- Consider lazy loading for below-the-fold tickers
- Limit the number of brands to avoid memory issues

### Accessibility
- Always keep `pauseOnHover={true}` (default) for accessibility
- The component respects `prefers-reduced-motion`
- Ensure sufficient color contrast for brand logos

### Design Integration
- Match the ticker background to your page design
- Use gradient masks (`showGradientMask={true}`) for seamless integration
- Choose appropriate speeds: fast (15s) for hero sections, slow (45s) for footer

### Mobile Optimization
- The component automatically adjusts for mobile
- Consider using compact variants on smaller screens
- Test scroll performance on various devices
