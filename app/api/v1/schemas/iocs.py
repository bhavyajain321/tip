"""
Pydantic schemas for IOC operations
"""
from pydantic import BaseModel, validator
from typing import Optional, List, Dict, Any
from datetime import datetime
import re

class IOCBase(BaseModel):
    type: str
    value: str
    confidence: Optional[float] = 0.0
    severity: Optional[str] = "medium"
    tlp: Optional[str] = "white"

    @validator('type')
    def validate_ioc_type(cls, v):
        allowed_types = ['ip', 'domain', 'url', 'hash', 'email', 'file']
        if v.lower() not in allowed_types:
            raise ValueError(f'IOC type must be one of: {allowed_types}')
        return v.lower()

    @validator('severity')
    def validate_severity(cls, v):
        allowed_severities = ['low', 'medium', 'high', 'critical']
        if v and v.lower() not in allowed_severities:
            raise ValueError(f'Severity must be one of: {allowed_severities}')
        return v.lower() if v else 'medium'

    @validator('tlp')
    def validate_tlp(cls, v):
        allowed_tlp = ['white', 'green', 'amber', 'red']
        if v and v.lower() not in allowed_tlp:
            raise ValueError(f'TLP must be one of: {allowed_tlp}')
        return v.lower() if v else 'white'

    @validator('confidence')
    def validate_confidence(cls, v):
        if v is not None and (v < 0.0 or v > 1.0):
            raise ValueError('Confidence must be between 0.0 and 1.0')
        return v

class IOCCreate(IOCBase):
    source_id: Optional[int] = None
    expiration_date: Optional[datetime] = None
    enrichment_data: Optional[Dict[str, Any]] = None

class IOCUpdate(BaseModel):
    confidence: Optional[float] = None
    severity: Optional[str] = None
    tlp: Optional[str] = None
    is_active: Optional[bool] = None
    expiration_date: Optional[datetime] = None
    enrichment_data: Optional[Dict[str, Any]] = None

class IOCResponse(IOCBase):
    id: int
    uuid: str
    normalized_value: str
    first_seen: datetime
    last_seen: datetime
    expiration_date: Optional[datetime] = None
    is_active: bool
    source_id: Optional[int] = None
    enrichment_data: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True

class IOCSearch(BaseModel):
    query: Optional[str] = None
    ioc_types: Optional[List[str]] = None
    severities: Optional[List[str]] = None
    tlp_levels: Optional[List[str]] = None
    confidence_min: Optional[float] = None
    confidence_max: Optional[float] = None
    date_from: Optional[datetime] = None
    date_to: Optional[datetime] = None
    is_active: Optional[bool] = True
    source_ids: Optional[List[int]] = None
    limit: Optional[int] = 100
    offset: Optional[int] = 0
