import os
from serpapi import GoogleSearch
from langchain.tools import Tool

def serpapi_search(query):
    try:
        # Clean query if agent added site: prefix
        if "site:" in query:
            query = query.split(" ", 1)[1] if " " in query else query
        
        search_results = []
        
        # Search multiple sites for eco-friendly alternatives
        params = {
            "engine": "google",
            "q": f"eco friendly {query} site:amazon.com OR site:ebay.com OR site:temu.com OR site:kmart.com -search -category",
            "api_key": os.getenv("SERPAPI_KEY"),
            "num": 6
        }
        
        search = GoogleSearch(params)
        results = search.get_dict()
        
        # Filter for specific product pages only
        for item in results.get("organic_results", []):
            link = item.get('link', '')
            title = item.get('title', '')
            
            # Skip category/search pages
            if link and not any(skip in link.lower() for skip in ['/s?', '/search', '/category', '/browse', '/shop']):
                search_results.append(
                    f"🔍 {title}\n"
                    f"Description: {item.get('snippet', '')[:100]}...\n"
                    f"Link: {link}\n"
                )
                if len(search_results) >= 4:
                    break
        
        return "\n".join(search_results) if search_results else "Products Not found"
        
    except Exception as e:
        return f"Search error: {str(e)}. Using AI knowledge instead."

class SerpAPISearchTool(Tool):
    def __init__(self):
        super().__init__(
            name="google_search",
            description="Search Google for current information about eco-friendly products, sustainable alternatives, and environmental certifications",
            func=self._search
        )
    
    def _search(self, query: str) -> str:
        api_key = os.getenv("SERPAPI_KEY")
        if not api_key:
            return "SerpAPI key not found. Please add SERPAPI_KEY to your .env file. Using AI knowledge instead."
        return serpapi_search(query)

# tool instance
search_tool = SerpAPISearchTool()