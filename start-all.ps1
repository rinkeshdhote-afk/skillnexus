Write-Host "=========================================================================" -ForegroundColor Cyan
Write-Host " SKILLNEXUS - Smart India Hackathon 2026 (SIH26044) Full Stack Launcher" -ForegroundColor Green
Write-Host "=========================================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Starting Backend on Port 8000..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$PSScriptRoot/backend'; python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload"

Write-Host "Starting Student App on Port 5173..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$PSScriptRoot/student-app'; npm.cmd run dev"

Write-Host "Starting Professional App on Port 5174..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$PSScriptRoot/professional-app'; npm.cmd run dev"

Write-Host ""
Write-Host "=========================================================================" -ForegroundColor Cyan
Write-Host " All 3 services launched successfully!" -ForegroundColor Green
Write-Host "   - Student Portal:      http://localhost:5173" -ForegroundColor White
Write-Host "   - Professional Portal: http://localhost:5174" -ForegroundColor White
Write-Host "   - Backend API Docs:    http://localhost:8000/docs" -ForegroundColor White
Write-Host "=========================================================================" -ForegroundColor Cyan
