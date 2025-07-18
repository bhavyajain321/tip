"""
Threat Feed Management API endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.db.database import get_db
from app.models import FeedSource, FeedUpdate
from app.api.v1.schemas.feeds import FeedSourceCreate, FeedSourceUpdate, FeedSourceResponse, FeedUpdateResponse
from app.services.feed_service import FeedService

router = APIRouter()

@router.post("/", response_model=FeedSourceResponse, status_code=status.HTTP_201_CREATED)
async def create_feed_source(
    feed_data: FeedSourceCreate,
    db: Session = Depends(get_db)
):
    """Create a new threat feed source"""
    feed_service = FeedService(db)
    try:
        feed = await feed_service.create_feed_source(feed_data)
        return feed
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/", response_model=List[FeedSourceResponse])
async def list_feed_sources(
    skip: int = 0,
    limit: int = 100,
    is_active: Optional[bool] = None,
    db: Session = Depends(get_db)
):
    """List all threat feed sources"""
    feed_service = FeedService(db)
    feeds = await feed_service.list_feed_sources(skip=skip, limit=limit, is_active=is_active)
    return feeds

@router.get("/{feed_id}", response_model=FeedSourceResponse)
async def get_feed_source(
    feed_id: int,
    db: Session = Depends(get_db)
):
    """Get a specific feed source"""
    feed_service = FeedService(db)
    feed = await feed_service.get_feed_source(feed_id)
    if not feed:
        raise HTTPException(status_code=404, detail="Feed source not found")
    return feed

@router.put("/{feed_id}", response_model=FeedSourceResponse)
async def update_feed_source(
    feed_id: int,
    feed_update: FeedSourceUpdate,
    db: Session = Depends(get_db)
):
    """Update a feed source"""
    feed_service = FeedService(db)
    feed = await feed_service.update_feed_source(feed_id, feed_update)
    if not feed:
        raise HTTPException(status_code=404, detail="Feed source not found")
    return feed

@router.delete("/{feed_id}")
async def delete_feed_source(
    feed_id: int,
    db: Session = Depends(get_db)
):
    """Delete a feed source"""
    feed_service = FeedService(db)
    success = await feed_service.delete_feed_source(feed_id)
    if not success:
        raise HTTPException(status_code=404, detail="Feed source not found")
    return {"message": "Feed source deleted successfully"}

@router.post("/{feed_id}/update")
async def trigger_feed_update(
    feed_id: int,
    db: Session = Depends(get_db)
):
    """Manually trigger a feed update"""
    feed_service = FeedService(db)
    feed = await feed_service.get_feed_source(feed_id)
    if not feed:
        raise HTTPException(status_code=404, detail="Feed source not found")
    
    return {"message": "Feed update triggered", "feed_id": feed_id}

@router.get("/{feed_id}/updates", response_model=List[FeedUpdateResponse])
async def get_feed_updates(
    feed_id: int,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    """Get update history for a feed source"""
    feed_service = FeedService(db)
    updates = await feed_service.get_feed_updates(feed_id, skip=skip, limit=limit)
    return updates

@router.get("/{feed_id}/stats")
async def get_feed_stats(
    feed_id: int,
    db: Session = Depends(get_db)
):
    """Get statistics for a feed source"""
    feed_service = FeedService(db)
    stats = await feed_service.get_feed_stats(feed_id)
    if stats is None:
        raise HTTPException(status_code=404, detail="Feed source not found")
    return stats
