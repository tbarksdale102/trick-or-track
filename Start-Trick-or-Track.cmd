@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is required. Install Node.js 22 or newer from https://nodejs.org
  pause
  exit /b 1
)
echo Trick or Track
echo Open http://127.0.0.1:4173 in your browser after the Local message appears.
echo Keep this window open while using the app. Press Ctrl+C to stop.
node server.mjs
if errorlevel 1 pause
