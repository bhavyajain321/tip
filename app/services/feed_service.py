"""
Feed service layer for business logic
"""
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Optional
from datetime import datetime

from app.models import FeedSource, FeedUpdate, IOC
from app.api.v1.schemas.feeds import FeedSourceCreate, FeedSourceUpdate

class FeedService:
    def __init__(self, db: Session):
        self.db = db

    async def create_feed_source(self, feed_data: FeedSourceCreate) -> FeedSource:
        """Create a new feed source"""
        # Check for duplicate names
        existing = self.db.query(FeedSource).filter(FeedSource.name == feed_data.name).first()
        if existing:
            raise ValueError(f"Feed source with name '{feed_data.name}' already exists")
        
        db_feed = FeedSource(
            name=feed_data.name,
            type=feed_data.type,
            url=feed_data.url,
            api_key=feed_data.api_key,
            reliability=feed_data.reliability,
            confidence=feed_data.confidence,
            update_frequency=feed_data.update_frequency,
            config=feed_data.config or {}
        )
        
        self.db.add(db_feed)
        self.db.commit()
        self.db.refresh(db_feed)
        return db_feed

    async def get_feed_source(self, feed_id: int) -> Optional[FeedSource]:
        """Get feed source by ID"""
        return self.db.query(FeedSource).filter(FeedSource.id == feed_id).first()

    async def list_feed_sources(
        self, 
        skip: int = 0, 
        limit: int = 100, 
        is_active: Optional[bool] = None
    ) -> List[FeedSource]:
        """List feed sources with filtering"""
        query = self.db.query(FeedSource)
        
        if is_active is not None:
            query = query.filter(FeedSource.is_active == is_active)
        
        return query.offset(skip).limit(limit).all()

    async def update_feed_source(self, feed_id: int, feed_update: FeedSourceUpdate) -> Optional[FeedSource]:
        """Update a feed source"""
        db_feed = self.db.query(FeedSource).filter(FeedSource.id == feed_id).first()
        if not db_feed:
            return None
        
        update_data = feed_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_feed, field, value)
        
        self.db.commit()
        self.db.refresh(db_feed)
        return db_feed

    async def delete_feed_source(self, feed_id: int) -> bool:
        """Delete a feed source"""
        db_feed = self.db.query(FeedSource).filter(FeedSource.id == feed_id).first()
        if not db_feed:
            return False
        
        self.db.delete(db_feed)
        self.db.commit()
        return True

    async def get_feed_updates(self, feed_id: int, skip: int = 0, limit: int = 50) -> List[FeedUpdate]:
        """Get update history for a feed"""
        return self.db.query(FeedUpdate).filter(
            FeedUpdate.source_id == feed_id
        ).order_by(desc(FeedUpdate.start_time)).offset(skip).limit(limit).all()

    async def get_feed_stats(self, feed_id: int) -> Optional[dict]:
        """Get statistics for a feed source"""
        feed = self.db.query(FeedSource).filter(FeedSource.id == feed_id).first()
        if not feed:
            return None
        
        # Get IOC count for this feed
        ioc_count = self.db.query(IOC).filter(IOC.source_id == feed_id).count()
        
        # Get recent update stats
        recent_updates = self.db.query(FeedUpdate).filter(
            FeedUpdate.source_id == feed_id
        ).order_by(desc(FeedUpdate.start_time)).limit(10).all()
        
        return {
            "feed_id": feed_id,
            "name": feed.name,
            "total_iocs": ioc_count,
            "successful_updates": feed.successful_updates,
            "failed_updates": feed.failed_updates,
            "last_update": feed.last_update,
            "is_active": feed.is_active,
            "recent_updates": len(recent_updates)
        }
