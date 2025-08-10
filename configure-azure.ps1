# Azure Web App Configuration Script for Nostria Status
# Run this script after creating your Azure Web App

param(
    [Parameter(Mandatory=$true)]
    [string]$ResourceGroupName,
    
    [Parameter(Mandatory=$true)]
    [string]$WebAppName,
    
    [string]$ContainerImage = "ghcr.io/nostria-app/nostria-status:latest"
)

Write-Host "🔧 Configuring Azure Web App: $WebAppName" -ForegroundColor Green

try {
    # Configure application settings
    Write-Host "📝 Setting application settings..." -ForegroundColor Blue
    az webapp config appsettings set `
        --resource-group $ResourceGroupName `
        --name $WebAppName `
        --settings `
            NODE_ENV=production `
            PORT=3000 `
            WEBSITES_ENABLE_APP_SERVICE_STORAGE=true `
            WEBSITES_CONTAINER_START_TIME_LIMIT=1800 `
            WEBSITE_HEALTHCHECK_MAXPINGFAILURES=10 `
            WEBSITE_HEALTHCHECK_MAXUNHEALTHYWORKERPERCENT=100

    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Application settings configured successfully" -ForegroundColor Green
    } else {
        throw "Failed to configure application settings"
    }

    # Configure general settings
    Write-Host "⚙️ Configuring general settings..." -ForegroundColor Blue
    az webapp config set `
        --resource-group $ResourceGroupName `
        --name $WebAppName `
        --always-on true

    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ General settings configured successfully" -ForegroundColor Green
    } else {
        throw "Failed to configure general settings"
    }

    # Configure container settings
    Write-Host "🐳 Configuring container settings..." -ForegroundColor Blue
    az webapp config container set `
        --resource-group $ResourceGroupName `
        --name $WebAppName `
        --docker-custom-image-name $ContainerImage `
        --docker-registry-server-url "https://ghcr.io"

    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Container settings configured successfully" -ForegroundColor Green
    } else {
        throw "Failed to configure container settings"
    }

    # Get the app URL
    $appUrl = az webapp show --resource-group $ResourceGroupName --name $WebAppName --query defaultHostName --output tsv
    
    Write-Host "`n🎉 Configuration completed successfully!" -ForegroundColor Green
    Write-Host "📊 Dashboard: https://$appUrl" -ForegroundColor Cyan
    Write-Host "❤️  Health: https://$appUrl/health" -ForegroundColor Cyan
    
    Write-Host "`n⚠️  Manual steps required:" -ForegroundColor Yellow
    Write-Host "1. Go to Azure Portal > $WebAppName > Health check" -ForegroundColor White
    Write-Host "2. Enable health check" -ForegroundColor White
    Write-Host "3. Set Health check path: /health" -ForegroundColor White
    Write-Host "4. Set Unhealthy threshold: 10" -ForegroundColor White
    Write-Host "5. Save the configuration" -ForegroundColor White

} catch {
    Write-Host "❌ Configuration failed: $_" -ForegroundColor Red
    exit 1
}

Write-Host "`n✨ Azure Web App configuration script completed!" -ForegroundColor Green
