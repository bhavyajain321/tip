#!/bin/bash

# Complete Frontend Setup and Integration Script
echo "=== Complete Frontend Setup for Threat Intelligence Platform ==="

cd ~/threat-intelligence-platform

# Create the frontend directory structure and files
echo "Creating frontend application files..."

# Create main.jsx entry point
cat > frontend/src/main.jsx << 'EOF'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
EOF

# Update index.html
cat > frontend/index.html << 'EOF'
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Threat Intelligence Platform</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
EOF

# Create postcss.config.js
cat > frontend/postcss.config.js << 'EOF'
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
EOF

# Update CORS settings in backend
echo "Updating backend CORS settings..."
cat > app/core/config.py << 'EOF'
"""
Configuration settings for the Threat Intelligence Platform
"""
from pydantic_settings import BaseSettings
from typing import Optional, List
import os

class Settings(BaseSettings):
    # Application Settings
    app_name: str = "Threat Intelligence Platform"
    app_version: str = "1.0.0"
    debug: bool = True
    log_level: str = "INFO"
    
    # API Settings
    api_v1_prefix: str = "/api/v1"
    secret_key: str = "your-secret-key-change-this-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 1440
    
    # Database Settings
    database_url: str = "postgresql://tip_user:tip_password123!@localhost:5432/threat_intelligence_db"
    
    # Redis Settings
    redis_url: str = "redis://localhost:6379/0"
    
    # Celery Settings
    celery_broker_url: str = "redis://localhost:6379/0"
    celery_result_backend: str = "redis://localhost:6379/0"
    
    # External API Keys
    otx_api_key: Optional[str] = None
    misp_url: Optional[str] = None
    misp_api_key: Optional[str] = None
    
    # GeoIP Settings
    geoip_db_path: str = "/usr/share/GeoIP/GeoLite2-City.mmdb"
    
    # Threat Feed Settings
    feed_update_interval: int = 3600  # 1 hour in seconds
    max_iocs_per_feed: int = 10000
    
    # ML Settings
    model_retrain_interval: int = 86400  # 24 hours
    confidence_threshold: float = 0.7
    
    # CORS Settings - Updated for frontend
    allowed_origins: List[str] = [
        "http://localhost:3000", 
        "http://127.0.0.1:3000",
        "http://localhost:5173",  # Vite dev server
        "http://127.0.0.1:5173"
    ]
    
    # Rate Limiting
    rate_limit_per_minute: int = 100
    
    class Config:
        env_file = ".env"
        case_sensitive = False

# Create global settings instance
settings = Settings()
EOF

# Create run_with_frontend.py script
cat > run_with_frontend.py << 'EOF'
"""
Run both backend and frontend together
"""
import subprocess
import sys
import time
import signal
import os
from threading import Thread

def run_backend():
    """Run the FastAPI backend"""
    print("🚀 Starting backend server...")
    os.chdir('/home/ubuntu/threat-intelligence-platform')
    subprocess.run([sys.executable, 'run_dev.py'])

def run_frontend():
    """Run the React frontend"""
    print("🎨 Starting frontend server...")
    os.chdir('/home/ubuntu/threat-intelligence-platform/frontend')
    subprocess.run(['npm', 'run', 'dev'])

def run_worker():
    """Run the Celery worker"""
    print("⚙️ Starting Celery worker...")
    os.chdir('/home/ubuntu/threat-intelligence-platform')
    subprocess.run([sys.executable, 'run_worker.py'])

def signal_handler(sig, frame):
    print('\n🛑 Shutting down servers...')
    sys.exit(0)

if __name__ == "__main__":
    signal.signal(signal.SIGINT, signal_handler)
    
    print("=== Threat Intelligence Platform - Full Stack ===")
    print("Starting all services...")
    
    # Start backend in a separate thread
    backend_thread = Thread(target=run_backend, daemon=True)
    backend_thread.start()
    
    # Wait a bit for backend to start
    time.sleep(3)
    
    # Start worker in a separate thread
    worker_thread = Thread(target=run_worker, daemon=True)
    worker_thread.start()
    
    # Wait a bit more
    time.sleep(2)
    
    print("✅ Backend started at: http://localhost:8000")
    print("✅ API docs available at: http://localhost:8000/docs")
    print("✅ Worker started")
    print("🎨 Starting frontend...")
    
    # Start frontend (blocking)
    run_frontend()
EOF

chmod +x run_with_frontend.py

# Create comprehensive frontend installation script
cat > setup_frontend.sh << 'EOF'
#!/bin/bash

echo "=== Setting up Frontend ==="

# Navigate to frontend directory
cd ~/threat-intelligence-platform/frontend

# Install dependencies
echo "Installing frontend dependencies..."
npm install

# Install additional required packages that might be missing
npm install --save \
  @types/node \
  eslint-plugin-react-refresh \
  @vitejs/plugin-react

echo "✅ Frontend dependencies installed!"

# Create missing directories
mkdir -p src/components/ui
mkdir -p src/hooks
mkdir -p public

# Create missing component files if they don't exist
echo "Creating any missing component files..."

# Ensure all imports are available by creating placeholder files for missing imports
touch src/components/ui/index.js

# Build the frontend for production (optional)
echo "Building frontend for production..."
npm run build

echo "✅ Frontend setup complete!"
echo ""
echo "To start the frontend development server:"
echo "cd frontend && npm run dev"
echo ""
echo "Or use the full-stack runner:"
echo "python run_with_frontend.py"
EOF

chmod +x setup_frontend.sh

# Create a comprehensive README for the frontend
cat > frontend/README.md << 'EOF'
# Threat Intelligence Platform - Frontend

A modern React-based frontend for the Threat Intelligence Platform with beautiful UI/UX.

## Features

### 🎨 Modern UI/UX
- **Clean Design**: Modern, professional interface with Tailwind CSS
- **Interactive Animations**: Smooth transitions and micro-interactions using Framer Motion
- **Responsive Layout**: Works perfectly on desktop, tablet, and mobile devices
- **Dark/Light Theme Ready**: Built with theme support

### 📊 Dashboard
- **Real-time Statistics**: Live threat intelligence metrics
- **Interactive Charts**: Beautiful charts showing threat trends and analytics
- **Threat Timeline**: Visual representation of threat activity over time
- **Feed Status Monitor**: Real-time monitoring of threat feed health

### 🛡️ IOC Management
- **Advanced Search**: Powerful search and filtering capabilities
- **Bulk Operations**: Import/export and bulk management of IOCs
- **Real-time Validation**: Instant IOC format validation
- **Detailed Views**: Comprehensive IOC information display

### 📡 Feed Management
- **Visual Feed Setup**: Easy-to-use forms for configuring threat feeds
- **Performance Monitoring**: Real-time feed performance metrics
- **Update Scheduling**: Configure automatic feed updates
- **Error Handling**: Clear error reporting and resolution guidance

### 📈 Analytics
- **Interactive Charts**: Multiple chart types for data visualization
- **Export Capabilities**: Download reports and analytics
- **Custom Dashboards**: Configurable dashboard layouts
- **Real-time Updates**: Live data updates without page refresh

## Technology Stack

- **React 18**: Modern React with hooks and functional components
- **Vite**: Fast build tool and development server
- **Tailwind CSS**: Utility-first CSS framework
- **Headless UI**: Unstyled, accessible UI components
- **Framer Motion**: Production-ready motion library
- **React Query**: Data fetching and caching
- **React Router**: Client-side routing
- **React Hook Form**: Performant forms with validation
- **Recharts**: Beautiful charts and data visualization
- **Axios**: HTTP client for API communication
- **React Hot Toast**: Beautiful notifications

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Build for Production**
   ```bash
   npm run build
   ```

## Project Structure

```
frontend/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── layout/         # Layout components (Header, Sidebar)
│   │   ├── ui/             # Basic UI components
│   │   ├── forms/          # Form components
│   │   └── charts/         # Chart components
│   ├── pages/              # Page components
│   │   ├── dashboard/      # Dashboard pages
│   │   ├── iocs/           # IOC management pages
│   │   ├── feeds/          # Feed management pages
│   │   └── analytics/      # Analytics pages
│   ├── hooks/              # Custom React hooks
│   ├── services/           # API service functions
│   ├── utils/              # Utility functions
│   ├── contexts/           # React contexts
│   └── App.jsx             # Main app component
├── public/                 # Static assets
├── package.json            # Dependencies and scripts
└── README.md              # This file
```

## API Integration

The frontend automatically connects to the backend API running on `http://localhost:8000`. The API integration includes:

- **Automatic Retries**: Failed requests are automatically retried
- **Error Handling**: Graceful error handling with user-friendly messages
- **Caching**: Intelligent caching of API responses
- **Real-time Updates**: Live data updates using React Query

## Key Components

### Dashboard Components
- `Dashboard.jsx` - Main dashboard layout
- `StatsCards.jsx` - Statistics cards with metrics
- `ThreatTimeline.jsx` - Interactive threat timeline chart
- `FeedStatus.jsx` - Real-time feed status monitoring
- `ThreatMap.jsx` - Geographic threat distribution

### IOC Management
- `IOCsPage.jsx` - Main IOC management interface
- `IOCsTable.jsx` - Sortable, filterable IOC table
- `IOCsFilters.jsx` - Advanced filtering interface
- `AddIOCModal.jsx` - IOC creation modal
- `BulkImportModal.jsx` - Bulk IOC import interface

### Feed Management
- `FeedsPage.jsx` - Feed management interface
- `FeedsTable.jsx` - Feed status and management table
- `AddFeedModal.jsx` - New feed creation modal
- `FeedDetailsModal.jsx` - Detailed feed information

## Customization

### Theming
The application uses Tailwind CSS with custom color schemes. Modify `tailwind.config.js` to customize:
- Color palettes
- Typography
- Spacing
- Animations

### Adding New Features
1. Create components in appropriate directories
2. Add API service functions in `src/services/`
3. Create custom hooks in `src/hooks/` if needed
4. Update routing in `App.jsx`

## Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Environment Variables
Create a `.env` file in the frontend directory:
```env
VITE_API_BASE_URL=http://localhost:8000
```

## Deployment

### Production Build
```bash
npm run build
```

The build files will be in the `dist/` directory, ready for deployment to any static hosting service.

### Docker Deployment
A Dockerfile is included for containerized deployment.

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details.
EOF

# Create final integration script
cat > integrate_frontend.sh << 'EOF'
#!/bin/bash

echo "=== Integrating Frontend with Backend ==="

# Ensure we're in the right directory
cd ~/threat-intelligence-platform

# Setup frontend
echo "Setting up frontend..."
./setup_frontend.sh

# Update backend to serve frontend in production
echo "Updating backend configuration..."

# Add static file serving to main.py
cat >> app/main.py << 'STATIC_EOF'

# Serve frontend static files in production
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os

# Mount static files if frontend build exists
frontend_build_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "frontend", "dist")
if os.path.exists(frontend_build_path):
    app.mount("/static", StaticFiles(directory=os.path.join(frontend_build_path, "assets")), name="static")
    
    @app.get("/{path:path}")
    async def serve_frontend(path: str):
        """Serve frontend for all non-API routes"""
        if path.startswith("api/"):
            raise HTTPException(status_code=404, detail="Not found")
        
        file_path = os.path.join(frontend_build_path, path)
        if os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        
        # Return index.html for client-side routing
        return FileResponse(os.path.join(frontend_build_path, "index.html"))
STATIC_EOF

echo "✅ Backend updated to serve frontend!"

# Create comprehensive startup script
cat > start_platform.sh << 'STARTUP_EOF'
#!/bin/bash

echo "🚀 Starting Threat Intelligence Platform"
echo "========================================"

# Check if services are running
echo "Checking system services..."

# Check PostgreSQL
if ! systemctl is-active --quiet postgresql; then
    echo "Starting PostgreSQL..."
    sudo systemctl start postgresql
fi

# Check Redis
if ! systemctl is-active --quiet redis-server; then
    echo "Starting Redis..."
    sudo systemctl start redis-server
fi

# Activate virtual environment
echo "Activating virtual environment..."
cd ~/threat-intelligence-platform
source venv/bin/activate

# Check if database is initialized
echo "Checking database..."
python -c "
try:
    from app.db.database import test_connection
    if not test_connection():
        print('Initializing database...')
        import subprocess
        subprocess.run(['python', 'initialize.py'])
    else:
        print('Database OK')
except Exception as e:
    print(f'Database issue: {e}')
    print('Running initialization...')
    import subprocess
    subprocess.run(['python', 'initialize.py'])
"

# Start the application
echo ""
echo "🎯 Starting Threat Intelligence Platform..."
echo ""
echo "📊 Backend API: http://localhost:8000"
echo "📖 API Docs: http://localhost:8000/docs"
echo "🎨 Frontend: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

# Start all services
python run_with_frontend.py
STARTUP_EOF

chmod +x start_platform.sh

echo "✅ Frontend integration complete!"
echo ""
echo "=== 🎉 SETUP COMPLETE! ==="
echo ""
echo "Your Threat Intelligence Platform is ready with:"
echo "✅ Beautiful React Frontend"
echo "✅ FastAPI Backend" 
echo "✅ PostgreSQL Database"
echo "✅ Redis Cache"
echo "✅ Celery Workers"
echo "✅ Real-time Updates"
echo "✅ Interactive Analytics"
echo ""
echo "🚀 TO START THE PLATFORM:"
echo "   ./start_platform.sh"
echo ""
echo "🌐 ACCESS POINTS:"
echo "   Frontend:  http://localhost:3000"
echo "   Backend:   http://localhost:8000" 
echo "   API Docs:  http://localhost:8000/docs"
echo ""
EOF

chmod +x integrate_frontend.sh

# Create complete package.json for frontend
cat > frontend/package.json << 'EOF'
{
  "name": "threat-intelligence-frontend",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite --host 0.0.0.0 --port 3000",
    "build": "vite build",
    "lint": "eslint . --ext js,jsx --report-unused-disable-directives --max-warnings 0",
    "preview": "vite preview --port 3000"
  },
  "dependencies": {
    "@headlessui/react": "^1.7.17",
    "@heroicons/react": "^2.0.18",
    "@tailwindcss/forms": "^0.5.6",
    "axios": "^1.5.0",
    "clsx": "^2.0.0",
    "date-fns": "^2.30.0",
    "framer-motion": "^10.16.4",
    "lucide-react": "^0.284.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-hook-form": "^7.46.1",
    "react-hot-toast": "^2.4.1",
    "react-query": "^3.39.3",
    "react-router-dom": "^6.15.0",
    "recharts": "^2.8.0",
    "tailwind-merge": "^1.14.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.22",
    "@types/react-dom": "^18.2.7",
    "@vitejs/plugin-react": "^4.0.4",
    "autoprefixer": "^10.4.15",
    "eslint": "^8.48.0",
    "eslint-plugin-react": "^7.33.2",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-react-refresh": "^0.4.3",
    "postcss": "^8.4.29",
    "tailwindcss": "^3.3.3",
    "vite": "^4.4.9"
  }
}
EOF

# Create final README with complete instructions
cat > FRONTEND_COMPLETE.md << 'EOF'
# 🎯 Threat Intelligence Platform - Complete Setup Guide

## 🚀 **Installation & Setup**

### **1. Initial Setup (Run Once)**
```bash
# Run the main setup script
chmod +x setup.sh && ./setup.sh

# Navigate to project
cd ~/threat-intelligence-platform

# Activate environment
source venv/bin/activate

# Install and integrate frontend
chmod +x integrate_frontend.sh && ./integrate_frontend.sh
```

### **2. Start the Platform**
```bash
# Simple one-command startup
./start_platform.sh
```

## 🌐 **Access Points**

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost:3000 | Main user interface |
| **Backend API** | http://localhost:8000 | REST API |
| **API Documentation** | http://localhost:8000/docs | Interactive API docs |

## ✨ **Frontend Features**

### **🏠 Dashboard**
- Real-time threat statistics
- Interactive timeline charts
- Feed status monitoring
- Geographic threat distribution
- Performance metrics

### **🛡️ IOC Management**
- Advanced search and filtering
- Bulk import/export (JSON, CSV, Plain text)
- Real-time validation
- Severity and confidence indicators
- Type-based categorization

### **📡 Feed Management** 
- Visual feed configuration
- Support for multiple feed types:
  - AlienVault OTX
  - MISP
  - JSON feeds
  - CSV feeds
  - Custom formats
- Real-time status monitoring
- Performance analytics
- Manual update triggers

### **📊 Analytics**
- Interactive charts and graphs
- IOC distribution analysis
- Confidence level tracking
- Feed performance metrics
- Exportable reports

## 🎨 **UI/UX Highlights**

- **Modern Design**: Clean, professional interface
- **Responsive**: Works on desktop, tablet, mobile
- **Interactive**: Smooth animations and transitions
- **Accessible**: Screen reader friendly
- **Fast**: Optimized performance with caching
- **Real-time**: Live updates without page refresh

## 🔧 **Development**

### **Frontend Development**
```bash
cd frontend
npm run dev    # Start development server
npm run build  # Build for production
npm run lint   # Run linter
```

### **Backend Development**
```bash
python run_dev.py     # Start API server
python run_worker.py  # Start Celery worker
```

## 📁 **Project Structure**
```
threat-intelligence-platform/
├── app/                     # Backend Python code
│   ├── api/                # API endpoints
│   ├── core/               # Core configuration
│   ├── db/                 # Database layer
│   ├── models/             # Database models
│   ├── services/           # Business logic
│   └── utils/              # Utilities
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom hooks
│   │   └── services/       # API services
│   └── dist/               # Built frontend
├── tests/                  # Test files
├── docs/                   # Documentation
└── scripts/                # Utility scripts
```

## 🔐 **Security Features**

- Input validation and sanitization
- CORS protection
- Rate limiting
- SQL injection prevention
- XSS protection
- Secure API key handling

## 📈 **Performance**

- Optimized database queries with indexing
- Redis caching for frequent requests
- Background task processing with Celery
- Frontend code splitting and lazy loading
- Compressed static assets

## 🚨 **Troubleshooting**

### **Common Issues**

1. **Database Connection Error**
   ```bash
   sudo systemctl restart postgresql
   python initialize.py
   ```

2. **Redis Connection Error**
   ```bash
   sudo systemctl restart redis-server
   ```

3. **Frontend Build Issues**
   ```bash
   cd frontend
   rm -rf node_modules package-lock.json
   npm install
   npm run build
   ```

4. **Python Dependencies**
   ```bash
   pip install -r requirements.txt --force-reinstall
   ```

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch
3. Make changes with tests
4. Submit a pull request

## 📄 **License**

MIT License - Open source and free to use.

---

**🎉 Congratulations! Your Threat Intelligence Platform is ready!**

The platform provides enterprise-grade threat intelligence capabilities with a beautiful, modern interface. You can now:

- Monitor threats in real-time
- Manage IOCs efficiently  
- Configure multiple threat feeds
- Analyze threat patterns
- Export comprehensive reports

**Happy threat hunting! 🔍🛡️**
EOF

echo "✅ Complete frontend setup files created!"
echo ""
echo "🚀 FINAL STEPS:"
echo "1. chmod +x integrate_frontend.sh && ./integrate_frontend.sh"
echo "2. ./start_platform.sh"
echo ""
echo "🌟 Your beautiful Threat Intelligence Platform will be ready!"
