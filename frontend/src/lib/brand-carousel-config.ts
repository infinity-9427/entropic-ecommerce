export interface BrandTickerConfig {
  speed: number;
  pauseOnHover: boolean;
  showGradientMask: boolean;
  direction: 'left' | 'right';
  duplicates: number;
}

export const BRAND_TICKER_CONFIGS = {
  default: {
    speed: 30,
    pauseOnHover: true,
    showGradientMask: true,
    direction: 'left' as const,
    duplicates: 3
  },
  fast: {
    speed: 15,
    pauseOnHover: true,
    showGradientMask: true,
    direction: 'left' as const,
    duplicates: 3
  },
  slow: {
    speed: 45,
    pauseOnHover: true,
    showGradientMask: true,
    direction: 'left' as const,
    duplicates: 3
  },
  compact: {
    speed: 25,
    pauseOnHover: true,
    showGradientMask: false,
    direction: 'left' as const,
    duplicates: 3
  },
  reverse: {
    speed: 30,
    pauseOnHover: true,
    showGradientMask: true,
    direction: 'right' as const,
    duplicates: 3
  }
} as const;

export type BrandTickerPreset = keyof typeof BRAND_TICKER_CONFIGS;