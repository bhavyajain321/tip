"""
Configuration settings for the Threat Intelligence Platform
"""
from pydantic_settings import BaseSettings
from typing import Optional, List
import os

class Settings(BaseSettings):
    # Application Settings
    app_name: str = "Threat Intelligence Platform"
    app_version: str = "1.0.0"
    debug: bool = True
    log_level: str = "INFO"
    
    # API Settings
    api_v1_prefix: str = "/api/v1"
    secret_key: str = "your-secret-key-change-this-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 1440
    
    # Database Settings
    database_url: str = "postgresql://tip_user:tip_password123!@localhost:5432/threat_intelligence_db"
    
    # Redis Settings
    redis_url: str = "redis://localhost:6379/0"
    
    # Celery Settings
    celery_broker_url: str = "redis://localhost:6379/0"
    celery_result_backend: str = "redis://localhost:6379/0"
    
    # External API Keys
    otx_api_key: Optional[str] = None
    misp_url: Optional[str] = None
    misp_api_key: Optional[str] = None
    
    # GeoIP Settings
    geoip_db_path: str = "/usr/share/GeoIP/GeoLite2-City.mmdb"
    
    # Threat Feed Settings
    feed_update_interval: int = 3600  # 1 hour in seconds
    max_iocs_per_feed: int = 10000
    
    # ML Settings
    model_retrain_interval: int = 86400  # 24 hours
    confidence_threshold: float = 0.7
    
    # CORS Settings - Updated for frontend
    allowed_origins: List[str] = [
        "http://localhost:3000", 
        "http://127.0.0.1:3000",
        "http://localhost:5173",  # Vite dev server
        "http://127.0.0.1:5173"
    ]
    
    # Rate Limiting
    rate_limit_per_minute: int = 100
    
    class Config:
        env_file = ".env"
        case_sensitive = False

# Create global settings instance
settings = Settings()
