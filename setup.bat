@echo off
REM Setup script for IA.AGENDAMENTOS (Windows)
REM This script helps you get started quickly

echo ================================================
echo   IA.AGENDAMENTOS - Setup Script
echo ================================================
echo.

REM Check if .env file exists
if exist .env (
    echo [OK] .env file already exists
    echo.
    echo If you need to reconfigure, please edit the .env file manually
    echo or delete it and run this script again.
    exit /b 0
)

REM Create .env from .env.example
echo Creating .env file from .env.example...
copy .env.example .env >nul

if %errorlevel% equ 0 (
    echo [OK] .env file created successfully!
    echo.
    echo ================================================
    echo   NEXT STEPS - Configure your credentials
    echo ================================================
    echo.
    echo 1. Get your Supabase credentials:
    echo    - Go to https://app.supabase.com/
    echo    - Select your project ^(or create a new one^)
    echo    - Go to Project Settings ^> API
    echo    - Copy the Project URL and anon/public key
    echo.
    echo 2. Edit the .env file and update:
    echo    - VITE_SUPABASE_URL=^<your-project-url^>
    echo    - VITE_SUPABASE_ANON_KEY=^<your-anon-key^>
    echo.
    echo 3. ^(Optional^) Configure other services:
    echo    - Google Gemini API key for AI features
    echo    - Google Calendar OAuth for calendar sync
    echo.
    echo 4. Install dependencies:
    echo    npm install
    echo.
    echo 5. Start the application:
    echo    npm run dev
    echo.
    echo ================================================
    echo For detailed instructions, see QUICKSTART.md
    echo ================================================
) else (
    echo [ERROR] Failed to create .env file
    echo Please create it manually: copy .env.example .env
    exit /b 1
)
