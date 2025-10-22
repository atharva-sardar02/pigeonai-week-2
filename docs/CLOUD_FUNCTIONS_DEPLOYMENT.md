# Firebase Cloud Functions Deployment Guide

## Overview
Cloud Functions enable background push notifications when the app is closed or in background.

## Prerequisites
1. Firebase CLI installed: `npm install -g firebase-tools`
2. Firebase project with Blaze (pay-as-you-go) plan
3. Admin access to Firebase project

## Deployment Steps

### 1. Login to Firebase
```bash
firebase login
```

### 2. Initialize Firebase (if not done)
```bash
firebase init
```
Select:
- Functions: Configure and deploy Cloud Functions
- Firestore: Deploy rules and create indexes

### 3. Deploy Cloud Functions
```bash
cd functions
npm run build
cd ..
firebase deploy --only functions
```

Or deploy specific function:
```bash
firebase deploy --only functions:sendMessageNotification
```

### 4. Verify Deployment
Check Firebase Console:
- Go to: https://console.firebase.google.com/
- Select your project: `pigeonai-dev`
- Navigate to: **Functions** tab
- You should see: `sendMessageNotification` function listed

## How It Works

### Trigger
- **Event**: New document created in `conversations/{conversationId}/messages/{messageId}`
- **Action**: Automatically sends FCM push notification to all recipients

### Flow
1. User A sends a message to User B
2. Message is written to Firestore
3. Cloud Function triggers automatically
4. Function retrieves User B's FCM tokens
5. Function sends push notification via FCM
6. User B receives notification (even if app is closed)

### Notification Payload
```json
{
  "notification": {
    "title": "John Doe",
    "body": "Hey, how are you?",
    "sound": "default"
  },
  "data": {
    "screen": "Chat",
    "conversationId": "abc123",
    "senderId": "user123",
    "messageId": "msg456"
  }
}
```

## Monitoring

### View Logs
```bash
firebase functions:log
```

### View Logs for Specific Function
```bash
firebase functions:log --only sendMessageNotification
```

### Real-time Logs
```bash
firebase functions:log --only sendMessageNotification --follow
```

## Costs

Firebase Cloud Functions pricing (Blaze plan):
- **Invocations**: $0.40 per million (first 2M free)
- **Compute time**: $0.0000025 per GB-second
- **Networking**: $0.12 per GB

**Estimated costs for 1000 users:**
- ~10,000 messages/day
- ~$0.004/day = **~$0.12/month** (very cheap!)

## Testing

### Test Locally (Emulator)
```bash
cd functions
npm run serve
```

### Send Test Message
1. Open Pigeon AI app
2. Send a message to another user
3. Check Firebase Console logs for function execution
4. Verify recipient receives notification (even with app closed)

## Troubleshooting

### Function Not Triggering
- Check Firebase Console > Functions > Logs
- Verify function is deployed: `firebase functions:list`
- Check Firestore rules allow function to read data

### No Notification Received
- Check user has valid FCM token saved in Firestore
- Check device has notification permissions enabled
- Check FCM token hasn't expired (function auto-removes invalid tokens)

### Invalid Token Errors
- Function automatically removes invalid/expired tokens
- User will get new token on next app login

## Security

### Function Security
- Uses Firebase Admin SDK (full access to Firestore)
- Runs in secure Google Cloud environment
- No API keys needed

### Data Privacy
- Function only reads data needed for notifications
- Does not store any data
- Complies with Firebase security rules

## Updating Functions

After making changes to `functions/src/index.ts`:

```bash
cd functions
npm run build
cd ..
firebase deploy --only functions
```

Changes are deployed instantly with zero downtime.

## Rollback

If something goes wrong:
```bash
firebase functions:delete sendMessageNotification
```

Then redeploy previous version.

## Related Documentation
- [Firebase Cloud Functions Docs](https://firebase.google.com/docs/functions)
- [FCM Server API](https://firebase.google.com/docs/cloud-messaging/server)
- [docs/NOTIFICATION_SYSTEM_COMPLETE.md](./NOTIFICATION_SYSTEM_COMPLETE.md) - Complete notification system overview

