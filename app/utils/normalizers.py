"""
IOC normalization utilities
"""
import re
import hashlib
from urllib.parse import urlparse, urlunparse
from typing import Dict, Callable

class IOCNormalizer:
    def __init__(self):
        self.normalizers: Dict[str, Callable] = {
            'ip': self._normalize_ip,
            'domain': self._normalize_domain,
            'url': self._normalize_url,
            'hash': self._normalize_hash,
            'email': self._normalize_email,
            'file': self._normalize_file
        }

    def normalize_ioc(self, ioc_type: str, value: str) -> str:
        """Normalize IOC value based on its type"""
        if not value:
            return ""
        
        normalizer = self.normalizers.get(ioc_type.lower())
        if not normalizer:
            return value.strip().lower()
        
        return normalizer(value.strip())

    def _normalize_ip(self, value: str) -> str:
        """Normalize IP address"""
        try:
            import ipaddress
            ip = ipaddress.ip_address(value)
            return str(ip)
        except:
            return value.lower()

    def _normalize_domain(self, value: str) -> str:
        """Normalize domain name"""
        # Remove protocol if present
        if '://' in value:
            value = value.split('://', 1)[1]
        
        # Remove path if present
        if '/' in value:
            value = value.split('/', 1)[0]
        
        # Remove port if present
        if ':' in value and not value.count(':') > 1:  # Not IPv6
            value = value.split(':', 1)[0]
        
        # Convert to lowercase and remove trailing dot
        return value.lower().rstrip('.')

    def _normalize_url(self, value: str) -> str:
        """Normalize URL"""
        try:
            parsed = urlparse(value.lower())
            # Reconstruct URL with normalized components
            normalized = urlunparse((
                parsed.scheme,
                parsed.netloc,
                parsed.path.rstrip('/') if parsed.path != '/' else parsed.path,
                parsed.params,
                parsed.query,
                ''  # Remove fragment
            ))
            return normalized
        except:
            return value.lower()

    def _normalize_hash(self, value: str) -> str:
        """Normalize hash value"""
        return value.lower().strip()

    def _normalize_email(self, value: str) -> str:
        """Normalize email address"""
        return value.lower().strip()

    def _normalize_file(self, value: str) -> str:
        """Normalize file path"""
        # Convert backslashes to forward slashes
        normalized = value.replace('\\', '/')
        # Remove multiple consecutive slashes
        normalized = re.sub(r'/+', '/', normalized)
        return normalized.lower()
