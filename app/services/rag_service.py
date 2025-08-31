from openai import OpenAI
import asyncpg
import os
from langchain_openai import ChatOpenAI
from typing import List, Dict
import json

class RAGService:
    def __init__(self):
        self.openai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        self.llm = ChatOpenAI(api_key=os.getenv("OPENAI_API_KEY"), temperature=0.1)
    
    def create_embedding(self, text: str) -> List[float]:
        """Create embedding for text"""
        response = self.openai_client.embeddings.create(
            model="text-embedding-ada-002",
            input=text
        )
        return response.data[0].embedding
    
    async def search_similar_products(self, query: str, limit: int = 5) -> List[Dict]:
        try:
            import asyncpg
            
            database_url = os.getenv("DATABASE_URL", "postgresql://postgres:newpassword@localhost:5432/syncs")
            print(f"Connecting to database: {database_url}")
            conn = await asyncpg.connect(database_url)
            
            # First try to find products with embeddings
            results = await conn.fetch("SELECT * FROM products WHERE embedding IS NOT NULL")
            
            if results:
                # Use embedding-based search
                import json
                import numpy as np
                
                query_embedding = self.create_embedding(query)
                similarities = []
                
                for row in results:
                    stored_embedding = row['embedding']  # JSONB is already parsed
                    # Convert to numpy array if it's a string
                    if isinstance(stored_embedding, str):
                        stored_embedding = json.loads(stored_embedding)
                    stored_embedding = np.array(stored_embedding)
                    similarity = np.dot(query_embedding, stored_embedding)
                    
                    similarities.append({
                        'title': row['title'],
                        'price': row['price'],
                        'site': row['site'],
                        'similarity': similarity
                    })
                
                similarities.sort(key=lambda x: x['similarity'], reverse=True)
                await conn.close()
                return similarities[:limit]
            else:
                # Fallback: simple text search without embeddings
                print("No embeddings found, using fallback search")
                search_terms = query.lower().split()
                print(f"Search terms: {search_terms}")
                all_products = await conn.fetch("SELECT * FROM products LIMIT 100")
                print(f"Found {len(all_products)} products to search through")
                await conn.close()
                
                matches = []
                for row in all_products:
                    title = row['title'].lower() if row['title'] else ""
                    description = row['description'].lower() if row['description'] else ""
                    categories = row['categories'].lower() if row['categories'] else ""
                    
                    # Simple keyword matching
                    match_score = 0
                    for term in search_terms:
                        if term in title:
                            match_score += 3
                        if term in description:
                            match_score += 2
                        if term in categories:
                            match_score += 1
                    
                    if match_score > 0:
                        matches.append({
                            'title': row['title'],
                            'price': row['price'],
                            'site': row['site'],
                            'similarity': match_score
                        })
                
                matches.sort(key=lambda x: x['similarity'], reverse=True)
                return matches[:limit]
            
        except Exception as e:
            print(f"Search error: {e}")
            import traceback
            traceback.print_exc()
            return []
    
    async def chat(self, question: str) -> Dict[str, str]:
        """Chat about eco-friendly products using RAG"""
        try:
            # Search for relevant products
            similar_products = await self.search_similar_products(question)
            
            # Create context from similar products
            if similar_products:
                context = "Here are some relevant eco-friendly products from our database:\n\n"
                for i, product in enumerate(similar_products, 1):
                    context += f"{i}. **{product['title']}**\n"
                    context += f"   Description: {product['description']}\n"
                    context += f"   Price: ${product['price']}\n"
                    context += f"   Similarity: {product['similarity']:.2f}\n\n"
            else:
                context = "No specific products found, but I can provide general eco-friendly advice.\n\n"
            
            # Create prompt for the AI
            prompt = f"""
You are an eco-friendly product expert and sustainability advisor. Answer the user's question using the following product information as context when relevant.

Context from our eco-friendly product database:
{context}

User Question: {question}

Guidelines:
- Provide helpful, accurate information about eco-friendly alternatives and sustainability
- If relevant products are found, reference them in your answer
- Focus on environmental benefits, materials, and sustainability practices
- Give practical advice for making eco-friendly choices
- If no relevant products are found, provide general eco-friendly guidance

Answer:"""
            
            # Get AI response
            response = await self.llm.ainvoke(prompt)
            
            return {
                "answer": response.content,
                "products_found": len(similar_products),
                "status": "success"
            }
            
        except Exception as e:
            return {
                "answer": f"I'm sorry, I encountered an error: {str(e)}",
                "products_found": 0,
                "status": "error"
            }
    
    async def embed_product(self, product_id: int, title: str, description: str):
        """Create and store embedding for a product (for populating database)"""
        try:
            # Combine title and description for better context
            combined_text = f"{title}. {description}"
            
            # Get embedding
            embedding = self.create_embedding(combined_text)
            embedding_str = json.dumps(embedding)

            # Store in database
            conn = await asyncpg.connect(os.getenv("DATABASE_URL"))
            await conn.execute(
                "UPDATE products SET embedding = $1 WHERE id = $2",
                embedding_str, product_id
            )
            await conn.close()
            
            return True
        except Exception as e:
            print(f"Embedding error: {e}")
            return False