"""
Open source threat intelligence feeds integration
"""
import requests
import json
from datetime import datetime, timedelta
from typing import Dict, List, Any
import logging
import ipaddress

from app.services.threat_feed_manager import UniversalThreatFeedProcessor
from app.models import FeedSource, IOC, ThreatFamily
from app.db.database import SessionLocal

logger = logging.getLogger(__name__)

class OpenSourceFeedManager:
    """Manager for open source threat intelligence feeds"""
    
    def __init__(self):
        self.processor = UniversalThreatFeedProcessor()
        self.feeds = {
            'abuse_ch_malware': {
                'name': 'Abuse.ch Malware Bazaar',
                'url': 'https://bazaar.abuse.ch/export/json/recent/',
                'format': 'json',
                'description': 'Recent malware samples from Abuse.ch',
                'free': True,
                'update_frequency': 3600,
            },
            'abuse_ch_urlhaus': {
                'name': 'Abuse.ch URLhaus',
                'url': 'https://urlhaus.abuse.ch/downloads/json_recent/',
                'format': 'json',
                'description': 'Recent malicious URLs from URLhaus',
                'free': True,
                'update_frequency': 3600,
            },
            'emergingthreats_compromised': {
                'name': 'Emerging Threats Compromised IPs',
                'url': 'https://rules.emergingthreats.net/blockrules/compromised-ips.txt',
                'format': 'text',
                'description': 'Compromised IP addresses',
                'free': True,
                'update_frequency': 3600,
            },
            'malwaredomainlist': {
                'name': 'MalwareDomainList',
                'url': 'https://www.malwaredomainlist.com/hostslist/hosts.txt',
                'format': 'text',
                'description': 'Malicious domains',
                'free': True,
                'update_frequency': 3600,
            },
            'phishtank': {
                'name': 'PhishTank',
                'url': 'http://data.phishtank.com/data/online-valid.json',
                'format': 'json',
                'description': 'Phishing URLs from PhishTank',
                'free': True,
                'update_frequency': 3600,
            },
            'openphish': {
                'name': 'OpenPhish',
                'url': 'https://openphish.com/feed.txt',
                'format': 'text',
                'description': 'Phishing URLs from OpenPhish',
                'free': True,
                'update_frequency': 3600,
            },
        }

    def get_available_feeds(self) -> Dict[str, Dict[str, Any]]:
        """Get list of available open source feeds"""
        return self.feeds

    async def setup_feed(self, feed_key: str, custom_config: Dict[str, Any] = None) -> bool:
        """Set up an open source feed"""
        if feed_key not in self.feeds:
            logger.error(f"Unknown feed: {feed_key}")
            return False
        
        feed_config = self.feeds[feed_key].copy()
        if custom_config:
            feed_config.update(custom_config)
        
        db = SessionLocal()
        try:
            # Check if feed already exists
            existing_feed = db.query(FeedSource).filter(
                FeedSource.name == feed_config['name']
            ).first()
            
            if existing_feed:
                logger.info(f"Feed {feed_config['name']} already exists")
                return True
            
            # Create new feed source
            feed_source = FeedSource(
                name=feed_config['name'],
                type='open_source',
                url=feed_config['url'],
                reliability='b',
                confidence=0.7,
                update_frequency=feed_config.get('update_frequency', 3600),
                config={
                    'format': feed_config['format'],
                    'description': feed_config['description'],
                    'free': feed_config.get('free', True),
                    'feed_key': feed_key
                }
            )
            
            db.add(feed_source)
            db.commit()
            db.refresh(feed_source)
            
            logger.info(f"Successfully set up feed: {feed_config['name']}")
            return True
            
        except Exception as e:
            logger.error(f"Error setting up feed {feed_key}: {e}")
            return False
        finally:
            db.close()

    def _is_valid_ip(self, ip_str: str) -> bool:
        """Check if string is a valid IP address"""
        try:
            ipaddress.ip_address(ip_str)
            return True
        except ValueError:
            return False
