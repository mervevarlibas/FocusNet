$root = Split-Path -Parent $PSScriptRoot
Set-Location (Join-Path $root "mobile")
npx expo start -c
