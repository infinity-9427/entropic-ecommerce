'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { RiErrorWarningLine, RiRefreshLine, RiHomeLine } from '@remixicon/react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="flex justify-center items-center mb-6">
          <div className="bg-red-500 rounded-full p-4">
            <RiErrorWarningLine className="w-12 h-12 text-white" />
          </div>
        </div>
        
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Oops!</h1>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Something went wrong</h2>
        <p className="text-gray-600 mb-8">
          We encountered an unexpected error. Don't worry, we're working to fix it.
        </p>
        
        <div className="space-y-4">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium w-full justify-center"
          >
            <RiRefreshLine className="w-4 h-4" />
            Try Again
          </button>
          
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium w-full justify-center"
          >
            <RiHomeLine className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
        
        {error.digest && (
          <p className="text-xs text-gray-400 mt-4">
            Error ID: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}
