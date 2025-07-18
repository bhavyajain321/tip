# File: app/services/ioc_service.py
"""
IOC service layer for business logic
"""
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from typing import List, Optional
import re
import hashlib
from datetime import datetime

from app.models import IOC, FeedSource
from app.api.v1.schemas.iocs import IOCCreate, IOCUpdate, IOCSearch
from app.utils.validators import IOCValidator
from app.utils.normalizers import IOCNormalizer

class IOCService:
    def __init__(self, db: Session):
        self.db = db
        self.validator = IOCValidator()
        self.normalizer = IOCNormalizer()

    async def create_ioc(self, ioc_data: IOCCreate) -> IOC:
        """Create a new IOC with validation and normalization"""
        # Validate IOC format
        if not self.validator.validate_ioc(ioc_data.type, ioc_data.value):
            raise ValueError(f"Invalid {ioc_data.type} format: {ioc_data.value}")
        
        # Normalize IOC value
        normalized_value = self.normalizer.normalize_ioc(ioc_data.type, ioc_data.value)
        
        # Check for duplicates
        existing_ioc = self.db.query(IOC).filter(
            and_(
                IOC.type == ioc_data.type,
                IOC.normalized_value == normalized_value
            )
        ).first()
        
        if existing_ioc:
            # Update existing IOC
            existing_ioc.last_seen = datetime.utcnow()
            existing_ioc.confidence = max(existing_ioc.confidence, ioc_data.confidence)
            if ioc_data.severity and ioc_data.severity != existing_ioc.severity:
                existing_ioc.severity = self._get_higher_severity(existing_ioc.severity, ioc_data.severity)
            self.db.commit()
            self.db.refresh(existing_ioc)
            return existing_ioc
        
        # Create new IOC
        db_ioc = IOC(
            type=ioc_data.type,
            value=ioc_data.value,
            normalized_value=normalized_value,
            confidence=ioc_data.confidence,
            severity=ioc_data.severity,
            tlp=ioc_data.tlp,
            source_id=ioc_data.source_id,
            expiration_date=ioc_data.expiration_date,
            enrichment_data=ioc_data.enrichment_data or {}
        )
        
        self.db.add(db_ioc)
        self.db.commit()
        self.db.refresh(db_ioc)
        return db_ioc

    async def get_ioc(self, ioc_id: int) -> Optional[IOC]:
        """Get IOC by ID"""
        return self.db.query(IOC).filter(IOC.id == ioc_id).first()

    async def list_iocs(
        self,
        skip: int = 0,
        limit: int = 100,
        ioc_type: Optional[str] = None,
        severity: Optional[str] = None,
        is_active: Optional[bool] = None
    ) -> List[IOC]:
        """List IOCs with filtering"""
        query = self.db.query(IOC)
        
        if ioc_type:
            query = query.filter(IOC.type == ioc_type)
        if severity:
            query = query.filter(IOC.severity == severity)
        if is_active is not None:
            query = query.filter(IOC.is_active == is_active)
        
        return query.offset(skip).limit(limit).all()

    async def search_iocs(self, search_params: IOCSearch) -> List[IOC]:
        """Advanced IOC search"""
        query = self.db.query(IOC)
        
        if search_params.query:
            query = query.filter(
                or_(
                    IOC.value.ilike(f"%{search_params.query}%"),
                    IOC.normalized_value.ilike(f"%{search_params.query}%")
                )
            )
        
        if search_params.ioc_types:
            query = query.filter(IOC.type.in_(search_params.ioc_types))
        
        if search_params.severities:
            query = query.filter(IOC.severity.in_(search_params.severities))
        
        if search_params.tlp_levels:
            query = query.filter(IOC.tlp.in_(search_params.tlp_levels))
        
        if search_params.confidence_min is not None:
            query = query.filter(IOC.confidence >= search_params.confidence_min)
        
        if search_params.confidence_max is not None:
            query = query.filter(IOC.confidence <= search_params.confidence_max)
        
        if search_params.date_from:
            query = query.filter(IOC.first_seen >= search_params.date_from)
        
        if search_params.date_to:
            query = query.filter(IOC.last_seen <= search_params.date_to)
        
        if search_params.is_active is not None:
            query = query.filter(IOC.is_active == search_params.is_active)
        
        if search_params.source_ids:
            query = query.filter(IOC.source_id.in_(search_params.source_ids))
        
        return query.offset(search_params.offset or 0).limit(search_params.limit or 100).all()

    async def update_ioc(self, ioc_id: int, ioc_update: IOCUpdate) -> Optional[IOC]:
        """Update an IOC"""
        db_ioc = self.db.query(IOC).filter(IOC.id == ioc_id).first()
        if not db_ioc:
            return None
        
        update_data = ioc_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_ioc, field, value)
        
        db_ioc.last_seen = datetime.utcnow()
        self.db.commit()
        self.db.refresh(db_ioc)
        return db_ioc

    async def delete_ioc(self, ioc_id: int) -> bool:
        """Delete an IOC"""
        db_ioc = self.db.query(IOC).filter(IOC.id == ioc_id).first()
        if not db_ioc:
            return False
        
        self.db.delete(db_ioc)
        self.db.commit()
        return True

    async def bulk_create_iocs(self, iocs_data: List[IOCCreate]) -> dict:
        """Bulk create IOCs"""
        created = 0
        updated = 0
        errors = []
        
        for ioc_data in iocs_data:
            try:
                ioc = await self.create_ioc(ioc_data)
                if ioc:
                    created += 1
            except Exception as e:
                updated += 1 if "already exists" in str(e).lower() else 0
                errors.append(f"Error processing {ioc_data.value}: {str(e)}")
        
        return {
            "created": created,
            "updated": updated,
            "errors": errors,
            "total_processed": len(iocs_data)
        }

    async def lookup_ioc_by_value(self, ioc_value: str) -> Optional[IOC]:
        """Lookup IOC by value (exact or normalized)"""
        # Try exact match first
        ioc = self.db.query(IOC).filter(IOC.value == ioc_value).first()
        if ioc:
            return ioc
        
        # Try normalized value for common IOC types
        for ioc_type in ['ip', 'domain', 'url', 'hash', 'email']:
            try:
                normalized = self.normalizer.normalize_ioc(ioc_type, ioc_value)
                ioc = self.db.query(IOC).filter(
                    and_(
                        IOC.type == ioc_type,
                        IOC.normalized_value == normalized
                    )
                ).first()
                if ioc:
                    return ioc
            except:
                continue
        
        return None

    def create_ioc_sync(self, ioc_data: IOCCreate) -> IOC:
        """Synchronous version of create_ioc for Celery tasks"""
        # Validate IOC format
        if not self.validator.validate_ioc(ioc_data.type, ioc_data.value):
            raise ValueError(f"Invalid {ioc_data.type} format: {ioc_data.value}")
        
        # Normalize IOC value
        normalized_value = self.normalizer.normalize_ioc(ioc_data.type, ioc_data.value)
        
        # Check for duplicates
        existing_ioc = self.db.query(IOC).filter(
            and_(
                IOC.type == ioc_data.type,
                IOC.normalized_value == normalized_value
            )
        ).first()
        
        if existing_ioc:
            # Update existing IOC
            existing_ioc.last_seen = datetime.utcnow()
            existing_ioc.confidence = max(existing_ioc.confidence, ioc_data.confidence)
            if ioc_data.severity and ioc_data.severity != existing_ioc.severity:
                existing_ioc.severity = self._get_higher_severity(existing_ioc.severity, ioc_data.severity)
            self.db.commit()
            self.db.refresh(existing_ioc)
            return existing_ioc
        
        # Create new IOC
        db_ioc = IOC(
            type=ioc_data.type,
            value=ioc_data.value,
            normalized_value=normalized_value,
            confidence=ioc_data.confidence,
            severity=ioc_data.severity,
            tlp=ioc_data.tlp,
            source_id=ioc_data.source_id,
            expiration_date=ioc_data.expiration_date,
            enrichment_data=ioc_data.enrichment_data or {}
        )
        
        self.db.add(db_ioc)
        self.db.commit()
        self.db.refresh(db_ioc)
        return db_ioc

# Add the missing import at the top if not there
from datetime import datetime
from sqlalchemy import and_

# Make sure the create_ioc_sync method exists
