# Railway Deployment Guide

This guide will help you deploy your STOMP Fixed Income Server to Railway.

## Prerequisites

1. **Railway Account**: Sign up at [railway.app](https://railway.app)
2. **GitHub Repository**: Your code should be in a GitHub repository
3. **MongoDB Atlas**: Ensure your MongoDB Atlas cluster is running

## Step 1: Prepare Your Repository

✅ **Already Done**: Your repository is now Railway-ready with:
- `railway.json` - Railway configuration
- Updated `package.json` with engines and health check
- Environment variable support
- Health check endpoint
- Production-ready server configuration

## Step 2: Deploy to Railway

### Option A: Deploy from GitHub (Recommended)

1. **Connect Railway to GitHub**:
   - Go to [railway.app](https://railway.app)
   - Sign in with GitHub
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your `stomp-server` repository

2. **Railway will automatically**:
   - Detect it's a Node.js project
   - Install dependencies
   - Use the configuration from `railway.json`

### Option B: Deploy with Railway CLI

1. **Install Railway CLI**:
   ```bash
   npm install -g @railway/cli
   ```

2. **Login and Deploy**:
   ```bash
   railway login
   railway link
   railway up
   ```

## Step 3: Configure Environment Variables

In your Railway dashboard, add these environment variables:

### Required Variables:
```
MONGODB_URI=mongodb+srv://datatableuser:YOUR_PASSWORD@cluster0.yslqyef.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
DATABASE_NAME=stomp_server
POSITIONS_COLLECTION=positions
TRADES_COLLECTION=trades
NODE_ENV=production
```

### Optional Variables:
```
PORT=8080                    # Railway will set this automatically
HEALTH_PORT=3000            # For health checks
```

## Step 4: Set Up Custom Domain (Optional)

1. In Railway dashboard, go to your service
2. Click "Settings" > "Domains"
3. Click "Generate Domain" for a free Railway subdomain
4. Or add your custom domain

## Step 5: Monitor Your Deployment

### Health Check Endpoints:
- **Health Status**: `https://your-app.railway.app/health`
- **Service Info**: `https://your-app.railway.app/`

### WebSocket Connection:
- **WebSocket URL**: `wss://your-app.railway.app`
- **Protocol**: WSS (secure WebSocket)

## Step 6: Initialize Database (One-time Setup)

After deployment, you need to migrate your data to MongoDB:

### Option A: Run Migration Locally
```bash
# Set your production MongoDB URI in config.env
npm run migrate-to-mongodb
```

### Option B: Use Railway Console
1. In Railway dashboard, go to your service
2. Click "Command" tab
3. Run: `npm run migrate-to-mongodb`

## Project Structure for Railway

```
stomp-server/
├── railway.json              # Railway configuration
├── package.json              # Updated with engines & health check
├── server2.js                # Main server (production-ready)
├── mongoDataAccess.js        # MongoDB data layer
├── migrateToMongoDB.js       # Data migration script
├── healthCheck.js            # Health check server
├── config.env                # Environment variables (not in Git)
├── .gitignore                # Excludes large files
└── RAILWAY_DEPLOYMENT.md     # This guide
```

## Railway Features Used

### 🚀 **Auto-Deploy**
- Automatic deployments on Git push
- Zero-downtime deployments

### 📊 **Monitoring**
- Built-in metrics and logs
- Health check monitoring
- CPU and memory usage

### 🔧 **Environment Variables**
- Secure environment variable management
- Easy configuration updates

### 🌐 **Networking**
- Automatic HTTPS/WSS
- Custom domains supported
- Global CDN

## Testing Your Deployment

### 1. Health Check
```bash
curl https://your-app.railway.app/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.456,
  "database": "connected",
  "memory": {...},
  "environment": "production"
}
```

### 2. WebSocket Connection
Use your existing client code but connect to:
```javascript
const ws = new WebSocket('wss://your-app.railway.app');
```

### 3. STOMP Protocol Test
Your existing STOMP clients will work with the new WSS URL.

## Troubleshooting

### Common Issues:

1. **Database Connection Failed**
   - Check MongoDB URI in environment variables
   - Ensure MongoDB Atlas allows connections from 0.0.0.0/0
   - Verify database credentials

2. **Health Check Failing**
   - Check logs in Railway dashboard
   - Verify MongoDB connection
   - Check if health check port is correct

3. **WebSocket Connection Issues**
   - Ensure using WSS (not WS) for production
   - Check if Railway service is running
   - Verify firewall settings

### Logs and Debugging:
- View logs in Railway dashboard under "Deployments"
- Use Railway CLI: `railway logs`
- Health check endpoint provides diagnostic info

## Scaling

Railway automatically handles:
- **Load balancing** for multiple instances
- **Auto-scaling** based on traffic
- **Resource management** (CPU/Memory)

## Cost Optimization

Railway offers:
- **Free tier** with generous limits
- **Pay-per-use** pricing
- **Resource limits** to control costs

## Security

✅ **Built-in Security**:
- HTTPS/WSS encryption
- Environment variable encryption
- Network isolation
- DDoS protection

## Next Steps

1. Deploy to Railway following steps above
2. Set up environment variables
3. Run data migration
4. Test WebSocket connections
5. Set up monitoring and alerts
6. Configure custom domain (optional)

## Support

- **Railway Docs**: [docs.railway.app](https://docs.railway.app)
- **Railway Discord**: Community support
- **GitHub Issues**: For application-specific issues 