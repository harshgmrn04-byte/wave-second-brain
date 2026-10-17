from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.resources.routes import router as note_router
from app.routes.auth_check import router as auth_router

app = FastAPI(title="Wave API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[get_settings().cors_origin],
    allow_methods=["GET", "POST", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
)
app.include_router(auth_router)
app.include_router(note_router)


@app.get("/health/live")
def live() -> dict[str, str]:
    return {"status": "ok"}
