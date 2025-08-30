import os
from langchain_openai import ChatOpenAI
from langchain.agents import create_openai_functions_agent, AgentExecutor
from langchain.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain.schema import SystemMessage
from typing import List
from .search_service import search_tool



def create_eco_search_agent():
    """Create an agent that can search for eco-friendly products"""
    
    # Initialize LLM with API key from .env
    llm = ChatOpenAI(
        api_key=os.getenv("OPENAI_API_KEY"),
        model="gpt-3.5-turbo",
        temperature=0.1
    )
    
    # Define the system prompt

    system_prompt = """You are an eco-friendly product expert. You can search for sustainable alternatives.

        TOOLS AVAILABLE:
        1. google_search - Search for products (provide ONLY product name like "water bottle", "shampoo")

        WORKFLOW:
        1. Use google_search to find eco-friendly product alternatives
        2. Analyze the search results (titles and descriptions) to identify the most sustainable options
        3. Make recommendations based on product names and descriptions

        When analyzing products from search results, focus on:
        - Materials mentioned (bamboo, stainless steel, recycled, compostable, biodegradable)
        - Sustainability keywords (eco-friendly, sustainable, plastic-free, reusable)
        - Brand reputation for environmental practices
        - Packaging mentions (minimal, recyclable, plastic-free)

        Format your response as:
        • **Product Name** - Eco Score (1-10) - Key Benefits - Link
        • **Product Name** - Eco Score (1-10) - Key Benefits - Link
        • **Product Name** - Eco Score (1-10) - Key Benefits - Link

        Provide at least 3 eco-friendly alternatives with explanations."""

    # Create prompt template
    prompt = ChatPromptTemplate.from_messages([
        SystemMessage(content=system_prompt),
        MessagesPlaceholder(variable_name="chat_history", optional=True),
        ("human", "{input}"),
        MessagesPlaceholder(variable_name="agent_scratchpad")
    ])
    tools = [search_tool]
    # Create agent with search tool
    agent = create_openai_functions_agent(
        llm=llm,
        tools=tools,
        prompt=prompt
    )
    
    # Create executor
    agent_executor = AgentExecutor(
        agent=agent,
        tools=tools,
        verbose=True,
        return_intermediate_steps=True,
        max_iterations=8,
    )
    
    return agent_executor

async def find_eco_alternatives(product_info: dict):
    """Main function to find eco alternatives"""
    
    # Create agent
    agent_executor = create_eco_search_agent()
    
    # Format input for the agent
    input_text = f"""
    Product: {product_info.title}
    Price: {product_info.price}
    Category: {product_info.category}
    Description: {product_info.description}
    URL: {product_info.url}
    Reviews: {product_info.reviews}
    
    Please search for eco-friendly alternatives to this product and provide detailed recommendations.
    """

    try:
        # Run the agent
        result = await agent_executor.ainvoke({"input": input_text})
        
        return {
            "success": True,
            "alternatives": result["output"],
            # "search_steps": result.get("intermediate_steps", [])
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "alternatives": None
        }