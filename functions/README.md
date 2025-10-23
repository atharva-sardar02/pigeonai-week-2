# 🚀 Deploy Cloud Functions for Background Notifications

## Quick Start

### 1. Install Firebase CLI
```bash
npm install -g firebase-tools
```

### 2. Login
```bash
firebase login
```

### 3. Deploy
```bash
firebase deploy --only functions
```

That's it! Background notifications will now work when the app is closed.

## What This Does

✅ Sends push notifications when:
- App is closed
- App is in background
- User is on a different screen

✅ Automatically:
- Removes invalid/expired tokens
- Handles multiple devices per user
- Works for both DMs and group chats

## Cost

**~$0.12/month** for 1000 users with 10,000 messages/day.

## Verify Deployment

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: `pigeonai-dev`
3. Click **Functions** tab
4. You should see: `sendMessageNotification`

## Test It

1. Close the Pigeon AI app completely
2. Have someone send you a message
3. You should receive a push notification! 🎉

## Need Help?

See [CLOUD_FUNCTIONS_DEPLOYMENT.md](./CLOUD_FUNCTIONS_DEPLOYMENT.md) for detailed guide.

