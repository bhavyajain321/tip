"""
API v1 router with all endpoints
"""
from fastapi import APIRouter

from app.api.v1.endpoints import iocs, feeds

api_router = APIRouter()

# Basic status endpoint
@api_router.get("/status")
async def api_status():
    """API status endpoint"""
    return {
        "status": "API v1 is running",
        "version": "1.0.0",
        "endpoints": [
            "/iocs - IOC management",
            "/feeds - Threat feed management"
        ]
    }

# Include endpoint routers
api_router.include_router(iocs.router, prefix="/iocs", tags=["IOCs"])
api_router.include_router(feeds.router, prefix="/feeds", tags=["Threat Feeds"])
