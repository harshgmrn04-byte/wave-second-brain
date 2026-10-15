from fastapi import FastAPI

app = FastAPI(title="Wave API")


@app.get("/health/live")
def live() -> dict[str, str]:
    return {"status": "ok"}
