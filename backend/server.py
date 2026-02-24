"""
HATA Humanitarian - Backend API Proxy
This minimal FastAPI app runs on port 8001 and proxies API calls to the Node.js server.
For a static site deployment, this is a compatibility layer for the Emergent platform.
"""
import os
from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
import httpx

app = FastAPI(title="HATA Humanitarian API")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# The Node.js server runs on port 3000
NODEJS_URL = "http://localhost:3000"

@app.get("/api/health")
async def health():
    return {"status": "ok", "service": "hata-humanitarian"}

@app.get("/api/featured-activities")
async def featured_activities(type: str = None):
    async with httpx.AsyncClient() as client:
        params = {"type": type} if type else {}
        resp = await client.get(f"{NODEJS_URL}/api/featured-activities", params=params)
        return resp.json()

@app.post("/api/contact")
async def contact(request: Request):
    body = await request.json()
    async with httpx.AsyncClient() as client:
        resp = await client.post(f"{NODEJS_URL}/api/contact", json=body)
        return resp.json()
