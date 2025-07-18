"""
Pydantic schemas for Feed operations
"""
from pydantic import BaseModel, validator
from typing import Optional, Dict, Any, List
from datetime import datetime

class FeedSourceBase(BaseModel):
    name: str
    type: str
    url: Optional[str] = None
    reliability: Optional[str] = "unknown"
    confidence: Optional[float] = 0.5
    update_frequency: Optional[int] = 3600

    @validator('type')
    def validate_feed_type(cls, v):
        allowed_types = ['otx', 'misp', 'custom', 'csv', 'json', 'xml', 'rss']
        if v.lower() not in allowed_types:
            raise ValueError(f'Feed type must be one of: {allowed_types}')
        return v.lower()

    @validator('reliability')
    def validate_reliability(cls, v):
        allowed_reliability = ['a', 'b', 'c', 'd', 'e', 'f', 'unknown']
        if v and v.lower() not in allowed_reliability:
            raise ValueError(f'Reliability must be one of: {allowed_reliability}')
        return v.lower() if v else 'unknown'

class FeedSourceCreate(FeedSourceBase):
    api_key: Optional[str] = None
    config: Optional[Dict[str, Any]] = None

class FeedSourceUpdate(BaseModel):
    name: Optional[str] = None
    url: Optional[str] = None
    api_key: Optional[str] = None
    reliability: Optional[str] = None
    confidence: Optional[float] = None
    is_active: Optional[bool] = None
    update_frequency: Optional[int] = None
    config: Optional[Dict[str, Any]] = None

class FeedSourceResponse(FeedSourceBase):
    id: int
    uuid: str
    is_active: bool
    last_update: Optional[datetime] = None
    total_iocs: int
    successful_updates: int
    failed_updates: int

    class Config:
        from_attributes = True

class FeedUpdateResponse(BaseModel):
    id: int
    source_id: int
    start_time: datetime
    end_time: Optional[datetime] = None
    status: str
    iocs_processed: int
    iocs_added: int
    iocs_updated: int
    iocs_expired: int
    error_message: Optional[str] = None

    class Config:
        from_attributes = True
