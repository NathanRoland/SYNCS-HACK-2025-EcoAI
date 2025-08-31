import asyncio
import asyncpg
import os
from dotenv import load_dotenv

load_dotenv()

async def test_connection():
    try:
        conn = await asyncpg.connect(os.getenv("DATABASE_URL"))
        print("✅ Database connection successful!")
        
        # Test if database exists
        result = await conn.fetchval("SELECT current_database()")
        print(f"✅ Connected to database: {result}")
        
        await conn.close()
        
    except Exception as e:
        print(f"❌ Connection failed: {e}")

if __name__ == "__main__":
    asyncio.run(test_connection())