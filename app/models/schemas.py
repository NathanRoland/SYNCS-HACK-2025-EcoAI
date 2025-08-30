from pydantic import BaseModel

class ProductRequest(BaseModel):
    title: str
    price: str
    description: str 
    category: str
    url: str 
    reviews: str
    