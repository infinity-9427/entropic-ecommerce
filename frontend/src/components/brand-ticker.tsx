"use client";

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { brands, DEFAULT_BRAND_LOGO, type Brand } from '@/lib/brands';
import { cn } from '@/lib/utils';

interface BrandTickerProps {
  className?: string;
  speed?: number; // Duration in seconds for one complete cycle
  pauseOnHover?: boolean;
  showGradientMask?: boolean;
  direction?: 'left' | 'right';
  duplicates?: number;
}

export function BrandTicker({ 
  className,
  speed = 30,
  pauseOnHover = true,
  showGradientMask = true,
  direction = 'left',
  duplicates = 3
}: BrandTickerProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  const [isMobile, setIsMobile] = useState(false);

  // Check for mobile on mount
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Create duplicated brands array
  const duplicatedBrands = Array(duplicates).fill(brands).flat();

  const handleImageError = (brandId: string) => {
    setImageErrors(prev => new Set(prev).add(brandId));
  };

  const handleImageLoad = (brandId: string) => {
    setImageErrors(prev => {
      const newSet = new Set(prev);
      newSet.delete(brandId);
      return newSet;
    });
  };

  // Adjust speed for mobile
  const effectiveSpeed = isMobile ? speed * 1.5 : speed;

  return (
    <div 
      className={cn(
        "relative w-full overflow-hidden bg-background/50 border-y border-border",
        className
      )}
      onMouseEnter={() => pauseOnHover && setIsHovered(true)}
      onMouseLeave={() => pauseOnHover && setIsHovered(false)}
      role="marquee"
      aria-label="Brand logos ticker"
    >
      {/* Gradient masks for smooth fade effect */}
      {showGradientMask && (
        <>
          <div className="absolute left-0 top-0 z-10 h-full w-8 md:w-20 bg-gradient-to-r from-background to-transparent pointer-events-none" />
          <div className="absolute right-0 top-0 z-10 h-full w-8 md:w-20 bg-gradient-to-l from-background to-transparent pointer-events-none" />
        </>
      )}

      {/* Ticker container */}
      <div
        className={cn(
          "flex items-center py-2 md:py-3",
          direction === 'left' ? 'brand-ticker-scroll-left' : 'brand-ticker-scroll-right'
        )}
        style={{
          '--scroll-duration': `${effectiveSpeed}s`,
          animationPlayState: isHovered ? 'paused' : 'running'
        } as React.CSSProperties}
      >
        {duplicatedBrands.map((brand: Brand, index: number) => (
          <BrandLogo
            key={`${brand.id}-${index}`}
            brand={brand}
            hasError={imageErrors.has(brand.id)}
            onError={() => handleImageError(brand.id)}
            onLoad={() => handleImageLoad(brand.id)}
            isMobile={isMobile}
          />
        ))}
      </div>
    </div>
  );
}

interface BrandLogoProps {
  brand: Brand;
  hasError: boolean;
  onError: () => void;
  onLoad: () => void;
  isMobile?: boolean;
}

function BrandLogo({ brand, hasError, onError, onLoad, isMobile = false }: BrandLogoProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad();
  };

  return (
    <div 
      className={cn(
        "flex-shrink-0",
        isMobile ? "px-3" : "px-4 md:px-6 lg:px-8"
      )}
      role="img"
      aria-label={brand.alt}
    >
      <div className={cn(
        "relative flex items-center justify-center",
        isMobile 
          ? "h-6 w-12" 
          : "h-8 w-16 md:h-10 md:w-20 lg:h-12 lg:w-24"
      )}>
        <Image
          src={hasError ? DEFAULT_BRAND_LOGO : brand.logo}
          alt={brand.alt}
          fill
          className={cn(
            "object-contain transition-all duration-300",
            // For dark backgrounds, we want white/bright logos
            "filter brightness-0 invert opacity-70 hover:opacity-100",
            hasError && "opacity-50"
          )}
          onError={onError}
          onLoad={handleLoad}
          sizes={isMobile 
            ? "64px" 
            : "(max-width: 768px) 80px, (max-width: 1024px) 128px, 160px"
          }
          priority={false}
          loading="lazy"
        />
      </div>
    </div>
  );
}

// Additional variant for different styling
export function BrandTickerCompact({ 
  className,
  speed = 25,
  pauseOnHover = true,
  direction = 'left'
}: Omit<BrandTickerProps, 'showGradientMask' | 'duplicates'>) {
  return (
    <BrandTicker
      className={cn("py-2 md:py-3 border-0 bg-muted/30", className)}
      speed={speed}
      pauseOnHover={pauseOnHover}
      showGradientMask={false}
      direction={direction}
      duplicates={2}
    />
  );
}

// Preset configurations
export function BrandTickerFast(props: Omit<BrandTickerProps, 'speed'>) {
  return <BrandTicker {...props} speed={15} />;
}

export function BrandTickerSlow(props: Omit<BrandTickerProps, 'speed'>) {
  return <BrandTicker {...props} speed={45} />;
}

export function BrandTickerReverse(props: Omit<BrandTickerProps, 'direction'>) {
  return <BrandTicker {...props} direction="right" />;
}

export default BrandTicker;
