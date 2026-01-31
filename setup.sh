#!/bin/bash

# Setup script for IA.AGENDAMENTOS
# This script helps you get started quickly

echo "================================================"
echo "  IA.AGENDAMENTOS - Setup Script"
echo "================================================"
echo ""

# Check if .env.example exists
if [ ! -f .env.example ]; then
    echo "✗ Error: .env.example file not found"
    echo ""
    echo "The .env.example template file is missing from this repository."
    echo "Please ensure you have the complete repository before running setup."
    exit 1
fi

# Check if .env.local file exists
if [ -f .env.local ]; then
    echo "✓ .env.local file already exists"
    echo ""
    echo "If you need to reconfigure, please edit the .env.local file manually"
    echo "or delete it and run this script again."
    exit 0
fi

# Create .env.local from .env.example
echo "Creating .env.local file from .env.example..."
cp .env.example .env.local

if [ $? -eq 0 ]; then
    echo "✓ .env.local file created successfully!"
    echo ""
    echo "================================================"
    echo "  NEXT STEPS - Configure your credentials"
    echo "================================================"
    echo ""
    echo "1. Get your Supabase credentials:"
    echo "   - Go to https://app.supabase.com/"
    echo "   - Select your project (or create a new one)"
    echo "   - Go to Project Settings > API"
    echo "   - Copy the Project URL and anon/public key"
    echo ""
    echo "2. Edit the .env.local file and update:"
    echo "   - VITE_SUPABASE_URL=<your-project-url>"
    echo "   - VITE_SUPABASE_ANON_KEY=<your-anon-key>"
    echo ""
    echo "3. Configure the Gemini API key for AI features:"
    echo "   - VITE_GEMINI_API_KEY=<your-gemini-api-key>"
    echo "   - Google Calendar OAuth for calendar sync"
    echo ""
    echo "4. Install dependencies:"
    echo "   npm install"
    echo ""
    echo "5. Start the application:"
    echo "   npm run dev"
    echo ""
    echo "================================================"
    echo "For detailed instructions, see QUICKSTART.md"
    echo "================================================"
else
    echo "✗ Failed to create .env.local file"
    echo "Please create it manually: cp .env.example .env.local"
    exit 1
fi
