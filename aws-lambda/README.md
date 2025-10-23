# AWS Lambda Push Notifications Setup

## Overview
This setup uses AWS Lambda (free with your AWS access) instead of Firebase Cloud Functions (requires Blaze plan).

## Architecture

```
User sends message
    ↓
React Native App
    ↓
1. Saves message to Firestore
2. Calls AWS Lambda HTTP endpoint
    ↓
AWS Lambda
    ↓
Gets recipient FCM tokens from Firestore
    ↓
Sends FCM push notification
    ↓
Recipients receive notification
```

## Setup Steps

### 1. Get Firebase Service Account Credentials

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: `pigeonai-dev`
3. Click **Settings** (gear icon) > **Project Settings**
4. Go to **Service Accounts** tab
5. Click **Generate New Private Key**
6. Download the JSON file
7. Save it as `serviceAccountKey.json` (don't commit this!)

### 2. Create AWS Lambda Function

#### A. Install Dependencies
```bash
cd aws-lambda
npm install
```

#### B. Create Deployment Package
```bash
zip -r function.zip index.js node_modules package.json
```

#### C. Create Lambda Function in AWS Console

1. Go to [AWS Lambda Console](https://console.aws.amazon.com/lambda/)
2. Click **Create function**
3. Choose **Author from scratch**
4. Function name: `pigeonai-send-notification`
5. Runtime: **Node.js 18.x**
6. Architecture: **x86_64**
7. Click **Create function**

#### D. Upload Code
1. In the function page, go to **Code** tab
2. Click **Upload from** > **.zip file**
3. Upload `function.zip`
4. Click **Save**

#### E. Configure Environment Variables
1. Go to **Configuration** > **Environment variables**
2. Click **Edit** > **Add environment variable**
3. Add these from your `serviceAccountKey.json`:

```
FIREBASE_PROJECT_ID = pigeonai-dev
FIREBASE_PRIVATE_KEY_ID = [from JSON]
FIREBASE_PRIVATE_KEY = [from JSON - entire key with \n]
FIREBASE_CLIENT_EMAIL = [from JSON]
FIREBASE_CLIENT_ID = [from JSON]
FIREBASE_CLIENT_CERT_URL = [from JSON]
```

#### F. Configure Function Settings
1. Go to **Configuration** > **General configuration**
2. Click **Edit**
3. Memory: **256 MB**
4. Timeout: **30 seconds**
5. Click **Save**

### 3. Create API Gateway (HTTP Endpoint)

#### A. Create HTTP API
1. Go to [API Gateway Console](https://console.aws.amazon.com/apigateway/)
2. Click **Create API**
3. Choose **HTTP API** > **Build**
4. API name: `pigeonai-notifications-api`
5. Click **Next**

#### B. Configure Routes
1. Method: **POST**
2. Resource path: `/send-notification`
3. Integration: Select your Lambda function `pigeonai-send-notification`
4. Click **Next** > **Next** > **Create**

#### C. Get API Endpoint
1. Go to **Stages** > **$default**
2. Copy the **Invoke URL**
3. Your endpoint: `https://[api-id].execute-api.[region].amazonaws.com/send-notification`

### 4. Update React Native App

Add Lambda endpoint to `.env`:
```bash
EXPO_PUBLIC_LAMBDA_NOTIFICATION_URL=https://[api-id].execute-api.[region].amazonaws.com/send-notification
```

The app will automatically call this endpoint when sending messages.

### 5. Test It!

1. Send a message from one user to another
2. Check CloudWatch Logs in AWS Lambda
3. Recipient should receive push notification even with app closed!

## Monitoring

### View Lambda Logs
1. Go to [CloudWatch Console](https://console.aws.amazon.com/cloudwatch/)
2. Click **Logs** > **Log groups**
3. Select `/aws/lambda/pigeonai-send-notification`
4. View execution logs

### Check Errors
Look for lines starting with `❌` in the logs.

## Cost
- **AWS Lambda**: FREE (1M requests/month free tier)
- **API Gateway**: FREE (1M API calls/month free tier)
- **Firebase Spark Plan**: FREE
- **FCM**: FREE (unlimited)

**Total: $0/month** 🎉

## Security Notes

1. **Never commit `serviceAccountKey.json`** - It's in `.gitignore`
2. **Lambda environment variables** are encrypted at rest
3. **API Gateway endpoint** is public but requires valid message data
4. Consider adding **API key authentication** for production

## Troubleshooting

### Lambda Not Triggering
- Check CloudWatch logs for errors
- Verify environment variables are set correctly
- Test Lambda manually in AWS Console

### No Notifications Received
- Check FCM tokens are saved in Firestore
- Verify device has notification permissions
- Check CloudWatch logs for FCM API errors

### Invalid Credentials Error
- Verify all environment variables from `serviceAccountKey.json`
- Ensure `FIREBASE_PRIVATE_KEY` includes `\n` characters
- Check service account has Firestore permissions

## Related Documentation
- [AWS Lambda Docs](https://docs.aws.amazon.com/lambda/)
- [API Gateway Docs](https://docs.aws.amazon.com/apigateway/)
- [FCM Server API](https://firebase.google.com/docs/cloud-messaging/server)

