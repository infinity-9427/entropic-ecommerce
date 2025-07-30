import Link from 'next/link'
import 'remixicon/fonts/remixicon.css';
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin, CreditCard, Truck, Shield, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      {/* Newsletter Section - Compact */}
      <div className="border-b border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="text-center md:text-left">
              <h3 className="text-lg font-semibold mb-1">Stay Updated</h3>
              <p className="text-gray-400 text-sm">Get the latest deals and new product announcements</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
              <Input 
                type="email" 
                placeholder="Enter your email" 
                className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-400 text-sm"
              />
              <Button className="bg-primary hover:bg-primary/90 text-sm px-6">
                Subscribe
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content - Compact */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Company Info - Condensed */}
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <span className="font-bold text-xl bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent drop-shadow-lg tracking-wide">
                Entropic
              </span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Quality products at amazing prices with exceptional service and fast delivery.
            </p>
            <div className="flex space-x-3">
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                <Facebook className="h-4 w-4" />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="h-4 w-4" />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                <Instagram className="h-4 w-4" />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                <Youtube className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Shop Links - Compact */}
          <div className="space-y-3">
            <h4 className="font-semibold text-base">Shop</h4>
            <ul className="space-y-1">
              <li>
                <Link href="/products?category=Electronics" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Electronics
                </Link>
              </li>
              <li>
                <Link href="/products?category=Sports" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Sports & Outdoors
                </Link>
              </li>
              <li>
                <Link href="/products?category=Home" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Home & Garden
                </Link>
              </li>
              <li>
                <Link href="/deals" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Today&apos;s Deals
                </Link>
              </li>
              <li>
                <Link href="/new-arrivals" className="text-gray-400 hover:text-white transition-colors text-sm">
                  New Arrivals
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service - Compact */}
          <div className="space-y-3">
            <h4 className="font-semibold text-base">Customer Service</h4>
            <ul className="space-y-1">
              <li>
                <Link href="/contact" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Shipping Info
                </Link>
              </li>
              <li>
                <Link href="/returns" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Returns & Exchanges
                </Link>
              </li>
              <li>
                <Link href="/track-order" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Track Your Order
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-gray-400 hover:text-white transition-colors text-sm">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info - Compact */}
          <div className="space-y-3">
            <h4 className="font-semibold text-base">Contact</h4>
            <div className="space-y-2">
              <div className="flex items-start space-x-2">
                <MapPin className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <div className="text-gray-400 text-sm">
                  <p>123 Entropic Street</p>
                  <p>Commerce City, CC 12345</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-primary flex-shrink-0" />
                <span className="text-gray-400 text-sm">+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-primary flex-shrink-0" />
                <span className="text-gray-400 text-sm">support@entropic.com</span>
              </div>
            </div>
            <div className="pt-2">
              <h5 className="font-medium text-sm mb-1">Hours</h5>
              <p className="text-gray-400 text-xs">
                Mon-Fri: 9AM-8PM | Sat-Sun: 10AM-6PM
              </p>
            </div>
          </div>
        </div>

        {/* Features Section - Compact */}
        <div className="border-t border-gray-800 mt-6 pt-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center space-x-2">
              <Truck className="h-6 w-6 text-primary" />
              <div>
                <h6 className="font-medium text-sm">Free Shipping</h6>
                <p className="text-gray-400 text-xs">On orders over $50</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <RotateCcw className="h-6 w-6 text-primary" />
              <div>
                <h6 className="font-medium text-sm">Easy Returns</h6>
                <p className="text-gray-400 text-xs">30-day return policy</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Shield className="h-6 w-6 text-primary" />
              <div>
                <h6 className="font-medium text-sm">Secure Payment</h6>
                <p className="text-gray-400 text-xs">100% secure checkout</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <CreditCard className="h-6 w-6 text-primary" />
              <div>
                <h6 className="font-medium text-sm">Payment Options</h6>
                <p className="text-gray-400 text-xs">Multiple payment methods</p>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Methods - Compact */}
        <div className="border-t border-gray-800 mt-4 pt-4">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-3">
            <div>
              <h6 className="font-medium mb-2 text-sm">We Accept</h6>
              <div className="flex space-x-2">
                <div className="bg-white p-1.5 rounded">
                  <div className="w-6 h-4 bg-blue-600 rounded text-white text-xs flex items-center justify-center font-bold">
                    VISA
                  </div>
                </div>
                <div className="bg-white p-1.5 rounded">
                  <div className="w-6 h-4 bg-red-600 rounded text-white text-xs flex items-center justify-center font-bold">
                    MC
                  </div>
                </div>
                <div className="bg-white p-1.5 rounded">
                  <div className="w-6 h-4 bg-blue-500 rounded text-white text-xs flex items-center justify-center font-bold">
                    AMEX
                  </div>
                </div>
                <div className="bg-white p-1.5 rounded">
                  <div className="w-6 h-4 bg-yellow-500 rounded text-white text-xs flex items-center justify-center font-bold">
                    PP
                  </div>
                </div>
              </div>
            </div>
            <div className="text-center lg:text-right">
              <h6 className="font-medium mb-2 text-sm">Quick Links</h6>
              <div className="flex flex-wrap gap-3 text-xs">
                <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
                <Link href="/terms" className="text-gray-400 hover:text-white transition-colors">
                  Terms of Service
                </Link>
                <Link href="/sitemap" className="text-gray-400 hover:text-white transition-colors">
                  Sitemap
                </Link>
                <Link href="/accessibility" className="text-gray-400 hover:text-white transition-colors">
                  Accessibility
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar - Compact */}
      <div className="border-t border-gray-800">
        <div className="container mx-auto px-4 py-3">
          <div className="flex flex-col md:flex-row justify-between items-center gap-2 text-xs text-gray-400">
            <p>&copy; 2025 Entropic. All rights reserved.</p>
            <div className="flex flex-col md:flex-row items-center gap-1 md:gap-3">
              <p>Designed with <i className="ri-heart-line text-red-500"></i> for amazing shopping experiences</p>
              <span className="hidden md:inline">•</span>
              <p className="text-sm">
                Created by{' '}
                <Link 
                  href="https://www.theinfinitydev.com/en" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-300 hover:text-blue-200 transition-colors font-semibold"
                >
                  infinity dev
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
