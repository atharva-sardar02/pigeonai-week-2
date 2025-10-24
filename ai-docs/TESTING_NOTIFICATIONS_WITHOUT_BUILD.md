# Testing Push Notifications Without EAS Build

**Goal**: Verify notification logic works without building the app

---

## ✅ **What We Can Test in Expo Go**

### 1. **Permission Request Flow**
```javascript
// In your app, this will work:
import * as Notifications from 'expo-notifications';

// Request permissions (works in Expo Go)
const { status } = await Notifications.requestPermissionsAsync();
console.log('Permission status:', status); // ✅ Will show 'granted' or 'denied'
```

### 2. **Token Registration Attempt**
```javascript
// This will attempt to get token (fails gracefully in Expo Go)
try {
  const token = await Notifications.getExpoPushTokenAsync();
  console.log('Token:', token.data); // ❌ Will fail in Expo Go, but code is correct
} catch (error) {
  console.log('Expected error in Expo Go:', error.message);
}
```

### 3. **Local Notifications** (✅ Work in Expo Go!)
```javascript
// Schedule a local notification (WORKS in Expo Go!)
await Notifications.scheduleNotificationAsync({
  content: {
    title: "Test Notification",
    body: "This is a local notification - it works!",
    data: { screen: 'Chat', conversationId: '123' }
  },
  trigger: { seconds: 2 }
});
```

### 4. **Notification Handler Setup**
```javascript
// Set up foreground notification handler (works in Expo Go)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});
```

### 5. **Navigation Logic**
```javascript
// Test navigation when tapping notification
Notifications.addNotificationResponseReceivedListener(response => {
  const { conversationId } = response.notification.request.content.data;
  console.log('Would navigate to:', conversationId); // ✅ Will log correctly
  // navigation.navigate('Chat', { conversationId }); // ✅ Works
});
```

---

## 🧪 **Testing Strategy (No Build Required)**

### **Step 1: Test Local Notifications**

Add this test button to your app temporarily:

```typescript
// In your ChatScreen or ProfileScreen, add a test button:

import * as Notifications from 'expo-notifications';

const testLocalNotification = async () => {
  console.log('📱 Testing local notification...');
  
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Test Message from John",
      body: "Hey, are we still meeting today?",
      data: { 
        screen: 'Chat', 
        conversationId: 'test-123',
        senderId: 'test-user-456'
      }
    },
    trigger: { seconds: 2 } // Show after 2 seconds
  });
  
  console.log('✅ Local notification scheduled!');
};

// In your JSX:
<Button title="Test Local Notification" onPress={testLocalNotification} />
```

### **Step 2: Verify the Flow**

1. **Press the test button**
2. **Wait 2 seconds**
3. **Notification appears!** ✅
4. **Tap the notification**
5. **App navigates to chat screen** ✅
6. **Check logs for correct data** ✅

### **Step 3: Test Notification Banner**

Your custom `NotificationBanner` component will work with local notifications:

```typescript
// Test the banner:
const testNotificationBanner = () => {
  setNotificationVisible(true);
  setNotificationTitle('John Doe');
  setNotificationMessage('Hey, are we still meeting today?');
  setNotificationData({ conversationId: 'test-123' });
};

<Button title="Test Notification Banner" onPress={testNotificationBanner} />
```

---

## 📊 **What Each Method Tests**

| Feature | Local Notification | Remote (Expo Push) | Requires Build? |
|---------|-------------------|-------------------|-----------------|
| Permission request | ✅ | ✅ | ❌ No |
| Token generation | ❌ (fails) | ✅ | ✅ Yes |
| Notification display | ✅ | ✅ | ❌ No (local) / ✅ Yes (remote) |
| Notification tap | ✅ | ✅ | ❌ No |
| Navigation logic | ✅ | ✅ | ❌ No |
| Custom banner | ✅ | ✅ | ❌ No |
| Background handling | ✅ | ✅ | ❌ No (local) / ✅ Yes (remote) |

---

## 🎯 **Recommended Test Plan (No Build)**

### **Test 1: Local Notification Display**
```typescript
await Notifications.scheduleNotificationAsync({
  content: {
    title: "Local Test",
    body: "This tests notification display"
  },
  trigger: { seconds: 1 }
});
```
**Expected**: Notification appears in 1 second ✅

### **Test 2: Navigation on Tap**
```typescript
await Notifications.scheduleNotificationAsync({
  content: {
    title: "Navigation Test",
    body: "Tap to test navigation",
    data: { conversationId: 'test-123' }
  },
  trigger: { seconds: 1 }
});
```
**Expected**: Tapping opens the chat screen ✅

### **Test 3: Foreground Banner**
```typescript
// Already handled by your NotificationBanner component
// Test by triggering a local notification while app is open
```
**Expected**: Custom banner slides in at top ✅

### **Test 4: Background Notification**
```typescript
// 1. Schedule notification for 10 seconds
await Notifications.scheduleNotificationAsync({
  content: { title: "Background Test", body: "Test" },
  trigger: { seconds: 10 }
});

// 2. Minimize app (home button)
// 3. Wait for notification
// 4. Tap notification
```
**Expected**: App opens and navigates to correct screen ✅

---

## 🚨 **What You CANNOT Test Without Build**

### ❌ **Remote Push Notifications**
- Getting actual Expo Push Token
- Sending from Expo Push API
- Receiving push from server
- Token saved to Firestore (can test with dummy token)

### ❌ **Cross-Device Notifications**
- User A sends message → User B receives push
- This is the "real" push notification flow

---

## 💡 **Best Approach for Now**

### **Phase 1: Test in Expo Go (Now)**
1. ✅ Test local notifications (display, tap, navigation)
2. ✅ Test notification banner component
3. ✅ Test navigation logic
4. ✅ Verify code has no errors
5. ✅ Test with console logs

### **Phase 2: Test with EAS Build (Later)**
1. Build APK with EAS
2. Install on device
3. Test real push notifications
4. Test cross-device messaging

---

## 🛠️ **Quick Test Implementation**

Want me to add a temporary test screen with buttons to test:
- Local notifications
- Notification banner
- Navigation logic
- Permission flow

This would let you verify everything works **without EAS Build**!

---

## 📝 **Summary**

**Can test without build**:
- ✅ Local notifications (work perfectly in Expo Go)
- ✅ Notification display
- ✅ Tap handling and navigation
- ✅ Custom banner component
- ✅ Permission flow
- ✅ Code logic and error handling

**Cannot test without build**:
- ❌ Remote push notifications (from Expo Push API)
- ❌ Expo Push Token generation
- ❌ Cross-device notifications
- ❌ Real-world message → push flow

**Recommendation**: Test local notifications now, build with EAS when ready for production testing!

