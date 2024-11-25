@echo off
cd /d "%~dp0"
echo Starting PHP Development Server...
echo Server will be available at http://localhost:8000
echo Current directory: %CD%

REM Check if PHP is available
php --version >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo Error: PHP is not installed or not in PATH
    pause
    exit /b 1
)

REM Check if required files exist
if not exist "get_plants.php" (
    echo Error: get_plants.php not found in current directory
    echo Current directory: %CD%
    dir
    pause
    exit /b 1
)

php -S localhost:8000 -t .
pause
