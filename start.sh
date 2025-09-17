!/bin/bash

# Data Visualizer Startup Script
# Starts frontend-only CSV-based data visualizer

echo "🚀 Starting Data Visualizer (Frontend Only)..."
echo ""

# Check if we're in the correct directory
if [ ! -f "package.json" ]; then
    echo "❌ Please run this script from the DataVisualiser root directory"
    exit 1
fi

# Function to cleanup background processes
cleanup() {
    echo ""
    echo "🛑 Shutting down server..."
    jobs -p | xargs -r kill
    exit 0
}

# Set trap to cleanup on exit
trap cleanup SIGINT SIGTERM

# Start frontend
echo "🎨 Starting React frontend on http://localhost:5174..."
npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ Frontend server is starting up..."
echo ""
echo "🎨 Frontend: http://localhost:5174"
echo ""
echo "📊 This version loads CSV data directly in the browser"
echo "📁 Sample datasets are included, or upload your own CSV files"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Wait for background processes
wait
