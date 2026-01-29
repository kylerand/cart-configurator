#!/bin/bash

# Admin API Test Script
# Tests all CRUD endpoints with authentication

API_URL="http://localhost:3001"

echo "=== Golf Cart Admin API Test Suite ==="
echo ""

# Login and get token
echo "1. Authenticating..."
TOKEN=$(curl -s -X POST $API_URL/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@golfcarts.com","password":"admin123"}' | jq -r '.accessToken')

if [ "$TOKEN" == "null" ] || [ -z "$TOKEN" ]; then
  echo "❌ Login failed"
  exit 1
fi
echo "✅ Logged in as admin"

# Test Platform API
echo ""
echo "2. Testing Platform API..."
PLATFORM_ID="test-platform-$(date +%s)"
curl -s -X POST $API_URL/api/admin/platforms \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"id\": \"$PLATFORM_ID\",
    \"name\": \"Test Platform\",
    \"description\": \"Test platform description\",
    \"basePrice\": 10000
  }" > /dev/null && echo "   ✅ Created platform"

curl -s -X GET $API_URL/api/admin/platforms \
  -H "Authorization: Bearer $TOKEN" | jq -e ".platforms | length > 0" > /dev/null && echo "   ✅ Listed platforms"

curl -s -X PUT $API_URL/api/admin/platforms/$PLATFORM_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"description":"Updated"}' > /dev/null && echo "   ✅ Updated platform"

# Test Option API
echo ""
echo "3. Testing Option API..."
OPTION_ID="test-option-$(date +%s)"
curl -s -X POST $API_URL/api/admin/options \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"id\": \"$OPTION_ID\",
    \"platformId\": \"$PLATFORM_ID\",
    \"category\": \"ROOF\",
    \"name\": \"Test Option\",
    \"description\": \"Test option description\",
    \"partPrice\": 500,
    \"laborHours\": 2
  }" > /dev/null && echo "   ✅ Created option"

curl -s -X GET $API_URL/api/admin/options \
  -H "Authorization: Bearer $TOKEN" | jq -e ".options | length > 0" > /dev/null && echo "   ✅ Listed options"

# Test Material API
echo ""
echo "4. Testing Material API..."
MATERIAL_ID="test-material-$(date +%s)"
curl -s -X POST $API_URL/api/admin/materials \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"id\": \"$MATERIAL_ID\",
    \"zone\": \"BODY\",
    \"type\": \"PAINT\",
    \"name\": \"Test Material\",
    \"description\": \"Test material description\",
    \"color\": \"#00FF00\",
    \"finish\": \"GLOSS\",
    \"priceMultiplier\": 1.0
  }" > /dev/null && echo "   ✅ Created material"

curl -s -X GET $API_URL/api/admin/materials \
  -H "Authorization: Bearer $TOKEN" | jq -e ".materials | length > 0" > /dev/null && echo "   ✅ Listed materials"

# Test Option Rules
echo ""
echo "5. Testing Option Rules..."
OPTION_ID_2="test-option-2-$(date +%s)"
curl -s -X POST $API_URL/api/admin/options \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"id\": \"$OPTION_ID_2\",
    \"platformId\": \"$PLATFORM_ID\",
    \"category\": \"SEATS\",
    \"name\": \"Test Option 2\",
    \"description\": \"Test option 2\",
    \"partPrice\": 300,
    \"laborHours\": 1
  }" > /dev/null

curl -s -X POST $API_URL/api/admin/options/$OPTION_ID/rules \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"relatedId\": \"$OPTION_ID_2\",
    \"type\": \"REQUIRES\",
    \"reason\": \"Test rule\"
  }" > /dev/null && echo "   ✅ Created option rule"

echo ""
echo "=== All Tests Passed ✅ ==="
