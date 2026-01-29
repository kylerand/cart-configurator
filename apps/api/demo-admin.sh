#!/bin/bash

# Admin Panel Demo Script
# Demonstrates the complete admin workflow

API_URL="http://localhost:3001"

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║   Golf Cart Admin Panel - Demo Script                         ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Step 1: Login
echo "📝 Step 1: Logging in as admin..."
LOGIN_RESPONSE=$(curl -s -X POST $API_URL/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@golfcarts.com","password":"admin123"}')

TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.accessToken')
USER_NAME=$(echo $LOGIN_RESPONSE | jq -r '.user.name')
USER_ROLE=$(echo $LOGIN_RESPONSE | jq -r '.user.role')

if [ "$TOKEN" == "null" ]; then
  echo "❌ Login failed. Make sure API is running and admin is seeded."
  echo "   Run: cd apps/api && npm run seed:admin"
  exit 1
fi

echo "✅ Logged in as: $USER_NAME ($USER_ROLE)"
echo ""

# Step 2: Create Platform
echo "🛠️  Step 2: Creating a new platform..."
PLATFORM_RESPONSE=$(curl -s -X POST $API_URL/api/admin/platforms \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "id": "demo-platform-'"$(date +%s)"'",
    "name": "Demo Cart Platform",
    "description": "Full-featured 6-passenger golf cart",
    "basePrice": 12500.00,
    "defaultAssetPath": "/assets/platforms/demo.glb"
  }')

PLATFORM_ID=$(echo $PLATFORM_RESPONSE | jq -r '.platform.id')
PLATFORM_NAME=$(echo $PLATFORM_RESPONSE | jq -r '.platform.name')

if [ "$PLATFORM_ID" == "null" ]; then
  echo "❌ Platform creation failed"
  exit 1
fi

echo "✅ Created platform: $PLATFORM_NAME (ID: $PLATFORM_ID)"
echo ""

# Step 3: Create Options
echo "⚙️  Step 3: Adding configuration options..."

# Option 1: Extended Roof
OPTION1_RESPONSE=$(curl -s -X POST $API_URL/api/admin/options \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "id": "demo-roof-'"$(date +%s)"'",
    "platformId": "'"$PLATFORM_ID"'",
    "category": "ROOF",
    "name": "Weather Protection Roof",
    "description": "Full aluminum roof with rain channels",
    "partPrice": 850.00,
    "laborHours": 4.0,
    "assetPath": "/assets/options/roof-weather.glb"
  }')

OPTION1_ID=$(echo $OPTION1_RESPONSE | jq -r '.option.id')
OPTION1_NAME=$(echo $OPTION1_RESPONSE | jq -r '.option.name')
echo "  ✅ Added: $OPTION1_NAME (\$850)"

# Option 2: Premium Seats
sleep 1
OPTION2_RESPONSE=$(curl -s -X POST $API_URL/api/admin/options \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "id": "demo-seats-'"$(date +%s)"'",
    "platformId": "'"$PLATFORM_ID"'",
    "category": "SEATS",
    "name": "Premium Comfort Seats",
    "description": "Contoured seats with lumbar support",
    "partPrice": 1200.00,
    "laborHours": 3.5,
    "assetPath": "/assets/options/seats-premium.glb"
  }')

OPTION2_ID=$(echo $OPTION2_RESPONSE | jq -r '.option.id')
OPTION2_NAME=$(echo $OPTION2_RESPONSE | jq -r '.option.name')
echo "  ✅ Added: $OPTION2_NAME (\$1,200)"

# Option 3: LED Lighting
sleep 1
OPTION3_RESPONSE=$(curl -s -X POST $API_URL/api/admin/options \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "id": "demo-lights-'"$(date +%s)"'",
    "platformId": "'"$PLATFORM_ID"'",
    "category": "LIGHTING",
    "name": "LED Light Package",
    "description": "Full LED headlights, taillights, and underglow",
    "partPrice": 650.00,
    "laborHours": 2.5,
    "assetPath": "/assets/options/lights-led.glb"
  }')

OPTION3_ID=$(echo $OPTION3_RESPONSE | jq -r '.option.id')
OPTION3_NAME=$(echo $OPTION3_RESPONSE | jq -r '.option.name')
echo "  ✅ Added: $OPTION3_NAME (\$650)"
echo ""

# Step 4: Add Option Rule
echo "🔗 Step 4: Adding compatibility rule..."
RULE_RESPONSE=$(curl -s -X POST $API_URL/api/admin/options/$OPTION1_ID/rules \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "relatedId": "'"$OPTION2_ID"'",
    "type": "REQUIRES",
    "reason": "Weather roof requires premium seats for proper head clearance"
  }')

RULE_TYPE=$(echo $RULE_RESPONSE | jq -r '.rule.type')
echo "✅ Rule created: $OPTION1_NAME $RULE_TYPE $OPTION2_NAME"
echo ""

# Step 5: Create Materials
echo "🎨 Step 5: Adding material options..."

# Material 1: Pearl White Paint
MATERIAL1_RESPONSE=$(curl -s -X POST $API_URL/api/admin/materials \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "id": "demo-paint-white-'"$(date +%s)"'",
    "zone": "BODY",
    "type": "PAINT",
    "name": "Pearl White",
    "description": "Pearlescent white automotive paint with clear coat",
    "color": "#F8F8FF",
    "finish": "GLOSS",
    "priceMultiplier": 1.25
  }')

MATERIAL1_NAME=$(echo $MATERIAL1_RESPONSE | jq -r '.material.name')
MATERIAL1_COLOR=$(echo $MATERIAL1_RESPONSE | jq -r '.material.color')
echo "  ✅ Added: $MATERIAL1_NAME ($MATERIAL1_COLOR) - 1.25x price"

# Material 2: Racing Red Paint
sleep 1
MATERIAL2_RESPONSE=$(curl -s -X POST $API_URL/api/admin/materials \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "id": "demo-paint-red-'"$(date +%s)"'",
    "zone": "BODY",
    "type": "PAINT",
    "name": "Racing Red",
    "description": "High-gloss racing red with ceramic coating",
    "color": "#DC143C",
    "finish": "GLOSS",
    "priceMultiplier": 1.35
  }')

MATERIAL2_NAME=$(echo $MATERIAL2_RESPONSE | jq -r '.material.name')
MATERIAL2_COLOR=$(echo $MATERIAL2_RESPONSE | jq -r '.material.color')
echo "  ✅ Added: $MATERIAL2_NAME ($MATERIAL2_COLOR) - 1.35x price"

# Material 3: Black Vinyl Seats
sleep 1
MATERIAL3_RESPONSE=$(curl -s -X POST $API_URL/api/admin/materials \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "id": "demo-vinyl-black-'"$(date +%s)"'",
    "zone": "SEATS",
    "type": "VINYL",
    "name": "Black Marine Vinyl",
    "description": "UV-resistant marine-grade vinyl upholstery",
    "color": "#1C1C1C",
    "finish": "SATIN",
    "priceMultiplier": 1.0
  }')

MATERIAL3_NAME=$(echo $MATERIAL3_RESPONSE | jq -r '.material.name')
MATERIAL3_COLOR=$(echo $MATERIAL3_RESPONSE | jq -r '.material.color')
echo "  ✅ Added: $MATERIAL3_NAME ($MATERIAL3_COLOR) - 1.0x price"
echo ""

# Step 6: Get Summary
echo "📊 Step 6: Fetching catalog summary..."
PLATFORMS=$(curl -s -X GET $API_URL/api/admin/platforms -H "Authorization: Bearer $TOKEN" | jq '.platforms | length')
OPTIONS=$(curl -s -X GET $API_URL/api/admin/options -H "Authorization: Bearer $TOKEN" | jq '.options | length')
MATERIALS=$(curl -s -X GET $API_URL/api/admin/materials -H "Authorization: Bearer $TOKEN" | jq '.materials | length')

echo "  Platforms:  $PLATFORMS"
echo "  Options:    $OPTIONS"
echo "  Materials:  $MATERIALS"
echo ""

# Step 7: Check Audit Logs
echo "📝 Step 7: Checking audit trail..."
cd /Users/kylerand/Documents/code/gg/cart-configurator/apps/api/prisma 2>/dev/null && \
RECENT_LOGS=$(sqlite3 dev.db "SELECT COUNT(*) FROM AuditLog WHERE timestamp > $(date -u +%s000 -d '1 minute ago' 2>/dev/null || date -u -v-1M +%s000)000;")
echo "  Recent audit logs: $RECENT_LOGS entries"
echo ""

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║   ✅ Demo Complete!                                            ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "🌐 View the admin panel at: http://localhost:5173/admin/login"
echo "📧 Login: admin@golfcarts.com"
echo "🔑 Password: admin123"
echo ""
echo "What was created:"
echo "  • 1 Platform: $PLATFORM_NAME"
echo "  • 3 Options: Roof, Seats, Lighting"
echo "  • 3 Materials: Pearl White, Racing Red, Black Vinyl"
echo "  • 1 Compatibility Rule: Roof requires Premium Seats"
echo ""
