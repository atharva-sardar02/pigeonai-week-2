# FCM Quick Start (5 Minutes)

**For**: Getting push notifications working quickly  
**Status**: ✅ Ready

---

## 🚀 Quick Steps

### 1. Register Android App in Firebase

1. Open [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click **⚙️ Settings** → **Project settings**
4. Scroll to **Your apps** → Click **Add app** → **Android**
5. Enter:
   - Package name: `com.pigeonai.app`
   - App nickname: `Pigeon AI`
6. Click **Register app**
7. **Download `google-services.json`**

### 2. Save the File

```bash
# Create directory
mkdir -p android/app

# Move downloaded file
mv ~/Downloads/google-services.json android/app/
```

### 3. Register iOS App (Optional)

1. In same Firebase **Project settings**
2. Click **Add app** → **iOS**
3. Enter:
   - Bundle ID: `com.pigeonai.app`
   - App nickname: `Pigeon AI iOS`
4. Click **Register app**
5. **Download `GoogleService-Info.plist`**

```bash
# Create directory
mkdir -p ios

# Move downloaded file
mv ~/Downloads/GoogleService-Info.plist ios/
```

### 4. Enable FCM API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your Firebase project
3. Search for **"Firebase Cloud Messaging API"**
4. Click **Enable**

---

## ✅ Done!

Your FCM is now configured. Push notifications will work when you:
- Build with EAS Build: `eas build --profile development --platform android`
- Or deploy to production

---

## 📋 Files You Should Have Now

```
your-project/
├── android/
│   └── app/
│       └── google-services.json  ← Android FCM config
├── ios/
│   └── GoogleService-Info.plist  ← iOS FCM config
└── .env                           ← Firebase web config (already there)
```

---

## 🧪 Test It

**Build and install on device:**
```bash
# Install EAS CLI
npm install -g eas-cli

# Login
eas login

# Configure
eas build:configure

# Build
eas build --profile development --platform android
```

**Then**: Install APK and send a message → Push notification should appear! 🎉

---

## Need More Details?

See: [`docs/FCM_SETUP_GUIDE.md`](./FCM_SETUP_GUIDE.md) for complete instructions.

