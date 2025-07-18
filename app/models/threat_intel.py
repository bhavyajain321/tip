"""
Enhanced threat intelligence models for comprehensive threat data
"""
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, Float, ForeignKey, JSON, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime
import uuid
import enum

from app.db.database import Base

class ThreatType(enum.Enum):
    """Threat types based on MITRE ATT&CK and STIX standards"""
    MALWARE = "malware"
    ATTACK_PATTERN = "attack-pattern"
    TOOL = "tool"
    VULNERABILITY = "vulnerability"
    CAMPAIGN = "campaign"
    INTRUSION_SET = "intrusion-set"
    COURSE_OF_ACTION = "course-of-action"
    INFRASTRUCTURE = "infrastructure"
    OBSERVED_DATA = "observed-data"

class ThreatFamily(Base):
    """Threat family/malware family classification"""
    __tablename__ = "threat_families"
    
    id = Column(Integer, primary_key=True, index=True)
    uuid = Column(String(36), unique=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(255), nullable=False, unique=True)
    aliases = Column(JSON)
    
    # Classification
    family_type = Column(String(50))
    category = Column(String(100))
    platform = Column(String(100))
    
    # Threat intelligence
    first_seen = Column(DateTime, default=func.now())
    last_seen = Column(DateTime, default=func.now())
    description = Column(Text)
    
    # MITRE ATT&CK mapping
    mitre_id = Column(String(20))
    tactics = Column(JSON)
    techniques = Column(JSON)
    
    # Relationships
    iocs = relationship("IOC", back_populates="threat_family")
    campaigns = relationship("Campaign", back_populates="threat_family")

class ThreatIntelligence(Base):
    """Comprehensive threat intelligence data"""
    __tablename__ = "threat_intelligence"
    
    id = Column(Integer, primary_key=True, index=True)
    uuid = Column(String(36), unique=True, default=lambda: str(uuid.uuid4()))
    
    # Core identification
    threat_type = Column(Enum(ThreatType), nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    
    # STIX/TAXII compliance
    stix_id = Column(String(100))
    created = Column(DateTime, default=func.now())
    modified = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Threat data
    kill_chain_phases = Column(JSON)
    labels = Column(JSON)
    confidence = Column(Float, default=0.0)
    severity = Column(String(20), default="medium")
    
    # Attribution
    attributed_to = Column(JSON)
    aliases = Column(JSON)
    
    # Intelligence metadata
    first_seen = Column(DateTime, default=func.now())
    last_seen = Column(DateTime, default=func.now())
    
    # Relationships
    threat_family_id = Column(Integer, ForeignKey("threat_families.id"))
    source_id = Column(Integer, ForeignKey("feed_sources.id"))
    
    # Raw data
    raw_data = Column(JSON)

class EnrichmentSource(Base):
    """Sources for IOC enrichment"""
    __tablename__ = "enrichment_sources"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, unique=True)
    source_type = Column(String(50))
    url = Column(String(500))
    api_key = Column(String(255))
    is_active = Column(Boolean, default=True)
    rate_limit = Column(Integer, default=100)
    cost_per_query = Column(Float, default=0.0)
    
    # Configuration
    config = Column(JSON)
    
    # Statistics
    total_queries = Column(Integer, default=0)
    successful_queries = Column(Integer, default=0)
    failed_queries = Column(Integer, default=0)
    
    # Relationships
    enrichments = relationship("EnrichmentData", back_populates="source")
