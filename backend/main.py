from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.routes.products import router as products_router

app = FastAPI(
    title="Price Monitor API",
    description="API para consulta de histórico e análise de preços monitorados.",
    version="1.0.0"
)

# CORS — permite que o frontend Next.js consuma a API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(products_router, prefix="/api/v1", tags=["Produtos"])


@app.get("/")
def root():
    return {"status": "online", "message": "Price Monitor API está rodando"}