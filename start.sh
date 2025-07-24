#!/bin/bash

# Data Visualizer Startup Script
# Starts both backend and frontend servers

echo "🚀 Starting Data Visualizer..."
echo ""

# Check if we're in the correct directory
if [ ! -f "package.json" ]; then
    echo "❌ Please run this script from the DataVisualiser root directory"
    exit 1
fi

# Function to cleanup background processes
cleanup() {
    echo ""
    echo "🛑 Shutting down servers..."
    jobs -p | xargs -r kill
    exit 0
}

# Set trap to cleanup on exit
trap cleanup SIGINT SIGTERM

# Start backend
echo "📊 Starting FastAPI backend on http://localhost:8000..."
cd backend
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 2

# Start frontend
echo "🎨 Starting React frontend on http://localhost:5174..."
npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ Both servers are starting up..."
echo ""
echo "📊 Backend:  http://localhost:8000"
echo "🎨 Frontend: http://localhost:5174"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Wait for background processes
wait
