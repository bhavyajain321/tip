"""
IOC (Indicators of Compromise) API endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.db.database import get_db
from app.models import IOC, FeedSource
from app.api.v1.schemas.iocs import IOCCreate, IOCUpdate, IOCResponse, IOCSearch
from app.services.ioc_service import IOCService

router = APIRouter()

@router.post("/", response_model=IOCResponse, status_code=status.HTTP_201_CREATED)
async def create_ioc(
    ioc_data: IOCCreate,
    db: Session = Depends(get_db)
):
    """Create a new IOC"""
    try:
        ioc_service = IOCService(db)
        ioc = await ioc_service.create_ioc(ioc_data)
        return ioc
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{ioc_id}", response_model=IOCResponse)
async def get_ioc(
    ioc_id: int,
    db: Session = Depends(get_db)
):
    """Get IOC by ID"""
    ioc_service = IOCService(db)
    ioc = await ioc_service.get_ioc(ioc_id)
    if not ioc:
        raise HTTPException(status_code=404, detail="IOC not found")
    return ioc

@router.get("/", response_model=List[IOCResponse])
async def list_iocs(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, le=1000),
    ioc_type: Optional[str] = None,
    severity: Optional[str] = None,
    is_active: Optional[bool] = True,
    db: Session = Depends(get_db)
):
    """List IOCs with filtering and pagination"""
    ioc_service = IOCService(db)
    iocs = await ioc_service.list_iocs(
        skip=skip,
        limit=limit,
        ioc_type=ioc_type,
        severity=severity,
        is_active=is_active
    )
    return iocs

@router.post("/search", response_model=List[IOCResponse])
async def search_iocs(
    search_params: IOCSearch,
    db: Session = Depends(get_db)
):
    """Advanced IOC search"""
    ioc_service = IOCService(db)
    iocs = await ioc_service.search_iocs(search_params)
    return iocs

@router.put("/{ioc_id}", response_model=IOCResponse)
async def update_ioc(
    ioc_id: int,
    ioc_update: IOCUpdate,
    db: Session = Depends(get_db)
):
    """Update an IOC"""
    ioc_service = IOCService(db)
    ioc = await ioc_service.update_ioc(ioc_id, ioc_update)
    if not ioc:
        raise HTTPException(status_code=404, detail="IOC not found")
    return ioc

@router.delete("/{ioc_id}")
async def delete_ioc(
    ioc_id: int,
    db: Session = Depends(get_db)
):
    """Delete an IOC"""
    ioc_service = IOCService(db)
    success = await ioc_service.delete_ioc(ioc_id)
    if not success:
        raise HTTPException(status_code=404, detail="IOC not found")
    return {"message": "IOC deleted successfully"}

@router.post("/bulk", status_code=status.HTTP_201_CREATED)
async def bulk_create_iocs(
    iocs_data: List[IOCCreate],
    db: Session = Depends(get_db)
):
    """Bulk create IOCs"""
    ioc_service = IOCService(db)
    result = await ioc_service.bulk_create_iocs(iocs_data)
    return result

@router.get("/lookup/{ioc_value}")
async def lookup_ioc(
    ioc_value: str,
    db: Session = Depends(get_db)
):
    """Lookup IOC by value"""
    ioc_service = IOCService(db)
    ioc = await ioc_service.lookup_ioc_by_value(ioc_value)
    if not ioc:
        return {"found": False, "ioc": None}
    return {"found": True, "ioc": ioc}
