# Keep the backend server running
Write-Host "Starting Nebula Backend Server..." -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop" -ForegroundColor Yellow
Write-Host ""

Set-Location $PSScriptRoot
node server.js

# Keep terminal open on error
if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "Server stopped with error code: $LASTEXITCODE" -ForegroundColor Red
    Write-Host "Press any key to exit..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}
