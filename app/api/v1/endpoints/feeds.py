"""
Simplified feeds endpoint
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.db.database import get_db
from app.models import FeedSource

router = APIRouter()

@router.get("/")
async def list_feed_sources(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """List all threat feed sources"""
    try:
        feeds = db.query(FeedSource).offset(skip).limit(limit).all()
        return feeds
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@router.get("/{feed_id}")
async def get_feed_source(
    feed_id: int,
    db: Session = Depends(get_db)
):
    """Get a specific feed source"""
    try:
        feed = db.query(FeedSource).filter(FeedSource.id == feed_id).first()
        if not feed:
            raise HTTPException(status_code=404, detail="Feed not found")
        return feed
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")
