# Pigeon AI - Real-Time Messaging App

A cross-platform messaging application built with React Native, Expo, and Firebase, featuring real-time chat, group messaging, and offline support.

## 📱 Features (MVP)

- ✅ **One-on-One Chat** - Real-time messaging between users
- ✅ **Group Chat** - Create and participate in group conversations (3+ users)
- ✅ **User Authentication** - Email/password signup and login
- ✅ **Message Persistence** - Messages survive app restarts
- ✅ **Offline Support** - Queue messages when offline, sync when reconnected
- ✅ **Optimistic UI** - Messages appear instantly before server confirmation
- ✅ **Read Receipts** - See when messages are delivered and read
- ✅ **Online/Offline Status** - Real-time presence indicators
- ✅ **Typing Indicators** - See when someone is typing
- ✅ **Image Sharing** - Send and receive images
- ✅ **Push Notifications** - Get notified of new messages

## 🛠️ Tech Stack

### Frontend
- **React Native 0.81.4** - Cross-platform mobile framework
- **Expo SDK 54.0.0** - Development platform and tooling
- **React 19.1.0** - UI library
- **TypeScript 5.9.2** - Type safety
- **React Navigation 7.x** - Navigation
- **Expo SQLite** - Local persistence
- **Firebase JS SDK 12.4.0** - Firebase client (Expo Go compatible)

### Backend
- **Firebase Authentication** - User authentication
- **Firebase Firestore** - Real-time database (us-east4 region)
- **Firebase Cloud Messaging** - Push notifications
- **Firebase Cloud Functions** - Serverless backend (for AI features - post-MVP)

## 📋 Prerequisites

Before you begin, ensure you have:

- **Node.js** 18+ installed
- **npm** or **yarn** package manager
- **Expo Go app** installed on your iOS or Android device
  - Download from [App Store](https://apps.apple.com/app/expo-go/id982107779) (iOS)
  - Download from [Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent) (Android)
- **Firebase account** (free tier is sufficient)

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

### 3. Set Up Firebase

#### Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Project name: `pigeonai-dev`
4. Disable Google Analytics (optional)

#### Enable Services
1. **Authentication**: Enable Email/Password sign-in
2. **Firestore Database**: Create database in test mode, location: `us-east4`
3. **Cloud Messaging**: Auto-enabled

#### Register Web App
1. Project Overview → Add app → Web (</> icon)
2. App nickname: `Pigeon AI Web`
3. Don't check "Firebase Hosting"
4. Copy the `firebaseConfig` object

### 4. Configure Environment Variables

Create a `.env` file in the project root:

```bash
cp env.example .env
```

Fill in your Firebase configuration:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key_here
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=pigeonai-dev.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=pigeonai-dev
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=pigeonai-dev.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 5. Configure Push Notifications (FCM)

**⚠️ Important**: Push notifications do NOT work in Expo Go (SDK 53+). You must build with EAS Build to test notifications.

#### Quick Setup (5 minutes):

1. **Register Android app in Firebase Console**:
   - Go to [Firebase Console](https://console.firebase.google.com/) → Your project
   - **Settings** → **Project settings** → **Your apps**
   - Click **Add app** → **Android**
   - Package name: `com.pigeonai.app`
   - Click **Register app**
   - **Download `google-services.json`**
   - Place in: `android/app/google-services.json`

2. **Enable FCM API**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Select your Firebase project
   - Search: "Firebase Cloud Messaging API"
   - Click **Enable**

3. **Build with EAS** (to test notifications):
   ```bash
   npm install -g eas-cli
   eas login
   eas build:configure
   eas build --profile development --platform android
   ```

**📚 Detailed guides**:
- Quick: `docs/FCM_QUICKSTART.md`
- Full: `docs/FCM_SETUP_GUIDE.md`
- Checklist: `docs/FCM_CHECKLIST.md`

**For iOS**: See `docs/FCM_SETUP_GUIDE.md` (requires Apple Developer account - $99/year)

### 6. Create Free EAS Account (Required for Expo Go)

Expo Go now requires an EAS account even for local development:

1. Go to https://expo.dev/signup
2. Sign up with your email (free, no credit card required)
3. Verify your email

Then login in terminal:
```bash
npx expo login
```

Also login in the Expo Go app on your phone (Profile tab).

### 7. Run the App

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
1. Ensure your **phone and computer are on the same WiFi network**
2. Open **Expo Go** app on your phone
3. Scan the QR code
4. Wait 30-60 seconds for first load
5. The app will load on your device

**Tip**: If QR code doesn't work, try entering the URL manually in Expo Go (e.g., `exp://192.168.1.189:8081`)

#### Or use a simulator:
```bash
npm run ios      # iOS Simulator (macOS only)
npm run android  # Android Emulator
```

**Note**: Simulators don't accurately represent performance or app lifecycle. Use physical devices for testing.

## 📁 Project Structure

```
pigeonai-week-2/
├── src/
│   ├── components/       # Reusable UI components
│   ├── screens/          # App screens (Login, Chat, Profile, etc.)
│   ├── navigation/       # React Navigation setup
│   ├── services/         # Firebase services
│   │   └── firebase/     # Firebase configuration and services
│   ├── store/            # React Context and state management
│   ├── models/           # Data models
│   ├── utils/            # Utility functions
│   ├── hooks/            # Custom React hooks
│   ├── types/            # TypeScript type definitions
│   └── assets/           # Images, fonts, etc.
├── App.tsx               # Main app entry point
├── app.config.js         # Expo configuration
├── package.json          # Dependencies
└── .env                  # Environment variables (not committed)
```

## 🔧 Available Scripts

- `npm start` - Start Expo development server
- `npm run android` - Run on Android emulator
- `npm run ios` - Run on iOS simulator (macOS only)
- `npm run web` - Run in web browser
- `npm run reset` - Clear Expo cache and restart

## 🧪 Testing

### Manual Testing Scenarios
1. **Real-time messaging**: Send messages between two devices
2. **Offline scenario**: Turn on airplane mode, send message, turn off airplane mode
3. **App lifecycle**: Send message, force quit app, reopen
4. **Group chat**: Create group with 3+ users, send messages
5. **Image sharing**: Send and receive images

## 🐛 Troubleshooting

### App won't load on Expo Go

**Issue: "Something went wrong" or "Failed to download remote update"**
- **Cause**: Phone and computer on different WiFi networks
- **Fix**: Connect both to the same network, restart `npm start`

**Issue: "Project is incompatible with this version of Expo Go"**
- **Cause**: Expo Go app has different SDK version than project
- **Fix**: Check Expo Go version, upgrade project: `npx expo install expo@latest && npx expo install --fix`

**Issue: QR code scan doesn't work**
- **Fix**: In Expo Go, tap "Enter URL manually" and type the exp:// URL from your terminal

**Issue: EAS login prompt appears**
- **Fix**: Create free account at expo.dev/signup, then run `npx expo login`

### Firebase errors
- Verify `.env` file has correct Firebase credentials with `EXPO_PUBLIC_` prefix
- Check Firebase Console that Authentication and Firestore are enabled
- Ensure Firestore is in test mode (for development)
- Make sure you registered a **Web app** (not iOS/Android) in Firebase Console

### "Cannot find module 'babel-preset-expo'"
- **Fix**: `npm install babel-preset-expo --save-dev`

### "Error while reading cache"
- **Fix**: `npm start --clear` or delete `node_modules` and run `npm install --force`

### Port 8081 already in use
- **Fix**: `npx expo start --port 8082`

### Windows Firewall blocking connection
- **Fix**: Allow Node.js through Windows Firewall (Settings → Firewall → Allow an app)

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
- Firestore security rules protect your data
- Authentication tokens are managed by Firebase
- Never commit sensitive credentials to Git

## 📦 Deployment

### For MVP/Testing
- **Expo Go**: Just share the QR code (already done!)

### For Production
- **iOS**: Build with EAS and deploy to TestFlight
- **Android**: Build APK with EAS

```bash
npm install -g eas-cli
eas build --platform ios
eas build --platform android
```

## 🎯 Roadmap

### Post-MVP Features
- [ ] AI-powered features (summarization, translation, smart replies)
- [ ] Voice messages
- [ ] Video sharing
- [ ] Message editing/deletion
- [ ] End-to-end encryption
- [ ] Voice/video calls

## 📄 License

This project is part of the Gauntlet AI Week 2 challenge.

## 🤝 Contributing

This is a personal project for learning purposes. Feel free to fork and experiment!

## 📧 Support

For issues or questions, please open an issue on GitHub.

---

**Built with ❤️ using React Native, Expo, and Firebase**

