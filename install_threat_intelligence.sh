#!/bin/bash
# File: install_threat_intelligence.sh

echo "=== Installing Advanced Threat Intelligence Features ==="

# 1. Install additional Python packages
echo "Installing additional packages..."
pip install geoip2==4.7.0 python-whois==0.8.0 dnspython==2.4.2 aiohttp==3.8.5 python-dateutil==2.8.2 stix2==3.0.1

# 2. Create new model files
echo "Creating threat intelligence models..."
# Copy the threat_intel.py file to app/models/
cat > app/models/threat_intel.py << 'EOF'
# [Content from the threat_intel_enhancements artifact - threat_intel.py section]
EOF

# 3. Create enrichment service
echo "Creating enrichment service..."
cat > app/services/enrichment_service.py << 'EOF'
# [Content from the threat_intel_enhancements artifact - enrichment_service.py section]
EOF

# 4. Create open source feed manager
echo "Creating open source feed manager..."
cat > app/services/open_source_feeds.py << 'EOF'
# [Content from the threat_intel_enhancements artifact - open_source_feeds.py section]
EOF

# 5. Create threat intelligence endpoints
echo "Creating threat intelligence endpoints..."
mkdir -p app/api/v1/endpoints
cat > app/api/v1/endpoints/threat_intel.py << 'EOF'
# [Content from the threat_intel_enhancements artifact - threat_intel.py section]
EOF

cat > app/api/v1/endpoints/setup_feeds.py << 'EOF'
# [Content from the threat_intel_enhancements artifact - setup_feeds.py section]
EOF

# 6. Create migration script
echo "Creating migration script..."
mkdir -p scripts
cat > scripts/migrate_database.py << 'EOF'
# [Content from the database_migration artifact - migrate_database.py section]
EOF

# 7. Create setup script
echo "Creating setup script..."
cat > setup_threat_intelligence.py << 'EOF'
# [Content from the database_migration artifact - setup_threat_intelligence.py section]
EOF

# 8. Make scripts executable
chmod +x scripts/migrate_database.py
chmod +x setup_threat_intelligence.py

echo "✅ Files created successfully!"
echo ""
echo "Next steps:"
echo "1. Run: python setup_threat_intelligence.py"
echo "2. Restart your API server: python run_dev.py"
echo "3. Test the new endpoints at: http://localhost:8000/docs"

# File: THREAT_INTELLIGENCE_USAGE.md
cat > THREAT_INTELLIGENCE_USAGE.md << 'EOF'
# Threat Intelligence Platform - Usage Guide

## 🚀 Quick Start

### 1. Install and Setup
```bash
# Install additional packages
pip install geoip2 python-whois dnspython aiohttp stix2

# Run setup script
python setup_threat_intelligence.py

# Restart API server
python run_dev.py
```

### 2. Setup Open Source Feeds
```bash
# Setup all recommended feeds
curl -X POST "http://localhost:8000/api/v1/setup/feeds/recommended"

# Or setup individual feeds
curl -X POST "http://localhost:8000/api/v1/feeds/open-source/abuse_ch_malware/setup"
```

## 📊 Available Open Source Feeds

### Free Threat Intelligence Feeds
1. **Abuse.ch Malware Bazaar**
   - URL: https://bazaar.abuse.ch/export/json/recent/
   - Content: Recent malware samples and hashes
   - Update: Every hour

2. **Abuse.ch URLhaus**
   - URL: https://urlhaus.abuse.ch/downloads/json_recent/
   - Content: Malicious URLs hosting malware
   - Update: Every hour

3. **Emerging Threats Compromised IPs**
   - URL: https://rules.emergingthreats.net/blockrules/compromised-ips.txt
   - Content: Compromised IP addresses
   - Update: Every hour

4. **PhishTank**
   - URL: http://data.phishtank.com/data/online-valid.json
   - Content: Verified phishing URLs
   - Update: Every hour

5. **OpenPhish**
   - URL: https://openphish.com/feed.txt
   - Content: Phishing URLs
   - Update: Every hour

## 🔧 API Usage Examples

### Adding IOCs with Threat Families
```bash
# Add IOC with malware family
curl -X POST "http://localhost:8000/api/v1/iocs/" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "hash",
    "value": "d41d8cd98f00b204e9800998ecf8427e",
    "confidence": 0.9,
    "severity": "high",
    "enrichment_data": {
      "malware_family": "emotet",
      "campaign": "emotet_2024"
    }
  }'
```

### Enriching IOCs
```bash
# Enrich an IOC
curl -X POST "http://localhost:8000/api/v1/threat-intel/iocs/1/enrich"

# Get enrichment data
curl "http://localhost:8000/api/v1/threat-intel/iocs/1/enrichment"
```

### Working with Threat Families
```bash
# List threat families
curl "http://localhost:8000/api/v1/threat-intel/threat-families"

# Get IOCs for a threat family
curl "http://localhost:8000/api/v1/threat-intel/threat-families/1/iocs"
```

### Custom Feed Integration
```bash
# Add custom JSON feed
curl -X POST "http://localhost:8000/api/v1/feeds/" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Custom Threat Feed",
    "type": "json",
    "url": "https://your-feed-url.com/feed.json",
    "reliability": "a",
    "confidence": 0.8,
    "config": {
      "format": "json",
      "authentication": "bearer",
      "api_key": "your-api-key"
    }
  }'
```

## 🔄 Universal Normalization

### Supported Input Formats

#### 1. STIX 2.1 Format
```json
{
  "type": "bundle",
  "objects": [
    {
      "type": "indicator",
      "pattern": "[domain-name:value = 'malicious.example.com']",
      "labels": ["malicious-activity"],
      "confidence": 90,
      "created": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### 2. OpenIOC Format
```json
{
  "indicators": [
    {
      "indicator": "malicious.example.com",
      "type": "domain",
      "confidence": 0.9,
      "severity": "high",
      "malware_family": "emotet"
    }
  ]
}
```

#### 3. Generic JSON Format
```json
{
  "data": [
    {
      "ioc": "192.168.1.100",
      "indicator_type": "ipv4",
      "threat_level": "high",
      "score": 0.95,
      "family": "apt29"
    }
  ]
}
```

#### 4. CSV Format
```csv
indicator,type,confidence,severity,malware_family,first_seen
malicious.example.com,domain,0.9,high,emotet,2024-01-01
192.168.1.100,ip,0.8,medium,apt29,2024-01-01
```

## 🏗️ Enrichment Services

### Available Enrichment Sources

#### 1. GeoIP Enrichment (Free)
- **Source**: MaxMind GeoLite2
- **Data**: Country, region, city, coordinates
- **IOC Types**: IP addresses
- **Setup**: Automatic

#### 2. WHOIS Enrichment (Free)
- **Source**: Public WHOIS servers
- **Data**: Registration, expiration, nameservers
- **IOC Types**: Domains, IP addresses
- **Setup**: Automatic

#### 3. VirusTotal (API Key Required)
- **Source**: VirusTotal API
- **Data**: Malware detection, reputation scores
- **IOC Types**: IPs, domains, URLs, hashes
- **Setup**: Add API key

#### 4. AbuseIPDB (API Key Required)
- **Source**: AbuseIPDB API
- **Data**: IP reputation, abuse reports
- **IOC Types**: IP addresses
- **Setup**: Add API key

### Configure Enrichment Sources
```bash
# Add VirusTotal API key
curl -X POST "http://localhost:8000/api/v1/enrichment/sources" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "VirusTotal",
    "source_type": "reputation",
    "url": "https://www.virustotal.com/api/v3/",
    "api_key": "your-virustotal-api-key",
    "is_active": true
  }'
```

## 🔍 Search and Analysis

### Advanced IOC Search
```bash
# Search by malware family
curl -X POST "http://localhost:8000/api/v1/iocs/search" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "emotet",
    "confidence_min": 0.7,
    "severities": ["high", "critical"]
  }'

# Search by MITRE ATT&CK technique
curl -X POST "http://localhost:8000/api/v1/iocs/search" \
  -H "Content-Type: application/json" \
  -d '{
    "mitre_techniques": ["T1055"],
    "date_from": "2024-01-01"
  }'
```

### Threat Family Analysis
```bash
# Get threat family statistics
curl "http://localhost:8000/api/v1/threat-intel/threat-families/1/stats"

# Get campaign information
curl "http://localhost:8000/api/v1/campaigns?threat_family_id=1"
```

## 📈 Integration Examples

### Python Integration
```python
import requests
import json

# Setup client
base_url = "http://localhost:8000/api/v1"

# Add IOC with enrichment
def add_and_enrich_ioc(ioc_data):
    # Add IOC
    response = requests.post(f"{base_url}/iocs/", json=ioc_data)
    ioc = response.json()
    
    # Enrich IOC
    requests.post(f"{base_url}/threat-intel/iocs/{ioc['id']}/enrich")
    
    # Get enriched data
    enriched = requests.get(f"{base_url}/threat-intel/iocs/{ioc['id']}/enrichment")
    return enriched.json()

# Example usage
ioc_data = {
    "type": "domain",
    "value": "malicious.example.com",
    "confidence": 0.9,
    "severity": "high"
}

result = add_and_enrich_ioc(ioc_data)
print(json.dumps(result, indent=2))
```

### JavaScript Integration
```javascript
class ThreatIntelAPI {
    constructor(baseUrl = '/api/v1') {
        this.baseUrl = baseUrl;
    }
    
    async addIOC(iocData) {
        const response = await fetch(`${this.baseUrl}/iocs/`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(iocData)
        });
        return response.json();
    }
    
    async enrichIOC(iocId) {
        const response = await fetch(`${this.baseUrl}/threat-intel/iocs/${iocId}/enrich`, {
            method: 'POST'
        });
        return response.json();
    }
    
    async getThreatFamilies() {
        const response = await fetch(`${this.baseUrl}/threat-intel/threat-families`);
        return response.json();
    }
}

// Usage
const api = new ThreatIntelAPI();
const ioc = await api.addIOC({
    type: 'ip',
    value: '192.168.1.100',
    confidence: 0.8,
    severity: 'medium'
});
await api.enrichIOC(ioc.id);
```

## 🛠️ Maintenance and Monitoring

### Feed Health Monitoring
```bash
# Check feed status
curl "http://localhost:8000/api/v1/feeds/"

# Get feed statistics
curl "http://localhost:8000/api/v1/feeds/1/stats"

# Manual feed update
curl -X POST "http://localhost:8000/api/v1/feeds/1/update"
```

### Performance Optimization
```bash
# Batch enrichment
curl -X POST "http://localhost:8000/api/v1/threat-intel/enrich/batch" \
  -H "Content-Type: application/json" \
  -d '{"ioc_ids": [1, 2, 3, 4, 5]}'
```

## 📚 Best Practices

### 1. Feed Management
- Start with recommended free feeds
- Monitor feed update frequency and success rates
- Set up automated enrichment for new IOCs
- Regularly review and clean expired indicators

### 2. Data Quality
- Use confidence scores to filter low-quality data
- Cross-reference indicators across multiple sources
- Set appropriate TTL for enrichment data
- Monitor false positive rates

### 3. Performance
- Use batch operations for large datasets
- Enable caching for frequently accessed data
- Monitor API rate limits for external services
- Schedule heavy operations during off-peak hours

### 4. Security
- Protect API keys and credentials
- Use TLP (Traffic Light Protocol) markings
- Implement access controls for sensitive data
- Regularly audit data sources and permissions

## 🔧 Troubleshooting

### Common Issues

#### 1. Feed Update Failures
```bash
# Check feed logs
curl "http://localhost:8000/api/v1/feeds/1/updates"

# Test feed connectivity
curl -I "https://bazaar.abuse.ch/export/json/recent/"
```

#### 2. Enrichment Failures
```bash
# Check enrichment sources
curl "http://localhost:8000/api/v1/enrichment/sources"

# Test GeoIP database
ls -la /usr/share/GeoIP/
```

#### 3. Performance Issues
```bash
# Check database indexes
# Run in PostgreSQL: \d+ iocs
sudo -u postgres psql threat_intelligence_db -c "\d+ iocs"
```

### Support and Documentation
- API Documentation: http://localhost:8000/docs
- Database Schema: Check models in app/models/
- Logs: Check application logs for errors
- Community: Check GitHub issues and discussions
EOF

echo "✅ Threat Intelligence installation script created!"
echo ""
echo "To install and use the new features:"
echo "1. Run: bash install_threat_intelligence.sh"
echo "2. Run: python setup_threat_intelligence.py"
echo "3. Check the THREAT_INTELLIGENCE_USAGE.md guide"
echo ""
echo "New features include:"
echo "- 🔄 Universal data normalization"
echo "- 🌐 8+ open source threat feeds"
echo "- 🔍 Advanced IOC enrichment"
echo "- 🏷️ Threat family classification"
echo "- 📊 MITRE ATT&CK mapping"
echo "- 🚀 Automated feed processing"
