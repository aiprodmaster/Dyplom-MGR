from fastapi import APIRouter

router = APIRouter()

@router.get("/health")
async def health():
    return {"status": "healthy"}

@router.post("/chat")
async def chat():
    return {"message": "Chat endpoint"}
