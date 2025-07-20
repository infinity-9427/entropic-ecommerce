"""
RAG (Retrieval-Augmented Generation) Service
Professional prompt engineering with separated vector context and LLM prompts
"""

import os
import logging
import requests
import re
from typing import List, Dict, Any, Optional
from openai import OpenAI
from app.services.vector_service import VectorService
from app.services.prompt_templates import (
    ECommercePromptTemplates, 
    PromptType, 
    PromptFormatter,
    CategoryMapping
)
from app.models.models import Product
from sqlalchemy.orm import Session

logger = logging.getLogger(__name__)

class RAGService:
    """
    Retrieval-Augmented Generation service for intelligent product recommendations
    Combines vector similarity search with advanced language model responses
    """
    
    def __init__(self):
        """Initialize RAG service with vector search and OpenRouter client"""
        self.vector_service = VectorService()
        
        # Initialize OpenRouter client (compatible with OpenAI API)
        openrouter_api_key = os.getenv("OPEN_ROUTER_API_KEY")
        self.api_key = openrouter_api_key  # Store for direct API calls
        self.llm_model = os.getenv("LLM_MODEL", "qwen/qwen3-4b:free")
        
        if not openrouter_api_key:
            logger.warning("OPEN_ROUTER_API_KEY not found. RAG responses will be limited.")
            self.openai_client = None
        else:
            self.openai_client = OpenAI(
                api_key=openrouter_api_key,
                base_url="https://openrouter.ai/api/v1"
            )
        
        self.prompts = ECommercePromptTemplates()
        self.prompt_formatter = PromptFormatter()
        logger.info(f"RAG service initialized with model: {self.llm_model}")
    
    def generate_response(self, query: str, context_type: str = "recommendation") -> Dict[str, Any]:
        """
        Generate intelligent response using enhanced RAG approach with context analysis
        
        Args:
            query: Customer query/question
            context_type: Type of response needed ('recommendation', 'comparison', 'general', 'inquiry')
            
        Returns:
            Dictionary with response, metadata, and thought process
        """
        try:
            # Step 1: Analyze query to determine search strategy
            search_strategy = self._analyze_query_intent(query)
            
            # Step 2: Retrieve similar products using enhanced vector search
            similar_products = self._enhanced_product_search(query, search_strategy)
            
            # Step 3: Evaluate context quality and relevance
            context_analysis = self._analyze_context_quality(query, similar_products)
            
            # Step 4: Format products context for LLM
            products_context = self._format_products_context(similar_products)
            
            # Step 5: Select appropriate prompt template
            prompt_template = self._select_prompt_template(context_type, len(similar_products))
            
            # Step 6: Generate response using LLM with context awareness
            if self.openai_client and context_analysis['sufficient_context']:
                response_text = self._generate_llm_response(query, products_context, prompt_template)
            elif self.openai_client and len(similar_products) > 0:
                # Use LLM for clarification when we have products but low confidence
                response_text = self._generate_clarification_response(query, similar_products, context_analysis)
            else:
                response_text = self._generate_fallback_response(query, similar_products)
            
            return {
                "response": response_text,
                "products": similar_products,  # Changed from similar_products to products
                "products_found": len(similar_products),
                "similar_products": similar_products,  # Keep for backwards compatibility
                "context_type": context_type,
                "search_strategy": search_strategy,
                "context_analysis": context_analysis,
                "thought_process": context_analysis.get('thought_process', []),
                "success": True
            }
            
        except Exception as e:
            logger.error(f"Error generating RAG response: {str(e)}")
            return {
                "response": "I apologize, but I'm having trouble processing your request right now. Please try again or contact customer support.",
                "products": [],  # Add empty products array
                "products_found": 0,
                "similar_products": [],
                "context_type": context_type,
                "success": False,
                "error": str(e)
            }
    
    def _analyze_query_intent(self, query: str) -> Dict[str, Any]:
        """
        Analyze query to determine the best search strategy
        Similar to your query analysis logic
        """
        query_lower = query.lower()
        
        # Price range detection
        price_range = None
        if 'under' in query_lower or 'below' in query_lower:
            # Extract price from query (simplified)
            import re
            price_match = re.search(r'\$?(\d+)', query)
            if price_match:
                max_price = float(price_match.group(1))
                price_range = (0, max_price)
        
        # Category detection
        category_keywords = {
            'electronics': ['laptop', 'phone', 'computer', 'tablet', 'electronics'],
            'audio': ['headphones', 'speakers', 'audio', 'music'],
            'clothing': ['shirt', 'pants', 'clothing', 'apparel'],
            'books': ['book', 'novel', 'reading'],
        }
        
        detected_category = None
        for category, keywords in category_keywords.items():
            if any(keyword in query_lower for keyword in keywords):
                detected_category = category.title()
                break
        
        # Intent analysis
        intent = 'search'
        if any(word in query_lower for word in ['compare', 'vs', 'versus', 'difference']):
            intent = 'comparison'
        elif any(word in query_lower for word in ['recommend', 'suggest', 'best']):
            intent = 'recommendation'
        elif any(word in query_lower for word in ['help', 'support', 'how to']):
            intent = 'inquiry'
        
        return {
            'intent': intent,
            'category_filter': detected_category,
            'price_range': price_range,
            'search_scope': 'filtered' if (detected_category or price_range) else 'broad'
        }
    
    def _enhanced_product_search(self, query: str, strategy: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Enhanced product search with semantic expansion and related terms
        """
        try:
            # Step 1: Try direct search first
            products = self.vector_service.search_similar_products(
                query=query,
                limit=10,
                threshold=0.1,  # Lower threshold for broader results
                category_filter=strategy.get('category_filter'),
                price_range=strategy.get('price_range')
            )
            
            # Step 2: If few results, expand with related terms
            if len(products) < 3:
                expanded_queries = self._expand_search_query(query)
                
                for expanded_query in expanded_queries:
                    additional_products = self.vector_service.search_similar_products(
                        query=expanded_query,
                        limit=5,
                        threshold=0.2
                    )
                    
                    # Add products that aren't already in results
                    existing_ids = {p.get('id', p.get('product_id')) for p in products}
                    for product in additional_products:
                        product_id = product.get('id', product.get('product_id'))
                        if product_id not in existing_ids:
                            products.append(product)
                            existing_ids.add(product_id)
                    
                    if len(products) >= 8:  # Stop when we have enough results
                        break
            
            # Step 3: If still no results, try category-based search
            if len(products) == 0:
                category_suggestions = self._get_category_suggestions(query)
                for category in category_suggestions:
                    try:
                        category_products = self.vector_service.search_similar_products(
                            query=f"{category} products",
                            limit=5,
                            threshold=0.1
                        )
                        products.extend(category_products[:3])  # Add top 3 from each category
                        
                        if len(products) >= 6:
                            break
                    except:
                        continue
            
            return products[:10]  # Return top 10 results
            
        except Exception as e:
            logger.error(f"Error in enhanced product search: {str(e)}")
            return []
    
    def _expand_search_query(self, query: str) -> List[str]:
        """
        Expand search query with related terms and synonyms using centralized mapping
        """
        return self.prompts.get_query_expansions(query)
    
    def _get_category_suggestions(self, query: str) -> List[str]:
        """
        Get category suggestions based on query intent using centralized mapping
        """
        return self.prompts.get_category_suggestions(query)
    
    def _analyze_context_quality(self, query: str, products: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Analyze the quality and sufficiency of retrieved context
        Similar to your context evaluation logic
        """
        thought_process = []
        
        # Check if we have any products
        if not products:
            thought_process.append("No relevant products found in database")
            return {
                'sufficient_context': False,
                'confidence_score': 0.0,
                'thought_process': thought_process,
                'recommendation': 'clarify_query'
            }
        
        # Analyze relevance scores
        avg_similarity = sum(p.get('similarity', 0) for p in products) / len(products)
        max_similarity = max(p.get('similarity', 0) for p in products)
        
        thought_process.append(f"Found {len(products)} products with average relevance {avg_similarity:.2f}")
        
        # Context quality assessment
        if max_similarity < 0.3:
            thought_process.append("Low relevance scores suggest query might be too broad or specific")
            sufficient_context = False
            recommendation = 'suggest_alternatives'
        elif max_similarity < 0.6:
            thought_process.append("Moderate relevance - providing best matches with caveats")
            sufficient_context = True
            recommendation = 'provide_with_caveats'
        else:
            thought_process.append("High relevance scores - confident recommendations available")
            sufficient_context = True
            recommendation = 'confident_response'
        
        # Check category diversity
        categories = set(p.get('category', 'Unknown') for p in products)
        if len(categories) > 3:
            thought_process.append(f"Results span {len(categories)} categories - might need focus")
        
        return {
            'sufficient_context': sufficient_context,
            'confidence_score': max_similarity,
            'avg_relevance': avg_similarity,
            'thought_process': thought_process,
            'recommendation': recommendation,
            'category_diversity': len(categories)
        }
    
    def _generate_clarification_response(self, query: str, products: List[Dict[str, Any]], context_analysis: Dict[str, Any]) -> str:
        """
        Generate clarification response when context is insufficient
        """
        if not self.openai_client:
            return "I'm sorry, but our AI assistant is currently unavailable. Please try again later or contact customer support for assistance."
        
        clarification_prompt = f"""The customer asked: "{query}"

Context Analysis:
- Found {len(products)} potentially relevant products
- Confidence score: {context_analysis.get('confidence_score', 0):.2f}
- Analysis: {'; '.join(context_analysis.get('thought_process', []))}

Generate a helpful response that:
1. Acknowledges their request
2. Explains that we found some related products but wants to ensure we understand their needs
3. Asks 2-3 clarifying questions to better help them
4. Offers to show the best matches we found so far

Be conversational, helpful, and focused on understanding their specific needs."""

        try:
            response = self.openai_client.chat.completions.create(
                model=self.llm_model,
                messages=[
                    {"role": "system", "content": self.prompts.get_prompt(PromptType.SYSTEM)},
                    {"role": "user", "content": clarification_prompt}
                ],
                max_tokens=400,
                temperature=0.7
            )
            
            content = response.choices[0].message.content
            return content.strip() if content else "I apologize, but I'm having trouble generating a response right now. Please try again in a moment."
        except Exception as e:
            error_str = str(e).lower()
            logger.error(f"Error generating clarification response: {str(e)}")
            
            # Handle rate limiting specifically
            if "rate limit" in error_str or "429" in error_str:
                return "I'm experiencing high demand right now. Please try again in a minute - I'll be ready to help you find the perfect products!"
            
            # Handle other API errors directly
            elif "api" in error_str or "openrouter" in error_str:
                return "I'm having trouble connecting to our AI service at the moment. Please try again in a few minutes."
            
            # General error
            return "I'm experiencing some technical difficulties. Please try again shortly, and I'll be happy to help you!"
    
    def search_products_with_rag(self, query: str, filters: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Enhanced product search with RAG capabilities and metadata filtering
        
        Args:
            query: User's search query
            filters: Optional metadata filters
            
        Returns:
            Dictionary with products, context, and insights
        """
        try:
            # Analyze the query for better understanding
            query_intent = self._analyze_query_intent(query)
            
            # Extract metadata filters from query if not provided
            if not filters:
                filters = self._extract_filters_from_query(query)
            
            # Search products using enhanced vector search
            if filters:
                products = self.vector_service.search_with_metadata_filters(
                    query=query,
                    metadata_filters=filters,
                    limit=10
                )
            else:
                products = self.vector_service.search_similar_products(
                    query=query,
                    limit=10,
                    threshold=0.1  # Very low threshold for debugging
                )
            
            # Generate search analytics
            analytics = self.vector_service.get_search_analytics(query, products)
            
            # Create context for LLM response
            context = self._build_search_context(products, query_intent, analytics)
            
            # Generate intelligent response
            response = self._generate_search_response(query, context, query_intent)
            
            return {
                "products": products,
                "response": response,
                "analytics": analytics,
                "query_intent": query_intent,
                "filters_applied": filters,
                "context_quality": self._analyze_context_quality(query, products)
            }
            
        except Exception as e:
            logger.error(f"Error in enhanced product search: {str(e)}")
            return {
                "products": [],
                "response": "I apologize, but I encountered an error while searching for products. Please try again.",
                "analytics": {},
                "error": str(e)
            }
    
    def search_products_with_ai(self, query: str, category: Optional[str] = None) -> Dict[str, Any]:
        """
        AI-enhanced product search with natural language understanding
        
        Args:
            query: Natural language search query
            category: Optional category filter
            
        Returns:
            Dictionary with search results and AI insights
        """
        try:
            # Use category-specific search if category provided
            if category:
                products = self.vector_service.search_products_by_category(
                    category=category,
                    query=query,
                    limit=8
                )
            else:
                products = self.vector_service.search_similar_products(
                    query=query,
                    limit=8,
                    threshold=0.5
                )
            
            # Generate AI insights about the search results
            products_context = self._format_products_context(products)
            
            if self.openai_client and products:
                insights_prompt = f"""Analyze these search results for the query "{query}" and provide helpful insights:

Search Results:
{products_context}

Provide:
1. A brief summary of what was found
2. Key product categories or types represented
3. Price range overview
4. Any notable standout products
5. Suggestions for refining the search if needed

Keep it concise and customer-focused."""

                ai_insights = self._generate_llm_response(query, products_context, insights_prompt)
            else:
                ai_insights = f"Found {len(products)} products matching your search for '{query}'."
            
            return {
                "products": products,
                "ai_insights": ai_insights,
                "query": query,
                "category": category,
                "total_found": len(products),
                "success": True
            }
            
        except Exception as e:
            logger.error(f"Error in AI-enhanced search: {str(e)}")
            return {
                "products": [],
                "ai_insights": "Search is temporarily unavailable. Please try again.",
                "query": query,
                "category": category,
                "total_found": 0,
                "success": False,
                "error": str(e)
            }
    
    def _format_products_context(self, products: List[Dict[str, Any]]) -> str:
        """Format products data for LLM context using centralized formatter"""
        return self.prompt_formatter.format_product_context(products)
    
    def _select_prompt_template(self, context_type: str, num_products: int) -> str:
        """Select appropriate prompt template based on context using centralized templates"""
        if num_products == 0:
            return self.prompts.get_prompt(PromptType.NO_PRODUCTS_FOUND)
        
        if context_type == "comparison":
            return self.prompts.get_prompt(PromptType.PRODUCT_COMPARISON)
        elif context_type == "general":
            return self.prompts.get_prompt(PromptType.GENERAL_INQUIRY)
        else:
            return self.prompts.get_prompt(PromptType.PRODUCT_RECOMMENDATION)
    
    def _generate_llm_response(self, query: str, products_context: str, prompt_template: str) -> str:
        """Generate response using OpenAI LLM"""
        try:
            if not self.openai_client:
                return "I'm sorry, but our AI assistant is currently unavailable. Please try again later or contact customer support for assistance."
            
            # Format the prompt with query and context
            user_prompt = prompt_template.format(
                query=query,
                products_context=products_context
            )
            
            response = self.openai_client.chat.completions.create(
                model=self.llm_model,
                messages=[
                    {"role": "system", "content": self.prompts.get_prompt(PromptType.SYSTEM)},
                    {"role": "user", "content": user_prompt}
                ],
                max_tokens=500,
                temperature=0.7
            )
            
            content = response.choices[0].message.content
            return content.strip() if content else "I apologize, but I'm having trouble generating a response right now. Please try again in a moment."
            
        except Exception as e:
            error_str = str(e).lower()
            logger.error(f"Error generating LLM response: {str(e)}")
            
            # Handle rate limiting specifically
            if "rate limit" in error_str or "429" in error_str:
                return "I'm experiencing high demand right now. Please try again in a minute - I'll be ready to help you find the perfect products!"
            
            # Handle other API errors directly
            elif "api" in error_str or "openrouter" in error_str:
                return "I'm having trouble connecting to our AI service at the moment. Please try again in a few minutes."
            
            # General error
            return "I'm experiencing some technical difficulties. Please try again shortly, and I'll be happy to help you!"
    
    def _generate_fallback_response(self, query: str, products: List[Dict[str, Any]]) -> str:
        """Generate sales-oriented fallback response using centralized prompts"""
        if not products:
            # Use category-specific prompt for better responses
            category_prompt = self.prompts.get_category_specific_prompt(query)
            
            # For simple implementation, extract the key message from the prompt
            query_lower = query.lower()
            if any(word in query_lower for word in ['car', 'vehicle', 'auto', 'toyota', 'pickup', 'truck']):
                return "I'd love to help you with automotive needs! While we specialize in electronics, home goods, and lifestyle products, I can show you some great car accessories and electronics that might be useful for your vehicle. Could you tell me more about what specific automotive accessories or electronics you might need? We have charging solutions, tech accessories, and more!"
            elif any(word in query_lower for word in ['laptop', 'computer']):
                return f"Great question about {query}! I found some related electronics in our collection. While I search for more computer options, could you tell me more about what specific features you're looking for in a computer? I want to make sure I find you the perfect match!"
            else:
                return f"I'm excited to help you find what you're looking for! Let me check our amazing product selection for '{query}'. Could you tell me a bit more about your specific needs? I want to make sure I find you the perfect match from our available products!"
        
        # If we have products, check relevance and respond accordingly
        if products:
            max_similarity = max(p.get('similarity', 0) for p in products)
            
            if max_similarity < 0.5:
                query_lower = query.lower()
                
                if any(word in query_lower for word in ['car', 'vehicle', 'auto', 'toyota', 'pickup', 'truck']):
                    return "I'd love to help you with automotive needs! While we specialize in electronics, home goods, and lifestyle products, I can show you some great car accessories and electronics that might be useful for your vehicle. Could you tell me more about what specific automotive accessories or electronics you might need? We have charging solutions, tech accessories, and more!"
                elif any(word in query_lower for word in ['laptop', 'computer']):
                    return f"Great question about {query}! I found some related electronics in our collection. While I search for more computer options, you might be interested in our {', '.join([p.get('name', 'product') for p in products[:2]])}. Could you tell me more about what specific features you're looking for in a computer? I want to make sure I find you the perfect match!"
                else:
                    return f"Thanks for your interest in '{query}'! I found some products that might be related, but I want to make sure I understand exactly what you're looking for. Could you provide a bit more detail about your specific needs? I'm here to help you find the perfect product from our amazing selection!"
            
            # Good similarity - positive response
            product_names = [p.get('name', 'Amazing Product') for p in products[:3]]
            if len(products) == 1:
                return f"Perfect! I found an excellent option that might interest you: {product_names[0]}. While it may not be exactly what you searched for, it's a popular product in our electronics collection. Would you like to learn more about its features and pricing, or could you tell me more about what you're specifically looking for?"
            else:
                return f"Great! I found {len(products)} interesting options including {', '.join(product_names)}. These are popular products in our collection. Could you tell me more about your specific needs so I can better recommend the perfect match for you?"
        
        return f"I'm excited to help you find what you're looking for! Let me check our amazing product selection for '{query}'. Could you tell me a bit more about your specific needs? I want to make sure I find you the perfect match from our available products!"
    
    def update_product_embeddings(self, db: Session) -> Dict[str, Any]:
        """
        Update all product embeddings in the vector database
        
        Args:
            db: Database session
            
        Returns:
            Update statistics
        """
        try:
            # Simple implementation - update embeddings for all products
            from app.core.database import get_db
            
            db = next(get_db())
            products = db.query(Product).all()
            
            stats = {"processed": 0, "successful": 0, "failed": 0}
            
            for product in products:
                stats["processed"] += 1
                try:
                    # Create embedding and store
                    embedding = self.vector_service.create_product_embedding(product)
                    if self.vector_service.store_product_embedding(product, embedding):
                        stats["successful"] += 1
                    else:
                        stats["failed"] += 1
                except Exception as e:
                    logger.error(f"Error processing product {product.id}: {str(e)}")
                    stats["failed"] += 1
            
            logger.info(f"Product embeddings update completed: {stats}")
            return {
                "success": True,
                "statistics": stats,
                "message": f"Updated embeddings for {stats['successful']} products"
            }
        except Exception as e:
            logger.error(f"Error updating product embeddings: {str(e)}")
            return {
                "success": False,
                "statistics": {"processed": 0, "successful": 0, "failed": 0},
                "message": f"Failed to update embeddings: {str(e)}"
            }
    
    def _extract_filters_from_query(self, query: str) -> Dict[str, Any]:
        """Extract metadata filters from natural language query"""
        filters = {}
        query_lower = query.lower()
        
        # Extract price range
        import re
        price_patterns = [
            r'under \$?(\d+)',
            r'below \$?(\d+)',
            r'less than \$?(\d+)',
            r'between \$?(\d+) and \$?(\d+)',
            r'from \$?(\d+) to \$?(\d+)',
            r'\$?(\d+) to \$?(\d+)',
        ]
        
        for pattern in price_patterns:
            match = re.search(pattern, query_lower)
            if match:
                if 'between' in pattern or 'from' in pattern or ' to ' in pattern:
                    if len(match.groups()) >= 2:
                        filters['price_range'] = [int(match.group(1)), int(match.group(2))]
                else:
                    filters['price_range'] = [0, int(match.group(1))]
                break
        
        # Extract categories
        categories = ['clothing', 'electronics', 'shoes', 'accessories', 'sports', 'beauty', 'home']
        for category in categories:
            if category in query_lower:
                filters['category'] = category
                break
        
        # Extract brands
        brands = ['nike', 'adidas', 'apple', 'samsung', 'zara', 'puma', 'levis', 'under armour']
        for brand in brands:
            if brand in query_lower:
                filters['brand'] = brand
                break
        
        return filters
    
    def _build_search_context(self, products: List[Dict], query_intent: Dict, analytics: Dict) -> str:
        """Build rich context for LLM response generation"""
        if not products:
            return "No products were found matching the search criteria."
        
        context_parts = []
        
        # Add search summary
        context_parts.append(f"Search Results Summary:")
        context_parts.append(f"- Found {len(products)} products")
        context_parts.append(f"- Average relevance: {analytics.get('avg_similarity', 0):.2f}")
        context_parts.append(f"- Categories: {', '.join(analytics.get('categories_found', []))}")
        
        # Add price range if available
        price_range = analytics.get('price_range_found')
        if price_range:
            context_parts.append(f"- Price range: ${price_range[0]:.2f} - ${price_range[1]:.2f}")
        
        # Add top products
        context_parts.append("\nTop Products:")
        for i, product in enumerate(products[:5], 1):
            similarity = product.get('similarity', 0)
            context_parts.append(
                f"{i}. {product['name']} - ${product['price']:.2f} "
                f"({product['category']}) [Relevance: {similarity:.2f}]"
            )
        
        # Add insights
        insights = analytics.get('search_insights', [])
        if insights:
            context_parts.append(f"\nSearch Insights: {', '.join(insights)}")
        
        return '\n'.join(context_parts)
    
    def _generate_search_response(self, query: str, context: str, query_intent: Dict) -> str:
        """Generate intelligent response based on search context and intent"""
        intent_type = query_intent.get('type', 'general')
        
        # Customize prompt based on intent
        if intent_type == 'comparison':
            system_prompt = self.prompts.get_prompt(PromptType.PRODUCT_COMPARISON)
        elif intent_type == 'recommendation':
            system_prompt = self.prompts.get_prompt(PromptType.PRODUCT_RECOMMENDATION)
        elif intent_type == 'inquiry':
            system_prompt = self.prompts.get_prompt(PromptType.GENERAL_INQUIRY)
        else:
            system_prompt = self.prompts.get_prompt(PromptType.PRODUCT_RECOMMENDATION)
        
        user_prompt = f"""
        User Query: {query}
        Query Intent: {query_intent}
        Search Context: {context}
        
        Please provide a helpful response that addresses the user's query based on the search results.
        """
        
        try:
            response = requests.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "qwen/qwen-2.5-3b-instruct",
                    "messages": [
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt}
                    ],
                    "temperature": 0.7
                }
            )
            
            if response.status_code == 200:
                return response.json()["choices"][0]["message"]["content"]
            elif response.status_code == 429:
                return "I'm experiencing high demand right now. Please try again in a minute - I'll be ready to help you find the perfect products!"
            else:
                logger.error(f"OpenRouter API error: {response.status_code}")
                return "I'm having trouble connecting to our AI service at the moment. Please try again in a few minutes."
                
        except Exception as e:
            error_str = str(e).lower()
            logger.error(f"Error generating search response: {str(e)}")
            
            # Handle rate limiting specifically
            if "rate limit" in error_str or "429" in error_str:
                return "I'm experiencing high demand right now. Please try again in a minute - I'll be ready to help you find the perfect products!"
            
            # Handle other API errors directly
            elif "api" in error_str or "openrouter" in error_str:
                return "I'm having trouble connecting to our AI service at the moment. Please try again in a few minutes."
            
            # General error
            return "I'm experiencing some technical difficulties. Please try again shortly, and I'll be happy to help you!"
    
    def get_product_recommendations(self, product_id: str, limit: int = 5) -> Dict[str, Any]:
        """
        Get product recommendations based on a specific product
        
        Args:
            product_id: ID of the product to base recommendations on
            limit: Number of recommendations to return
            
        Returns:
            Dictionary with recommendations and context
        """
        try:
            # Get the target product from database
            from app.core.database import get_db
            db = next(get_db())
            target_product = db.query(Product).filter(Product.id == product_id).first()
            
            if not target_product:
                return {
                    "recommendations": [],
                    "response": "Product not found for recommendations."
                }
            
            # Create search query based on product
            search_query = f"{target_product.name} {target_product.category} {target_product.brand}"
            
            # Get similar products
            similar_products = self.vector_service.search_similar_products(
                query=search_query,
                limit=limit + 1  # +1 to exclude the original product
            )
            
            # Filter out the original product
            recommendations = [
                p for p in similar_products 
                if p.get('id') != product_id
            ][:limit]
            
            # Build context for recommendations
            context = self._build_recommendation_context(target_product, recommendations)
            
            # Generate recommendation response
            response = self._generate_recommendation_response(target_product, context)
            
            return {
                "recommendations": recommendations,
                "response": response,
                "target_product": {
                    "id": target_product.id,
                    "name": target_product.name,
                    "category": target_product.category
                }
            }
            
        except Exception as e:
            logger.error(f"Error getting recommendations: {str(e)}")
            return {
                "recommendations": [],
                "response": "I apologize, but I couldn't generate recommendations at this time."
            }
    
    def _build_recommendation_context(self, target_product, recommendations: List[Dict]) -> str:
        """Build context for product recommendations"""
        if not recommendations:
            return f"No similar products found for {target_product.name}"
        
        context_parts = [
            f"Based on {target_product.name} ({target_product.category} - ${target_product.price}):",
            "\nSimilar products:"
        ]
        
        for i, product in enumerate(recommendations, 1):
            similarity = product.get('similarity', 0)
            context_parts.append(
                f"{i}. {product['name']} - ${product['price']:.2f} "
                f"({product['category']}) [Similarity: {similarity:.2f}]"
            )
        
        return '\n'.join(context_parts)
    
    def _generate_recommendation_response(self, target_product, context: str) -> str:
        """Generate intelligent recommendation response"""
        system_prompt = self.prompts.get_prompt(PromptType.PRODUCT_RECOMMENDATION)
        
        user_prompt = f"""
        Target Product: {target_product.name} - ${target_product.price} ({target_product.category})
        Recommendation Context: {context}
        
        Please provide helpful product recommendations based on this target product.
        """
        
        try:
            response = requests.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "qwen/qwen-2.5-3b-instruct",
                    "messages": [
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt}
                    ],
                    "temperature": 0.7
                }
            )
            
            if response.status_code == 200:
                return response.json()["choices"][0]["message"]["content"]
            elif response.status_code == 429:
                return "I'm experiencing high demand right now. Please try again in a minute - I'll be ready to help you find the perfect products!"
            else:
                logger.error(f"OpenRouter API error: {response.status_code}")
                return "I'm having trouble connecting to our AI service at the moment. Please try again in a few minutes."
                
        except Exception as e:
            error_str = str(e).lower()
            logger.error(f"Error generating recommendation response: {str(e)}")
            
            # Handle rate limiting specifically
            if "rate limit" in error_str or "429" in error_str:
                return "I'm experiencing high demand right now. Please try again in a minute - I'll be ready to help you find the perfect products!"
            
            # Handle other API errors directly
            elif "api" in error_str or "openrouter" in error_str:
                return "I'm having trouble connecting to our AI service at the moment. Please try again in a few minutes."
            
            # General error
            return "I'm experiencing some technical difficulties. Please try again shortly, and I'll be happy to help you!"
