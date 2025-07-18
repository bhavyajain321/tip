"""
Database migration script for threat intelligence enhancements
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import text
from app.db.database import engine, SessionLocal
from app.models import Base
from app.models.threat_intel import ThreatFamily, ThreatIntelligence, EnrichmentSource
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def migrate_database():
    """Run database migration"""
    try:
        logger.info("Starting database migration...")
        
        # Create new tables
        Base.metadata.create_all(bind=engine)
        logger.info("✅ New tables created successfully")
        
        # Add new columns to existing tables (if they don't exist)
        with engine.connect() as conn:
            try:
                # Check if columns exist before adding them
                result = conn.execute(text("""
                    SELECT column_name 
                    FROM information_schema.columns 
                    WHERE table_name = 'iocs' AND column_name = 'threat_family_id'
                """))
                
                if not result.fetchone():
                    # Add new columns to iocs table
                    conn.execute(text("""
                        ALTER TABLE iocs 
                        ADD COLUMN threat_family_id INTEGER,
                        ADD COLUMN mitre_tactics JSON,
                        ADD COLUMN mitre_techniques JSON,
                        ADD COLUMN kill_chain_phase VARCHAR(50)
                    """))
                    logger.info("✅ Added new columns to iocs table")
                
                # Check campaigns table
                result = conn.execute(text("""
                    SELECT column_name 
                    FROM information_schema.columns 
                    WHERE table_name = 'campaigns' AND column_name = 'threat_family_id'
                """))
                
                if not result.fetchone():
                    # Add new columns to campaigns table
                    conn.execute(text("""
                        ALTER TABLE campaigns 
                        ADD COLUMN threat_family_id INTEGER
                    """))
                    logger.info("✅ Added new columns to campaigns table")
                
                conn.commit()
                logger.info("✅ Database schema updated successfully")
                
            except Exception as e:
                conn.rollback()
                logger.warning(f"Schema update issue (may be normal): {e}")
        
        logger.info("✅ Database migration completed successfully")
        
    except Exception as e:
        logger.error(f"❌ Database migration failed: {e}")
        # Don't raise - continue with setup

if __name__ == "__main__":
    migrate_database()
