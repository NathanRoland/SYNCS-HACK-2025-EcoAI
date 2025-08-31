import asyncio
import asyncpg
import os
from dotenv import load_dotenv
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app.services.rag_service import RAGService

load_dotenv()

async def populate():
    rag = RAGService()
    conn = await asyncpg.connect(os.getenv("DATABASE_URL"))
    
    # Get products without embeddings
    products = await conn.fetch("""
        SELECT id, title, description FROM products 
        WHERE embedding IS NULL
    """)
    
    print(f"Processing {len(products)} products...")
    
    for i, product in enumerate(products):
        success = await rag.embed_product(
            product['id'], 
            product['title'], 
            product['description']
        )
        if success:
            print(f"✅ {i+1}/{len(products)}: {product['title'][:50]}...")
        else:
            print(f"❌ Failed: {product['id']}")
    
    await conn.close()
    print("Done!")

if __name__ == "__main__":
    asyncio.run(populate())