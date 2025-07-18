"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);
  const [translateX, setTranslateX] = useState(0);

  // Check for mobile on mount
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Calculate the width of one complete set of brands
  const singleSetWidth = React.useMemo(() => {
    if (!isMobile) {
      // Desktop: Each brand container width
      // h-8 w-16 md:h-10 md:w-20 lg:h-12 lg:w-24 + px-4 md:px-6 lg:px-8
      // Average: 80px width + 32px padding = 112px per brand
      return brands.length * 112;
    } else {
      // Mobile: h-6 w-12 + px-3 = 48px + 24px = 72px per brand
      return brands.length * 72;
    }
  }, [isMobile]);

  // Create enough duplicates to ensure seamless loop
  const duplicatedBrands = React.useMemo(() => {
    // We need at least 3 sets to ensure smooth infinite scrolling
    const minSets = Math.max(duplicates, 3);
    return Array(minSets).fill(brands).flat();
  }, [duplicates]);

  // Measure actual width after render for more accuracy
  const [actualSetWidth, setActualSetWidth] = React.useState(singleSetWidth);
  const [isReady, setIsReady] = React.useState(false);

  useEffect(() => {
    const measureWidth = () => {
      if (scrollContainerRef.current) {
        // Wait for images to load and DOM to be ready
        const firstBrandElement = scrollContainerRef.current.children[0] as HTMLElement;
        if (firstBrandElement) {
          const brandWidth = firstBrandElement.offsetWidth;
          const actualWidth = brandWidth * brands.length;
          setActualSetWidth(actualWidth);
          setIsReady(true);
        }
      }
    };

    // Initial measurement
    measureWidth();

    // Also measure on resize
    window.addEventListener('resize', measureWidth);
    
    // Retry measurement after a delay to ensure images are loaded
    const retryTimeout = setTimeout(measureWidth, 500);

    return () => {
      window.removeEventListener('resize', measureWidth);
      clearTimeout(retryTimeout);
    };
  }, [isMobile, duplicatedBrands]);

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

  // Animation logic with continuous movement
  const animate = useCallback(() => {
    if (!scrollContainerRef.current || isHovered) return;

    const pixelsPerSecond = actualSetWidth / effectiveSpeed;
    const pixelsPerFrame = pixelsPerSecond / 60; // 60 FPS

    setTranslateX(currentTranslateX => {
      let newTranslateX = currentTranslateX;
      
      if (direction === 'left') {
        newTranslateX -= pixelsPerFrame;
        // Reset when we've moved exactly one set width
        if (Math.abs(newTranslateX) >= actualSetWidth) {
          newTranslateX = 0;
        }
      } else {
        newTranslateX += pixelsPerFrame;
        // Reset when we've moved exactly one set width
        if (newTranslateX >= actualSetWidth) {
          newTranslateX = 0;
        }
      }
      
      return newTranslateX;
    });

    animationRef.current = requestAnimationFrame(animate);
  }, [direction, effectiveSpeed, actualSetWidth, isHovered]);

  // Start/stop animation
  useEffect(() => {
    // Small delay to ensure DOM is ready
    const startAnimation = () => {
      if (!isHovered && actualSetWidth > 0 && isReady) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      }
    };

    const timeoutId = setTimeout(startAnimation, 100);

    return () => {
      clearTimeout(timeoutId);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [animate, isHovered, actualSetWidth, isReady]);

  return (
    <div 
      ref={containerRef}
      className={cn(
        "relative w-full overflow-hidden bg-background/50 border-y border-border max-w-full",
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
        ref={scrollContainerRef}
        className="flex items-center py-2 md:py-3"
        style={{
          transform: `translateX(${translateX}px)`,
          willChange: 'transform',
        }}
      >
        {duplicatedBrands.map((brand: Brand, index: number) => {
          // Create unique key that includes the duplicate set number
          const setNumber = Math.floor(index / brands.length);
          const brandIndex = index % brands.length;
          const uniqueKey = `${brand.id}-set${setNumber}-${brandIndex}`;
          
          return (
            <BrandLogo
              key={uniqueKey}
              brand={brand}
              hasError={imageErrors.has(brand.id)}
              onError={() => handleImageError(brand.id)}
              onLoad={() => handleImageLoad(brand.id)}
              isMobile={isMobile}
            />
          );
        })}
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
  const [, setIsLoaded] = useState(false);

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
      duplicates={3}
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
