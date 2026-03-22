#!/bin/bash

set -e

CYBERSIM_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$CYBERSIM_DIR/cybersim-main/backend"
FRONTEND_DIR="$CYBERSIM_DIR/cybersim-main/frontend"

echo "🚀 Starting CyberSim..."

# Install backend dependencies
if [ ! -d "$BACKEND_DIR/node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    cd "$BACKEND_DIR" && npm install
fi

# Install frontend dependencies
if [ ! -d "$FRONTEND_DIR/node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    cd "$FRONTEND_DIR" && npm install
fi

# Start backend in background
echo "⚡ Starting backend server..."
cd "$BACKEND_DIR" && npm run dev &
BACKEND_PID=$!

# Wait for backend to start
echo "⏳ Waiting for backend to initialize..."
sleep 5

# Seed labs
echo "🧪 Seeding labs..."
curl -s -X POST http://localhost:5050/api/labs/seed > /dev/null 2>&1 || echo "   (labs may already exist)"

# Start frontend in background
echo "⚡ Starting frontend server..."
cd "$FRONTEND_DIR" && npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ CyberSim is running!"
echo "   Frontend: http://localhost:5173"
echo "   Backend:  http://localhost:5050"
echo ""
echo "Press Ctrl+C to stop all servers"

# Handle shutdown
cleanup() {
    echo ""
    echo "🛑 Stopping servers..."
    kill $BACKEND_PID 2>/dev/null || true
    kill $FRONTEND_PID 2>/dev/null || true
    exit 0
}

trap cleanup SIGINT SIGTERM
wait
