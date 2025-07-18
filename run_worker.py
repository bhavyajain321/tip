"""
Celery worker runner
"""
import subprocess
import sys
import os

# Add the app to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

if __name__ == "__main__":
    # Run celery worker
    subprocess.run([
        sys.executable, "-m", "celery", 
        "-A", "app.core.celery", 
        "worker", 
        "--loglevel=info"
    ])
