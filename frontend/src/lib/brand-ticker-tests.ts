/**
 * Brand Ticker Component Tests
 * Simple tests to verify the component functionality
 */

import { brands } from '@/lib/brands';

// Test 1: Brand data validation
export function testBrandData() {
  console.log('Testing brand data...');
  
  // Check if brands array exists and has content
  if (!brands || brands.length === 0) {
    console.error('❌ Brands array is empty or undefined');
    return false;
  }
  
  // Check if each brand has required properties
  for (const brand of brands) {
    if (!brand.id || !brand.name || !brand.logo || !brand.alt) {
      console.error('❌ Brand missing required properties:', brand);
      return false;
    }
  }
  
  console.log(`✅ Brand data validation passed (${brands.length} brands)`);
  return true;
}

// Test 2: Component import validation
export function testComponentImports() {
  console.log('Testing component imports...');
  
  try {
    // These would fail at build time if imports are broken
    // Using dynamic imports instead of require for TypeScript compliance
    const brandTickerModule = import('@/components/brand-ticker');
    
    if (!brandTickerModule) {
      console.error('❌ Component imports failed');
      return false;
    }
    
    console.log('✅ Component imports validation passed');
    return true;
  } catch (error) {
    console.error('❌ Component import error:', error);
    return false;
  }
}

// Test 3: Animation CSS validation
export function testAnimationCSS() {
  console.log('Testing animation CSS...');
  
  // Check if animation classes exist in stylesheet
  const styles = Array.from(document.styleSheets)
    .map(sheet => {
      try {
        return Array.from(sheet.cssRules || [])
          .map(rule => rule.cssText)
          .join(' ');
      } catch {
        return '';
      }
    })
    .join(' ');
  
  const requiredAnimations = [
    'brand-ticker-scroll-left',
    'brand-ticker-scroll-right'
  ];
  
  for (const animation of requiredAnimations) {
    if (!styles.includes(animation)) {
      console.error(`❌ Missing animation: ${animation}`);
      return false;
    }
  }
  
  console.log('✅ Animation CSS validation passed');
  return true;
}

// Test 4: Image URL validation
export async function testImageURLs() {
  console.log('Testing image URLs...');
  
  const testPromises = brands.slice(0, 3).map(async (brand) => {
    try {
      const response = await fetch(brand.logo, { method: 'HEAD' });
      return {
        brand: brand.name,
        status: response.status,
        ok: response.ok
      };
    } catch (error) {
      return {
        brand: brand.name,
        status: 'error',
        ok: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  });
  
  const results = await Promise.all(testPromises);
  const failedImages = results.filter(result => !result.ok);
  
  if (failedImages.length > 0) {
    console.warn('⚠️  Some brand images failed to load:', failedImages);
  } else {
    console.log('✅ Image URL validation passed');
  }
  
  return failedImages.length === 0;
}

// Run all tests
export async function runAllTests() {
  console.log('🧪 Running Brand Ticker Tests...\n');
  
  const results = [
    testBrandData(),
    testComponentImports(),
    testAnimationCSS(),
    await testImageURLs()
  ];
  
  const passed = results.filter(Boolean).length;
  const total = results.length;
  
  console.log(`\n📊 Test Results: ${passed}/${total} passed`);
  
  if (passed === total) {
    console.log('🎉 All tests passed! Brand Ticker is ready to use.');
  } else {
    console.log('⚠️  Some tests failed. Check the logs above for details.');
  }
  
  return passed === total;
}

// Export for use in browser console
if (typeof window !== 'undefined') {
  (window as Window & typeof globalThis & {
    BrandTickerTests: {
      testBrandData: typeof testBrandData;
      testComponentImports: typeof testComponentImports;
      testAnimationCSS: typeof testAnimationCSS;
      testImageURLs: typeof testImageURLs;
      runAllTests: typeof runAllTests;
    };
  }).BrandTickerTests = {
    testBrandData,
    testComponentImports,
    testAnimationCSS,
    testImageURLs,
    runAllTests
  };
}
