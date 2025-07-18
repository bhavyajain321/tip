"""
Initialize the Threat Intelligence Platform
This script sets up the database and creates initial data
"""
import sys
import os
import asyncio

# Add the app to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.db.database import engine, Base, test_connection
from app.models import *  # Import all models
from app.services.feed_service import FeedService
from app.api.v1.schemas.feeds import FeedSourceCreate
from app.db.database import SessionLocal

def create_tables():
    """Create all database tables"""
    print("Creating database tables...")
    try:
        Base.metadata.create_all(bind=engine)
        print("✅ Database tables created successfully!")
        return True
    except Exception as e:
        print(f"❌ Error creating tables: {e}")
        return False

def test_db_connection():
    """Test database connection"""
    print("Testing database connection...")
    if test_connection():
        print("✅ Database connection successful!")
        return True
    else:
        print("❌ Database connection failed!")
        return False

async def create_sample_data():
    """Create sample threat feed sources"""
    print("Creating sample data...")
    db = SessionLocal()
    try:
        feed_service = FeedService(db)
        
        # Create sample feed sources
        sample_feeds = [
            {
                "name": "Sample JSON Feed",
                "type": "json",
                "url": "https://example.com/threat-feed.json",
                "reliability": "b",
                "confidence": 0.7,
                "update_frequency": 3600
            },
            {
                "name": "Custom Threat Feed",
                "type": "custom",
                "reliability": "c",
                "confidence": 0.5,
                "update_frequency": 7200
            }
        ]
        
        for feed_data in sample_feeds:
            try:
                from app.models import FeedSource
                existing = db.query(FeedSource).filter(FeedSource.name == feed_data["name"]).first()
                if not existing:
                    feed_create = FeedSourceCreate(**feed_data)
                    feed = await feed_service.create_feed_source(feed_create)
                    print(f"✅ Created sample feed: {feed.name}")
                else:
                    print(f"⚠️  Feed already exists: {feed_data['name']}")
            except Exception as e:
                print(f"❌ Error creating feed {feed_data['name']}: {e}")
        
        print("✅ Sample data created!")
    except Exception as e:
        print(f"❌ Error creating sample data: {e}")
    finally:
        db.close()

def main():
    """Main initialization function"""
    print("=== Threat Intelligence Platform Initialization ===")
    
    # Test database connection
    if not test_db_connection():
        return False
    
    # Create database tables
    if not create_tables():
        return False
    
    # Create sample data
    asyncio.run(create_sample_data())
    
    print("\n=== Initialization Complete ===")
    print("The Threat Intelligence Platform is ready!")
    print("\nNext steps:")
    print("1. Start the API server: python run_dev.py")
    print("2. Start the Celery worker: python run_worker.py")
    print("3. Visit the API docs: http://localhost:8000/docs")
    
    return True

if __name__ == "__main__":
    main()
