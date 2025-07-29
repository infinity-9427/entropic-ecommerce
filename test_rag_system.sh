#!/bin/bash

echo "🧪 RAG System Test Suite"
echo "========================"

# Test 1: Backend health check
echo "1. Testing backend health..."
health=$(curl -s http://localhost:8000/rag/health | jq -r '.status')
if [ "$health" = "healthy" ]; then
    echo "   ✅ Backend is healthy"
else
    echo "   ❌ Backend health check failed"
    exit 1
fi

# Test 2: Product search with results
echo -e "\n2. Testing product search (should find results)..."
result=$(curl -s -X POST http://localhost:8000/rag/enhanced \
  -H "Content-Type: application/json" \
  -d '{"query": "headphones", "limit": 2}')

success=$(echo $result | jq -r '.success')
products_found=$(echo $result | jq -r '.products_found')

if [ "$success" = "true" ] && [ "$products_found" -gt 0 ]; then
    echo "   ✅ Found $products_found products for 'headphones'"
else
    echo "   ❌ Product search failed"
    exit 1
fi

# Test 3: Query with no results
echo -e "\n3. Testing query with no results..."
result=$(curl -s -X POST http://localhost:8000/rag/enhanced \
  -H "Content-Type: application/json" \
  -d '{"query": "toyota car", "limit": 2}')

success=$(echo $result | jq -r '.success')
products_found=$(echo $result | jq -r '.products_found')

if [ "$success" = "true" ] && [ "$products_found" = "0" ]; then
    echo "   ✅ Handled query with 0 results correctly"
else
    echo "   ❌ Failed to handle query with no results"
    exit 1
fi

# Test 4: Frontend API integration
echo -e "\n4. Testing frontend API integration..."
result=$(curl -s -X POST http://localhost:3000/api/rag-chat \
  -H "Content-Type: application/json" \
  -d '{"query": "wireless mouse"}')

success=$(echo $result | jq -r '.success')

if [ "$success" = "true" ]; then
    echo "   ✅ Frontend API integration working"
else
    echo "   ❌ Frontend API integration failed"
    exit 1
fi

echo -e "\n🎉 All tests passed! RAG system is fully functional."
echo -e "\n📋 Test Summary:"
echo "   ✅ Backend health check"
echo "   ✅ Product search with results" 
echo "   ✅ Query handling with no results"
echo "   ✅ Frontend API integration"
echo -e "\n💡 Your RAG system is ready for use!"
