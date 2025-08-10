# Azure Web App Configuration for Nostria Status

This document outlines the required Azure Web App configuration for optimal reliability.

## Required App Settings

Configure these in the Azure Portal under Configuration > Application settings:

```
NODE_ENV=production
PORT=3000
WEBSITES_ENABLE_APP_SERVICE_STORAGE=true
WEBSITES_CONTAINER_START_TIME_LIMIT=1800
WEBSITE_HEALTHCHECK_MAXPINGFAILURES=10
SCM_DO_BUILD_DURING_DEPLOYMENT=false
```

## Health Check Configuration

1. Go to Azure Portal > Your Web App > Health check
2. Enable health check
3. Set Health check path: `/health`
4. Set Unhealthy threshold: 10 requests

## Container Settings

1. Go to Azure Portal > Your Web App > Deployment Center
2. Configure Container Registry:
   - Source: GitHub Container Registry
   - Image and tag: `ghcr.io/nostria-app/nostria-status:latest`
   - Startup Command: (leave empty)

## Scaling Configuration

For reliability, configure auto-scaling:

1. Go to Azure Portal > Your Web App > Scale out (App Service plan)
2. Enable auto-scale
3. Set minimum instances: 1
4. Set maximum instances: 3
5. Add scale rule based on CPU percentage > 70%

## Monitoring and Alerts

1. Enable Application Insights
2. Configure alerts for:
   - High response time (> 5 seconds)
   - High error rate (> 5%)
   - Health check failures

## Required Azure CLI Commands

If configuring via CLI:

```bash
# Set app settings
az webapp config appsettings set \
  --resource-group <your-rg> \
  --name <your-app-name> \
  --settings \
    NODE_ENV=production \
    PORT=3000 \
    WEBSITES_ENABLE_APP_SERVICE_STORAGE=true \
    WEBSITES_CONTAINER_START_TIME_LIMIT=1800 \
    WEBSITE_HEALTHCHECK_MAXPINGFAILURES=10

# Configure health check
az webapp config set \
  --resource-group <your-rg> \
  --name <your-app-name> \
  --health-check-path "/health"

# Configure container
az webapp config container set \
  --resource-group <your-rg> \
  --name <your-app-name> \
  --docker-custom-image-name ghcr.io/nostria-app/nostria-status:latest \
  --docker-registry-server-url https://ghcr.io
```

## Required GitHub Secrets

Add these secrets to your GitHub repository:

- `AZURE_CREDENTIALS`: Azure service principal credentials
- `GITHUB_TOKEN`: Automatically available, no setup needed

## Resource Group Requirements

Your Azure resource group should be specified in the GitHub Actions workflow.
Update the `AZURE_RESOURCE_GROUP` environment variable in `.github/workflows/docker-build.yml`
