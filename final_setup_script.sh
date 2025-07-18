#!/bin/bash

# Final setup script to complete the Threat Intelligence Platform installation
# This script should be run after the basic setup

echo "=== Final Setup and Configuration ==="

cd ~/threat-intelligence-platform

# Update the API router to include all endpoints
cat > app/api/v1/router.py << 'EOF'
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
EOF

# Create the missing directories for endpoints
mkdir -p app/api/v1/endpoints
mkdir -p app/api/v1/schemas
mkdir -p app/services

# Create init files for the new directories
touch app/api/v1/endpoints/__init__.py
touch app/api/v1/schemas/__init__.py

# Create the feed service
cat > app/services/feed_service.py << 'EOF'
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
EOF

# Create the threat feed tasks for Celery
mkdir -p app/services/threat_feeds
cat > app/services/threat_feeds/__init__.py << 'EOF'
# Threat feed services
EOF

cat > app/services/threat_feeds/tasks.py << 'EOF'
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
EOF

# Create basic feed processors
cat > app/services/threat_feeds/processors.py << 'EOF'
"""
Feed processors for different threat intelligence sources
"""
import requests
import json
from abc import ABC, abstractmethod
from typing import Dict, Any, List
from datetime import datetime, timedelta
import logging

from app.models import IOC, FeedSource
from app.services.ioc_service import IOCService
from app.api.v1.schemas.iocs import IOCCreate

logger = logging.getLogger(__name__)

class BaseFeedProcessor(ABC):
    """Base class for feed processors"""
    
    @abstractmethod
    def process_feed(self, feed_source: FeedSource, db_session) -> Dict[str, int]:
        """Process a threat feed and return statistics"""
        pass

class CustomJSONProcessor(BaseFeedProcessor):
    """Processor for custom JSON feeds"""
    
    def process_feed(self, feed_source: FeedSource, db_session) -> Dict[str, int]:
        """Process a custom JSON threat feed"""
        try:
            headers = {}
            if feed_source.api_key:
                headers['Authorization'] = f"Bearer {feed_source.api_key}"
            
            response = requests.get(feed_source.url, headers=headers, timeout=30)
            response.raise_for_status()
            
            data = response.json()
            
            # Process IOCs from JSON
            ioc_service = IOCService(db_session)
            stats = {"processed": 0, "added": 0, "updated": 0, "errors": 0}
            
            # Assume JSON structure has an 'indicators' field
            indicators = data.get('indicators', [])
            
            for indicator in indicators:
                try:
                    ioc_data = IOCCreate(
                        type=indicator.get('type', 'unknown'),
                        value=indicator.get('value', ''),
                        confidence=float(indicator.get('confidence', 0.5)),
                        severity=indicator.get('severity', 'medium'),
                        tlp=indicator.get('tlp', 'white'),
                        source_id=feed_source.id
                    )
                    
                    await ioc_service.create_ioc(ioc_data)
                    stats["added"] += 1
                    
                except Exception as e:
                    logger.warning(f"Error processing IOC {indicator}: {str(e)}")
                    stats["errors"] += 1
                
                stats["processed"] += 1
            
            return stats
            
        except Exception as e:
            logger.error(f"Error processing JSON feed {feed_source.name}: {str(e)}")
            raise

class OTXProcessor(BaseFeedProcessor):
    """Processor for AlienVault OTX feeds"""
    
    def process_feed(self, feed_source: FeedSource, db_session) -> Dict[str, int]:
        """Process OTX threat feed"""
        try:
            from OTXv2 import OTXv2
            
            if not feed_source.api_key:
                raise ValueError("OTX API key is required")
            
            otx = OTXv2(feed_source.api_key)
            
            # Get recent pulses
            pulses = otx.getall()
            
            ioc_service = IOCService(db_session)
            stats = {"processed": 0, "added": 0, "updated": 0, "errors": 0}
            
            for pulse in pulses:
                for indicator in pulse.get('indicators', []):
                    try:
                        ioc_data = IOCCreate(
                            type=self._map_otx_type(indicator.get('type')),
                            value=indicator.get('indicator', ''),
                            confidence=0.8,  # OTX indicators have high confidence
                            severity='medium',
                            tlp='white',
                            source_id=feed_source.id
                        )
                        
                        await ioc_service.create_ioc(ioc_data)
                        stats["added"] += 1
                        
                    except Exception as e:
                        logger.warning(f"Error processing OTX IOC {indicator}: {str(e)}")
                        stats["errors"] += 1
                    
                    stats["processed"] += 1
            
            return stats
            
        except Exception as e:
            logger.error(f"Error processing OTX feed {feed_source.name}: {str(e)}")
            raise
    
    def _map_otx_type(self, otx_type: str) -> str:
        """Map OTX indicator types to our IOC types"""
        mapping = {
            'IPv4': 'ip',
            'IPv6': 'ip',
            'domain': 'domain',
            'hostname': 'domain',
            'URL': 'url',
            'MD5': 'hash',
            'SHA1': 'hash',
            'SHA256': 'hash',
            'email': 'email'
        }
        return mapping.get(otx_type, 'unknown')

# Processor registry
PROCESSORS = {
    'custom': CustomJSONProcessor,
    'json': CustomJSONProcessor,
    'otx': OTXProcessor,
}

def get_feed_processor(feed_type: str) -> BaseFeedProcessor:
    """Get appropriate processor for feed type"""
    processor_class = PROCESSORS.get(feed_type.lower())
    if processor_class:
        return processor_class()
    return None
EOF

# Create a startup script that initializes everything
cat > initialize.py << 'EOF'
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
from app.services.ioc_service import IOCService
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
EOF

# Create a comprehensive installation script
cat > install.sh << 'EOF'
#!/bin/bash

echo "=== Threat Intelligence Platform Installation ==="

# Check if we're in the right directory
if [ ! -f "requirements.txt" ]; then
    echo "❌ Please run this script from the threat-intelligence-platform directory"
    exit 1
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Install Python dependencies
echo "Installing Python dependencies..."
pip install -r requirements.txt

# Check if PostgreSQL is running
echo "Checking PostgreSQL service..."
sudo systemctl status postgresql > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "Starting PostgreSQL..."
    sudo systemctl start postgresql
fi

# Check if Redis is running
echo "Checking Redis service..."
sudo systemctl status redis-server > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "Starting Redis..."
    sudo systemctl start redis-server
fi

# Initialize the database
echo "Initializing database..."
python initialize.py

# Make scripts executable
chmod +x run_dev.py
chmod +x run_worker.py

echo ""
echo "=== Installation Complete! ==="
echo ""
echo "To start the platform:"
echo "1. Terminal 1: python run_dev.py    # Start API server"
echo "2. Terminal 2: python run_worker.py # Start Celery worker"
echo ""
echo "Then visit: http://localhost:8000/docs"
echo ""
EOF

chmod +x install.sh

# Create a quick start guide
cat > QUICKSTART.md << 'EOF'
# Threat Intelligence Platform - Quick Start Guide

## Installation

1. **Run the setup script:**
   ```bash
   ./setup.sh
   ```

2. **Navigate to project directory:**
   ```bash
   cd ~/threat-intelligence-platform
   ```

3. **Activate virtual environment:**
   ```bash
   source venv/bin/activate
   ```

4. **Run the installation:**
   ```bash
   ./install.sh
   ```

## Starting the Platform

1. **Start the API server (Terminal 1):**
   ```bash
   python run_dev.py
   ```

2. **Start the Celery worker (Terminal 2):**
   ```bash
   python run_worker.py
   ```

## Usage

### API Documentation
- Visit: http://localhost:8000/docs
- Interactive API documentation with all endpoints

### Basic Operations

1. **Check API Status:**
   ```bash
   curl http://localhost:8000/api/v1/status
   ```

2. **Create a Threat Feed:**
   ```bash
   curl -X POST "http://localhost:8000/api/v1/feeds/" \
        -H "Content-Type: application/json" \
        -d '{
          "name": "My Threat Feed",
          "type": "json",
          "url": "https://example.com/feed.json",
          "reliability": "b",
          "confidence": 0.8
        }'
   ```

3. **Add an IOC:**
   ```bash
   curl -X POST "http://localhost:8000/api/v1/iocs/" \
        -H "Content-Type: application/json" \
        -d '{
          "type": "ip",
          "value": "192.168.1.100",
          "confidence": 0.9,
          "severity": "high"
        }'
   ```

4. **Search IOCs:**
   ```bash
   curl "http://localhost:8000/api/v1/iocs/?ioc_type=ip&severity=high"
   ```

5. **Lookup an IOC:**
   ```bash
   curl "http://localhost:8000/api/v1/iocs/lookup/192.168.1.100"
   ```

## Configuration

Edit the `.env` file to configure:
- Database connection
- Redis connection  
- API keys for external threat feeds
- Application settings

## Logs

Check logs for troubleshooting:
- Application logs: Check terminal output
- PostgreSQL logs: `/var/log/postgresql/`
- Redis logs: `/var/log/redis/`

## Next Steps

1. **Add External Threat Feeds:**
   - Get an OTX API key from AlienVault
   - Configure MISP integration
   - Add custom JSON feeds

2. **Set up Monitoring:**
   - Configure Prometheus metrics
   - Set up Grafana dashboards

3. **Integrate with Security Tools:**
   - Configure SIEM integration
   - Set up EDR connections
   - Configure automated responses

## Troubleshooting

**Database Connection Issues:**
```bash
sudo systemctl restart postgresql
```

**Redis Connection Issues:**
```bash
sudo systemctl restart redis-server
```

**Permission Issues:**
```bash
sudo chown -R $USER:$USER ~/threat-intelligence-platform
```

**Python Package Issues:**
```bash
pip install --upgrade pip
pip install -r requirements.txt --force-reinstall
```
EOF

echo ""
echo "=== Final Setup Complete ==="
echo ""
echo "Your Threat Intelligence Platform is ready for installation!"
echo ""
echo "To install and run:"
echo "1. chmod +x setup.sh && ./setup.sh"
echo "2. cd ~/threat-intelligence-platform"  
echo "3. source venv/bin/activate"
echo "4. ./install.sh"
echo "5. python run_dev.py (in terminal 1)"
echo "6. python run_worker.py (in terminal 2)"
echo ""
echo "Then visit: http://localhost:8000/docs"
echo ""
echo "See QUICKSTART.md for detailed usage instructions."
