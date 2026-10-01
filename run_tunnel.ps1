while ($true) {
    Write-Host "[$(Get-Date)] Starting LocalTunnel on port 3000..."
    npx -y localtunnel --port 3000 --subdomain mota-tribal-app
    Start-Sleep -Seconds 2
}
