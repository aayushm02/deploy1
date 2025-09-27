#!/bin/bash

# Parking Spot Finder - Deployment Script
# This script helps deploy the application to various platforms

set -e

echo "🚀 Parking Spot Finder Deployment Script"
echo "========================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required tools are installed
check_requirements() {
    print_status "Checking requirements..."
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js v16 or higher."
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm."
        exit 1
    fi
    
    if ! command -v git &> /dev/null; then
        print_error "Git is not installed. Please install Git."
        exit 1
    fi
    
    print_success "All requirements are met!"
}

# Install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    
    # Install root dependencies
    npm install
    
    # Install backend dependencies
    cd backend
    npm install
    cd ..
    
    # Install frontend dependencies
    cd frontend
    npm install
    cd ..
    
    print_success "Dependencies installed successfully!"
}

# Build the application
build_app() {
    print_status "Building the application..."
    
    # Build frontend
    cd frontend
    npm run build
    cd ..
    
    print_success "Application built successfully!"
}

# Setup environment files
setup_env() {
    print_status "Setting up environment files..."
    
    # Backend environment
    if [ ! -f "backend/.env" ]; then
        if [ -f "backend/env.example" ]; then
            cp backend/env.example backend/.env
            print_warning "Created backend/.env from example. Please update the values."
        else
            print_error "backend/env.example not found!"
        fi
    fi
    
    # Frontend environment
    if [ ! -f "frontend/.env" ]; then
        if [ -f "frontend/env.example" ]; then
            cp frontend/env.example frontend/.env
            print_warning "Created frontend/.env from example. Please update the values."
        else
            print_error "frontend/env.example not found!"
        fi
    fi
    
    print_success "Environment files set up!"
}

# Test the application
test_app() {
    print_status "Testing the application..."
    
    # Test backend
    cd backend
    if [ -f "test-backend.js" ]; then
        node test-backend.js
    fi
    cd ..
    
    print_success "Tests completed!"
}

# Deploy to Heroku
deploy_heroku() {
    print_status "Deploying to Heroku..."
    
    if ! command -v heroku &> /dev/null; then
        print_error "Heroku CLI is not installed. Please install it first."
        exit 1
    fi
    
    # Check if user is logged in
    if ! heroku auth:whoami &> /dev/null; then
        print_error "Please login to Heroku first: heroku login"
        exit 1
    fi
    
    # Create Heroku app if it doesn't exist
    if [ -z "$HEROKU_APP_NAME" ]; then
        read -p "Enter Heroku app name: " HEROKU_APP_NAME
    fi
    
    # Create app
    heroku create $HEROKU_APP_NAME 2>/dev/null || print_warning "App might already exist"
    
    # Add MongoDB addon
    heroku addons:create mongolab:sandbox --app $HEROKU_APP_NAME
    
    # Set environment variables
    heroku config:set NODE_ENV=production --app $HEROKU_APP_NAME
    heroku config:set JWT_SECRET=$(openssl rand -base64 32) --app $HEROKU_APP_NAME
    
    # Deploy
    git subtree push --prefix backend heroku main
    
    print_success "Deployed to Heroku successfully!"
    print_status "App URL: https://$HEROKU_APP_NAME.herokuapp.com"
}

# Deploy with Docker
deploy_docker() {
    print_status "Deploying with Docker..."
    
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install it first."
        exit 1
    fi
    
    # Build and start containers
    docker-compose up --build -d
    
    print_success "Deployed with Docker successfully!"
    print_status "Frontend: http://localhost:3000"
    print_status "Backend: http://localhost:5000"
}

# Main menu
show_menu() {
    echo ""
    echo "Select deployment option:"
    echo "1) Setup project (install dependencies, create env files)"
    echo "2) Build application"
    echo "3) Test application"
    echo "4) Deploy to Heroku"
    echo "5) Deploy with Docker"
    echo "6) Full setup and build"
    echo "7) Exit"
    echo ""
    read -p "Enter your choice (1-7): " choice
    
    case $choice in
        1)
            check_requirements
            install_dependencies
            setup_env
            ;;
        2)
            build_app
            ;;
        3)
            test_app
            ;;
        4)
            deploy_heroku
            ;;
        5)
            deploy_docker
            ;;
        6)
            check_requirements
            install_dependencies
            setup_env
            build_app
            test_app
            ;;
        7)
            print_status "Goodbye!"
            exit 0
            ;;
        *)
            print_error "Invalid choice. Please try again."
            show_menu
            ;;
    esac
}

# Main execution
main() {
    # Check if we're in the right directory
    if [ ! -f "package.json" ] || [ ! -d "backend" ] || [ ! -d "frontend" ]; then
        print_error "Please run this script from the project root directory."
        exit 1
    fi
    
    # Show menu
    show_menu
}

# Run main function
main "$@"

