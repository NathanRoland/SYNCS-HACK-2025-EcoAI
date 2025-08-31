import csv
import asyncio
import asyncpg
import os
from dotenv import load_dotenv

load_dotenv()

async def import_csv(csv_file_path):
    # Connect to database
    conn = await asyncpg.connect(os.getenv('DATABASE_URL'))
    
    try:
        # Open and read CSV file
        with open(csv_file_path, 'r', encoding='utf-8') as file:
            reader = csv.DictReader(file, delimiter=',')
            
            inserted_count = 0
            
            for row_num, row in enumerate(reader, start=2):
                try:
                    # Clean price - remove $ and commas, convert to float
                    price_str = row.get('price', '').strip()
                    price = None
                    if price_str:
                        price_clean = price_str.replace('$', '').replace(',', '')
                        try:
                            price = float(price_clean)
                        except ValueError:
                            print(f"Warning: Could not convert price '{price_str}' on row {row_num}")
                    
                    # Insert into database
                    await conn.execute("""
                        INSERT INTO products (site, title, price, url, image, categories, description)
                        VALUES ($1, $2, $3, $4, $5, $6, $7)
                    """, 
                        row.get('site', '').strip(),
                        row.get('title', '').strip(),
                        price,
                        row.get('url', '').strip(),
                        row.get('image', '').strip(),
                        row.get('categories', '').strip(),
                        row.get('description', '').strip()
                    )
                    
                    inserted_count += 1
                    if inserted_count % 100 == 0:
                        print(f"✅ Imported {inserted_count} products...")
                        
                except Exception as e:
                    print(f"❌ Error on row {row_num}: {e}")
                    continue
            
            print(f"🎉 Successfully imported {inserted_count} products!")
            
    except FileNotFoundError:
        print(f"❌ File not found: {csv_file_path}")
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        await conn.close()

async def main():
    csv_file_path = r"d:\Code\SYNCS_HACK\SYNCS-HACK-2025-EcoAI\scripts\eco_marketplaces_products_ALL.csv"
    await import_csv(csv_file_path)

if __name__ == "__main__":
    asyncio.run(main())