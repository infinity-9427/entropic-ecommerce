# Brand Ticker Component

A smooth, infinite-scrolling horizontal ticker that displays brand logos, similar to a Wall Street stock ticker.

## Features

- 🔄 **Infinite scrolling**: Seamless continuous animation from right to left
- ⏸️ **Pause on hover**: Accessibility-friendly hover pause functionality
- 🌓 **Theme support**: Works with both light and dark themes
- 📱 **Responsive**: Adapts to different screen sizes
- 🖼️ **Fallback images**: Shows placeholder when brand logos fail to load
- ♿ **Accessible**: Includes proper ARIA labels and reduced motion support
- 🎨 **Customizable**: Configurable speed, styling, and gradient masks

## Usage

### Basic Usage

```tsx
import { BrandTicker } from '@/components/brand-ticker';

export default function HomePage() {
  return (
    <div>
      <BrandTicker />
    </div>
  );
}
```

### With Custom Props

```tsx
import { BrandTicker, BrandTickerCompact } from '@/components/brand-ticker';

export default function HomePage() {
  return (
    <div>
      {/* Standard ticker with custom speed */}
      <BrandTicker 
        speed={20} 
        className="my-8" 
        pauseOnHover={true}
        showGradientMask={true}
      />
      
      {/* Compact version for smaller spaces */}
      <BrandTickerCompact 
        speed={15}
        className="border-t"
      />
    </div>
  );
}
```

## Props

### BrandTicker

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | `string` | `undefined` | Additional CSS classes |
| `speed` | `number` | `30` | Animation duration in seconds for one complete cycle |
| `pauseOnHover` | `boolean` | `true` | Whether to pause animation on hover |
| `showGradientMask` | `boolean` | `true` | Whether to show fade-out gradient masks on edges |

### BrandTickerCompact

Same as `BrandTicker` but without `showGradientMask` prop (always false) and different default styling.

## Customization

### Adding/Modifying Brands

Edit the brands data in `/src/lib/brands.ts`:

```typescript
export const brands: Brand[] = [
  {
    id: "1",
    name: "Your Brand",
    logo: "https://example.com/logo.png",
    alt: "Your Brand logo"
  },
  // ... more brands
];
```

### Styling

The component uses CSS custom properties for easy theming:

```css
.brand-ticker-scroll {
  --scroll-duration: 30s; /* Controlled by speed prop */
}
```

### Theme Integration

The component automatically adapts to your theme:

- **Light theme**: Logos are inverted to black
- **Dark theme**: Logos remain in their original colors
- Uses theme-aware background and border colors

## Accessibility

- **ARIA labels**: Proper `role="marquee"` and `aria-label` attributes
- **Reduced motion**: Respects `prefers-reduced-motion` media query
- **Keyboard navigation**: Hover states work with focus
- **Screen readers**: Each brand logo has descriptive alt text

## Technical Details

### Animation Strategy

The component uses CSS animations with `transform: translateX()` for smooth, hardware-accelerated scrolling. It creates three copies of the brand array to ensure seamless infinite looping.

### Performance

- **Lazy loading**: Brand images are loaded lazily
- **Error handling**: Failed images fallback to placeholder
- **Optimized rendering**: Uses Next.js Image component with proper sizing

### Browser Support

Works in all modern browsers that support:
- CSS custom properties
- CSS transforms
- CSS animations
- Intersection Observer (for lazy loading)

## Examples

### Home Page Hero

```tsx
<section className="bg-background">
  <div className="container mx-auto px-4 py-12">
    <h1>Welcome to Our Store</h1>
    <p>Discover products from world-class brands</p>
  </div>
  <BrandTicker className="mb-8" />
</section>
```

### Category Page

```tsx
<BrandTickerCompact 
  speed={25}
  className="border-y my-6"
/>
```

### Footer

```tsx
<footer>
  <BrandTicker 
    speed={40}
    showGradientMask={false}
    className="border-t border-b-0 bg-muted/20"
  />
</footer>
```

## Troubleshooting

### Images Not Loading
- Check that brand URLs are accessible
- Verify CORS headers if loading from external domains
- Ensure placeholder SVG exists at `/public/placeholder-brand.svg`

### Animation Not Smooth
- Verify CSS animations are enabled in `globals.css`
- Check for conflicting CSS that might override transforms
- Ensure the component isn't inside a container with `overflow: hidden` without proper width

### Performance Issues
- Reduce the number of brands if needed
- Consider using smaller, optimized images
- Check if other CSS animations are conflicting
