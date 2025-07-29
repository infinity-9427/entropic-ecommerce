"""
Enhanced RAG Service for E-commerce Product Recommendations
Integrates Ollama (Llama3) with Supabase pgvector for intelligent product search and recommendations
"""

import os
import json
import logging
import time
import requests
from typing import List, Dict, Any, Optional, Tuple
from sentence_transformers import SentenceTransformer
from supabase import create_client, Client
import numpy as np
from datetime import datetime

from app.services.neon_vector_service import NeonVectorService
from app.services.prompt_templates import ECommercePromptTemplates, PromptType, PromptFormatter

logger = logging.getLogger(__name__)

class EnhancedRAGService:
    """
    Enhanced RAG service combining vector similarity search with Ollama Llama3 for intelligent e-commerce responses
    Similar to the example code but adapted for your Neon + Ollama setup
    """
    
    def __init__(self):
        """Initialize Enhanced RAG service with Ollama and vector search capabilities"""
        
        # Initialize vector service for product search
        self.vector_service = NeonVectorService()
        
        # Initialize Ollama client configuration
        self.ollama_base_url = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
        self.ollama_model = os.getenv("OLLAMA_MODEL", "llama3:latest")  # Use full model name
        
        # Initialize prompt templates
        self.prompts = ECommercePromptTemplates()
        self.prompt_formatter = PromptFormatter()
        
        # Configuration parameters
        self.default_similarity_threshold = 0.2  # Lowered for better product discovery
        self.max_products_to_retrieve = 10
        self.max_context_length = 4000
        
        logger.info(f"Enhanced RAG service initialized with Ollama URL: {self.ollama_base_url}, Model: {self.ollama_model}")
    
    def generate_ecommerce_response(self, query: str, limit: int = 5, threshold: Optional[float] = None) -> Dict[str, Any]:
        """
        Generate intelligent e-commerce response using enhanced RAG approach
        Similar to the example implementation but adapted for your stack
        
        Args:
            query: Customer query/question
            limit: Maximum number of products to include
            threshold: Minimum similarity threshold for products
            
        Returns:
            Dictionary with response, products, and analysis metadata
        """
        start_time = time.time()
        
        try:
            # Step 1: Analyze customer intent and query
            intent_analysis = self._analyze_customer_intent(query)
            
            # Step 2: Extract search parameters from query
            search_params = self._extract_search_parameters(query)
            
            # Step 3: Retrieve relevant products using vector search
            similar_products = self._enhanced_product_retrieval(
                query=query,
                intent=intent_analysis,
                search_params=search_params,
                limit=limit,
                threshold=threshold or self.default_similarity_threshold
            )
            
            # Step 4: Evaluate context quality and determine response strategy
            context_analysis = self._evaluate_context_quality(query, similar_products, intent_analysis)
            
            # Step 5: Format product context for LLM
            products_context = self._format_product_context_for_llm(similar_products)
            
            # Step 6: Generate intelligent response using Ollama
            ai_response = self._generate_ollama_response(
                query=query,
                products_context=products_context,
                intent=intent_analysis,
                context_analysis=context_analysis
            )
            
            # Step 7: Calculate confidence score
            confidence_score = self._calculate_confidence_score(
                similar_products, context_analysis, intent_analysis
            )
            
            elapsed_time = time.time() - start_time
            
            return {
                "success": True,
                "query": query,
                "intent": intent_analysis["primary_intent"],
                "products": similar_products,
                "ai_response": ai_response,
                "confidence": confidence_score,
                "context_analysis": context_analysis,
                "search_params": search_params,
                "processing_time": elapsed_time,
                "products_found": len(similar_products),
                "thought_process": context_analysis.get("thought_process", [])
            }
            
        except Exception as e:
            logger.error(f"Error in enhanced RAG generation: {str(e)}")
            return {
                "success": False,
                "query": query,
                "intent": "unknown",
                "products": [],
                "ai_response": self._generate_fallback_response(query),
                "confidence": 0.0,
                "error": str(e),
                "processing_time": time.time() - start_time,
                "products_found": 0
            }
    
    def _analyze_customer_intent(self, query: str) -> Dict[str, Any]:
        """
        Analyze customer intent similar to query analysis in the example
        
        Args:
            query: Customer query text
            
        Returns:
            Dictionary with intent analysis results
        """
        query_lower = query.lower()
        
        # Intent classification
        intent_patterns = {
            "product_search": ["need", "want", "looking for", "find", "search", "show me"],
            "comparison": ["compare", "vs", "versus", "difference", "better", "which"],
            "recommendation": ["recommend", "suggest", "best", "top", "should i"],
            "price_inquiry": ["price", "cost", "cheap", "expensive", "budget", "under", "below"],
            "feature_inquiry": ["features", "specs", "specifications", "details", "about"],
            "availability": ["available", "in stock", "delivery", "shipping", "when"],
            "support": ["help", "support", "how to", "problem", "issue", "not working"]
        }
        
        detected_intents = []
        for intent, patterns in intent_patterns.items():
            if any(pattern in query_lower for pattern in patterns):
                detected_intents.append(intent)
        
        primary_intent = detected_intents[0] if detected_intents else "general_inquiry"
        
        # Extract key entities
        entities = self._extract_entities(query_lower)
        
        # Determine urgency level
        urgency_indicators = ["urgent", "asap", "immediately", "right now", "quickly"]
        urgency = "high" if any(indicator in query_lower for indicator in urgency_indicators) else "normal"
        
        return {
            "primary_intent": primary_intent,
            "all_intents": detected_intents,
            "entities": entities,
            "urgency": urgency,
            "query_complexity": "complex" if len(query.split()) > 10 else "simple"
        }
    
    def _extract_entities(self, query_lower: str) -> Dict[str, Any]:
        """Extract key entities from query similar to the example's entity extraction"""
        
        # Category detection
        categories = {
            "electronics": ["laptop", "phone", "computer", "tablet", "electronics", "smartphone", "device"],
            "clothing": ["shirt", "pants", "dress", "jacket", "clothing", "apparel", "wear"],
            "shoes": ["shoes", "sneakers", "boots", "sandals", "footwear", "running"],
            "sports": ["sports", "fitness", "exercise", "gym", "athletic", "workout"],
            "home": ["home", "kitchen", "furniture", "decor", "appliances"],
            "beauty": ["beauty", "makeup", "skincare", "cosmetics", "fragrance"]
        }
        
        detected_category = None
        for category, keywords in categories.items():
            if any(keyword in query_lower for keyword in keywords):
                detected_category = category
                break
        
        # Brand detection
        brands = ["nike", "adidas", "apple", "samsung", "zara", "puma", "levis", "under armour"]
        detected_brand = None
        for brand in brands:
            if brand in query_lower:
                detected_brand = brand
                break
        
        # Price range extraction
        import re
        price_patterns = [
            r'under \$?(\d+)',
            r'below \$?(\d+)',
            r'less than \$?(\d+)',
            r'between \$?(\d+) and \$?(\d+)',
            r'from \$?(\d+) to \$?(\d+)',
            r'\$?(\d+) to \$?(\d+)',
        ]
        
        price_range = None
        for pattern in price_patterns:
            match = re.search(pattern, query_lower)
            if match:
                if 'between' in pattern or 'from' in pattern or ' to ' in pattern:
                    if len(match.groups()) >= 2:
                        price_range = [int(match.group(1)), int(match.group(2))]
                else:
                    price_range = [0, int(match.group(1))]
                break
        
        return {
            "category": detected_category,
            "brand": detected_brand,
            "price_range": price_range,
            "has_size_requirement": any(size in query_lower for size in ["small", "medium", "large", "xl", "size"]),
            "has_color_requirement": any(color in query_lower for color in ["red", "blue", "black", "white", "green"])
        }
    
    def _extract_search_parameters(self, query: str) -> Dict[str, Any]:
        """Extract search parameters from natural language query"""
        
        query_lower = query.lower()
        
        # Quality indicators
        quality_high = any(word in query_lower for word in ["best", "premium", "high quality", "top", "excellent"])
        quality_budget = any(word in query_lower for word in ["cheap", "budget", "affordable", "low cost"])
        
        # Gender targeting
        gender = None
        if any(word in query_lower for word in ["men", "male", "guys", "him"]):
            gender = "men"
        elif any(word in query_lower for word in ["women", "female", "ladies", "her"]):
            gender = "women"
        elif any(word in query_lower for word in ["kids", "children", "child"]):
            gender = "kids"
        
        # Usage context
        usage_contexts = {
            "work": ["work", "office", "professional", "business"],
            "casual": ["casual", "everyday", "daily", "regular"],
            "sports": ["running", "gym", "fitness", "exercise", "athletic"],
            "formal": ["formal", "elegant", "dressy", "fancy"]
        }
        
        detected_usage = None
        for usage, keywords in usage_contexts.items():
            if any(keyword in query_lower for keyword in keywords):
                detected_usage = usage
                break
        
        return {
            "quality_preference": "high" if quality_high else ("budget" if quality_budget else "standard"),
            "gender_target": gender,
            "usage_context": detected_usage,
            "sort_preference": "price_low" if "cheap" in query_lower else ("rating" if "best" in query_lower else "relevance")
        }
    
    def _enhanced_product_retrieval(self, query: str, intent: Dict[str, Any], search_params: Dict[str, Any], 
                                  limit: int, threshold: float) -> List[Dict[str, Any]]:
        """
        Enhanced product retrieval using vector search with intent-aware filtering
        Similar to the example's enhanced search but adapted for your vector service
        """
        
        try:
            # Primary search using vector similarity
            products = self.vector_service.search_similar_products(
                query=query,
                limit=limit * 2,  # Get more initially for filtering
                threshold=threshold * 0.8,  # Lower threshold for broader search
                category_filter=intent["entities"].get("category"),
                price_range=tuple(intent["entities"]["price_range"]) if intent["entities"]["price_range"] else None
            )
            
            # If few results, try query expansion
            if len(products) < 3:
                expanded_queries = self._expand_query(query, intent)
                for expanded_query in expanded_queries:
                    additional_products = self.vector_service.search_similar_products(
                        query=expanded_query,
                        limit=5,
                        threshold=threshold * 0.6
                    )
                    
                    # Merge results avoiding duplicates
                    existing_ids = {p.get('id', p.get('product_id')) for p in products}
                    for product in additional_products:
                        product_id = product.get('id', product.get('product_id'))
                        if product_id not in existing_ids:
                            products.append(product)
                            existing_ids.add(product_id)
                    
                    if len(products) >= limit:
                        break
            
            # Apply intent-based filtering and ranking
            filtered_products = self._apply_intent_based_filtering(products, intent, search_params)
            
            return filtered_products[:limit]
            
        except Exception as e:
            logger.error(f"Error in enhanced product retrieval: {str(e)}")
            return []
    
    def _expand_query(self, query: str, intent: Dict[str, Any]) -> List[str]:
        """Expand query with synonyms and related terms"""
        
        base_query = query.lower()
        expanded = []
        
        # Essential product synonyms and related terms
        synonyms = {
            # Computer-related terms
            "computer": ["laptop", "pc", "notebook", "ultrabook", "gaming laptop"],
            "laptop": ["computer", "notebook", "ultrabook", "pc"],
            "pc": ["computer", "laptop", "desktop"],
            
            # Audio/Music-related terms  
            "music": ["headphones", "audio", "speaker", "sound", "wireless headphones", "bluetooth speaker"],
            "audio": ["headphones", "speaker", "sound", "music", "wireless headphones"],
            "listen": ["headphones", "audio", "speaker", "music", "wireless headphones"],
            "sound": ["headphones", "speaker", "audio", "music", "wireless headphones"],
            "hear": ["headphones", "audio", "speaker", "music"],
            
            # Gaming-related terms
            "gaming": ["mouse", "keyboard", "laptop", "monitor", "headphones"],
            "game": ["gaming", "mouse", "keyboard", "laptop", "monitor"],
            
            # Phone-related terms
            "phone": ["smartphone", "mobile", "cell phone"],
            "smartphone": ["phone", "mobile"],
            
            # General tech terms
            "wireless": ["headphones", "mouse", "speaker", "bluetooth"],
            "bluetooth": ["headphones", "speaker", "wireless"],
        }
        
        # Add direct synonyms
        for term, synonyms_list in synonyms.items():
            if term in base_query:
                expanded.extend(synonyms_list)
        
        # Category-based expansion
        category = intent["entities"].get("category")
        if category == "electronics":
            if "laptop" in base_query:
                expanded.extend(["computer", "notebook", "ultrabook"])
            elif "phone" in base_query:
                expanded.extend(["smartphone", "mobile", "cell phone"])
        elif category == "clothing":
            if "shirt" in base_query:
                expanded.extend(["top", "blouse", "tee"])
        elif category == "shoes":
            if "running" in base_query:
                expanded.extend(["athletic shoes", "sneakers", "trainers"])
        
        # Intent-based expansion
        primary_intent = intent["primary_intent"]
        if primary_intent == "recommendation":
            expanded.append(f"best {query}")
            expanded.append(f"top rated {query}")
        elif primary_intent == "price_inquiry":
            expanded.append(f"affordable {query}")
            expanded.append(f"budget {query}")
        
        # Remove duplicates and limit results
        expanded = list(set(expanded))
        return expanded[:5]  # Increased limit for better coverage
    
    def _apply_intent_based_filtering(self, products: List[Dict[str, Any]], 
                                    intent: Dict[str, Any], search_params: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Apply filtering based on detected intent and search parameters"""
        
        if not products:
            return products
        
        filtered = products.copy()
        
        # Filter by quality preference
        quality_pref = search_params.get("quality_preference")
        if quality_pref == "high":
            # Prefer higher-priced items as proxy for quality
            filtered = sorted(filtered, key=lambda p: p.get('price', 0), reverse=True)
        elif quality_pref == "budget":
            # Prefer lower-priced items
            filtered = sorted(filtered, key=lambda p: p.get('price', float('inf')))
        
        # Filter by gender if specified
        gender_target = search_params.get("gender_target")
        if gender_target:
            # This would need to be implemented based on your product data structure
            # For now, we'll use category and name hints
            gender_filtered = []
            for product in filtered:
                product_name = product.get('name', '').lower()
                if (gender_target == "women" and any(word in product_name for word in ["women", "ladies", "female"])) or \
                   (gender_target == "men" and any(word in product_name for word in ["men", "male", "guys"])) or \
                   gender_target not in ["women", "men"]:
                    gender_filtered.append(product)
            filtered = gender_filtered if gender_filtered else filtered
        
        return filtered
    
    def _evaluate_context_quality(self, query: str, products: List[Dict[str, Any]], 
                                 intent: Dict[str, Any]) -> Dict[str, Any]:
        """
        Evaluate context quality similar to the example's context analysis
        """
        
        thought_process = []
        
        # Basic product availability check
        if not products:
            thought_process.append("No relevant products found in database")
            return {
                "sufficient_context": False,
                "confidence_level": "low",
                "recommendation_strategy": "clarify_needs",
                "thought_process": thought_process,
                "context_quality_score": 0.0
            }
        
        # Calculate similarity statistics
        similarities = [p.get('similarity', 0) for p in products]
        avg_similarity = sum(similarities) / len(similarities)
        max_similarity = max(similarities)
        min_similarity = min(similarities)
        
        thought_process.append(f"Found {len(products)} products with similarity range {min_similarity:.2f}-{max_similarity:.2f}")
        
        # Evaluate context sufficiency  
        sufficient_context = True
        confidence_level = "high"
        recommendation_strategy = "direct_recommendation"
        
        if max_similarity < 0.15:  # Lowered threshold for better product discovery
            thought_process.append("Very low similarity scores suggest poor query-product match")
            sufficient_context = False
            confidence_level = "very_low"
            recommendation_strategy = "query_clarification"
        elif max_similarity < 0.4:  # Adjusted thresholds
            thought_process.append("Moderate similarity scores - providing best available matches with confidence")
            confidence_level = "medium"
            recommendation_strategy = "confident_recommendation"  # More confident with lower similarities
        else:
            thought_process.append("High similarity scores indicate excellent matches")
            confidence_level = "high"
            recommendation_strategy = "confident_recommendation"
        
        # Check category diversity
        categories = set(p.get('category', 'Unknown') for p in products)
        if len(categories) > 3:
            thought_process.append(f"Results span {len(categories)} categories - might need focus")
            if confidence_level == "high":
                confidence_level = "medium"
        
        # Check price range diversity
        prices = [p.get('price', 0) for p in products if p.get('price')]
        if prices:
            price_range = max(prices) - min(prices)
            if price_range > 1000:  # Large price variation
                thought_process.append("Wide price range in results - customer needs may vary")
        
        # Intent alignment check
        primary_intent = intent["primary_intent"]
        if primary_intent == "comparison" and len(products) < 2:
            thought_process.append("Comparison intent detected but insufficient products for comparison")
            recommendation_strategy = "expand_search"
        
        return {
            "sufficient_context": sufficient_context,
            "confidence_level": confidence_level,
            "recommendation_strategy": recommendation_strategy,
            "thought_process": thought_process,
            "context_quality_score": avg_similarity,
            "similarity_stats": {
                "average": avg_similarity,
                "maximum": max_similarity,
                "minimum": min_similarity
            },
            "diversity_metrics": {
                "category_count": len(categories),
                "price_range": max(prices) - min(prices) if prices else 0
            }
        }
    
    def _format_product_context_for_llm(self, products: List[Dict[str, Any]]) -> str:
        """
        Format product information for LLM context
        Similar to the example's context formatting
        """
        
        if not products:
            return "No products available to recommend."
        
        context_parts = ["Available products:"]
        
        for i, product in enumerate(products, 1):
            product_info = [
                f"{i}. {product.get('name', 'Unknown Product')}",
                f"   Price: ${product.get('price', 0):.2f}",
                f"   Category: {product.get('category', 'Unknown')}",
            ]
            
            if product.get('brand'):
                product_info.append(f"   Brand: {product.get('brand')}")
            
            if product.get('description'):
                description = product.get('description', '')[:150]
                product_info.append(f"   Description: {description}...")
            
            if product.get('similarity'):
                product_info.append(f"   Relevance: {product.get('similarity', 0):.2f}")
            
            context_parts.append("\n".join(product_info))
        
        return "\n\n".join(context_parts)
    
    def _generate_ollama_response(self, query: str, products_context: str, 
                                 intent: Dict[str, Any], context_analysis: Dict[str, Any]) -> str:
        """
        Generate response using Ollama Llama3 model
        """
        
        try:
            # Select appropriate system prompt based on intent and context
            system_prompt = self._select_system_prompt(intent, context_analysis)
            
            # Build user prompt with context
            user_prompt = self._build_user_prompt(query, products_context, intent, context_analysis)
            
            # Call Ollama API
            response = requests.post(
                f"{self.ollama_base_url}/api/generate",
                json={
                    "model": self.ollama_model,
                    "prompt": f"System: {system_prompt}\n\nUser: {user_prompt}\n\nAssistant:",
                    "stream": False,
                    "options": {
                        "temperature": 0.7,
                        "top_p": 0.9,
                        "max_tokens": 500,
                        "stop": ["User:", "System:"]
                    }
                },
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                return result.get("response", "").strip()
            else:
                logger.error(f"Ollama API error: {response.status_code} - {response.text}")
                return self._generate_fallback_response(query)
                
        except requests.RequestException as e:
            logger.error(f"Error calling Ollama API: {str(e)}")
            return self._generate_fallback_response(query)
        except Exception as e:
            logger.error(f"Error generating Ollama response: {str(e)}")
            return self._generate_fallback_response(query)
    
    def _select_system_prompt(self, intent: Dict[str, Any], context_analysis: Dict[str, Any]) -> str:
        """Select appropriate system prompt based on intent and context quality"""
        
        primary_intent = intent["primary_intent"]
        confidence_level = context_analysis["confidence_level"]
        recommendation_strategy = context_analysis["recommendation_strategy"]
        
        if recommendation_strategy == "query_clarification":
            return """You are a helpful e-commerce shopping assistant. The customer's query didn't match our products well. 
            Politely ask clarifying questions to better understand their needs. Be friendly and helpful."""
        
        elif primary_intent == "comparison":
            return """You are an expert product comparison assistant. Compare the available products highlighting 
            their key differences, pros and cons. Be objective and help the customer make an informed decision."""
        
        elif primary_intent == "recommendation":
            return """You are a knowledgeable shopping assistant. Provide personalized product recommendations 
            based on the customer's needs. Explain why each product is a good fit."""
        
        elif primary_intent == "price_inquiry":
            return """You are a price-conscious shopping assistant. Focus on value, pricing, and budget-friendly options. 
            Help the customer find the best deals."""
        
        else:
            return """You are a friendly and knowledgeable e-commerce shopping assistant. Help customers find products 
            that meet their needs. Be helpful, accurate, and customer-focused."""
    
    def _build_user_prompt(self, query: str, products_context: str, 
                          intent: Dict[str, Any], context_analysis: Dict[str, Any]) -> str:
        """Build comprehensive user prompt with all context"""
        
        prompt_parts = [
            f"Customer Query: {query}",
            f"Customer Intent: {intent['primary_intent']}",
        ]
        
        # Add entity information if available
        entities = intent["entities"]
        if any(entities.values()):
            entity_info = []
            if entities.get("category"):
                entity_info.append(f"Category: {entities['category']}")
            if entities.get("brand"):
                entity_info.append(f"Brand: {entities['brand']}")
            if entities.get("price_range"):
                entity_info.append(f"Price Range: ${entities['price_range'][0]}-${entities['price_range'][1]}")
            
            if entity_info:
                prompt_parts.append(f"Detected Requirements: {', '.join(entity_info)}")
        
        # Add products context
        prompt_parts.append(f"Available Products:\n{products_context}")
        
        # Add context analysis
        strategy = context_analysis["recommendation_strategy"]
        if strategy == "query_clarification":
            prompt_parts.append("Note: The available products don't closely match the query. Ask clarifying questions.")
        elif strategy == "cautious_recommendation":
            prompt_parts.append("Note: Moderate match quality. Recommend with appropriate caveats.")
        
        prompt_parts.append("Please provide a helpful response based on the customer's query and available products.")
        
        return "\n\n".join(prompt_parts)
    
    def _calculate_confidence_score(self, products: List[Dict[str, Any]], 
                                   context_analysis: Dict[str, Any], intent: Dict[str, Any]) -> float:
        """Calculate overall confidence score for the response"""
        
        if not products:
            return 0.0
        
        # Base score from similarity
        similarities = [p.get('similarity', 0) for p in products]
        avg_similarity = sum(similarities) / len(similarities)
        
        # Adjust based on context quality
        confidence_level = context_analysis["confidence_level"]
        confidence_multipliers = {
            "very_low": 0.3,
            "low": 0.5,
            "medium": 0.7,
            "high": 0.9,
            "very_high": 1.0
        }
        
        multiplier = confidence_multipliers.get(confidence_level, 0.5)
        
        # Adjust based on number of products found
        product_count_bonus = min(len(products) / 5.0, 1.0)  # Up to 5 products gives full bonus
        
        # Adjust based on intent clarity
        intent_clarity = 1.0 if intent["primary_intent"] != "general_inquiry" else 0.8
        
        final_score = avg_similarity * multiplier * product_count_bonus * intent_clarity
        return min(final_score, 1.0)  # Cap at 1.0
    
    def _generate_fallback_response(self, query: str) -> str:
        """Generate fallback response when LLM is unavailable"""
        
        return f"""I'd be happy to help you with your search for "{query}"! 
        
While I'm having some technical difficulties with my AI assistant right now, I can still help you find what you're looking for. 

Could you provide a bit more detail about:
- What specific features you're looking for
- Your budget range
- Any brand preferences
- How you plan to use the product

This will help me search our product catalog more effectively for you!"""
    
    def test_ollama_connection(self) -> Dict[str, Any]:
        """Test connection to Ollama service"""
        
        try:
            response = requests.get(f"{self.ollama_base_url}/api/tags", timeout=5)
            if response.status_code == 200:
                models = response.json().get("models", [])
                model_names = [model.get("name", "") for model in models]
                
                # Check for target model (flexible matching)
                target_available = any(
                    self.ollama_model in model_name or 
                    model_name.startswith(self.ollama_model.split(':')[0])
                    for model_name in model_names
                )
                
                return {
                    "connected": True,
                    "available_models": model_names,
                    "target_model_available": target_available,
                    "url": self.ollama_base_url
                }
            else:
                return {
                    "connected": False,
                    "error": f"HTTP {response.status_code}",
                    "url": self.ollama_base_url
                }
                
        except Exception as e:
            return {
                "connected": False,
                "error": str(e),
                "url": self.ollama_base_url
            }
    
    def get_service_status(self) -> Dict[str, Any]:
        """Get comprehensive service status"""
        
        # Test Ollama connection
        ollama_status = self.test_ollama_connection()
        
        # Test vector service
        try:
            # Try a simple search to test vector service
            test_results = self.vector_service.search_similar_products("test", limit=1, threshold=0.1)
            vector_status = {
                "connected": True,
                "products_indexed": len(test_results) > 0
            }
        except Exception as e:
            vector_status = {
                "connected": False,
                "error": str(e)
            }
        
        return {
            "ollama": ollama_status,
            "vector_service": vector_status,
            "embedding_model": "SentenceTransformer (all-MiniLM-L6-v2)" if hasattr(self.vector_service, 'model') else "unknown",
            "initialized": True
        }
