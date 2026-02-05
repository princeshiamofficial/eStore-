#!/bin/bash

# Define App Name
APP_NAME="estore"

echo "🚀 Starting Deployment for $APP_NAME..."

# 1. Install Dependencies
echo "📦 Installing/Updating dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "❌ npm install failed. Please check your package.json and node setup."
    exit 1
fi

# 2. Check Environment Variables
if [ ! -f .env ]; then
    echo "⚠️  WARNING: .env file not found!"
    echo "   Please create it with your database credentials."
    echo "   Example:"
    echo "   DB_HOST=localhost"
    echo "   DB_USER=..."
    exit 1
fi

# 3. Database Migration (Optional but good safety check)
# It seems your migration logic is inside server.js on startup, so we don't need a separate script here.
# But if you had a separate migration script, you would run it here, e.g., node migrate.js

# 4. Manage PM2 Process
if command -v pm2 &> /dev/null; then
    echo "✅ PM2 is installed."
else
    echo "⚙️  Installing PM2 globally..."
    npm install -g pm2
fi

# Check if app is running
if pm2 list | grep -q "$APP_NAME"; then
    echo "🔄 App is already running. Restarting..."
    pm2 restart $APP_NAME
else
    echo "▶️  App is not running. Starting..."
    pm2 start server.js --name "$APP_NAME"
fi

# 5. Save Startup Configuration
echo "💾 Saving PM2 process list..."
pm2 save

echo "✅ deployment complete! "
echo "   Don't forget to check your vHost configuration if this is a fresh install."
