"""
Celery tasks for threat feed processing
"""
from celery import current_task
from datetime import datetime
import logging

from app.core.celery import celery_app
from app.db.database import SessionLocal
from app.models import FeedSource, FeedUpdate
from app.services.threat_feeds.processors import get_feed_processor

logger = logging.getLogger(__name__)

@celery_app.task(bind=True)
def update_single_feed(self, feed_id: int):
    """Update a single threat feed"""
    db = SessionLocal()
    try:
        # Get feed source
        feed = db.query(FeedSource).filter(FeedSource.id == feed_id).first()
        if not feed or not feed.is_active:
            return {"error": "Feed not found or inactive"}
        
        # Create update record
        update_record = FeedUpdate(
            source_id=feed_id,
            status="running"
        )
        db.add(update_record)
        db.commit()
        
        # Get appropriate processor
        processor = get_feed_processor(feed.type)
        if not processor:
            update_record.status = "failed"
            update_record.error_message = f"No processor available for feed type: {feed.type}"
            update_record.end_time = datetime.utcnow()
            db.commit()
            return {"error": f"No processor for feed type: {feed.type}"}
        
        # Process feed
        result = processor.process_feed(feed, db)
        
        # Update feed record
        update_record.status = "completed"
        update_record.end_time = datetime.utcnow()
        update_record.iocs_processed = result.get("processed", 0)
        update_record.iocs_added = result.get("added", 0)
        update_record.iocs_updated = result.get("updated", 0)
        
        # Update feed source statistics
        feed.last_update = datetime.utcnow()
        feed.successful_updates += 1
        feed.total_iocs = db.query(feed.iocs).count()
        
        db.commit()
        
        logger.info(f"Successfully updated feed {feed.name}: {result}")
        return result
        
    except Exception as e:
        logger.error(f"Error updating feed {feed_id}: {str(e)}")
        if 'update_record' in locals():
            update_record.status = "failed"
            update_record.error_message = str(e)
            update_record.end_time = datetime.utcnow()
        if 'feed' in locals():
            feed.failed_updates += 1
        db.commit()
        return {"error": str(e)}
    finally:
        db.close()

@celery_app.task
def update_all_feeds():
    """Update all active threat feeds"""
    db = SessionLocal()
    try:
        active_feeds = db.query(FeedSource).filter(FeedSource.is_active == True).all()
        
        results = []
        for feed in active_feeds:
            try:
                task = update_single_feed.delay(feed.id)
                results.append({"feed_id": feed.id, "task_id": task.id})
            except Exception as e:
                logger.error(f"Error scheduling update for feed {feed.id}: {str(e)}")
                results.append({"feed_id": feed.id, "error": str(e)})
        
        return {"scheduled_updates": len(results), "results": results}
    finally:
        db.close()
from datetime import datetime
from sqlalchemy import and_
