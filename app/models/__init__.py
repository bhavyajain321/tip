"""
Database models for the Threat Intelligence Platform
Save as: app/models/__init__.py
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
    type = Column(String(50), nullable=False)  # ip, domain, url, hash, email
    value = Column(Text, nullable=False)
    normalized_value = Column(Text, index=True)
    
    # Threat Intelligence Data
    confidence = Column(Float, default=0.0)
    severity = Column(String(20), default="medium")  # low, medium, high, critical
    tlp = Column(String(20), default="white")  # white, green, amber, red
    
    # Metadata
    first_seen = Column(DateTime, default=func.now())
    last_seen = Column(DateTime, default=func.now())
    expiration_date = Column(DateTime)
    is_active = Column(Boolean, default=True)
    
    # Relationships
    source_id = Column(Integer, ForeignKey("feed_sources.id"))
    source = relationship("FeedSource", back_populates="iocs")
    
    # Enrichment data
    enrichment_data = Column(JSON)
    
    # Indexes
    __table_args__ = (
        Index('idx_ioc_type_value', 'type', 'normalized_value'),
        Index('idx_ioc_confidence', 'confidence'),
        Index('idx_ioc_severity', 'severity'),
        Index('idx_ioc_active', 'is_active'),
    )

# Threat Actors Table
class ThreatActor(Base):
    __tablename__ = "threat_actors"
    
    id = Column(Integer, primary_key=True, index=True)
    uuid = Column(String(36), unique=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(255), nullable=False, index=True)
    aliases = Column(JSON)  # List of aliases
    
    # Classification
    type = Column(String(50))  # apt, cybercriminal, hacktivist, etc.
    sophistication = Column(String(20))  # low, medium, high, expert
    motivation = Column(String(50))  # financial, espionage, ideology, etc.
    
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
    objectives = Column(JSON)  # List of campaign objectives
    
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
    relationship_type = Column(String(50))  # uses, targets, drops, etc.
    
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
    type = Column(String(50), nullable=False)  # otx, misp, custom, etc.
    url = Column(String(500))
    api_key = Column(String(255))
    
    # Source Quality
    reliability = Column(String(20), default="unknown")  # A, B, C, D, E, F
    confidence = Column(Float, default=0.5)
    
    # Status
    is_active = Column(Boolean, default=True)
    last_update = Column(DateTime)
    update_frequency = Column(Integer, default=3600)  # seconds
    
    # Statistics
    total_iocs = Column(Integer, default=0)
    successful_updates = Column(Integer, default=0)
    failed_updates = Column(Integer, default=0)
    
    # Configuration
    config = Column(JSON)  # Source-specific configuration
    
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
    status = Column(String(20))  # running, completed, failed
    
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

# Enrichment Data Table
class EnrichmentData(Base):
    __tablename__ = "enrichment_data"
    
    id = Column(Integer, primary_key=True, index=True)
    ioc_id = Column(Integer, ForeignKey("iocs.id"))
    
    # Enrichment Type
    enrichment_type = Column(String(50), nullable=False)  # geoip, whois, dns, etc.
    
    # Enrichment Results
    enrichment_data = Column(JSON)
    confidence = Column(Float, default=0.0)
    
    # Metadata
    created_at = Column(DateTime, default=func.now())
    expires_at = Column(DateTime)
    is_valid = Column(Boolean, default=True)
    
    # Source
    enrichment_source = Column(String(100))
    
    # Relationships
    ioc = relationship("IOC")

# ML Models Table
class MLModel(Base):
    __tablename__ = "ml_models"
    
    id = Column(Integer, primary_key=True, index=True)
    uuid = Column(String(36), unique=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(255), nullable=False)
    
    # Model Information
    model_type = Column(String(50), nullable=False)  # clustering, classification, etc.
    algorithm = Column(String(100))
    version = Column(String(50))
    
    # Model Performance
    accuracy = Column(Float)
    precision = Column(Float)
    recall = Column(Float)
    f1_score = Column(Float)
    
    # Model Status
    is_active = Column(Boolean, default=True)
    is_trained = Column(Boolean, default=False)
    
    # Timestamps
    created_at = Column(DateTime, default=func.now())
    trained_at = Column(DateTime)
    last_used = Column(DateTime)
    
    # Model Data
    model_data = Column(JSON)  # Serialized model parameters
    training_config = Column(JSON)
    
    # Relationships
    predictions = relationship("MLPrediction", back_populates="model")

# ML Predictions Table
class MLPrediction(Base):
    __tablename__ = "ml_predictions"
    
    id = Column(Integer, primary_key=True, index=True)
    model_id = Column(Integer, ForeignKey("ml_models.id"))
    ioc_id = Column(Integer, ForeignKey("iocs.id"))
    
    # Prediction Results
    prediction = Column(String(100))
    confidence = Column(Float)
    probability_scores = Column(JSON)
    
    # Metadata
    created_at = Column(DateTime, default=func.now())
    is_validated = Column(Boolean, default=False)
    actual_result = Column(String(100))  # For validation
    
    # Relationships
    model = relationship("MLModel", back_populates="predictions")
    ioc = relationship("IOC")

# Correlation Rules Table
class CorrelationRule(Base):
    __tablename__ = "correlation_rules"
    
    id = Column(Integer, primary_key=True, index=True)
    uuid = Column(String(36), unique=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(255), nullable=False)
    
    # Rule Definition
    rule_type = Column(String(50), nullable=False)  # pattern, temporal, etc.
    conditions = Column(JSON)  # Rule conditions
    actions = Column(JSON)  # Actions to take
    
    # Rule Status
    is_active = Column(Boolean, default=True)
    confidence_threshold = Column(Float, default=0.7)
    
    # Statistics
    total_matches = Column(Integer, default=0)
    true_positives = Column(Integer, default=0)
    false_positives = Column(Integer, default=0)
    
    # Timestamps
    created_at = Column(DateTime, default=func.now())
    last_triggered = Column(DateTime)
    
    # Relationships
    correlations = relationship("ThreatCorrelation", back_populates="rule")

# Threat Correlations Table
class ThreatCorrelation(Base):
    __tablename__ = "threat_correlations"
    
    id = Column(Integer, primary_key=True, index=True)
    rule_id = Column(Integer, ForeignKey("correlation_rules.id"))
    
    # Correlation Details
    correlation_type = Column(String(50))
    confidence = Column(Float)
    severity = Column(String(20))
    
    # Correlated IOCs
    primary_ioc_id = Column(Integer, ForeignKey("iocs.id"))
    related_iocs = Column(JSON)  # List of related IOC IDs
    
    # Context
    context_data = Column(JSON)
    timeline = Column(JSON)
    
    # Status
    status = Column(String(20), default="active")  # active, resolved, false_positive
    analyst_notes = Column(Text)
    
    # Timestamps
    detected_at = Column(DateTime, default=func.now())
    resolved_at = Column(DateTime)
    
    # Relationships
    rule = relationship("CorrelationRule", back_populates="correlations")
    primary_ioc = relationship("IOC")

# Remediation Templates Table
class RemediationTemplate(Base):
    __tablename__ = "remediation_templates"
    
    id = Column(Integer, primary_key=True, index=True)
    uuid = Column(String(36), unique=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(255), nullable=False)
    
    # Template Details
    threat_type = Column(String(100))  # malware, phishing, etc.
    device_type = Column(String(50))  # windows, linux, firewall, etc.
    severity = Column(String(20))
    
    # Remediation Steps
    steps = Column(JSON)  # List of remediation steps
    scripts = Column(JSON)  # Automated scripts
    manual_instructions = Column(Text)
    
    # Effectiveness
    success_rate = Column(Float, default=0.0)
    avg_execution_time = Column(Integer)  # seconds
    
    # Status
    is_active = Column(Boolean, default=True)
    is_automated = Column(Boolean, default=False)
    
    # Metadata
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now())
    created_by = Column(String(100))
    
    # Relationships
    remediations = relationship("RemediationAction", back_populates="template")

# Remediation Actions Table
class RemediationAction(Base):
    __tablename__ = "remediation_actions"
    
    id = Column(Integer, primary_key=True, index=True)
    template_id = Column(Integer, ForeignKey("remediation_templates.id"))
    ioc_id = Column(Integer, ForeignKey("iocs.id"))
    
    # Action Details
    action_type = Column(String(50))  # block, quarantine, alert, etc.
    target_system = Column(String(100))
    
    # Execution
    status = Column(String(20), default="pending")  # pending, running, completed, failed
    started_at = Column(DateTime)
    completed_at = Column(DateTime)
    
    # Results
    execution_log = Column(Text)
    error_message = Column(Text)
    success = Column(Boolean, default=False)
    
    # Context
    triggered_by = Column(String(100))  # user, automation, correlation
    context_data = Column(JSON)
    
    # Relationships
    template = relationship("RemediationTemplate", back_populates="remediations")
    ioc = relationship("IOC")

# API Keys Table
class APIKey(Base):
    __tablename__ = "api_keys"
    
    id = Column(Integer, primary_key=True, index=True)
    key_id = Column(String(36), unique=True, default=lambda: str(uuid.uuid4()))
    key_hash = Column(String(255), nullable=False)
    
    # Key Details
    name = Column(String(255))
    description = Column(Text)
    permissions = Column(JSON)  # List of allowed operations
    
    # Usage Limits
    rate_limit_per_minute = Column(Integer, default=100)
    rate_limit_per_hour = Column(Integer, default=1000)
    rate_limit_per_day = Column(Integer, default=10000)
    
    # Status
    is_active = Column(Boolean, default=True)
    expires_at = Column(DateTime)
    
    # Usage Statistics
    total_requests = Column(Integer, default=0)
    last_used = Column(DateTime)
    
    # Metadata
    created_at = Column(DateTime, default=func.now())
    created_by = Column(String(100))

# System Metrics Table
class SystemMetric(Base):
    __tablename__ = "system_metrics"
    
    id = Column(Integer, primary_key=True, index=True)
    metric_name = Column(String(100), nullable=False)
    metric_type = Column(String(50))  # counter, gauge, histogram
    
    # Metric Data
    value = Column(Float)
    labels = Column(JSON)  # Metric labels
    
    # Timestamp
    timestamp = Column(DateTime, default=func.now())
    
    # Indexes
    __table_args__ = (
        Index('idx_metric_name_timestamp', 'metric_name', 'timestamp'),
    )

# User Sessions Table (for web interface)
class UserSession(Base):
    __tablename__ = "user_sessions"
    
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String(255), unique=True, nullable=False)
    user_id = Column(String(100))
    
    # Session Data
    session_data = Column(JSON)
    ip_address = Column(String(45))
    user_agent = Column(Text)
    
    # Timestamps
    created_at = Column(DateTime, default=func.now())
    last_accessed = Column(DateTime, default=func.now())
    expires_at = Column(DateTime)
    
    # Status
    is_active = Column(Boolean, default=True)

# Export all models for easy import
__all__ = [
    "IOC",
    "ThreatActor", 
    "Campaign",
    "CampaignIOC",
    "FeedSource",
    "FeedUpdate",
    "EnrichmentData",
    "MLModel",
    "MLPrediction", 
    "CorrelationRule",
    "ThreatCorrelation",
    "RemediationTemplate",
    "RemediationAction",
    "APIKey",
    "SystemMetric",
    "UserSession"
]
