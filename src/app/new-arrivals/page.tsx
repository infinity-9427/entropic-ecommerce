import { Header } from '@/components/header';

export default function NewArrivalsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">New Arrivals</h1>
          <p className="text-xl text-gray-600 mb-8">Check out the latest products in our collection</p>
          
          <div className="bg-white p-8 rounded-lg shadow-sm">
            <div className="text-6xl mb-4">✨</div>
            <h2 className="text-2xl font-semibold mb-4">Fresh Products Coming Soon!</h2>
            <p className="text-gray-600">
              We're constantly adding new and exciting products to our store. 
              Stay tuned for the latest arrivals in technology, fashion, and lifestyle products.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
