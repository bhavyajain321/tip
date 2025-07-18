# Threat Intelligence Platform

A comprehensive threat intelligence platform built with FastAPI, PostgreSQL, and Redis.

## Features

- Multi-source threat feed ingestion
- AI/ML-powered threat analysis
- Automated threat correlation
- Device-specific remediation recommendations
- SIEM/EDR integration
- Real-time threat monitoring
- RESTful API
- Web dashboard

## Quick Start

1. Run the setup script:
   ```bash
   chmod +x setup.sh
   ./setup.sh
   ```

2. Activate the virtual environment:
   ```bash
   source venv/bin/activate
   ```

3. Update configuration:
   ```bash
   cp .env.example .env
   # Edit .env with your API keys and settings
   ```

4. Initialize the database:
   ```bash
   python scripts/init_db.py
   ```

5. Start the development server:
   ```bash
   python run_dev.py
   ```

6. Start the Celery worker:
   ```bash
   python run_worker.py
   ```

## API Documentation

Once running, visit:
- API Docs: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Development

### Project Structure
```
threat-intelligence-platform/
├── app/
│   ├── api/
│   ├── core/
│   ├── db/
│   ├── models/
│   ├── services/
│   ├── utils/
│   ├── ml/
│   └── integrations/
├── tests/
├── docs/
├── scripts/
└── config/
```

### Running Tests
```bash
pytest tests/
```

### Building Documentation
```bash
cd docs/
make html
```

## Deployment

See `docs/deployment.md` for production deployment instructions.

## License

MIT License
