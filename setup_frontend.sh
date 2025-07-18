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
