# iOS FCM Configuration

## 📱 Place `GoogleService-Info.plist` here

This directory should contain your Firebase Cloud Messaging configuration file for iOS.

### How to Get This File:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click **⚙️ Settings** → **Project settings**
4. Scroll to **Your apps**
5. If you don't have an iOS app yet:
   - Click **Add app** → Select **iOS**
   - Bundle ID: `com.pigeonai.app` (must match exactly!)
   - Click **Register app**
6. Click **Download GoogleService-Info.plist**
7. Place the downloaded file in this directory: `ios/GoogleService-Info.plist`

### Expected File Structure:

```
ios/
├── GoogleService-Info.plist  ← Your FCM config file
└── README.md                 ← This file
```

### What This File Does:

- Enables Firebase Cloud Messaging (FCM) for iOS
- Configures push notification delivery via APNs
- Links your app to your Firebase project
- Required for EAS Build to work with push notifications on iOS

### Additional iOS Setup (Production Only):

For iOS push notifications to work in production, you also need:

1. **Apple Developer Account** ($99/year)
2. **APNs Authentication Key** (generated in Apple Developer Portal)
3. **Upload APNs key to Firebase Console**

See `docs/FCM_SETUP_GUIDE.md` for complete iOS setup instructions.

### ⚠️ Important Notes:

- **Not a Secret**: This file is bundled in your IPA, so it's not sensitive
- **Security**: Firebase security comes from Firestore rules, not this file
- **Git**: This file should be committed to your repository
- **EAS Build**: Required for iOS push notifications to work

### Quick Check:

```bash
# Verify the file exists (macOS/Linux)
ls ios/GoogleService-Info.plist

# Verify it contains your project ID (macOS/Linux)
cat ios/GoogleService-Info.plist | grep "PROJECT_ID"

# Windows PowerShell
Test-Path ios\GoogleService-Info.plist
```

### Need Help?

- Quick guide: `docs/FCM_QUICKSTART.md`
- Full guide: `docs/FCM_SETUP_GUIDE.md`

---

**Status**: ⏳ Waiting for `GoogleService-Info.plist`  
**Next Step**: Download from Firebase Console and place here

