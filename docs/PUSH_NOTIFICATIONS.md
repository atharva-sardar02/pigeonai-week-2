# Push Notifications - Implementation Guide

**Current Implementation**: Expo Push Notifications  
**Last Updated**: October 21, 2025  
**Status**: ✅ Active (MVP)

---

## Current Setup: Expo Push Notifications

### Why Expo Push?

For the MVP and initial launch, we're using **Expo Push Notification service** because:

- ✅ **Fast setup**: 30 minutes vs 3+ hours for direct FCM
- ✅ **Cross-platform**: Single implementation for iOS + Android
- ✅ **No native code**: Works with Expo managed workflow
- ✅ **Production-ready**: Used by thousands of apps
- ✅ **Free tier**: Suitable for MVP and growth
- ✅ **Reliable**: Built on top of FCM (Android) and APNs (iOS)

### How It Works

```
Your App → Expo Push Service → FCM (Android) / APNs (iOS) → User Device
```

Expo handles the complexity of FCM/APNs integration automatically.

---

## Current Architecture

### Files Created

```
src/services/notifications/
├── notificationService.ts       # Core notification logic
└── README.md                    # Service documentation

app.config.js                    # Expo notification plugin config
```

### Configuration

**File: `app.config.js`**
```javascript
plugins: [
  [
    'expo-notifications',
    {
      icon: './assets/icon.png',
      color: '#3B82F6',
      sounds: [],
    }
  ]
],
android: {
  permissions: [
    'RECEIVE_BOOT_COMPLETED',
    'VIBRATE',
    'android.permission.POST_NOTIFICATIONS'
  ],
}
```

### Key Functions

**`notificationService.ts`**
- `requestPermissions()` - Ask user for notification permission
- `getDeviceToken()` - Get Expo Push Token
- `registerForPushNotifications()` - Complete registration flow
- `handleNotification(notification)` - Handle incoming notifications
- `scheduleNotification(title, body, data)` - Schedule local notifications

### Data Flow

1. **User logs in** → Request notification permission
2. **Permission granted** → Get Expo Push Token
3. **Save token** → Store in Firestore (`user.fcmTokens[]`)
4. **Message sent** → Backend sends push via Expo API
5. **User receives** → Notification appears on device

---

## Deployment Options

### Option 1: EAS Build (Recommended)

**What it is**: Expo's cloud build service that creates standalone APK/IPA files.

**Steps**:
```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure build
eas build:configure

# Build for Android
eas build --platform android --profile production

# Build for iOS
eas build --platform ios --profile production

# Submit to stores
eas submit --platform android
eas submit --platform ios
```

**Cost**: 
- Free tier: Limited builds per month
- Paid: $29/month for unlimited builds

**Notifications**: ✅ Expo Push continues to work seamlessly

### Option 2: Expo Go (Development Only)

**What it is**: The Expo Go app on user devices.

**Use case**: Development and testing only (not for production)

**Notifications**: ✅ Works perfectly for testing

---

## Migration to Direct FCM (Future)

If you need to migrate to direct Firebase Cloud Messaging in the future, here's the plan:

### When to Migrate?

Consider migrating if you need:
- Custom notification sounds/vibrations beyond Expo's capabilities
- Direct FCM features (topics, A/B testing)
- Complete control over notification delivery
- Integration with other Firebase features (Analytics, Remote Config)

### Migration Steps

#### 1. Install Firebase Native Modules

```bash
# Remove Expo notifications
npm uninstall expo-notifications

# Install React Native Firebase
npm install @react-native-firebase/app @react-native-firebase/messaging

# Eject from Expo (if needed)
npx expo prebuild
```

#### 2. Add Firebase Config Files

**Android**: `android/app/google-services.json`
**iOS**: `ios/GoogleService-Info.plist`

Download these from Firebase Console → Project Settings → Your Apps

#### 3. Update Notification Service

Replace `expo-notifications` imports with `@react-native-firebase/messaging`:

```typescript
// Old (Expo)
import * as Notifications from 'expo-notifications';

// New (Direct FCM)
import messaging from '@react-native-firebase/messaging';
```

#### 4. Update Token Registration

```typescript
// Old (Expo Push Token)
const token = (await Notifications.getExpoPushTokenAsync()).data;

// New (FCM Token)
const token = await messaging().getToken();
```

#### 5. Update Backend Sending Logic

```typescript
// Old (Expo Push API)
await fetch('https://exp.host/--/api/v2/push/send', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    to: expoPushToken,
    title: 'New message',
    body: 'You have a new message',
  }),
});

// New (Firebase Admin SDK)
import * as admin from 'firebase-admin';

await admin.messaging().send({
  token: fcmToken,
  notification: {
    title: 'New message',
    body: 'You have a new message',
  },
});
```

#### 6. Update iOS Configuration

Add to `ios/YourApp/AppDelegate.mm`:
```objective-c
#import <Firebase.h>

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  [FIRApp configure];
  return YES;
}
```

#### 7. Testing

- Test on both iOS and Android devices
- Verify foreground notifications
- Verify background notifications
- Test notification tap handling

### Estimated Migration Time

- **Expo to Bare React Native**: 2-3 hours
- **Notification service refactor**: 2-3 hours
- **Testing**: 2-3 hours
- **Total**: ~1 day of development

---

## Cost Comparison

### Expo Push Notifications

| Feature | Free Tier | Paid Tier |
|---------|-----------|-----------|
| Monthly notifications | Unlimited | Unlimited |
| Priority delivery | Standard | High priority |
| Cost | $0 | ~$29/month (EAS subscription) |

### Direct FCM

| Feature | Cost |
|---------|------|
| All notifications | **FREE** (unlimited) |
| All features | **FREE** |
| Backend hosting | Pay for Cloud Functions usage |

**Note**: FCM itself is always free. You only pay for the infrastructure (Cloud Functions, server hosting) that sends the notifications.

---

## Best Practices (Current Implementation)

### 1. Permission Timing
```typescript
// ✅ Good: Request after user sees value
// Ask after successful login, not immediately on app open

// ❌ Bad: Request on app launch
```

### 2. Token Management
```typescript
// Store tokens in array for multi-device support
user.fcmTokens = ['token1', 'token2', 'token3'];

// Remove token on logout
await removeDeviceToken(currentToken);
```

### 3. Notification Content
```typescript
// ✅ Good: Clear, actionable
{
  title: "Sarah",
  body: "Hey, are we still meeting today?",
  data: { conversationId: "123", senderId: "456" }
}

// ❌ Bad: Vague
{
  title: "New message",
  body: "You have a notification"
}
```

### 4. Handling Taps
```typescript
// Always include data for navigation
notification.data = {
  screen: 'Chat',
  conversationId: '123',
  userId: '456'
};

// Handle in app
Notifications.addNotificationResponseReceivedListener(response => {
  const { screen, conversationId } = response.notification.request.content.data;
  navigation.navigate(screen, { conversationId });
});
```

---

## Testing Checklist

- [ ] Request notification permission (iOS & Android)
- [ ] Get Expo Push Token successfully
- [ ] Save token to Firestore
- [ ] Send test notification from Expo Push Tool
- [ ] Receive notification in foreground (app open)
- [ ] Receive notification in background (app closed)
- [ ] Tap notification → opens correct chat
- [ ] Notification shows sender name and message preview
- [ ] Multiple devices receive notifications
- [ ] Token removed on logout

---

## Troubleshooting

### No Notifications Received

**Check**:
1. Token saved in Firestore? (`user.fcmTokens` array)
2. Permission granted? (iOS Settings → App → Notifications)
3. Expo Push Token format correct? (starts with `ExponentPushToken[...]`)
4. Using Expo Go or EAS Build? (not bare React Native)
5. Network connectivity on device?

### iOS Permission Issues

**Solution**:
```typescript
// Request permission explicitly
const { status } = await Notifications.requestPermissionsAsync();
if (status !== 'granted') {
  alert('Please enable notifications in Settings');
}
```

### Android Notification Channel Issues

**Solution**:
```typescript
// Create notification channel for Android
await Notifications.setNotificationChannelAsync('default', {
  name: 'default',
  importance: Notifications.AndroidImportance.MAX,
  vibrationPattern: [0, 250, 250, 250],
  lightColor: '#3B82F6',
});
```

---

## Resources

### Expo Documentation
- [Expo Push Notifications](https://docs.expo.dev/push-notifications/overview/)
- [Expo Notifications API](https://docs.expo.dev/versions/latest/sdk/notifications/)
- [EAS Build](https://docs.expo.dev/build/introduction/)

### Firebase Documentation
- [FCM Overview](https://firebase.google.com/docs/cloud-messaging)
- [React Native Firebase](https://rnfirebase.io/)

### Testing Tools
- [Expo Push Notification Tool](https://expo.dev/notifications)
- Send test notifications with your Expo Push Token

---

## Decision Log

### October 21, 2025 - Initial Implementation
**Decision**: Use Expo Push Notifications  
**Rationale**: 
- 1-week MVP deadline requires fast implementation
- Expo Push is production-ready and reliable
- Can migrate to direct FCM later if needed (~1 day effort)
- Free tier sufficient for MVP and initial growth

**Team**: Agreed to document migration path for future flexibility

---

## Contact & Support

**Current Implementation**: Expo Push Notifications  
**Migration Support**: See "Migration to Direct FCM" section above  
**Questions**: Refer to Expo documentation or Firebase documentation


