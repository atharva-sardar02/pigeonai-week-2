# 🚀 AWS S3 Image Sharing - Quick Start

**Time**: 15-20 minutes | **Cost**: $0 (AWS Unlimited)

---

## ✅ Implementation Complete

All code is ready. Just need to configure AWS services.

---

## 📋 Quick Setup Steps

### 1. Install Dependencies (2 min)

```powershell
cd aws-lambda
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

### 2. Create S3 Bucket (5 min)

https://s3.console.aws.amazon.com/

- Create bucket: `pigeonai-images`
- Region: `us-east-1`
- **Uncheck** "Block all public access"
- Add CORS configuration (see full guide)
- Add bucket policy for public read (see full guide)

### 3. Update Lambda IAM Role (3 min)

https://console.aws.amazon.com/iam/

- Find Lambda role
- Add inline policy for S3 access
- Permissions: `s3:PutObject`, `s3:GetObject`
- Resource: `arn:aws:s3:::pigeonai-images/*`

### 4. Add Environment Variable (1 min)

Lambda Console → Configuration → Environment variables

- Key: `S3_BUCKET_NAME`
- Value: `pigeonai-images`

### 5. Deploy Lambda (2 min)

```powershell
cd aws-lambda
Remove-Item function.zip -ErrorAction SilentlyContinue
Compress-Archive -Path ai-functions,node_modules,package.json,index.js,serviceAccountKey.json -DestinationPath function.zip -Force
aws lambda update-function-code --function-name pigeonai-send-notification --zip-file fileb://function.zip --region us-east-1
aws lambda wait function-updated --function-name pigeonai-send-notification --region us-east-1
```

### 6. Add API Gateway Endpoint (3 min)

https://console.aws.amazon.com/apigateway/

- Select: `pigeonai-notifications-api`
- Create resource: `/ai/upload-image`
- Create POST method → Lambda
- Enable CORS
- Deploy API

### 7. Build & Test (5 min)

```powershell
npx expo run:android --variant release
adb install -r android/app/build/outputs/apk/release/app-release.apk
```

**Test**: Open chat → Tap camera icon → Select image → Upload → Display ✅

---

## 📚 Full Documentation

**Complete Setup Guide**: `ai-docs/AWS_S3_IMAGE_SHARING_SETUP.md`  
**Implementation Details**: `ai-docs/AWS_S3_IMPLEMENTATION_SUMMARY.md`

---

## ✅ Done!

Image sharing now works with **$0 cost** using AWS S3! 🎉


