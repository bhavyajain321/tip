"""
Universal threat feed processor
"""
import re
from typing import Dict, List, Any, Optional, Callable

class UniversalThreatFeedProcessor:
    """Universal processor for various threat feed formats"""
    
    def __init__(self):
        self.field_mappings = {
            'indicator': ['indicator', 'ioc', 'value', 'observable', 'artifact'],
            'type': ['type', 'indicator_type', 'ioc_type', 'observable_type'],
            'confidence': ['confidence', 'score', 'rating', 'trust'],
            'severity': ['severity', 'priority', 'criticality', 'threat_level'],
            'description': ['description', 'comment', 'notes', 'summary'],
        }
        
        self.ioc_type_mappings = {
            'ip': ['ip', 'ipv4', 'ipv6', 'ip-address', 'ip_address'],
            'domain': ['domain', 'hostname', 'fqdn', 'domain-name'],
            'url': ['url', 'uri', 'link', 'web-link'],
            'hash': ['hash', 'md5', 'sha1', 'sha256', 'sha512', 'file-hash'],
            'email': ['email', 'email-address', 'e-mail'],
        }

    def normalize_field_name(self, field_name: str) -> str:
        """Normalize field names to standard format"""
        field_name = field_name.lower().replace('-', '_').replace(' ', '_')
        
        for standard_field, variations in self.field_mappings.items():
            if field_name in variations:
                return standard_field
        
        return field_name

    def normalize_ioc_type(self, ioc_type: str) -> str:
        """Normalize IOC type to standard format"""
        ioc_type = ioc_type.lower().replace('-', '_').replace(' ', '_')
        
        for standard_type, variations in self.ioc_type_mappings.items():
            if ioc_type in variations:
                return standard_type
        
        return ioc_type
