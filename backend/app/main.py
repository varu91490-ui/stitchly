from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.core.config import settings
from app.core.database import engine, Base
import app.models # Ensures all models are registered with Base metadata

from app.api.v1.auth import router as auth_router
from app.api.v1.customers import router as customers_router
from app.api.v1.orders import router as orders_router
from app.api.v1.payments import router as payments_router
from app.api.v1.expenses import router as expenses_router
from app.api.v1.reports import router as reports_router
from app.api.v1.voice import router as voice_router
from app.api.v1.drafts import router as drafts_router

# Auto-create tables on startup (MySQL 8.0)
try:
    Base.metadata.create_all(bind=engine)
    print("Database tables initialized successfully in MySQL.")
except Exception as e:
    print(f"Notice: Table auto-creation encountered: {e}")

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="ಕನ್ನಡ ಧ್ವನಿ ಆಧಾರಿತ ಟೈಲರಿಂಗ್ ಖಾತೆ ನಿರ್ವಹಣಾ ವ್ಯವಸ್ಥೆ (Tailoring Account Book with Kannada Voice Assistant)",
    version="1.0.0",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Exception handler for cleaner Kannada messages
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    import traceback
    traceback.print_exc()
    return JSONResponse(
        status_code=500,
        content={"detail": f"ಆಂತರಿಕ ದೋಷ ಉಂಟಾಗಿದೆ (Internal Server Error): {str(exc)}"}
    )

# Include API Routers
app.include_router(auth_router, prefix=f"{settings.API_V1_STR}/auth", tags=["ದೃಢೀಕರಣ (Authentication)"])
app.include_router(customers_router, prefix=f"{settings.API_V1_STR}/customers", tags=["ಗ್ರಾಹಕರು (Customers)"])
app.include_router(orders_router, prefix=f"{settings.API_V1_STR}/orders", tags=["ಆರ್ಡರ್‌ಗಳು (Orders)"])
app.include_router(payments_router, prefix=f"{settings.API_V1_STR}/payments", tags=["ಪಾವತಿಗಳು (Payments)"])
app.include_router(expenses_router, prefix=f"{settings.API_V1_STR}/expenses", tags=["ಖರ್ಚುಗಳು (Expenses)"])
app.include_router(reports_router, prefix=f"{settings.API_V1_STR}/reports", tags=["ವರದಿಗಳು (Reports)"])
app.include_router(voice_router, prefix=f"{settings.API_V1_STR}/voice", tags=["ಧ್ವನಿ ಸಹಾಯಕ (Voice Assistant)"])
app.include_router(drafts_router, prefix=f"{settings.API_V1_STR}/drafts", tags=["ಕರಡುಗಳು (Drafts)"])

@app.get("/")
def root():
    return {
        "app": settings.PROJECT_NAME,
        "language": "Kannada (kn-IN)",
        "status": "online",
        "documentation": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
