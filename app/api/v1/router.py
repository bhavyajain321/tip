"""
API v1 router with correct path ordering
"""
from fastapi import APIRouter

api_router = APIRouter()

# Status endpoint
@api_router.get("/status")
async def api_status():
    return {"status": "API v1 is running", "version": "1.0.0"}

# IMPORTANT: Put specific routes BEFORE parameterized routes
@api_router.get("/feeds/open-source")
async def list_open_source_feeds():
    """List available open source feeds"""
    from app.services.open_source_feeds import OpenSourceFeedManager
    feed_manager = OpenSourceFeedManager()
    return feed_manager.get_available_feeds()

@api_router.post("/setup/feeds/recommended") 
async def setup_recommended_feeds():
    """Set up recommended feeds"""
    from app.services.open_source_feeds import OpenSourceFeedManager
    feed_manager = OpenSourceFeedManager()
    
    recommended = ['abuse_ch_malware', 'abuse_ch_urlhaus', 'phishtank']
    results = {}
    
    for feed_key in recommended:
        try:
            success = await feed_manager.setup_feed(feed_key)
            results[feed_key] = {"success": success}
        except Exception as e:
            results[feed_key] = {"success": False, "error": str(e)}
    
    return {"message": "Setup completed", "results": results}

# Now include the parameterized routes
from app.api.v1.endpoints import iocs, feeds
api_router.include_router(iocs.router, prefix="/iocs", tags=["IOCs"])
api_router.include_router(feeds.router, prefix="/feeds", tags=["Feeds"])
