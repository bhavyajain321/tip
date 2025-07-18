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
    os.chdir('/home/bhavya/threat-intelligence-platform')
    subprocess.run([sys.executable, 'run_dev.py'])

def run_frontend():
    """Run the React frontend"""
    print("🎨 Starting frontend server...")
    os.chdir('/home/bhavya/threat-intelligence-platform/frontend')
    subprocess.run(['npm', 'run', 'dev'])

def run_worker():
    """Run the Celery worker"""
    print("⚙️ Starting Celery worker...")
    os.chdir('/home/bhavya/threat-intelligence-platform')
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
