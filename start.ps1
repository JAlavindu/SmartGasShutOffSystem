# Smart Gas Detector - Quick Start Script
# Run this script to verify all dependencies and start the system

Write-Host "`n╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  Smart Gas Shut-Off System - Quick Start Verification    ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

$rootPath = $PSScriptRoot

# Check Node.js
Write-Host "✓ Checking Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "  ✓ Node.js installed: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "  ✗ Node.js NOT installed! Download from https://nodejs.org" -ForegroundColor Red
    exit 1
}

# Check Backend
Write-Host "`n✓ Checking Backend..." -ForegroundColor Yellow
$backendPath = Join-Path $rootPath "backend"
$backendNodeModules = Join-Path $backendPath "node_modules"
$serviceAccountKey = Join-Path $backendPath "serviceAccountKey.json"

if (Test-Path $backendNodeModules) {
    Write-Host "  ✓ Backend dependencies installed" -ForegroundColor Green
} else {
    Write-Host "  ✗ Backend dependencies missing! Run: cd backend && npm install" -ForegroundColor Red
}

if (Test-Path $serviceAccountKey) {
    Write-Host "  ✓ serviceAccountKey.json found" -ForegroundColor Green
} else {
    Write-Host "  ⚠ serviceAccountKey.json missing!" -ForegroundColor Yellow
    Write-Host "    Download from Firebase Console → Project Settings → Service Accounts" -ForegroundColor Yellow
}

# Check Mobile App
Write-Host "`n✓ Checking Mobile App..." -ForegroundColor Yellow
$appPath = Join-Path $rootPath "SmartGasShutOffSystem"
$appNodeModules = Join-Path $appPath "node_modules"

if (Test-Path $appNodeModules) {
    Write-Host "  ✓ Mobile app dependencies installed" -ForegroundColor Green
} else {
    Write-Host "  ✗ Mobile app dependencies missing! Run: cd SmartGasShutOffSystem && npm install" -ForegroundColor Red
}

# Check Firebase Config
$firebaseConfig = Join-Path $appPath "firebaseConfig.ts"
if (Test-Path $firebaseConfig) {
    $configContent = Get-Content $firebaseConfig -Raw
    if ($configContent -match "AIzaSyBCkgUksQoOaZA5IbryXZvAdlnffm2NI4U") {
        Write-Host "  ✓ Firebase credentials configured" -ForegroundColor Green
    } else {
        Write-Host "  ⚠ Firebase credentials may need updating" -ForegroundColor Yellow
    }
}

# Check Arduino
Write-Host "`n✓ Checking Arduino..." -ForegroundColor Yellow
$arduinoFile = Join-Path $rootPath "arduino\gas_detector_esp32.ino"
if (Test-Path $arduinoFile) {
    $arduinoContent = Get-Content $arduinoFile -Raw
    if ($arduinoContent -match "Your_WiFi_SSID") {
        Write-Host "  ⚠ WiFi credentials need updating in gas_detector_esp32.ino" -ForegroundColor Yellow
        Write-Host "    Update lines 18-19 with your WiFi SSID and password" -ForegroundColor Yellow
    } else {
        Write-Host "  ✓ WiFi credentials configured" -ForegroundColor Green
    }
    
    if ($arduinoContent -match "AIzaSyBCkgUksQoOaZA5IbryXZvAdlnffm2NI4U") {
        Write-Host "  ✓ Firebase credentials configured" -ForegroundColor Green
    }
}

# Summary
Write-Host "`n╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                    Setup Summary                           ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

Write-Host "📋 Next Steps:`n" -ForegroundColor White

if (-not (Test-Path $serviceAccountKey)) {
    Write-Host "1. Download serviceAccountKey.json from Firebase Console" -ForegroundColor Yellow
    Write-Host "   → https://console.firebase.google.com" -ForegroundColor Gray
    Write-Host "   → Project Settings → Service Accounts → Generate New Private Key" -ForegroundColor Gray
    Write-Host "   → Save to: backend\serviceAccountKey.json`n" -ForegroundColor Gray
}

if (Test-Path $arduinoFile) {
    $arduinoContent = Get-Content $arduinoFile -Raw
    if ($arduinoContent -match "Your_WiFi_SSID") {
        Write-Host "2. Update WiFi credentials in Arduino code" -ForegroundColor Yellow
        Write-Host "   → Open: arduino\gas_detector_esp32.ino" -ForegroundColor Gray
        Write-Host "   → Lines 18-19: Add your WiFi SSID and password`n" -ForegroundColor Gray
    }
}

Write-Host "3. Run the system:" -ForegroundColor Yellow
Write-Host "   Terminal 1: cd backend && npm start" -ForegroundColor Gray
Write-Host "   Terminal 2: cd SmartGasShutOffSystem && npx expo start" -ForegroundColor Gray
Write-Host "   Arduino IDE: Upload gas_detector_esp32.ino to ESP32`n" -ForegroundColor Gray

Write-Host "📚 Documentation:" -ForegroundColor White
Write-Host "   • FIXES_SUMMARY.md - What was fixed" -ForegroundColor Gray
Write-Host "   • PROJECT_SETUP.md - Complete setup guide" -ForegroundColor Gray
Write-Host "   • CHECKLIST.md - Quick verification checklist`n" -ForegroundColor Gray

Write-Host "✅ System is ready to run! Follow the steps above.`n" -ForegroundColor Green

# Ask if user wants to start backend
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
$startBackend = Read-Host "`nStart backend service now? (y/n)"
if ($startBackend -eq 'y' -or $startBackend -eq 'Y') {
    if (Test-Path $serviceAccountKey) {
        Write-Host "`nStarting backend service...`n" -ForegroundColor Green
        Set-Location $backendPath
        npm start
    } else {
        Write-Host "`n⚠ Cannot start backend: serviceAccountKey.json missing!" -ForegroundColor Red
        Write-Host "Download it from Firebase Console first.`n" -ForegroundColor Yellow
    }
} else {
    Write-Host "`nTo start backend later, run: cd backend && npm start`n" -ForegroundColor Gray
}
