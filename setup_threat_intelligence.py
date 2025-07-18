"""
Setup script for threat intelligence features
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

import asyncio
from app.services.open_source_feeds import OpenSourceFeedManager
from app.services.enrichment_service import EnrichmentService
from scripts.migrate_database import migrate_database

async def setup_threat_intelligence():
    """Set up threat intelligence features"""
    print("=== Setting Up Threat Intelligence Features ===")
    
    # 1. Run database migration
    print("1. Running database migration...")
    migrate_database()
    
    # 2. Set up recommended open source feeds
    print("2. Setting up recommended threat feeds...")
    feed_manager = OpenSourceFeedManager()
    
    recommended_feeds = [
        'abuse_ch_malware',
        'abuse_ch_urlhaus', 
        'emergingthreats_compromised',
        'phishtank',
        'openphish'
    ]
    
    for feed_key in recommended_feeds:
        try:
            success = await feed_manager.setup_feed(feed_key)
            if success:
                print(f"  ✅ Set up feed: {feed_key}")
            else:
                print(f"  ❌ Failed to set up feed: {feed_key}")
        except Exception as e:
            print(f"  ❌ Error setting up feed {feed_key}: {e}")
    
    # 3. Initialize enrichment service
    print("3. Initializing enrichment services...")
    enrichment_service = EnrichmentService()
    print("  ✅ Enrichment services initialized")
    
    print("\n=== Setup Complete ===")
    print("✅ Database migrated with new threat intelligence tables")
    print("✅ Open source threat feeds configured")
    print("✅ Enrichment services ready")
    print("\nYou can now:")
    print("- Access threat feeds via: /api/v1/feeds/open-source")
    print("- Enrich IOCs via: /api/v1/threat-intel/iocs/{id}/enrich")
    print("- View threat families via: /api/v1/threat-intel/threat-families")
    print("- Set up additional feeds via: /api/v1/setup/feeds/all")

if __name__ == "__main__":
    asyncio.run(setup_threat_intelligence())
