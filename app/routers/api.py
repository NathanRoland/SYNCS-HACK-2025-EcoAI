from pydantic import BaseModel
from fastapi import APIRouter, HTTPException
from app.models.schemas import ProductRequest, ChatRequest, ChatResponse
from app.services.ai_service import find_eco_alternatives
from app.services.rag_service import RAGService

router = APIRouter()


@router.post("/recommend")
async def recommend(product: ProductRequest):


    response = await find_eco_alternatives(product)

    return {
        "message": response
    }

@router.post("/chat")
async def chat(request: ChatRequest):
    try:
        rag_service = RAGService()
        products = await rag_service.search_similar_products(request.message, limit=5)
        
        response = f"Found {len(products)} eco-friendly products for you!" if products else "No products found."
        
        return ChatResponse(response=response, products=products)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))