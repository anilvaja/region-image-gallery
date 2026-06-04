# Deployment Guide

## Pre-Deployment Checklist

### Backend
- [ ] All tests passing (`npm test`)
- [ ] Code review completed
- [ ] Environment variables configured
- [ ] Database migrations tested
- [ ] AWS S3 access verified
- [ ] Error logging enabled
- [ ] Performance optimization completed

### Frontend
- [ ] Build tests passing
- [ ] Production build created (`npm run build`)
- [ ] API endpoint configured for production
- [ ] Assets optimized
- [ ] Security headers configured

## Deployment Options

## Option 1: Deploy to Heroku (Recommended for Beginners)

### Prerequisites
- Heroku account
- Heroku CLI installed
- Git repository initialized

### Backend Deployment

1. **Create Heroku App**
   ```bash
   heroku create region-image-gallery-api
   heroku addons:create heroku-postgresql:hobby-dev
   ```

2. **Configure Environment Variables**
   ```bash
   heroku config:set JWT_SECRET=your_secret_key
   heroku config:set AWS_ACCESS_KEY_ID=your_key
   heroku config:set AWS_SECRET_ACCESS_KEY=your_secret
   heroku config:set AWS_REGION=us-east-1
   heroku config:set AWS_S3_BUCKET=your-bucket
   heroku config:set NODE_ENV=production
   ```

3. **Create Procfile**
   ```
   web: node src/app.js
   ```

4. **Deploy**
   ```bash
   git push heroku main
   ```

5. **View Logs**
   ```bash
   heroku logs --tail
   ```

### Frontend Deployment

1. **Build Production Bundle**
   ```bash
   cd client
   npm run build
   ```

2. **Deploy to Vercel (Free)**
   ```bash
   npm i -g vercel
   vercel --prod
   ```

   Or deploy to Netlify:
   ```bash
   npm i -g netlify-cli
   netlify deploy --prod --dir=build
   ```

## Option 2: AWS Deployment (Scalable)

### Backend: Deploy to AWS Elastic Beanstalk

1. **Install EB CLI**
   ```bash
   pip install awsebcli --upgrade --user
   ```

2. **Initialize Elastic Beanstalk**
   ```bash
   eb init -p node.js-14 region-image-gallery-api
   ```

3. **Create Environment**
   ```bash
   eb create gallery-api-prod
   ```

4. **Configure Environment Variables**
   ```bash
   eb setenv \
     JWT_SECRET=your_secret \
     AWS_ACCESS_KEY_ID=your_key \
     AWS_SECRET_ACCESS_KEY=your_secret \
     NODE_ENV=production
   ```

5. **Deploy**
   ```bash
   eb deploy
   ```

### Database: AWS RDS PostgreSQL

1. **Create RDS Instance**
   ```bash
   aws rds create-db-instance \
     --db-instance-identifier region-gallery-db \
     --db-instance-class db.t3.micro \
     --engine postgres \
     --allocated-storage 20 \
     --storage-type gp2
   ```

2. **Configure Security Group**
   - Allow Elastic Beanstalk security group to access RDS

3. **Update Connection String**
   ```bash
   eb setenv DB_HOST=your-rds-endpoint.amazonaws.com
   ```

### Frontend: Deploy to CloudFront

1. **Build React App**
   ```bash
   npm run build
   ```

2. **Upload to S3**
   ```bash
   aws s3 sync build/ s3://your-frontend-bucket --delete
   ```

3. **Create CloudFront Distribution**
   - Origin: S3 bucket
   - Default root: index.html
   - Cache behavior: Compress objects

## Option 3: Docker Containerization

### Create Dockerfile

**Backend Dockerfile**
```dockerfile
# Use Node.js base image
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy source code
COPY src ./src
COPY .env .

# Expose port
EXPOSE 5000

# Start server
CMD ["node", "src/app.js"]
```

**Frontend Dockerfile**
```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app
COPY client/package*.json ./
RUN npm install
COPY client ./
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Docker Compose

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: region_image_gallery
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  backend:
    build:
      context: .
      dockerfile: Dockerfile
    environment:
      DB_HOST: postgres
      DB_USER: postgres
      DB_PASSWORD: password
      DB_NAME: region_image_gallery
      JWT_SECRET: your_secret
      AWS_ACCESS_KEY_ID: your_key
      AWS_SECRET_ACCESS_KEY: your_secret
      NODE_ENV: production
    ports:
      - "5000:5000"
    depends_on:
      - postgres
    volumes:
      - ./uploads:/app/uploads

  frontend:
    build:
      context: ./client
      dockerfile: Dockerfile
    environment:
      REACT_APP_API_URL: http://localhost:5000/api
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  postgres_data:
```

**Deploy with Docker Compose**
```bash
docker-compose up -d
```

## Option 4: DigitalOcean App Platform

1. **Connect Repository**
   - Go to DigitalOcean App Platform
   - Click "Create App"
   - Select repository

2. **Configure Services**
   - Detect Dockerfile
   - Add environment variables
   - Set resource limits

3. **Deploy**
   - Click "Deploy"
   - Monitor logs

## Environment Configuration

### Production Environment Variables

```env
# Database
DB_HOST=your-rds-endpoint.amazonaws.com
DB_PORT=5432
DB_NAME=region_image_gallery
DB_USER=gallery_user
DB_PASSWORD=secure_password
DB_DIALECT=postgres

# Security
JWT_SECRET=very_long_random_secret_key_minimum_32_characters
JWT_EXPIRY=7d
NODE_ENV=production

# AWS S3
AWS_ACCESS_KEY_ID=your_production_key
AWS_SECRET_ACCESS_KEY=your_production_secret
AWS_REGION=us-east-1
AWS_S3_BUCKET=region-image-gallery-prod

# Server
PORT=5000

# Image Processing
MAX_IMAGE_SIZE=5242880
MAX_IMAGES_PER_PROJECT=10
IMAGE_MAX_WIDTH=1080
IMAGE_QUALITY=75
```

### Frontend Configuration

```env
REACT_APP_API_URL=https://api.yourdomain.com/api
REACT_APP_ENVIRONMENT=production
```

## SSL/TLS Configuration

### Enable HTTPS

1. **Get SSL Certificate**
   - Use Let's Encrypt (free)
   - AWS Certificate Manager (free for AWS)
   - Paid certificate authority

2. **Configure in Application**
   ```javascript
   // For self-signed certificates in development only
   const fs = require('fs');
   const https = require('https');

   const options = {
     key: fs.readFileSync('private-key.pem'),
     cert: fs.readFileSync('certificate.pem'),
   };

   https.createServer(options, app).listen(443);
   ```

3. **Redirect HTTP to HTTPS**
   ```javascript
   app.use((req, res, next) => {
     if (req.header('x-forwarded-proto') !== 'https') {
       res.redirect(`https://${req.header('host')}${req.url}`);
     }
     next();
   });
   ```

## Database Migration

### Production Database Setup

1. **Create Database**
   ```bash
   # Connect to production RDS
   psql -h your-rds-endpoint.amazonaws.com -U postgres
   
   # Create database
   CREATE DATABASE region_image_gallery;
   ```

2. **Run Migrations**
   ```bash
   npm run migrate
   ```

3. **Seed Initial Data**
   ```bash
   npm run seed
   ```

## Performance Optimization

### Backend Optimization

1. **Enable Gzip Compression**
   ```javascript
   const compression = require('compression');
   app.use(compression());
   ```

2. **Add Caching Headers**
   ```javascript
   app.use((req, res, next) => {
     res.header('Cache-Control', 'public, max-age=3600');
     next();
   });
   ```

3. **Database Connection Pooling**
   ```javascript
   pool: {
     max: 5,
     min: 2,
     acquire: 30000,
     idle: 10000,
   }
   ```

### Frontend Optimization

1. **Code Splitting**
   ```javascript
   const Gallery = lazy(() => import('./Gallery'));
   const ProjectManager = lazy(() => import('./ProjectManager'));
   ```

2. **Lazy Loading Images**
   ```jsx
   <img loading="lazy" src={imageUrl} alt="gallery" />
   ```

3. **Image Optimization**
   - Already handled by Sharp on backend
   - Use optimized_url in frontend

## Monitoring and Logging

### Backend Logging

```javascript
const morgan = require('morgan');
app.use(morgan('combined'));
```

### Error Tracking

```javascript
const Sentry = require('@sentry/node');

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

### CloudWatch Monitoring (AWS)

```javascript
const cloudwatch = new AWS.CloudWatch();

cloudwatch.putMetricData({
  Namespace: 'RegionImageGallery',
  MetricData: [{
    MetricName: 'ImageUploads',
    Value: 1,
    Unit: 'Count',
  }],
});
```

## Health Checks

```bash
# API health endpoint
curl https://api.yourdomain.com/api/health

# Expected response
{
  "status": "Server is running"
}
```

## Zero-Downtime Deployment

1. **Blue-Green Deployment**
   - Deploy new version to separate environment
   - Test thoroughly
   - Switch traffic to new environment
   - Keep old environment as fallback

2. **Rolling Updates**
   - Update instances one at a time
   - Keep others serving traffic
   - Wait for health checks to pass

## Rollback Plan

```bash
# Quick rollback to previous version
git revert HEAD
git push heroku main

# Or
eb abort
```

## Post-Deployment Checklist

- [ ] API endpoints responding correctly
- [ ] Database queries executing
- [ ] S3 uploads working
- [ ] Frontend loading without errors
- [ ] Authentication working
- [ ] Images displaying properly
- [ ] Monitor error logs
- [ ] Check performance metrics
- [ ] Verify backups running
- [ ] Set up uptime monitoring

## Disaster Recovery

### Backup Strategy

```bash
# Daily database backups
aws rds create-db-snapshot --db-instance-identifier gallery-db --db-snapshot-identifier backup-$(date +%Y-%m-%d)

# S3 versioning enabled
aws s3api put-bucket-versioning --bucket region-image-gallery --versioning-configuration Status=Enabled
```

### Recovery Plan

1. **Database Recovery**
   ```bash
   aws rds restore-db-instance-from-db-snapshot \
     --db-instance-identifier gallery-db-restored \
     --db-snapshot-identifier backup-2026-06-04
   ```

2. **S3 Recovery**
   - Use S3 versioning to restore files
   - Or restore from S3 backup bucket

## Scaling Considerations

- **Horizontal Scaling**: Add more instances behind load balancer
- **Vertical Scaling**: Increase instance size
- **Read Replicas**: Create database read replicas for queries
- **CDN**: Use CloudFront to cache static assets
- **Caching**: Implement Redis for session/query caching

## Cost Optimization

- Monitor usage regularly
- Use spot instances for non-critical workloads
- Archive old images to Glacier
- Set up billing alerts
- Use reserved instances for predictable load

## Additional Resources

- [Heroku Deployment Guide](https://devcenter.heroku.com/)
- [AWS Deployment Best Practices](https://docs.aws.amazon.com/deployment/)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Production Node.js Checklist](https://github.com/goldbergyoni/nodebestpractices)
