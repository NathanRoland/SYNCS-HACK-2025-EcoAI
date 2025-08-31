from pydantic import BaseModel
from typing import List, Dict

class ProductRequest(BaseModel):
    title: str
    price: str
    description: str 
    category: str
    url: str 
    reviews: str


class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    response: str
    products: List[Dict]