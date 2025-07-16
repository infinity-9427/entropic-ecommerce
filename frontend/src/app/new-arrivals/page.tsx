import { Header } from '@/components/header';

export default function NewArrivalsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-6 pt-40">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">New Arrivals</h1>
          <p className="text-xl text-muted-foreground mb-8">Check out the latest products in our collection</p>
          
          <div className="bg-card p-8 rounded-lg border">
            <div className="text-6xl mb-4">✨</div>
            <h2 className="text-2xl font-semibold mb-4">Fresh Products Coming Soon!</h2>
            <p className="text-muted-foreground">
              We're constantly adding new and exciting products to our store. 
              Stay tuned for the latest arrivals in technology, fashion, and lifestyle products.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
