# Node.js Kubernetes Application with CI/CD

A production-ready Node.js web application deployed on AWS Free Tier using Docker, Kubernetes (Minikube), and GitHub Actions CI/CD pipeline.

## Features

- ✅ Dynamic timestamp display
- ✅ Container/Pod ID identification
- ✅ Visitor counter
- ✅ Health check endpoint (`/health`)
- ✅ Readiness probe (`/ready`)
- ✅ Metrics endpoint (`/metrics`)
- ✅ Comprehensive error handling
- ✅ Request logging
- ✅ Graceful shutdown
- ✅ Security hardening (non-root user, read-only filesystem)
- ✅ Automated CI/CD pipeline with GitHub Actions
- ✅ Multi-stage Docker build for optimized image size

## Architecture

```
GitHub → GitHub Actions → Amazon ECR → EC2 (Minikube) → NodePort Service → Browser
```

## Tech Stack

- **Runtime**: Node.js 18 + Express.js
- **Container**: Docker (Alpine-based, multi-stage build)
- **Registry**: Amazon ECR
- **Orchestration**: Kubernetes (Minikube on EC2 t2.micro)
- **CI/CD**: GitHub Actions
- **Cloud**: AWS Free Tier
- **Signal Handling**: dumb-init

## Project Structure

```
├── server.js              # Main application with error handling
├── config.js              # Configuration management
├── package.json           # Dependencies
├── Dockerfile             # Multi-stage Docker build
├── deployment.yaml        # Kubernetes Deployment manifest
├── service.yaml           # Kubernetes Service manifest
├── .env.example           # Environment variables template
├── .gitignore             # Git ignore rules
├── .dockerignore           # Docker ignore rules
├── public/
│   └── index.html         # Frontend HTML with dynamic loading
└── .github/
    └── workflows/
        └── deploy.yml     # GitHub Actions CI/CD pipeline
```

## Quick Start

### Local Development

```bash
# Install dependencies
npm install

# Start application
npm start

# Visit http://localhost:3000
```

### Docker Build & Run

```bash
# Build image
docker build -t nodejs-k8s-app .

# Run container
docker run -p 3000:3000 nodejs-k8s-app

# Check health
curl http://localhost:3000/health
```

### Kubernetes Deployment

```bash
# Replace placeholders in deployment.yaml
sed -i 's/YOUR_AWS_ACCOUNT_ID/<your-account-id>/g' deployment.yaml
sed -i 's/YOUR_AWS_REGION/<your-region>/g' deployment.yaml

# Apply manifests
kubectl apply -f deployment.yaml
kubectl apply -f service.yaml

# Check status
kubectl get pods
kubectl get services
kubectl logs -f deployment/nodejs-k8s-app

# Scale deployment
kubectl scale deployment nodejs-k8s-app --replicas=3
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Main application page |
| `/health` | GET | Health check (liveness probe) |
| `/ready` | GET | Readiness check (readiness probe) |
| `/metrics` | GET | Application metrics |

### Health Check Response

```json
{
  "status": "healthy",
  "timestamp": "2026-05-30T19:46:55.756+05:00",
  "uptime": 1234.56,
  "startTime": "2026-05-30T19:45:00.000+05:00",
  "containerId": "nodejs-pod-abc123",
  "visitorCount": 42,
  "environment": "production",
  "memory": {
    "heapUsed": 28672,
    "heapTotal": 65536,
    "rss": 94208,
    "external": 1024,
    "arrayBuffers": 2048
  }
}
```

## Error Handling

The application includes comprehensive error handling:

- **Request Logging**: All requests are logged with method, path, status code, and duration
- **Error Middleware**: Centralized error handling with proper HTTP status codes
- **Graceful Shutdown**: Proper signal handling (SIGTERM, SIGINT) with timeout
- **Uncaught Exceptions**: Caught and logged before exit
- **Unhandled Promise Rejections**: Logged and tracked
- **Environment-aware Responses**: Stack traces in development, sanitized responses in production

## CI/CD Pipeline

The GitHub Actions workflow automatically triggers on:
- Push to `main` branch
- Pull requests to `main` branch

### Pipeline Steps

1. **Checkout** code
2. **Setup Docker Buildx** for multi-platform builds
3. **Configure AWS credentials**
4. **Login to Amazon ECR**
5. **Build and push Docker image** to ECR
6. **Deploy to Kubernetes** on EC2 (on main push only)
7. **Verify rollout** status

## GitHub Secrets Required

Configure these secrets in your GitHub repository settings:

| Secret | Description |
|--------|-------------|
| `AWS_ACCESS_KEY_ID` | IAM user access key |
| `AWS_SECRET_ACCESS_KEY` | IAM user secret key |
| `AWS_ACCOUNT_ID` | AWS account ID (12-digit) |
| `EC2_HOST` | EC2 public IP address |
| `EC2_SSH_KEY` | Private key for EC2 SSH access |

## Kubernetes Probes

### Liveness Probe
- **Path**: `/health`
- **Initial Delay**: 10 seconds
- **Period**: 30 seconds
- **Timeout**: 3 seconds
- **Failure Threshold**: 3

### Readiness Probe
- **Path**: `/ready`
- **Initial Delay**: 5 seconds
- **Period**: 10 seconds
- **Timeout**: 3 seconds
- **Failure Threshold**: 2

## Security Features

- ✅ Non-root user (UID: 1001)
- ✅ Read-only root filesystem
- ✅ No privilege escalation
- ✅ Dropped all Linux capabilities
- ✅ Alpine Linux for minimal image size
- ✅ Multi-stage build to reduce final image size

## Environment Variables

```bash
NODE_ENV=production    # Application environment
PORT=3000              # Server port
LOG_LEVEL=info         # Logging level
```

## Resource Limits

```yaml
requests:
  memory: "64Mi"
  cpu: "50m"
limits:
  memory: "128Mi"
  cpu: "100m"
```

## Health Checks

The application includes Docker and Kubernetes health checks:

```bash
# Docker health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1
```

## Logging

All events are logged with ISO 8601 timestamps:

```
[2026-05-30T19:46:55.756+05:00] INFO: Server running on port 3000
[2026-05-30T19:46:55.790+05:00] INFO: Container ID: nodejs-pod-abc123
[2026-05-30T19:46:55.800+05:00] INFO: GET / - 200 (45ms)
```

## Deployment Best Practices

1. **Rolling Updates**: Zero-downtime deployments with rolling update strategy
2. **Pod Disruption Budgets**: Maintain availability during updates
3. **Resource Limits**: Prevent resource exhaustion
4. **Health Checks**: Automatic recovery of failed pods
5. **Anti-Affinity**: Spread pods across nodes
6. **Security Context**: Run with minimal privileges

## Troubleshooting

### Check logs
```bash
kubectl logs -f deployment/nodejs-k8s-app
```

### Port forward for local access
```bash
kubectl port-forward service/nodejs-k8s-service 3000:3000
```

### Describe deployment
```bash
kubectl describe deployment nodejs-k8s-app
```

### Check pod events
```bash
kubectl get events --sort-by='.lastTimestamp'
```

## Performance Monitoring

Monitor application metrics at `/metrics`:

```bash
curl http://localhost:3000/metrics
```

## Docker Image Optimization

The multi-stage build process:
1. Installs dependencies in a temporary builder stage
2. Copies only production dependencies to the final image
3. Reduces final image size by excluding dev dependencies
4. Uses Alpine Linux for minimal base image

## Running Tests

```bash
# Health check
curl http://localhost:3000/health

# Ready check
curl http://localhost:3000/ready

# Metrics
curl http://localhost:3000/metrics
```

## Contributing

1. Create a feature branch
2. Commit changes
3. Push to GitHub
4. Create a pull request
5. CI/CD pipeline will automatically test and build

## Deployment Instructions

### Prerequisites

- AWS Account with free tier eligibility
- EC2 instance with Kubernetes (Minikube) installed
- GitHub repository with secrets configured
- Docker Desktop (for local testing)

### Step-by-Step Deployment

1. **Clone repository**
   ```bash
   git clone <your-repo>
   cd nodejs-k8s-app
   ```

2. **Configure AWS credentials**
   - Create IAM user with ECR permissions
   - Set GitHub secrets with credentials

3. **Update deployment.yaml**
   ```bash
   sed -i 's/YOUR_AWS_ACCOUNT_ID/123456789012/g' deployment.yaml
   sed -i 's/YOUR_AWS_REGION/eu-north-1/g' deployment.yaml
   ```

4. **Push to main branch**
   - Triggers GitHub Actions workflow
   - Builds and pushes Docker image to ECR
   - Deploys to Kubernetes cluster

5. **Verify deployment**
   ```bash
   kubectl get pods
   kubectl logs -f deployment/nodejs-k8s-app
   ```

## License

MIT

## Support

For issues or questions, please create a GitHub issue.
