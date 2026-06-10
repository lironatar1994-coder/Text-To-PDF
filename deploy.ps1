param(
    [Parameter(Position=0, Mandatory=$false)]
    [string]$CommitMessage
)

# ==============================================================================
# Text to PDF Deployment Script (Local PC)
# ==============================================================================

$ServerIP = "63.250.61.126"
$ServerUser = "root"
$KeyPath = "C:\Users\User\.ssh\id_rsa"
$RemotePath = "/root/TextToPDF"
$LogPath = Join-Path $PSScriptRoot "deploy.log"

Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "Deploying Text to PDF to Production Server..." -ForegroundColor Cyan
Write-Host "Server: $ServerUser@$ServerIP" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

# Start logging console output
Start-Transcript -Path $LogPath -Append -Force

try {
    if ($CommitMessage) {
        Write-Host "[0/4] Staging, committing, and pushing changes to GitHub..." -ForegroundColor Blue
        git add .
        git commit -m $CommitMessage
        git push origin main
    } else {
        Write-Host "[0/4] No commit message provided. Skipping GitHub push." -ForegroundColor Yellow
    }

    Write-Host "[1/4] Connecting to server and pulling latest git commit..." -ForegroundColor Blue
    $GitPullCmd = "cd $RemotePath && git pull origin main"
    ssh -o StrictHostKeyChecking=no -i $KeyPath "$ServerUser@$ServerIP" $GitPullCmd

    Write-Host "[2/4] Installing dependencies..." -ForegroundColor Blue
    $NpmInstallCmd = "source ~/.nvm/nvm.sh && nvm use 22 && cd $RemotePath && npm install"
    ssh -o StrictHostKeyChecking=no -i $KeyPath "$ServerUser@$ServerIP" $NpmInstallCmd

    Write-Host "[3/4] Rebuilding Next.js application..." -ForegroundColor Blue
    $BuildCmd = "source ~/.nvm/nvm.sh && nvm use 22 && cd $RemotePath && npm run build"
    ssh -o StrictHostKeyChecking=no -i $KeyPath "$ServerUser@$ServerIP" $BuildCmd

    Write-Host "[4/4] Restarting PM2 process..." -ForegroundColor Blue
    $Pm2Cmd = "source ~/.nvm/nvm.sh && nvm use 22 && pm2 reload text-to-pdf && pm2 save"
    ssh -o StrictHostKeyChecking=no -i $KeyPath "$ServerUser@$ServerIP" $Pm2Cmd

    Write-Host "=============================================" -ForegroundColor Green
    Write-Host "Deployment Completed Successfully!" -ForegroundColor Green
    Write-Host "Log saved to: $LogPath" -ForegroundColor Green
    Write-Host "=============================================" -ForegroundColor Green
}
catch {
    Write-Host "Deployment failed: $_" -ForegroundColor Red
}
finally {
    Stop-Transcript
}
