@echo off
chcp 65001 >nul
title PaperTrail - Text to Handwriting Studio
cd /d "%~dp0"

echo.
echo  ==============================================================
echo       📝  PaperTrail — Hyper-Realistic Handwriting Studio
echo  ==============================================================
echo.

:: Check for Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo  [X] Node.js was not detected on your system PATH!
    echo      Please download and install Node.js from: https://nodejs.org/
    echo.
    pause
    exit /b 1
)

:: Check if node_modules exists
if not exist "node_modules\" (
    echo  [*] First-time setup detected: Installing dependencies...
    echo.
    call npm install
    if %errorlevel% neq 0 (
        echo.
        echo  [X] Failed to install dependencies via npm.
        pause
        exit /b 1
    )
    echo.
    echo  [✓] Dependencies successfully installed.
    echo.
)

echo  [*] Starting PaperTrail development server...
echo  [*] Opening http://localhost:5173 in your browser...
echo.

:: Launch Vite with automatic browser opening
call npm run dev -- --open

if %errorlevel% neq 0 (
    echo.
    echo  [X] Server stopped unexpectedly.
    pause
)
