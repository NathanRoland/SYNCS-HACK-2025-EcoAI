from pydantic import BaseModel
from fastapi import APIRouter
from app.models.schemas import ProductRequest
from app.services.ai_service import find_eco_alternatives

router = APIRouter()


@router.post("/recommend")
async def recommend(product: ProductRequest):


    response = await find_eco_alternatives(product)

    return {
        "message": response
    }

