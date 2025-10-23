# AWS Lambda Push Notifications - Quick Setup

## What You Need

1. ✅ Firebase Project (pigeonai-dev) - FREE Spark plan
2. ✅ AWS Account with Lambda access
3. ✅ 15 minutes

## Step-by-Step Setup

### 1. Get Firebase Service Account Key

```bash
# Go to Firebase Console
https://console.firebase.google.com/project/pigeonai-dev/settings/serviceaccounts/adminsdk

# Click "Generate New Private Key"
# Download and save as: aws-lambda/serviceAccountKey.json
```

### 2. Deploy Lambda Function

```bash
cd aws-lambda
npm install
zip -r function.zip index.js node_modules package.json

# Upload to AWS Lambda Console
# Function name: pigeonai-send-notification
# Runtime: Node.js 18.x
# Memory: 256 MB
# Timeout: 30 seconds
```

### 3. Set Lambda Environment Variables

In AWS Lambda Console > Configuration > Environment variables:

```bash
# Copy values from serviceAccountKey.json:
FIREBASE_PROJECT_ID=pigeonai-dev
FIREBASE_PRIVATE_KEY_ID=[from JSON]
FIREBASE_PRIVATE_KEY=[entire key with \n characters]
FIREBASE_CLIENT_EMAIL=[from JSON]
FIREBASE_CLIENT_ID=[from JSON]
FIREBASE_CLIENT_CERT_URL=[from JSON]
```

### 4. Create API Gateway

```bash
# AWS API Gateway Console
# Create HTTP API
# Name: pigeonai-notifications-api
# Add route: POST /send-notification
# Integration: Lambda (pigeonai-send-notification)
# Copy Invoke URL
```

### 5. Update `.env` File

```bash
# Add Lambda endpoint to .env:
EXPO_PUBLIC_LAMBDA_NOTIFICATION_URL=https://[api-id].execute-api.[region].amazonaws.com/send-notification
```

### 6. Add to EAS Secrets

```bash
eas secret:create --scope project --name EXPO_PUBLIC_LAMBDA_NOTIFICATION_URL --value https://[your-api-gateway-url]/send-notification
```

### 7. Build & Test!

```bash
# Build new APK with Lambda integration
eas build --profile preview --platform android

# Test:
# 1. Install APK on device
# 2. Login
# 3. Close app completely
# 4. Send message from another device
# 5. You should receive push notification! 🎉
```

## How It Works

```
User A sends message
    ↓
App calls AWS Lambda
    ↓
Lambda gets recipient FCM tokens from Firestore
    ↓
Lambda sends FCM push notification
    ↓
User B receives notification (even with app closed!)
```

## Cost: $0/month 💰

- Firebase Spark Plan: FREE
- AWS Lambda: FREE (1M requests/month)
- API Gateway: FREE (1M calls/month)
- FCM: FREE (unlimited)

## Troubleshooting

### No notifications?
1. Check CloudWatch logs in AWS
2. Verify Lambda environment variables
3. Ensure FCM tokens are saved in Firestore
4. Check device has notification permissions

### Lambda error?
- View logs: AWS Console > CloudWatch > Log groups > /aws/lambda/pigeonai-send-notification

## Documentation

- Full setup: [aws-lambda/README.md](./aws-lambda/README.md)
- Architecture: See diagrams in README

## Need Help?

Check the detailed README in `aws-lambda/README.md`

