# Android FCM Configuration

## 📱 Place `google-services.json` here

This directory should contain your Firebase Cloud Messaging configuration file for Android.

### How to Get This File:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click **⚙️ Settings** → **Project settings**
4. Scroll to **Your apps**
5. If you don't have an Android app yet:
   - Click **Add app** → Select **Android**
   - Package name: `com.pigeonai.app` (must match exactly!)
   - Click **Register app**
6. Click **Download google-services.json**
7. Place the downloaded file in this directory: `android/app/google-services.json`

### Expected File Structure:

```
android/
└── app/
    ├── google-services.json  ← Your FCM config file
    └── README.md             ← This file
```

### What This File Does:

- Enables Firebase Cloud Messaging (FCM) for Android
- Configures push notification delivery
- Links your app to your Firebase project
- Required for EAS Build to work with push notifications

### ⚠️ Important Notes:

- **Not a Secret**: This file is bundled in your APK, so it's not sensitive
- **Security**: Firebase security comes from Firestore rules, not this file
- **Git**: This file should be committed to your repository
- **EAS Build**: Required for push notifications to work

### Quick Check:

```bash
# Verify the file exists
ls android/app/google-services.json

# Verify it contains your project ID
cat android/app/google-services.json | grep "project_id"
```

### Need Help?

- Quick guide: `docs/FCM_QUICKSTART.md`
- Full guide: `docs/FCM_SETUP_GUIDE.md`

---

**Status**: ⏳ Waiting for `google-services.json`  
**Next Step**: Download from Firebase Console and place here

