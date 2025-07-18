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
                    
                    # Use sync version - remove await
                    ioc_service.create_ioc_sync(ioc_data)
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
            # For now, return dummy stats since OTX requires API key
            return {"processed": 0, "added": 0, "updated": 0, "errors": 0}
            
        except Exception as e:
            logger.error(f"Error processing OTX feed {feed_source.name}: {str(e)}")
            raise

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
