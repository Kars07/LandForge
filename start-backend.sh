#!/bin/bash
# LandForge backend startup script
# Run this once per session from the project root

set -e
DBPATH=/tmp/mongodb-data

echo "📦 Starting MongoDB..."
mkdir -p $DBPATH
# Kill any stale mongod first
pkill mongod 2>/dev/null || true
sleep 1
mongod --dbpath $DBPATH --logpath /tmp/mongod.log --fork --bind_ip 127.0.0.1
sleep 2

echo "🚀 Starting LandForge Express API on :3001..."
cd "$(dirname "$0")/landforge_backend"

# Kill any stale node server on port 3001
fuser -k 3001/tcp 2>/dev/null || true
sleep 1

node server.js &
SERVER_PID=$!
echo $SERVER_PID > /tmp/landforge_server.pid
sleep 2

echo "✅ Health check..."
curl -s http://localhost:3001/api/health && echo ""
echo "Server PID: $SERVER_PID (stored in /tmp/landforge_server.pid)"
echo "Stop with: kill \$(cat /tmp/landforge_server.pid)"
