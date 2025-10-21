# Firebase Cloud Messaging (FCM) Setup Guide

**Last Updated**: October 21, 2025  
**Status**: ✅ Ready for Configuration

---

## Overview

This guide will help you configure Firebase Cloud Messaging (FCM) for the Pigeon AI app. While we're currently using Expo Push Notifications (which uses FCM under the hood), proper FCM configuration ensures:

- ✅ Push notifications work correctly
- ✅ Better delivery rates
- ✅ Access to FCM-specific features
- ✅ Easier future migration to direct FCM

---

## Prerequisites

- [ ] Firebase project created
- [ ] Firebase web app configured
- [ ] `.env` file with Firebase credentials

---

## Step 1: Access Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (e.g., "Pigeon AI")
3. Click on the **⚙️ Settings** icon → **Project settings**

---

## Step 2: Configure Android App (FCM)

### 2.1: Add Android App

1. In **Project settings**, scroll to **Your apps**
2. Click **Add app** → Select **Android**
3. Fill in the details:
   - **Android package name**: `com.pigeonai.app` (must match `app.config.js`)
   - **App nickname**: `Pigeon AI - Android` (optional)
   - **SHA-1 certificate**: Leave blank for now (add later for production)

4. Click **Register app**

### 2.2: Download `google-services.json`

1. After registering, Firebase will generate `google-services.json`
2. Click **Download google-services.json**
3. **Save this file** - you'll need it for EAS Build

**⚠️ Important**: Keep this file secure, but it's not a secret (it's bundled in your app)

### 2.3: Add to Project (For EAS Build)

```bash
# Create android directory if it doesn't exist
mkdir -p android/app

# Move google-services.json
mv ~/Downloads/google-services.json android/app/
```

**For Expo Go**: You don't need this file yet (Expo Go uses Expo's FCM credentials)

---

## Step 3: Configure iOS App (APNs)

### 3.1: Add iOS App

1. In **Project settings** → **Your apps**
2. Click **Add app** → Select **iOS**
3. Fill in the details:
   - **iOS bundle ID**: `com.pigeonai.app` (must match `app.config.js`)
   - **App nickname**: `Pigeon AI - iOS` (optional)
   - **App Store ID**: Leave blank for now

4. Click **Register app**

### 3.2: Download `GoogleService-Info.plist`

1. After registering, Firebase will generate `GoogleService-Info.plist`
2. Click **Download GoogleService-Info.plist**
3. **Save this file** - you'll need it for EAS Build

### 3.3: Add to Project (For EAS Build)

```bash
# Create ios directory if it doesn't exist
mkdir -p ios

# Move GoogleService-Info.plist
mv ~/Downloads/GoogleService-Info.plist ios/
```

### 3.4: Configure APNs (Required for Production iOS)

**⚠️ Note**: This step requires a paid Apple Developer account ($99/year)

1. Go to [Apple Developer Portal](https://developer.apple.com/account/)
2. Navigate to **Certificates, Identifiers & Profiles**
3. Create **APNs Key**:
   - Click **Keys** → **+** (Add)
   - Name: `Pigeon AI APNs Key`
   - Enable: **Apple Push Notifications service (APNs)**
   - Click **Continue** → **Register**
   - **Download the .p8 file** (you can only download this once!)

4. Upload APNs Key to Firebase:
   - In Firebase Console → **Project settings** → **Cloud Messaging**
   - Scroll to **Apple app configuration**
   - Click **Upload** next to **APNs Authentication Key**
   - Upload the `.p8` file
   - Enter:
     - **Key ID**: Found in Apple Developer Portal
     - **Team ID**: Found in Apple Developer Portal (top right)

---

## Step 4: Enable Cloud Messaging API

### 4.1: Enable in Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your Firebase project
3. Navigate to **APIs & Services** → **Library**
4. Search for **"Firebase Cloud Messaging API"**
5. Click on it → Click **Enable**

**⚠️ Important**: This is separate from the legacy "Cloud Messaging" API

---

## Step 5: Get FCM Server Key (For Direct FCM - Future)

If you plan to migrate to direct FCM in the future:

1. In Firebase Console → **Project settings** → **Cloud Messaging**
2. Scroll to **Cloud Messaging API (V1)**
3. Copy:
   - **Server Key** (deprecated, but some services still use it)
   - **Sender ID** (already in your `.env` as `MESSAGING_SENDER_ID`)

**For now**: We're using Expo Push, so you don't need this yet

---

## Step 6: Update App Configuration

### 6.1: Update `.env`

Your `.env` file should already have these from Firebase web app config:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSy...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abc123
```

**No changes needed** - FCM uses the same credentials

### 6.2: Update `app.config.js`

Ensure your Android package and iOS bundle ID match Firebase:

```javascript
android: {
  package: 'com.pigeonai.app',  // Must match Firebase Android app
  permissions: [
    'RECEIVE_BOOT_COMPLETED',
    'VIBRATE',
    'android.permission.POST_NOTIFICATIONS'
  ],
},
ios: {
  bundleIdentifier: 'com.pigeonai.app',  // Must match Firebase iOS app
}
```

**✅ Already configured in your project!**

---

## Step 7: Configure EAS Build (For Production)

### 7.1: Install EAS CLI

```bash
npm install -g eas-cli
```

### 7.2: Login to Expo

```bash
eas login
```

### 7.3: Configure EAS

```bash
eas build:configure
```

This creates `eas.json`:

```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "apk"
      }
    }
  }
}
```

### 7.4: Add Google Services Files to EAS

Create `eas.json` configuration to include FCM files:

```json
{
  "build": {
    "production": {
      "android": {
        "buildType": "apk",
        "googleServicesFile": "./android/app/google-services.json"
      },
      "ios": {
        "googleServicesFile": "./ios/GoogleService-Info.plist"
      }
    }
  }
}
```

---

## Step 8: Test Push Notifications

### 8.1: Build with EAS

```bash
# Development build (faster, includes Expo Dev Tools)
eas build --profile development --platform android

# Production build
eas build --profile production --platform android
```

### 8.2: Install APK

1. Download APK from EAS build link
2. Install on Android device
3. Open the app and login

### 8.3: Send Test Notification

**Option A: From Your App**
1. Login with User A on Device 1
2. Login with User B on Device 2
3. Send a message from User A
4. User B should receive push notification

**Option B: Expo Push Tool**
1. Get Expo Push Token from logs (starts with `ExponentPushToken[...]`)
2. Go to https://expo.dev/notifications
3. Enter token and send test notification

**Option C: Firebase Console (Direct FCM)**
1. Go to Firebase Console → **Messaging** → **Send your first message**
2. Enter notification title and body
3. Click **Send test message**
4. Enter FCM token (get from app logs)
5. Click **Test**

---

## Step 9: Verify Configuration

### ✅ Checklist

- [ ] Android app registered in Firebase
- [ ] iOS app registered in Firebase
- [ ] `google-services.json` downloaded (Android)
- [ ] `GoogleService-Info.plist` downloaded (iOS)
- [ ] APNs key uploaded to Firebase (iOS, production only)
- [ ] Firebase Cloud Messaging API enabled
- [ ] Package names match (`app.config.js` ↔ Firebase)
- [ ] EAS configured with Google Services files
- [ ] Test build created with EAS
- [ ] Push notifications working on test device

---

## Troubleshooting

### Issue: "No registration token available"

**Cause**: App not properly configured with FCM

**Solution**:
1. Verify `google-services.json` is in `android/app/`
2. Rebuild with EAS Build
3. Check Firebase project has Android app registered

### Issue: "APNs delivery failed" (iOS)

**Cause**: APNs key not configured

**Solution**:
1. Generate APNs key in Apple Developer Portal
2. Upload to Firebase Console
3. Rebuild iOS app

### Issue: Notifications not received on iOS

**Cause**: Missing APNs certificate or wrong bundle ID

**Solution**:
1. Verify bundle ID matches: `app.config.js` ↔ Firebase ↔ Apple Developer
2. Check APNs key is uploaded to Firebase
3. Ensure device has internet connection

### Issue: "google-services.json not found"

**Cause**: File not in correct location for EAS Build

**Solution**:
1. Create `android/app/` directory: `mkdir -p android/app`
2. Move file: `mv google-services.json android/app/`
3. Update `eas.json` to point to correct path

---

## Current Status

### ✅ What's Already Configured

- Firebase project initialized
- Firebase Auth configured
- Firestore configured
- Expo Notifications plugin installed
- Android permissions added
- Notification service implemented
- Push notification flow complete

### ⏳ What You Need to Do

1. **Register Android app** in Firebase Console
2. **Download `google-services.json`**
3. **Register iOS app** in Firebase Console (if deploying to iOS)
4. **Download `GoogleService-Info.plist`** (iOS)
5. **Upload APNs key** (iOS production only)
6. **Build with EAS** to test on real device

---

## Next Steps

After completing this FCM setup:

1. ✅ Push notifications will work with Expo Push (current implementation)
2. ✅ You'll be ready for EAS Build deployment
3. ✅ You can migrate to direct FCM in the future (if needed)
4. ✅ iOS notifications will work in production

---

## Files to Keep Safe

**Download and save these files**:
- ✅ `google-services.json` (Android) - Add to `android/app/`
- ✅ `GoogleService-Info.plist` (iOS) - Add to `ios/`
- ✅ APNs `.p8` key file (iOS) - Store securely, upload to Firebase

**⚠️ Important**: The APNs `.p8` file can only be downloaded once. If you lose it, you'll need to generate a new key.

---

## Cost

**FCM Configuration**: **FREE**
- Unlimited push notifications
- Unlimited devices
- All FCM features

**EAS Build**:
- Free tier: Limited builds per month
- Paid: $29/month for unlimited builds

**Apple Developer**: $99/year (required for iOS production)

---

## Resources

- [Firebase Console](https://console.firebase.google.com/)
- [Google Cloud Console](https://console.cloud.google.com/)
- [Apple Developer Portal](https://developer.apple.com/)
- [EAS Build Docs](https://docs.expo.dev/build/introduction/)
- [FCM Documentation](https://firebase.google.com/docs/cloud-messaging)

---

## Summary

This guide configures Firebase Cloud Messaging for the Pigeon AI app. While we're currently using Expo Push Notifications (which handles FCM automatically), this setup:

1. ✅ Ensures push notifications work correctly
2. ✅ Prepares your app for EAS Build deployment
3. ✅ Enables iOS push notifications
4. ✅ Makes future migration to direct FCM easier

**Next**: Register your Android and iOS apps in Firebase Console and download the configuration files! 🚀

