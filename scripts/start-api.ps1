# Port 3000'i bosalt, API baslat
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

docker compose stop api 2>$null | Out-Null

$on3000 = Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue
foreach ($c in $on3000) {
  $ownerPid = $c.OwningProcess
  if ($ownerPid) {
    Stop-Process -Id $ownerPid -Force -ErrorAction SilentlyContinue
  }
}

Start-Sleep -Seconds 1
npm start
