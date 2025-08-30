import os
import asyncio
from serpapi import GoogleSearch
from langchain_openai import ChatOpenAI
from langchain.agents import create_openai_functions_agent, AgentExecutor
from langchain.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain.schema import SystemMessage
from langchain.tools import Tool
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def serpapi_search(query):
    """Search using SerpAPI (Google Search)"""
    try:
        params = {
            "q": query,
            "api_key": os.getenv("SERPAPI_KEY"),
            "engine": "google",
            "num": 5
        }
        search = GoogleSearch(params)
        results = search.get_dict()
        
        # Format search results
        formatted_results = []
        for item in results.get("organic_results", []):
            formatted_results.append(
                f"Title: {item.get('title', '')}\n"
                f"Snippet: {item.get('snippet', '')}\n"
                f"Link: {item.get('link', '')}\n"
            )
        
        return "\n".join(formatted_results[:5])
        
    except Exception as e:
        return f"Search error: {str(e)}. Using AI knowledge instead."

# Custom SerpAPI search tool for LangChain
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

# Replace the search tool
search_tool = SerpAPISearchTool()

# Rest of your code stays the same...

def create_eco_search_agent():
    """Create an agent that can search for eco-friendly products"""
    
    # Initialize LLM with API key from .env
    llm = ChatOpenAI(
        api_key=os.getenv("OPENAI_API_KEY"),
        model="gpt-3.5-turbo",
        temperature=0.1
    )
    
    # Define the system prompt
    system_prompt = """Find 3 Amazon eco-alternatives. Format:
    - Product: Price - Benefit - Link
    Keep it brief."""
    
    # Create prompt template
    prompt = ChatPromptTemplate.from_messages([
        SystemMessage(content=system_prompt),
        MessagesPlaceholder(variable_name="chat_history", optional=True),
        ("human", "{input}"),
        MessagesPlaceholder(variable_name="agent_scratchpad")
    ])
    
    # Create agent with search tool
    agent = create_openai_functions_agent(
        llm=llm,
        tools=[search_tool],
        prompt=prompt
    )
    
    # Create executor
    agent_executor = AgentExecutor(
        agent=agent,
        tools=[search_tool],
        verbose=True,
        return_intermediate_steps=True,
        max_iterations=3,
        early_stopping_method="generate"
    )
    
    return agent_executor

async def find_eco_alternatives(product_info: dict):
    """Main function to find eco alternatives"""
    
    # Create agent
    agent_executor = create_eco_search_agent()
    
    # Format input for the agent
    input_text = f"""
    Product: {product_info['title']}
    Price: {product_info['price']}
    Category: {product_info['category']}
    Description: {product_info.get('description', 'N/A')}
    
    Please search for eco-friendly alternatives to this product and provide detailed recommendations.
    """
    
    try:
        # Run the agent
        result = await agent_executor.ainvoke({"input": input_text})
        
        return {
            "success": True,
            "alternatives": result["output"],
            "search_steps": result.get("intermediate_steps", [])
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "alternatives": None
        }

# Example usage
if __name__ == "__main__":
    # Example product
    product = {
        "title": "Plastic Water Bottle 24-pack",
        "price": "$12.99",
        "category": "Kitchen & Dining",
        "description": "Disposable plastic water bottles"
    }
    
    async def test():
        result = await find_eco_alternatives(product)
        print("Result:", result)
    
    asyncio.run(test())