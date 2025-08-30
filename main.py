# main.py
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import uvicorn
from dotenv import load_dotenv
from app.routers import api

# Load .env variables globally at startup
load_dotenv()

app = FastAPI(
    title="API Service",
    description="A FastAPI service",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class BaseResponse(BaseModel):
    success: bool
    message: str

class HealthResponse(BaseResponse):
    status: str

app.include_router(api.router, prefix="/api", tags=["products"])


# Root endpoint
@app.get("/")
async def root():
    return {"message": "API is running"}

# Health check
@app.get("/health", response_model=HealthResponse)
async def health_check():
    return HealthResponse(
        success=True,
        message="Service is healthy",
        status="OK"
    )

# # Example GET endpoint
# @app.get("/api/v1/example")
# async def get_example():
#     return {"data": "example response"}

# # Example POST endpoint
# @app.post("/api/v1/example")
# async def post_example(data: dict):
#     return {"received": data}

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )