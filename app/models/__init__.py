"""
Database models for the Threat Intelligence Platform
"""
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, Float, ForeignKey, Index, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, backref
from sqlalchemy.sql import func
import uuid
from datetime import datetime

from app.db.database import Base

# IOCs (Indicators of Compromise) Table
class IOC(Base):
    __tablename__ = "iocs"
    
    id = Column(Integer, primary_key=True, index=True)
    uuid = Column(String(36), unique=True, default=lambda: str(uuid.uuid4()))
    type = Column(String(50), nullable=False)
    value = Column(Text, nullable=False)
    normalized_value = Column(Text, index=True)
    
    # Threat Intelligence Data
    confidence = Column(Float, default=0.0)
    severity = Column(String(20), default="medium")
    tlp = Column(String(20), default="white")
    
    # Metadata
    first_seen = Column(DateTime, default=func.now())
    last_seen = Column(DateTime, default=func.now())
    expiration_date = Column(DateTime)
    is_active = Column(Boolean, default=True)
    
    # Relationships
    source_id = Column(Integer, ForeignKey("feed_sources.id"))
    source = relationship("FeedSource", back_populates="iocs")
    
    # Threat family relationship
    threat_family_id = Column(Integer, ForeignKey("threat_families.id"))
    threat_family = relationship("ThreatFamily", back_populates="iocs")
    
    # Enrichment data
    enrichment_data = Column(JSON)
    
    # MITRE ATT&CK mapping
    mitre_tactics = Column(JSON)
    mitre_techniques = Column(JSON)
    kill_chain_phase = Column(String(50))
    
    # Indexes
    __table_args__ = (
        Index('idx_ioc_type_value', 'type', 'normalized_value'),
        Index('idx_ioc_confidence', 'confidence'),
        Index('idx_ioc_severity', 'severity'),
        Index('idx_ioc_active', 'is_active'),
        Index('idx_ioc_threat_family', 'threat_family_id'),
    )

# Threat Actors Table
class ThreatActor(Base):
    __tablename__ = "threat_actors"
    
    id = Column(Integer, primary_key=True, index=True)
    uuid = Column(String(36), unique=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(255), nullable=False, index=True)
    aliases = Column(JSON)
    
    # Classification
    type = Column(String(50))
    sophistication = Column(String(20))
    motivation = Column(String(50))
    
    # Geographic Information
    country = Column(String(100))
    region = Column(String(100))
    
    # Activity Information
    first_seen = Column(DateTime, default=func.now())
    last_seen = Column(DateTime, default=func.now())
    is_active = Column(Boolean, default=True)
    
    # Description and intelligence
    description = Column(Text)
    intelligence_data = Column(JSON)
    
    # Relationships
    campaigns = relationship("Campaign", back_populates="threat_actor")

# Campaigns Table
class Campaign(Base):
    __tablename__ = "campaigns"
    
    id = Column(Integer, primary_key=True, index=True)
    uuid = Column(String(36), unique=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(255), nullable=False, index=True)
    
    # Campaign Details
    description = Column(Text)
    objectives = Column(JSON)
    
    # Timeline
    start_date = Column(DateTime)
    end_date = Column(DateTime)
    first_seen = Column(DateTime, default=func.now())
    last_seen = Column(DateTime, default=func.now())
    is_active = Column(Boolean, default=True)
    
    # Classification
    confidence = Column(Float, default=0.0)
    severity = Column(String(20), default="medium")
    
    # Relationships
    threat_actor_id = Column(Integer, ForeignKey("threat_actors.id"))
    threat_actor = relationship("ThreatActor", back_populates="campaigns")
    
    # Threat family relationship
    threat_family_id = Column(Integer, ForeignKey("threat_families.id"))
    threat_family = relationship("ThreatFamily", back_populates="campaigns")
    
    # Associated IOCs
    campaign_iocs = relationship("CampaignIOC", back_populates="campaign")

# Campaign-IOC Association Table
class CampaignIOC(Base):
    __tablename__ = "campaign_iocs"
    
    id = Column(Integer, primary_key=True, index=True)
    campaign_id = Column(Integer, ForeignKey("campaigns.id"))
    ioc_id = Column(Integer, ForeignKey("iocs.id"))
    
    # Association metadata
    confidence = Column(Float, default=0.0)
    first_seen = Column(DateTime, default=func.now())
    relationship_type = Column(String(50))
    
    # Relationships
    campaign = relationship("Campaign", back_populates="campaign_iocs")
    ioc = relationship("IOC")

# Feed Sources Table
class FeedSource(Base):
    __tablename__ = "feed_sources"
    
    id = Column(Integer, primary_key=True, index=True)
    uuid = Column(String(36), unique=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(255), nullable=False, unique=True)
    
    # Source Configuration
    type = Column(String(50), nullable=False)
    url = Column(String(500))
    api_key = Column(String(255))
    
    # Source Quality
    reliability = Column(String(20), default="unknown")
    confidence = Column(Float, default=0.5)
    
    # Status
    is_active = Column(Boolean, default=True)
    last_update = Column(DateTime)
    update_frequency = Column(Integer, default=3600)
    
    # Statistics
    total_iocs = Column(Integer, default=0)
    successful_updates = Column(Integer, default=0)
    failed_updates = Column(Integer, default=0)
    
    # Configuration
    config = Column(JSON)
    
    # Relationships
    iocs = relationship("IOC", back_populates="source")
    feed_updates = relationship("FeedUpdate", back_populates="source")

# Feed Updates Log
class FeedUpdate(Base):
    __tablename__ = "feed_updates"
    
    id = Column(Integer, primary_key=True, index=True)
    source_id = Column(Integer, ForeignKey("feed_sources.id"))
    
    # Update Information
    start_time = Column(DateTime, default=func.now())
    end_time = Column(DateTime)
    status = Column(String(20))
    
    # Statistics
    iocs_processed = Column(Integer, default=0)
    iocs_added = Column(Integer, default=0)
    iocs_updated = Column(Integer, default=0)
    iocs_expired = Column(Integer, default=0)
    
    # Error Information
    error_message = Column(Text)
    error_details = Column(JSON)
    
    # Relationships
    source = relationship("FeedSource", back_populates="feed_updates")

# Enhanced Enrichment Data Table
class EnrichmentData(Base):
    __tablename__ = "enrichment_data"
    
    id = Column(Integer, primary_key=True, index=True)
    ioc_id = Column(Integer, ForeignKey("iocs.id"))
    source_id = Column(Integer, ForeignKey("enrichment_sources.id"))
    
    # Enrichment metadata
    enrichment_type = Column(String(50), nullable=False)
    query_value = Column(String(500))
    
    # Enrichment results
    data = Column(JSON)
    summary = Column(JSON)
    confidence = Column(Float, default=0.0)
    
    # Geolocation data
    country = Column(String(100))
    region = Column(String(100))
    city = Column(String(100))
    latitude = Column(Float)
    longitude = Column(Float)
    
    # Network data
    asn = Column(String(20))
    organization = Column(String(255))
    isp = Column(String(255))
    
    # Reputation data
    reputation_score = Column(Float)
    malicious = Column(Boolean)
    categories = Column(JSON)
    
    # Metadata
    created_at = Column(DateTime, default=func.now())
    expires_at = Column(DateTime)
    is_valid = Column(Boolean, default=True)
    
    # Relationships
    ioc = relationship("IOC")
    source = relationship("EnrichmentSource", back_populates="enrichments")

# Import threat intelligence models
from app.models.threat_intel import ThreatType, ThreatFamily, ThreatIntelligence, EnrichmentSource

# Export all models
__all__ = [
    "IOC",
    "ThreatActor", 
    "Campaign",
    "CampaignIOC",
    "FeedSource",
    "FeedUpdate",
    "EnrichmentData",
    "ThreatFamily",
    "ThreatIntelligence",
    "EnrichmentSource",
    "ThreatType"
]
