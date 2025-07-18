# Threat Intelligence Platform - Quick Start Guide

## Installation

1. **Run the setup script:**
   ```bash
   ./setup.sh
   ```

2. **Navigate to project directory:**
   ```bash
   cd ~/threat-intelligence-platform
   ```

3. **Activate virtual environment:**
   ```bash
   source venv/bin/activate
   ```

4. **Run the installation:**
   ```bash
   ./install.sh
   ```

## Starting the Platform

1. **Start the API server (Terminal 1):**
   ```bash
   python run_dev.py
   ```

2. **Start the Celery worker (Terminal 2):**
   ```bash
   python run_worker.py
   ```

## Usage

### API Documentation
- Visit: http://localhost:8000/docs
- Interactive API documentation with all endpoints

### Basic Operations

1. **Check API Status:**
   ```bash
   curl http://localhost:8000/api/v1/status
   ```

2. **Create a Threat Feed:**
   ```bash
   curl -X POST "http://localhost:8000/api/v1/feeds/" \
        -H "Content-Type: application/json" \
        -d '{
          "name": "My Threat Feed",
          "type": "json",
          "url": "https://example.com/feed.json",
          "reliability": "b",
          "confidence": 0.8
        }'
   ```

3. **Add an IOC:**
   ```bash
   curl -X POST "http://localhost:8000/api/v1/iocs/" \
        -H "Content-Type: application/json" \
        -d '{
          "type": "ip",
          "value": "192.168.1.100",
          "confidence": 0.9,
          "severity": "high"
        }'
   ```

4. **Search IOCs:**
   ```bash
   curl "http://localhost:8000/api/v1/iocs/?ioc_type=ip&severity=high"
   ```

5. **Lookup an IOC:**
   ```bash
   curl "http://localhost:8000/api/v1/iocs/lookup/192.168.1.100"
   ```

## Configuration

Edit the `.env` file to configure:
- Database connection
- Redis connection  
- API keys for external threat feeds
- Application settings

## Logs

Check logs for troubleshooting:
- Application logs: Check terminal output
- PostgreSQL logs: `/var/log/postgresql/`
- Redis logs: `/var/log/redis/`

## Next Steps

1. **Add External Threat Feeds:**
   - Get an OTX API key from AlienVault
   - Configure MISP integration
   - Add custom JSON feeds

2. **Set up Monitoring:**
   - Configure Prometheus metrics
   - Set up Grafana dashboards

3. **Integrate with Security Tools:**
   - Configure SIEM integration
   - Set up EDR connections
   - Configure automated responses

## Troubleshooting

**Database Connection Issues:**
```bash
sudo systemctl restart postgresql
```

**Redis Connection Issues:**
```bash
sudo systemctl restart redis-server
```

**Permission Issues:**
```bash
sudo chown -R $USER:$USER ~/threat-intelligence-platform
```

**Python Package Issues:**
```bash
pip install --upgrade pip
pip install -r requirements.txt --force-reinstall
```
