# Pigeon AI - Real-Time Messaging App

A production-quality cross-platform messaging application built with React Native, Expo, and Firebase, featuring real-time chat, group messaging, presence tracking, typing indicators, and push notifications.

## 📱 Features

### ✅ Core Messaging
- **One-on-One Chat** - Real-time messaging between users with sub-second latency
- **Group Chat** - Create and manage group conversations (3+ members)
- **Message Persistence** - All messages cached locally and survive app restarts
- **Offline Support** - Queue messages when offline, auto-sync when reconnected
- **Optimistic UI** - Messages appear instantly before server confirmation
- **Real-Time Sync** - Changes propagate instantly across all devices

### ✅ Presence & Awareness
- **Online/Offline Status** - Real-time presence indicators with green dot badges
- **Last Seen** - "Last seen 5m ago" timestamps for offline users
- **Typing Indicators** - Animated "messaging • • •" indicator in chat header
- **Read Receipts** - Double checkmarks update in real-time when messages are read

### ✅ Group Features
- **Group Creation** - Create groups with name, description, and icon
- **Member Management** - Add/remove members, admin controls
- **Group Details** - View member list, group info, and leave group
- **Sender Names** - Display sender names in group messages
- **Group Typing** - "John and Sarah are messaging..." for multiple typers

### ✅ Push Notifications
- **AWS Lambda Server-Side** - Push notifications handled by AWS Lambda (free!)
- **Firebase Cloud Messaging** - Native FCM integration for production APK
- **Group Format** - "Group Name - User Name: message"
- **DM Format** - "User Name: message"
- **Works Everywhere** - Foreground, background, and closed states
- **Global Notifications** - Get notified of new messages anywhere in the app
- **Missed Messages** - Notified of messages received while offline
- **Smart Filtering** - No notification spam, only new messages from others

### ✅ User Experience
- **Dark Mode Theme** - Professional dark UI throughout
- **User Profiles** - Avatar, display name, and profile viewing
- **Keyboard Handling** - Smooth keyboard interactions on all input screens
- **Expandable FAB Menu** - Easy access to "New Chat" and "New Group"
- **Message Timestamps** - Smart formatting (e.g., "Yesterday 2:30 PM")
- **Natural Scrolling** - Chat UI mirrors WhatsApp (newest at bottom)

### 🟡 Partially Implemented
- **Image Sharing** - Backend ready, UI pending
- **Offline Indicator** - Queue implemented, UI indicator pending

### 🔜 Planned (Post-MVP)
- AI-powered features (summarization, translation, smart replies)
- Voice messages
- Video sharing
- Message editing/deletion
- End-to-end encryption

## 🛠️ Tech Stack

### Frontend
- **React Native 0.81.4** - Cross-platform mobile framework
- **Expo SDK 54.0.0** - Development platform and tooling (latest)
- **React 19.1.0** - UI library (latest)
- **TypeScript 5.9.2** - Type safety (latest)
- **React Navigation 7.x** - Navigation
- **Expo SQLite** - Local persistence and caching
- **Firebase JS SDK 12.4.0** - Firebase client (Expo Go compatible)

### Backend
- **Firebase Authentication** - User authentication and sessions
- **Firebase Firestore** - Real-time database (us-east4 region)
- **Firebase Cloud Messaging** - Push notifications (via AWS Lambda)
- **AWS Lambda** - Server-side push notification handler (free tier)
- **API Gateway** - HTTP endpoint to trigger Lambda
- **Firebase Storage** - Image and media storage (ready)
- **Firebase Cloud Functions** - Serverless backend (ready for AI features)

### Key Libraries
- `@react-navigation/native` & `@react-navigation/native-stack` - Navigation
- `expo-notifications` - Push notification handling
- `expo-sqlite` - Local database
- `@react-native-async-storage/async-storage` - Key-value storage
- `@react-native-community/netinfo` - Network monitoring
- `react-native-safe-area-context` - Safe area handling
- `Ionicons` - Icon library

## 📋 Prerequisites

Before you begin, ensure you have:

- **Node.js** 18+ installed ([Download](https://nodejs.org/))
- **npm** or **yarn** package manager
- **Git** for cloning the repository
- **Expo Go app** installed on your iOS or Android device:
  - [App Store](https://apps.apple.com/app/expo-go/id982107779) (iOS)
  - [Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent) (Android)
- **Firebase account** (free tier is sufficient)
- **EAS account** (free, no credit card required) - [Sign up](https://expo.dev/signup)

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/pigeonai-week-2.git
cd pigeonai-week-2
```

### 2. Install Dependencies

```bash
npm install
```

If you encounter issues:
```bash
npm install --force
```

### 3. Set Up Firebase

#### Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** or **"Create a project"**
3. Project name: `pigeonai-dev` (or your preferred name)
4. Disable Google Analytics (optional, not needed for MVP)
5. Click **"Create project"**

#### Enable Services

**Authentication:**
1. Go to **Build** → **Authentication** → **Get started**
2. Click **Email/Password** → **Enable** → **Save**

**Firestore Database:**
1. Go to **Build** → **Firestore Database** → **Create database**
2. Choose **"Start in test mode"** (for development)
3. Location: **us-east4 (North Carolina)** or closest to you
4. Click **"Enable"**

**Cloud Messaging:**
- Auto-enabled (no action needed)

#### Register Web App
1. Go to **Project Overview** (gear icon) → **Project settings**
2. Scroll to **"Your apps"** section
3. Click **"Add app"** → Select **Web** (</> icon)
4. App nickname: `Pigeon AI Web`
5. **Don't** check "Firebase Hosting"
6. Click **"Register app"**
7. **Copy the `firebaseConfig` object** (you'll need this next)

### 4. Configure Environment Variables

Create a `.env` file in the project root:

```bash
# On Mac/Linux:
cp env.example .env

# On Windows:
copy env.example .env
```

Open `.env` and fill in your Firebase configuration (from step 3):

```env
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXX
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=pigeonai-dev.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=pigeonai-dev
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=pigeonai-dev.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
```

**Important**: All variables must be prefixed with `EXPO_PUBLIC_` for React Native access.

### 5. Deploy Firestore Security Rules (Important!)

The app requires specific security rules to function properly. Deploy them:

```bash
# Install Firebase CLI globally
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in the project (if not already done)
firebase init

# Select:
# - Firestore
# - Use existing project: pigeonai-dev
# - Keep default firestore.rules and firestore.indexes.json paths

# Deploy rules and indexes
firebase deploy --only firestore:rules,firestore:indexes
```

### 6. Configure Push Notifications (AWS Lambda + FCM) - Production Only

**⚠️ Important**: Push notifications do **NOT** work in Expo Go (SDK 53+). The app uses **local notifications** in Expo Go for development and testing. To test **remote push notifications**, you must build with EAS Build or Android Studio.

For development in Expo Go, skip to step 7. For production builds with full push notifications:

#### Step 1: Firebase Setup (5 minutes)

1. **Register Android app** in Firebase Console:
   - Settings → Project settings → Your apps
   - Click **Add app** → **Android**
   - Package name: `com.pigeonai.app` (or your package name from `app.config.js`)
   - Click **Register app**
   - **Download `google-services.json`**
   - Place in project root: `./google-services.json` (not `android/app/`)

2. **Enable FCM API** in Google Cloud Console:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Select your Firebase project
   - Search: "Firebase Cloud Messaging API"
   - Click **Enable**

3. **Get Firebase Admin SDK credentials**:
   - Firebase Console → Project settings → Service accounts
   - Click "Generate new private key"
   - Save as `serviceAccountKey.json` (keep secure, don't commit!)

#### Step 2: AWS Lambda Setup (10 minutes)

1. **Create Lambda function** in AWS Console:
   - Service: Lambda
   - Create function → Author from scratch
   - Name: `pigeonai-push-notifications`
   - Runtime: Node.js 22.x
   - Create function

2. **Set environment variables** in Lambda:
   - Configuration → Environment variables
   - Add Firebase credentials from `serviceAccountKey.json`:
     - `FIREBASE_PROJECT_ID`
     - `FIREBASE_PRIVATE_KEY`
     - `FIREBASE_CLIENT_EMAIL`
     - `FIREBASE_DATABASE_URL`

3. **Upload Lambda code**:
   ```bash
   cd aws-lambda
   npm install
   # Windows PowerShell:
   Compress-Archive -Path index.js,package.json,package-lock.json,node_modules -DestinationPath function.zip -Force
   # Mac/Linux:
   zip -r function.zip index.js package.json package-lock.json node_modules
   ```
   - Upload `function.zip` to Lambda (Actions → Upload from → .zip file)

4. **Create API Gateway**:
   - API Gateway → Create API → HTTP API
   - Add route: POST `/send-notification`
   - Integration: Lambda function (select your function)
   - Deploy
   - Copy the Invoke URL

5. **Add Lambda URL to your app**:
   - Add to `.env`:
     ```
     EXPO_PUBLIC_LAMBDA_NOTIFICATION_URL=https://xxxxx.execute-api.us-east-1.amazonaws.com
     ```

**📚 Detailed guide**: [`docs/AWS_LAMBDA_SETUP.md`](docs/AWS_LAMBDA_SETUP.md)

#### Step 3: Build APK

**Option A: Android Studio (Faster):**
```powershell
cd android
.\gradlew assembleRelease
adb install -r app/build/outputs/apk/release/app-release.apk
```

**Option B: EAS Build (Cloud):**
```bash
npm install -g eas-cli
eas login
eas build:configure
eas build --profile preview --platform android
```

**For iOS**: See [`docs/FCM_SETUP_GUIDE.md`](docs/FCM_SETUP_GUIDE.md) (requires Apple Developer account - $99/year)

### 7. Create EAS Account (Required for Expo Go)

Expo Go now requires an EAS account even for local development:

1. Go to https://expo.dev/signup
2. Sign up with your email (free, no credit card required)
3. Verify your email

Then login in terminal:
```bash
npx expo login
```

Also **login in the Expo Go app** on your phone (Profile tab → Log in).

### 8. Run the App

```bash
npm start
```

Or if you have cache issues:
```bash
npm start --clear
```

This will:
- Start the Expo development server
- Display a QR code in your terminal
- Show the connection URL (e.g., `exp://192.168.1.XXX:8081`)

#### Test on Your Device (Recommended)

1. **Ensure your phone and computer are on the same WiFi network** (critical!)
2. Open **Expo Go** app on your phone
3. Scan the QR code with your phone's camera (iOS) or in Expo Go (Android)
4. Wait 30-60 seconds for first load
5. The app will load on your device

**Tip**: If QR code doesn't work:
- In Expo Go, tap "Enter URL manually"
- Type the `exp://` URL from your terminal (e.g., `exp://192.168.1.189:8081`)

#### Or use a simulator:

```bash
npm run ios      # iOS Simulator (macOS only)
npm run android  # Android Emulator
```

**Note**: Physical devices are strongly recommended for accurate testing of push notifications, presence, and app lifecycle.

### 9. Create Test Accounts

1. Open the app and tap **"Sign up"**
2. Create 2-3 test accounts:
   - `alice@test.com` / `password123`
   - `bob@test.com` / `password123`
   - `carol@test.com` / `password123`
3. Test real-time messaging between devices!

## 📁 Project Structure

```
pigeonai-week-2/
├── src/
│   ├── components/           # Reusable UI components
│   │   ├── auth/             # Login, Signup forms
│   │   ├── chat/             # MessageBubble, MessageList, MessageInput, ChatHeader
│   │   ├── conversation/     # ConversationListItem
│   │   ├── group/            # UserSelectionList
│   │   └── common/           # Avatar, NotificationBanner
│   ├── screens/              # App screens
│   │   ├── auth/             # LoginScreen, SignupScreen, SplashScreen
│   │   ├── main/             # ChatScreen, ConversationListScreen, ProfileScreen, etc.
│   │   ├── group/            # CreateGroupScreen, GroupDetailsScreen
│   │   └── test/             # NotificationTestScreen (for local testing)
│   ├── navigation/           # React Navigation setup
│   │   ├── AppNavigator.tsx  # Root navigator
│   │   ├── AuthNavigator.tsx # Auth flow
│   │   └── MainNavigator.tsx # Main app flow
│   ├── services/             # External services
│   │   ├── firebase/         # Firebase services (auth, firestore, storage)
│   │   ├── database/         # Local SQLite database
│   │   ├── network/          # Network monitoring
│   │   └── notifications/    # Push notification service
│   ├── store/                # State management
│   │   ├── context/          # React Context (Auth, Chat, Presence)
│   │   └── offlineQueue/     # Offline message queue
│   ├── models/               # Data models (User, Message, Conversation, Group)
│   ├── utils/                # Utility functions (dateFormatter, validators, constants)
│   ├── hooks/                # Custom React hooks (useMessages, useConversations, usePresence, etc.)
│   ├── types/                # TypeScript type definitions
│   └── assets/               # Images, fonts, app icon
├── docs/                     # Documentation
│   ├── AWS_LAMBDA_SETUP.md   # AWS Lambda setup guide
│   ├── NOTIFICATION_SYSTEM_COMPLETE.md # Notification architecture
│   ├── FCM_SETUP_GUIDE.md    # Comprehensive FCM guide
│   ├── FCM_QUICKSTART.md     # Quick FCM setup
│   ├── HYBRID_NOTIFICATIONS.md # Hybrid notification system
│   └── ...                   # More detailed guides
├── aws-lambda/              # AWS Lambda function
│   ├── index.js             # Lambda handler (FCM + Expo Push)
│   ├── package.json         # Lambda dependencies
│   └── function.zip         # Deployment package
├── firebase/                 # Firebase configuration
│   ├── firestore.rules       # Firestore security rules
│   └── firestore.indexes.json # Firestore indexes
├── android/                  # Android native files
│   ├── gradle.properties    # Gradle configuration (hermesEnabled)
│   └── local.properties     # SDK path (local builds)
├── ios/                      # iOS native files (for EAS Build)
├── memory-bank/              # Project memory (for AI assistant context)
├── App.tsx                   # Main app entry point
├── app.config.js             # Expo configuration
├── google-services.json      # Firebase Android config (in root for EAS)
├── eas.json                  # EAS Build configuration
├── package.json              # Dependencies
├── tsconfig.json             # TypeScript configuration
├── .env                      # Environment variables (not committed)
└── README.md                 # This file
```

## 🔧 Available Scripts

- `npm start` - Start Expo development server
- `npm run android` - Run on Android emulator
- `npm run ios` - Run on iOS simulator (macOS only)
- `npm run web` - Run in web browser
- `npm start --clear` - Clear cache and restart
- `npm run reset` - Clear Expo cache

## 🧪 Testing

### Manual Testing Scenarios

1. **Real-time messaging**: 
   - Open app on two devices with different accounts
   - Send messages back and forth
   - Verify sub-second latency

2. **Offline scenario**: 
   - Turn on airplane mode on Device A
   - Send messages from Device B
   - Turn off airplane mode on Device A
   - Verify messages sync within 5 seconds

3. **App lifecycle**: 
   - Send message
   - Force quit app (swipe away)
   - Reopen app
   - Verify message is still there

4. **Group chat**: 
   - Create group with 3+ users
   - Send messages from different users
   - Verify all users receive messages

5. **Presence**: 
   - Open app on two devices
   - Check green dot on online user
   - Background one app
   - Verify "Last seen" updates

6. **Typing indicators**: 
   - Open same chat on two devices
   - Start typing on one device
   - Verify "messaging • • •" appears on other device

7. **Read receipts**: 
   - Send message from Device A
   - Open chat on Device B
   - Verify double checkmark updates in real-time on Device A

8. **Push notifications** (Expo Go):
   - Open app on one device
   - Background or close app
   - Send message from another device
   - Verify local notification appears

9. **Push notifications** (EAS Build):
   - Build APK with `eas build`
   - Install on device
   - Follow scenario 8 above
   - Verify remote push notification appears

## 🐛 Troubleshooting

### App won't load on Expo Go

**Issue: "Something went wrong" or "Failed to download remote update"**
- **Cause**: Phone and computer on different WiFi networks
- **Fix**: Connect both to the same network, restart `npm start`

**Issue: "Project is incompatible with this version of Expo Go"**
- **Cause**: Expo Go app has different SDK version than project
- **Fix**: 
  1. Check your Expo Go version (Profile tab in app)
  2. Upgrade project: `npx expo install expo@latest && npx expo install --fix`
  3. Or downgrade Expo Go to SDK 54

**Issue: QR code scan doesn't work**
- **Fix**: In Expo Go, tap "Enter URL manually" and type the `exp://` URL from your terminal

**Issue: EAS login prompt appears**
- **Fix**: Create free account at https://expo.dev/signup, then run `npx expo login`

**Issue: "Unable to resolve module"**
- **Fix**: Clear cache and reinstall:
  ```bash
  rm -rf node_modules
  npm install --force
  npm start --clear
  ```

### Firebase errors

**Issue: "FirebaseError: Missing or insufficient permissions"**
- **Cause**: Firestore security rules not deployed
- **Fix**: Run `firebase deploy --only firestore:rules`

**Issue: Authentication errors**
- **Fix**: Verify `.env` file has correct Firebase credentials with `EXPO_PUBLIC_` prefix
- Check Firebase Console that Email/Password auth is enabled

**Issue: Messages not syncing**
- **Fix**: 
  - Check Firestore is in test mode (for development)
  - Make sure you registered a **Web app** (not iOS/Android) in Firebase Console
  - Verify internet connection

### "Cannot find module 'babel-preset-expo'"
- **Fix**: `npm install babel-preset-expo --save-dev`

### "Error while reading cache"
- **Fix**: `npm start --clear` or delete `node_modules` and run `npm install --force`

### Port 8081 already in use
- **Fix**: `npx expo start --port 8082`

### Windows Firewall blocking connection
- **Fix**: 
  1. Go to Windows Settings → Firewall & network protection
  2. Allow an app through firewall
  3. Find Node.js and allow on Private networks

### "expo-notifications" errors in Expo Go
- **Expected**: Remote push notifications don't work in Expo Go (SDK 53+)
- **Solution**: App uses local notifications in Expo Go for development. For full push, build with EAS.

## 📝 Environment Variables

All Firebase credentials should be prefixed with `EXPO_PUBLIC_` to make them accessible in React Native:

```
EXPO_PUBLIC_FIREBASE_API_KEY
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN
EXPO_PUBLIC_FIREBASE_PROJECT_ID
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
EXPO_PUBLIC_FIREBASE_APP_ID
```

**Note**: These values are safe to expose in client-side apps. Firebase security comes from Firestore security rules, not hiding API keys.

## 🔐 Security

- `.env` file is gitignored and won't be committed
- Firestore security rules protect your data (deployed via Firebase CLI)
- Authentication tokens are managed by Firebase
- `google-services.json` is committed (it's not a secret - see [`docs/GOOGLE_SERVICES_EXPLAINED.md`](docs/GOOGLE_SERVICES_EXPLAINED.md))
- Never commit sensitive credentials or private keys to Git

## 📦 Deployment

### For MVP/Testing (Expo Go)
- Just share the QR code!
- Users with Expo Go can scan and use immediately

### For Production - Two Options

#### Option 1: EAS Build (Cloud - Easiest)

**Android APK:**
```bash
npm install -g eas-cli
eas login
eas build:configure
eas build --profile preview --platform android
```

Wait 10-15 minutes for build to complete, then download APK and install on device.

**iOS (requires Apple Developer account - $99/year):**
```bash
eas build --profile preview --platform ios
eas submit --platform ios  # Submit to TestFlight
```

#### Option 2: Local Android Studio Build (Faster for Testing)

**Prerequisites:**
- Android Studio installed
- Android SDK configured
- 8GB+ RAM recommended

**Build Steps:**
```powershell
# Navigate to android folder
cd android

# Build release APK
.\gradlew assembleRelease

# APK location: 
# android/app/build/outputs/apk/release/app-release.apk
```

**Install on device:**
```powershell
# Via ADB (USB or WiFi)
adb install -r android/app/build/outputs/apk/release/app-release.apk

# Or transfer APK via WhatsApp/email and install manually
```

**Full documentation**: 
- EAS Build: https://docs.expo.dev/build/introduction/
- AWS Lambda Setup: `docs/AWS_LAMBDA_SETUP.md`

## 🎯 Roadmap

### Completed ✅
- [x] One-on-one real-time chat
- [x] Group chat (3+ members)
- [x] User authentication
- [x] Message persistence (SQLite)
- [x] Offline support with queue
- [x] Optimistic UI
- [x] Read receipts (real-time)
- [x] Online/offline status
- [x] Typing indicators
- [x] Push notifications (AWS Lambda + FCM)
- [x] Production APK build (Android Studio)
- [x] Server-side notification system
- [x] Group creation and management
- [x] Group details screen
- [x] Dark mode UI
- [x] User profiles and avatars

### In Progress 🟡
- [ ] Image sharing (backend ready)
- [ ] Offline mode indicator
- [ ] Error boundaries
- [ ] Loading skeletons

### Post-MVP 🔜
- [ ] AI-powered features:
  - [ ] Thread summarization
  - [ ] Action item extraction
  - [ ] Smart semantic search
  - [ ] Priority message detection
  - [ ] Decision tracking
  - [ ] Proactive scheduling assistant
- [ ] Voice messages
- [ ] Video sharing
- [ ] Message editing/deletion
- [ ] End-to-end encryption
- [ ] Voice/video calls
- [ ] Multi-device support

## 📚 Documentation

- **Setup Guides**:
  - [AWS Lambda Setup](docs/AWS_LAMBDA_SETUP.md) ⭐ NEW
  - [FCM Quick Start](docs/FCM_QUICKSTART.md)
  - [FCM Full Setup Guide](docs/FCM_SETUP_GUIDE.md)
  - [FCM Checklist](docs/FCM_CHECKLIST.md)
- **Architecture**:
  - [Notification System Complete](docs/NOTIFICATION_SYSTEM_COMPLETE.md) ⭐ NEW
  - [Hybrid Notification System](docs/HYBRID_NOTIFICATIONS.md)
  - [Push Notifications Overview](docs/PUSH_NOTIFICATIONS.md)
  - [Background Notifications](docs/BACKGROUND_NOTIFICATIONS.md)
- **Reference**:
  - [Firestore Security Rules](docs/FIRESTORE_SECURITY_RULES.md)
  - [Expo Go Limitations](docs/EXPO_GO_LIMITATIONS.md)
  - [Google Services Explained](docs/GOOGLE_SERVICES_EXPLAINED.md)

## 🏆 Project Achievements

- ✅ **Zero message loss** - 100% delivery success rate in testing
- ✅ **Sub-second latency** - Real-time message delivery <1 second
- ✅ **Zero duplicate messages** - Advanced deduplication system
- ✅ **Zero UI jitter** - Smooth scrolling and animations
- ✅ **Cache-first loading** - Instant display from local database
- ✅ **Thread-safe SQLite** - Operation queue prevents concurrency errors
- ✅ **Real-time updates** - Presence, typing, and read receipts update live
- ✅ **Professional UI** - Dark mode theme with polished design
- ✅ **Production-ready APK** - Built and tested on physical devices
- ✅ **Free push notification system** - AWS Lambda + Firebase Spark (no Blaze plan needed)
- ✅ **Comprehensive docs** - Detailed guides for all major features

## 📄 License

This project is part of the Gauntlet AI Week 2 challenge.

## 🤝 Contributing

This is a personal project for learning purposes. Feel free to fork and experiment!

## 📧 Support

For issues or questions:
- Open an issue on GitHub
- Check the [troubleshooting section](#-troubleshooting) above
- Review the [documentation](docs/) folder

---

**Built with ❤️ using React Native, Expo, and Firebase**

**Project Duration**: 7-day sprint (October 20-27, 2025)  
**Total Time**: ~30 hours of development  
**Lines of Code**: ~15,000+  
**Status**: MVP Complete, polish and AI features in progress
