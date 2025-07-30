import Link from 'next/link';
import Image from 'next/image';
import { RiArrowLeftLine, RiHomeLine, RiSearchLine } from '@remixicon/react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-lg w-full text-center">
        <div className="flex justify-center items-center mb-8">
          <div className="relative w-48 h-48 md:w-64 md:h-64">
            <Image
              src="/404.webp"
              alt="404 Not Found"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>
        
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">404</h1>
        <h2 className="text-xl md:text-2xl font-semibold text-gray-800 mb-4">Page Not Found</h2>
        <p className="text-gray-600 mb-8 px-4">
          Oops! The page you're looking for doesn't exist or has been moved. Let's get you back on track.
        </p>
        
        <div className="space-y-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-md hover:shadow-lg"
          >
            <RiHomeLine className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}