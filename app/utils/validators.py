"""
IOC validation utilities
"""
import re
import ipaddress
from typing import Dict, Callable
from urllib.parse import urlparse

class IOCValidator:
    def __init__(self):
        self.validators: Dict[str, Callable] = {
            'ip': self._validate_ip,
            'domain': self._validate_domain,
            'url': self._validate_url,
            'hash': self._validate_hash,
            'email': self._validate_email,
            'file': self._validate_file
        }

    def validate_ioc(self, ioc_type: str, value: str) -> bool:
        """Validate IOC based on its type"""
        if not value or not isinstance(value, str):
            return False
        
        validator = self.validators.get(ioc_type.lower())
        if not validator:
            return False
        
        return validator(value.strip())

    def _validate_ip(self, value: str) -> bool:
        """Validate IP address (IPv4 or IPv6)"""
        try:
            ipaddress.ip_address(value)
            return True
        except ValueError:
            return False

    def _validate_domain(self, value: str) -> bool:
        """Validate domain name"""
        if len(value) > 253:
            return False
        
        domain_pattern = re.compile(
            r'^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)*[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$'
        )
        return bool(domain_pattern.match(value))

    def _validate_url(self, value: str) -> bool:
        """Validate URL"""
        try:
            result = urlparse(value)
            return all([result.scheme, result.netloc])
        except:
            return False

    def _validate_hash(self, value: str) -> bool:
        """Validate hash (MD5, SHA1, SHA256, SHA512)"""
        hash_patterns = {
            32: r'^[a-fA-F0-9]{32}$',    # MD5
            40: r'^[a-fA-F0-9]{40}$',    # SHA1
            64: r'^[a-fA-F0-9]{64}$',    # SHA256
            128: r'^[a-fA-F0-9]{128}$'   # SHA512
        }
        
        pattern = hash_patterns.get(len(value))
        if not pattern:
            return False
        
        return bool(re.match(pattern, value))

    def _validate_email(self, value: str) -> bool:
        """Validate email address"""
        email_pattern = re.compile(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')
        return bool(email_pattern.match(value))

    def _validate_file(self, value: str) -> bool:
        """Validate file path/name"""
        # Basic file path validation
        if len(value) > 260:  # Windows MAX_PATH
            return False
        
        # Check for invalid characters
        invalid_chars = ['<', '>', ':', '"', '|', '?', '*']
        return not any(char in value for char in invalid_chars)
