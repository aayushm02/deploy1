# 🚀 Deployment Guide

This guide covers multiple deployment options for the Parking Spot Finder application.

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud)
- Git
- Heroku CLI (for Heroku deployment)
- Docker (for containerized deployment)

## 🌐 Deployment Options

### Option 1: Heroku (Recommended for Beginners)

#### 1. Prepare for Heroku
```bash
# Install Heroku CLI
# Download from: https://devcenter.heroku.com/articles/heroku-cli

# Login to Heroku
heroku login

# Create Heroku app
heroku create your-parking-app-name
```

#### 2. Backend Deployment
```bash
cd backend

# Add MongoDB addon
heroku addons:create mongolab:sandbox

# Set environment variables
heroku config:set JWT_SECRET=your-super-secret-jwt-key
heroku config:set NODE_ENV=production
heroku config:set FRONTEND_URL=https://your-frontend-url.herokuapp.com

# Deploy backend
git subtree push --prefix backend heroku main
```

#### 3. Frontend Deployment
```bash
cd frontend

# Build for production
npm run build

# Deploy to Heroku
# Create a new Heroku app for frontend
heroku create your-parking-app-frontend

# Deploy
git subtree push --prefix frontend heroku main
```

### Option 2: Vercel (Frontend) + Railway (Backend)

#### Frontend on Vercel
1. Go to [Vercel](https://vercel.com)
2. Connect your GitHub repository
3. Set build settings:
   - Build Command: `cd frontend && npm run build`
   - Output Directory: `frontend/build`
   - Install Command: `cd frontend && npm install`
4. Add environment variables:
   - `REACT_APP_API_URL=https://your-backend-url.railway.app/api`

#### Backend on Railway
1. Go to [Railway](https://railway.app)
2. Connect your GitHub repository
3. Add MongoDB service
4. Set environment variables:
   - `MONGO_URI` (from MongoDB service)
   - `JWT_SECRET=your-secret-key`
   - `NODE_ENV=production`
   - `FRONTEND_URL=https://your-frontend-url.vercel.app`

### Option 3: Docker Deployment

#### 1. Build and Run with Docker Compose
```bash
# Build and start all services
docker-compose up --build

# Run in background
docker-compose up -d --build
```

#### 2. Individual Docker Builds
```bash
# Backend
cd backend
docker build -t parking-backend .
docker run -p 5000:5000 parking-backend

# Frontend
cd frontend
docker build -t parking-frontend .
docker run -p 3000:3000 parking-frontend
```

### Option 4: AWS/GCP/Azure

#### AWS Deployment
1. **Backend (EC2/Elastic Beanstalk)**:
   - Launch EC2 instance
   - Install Node.js and MongoDB
   - Clone repository
   - Set environment variables
   - Use PM2 for process management

2. **Frontend (S3 + CloudFront)**:
   - Build frontend: `npm run build`
   - Upload to S3 bucket
   - Configure CloudFront distribution
   - Set up custom domain

#### Google Cloud Platform
1. **Backend (Cloud Run)**:
   - Build container image
   - Deploy to Cloud Run
   - Set environment variables
   - Connect to Cloud SQL (MongoDB)

2. **Frontend (Firebase Hosting)**:
   - Install Firebase CLI
   - Build and deploy: `firebase deploy`

## 🔧 Environment Variables

### Production Environment Variables

#### Backend
```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/parking_spot_finder
JWT_SECRET=your-super-secure-jwt-secret-key
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://your-frontend-domain.com
```

#### Frontend
```env
REACT_APP_API_URL=https://your-backend-domain.com/api
REACT_APP_NAME=Parking Spot Finder
REACT_APP_VERSION=1.0.0
REACT_APP_MAP_DEFAULT_LAT=28.6139
REACT_APP_MAP_DEFAULT_LNG=77.2090
REACT_APP_MAP_DEFAULT_ZOOM=13
REACT_APP_ENABLE_ANALYTICS=true
REACT_APP_ENABLE_DEBUG=false
```

## 📊 Database Setup

### MongoDB Atlas (Cloud)
1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create cluster
3. Get connection string
4. Update `MONGO_URI` in environment variables

### Local MongoDB
```bash
# Install MongoDB
# Windows: Download from MongoDB website
# macOS: brew install mongodb-community
# Ubuntu: sudo apt-get install mongodb

# Start MongoDB
# Windows: net start MongoDB
# macOS: brew services start mongodb-community
# Ubuntu: sudo systemctl start mongod
```

## 🔒 Security Considerations

### Production Security
1. **Environment Variables**: Never commit `.env` files
2. **JWT Secret**: Use strong, random secrets
3. **CORS**: Configure proper origins
4. **HTTPS**: Always use HTTPS in production
5. **Database**: Use connection strings with authentication
6. **Rate Limiting**: Implement API rate limiting
7. **Input Validation**: Validate all inputs
8. **Error Handling**: Don't expose sensitive error details

### Security Headers
```javascript
// Add to backend/server.js
app.use(helmet()); // Security headers
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
}));
```

## 📈 Monitoring and Logging

### Application Monitoring
1. **Heroku**: Built-in metrics and logs
2. **Railway**: Application metrics
3. **AWS CloudWatch**: Comprehensive monitoring
4. **Google Cloud Monitoring**: GCP services

### Logging Setup
```javascript
// Add to backend/server.js
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

## 🚨 Troubleshooting

### Common Issues

#### 1. CORS Errors
```javascript
// Fix CORS in backend/server.js
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
```

#### 2. Environment Variables Not Loading
```bash
# Check if .env file exists
ls -la .env

# Verify environment variables
echo $MONGO_URI
```

#### 3. Build Failures
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### 4. Database Connection Issues
```bash
# Test MongoDB connection
mongosh "mongodb://localhost:27017/parking_spot_finder"

# Check MongoDB status
# Windows: net start MongoDB
# macOS: brew services list | grep mongodb
# Ubuntu: sudo systemctl status mongod
```

## 📝 Post-Deployment Checklist

- [ ] Environment variables configured
- [ ] Database connected and accessible
- [ ] Frontend builds successfully
- [ ] API endpoints responding
- [ ] Authentication working
- [ ] Maps loading correctly
- [ ] HTTPS enabled
- [ ] Error monitoring set up
- [ ] Backup strategy implemented
- [ ] Performance monitoring active

## 🔄 CI/CD Pipeline

### GitHub Actions Example
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    - name: Deploy to Heroku
      uses: akhileshns/heroku-deploy@v3.12.12
      with:
        heroku_api_key: ${{secrets.HEROKU_API_KEY}}
        heroku_app_name: "your-app-name"
        heroku_email: "your-email@example.com"
```

## 📞 Support

If you encounter deployment issues:

1. Check the logs: `heroku logs --tail`
2. Verify environment variables
3. Test locally first
4. Check database connectivity
5. Review error messages carefully

For additional help, create an issue in the GitHub repository.