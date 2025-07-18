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
