import { 
  BrandTicker, 
  BrandTickerCompact,
  BrandTickerFast,
  BrandTickerSlow,
  BrandTickerReverse
} from '@/components/brand-ticker';

export default function BrandTickerDemo() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Brand Ticker Demos</h1>
        
        <div className="space-y-12">
          {/* Standard Brand Ticker */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Standard Brand Ticker</h2>
            <p className="text-muted-foreground mb-4">
              Full-featured ticker with gradient masks and hover pause
            </p>
            <BrandTicker />
          </section>

          {/* Fast Ticker */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Fast Brand Ticker</h2>
            <p className="text-muted-foreground mb-4">
              Faster animation speed (15 seconds)
            </p>
            <BrandTickerFast />
          </section>

          {/* Slow Ticker */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Slow Brand Ticker</h2>
            <p className="text-muted-foreground mb-4">
              Slower animation speed (45 seconds)
            </p>
            <BrandTickerSlow />
          </section>

          {/* Reverse Direction */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Reverse Direction</h2>
            <p className="text-muted-foreground mb-4">
              Animation flowing from left to right
            </p>
            <BrandTickerReverse />
          </section>

          {/* Compact Ticker */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Compact Brand Ticker</h2>
            <p className="text-muted-foreground mb-4">
              Smaller version without gradient masks
            </p>
            <BrandTickerCompact />
          </section>

          {/* No Hover Pause */}
          <section>
            <h2 className="text-xl font-semibold mb-4">No Hover Pause</h2>
            <p className="text-muted-foreground mb-4">
              Continuous animation that doesn&apos;t pause on hover
            </p>
            <BrandTicker pauseOnHover={false} />
          </section>

          {/* Custom Styling */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Custom Styling</h2>
            <p className="text-muted-foreground mb-4">
              Custom background and no gradient masks
            </p>
            <BrandTicker 
              className="bg-muted/50 rounded-lg"
              showGradientMask={false}
              speed={25}
            />
          </section>

          {/* Mobile Optimized */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Mobile Optimized</h2>
            <p className="text-muted-foreground mb-4">
              Automatically adjusts for mobile screens (resize to test)
            </p>
            <BrandTickerCompact direction="right" speed={20} />
          </section>
        </div>
        
        <div className="mt-16 grid md:grid-cols-2 gap-6">
          <div className="p-6 bg-muted/50 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Features</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Smooth infinite scrolling animation</li>
              <li>• Responsive design for all screen sizes</li>
              <li>• Theme-aware (light/dark mode)</li>
              <li>• Accessibility optimized</li>
              <li>• Hover pause functionality</li>
              <li>• Image fallback handling</li>
              <li>• Customizable speed and direction</li>
            </ul>
          </div>
          
          <div className="p-6 bg-muted/50 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Usage Tips</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Hover over any ticker to pause animation</li>
              <li>• Logos automatically adapt to theme</li>
              <li>• Failed images show fallback placeholder</li>
              <li>• Animation respects reduced-motion</li>
              <li>• Mobile optimized spacing and speed</li>
              <li>• Perfect for hero sections & footers</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
