# File: docs/THREAT_INTELLIGENCE_GUIDE.md
"""
Comprehensive guide for using the threat intelligence features
"""

# Threat Intelligence Platform - Advanced Features Guide

## 1. Open Source Threat Feeds

### Available Feeds
- **Abuse.ch Malware Bazaar**: Recent malware samples and hashes
- **Abuse.ch URLhaus**: Malicious URLs hosting malware
- **Emerging Threats**: Compromised IP addresses
- **MalwareDomainList**: Known malicious domains
- **PhishTank**: Verified phishing URLs
- **OpenPhish**: Phishing URLs from OpenPhish
- **Malc0de**: Malicious IP addresses
- **ZeuS Tracker**: Zeus botnet IP addresses

### Setup via API
```bash
# Set up all recommended feeds
curl -X POST "http://localhost:8000/api/v1/setup/feeds/recommended"

# Set up specific feed
curl -X POST "http://localhost:8000/api/v1/feeds/open-source/abuse_ch_malware/setup"

# List available feeds
curl "http://localhost:8000/api/v1/feeds/open-source"
```

### Setup via JSON Configuration
```json
{
  "name": "Custom Threat Feed",
  "type": "open_source",
  "url": "https://example.com/threat-feed.json",
  "format": "json",
  "update_frequency": 3600,
  "config": {
    "authentication": "bearer",
    "api_key": "your-api-key"
  }
}
```

## 2. Threat Families and Advanced Data

### Supported Threat Types
- **Malware**: Trojans, ransomware, backdoors
- **Attack Patterns**: MITRE ATT&CK techniques
- **Tools**: Hacking tools and utilities
- **Vulnerabilities**: CVEs and security flaws
- **Campaigns**: Coordinated attack campaigns
- **Intrusion Sets**: APT groups and threat actors

### API Examples
```bash
# Get threat families
curl "http://localhost:8000/api/v1/threat-families"

# Get IOCs for a threat family
curl "http://localhost:8000/api/v1/threat-families/1/iocs"

# Search by malware family
curl "http://localhost:8000/api/v1/iocs/search" \
  -d '{"malware_family": "emotet"}'
```

## 3. Universal Normalization

### Supported Input Formats
- **STIX 2.1**: Standard structured threat information
- **OpenIOC**: Open indicators of compromise
- **JSON**: Generic JSON feeds
- **CSV**: Comma-separated values
- **Text**: Plain text lists

### Field Mappings
```python
# Automatically normalized fields
{
  "indicator": ["indicator", "ioc", "value", "observable"],
  "type": ["type", "indicator_type", "ioc_type"],
  "confidence": ["confidence", "score", "rating"],
  "severity": ["severity", "priority", "threat_level"],
  "malware_family": ["malware_family", "family", "threat_family"]
}
```

## 4. Enrichment Services

### Available Enrichment Sources
- **GeoIP**: IP geolocation (MaxMind)
- **WHOIS**: Domain registration data
- **VirusTotal**: Malware and URL reputation
- **AbuseIPDB**: IP reputation database
- **URLVoid**: URL reputation checking

### API Examples
```bash
# Enrich an IOC
curl -X POST "http://localhost:8000/api/v1/iocs/1/enrich"

# Get enrichment data
curl "http://localhost:8000/api/v1/iocs/1/enrichment"

# Configure enrichment source
curl -X POST "http://localhost:8000/api/v1/enrichment/sources" \
  -d '{
    "name": "VirusTotal",
    "source_type": "reputation",
    "url": "https://www.virustotal.com/api/v3/",
    "api_key": "your-vt-api-key"
  }'
```

## 5. Adding Custom Feeds

### Method 1: JSON Feed
```json
{
  "indicators": [
    {
      "indicator": "malicious.example.com",
      "type": "domain",
      "confidence": 0.9,
      "severity": "high",
      "malware_family": "emotet",
      "first_seen": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### Method 2: STIX Format
```json
{
  "type": "bundle",
  "objects": [
    {
      "type": "indicator",
      "pattern": "[domain-name:value = 'malicious.example.com']",
      "labels": ["malicious-activity"],
      "confidence": 90
    }
  ]
}
```

### Method 3: CSV Format
```csv
indicator,type,confidence,severity,malware_family
malicious.example.com,domain,0.9,high,emotet
192.168.1.100,ip,0.8,medium,unknown
```

## 6. Integration Examples

### Python Integration
```python
import requests

# Add IOC with enrichment
response = requests.post('http://localhost:8000/api/v1/iocs/', json={
    'type': 'domain',
    'value': 'malicious.example.com',
    'confidence': 0.9,
    'severity': 'high'
})

ioc_id = response.json()['id']

# Enrich the IOC
requests.post(f'http://localhost:8000/api/v1/iocs/{ioc_id}/enrich')
```

### JavaScript Integration
```javascript
// Add and enrich IOC
const addIOC = async (iocData) => {
  const response = await fetch('/api/v1/iocs/', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(iocData)
  });
  
  const ioc = await response.json();
  
  // Trigger enrichment
  await fetch(`/api/v1/iocs/${ioc.id}/enrich`, {
    method: 'POST'
  });
  
  return ioc;
};
```

## 7. Best Practices

### Feed Management
- Start with recommended feeds
- Monitor feed update frequency
- Review feed quality regularly
- Set up automated enrichment

### Data Quality
- Use confidence scores appropriately
- Validate IOC formats
- Remove expired indicators
- Cross-reference multiple sources

### Performance
- Enable caching for enrichment data
- Use batch operations for large datasets
- Monitor API rate limits
- Schedule updates during off-peak hours
