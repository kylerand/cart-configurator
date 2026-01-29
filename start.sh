#!/bin/bash
# Quick start script for development

echo "🏗️  Golf Cart Configurator - Development Setup"
echo ""

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
  echo "📦 Installing dependencies..."
  npm install
fi

# Check if packages are built
if [ ! -d "packages/types/dist" ]; then
  echo "🔨 Building packages..."
  npm run build:packages
fi

# Check if Prisma is set up
if [ ! -f "apps/api/prisma/dev.db" ]; then
  echo "🗄️  Setting up database..."
  cd apps/api
  npx prisma generate
  npx prisma db push
  cd ../..
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "🚀 Starting servers..."
echo ""
echo "Open two terminal windows and run:"
echo "  Terminal 1: npm run dev:api"
echo "  Terminal 2: npm run dev:web"
echo ""
echo "Then visit: http://localhost:3000"
