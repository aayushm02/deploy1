#!/bin/bash

echo "🚀 Parking Spot Finder - Quick Deploy Fix"
echo "=========================================="

# Remove node_modules and package-lock.json
echo "Cleaning up dependencies..."
rm -rf node_modules package-lock.json

# Install dependencies with specific versions
echo "Installing compatible dependencies..."
npm install

echo "✅ Dependencies installed successfully!"
echo ""
echo "🔧 Next steps:"
echo "1. Make sure your .env file has the correct MongoDB URI"
echo "2. Test locally: npm start"
echo "3. If working locally, redeploy to your platform"
echo ""
echo "📝 Environment variables needed:"
echo "MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/database"
echo "JWT_SECRET=your-secret-key"
echo "PORT=5000"
echo "NODE_ENV=production"
echo "FRONTEND_URL=https://your-frontend-url.com"
