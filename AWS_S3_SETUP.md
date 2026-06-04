# AWS S3 Setup and Configuration Guide

## Overview

This guide explains how to set up AWS S3 for image storage in the Region-Based Image Gallery application.

## Prerequisites

- AWS Account (with billing enabled)
- AWS SDK for Node.js (@aws-sdk/client-s3)
- AWS credentials configured

## Step 1: Create S3 Bucket

### Using AWS Console

1. **Navigate to S3**
   - Go to https://s3.console.aws.amazon.com
   - Click "Create bucket"

2. **Configure Bucket**
   - **Bucket name**: `region-image-gallery` (must be globally unique)
   - **Region**: Choose closest region (e.g., us-east-1)
   - **Settings**: Keep default settings for now

3. **Create Bucket**
   - Click "Create bucket"
   - Bucket is now created

### Using AWS CLI

```bash
# Configure AWS credentials first
aws configure

# Create bucket
aws s3 mb s3://region-image-gallery --region us-east-1

# List buckets to verify
aws s3 ls
```

## Step 2: Configure Bucket Permissions

### Enable Public Read Access (For Images)

1. **Go to Bucket Permissions**
   - Click on bucket name
   - Click "Permissions" tab
   - Click "Block Public Access"
   - Uncheck "Block all public access" (only if you want public image URLs)

2. **Add Bucket Policy**
   - Go to "Bucket Policy"
   - Add policy for public read access:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::region-image-gallery/*"
    }
  ]
}
```

3. **Enable CORS**
   - Go to "CORS" tab
   - Add CORS configuration:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": ["http://localhost:3000", "https://yourdomain.com"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

## Step 3: Create IAM User

### Create User with S3 Permissions

1. **Navigate to IAM**
   - Go to https://console.aws.amazon.com/iam
   - Click "Users" → "Create user"

2. **Create User**
   - **Username**: gallery-app-user
   - Click "Create user"

3. **Add Permissions**
   - Click on created user
   - Click "Add permissions" → "Attach policies directly"
   - Search for "AmazonS3FullAccess"
   - Select policy and click "Add permissions"

### Create Access Keys

1. **Generate Access Keys**
   - Click "Security credentials" tab
   - Scroll to "Access keys"
   - Click "Create access key"
   - Choose "Application running outside AWS"
   - Click "Create access key"

2. **Save Credentials**
   - Copy **Access Key ID**
   - Copy **Secret Access Key**
   - Store securely in `.env` file

## Step 4: Configure Application

### Update .env File

```env
AWS_ACCESS_KEY_ID=your_access_key_id
AWS_SECRET_ACCESS_KEY=your_secret_access_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=region-image-gallery
```

### Verify Configuration

```javascript
// test-s3-connection.js
const { S3Client, HeadBucketCommand } = require('@aws-sdk/client-s3');

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

async function testConnection() {
  try {
    const command = new HeadBucketCommand({
      Bucket: process.env.AWS_S3_BUCKET,
    });
    await s3Client.send(command);
    console.log('✅ S3 connection successful');
  } catch (error) {
    console.error('❌ S3 connection failed:', error.message);
  }
}

testConnection();
```

Run test:
```bash
node test-s3-connection.js
```

## Step 5: Folder Structure in S3

The application organizes images in the following structure:

```
region-image-gallery/
├── projects/
│   ├── 1/
│   │   ├── original/
│   │   │   ├── image1.jpg
│   │   │   └── image2.jpg
│   │   └── optimized/
│   │       ├── image1_optimized.jpg
│   │       └── image2_optimized.jpg
│   ├── 2/
│   │   ├── original/
│   │   └── optimized/
│   └── ...
```

## Image Upload and Optimization Flow

### 1. User Uploads Image
```
User → Frontend → Backend (Multer) → Temp File
```

### 2. Backend Processes Image
```
Temp File → Sharp (Optimization) → Optimized File
```

### 3. Upload to S3
```
Original File → S3 (Original folder)
Optimized File → S3 (Optimized folder)
```

### 4. Database Storage
```
Store file_url (original)
Store optimized_url (optimized)
```

## Example Upload Response

```json
{
  "message": "Image uploaded successfully",
  "image": {
    "id": 1,
    "project_id": 5,
    "file_url": "https://region-image-gallery.s3.us-east-1.amazonaws.com/projects/5/original/image1.jpg",
    "optimized_url": "https://region-image-gallery.s3.us-east-1.amazonaws.com/projects/5/optimized/image1_optimized.jpg",
    "file_name": "image1.jpg",
    "created_at": "2026-06-04T12:00:00Z"
  }
}
```

## S3 Lifecycle Policies (Optional)

### Auto-Delete Old Images

1. **Go to Lifecycle Rules**
   - Click on bucket
   - Go to "Management" tab
   - Click "Create lifecycle rule"

2. **Create Rule**
   - **Prefix**: `projects/`
   - **Days since creation**: 90
   - **Action**: Permanently delete object versions

## Cost Optimization

### Storage Optimization

1. **Use Intelligent-Tiering**
   - Automatically moves objects between access tiers
   - Saves up to 70% on storage

2. **Enable Versioning Control**
   - Limit object versions to keep latest 3
   - Delete old versions automatically

3. **Compression**
   - Already done by Sharp (JPEG quality 75%)
   - Reduces storage costs

### Cost Estimation

Based on typical usage:
- **Storage**: 1000 images × 500KB × 2 (original + optimized) = 1GB ≈ $0.023/month
- **Requests**: ~10,000 uploads/downloads/month ≈ $0.05/month
- **Total**: ~$0.10/month (very minimal)

## Security Best Practices

### 1. Restrict Bucket Access

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "DenyUnencryptedObjectUploads",
      "Effect": "Deny",
      "Principal": "*",
      "Action": "s3:PutObject",
      "Resource": "arn:aws:s3:::region-image-gallery/*",
      "Condition": {
        "StringNotEquals": {
          "s3:x-amz-server-side-encryption": "AES256"
        }
      }
    }
  ]
}
```

### 2. Enable Encryption

In application:
```javascript
const params = {
  Bucket: process.env.AWS_S3_BUCKET,
  Key: s3Key,
  Body: fileContent,
  ServerSideEncryption: 'AES256', // Enable encryption
};
```

### 3. Set Object Metadata

```javascript
const params = {
  // ...
  Metadata: {
    'project-id': projectId,
    'user-id': userId,
    'uploaded-at': new Date().toISOString(),
  },
};
```

### 4. Enable Versioning

```bash
aws s3api put-bucket-versioning \
  --bucket region-image-gallery \
  --versioning-configuration Status=Enabled
```

### 5. Enable Logging

```javascript
// Monitor S3 access
aws s3api put-bucket-logging \
  --bucket region-image-gallery \
  --bucket-logging-status file://logging.json
```

## Troubleshooting

### Access Denied Error

**Problem**: `AccessDenied: User is not authorized to perform: s3:PutObject`

**Solution**:
1. Verify IAM user has S3 permissions
2. Check bucket policy allows the action
3. Verify AWS credentials are correct

### Bucket Not Found

**Problem**: `NoSuchBucket: The specified bucket does not exist`

**Solution**:
1. Verify bucket name matches exactly
2. Check bucket exists in correct region
3. Verify bucket name is globally unique

### CORS Error

**Problem**: `Cross-Origin Request Blocked`

**Solution**:
1. Add CORS configuration to bucket
2. Include frontend URL in AllowedOrigins
3. Include correct HTTP methods

### Large File Upload Fails

**Problem**: `InvalidRequest: The authorization header is malformed`

**Solution**:
1. Use multipart upload for files > 100MB
2. Implement retry logic
3. Check file size limits in .env

## Multipart Upload (For Large Files)

```javascript
const { CreateMultipartUploadCommand } = require('@aws-sdk/client-s3');

async function multipartUpload(filePath, s3Key) {
  // Initialize multipart upload
  const multipartUpload = await s3Client.send(
    new CreateMultipartUploadCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: s3Key,
    })
  );

  // Upload parts...
  // Complete upload...
}
```

## Monitoring and Logging

### CloudWatch Metrics

1. **Enable CloudWatch Monitoring**
   - Go to S3 bucket metrics
   - Monitor: Requests, Bytes uploaded/downloaded, 4xx/5xx errors

2. **Set Alarms**
   - Alert on increased error rates
   - Alert on unexpected spike in costs

### S3 Access Logs

```bash
# Enable logging
aws s3api put-bucket-logging \
  --bucket region-image-gallery \
  --bucket-logging-status '{
    "LoggingEnabled": {
      "TargetBucket": "region-image-gallery-logs",
      "TargetPrefix": "logs/"
    }
  }'
```

## Migration from Local Storage

If migrating from local file storage:

```bash
# Sync local files to S3
aws s3 sync ./uploads/ s3://region-image-gallery/projects/

# List uploaded files
aws s3 ls s3://region-image-gallery/ --recursive

# Calculate total size
aws s3 ls s3://region-image-gallery/ --recursive --summarize
```

## Backup Strategy

### Automated Backups

1. **Enable Versioning** (already enabled)
2. **Set Lifecycle Policies** to archive old versions
3. **Cross-Region Replication** (optional):

```bash
# Enable cross-region replication
aws s3api put-bucket-replication \
  --bucket region-image-gallery \
  --replication-configuration file://replication.json
```

## Additional Resources

- [AWS S3 Documentation](https://docs.aws.amazon.com/s3/)
- [AWS SDK for JavaScript](https://docs.aws.amazon.com/sdk-for-javascript/)
- [S3 Best Practices](https://docs.aws.amazon.com/s3/latest/dev/BestPractices.html)
- [S3 Security Best Practices](https://docs.aws.amazon.com/s3/latest/dev/security.html)
- [AWS Pricing Calculator](https://calculator.aws/)
