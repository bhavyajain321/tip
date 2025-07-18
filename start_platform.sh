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
