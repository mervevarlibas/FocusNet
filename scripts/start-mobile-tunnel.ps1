# Hotspot / mobil veri / farkli ag - QR timeout olursa tunnel kullan
$root = Split-Path -Parent $PSScriptRoot
Set-Location (Join-Path $root "mobile")
Write-Host "Tunnel modu (internet uzerinden) - QR biraz yavas acilabilir" -ForegroundColor Cyan
npx expo start --tunnel -c