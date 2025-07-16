import { Header } from '@/components/header';
import { BrandTickerCompact } from '@/components/brand-ticker';

export default function DealsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Today's Deals</h1>
          <p className="text-xl text-muted-foreground mb-8">Discover amazing discounts on your favorite products</p>
          
          {/* Brand Ticker for deals page */}
          <BrandTickerCompact className="my-8" speed={20} />
          
          <div className="bg-card p-8 rounded-lg border">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-semibold mb-4">Great Deals Coming Soon!</h2>
            <p className="text-muted-foreground">
              We're working on bringing you the best deals and discounts. 
              Check back soon for amazing offers on electronics, sports gear, and home essentials.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
