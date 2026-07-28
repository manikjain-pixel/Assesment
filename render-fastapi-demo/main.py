from fastapi import FastAPI

app = FastAPI()


@app.get("/")
def root():
    return {"message": "Hello from Render!"}


@app.get("/health")
def health():
    return {"status": "healthy"}