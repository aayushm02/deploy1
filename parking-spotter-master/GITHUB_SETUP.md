# 🐙 GitHub Setup Guide

This guide will help you push your Parking Spot Finder project to GitHub and set it up for deployment.

## 📋 Prerequisites

- Git installed on your system
- GitHub account
- Project ready for deployment

## 🚀 Step-by-Step GitHub Setup

### 1. Initialize Git Repository

```bash
# Navigate to your project directory
cd parking-spot-finder

# Initialize git repository
git init

# Add all files to staging
git add .

# Create initial commit
git commit -m "Initial commit: Parking Spot Finder application"
```

### 2. Create GitHub Repository

1. Go to [GitHub.com](https://github.com) and sign in
2. Click the "+" icon in the top right corner
3. Select "New repository"
4. Fill in the details:
   - **Repository name**: `parking-spot-finder`
   - **Description**: `A modern parking spot finder application with real-time location services`
   - **Visibility**: Choose Public or Private
   - **DO NOT** initialize with README, .gitignore, or license (we already have these)
5. Click "Create repository"

### 3. Connect Local Repository to GitHub

```bash
# Add GitHub remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/parking-spot-finder.git

# Set main branch
git branch -M main

# Push to GitHub
git push -u origin main
```

### 4. Verify Upload

1. Go to your GitHub repository
2. Verify all files are uploaded correctly
3. Check that the README.md displays properly

## 🔧 Environment Setup

### 1. Create Environment Files

**Backend Environment:**
```bash
# Copy example file
cp backend/env.example backend/.env

# Edit the .env file with your values
```

**Frontend Environment:**
```bash
# Copy example file
cp frontend/env.example frontend/.env

# Edit the .env file with your values
```

### 2. Update Environment Variables

**backend/.env:**
```env
MONGO_URI=mongodb://localhost:27017/parking_spot_finder
JWT_SECRET=your-super-secret-jwt-key-change-this
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

**frontend/.env:**
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_NAME=Parking Spot Finder
REACT_APP_VERSION=1.0.0
REACT_APP_MAP_DEFAULT_LAT=28.6139
REACT_APP_MAP_DEFAULT_LNG=77.2090
REACT_APP_MAP_DEFAULT_ZOOM=13
REACT_APP_ENABLE_ANALYTICS=false
REACT_APP_ENABLE_DEBUG=true
```

## 🚀 Deployment Options

### Option 1: Heroku (Easiest)

1. **Install Heroku CLI**
   - Download from: https://devcenter.heroku.com/articles/heroku-cli

2. **Login to Heroku**
   ```bash
   heroku login
   ```

3. **Create Heroku App**
   ```bash
   # For backend
   heroku create your-parking-app-backend
   
   # For frontend
   heroku create your-parking-app-frontend
   ```

4. **Deploy Backend**
   ```bash
   # Add MongoDB addon
   heroku addons:create mongolab:sandbox --app your-parking-app-backend
   
   # Set environment variables
   heroku config:set JWT_SECRET=your-secret-key --app your-parking-app-backend
   heroku config:set NODE_ENV=production --app your-parking-app-backend
   
   # Deploy
   git subtree push --prefix backend heroku main
   ```

5. **Deploy Frontend**
   ```bash
   # Build and deploy
   cd frontend
   npm run build
   git subtree push --prefix frontend heroku main
   ```

### Option 2: Vercel + Railway

1. **Frontend on Vercel**
   - Go to [Vercel.com](https://vercel.com)
   - Connect your GitHub repository
   - Set build settings:
     - Build Command: `cd frontend && npm run build`
     - Output Directory: `frontend/build`
   - Add environment variables

2. **Backend on Railway**
   - Go to [Railway.app](https://railway.app)
   - Connect your GitHub repository
   - Add MongoDB service
   - Set environment variables

### Option 3: Docker

```bash
# Build and run with Docker Compose
docker-compose up --build

# Or run individual containers
docker build -t parking-backend ./backend
docker build -t parking-frontend ./frontend
```

## 📝 GitHub Actions CI/CD (Optional)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: |
        npm install
        cd backend && npm install
        cd ../frontend && npm install
        
    - name: Build frontend
      run: |
        cd frontend && npm run build
        
    - name: Deploy to Heroku
      uses: akhileshns/heroku-deploy@v3.12.12
      with:
        heroku_api_key: ${{secrets.HEROKU_API_KEY}}
        heroku_app_name: "your-app-name"
        heroku_email: "your-email@example.com"
```

## 🔐 GitHub Secrets

For automated deployment, add these secrets to your GitHub repository:

1. Go to your repository settings
2. Click "Secrets and variables" → "Actions"
3. Add the following secrets:
   - `HEROKU_API_KEY`: Your Heroku API key
   - `MONGO_URI`: Your MongoDB connection string
   - `JWT_SECRET`: Your JWT secret key

## 📊 Project Structure on GitHub

Your repository should have this structure:

```
parking-spot-finder/
├── .github/
│   └── workflows/
│       └── deploy.yml
├── backend/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── Dockerfile
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── public/
│   ├── src/
│   ├── Dockerfile
│   ├── package.json
│   └── nginx.conf
├── .gitignore
├── docker-compose.yml
├── README.md
├── DEPLOYMENT.md
└── package.json
```

## 🧪 Testing Your Setup

1. **Local Testing**
   ```bash
   # Start backend
   cd backend && npm start
   
   # Start frontend (in new terminal)
   cd frontend && npm start
   ```

2. **Test API Endpoints**
   ```bash
   # Health check
   curl http://localhost:5000/api/health
   
   # Test registration
   curl -X POST http://localhost:5000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"name":"Test User","email":"test@example.com","password":"password123"}'
   ```

## 🆘 Troubleshooting

### Common Issues

1. **Git Push Fails**
   ```bash
   # Check remote URL
   git remote -v
   
   # Update remote if needed
   git remote set-url origin https://github.com/YOUR_USERNAME/parking-spot-finder.git
   ```

2. **Environment Variables Not Working**
   - Make sure `.env` files are in the correct directories
   - Check that variable names start with `REACT_APP_` for frontend
   - Restart the development server after changes

3. **Build Failures**
   ```bash
   # Clear npm cache
   npm cache clean --force
   
   # Delete node_modules and reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

4. **Docker Issues**
   ```bash
   # Check Docker is running
   docker --version
   
   # Clean up containers
   docker-compose down
   docker system prune -a
   ```

## 📞 Support

If you encounter issues:

1. Check the [Issues](https://github.com/yourusername/parking-spot-finder/issues) page
2. Create a new issue with detailed description
3. Include error messages and steps to reproduce

## 🎉 Success!

Once everything is set up, you should have:

- ✅ Code pushed to GitHub
- ✅ Environment variables configured
- ✅ Application running locally
- ✅ Ready for deployment
- ✅ CI/CD pipeline (if configured)

Your Parking Spot Finder application is now ready for the world! 🌍

