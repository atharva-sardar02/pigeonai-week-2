# Hybrid Notification System - Developer Guide

**Last Updated**: October 21, 2025  
**Status**: ✅ Implemented

---

## 🎯 **Overview**

The Pigeon AI app uses a **hybrid notification system** that automatically switches between:
- **Local notifications** (Expo Go / development)
- **Remote push notifications** (EAS Build / production)

This allows full cross-device notification testing in Expo Go without requiring EAS Build!

---

## 🏗️ **Architecture**

### **How It Works**

```
┌─────────────────────────────────────────────────────────────┐
│                    User A sends message                      │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
         ┌─────────────────────┐
         │  Save to Firestore  │
         └─────────┬───────────┘
                   │
      ┌────────────┴────────────┐
      │                         │
      ▼                         ▼
┌─────────────┐         ┌─────────────┐
│  User B App │         │  User C App │
│ (Device 2)  │         │ (Device 3)  │
└──────┬──────┘         └──────┬──────┘
       │                       │
       ▼                       ▼
  Is Expo Go?            Is Expo Go?
       │                       │
   ┌───┴───┐               ┌───┴───┐
   │  YES  │               │   NO  │
   └───┬───┘               └───┬───┘
       │                       │
       ▼                       ▼
┌──────────────┐      ┌──────────────┐
│ Firestore    │      │ Remote Push  │
│ Listener     │      │ Notification │
│ →            │      │ (Expo Push)  │
│ Local        │      │              │
│ Notification │      │              │
└──────────────┘      └──────────────┘
```

---

## 🔧 **Implementation**

### **1. Detection Logic**

**File**: `src/services/notifications/localNotificationHelper.ts`

```typescript
import Constants from 'expo-constants';

export const isExpoGo = (): boolean => {
  return Constants.appOwnership === 'expo';
};

export const shouldUseLocalNotifications = (): boolean => {
  return isExpoGo();
};
```

**How it works:**
- `Constants.appOwnership === 'expo'` → Running in Expo Go
- `Constants.appOwnership === 'standalone'` → Running in EAS Build

---

### **2. Firestore Listener → Local Notification**

**File**: `src/hooks/useMessages.ts`

```typescript
// When new messages arrive from Firestore
const newMessages = firestoreMessages.filter(msg => {
  return !existingIds.has(msg.id);
});

// HYBRID: Trigger local notifications (Expo Go only)
if (shouldUseLocalNotifications() && user) {
  newMessages.forEach(async (msg) => {
    if (msg.senderId !== user.uid) {
      const senderProfile = await getUserProfile(msg.senderId);
      const senderName = senderProfile?.displayName || 'Someone';
      
      await triggerLocalNotification(
        senderName,
        msg.content,
        conversationId,
        msg.senderId
      );
    }
  });
}
```

**What happens:**
1. ✅ Firestore listener detects new message
2. ✅ Checks if message is from someone else
3. ✅ Fetches sender's display name
4. ✅ Triggers local notification (Expo Go only!)
5. ✅ Skips if running in EAS Build (remote push handles it)

---

### **3. Remote Push (EAS Build only)**

**File**: `src/screens/main/ChatScreen.tsx`

```typescript
// Send remote push notification (only in EAS Build)
if (!shouldUseLocalNotifications()) {
  console.log('📱 Sending remote push notification');
  NotificationService.sendPushNotificationToUsers(
    recipients,
    notificationTitle,
    notificationBody,
    { screen: 'Chat', conversationId, senderId }
  );
} else {
  console.log('🔔 Skipping remote push - using local notifications');
}
```

**What happens:**
1. ✅ Message sent to Firestore
2. ✅ If in Expo Go → Skip remote push (Firestore listener handles it)
3. ✅ If in EAS Build → Send remote push (for when app is closed)

---

## 📊 **Feature Comparison**

| Feature | Expo Go (Local) | EAS Build (Remote) |
|---------|----------------|-------------------|
| **Cross-device notifications** | ✅ Yes | ✅ Yes |
| **When app is open** | ✅ Yes | ✅ Yes |
| **When app is backgrounded** | ✅ Yes | ✅ Yes |
| **When app is killed** | ❌ No | ✅ Yes |
| **Notification sound** | ✅ Yes | ✅ Yes |
| **Navigation on tap** | ✅ Yes | ✅ Yes |
| **Multiple devices** | ✅ Yes | ✅ Yes |

---

## 🧪 **Testing**

### **Test in Expo Go (Local Notifications)**

1. **Start app on Device A**:
   ```bash
   npm start
   ```

2. **Start app on Device B**:
   - Open Expo Go
   - Scan QR code
   - Login as different user

3. **Send message from Device A**:
   - Type and send message
   - Watch Device B!

4. **Expected result**:
   ```
   Device A logs:
   - 🔔 Skipping remote push - using local notifications (Expo Go mode)
   
   Device B logs:
   - 📨 Firestore listener fired: 1 messages
   - Found 1 new messages to add
   - 🔔 Triggering local notification from John Doe
   - ✅ Local notification triggered successfully
   
   Device B screen:
   - Notification appears at top!
   - Tap to open chat ✅
   ```

---

### **Test in EAS Build (Remote Push)**

1. **Build app**:
   ```bash
   eas build --profile development --platform android
   ```

2. **Install on devices**

3. **Send message**

4. **Expected result**:
   ```
   Device A logs:
   - 📱 Sending remote push notification (EAS Build mode)
   - ✅ Push notifications sent to 1 users
   
   Device B (even if killed):
   - Notification appears via Expo Push! ✅
   ```

---

## 🎯 **Behavior Matrix**

| Scenario | Expo Go | EAS Build |
|----------|---------|-----------|
| **User A sends message** | Skip remote push | Send remote push |
| **User B (app open)** | Firestore → Local notif | Remote push received |
| **User B (app background)** | Firestore → Local notif | Remote push received |
| **User B (app killed)** | ❌ No notification | ✅ Remote push received |

---

## 💡 **Advantages**

### **1. Seamless Development**
- ✅ Test notifications in Expo Go instantly
- ✅ No need to build with EAS every time
- ✅ Faster development cycle

### **2. Cross-Device Testing**
- ✅ Test with multiple devices
- ✅ Real user experience
- ✅ Works exactly like production (when app is open)

### **3. Production-Ready**
- ✅ Automatically switches to remote push in EAS Build
- ✅ No code changes needed
- ✅ Best of both worlds

### **4. No Infrastructure Changes**
- ✅ Keeps all existing remote push code
- ✅ FCM configuration still used
- ✅ Ready for production immediately

---

## 🔍 **How to Tell Which Mode You're In**

### **Check Console Logs**

**Expo Go (Local Notifications)**:
```
🔔 Skipping remote push - using local notifications (Expo Go mode)
🔔 Triggering local notification from John Doe
✅ Local notification triggered successfully
```

**EAS Build (Remote Push)**:
```
📱 Sending remote push notification (EAS Build mode)
✅ Push notifications sent to 1 users
📱 Running in EAS Build - remote push notifications will handle this
```

---

## 🚀 **Usage for Developers**

### **Normal Development (Expo Go)**

Just work as usual! Notifications will automatically work:

```bash
npm start
# Open on multiple devices
# Send messages
# See notifications! ✅
```

### **Production Testing (EAS Build)**

When ready to test full push (with app killed):

```bash
eas build --profile development --platform android
# Install APK
# Test with app killed ✅
```

---

## 📝 **Code Files**

| File | Purpose |
|------|---------|
| `localNotificationHelper.ts` | Detection & local notification logic |
| `useMessages.ts` | Firestore listener → Local notifications |
| `ChatScreen.tsx` | Conditional remote push sending |
| `notificationService.ts` | Remote push infrastructure (unchanged) |

---

## ⚙️ **Configuration**

No configuration needed! The system automatically detects the environment.

**Environment Variables** (already set):
- `EXPO_PUBLIC_FIREBASE_*` - Firebase config
- `google-services.json` - Android FCM config
- `GoogleService-Info.plist` - iOS FCM config

---

## 🐛 **Troubleshooting**

### **Issue: No notifications in Expo Go**

**Check:**
1. Both devices are logged in as different users
2. Firestore listener is active (check console logs)
3. Messages are being saved to Firestore
4. Notification permissions granted

**Solution:**
```typescript
// Verify permission
const { status } = await Notifications.getPermissionsAsync();
console.log('Permission status:', status); // Should be 'granted'
```

### **Issue: Notifications in EAS Build not working**

**Check:**
1. `google-services.json` is in `android/app/`
2. FCM API is enabled in Google Cloud Console
3. Device token is saved to Firestore
4. Remote push logs show success

---

## 📚 **Additional Resources**

- [Expo Push Notifications](https://docs.expo.dev/push-notifications/overview/)
- [Local Notifications](https://docs.expo.dev/versions/latest/sdk/notifications/)
- [EAS Build](https://docs.expo.dev/build/introduction/)
- [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging)

---

## ✅ **Summary**

**Hybrid notification system gives you:**
- ✅ Full notification testing in Expo Go
- ✅ Cross-device notifications work
- ✅ No EAS Build required for development
- ✅ Automatic switch to remote push in production
- ✅ Best developer experience + best user experience

**One codebase, two modes, zero compromises!** 🎉

