import { Header } from '@/components/header';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8 pt-40">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">Contact Us</h1>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-2xl font-semibold mb-6">Get in Touch</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Address</h3>
                  <p className="text-gray-600">123 Entropic Street<br />Commerce City, CC 12345</p>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Phone</h3>
                  <p className="text-gray-600">+1 (555) 123-4567</p>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Email</h3>
                  <p className="text-gray-600">support@entropic.com</p>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Business Hours</h3>
                  <p className="text-gray-600">
                    Monday - Friday: 9:00 AM - 8:00 PM<br />
                    Saturday - Sunday: 10:00 AM - 6:00 PM
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-2xl font-semibold mb-6">Send us a Message</h2>
              <p className="text-gray-600">
                Have a question or need assistance? We&apos;d love to hear from you! 
                Our customer service team is here to help with any inquiries about 
                our products, orders, or services.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
