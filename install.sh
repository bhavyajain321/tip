#!/bin/bash

echo "=== Threat Intelligence Platform Installation ==="

# Check if we're in the right directory
if [ ! -f "requirements.txt" ]; then
    echo "❌ Please run this script from the threat-intelligence-platform directory"
    exit 1
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Install Python dependencies
echo "Installing Python dependencies..."
pip install -r requirements.txt

# Check if PostgreSQL is running
echo "Checking PostgreSQL service..."
sudo systemctl status postgresql > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "Starting PostgreSQL..."
    sudo systemctl start postgresql
fi

# Check if Redis is running
echo "Checking Redis service..."
sudo systemctl status redis-server > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "Starting Redis..."
    sudo systemctl start redis-server
fi

# Initialize the database
echo "Initializing database..."
python initialize.py

# Make scripts executable
chmod +x run_dev.py
chmod +x run_worker.py

echo ""
echo "=== Installation Complete! ==="
echo ""
echo "To start the platform:"
echo "1. Terminal 1: python run_dev.py    # Start API server"
echo "2. Terminal 2: python run_worker.py # Start Celery worker"
echo ""
echo "Then visit: http://localhost:8000/docs"
echo ""
