# FCM Configuration Checklist

**Last Updated**: October 21, 2025  
**Use This**: As a step-by-step guide to configure FCM

---

## ✅ Configuration Status

### Firebase Console Setup

- [ ] **1. Firebase project exists**
  - Project name: _______________
  - Project ID: _______________

- [ ] **2. Android app registered**
  - Package name: `com.pigeonai.app` ✓ (pre-configured)
  - App registered: ⏳
  - `google-services.json` downloaded: ⏳
  - File placed in `android/app/`: ⏳

- [ ] **3. iOS app registered** (if deploying to iOS)
  - Bundle ID: `com.pigeonai.app` ✓ (pre-configured)
  - App registered: ⏳
  - `GoogleService-Info.plist` downloaded: ⏳
  - File placed in `ios/`: ⏳

- [ ] **4. Firebase Cloud Messaging API enabled**
  - In Google Cloud Console: ⏳
  - API name: "Firebase Cloud Messaging API" (V1)

### iOS Specific (Production Only)

- [ ] **5. Apple Developer Account**
  - Account created: ⏳
  - Cost: $99/year

- [ ] **6. APNs Authentication Key**
  - Key generated in Apple Developer Portal: ⏳
  - `.p8` file downloaded: ⏳
  - Uploaded to Firebase Console: ⏳
  - Key ID noted: ⏳
  - Team ID noted: ⏳

### EAS Build Setup

- [ ] **7. EAS CLI installed**
  ```bash
  npm install -g eas-cli
  ```

- [ ] **8. EAS account created and logged in**
  ```bash
  eas login
  ```

- [ ] **9. EAS configured**
  ```bash
  eas build:configure
  ```
  - Creates `eas.json` ✓ (already created)

- [ ] **10. Google Services files in place**
  - `android/app/google-services.json` exists: ⏳
  - `ios/GoogleService-Info.plist` exists: ⏳
  - `eas.json` references these files: ✓ (already configured)

### Testing

- [ ] **11. Development build created**
  ```bash
  eas build --profile development --platform android
  ```

- [ ] **12. App installed on physical device**
  - Device: _______________
  - OS version: _______________

- [ ] **13. Push notifications working**
  - Login successful: ⏳
  - Token registered: ⏳
  - Test notification sent: ⏳
  - Notification received: ⏳
  - Tap notification opens correct chat: ⏳

---

## 📋 Quick Reference

### Required Files

| File | Location | Status | Source |
|------|----------|--------|--------|
| `google-services.json` | `android/app/` | ⏳ | Firebase Console → Android app |
| `GoogleService-Info.plist` | `ios/` | ⏳ | Firebase Console → iOS app |
| `.p8` APNs key | Uploaded to Firebase | ⏳ | Apple Developer Portal |
| `eas.json` | Project root | ✅ | Already created |
| `.env` | Project root | ✅ | Already exists |

### Package/Bundle IDs (Must Match!)

| Platform | Identifier | Configured In | Status |
|----------|-----------|---------------|--------|
| Android | `com.pigeonai.app` | `app.config.js` | ✅ |
| Android | `com.pigeonai.app` | Firebase Console | ⏳ |
| iOS | `com.pigeonai.app` | `app.config.js` | ✅ |
| iOS | `com.pigeonai.app` | Firebase Console | ⏳ |
| iOS | `com.pigeonai.app` | Apple Developer | ⏳ |

**⚠️ CRITICAL**: All identifiers must match exactly!

---

## 🚀 Getting Started (In Order)

### Step 1: Firebase Console - Android (5 min)

1. Open https://console.firebase.google.com/
2. Select your project
3. **⚙️ Settings** → **Project settings** → **Your apps**
4. **Add app** → **Android**
5. Package name: `com.pigeonai.app`
6. **Register app**
7. **Download `google-services.json`**
8. Move to: `android/app/google-services.json`

**Verify**:
```bash
# File should exist
ls android/app/google-services.json

# Should contain your project ID
cat android/app/google-services.json | grep "project_id"
```

### Step 2: Firebase Console - iOS (5 min, optional)

1. Same Firebase **Project settings** → **Your apps**
2. **Add app** → **iOS**
3. Bundle ID: `com.pigeonai.app`
4. **Register app**
5. **Download `GoogleService-Info.plist`**
6. Move to: `ios/GoogleService-Info.plist`

**Verify**:
```bash
# File should exist
ls ios/GoogleService-Info.plist
```

### Step 3: Enable FCM API (2 min)

1. Open https://console.cloud.google.com/
2. Select your Firebase project (top dropdown)
3. Search: "Firebase Cloud Messaging API"
4. Click **Enable**

**Verify**: API status shows "Enabled"

### Step 4: Build with EAS (15-20 min)

```bash
# Install EAS CLI (if not already installed)
npm install -g eas-cli

# Login
eas login

# Configure (if not already done)
eas build:configure

# Build for Android
eas build --profile development --platform android
```

**Wait**: Build takes 15-20 minutes (first time)

### Step 5: Test on Device (5 min)

1. Download APK from build link
2. Install on Android device
3. Open app and login
4. Check logs for: "✅ Push token registered"
5. Send a message from another account
6. Verify notification appears!

---

## 🎯 For MVP Submission

### Minimum Required (For Push Notifications to Work):

✅ **Already Done**:
- Expo notifications configured
- Notification service implemented
- Push notification code complete
- Android permissions added
- EAS configuration created

⏳ **You Need to Do** (15 minutes total):
1. Register Android app in Firebase (5 min)
2. Download `google-services.json` (1 min)
3. Place file in `android/app/` (1 min)
4. Enable FCM API (2 min)
5. Build with EAS (15 min build time)
6. Test on device (5 min)

**Total active time**: ~15 minutes  
**Total wait time**: ~15 minutes (build)

### Optional (For iOS):
- Register iOS app in Firebase (5 min)
- Download `GoogleService-Info.plist` (1 min)
- For production: APNs key setup (30 min)

---

## ❓ FAQs

### Q: Are these files secrets?
**A**: No! They're bundled in your app. Security comes from Firestore rules.

### Q: Should I commit them to git?
**A**: Yes! They should be in version control (unlike `.env`).

### Q: Do I need iOS setup for MVP?
**A**: Only if you're testing on iOS devices. Android is faster to test.

### Q: Can I test in Expo Go?
**A**: No, SDK 53+ removed push notifications from Expo Go. Use EAS Build.

### Q: What if I don't have Apple Developer account?
**A**: You can still test on Android. iOS production requires paid account ($99/year).

### Q: How long does EAS Build take?
**A**: First build: 15-20 minutes. Subsequent builds: 5-10 minutes.

---

## 🔗 Links

- [Firebase Console](https://console.firebase.google.com/)
- [Google Cloud Console](https://console.cloud.google.com/)
- [Apple Developer](https://developer.apple.com/)
- [EAS Build](https://expo.dev/accounts/[your-account]/projects/[your-project]/builds)
- [Expo Push Tool](https://expo.dev/notifications) (for testing)

---

## 📝 Notes Section

Use this space to note down your specific values:

**Firebase Project**:
- Project name: _______________
- Project ID: _______________

**Android App**:
- Registration date: _______________
- File downloaded: ⏳

**iOS App** (if applicable):
- Registration date: _______________
- File downloaded: ⏳
- APNs key uploaded: ⏳

**EAS Build**:
- First build date: _______________
- Build URL: _______________

**Testing**:
- Device 1: _______________
- Device 2: _______________
- Test date: _______________
- Result: ⏳

---

**Next Steps**: Check off items as you complete them! 🚀

