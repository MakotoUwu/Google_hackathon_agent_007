# Deployment Guide - Maps Agent with Google ADK

## 🚀 Deploy to Google Cloud Run

### Prerequisites

1. **Google Cloud Project** with billing enabled
2. **gcloud CLI** installed and configured
3. **Required APIs** enabled:
   - Cloud Run API
   - Cloud Build API
   - Vertex AI API
   - Google Maps Platform APIs

### Step-by-Step Deployment

#### 1. Authenticate with Google Cloud

```bash
gcloud auth login
gcloud config set project YOUR_PROJECT_ID
```

#### 2. Enable Required APIs

```bash
gcloud services enable \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  aiplatform.googleapis.com \
  maps-backend.googleapis.com \
  places-backend.googleapis.com
```

#### 3. Create Service Account for Vertex AI

```bash
# Create service account
gcloud iam service-accounts create maps-agent-sa \
  --display-name="Maps Agent Service Account"

# Grant Vertex AI User role
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="serviceAccount:maps-agent-sa@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/aiplatform.user"

# Create and download key
gcloud iam service-accounts keys create credentials.json \
  --iam-account=maps-agent-sa@YOUR_PROJECT_ID.iam.gserviceaccount.com
```

#### 4. Get Google Maps API Key

```bash
# Create API key
gcloud services api-keys create maps-agent-key \
  --display-name="Maps Agent API Key" \
  --api-target=service=maps-backend.googleapis.com \
  --api-target=service=places-backend.googleapis.com

# Get the key string
gcloud services api-keys get-key-string maps-agent-key
```

#### 5. Deploy to Cloud Run

```bash
# Deploy from source (Cloud Build will automatically build the container)
gcloud run deploy maps-agent \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 2Gi \
  --cpu 2 \
  --timeout 300 \
  --service-account maps-agent-sa@YOUR_PROJECT_ID.iam.gserviceaccount.com
```

#### 6. Set Environment Variables

```bash
# Set environment variables
gcloud run services update maps-agent \
  --region us-central1 \
  --set-env-vars="GOOGLE_API_KEY=YOUR_API_KEY,VITE_GOOGLE_MAPS_API_KEY=YOUR_API_KEY"

# Upload service account credentials as secret
gcloud secrets create maps-agent-credentials \
  --data-file=credentials.json

# Grant access to Cloud Run service
gcloud secrets add-iam-policy-binding maps-agent-credentials \
  --member="serviceAccount:maps-agent-sa@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

# Mount secret to Cloud Run
gcloud run services update maps-agent \
  --region us-central1 \
  --set-secrets="/app/credentials/credentials.json=maps-agent-credentials:latest"
```

#### 7. Get Service URL

```bash
gcloud run services describe maps-agent \
  --region us-central1 \
  --format="value(status.url)"
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GOOGLE_API_KEY` | Google Maps API key for backend | Yes |
| `VITE_GOOGLE_MAPS_API_KEY` | Google Maps API key for frontend | Yes |
| `GOOGLE_APPLICATION_CREDENTIALS` | Path to service account JSON | Yes |
| `NODE_ENV` | Environment (production/development) | Yes |
| `PORT` | Server port (default: 8080) | No |

### Google Cloud Resources

- **Cloud Run Service**: `maps-agent`
- **Service Account**: `maps-agent-sa`
- **Secret**: `maps-agent-credentials`
- **Artifact Registry**: `cloud-run-source-deploy/maps-agent`

## 📊 Monitoring

### View Logs

```bash
# Stream logs
gcloud run services logs tail maps-agent --region us-central1

# View logs in Cloud Console
gcloud run services describe maps-agent \
  --region us-central1 \
  --format="value(status.url)" | \
  sed 's|https://||' | \
  xargs -I {} echo "https://console.cloud.google.com/run/detail/us-central1/maps-agent/logs?project=YOUR_PROJECT_ID"
```

### Check Service Health

```bash
# Get service status
gcloud run services describe maps-agent --region us-central1

# Test health endpoint
curl https://YOUR_SERVICE_URL/api/trpc/system.health
```

## 🔄 Updates

### Deploy New Version

```bash
# Deploy updated code
gcloud run deploy maps-agent \
  --source . \
  --region us-central1
```

### Rollback to Previous Version

```bash
# List revisions
gcloud run revisions list --service maps-agent --region us-central1

# Rollback to specific revision
gcloud run services update-traffic maps-agent \
  --region us-central1 \
  --to-revisions REVISION_NAME=100
```

## 🧹 Cleanup

### Delete All Resources

```bash
# Delete Cloud Run service
gcloud run services delete maps-agent --region us-central1

# Delete service account
gcloud iam service-accounts delete maps-agent-sa@YOUR_PROJECT_ID.iam.gserviceaccount.com

# Delete secret
gcloud secrets delete maps-agent-credentials

# Delete Artifact Registry repository
gcloud artifacts repositories delete cloud-run-source-deploy \
  --location us-central1
```

## 💰 Cost Estimation

Cloud Run pricing (as of 2025):
- **CPU**: $0.00002400 per vCPU-second
- **Memory**: $0.00000250 per GiB-second
- **Requests**: $0.40 per million requests

Estimated monthly cost for moderate usage (~10,000 requests/month):
- **Cloud Run**: ~$5-10/month
- **Vertex AI (Gemini)**: Pay per token (~$0.50-2/1M tokens)
- **Google Maps APIs**: Free tier (28,000 map loads/month)

## 🆘 Troubleshooting

### Build Fails

```bash
# Check build logs
gcloud builds list --limit=5
gcloud builds log BUILD_ID
```

### Service Not Responding

```bash
# Check service logs
gcloud run services logs read maps-agent --region us-central1 --limit=50

# Check service status
gcloud run services describe maps-agent --region us-central1
```

### Permission Errors

```bash
# Grant required roles to service account
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="serviceAccount:maps-agent-sa@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/aiplatform.user"
```

## 📚 Additional Resources

- [Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Google ADK Documentation](https://google.github.io/adk-docs/)
- [Google Maps Platform](https://developers.google.com/maps)
- [Vertex AI Documentation](https://cloud.google.com/vertex-ai/docs)
