Clear-Host
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "  COSMOSCOPE - Explore the changing universe" -ForegroundColor Cyan
Write-Host "  Launching Full Stack (FastAPI + Vite)" -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan

$root = $PSScriptRoot
if (-not $root) { $root = "D:\SPHEREX" }

Write-Host "[1/2] Starting Backend on http://localhost:8000 ..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$root\backend'; python -m uvicorn app.main:app --reload --port 8000"

Write-Host "[2/2] Starting Frontend on http://localhost:5173 ..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$root\frontend'; npm run dev"

Write-Host "`nBoth servers launched in dedicated windows!" -ForegroundColor Yellow
Write-Host "  Frontend: http://localhost:5173" -ForegroundColor White
Write-Host "  Backend:  http://localhost:8000/docs" -ForegroundColor White
Write-Host "`nPlease do not close those two popup windows while using the app!" -ForegroundColor Yellow
