from langchain.tools import BaseTool
from pydantic import BaseModel, Field
from typing import Type, Dict, Any, List, Optional
import requests
from bs4 import BeautifulSoup
import re
from urllib.parse import urlparse

class ProductScraperInput(BaseModel):
    """Input for product scraper tool."""
    url: str = Field(description="Product URL to scrape (Amazon, eBay, Temu, etc.)")

class ProductScraperTool(BaseTool):
    """A general product scraper tool using ScrapingBee service."""
    
    name: str = "product_scraper"
    description: str = "Scrapes product information from e-commerce websites including Amazon, eBay, and Temu."
    args_schema: Type[BaseModel] = ProductScraperInput
    api_key: str = Field(...)
    
    def _run(self, url: str) -> Dict[str, Any]:
        """Execute the scraping operation."""
        try:
            # Auto-detect site type
            domain = urlparse(url).netloc.lower()
            if "amazon." in domain:
                site_type = "amazon"
            elif "ebay." in domain:
                site_type = "ebay" 
            elif "temu." in domain:
                site_type = "temu"
            else:
                site_type = "generic"
            
            # Get HTML using ScrapingBee
            response = requests.get(
                url='https://app.scrapingbee.com/api/v1',
                params={
                    'api_key': self.api_key,
                    'url': url,
                    'render_js': 'false'
                }
            )
            
            if response.status_code != 200:
                return {"error": f"ScrapingBee error: {response.status_code}", "url": url}
            
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Extract based on site type
            if site_type == "amazon":
                return self._extract_amazon(soup, url)
            else:
                return {"error": f"{site_type} not implemented yet", "url": url}
                
        except Exception as e:
            return {"error": f"Scraping failed: {str(e)}", "url": url}
    
    def _extract_amazon(self, soup: BeautifulSoup, url: str) -> Dict[str, Any]:
        """Extract Amazon product info."""
        result = {"title": "N/A", "price": "N/A", "about_item": [], "url": url}
        
        # Get title
        title = soup.find('span', {'id': 'productTitle'})
        if title:
            result["title"] = title.get_text(strip=True)
        
        # Get price
        price = soup.find('span', {'class': 'a-offscreen'})
        if price:
            result["price"] = price.get_text(strip=True)
        
        # Get about this item
        about_headers = soup.find_all('h1', string=re.compile(r'About this item', re.IGNORECASE))
        for header in about_headers:
            ul_element = header.find_next('ul', class_='a-unordered-list')
            if ul_element:
                bullet_points = []
                for li in ul_element.find_all('li'):
                    span = li.find('span', class_='a-list-item')
                    if span:
                        text = span.get_text(strip=True)
                        if text and len(text) > 20:
                            bullet_points.append(text)
                if bullet_points:
                    result["about_item"] = bullet_points
                    break
        
        return result

# Simple test
if __name__ == "__main__":
    API_KEY = "I9H1QKABRE05MFZ1FCWVQ2AOY2UMYR74ZA5LE0KZ3B9F1E4109MGYEK80TT51155EK1EGTX3S6RH6O48"
    
    scraper = ProductScraperTool(api_key=API_KEY)
    
    test_url = "https://www.amazon.com/dp/B0CP7Q9CVV"
    
    result = scraper._run(test_url)
    print("Scraping Result:")
    print(f"Title: {result.get('title')}")
    print(f"Price: {result.get('price')}")
    print(f"About Item: {result.get('about_item')}")