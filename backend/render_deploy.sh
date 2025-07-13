#!/bin/bash

# Render deployment script for ArenaPulse automated news generation

echo "🚀 Starting ArenaPulse deployment..."

# Install Python dependencies
echo "📦 Installing Python dependencies..."
pip install -r requirements.txt

# Install Node.js dependencies
echo "📦 Installing Node.js dependencies..."
npm install

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p logs

# Set up environment variables
echo "🔧 Setting up environment..."
if [ -z "$GROQ_API_KEY" ]; then
    echo "❌ GROQ_API_KEY not set"
    exit 1
fi

if [ -z "$MONGO_URL" ]; then
    echo "❌ MONGO_URL not set"
    exit 1
fi

# Start the automated news generator in the background
echo "🤖 Starting automated news generator..."
python auto_generator.py &

# Start the main server
echo "🌐 Starting ArenaPulse server..."
node server.js 