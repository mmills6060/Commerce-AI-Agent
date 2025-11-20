#!/bin/bash

# Commerce AI Agent Backend Startup Script

echo "🚀 Starting Commerce AI Agent Backend..."
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
  echo "❌ Error: .env file not found!"
  echo ""
  echo "Please create a .env file with your Supabase credentials."
  echo "See QUICK_START.md for instructions."
  echo ""
  exit 1
fi

# Check if required env vars are set
source .env
if [ "$SUPABASE_URL" = "your_supabase_url_here" ] || [ -z "$SUPABASE_URL" ]; then
  echo "❌ Error: SUPABASE_URL not configured in .env"
  echo ""
  echo "Please update your .env file with actual Supabase credentials."
  echo "See QUICK_START.md for setup instructions."
  echo ""
  exit 1
fi

echo "✅ Environment variables loaded"
echo ""

# Test Supabase connection
echo "🔍 Testing Supabase connection..."
npm run test:supabase
if [ $? -ne 0 ]; then
  echo ""
  echo "❌ Supabase connection test failed!"
  echo "Please check your credentials and ensure the database is set up."
  echo ""
  exit 1
fi

echo ""
echo "✅ Supabase connection successful"
echo ""

# Start the server
echo "🚀 Starting development server on http://localhost:3001"
echo ""
npm run dev

