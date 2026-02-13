#!/bin/bash

# MT5 API Test Script
# This script tests your MT5 sync API endpoint

echo "🧪 Testing MT5 Sync API..."
echo ""

# Configuration
API_URL="https://your-domain.com/api/mt5-sync"
API_KEY="your-secret-key-here"

echo "📍 API URL: $API_URL"
echo "🔑 API Key: ${API_KEY:0:10}..."
echo ""

# Test payload (sample trade)
PAYLOAD='{
  "ticket": "TEST-12345",
  "symbol": "EURUSD",
  "assetClass": "FOREX",
  "type": "LONG",
  "lots": "0.10",
  "entry": "1.0850",
  "exit": "1.0900",
  "sl": "1.0800",
  "tp": "1.0950",
  "profit": "50.00",
  "pips": "50.0",
  "entryTime": "2024-01-15 10:30:00",
  "exitTime": "2024-01-15 11:45:00"
}'

echo "📤 Sending test trade..."
echo ""

# Make the request
RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $API_KEY" \
  -d "$PAYLOAD")

# Extract HTTP code
HTTP_CODE=$(echo "$RESPONSE" | grep "HTTP_CODE:" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_CODE:/d')

echo "📥 Response:"
echo "$BODY" | python3 -m json.tool 2>/dev/null || echo "$BODY"
echo ""

# Check result
if [ "$HTTP_CODE" = "200" ]; then
  echo "✅ SUCCESS! API is working correctly."
  echo ""
  echo "Next steps:"
  echo "1. Check your journal dashboard"
  echo "2. Look for trade TEST-12345"
  echo "3. It should be tagged with 'MT5 Import'"
  echo ""
  echo "🎉 You're ready to connect MT5!"
elif [ "$HTTP_CODE" = "401" ]; then
  echo "❌ AUTHENTICATION FAILED"
  echo "The API key is incorrect."
  echo ""
  echo "Fix:"
  echo "1. Check MT5_API_SECRET_KEY in your .env.local"
  echo "2. Update API_KEY in this script"
  echo "3. Make sure they match exactly"
elif [ "$HTTP_CODE" = "404" ]; then
  echo "❌ API NOT FOUND"
  echo "The API endpoint doesn't exist."
  echo ""
  echo "Fix:"
  echo "1. Verify your API URL is correct"
  echo "2. Make sure you've deployed the api/mt5-sync.js file"
  echo "3. Check your hosting platform logs"
elif [ "$HTTP_CODE" = "500" ]; then
  echo "❌ SERVER ERROR"
  echo "The API encountered an error."
  echo ""
  echo "Fix:"
  echo "1. Check your hosting platform logs"
  echo "2. Verify Supabase credentials are correct"
  echo "3. Make sure DEFAULT_MT5_USER_ID is set"
else
  echo "❌ UNEXPECTED ERROR (HTTP $HTTP_CODE)"
  echo ""
  echo "Check:"
  echo "1. API URL is correct"
  echo "2. Server is running"
  echo "3. Hosting platform logs"
fi

echo ""
echo "📚 For more help, see MT5_INTEGRATION_GUIDE.md"
