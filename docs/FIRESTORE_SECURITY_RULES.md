# Firestore Security Rules - FCM Token Protection

**Last Updated**: October 21, 2025  
**Task**: 10.11 - Update Firestore Rules for FCM Tokens  
**Status**: ✅ Complete

---

## 🔐 What We've Secured

### **FCM Token Storage**

Updated the `/users/{userId}` collection rules to:

1. ✅ **Restrict field updates** - Users can only update safe fields
2. ✅ **Validate FCM tokens** - Ensure `fcmTokens` is always an array
3. ✅ **Prevent privilege escalation** - Users can't modify `uid`, `email`, or other sensitive fields
4. ✅ **Allow presence updates** - Users can update `isOnline`, `lastSeen`

---

## 📋 Updated Rules

### **Before** (Less Secure):

```javascript
match /users/{userId} {
  allow read: if isAuthenticated();
  allow update: if isOwner(userId);  // ❌ Could update ANY field
}
```

**Problem**: Users could potentially update sensitive fields like `uid`, `email`, or inject malicious data.

### **After** (Secure):

```javascript
match /users/{userId} {
  allow read: if isAuthenticated();
  
  allow update: if isOwner(userId)
                && (
                  // Only allow updating safe fields
                  request.resource.data.diff(resource.data).affectedKeys()
                    .hasOnly(['displayName', 'photoURL', 'isOnline', 'lastSeen', 'fcmTokens', 'updatedAt'])
                )
                && (
                  // If updating fcmTokens, ensure it's an array
                  !request.resource.data.diff(resource.data).affectedKeys().hasAny(['fcmTokens'])
                  || request.resource.data.fcmTokens is list
                );
}
```

**Benefits**: 
- ✅ Only allows updating safe fields
- ✅ Validates `fcmTokens` is an array
- ✅ Prevents privilege escalation
- ✅ Allows normal operations (presence, tokens, profile updates)

---

## 🔒 Protected Fields

### **Can Update** (Allowed):
- `displayName` - User's display name
- `photoURL` - User's profile picture URL
- `isOnline` - Online/offline status
- `lastSeen` - Last activity timestamp
- `fcmTokens` - Array of FCM tokens (validated as list)
- `updatedAt` - Last update timestamp

### **Cannot Update** (Protected):
- `uid` - User ID (immutable)
- `email` - Email address (should use Firebase Auth to change)
- `createdAt` - Creation timestamp (immutable)
- `role` - User role (if you add this in future)
- Any other field not in the allowed list

---

## 🧪 How It Works

### **Field Validation**:

```javascript
request.resource.data.diff(resource.data).affectedKeys()
  .hasOnly(['displayName', 'photoURL', 'isOnline', 'lastSeen', 'fcmTokens', 'updatedAt'])
```

This checks:
1. What fields are being changed (`diff()`)
2. Gets the list of changed fields (`affectedKeys()`)
3. Ensures ONLY allowed fields are being changed (`hasOnly()`)

### **FCM Token Type Validation**:

```javascript
!request.resource.data.diff(resource.data).affectedKeys().hasAny(['fcmTokens'])
|| request.resource.data.fcmTokens is list
```

This ensures:
1. If `fcmTokens` is NOT being updated → Allow (skip validation)
2. If `fcmTokens` IS being updated → Ensure it's an array (`is list`)

---

## 📊 Security Scenarios

### ✅ **Allowed Operations**:

```javascript
// Update display name
updateDoc(userRef, { displayName: 'John Doe' })  // ✅ Allowed

// Add FCM token
updateDoc(userRef, { 
  fcmTokens: ['token1', 'token2'] 
})  // ✅ Allowed (is an array)

// Set online status
updateDoc(userRef, { 
  isOnline: true, 
  lastSeen: serverTimestamp() 
})  // ✅ Allowed

// Update profile picture
updateDoc(userRef, { photoURL: 'https://...' })  // ✅ Allowed
```

### ❌ **Blocked Operations**:

```javascript
// Try to change UID
updateDoc(userRef, { uid: 'different-uid' })  // ❌ BLOCKED

// Try to change email
updateDoc(userRef, { email: 'hacker@example.com' })  // ❌ BLOCKED

// Try to inject malicious field
updateDoc(userRef, { isAdmin: true })  // ❌ BLOCKED

// Try to set fcmTokens as non-array
updateDoc(userRef, { fcmTokens: 'invalid' })  // ❌ BLOCKED

// Try to modify createdAt
updateDoc(userRef, { createdAt: new Date() })  // ❌ BLOCKED
```

---

## 🎯 What This Protects Against

### 1. **Privilege Escalation**
**Attack**: User tries to set `isAdmin: true` or `role: 'admin'`  
**Protection**: Only whitelisted fields can be updated

### 2. **Identity Theft**
**Attack**: User tries to change `uid` or `email` to impersonate another user  
**Protection**: `uid` and `email` are not in the allowed fields list

### 3. **Data Corruption**
**Attack**: User tries to set `fcmTokens` to invalid data (string, number, object)  
**Protection**: Type validation ensures `fcmTokens` is always an array

### 4. **Timestamp Manipulation**
**Attack**: User tries to fake `createdAt` to appear as an older user  
**Protection**: `createdAt` is immutable (not in allowed list)

---

## 🚀 Deployment

### **Rules Deployed**:
```bash
firebase deploy --only firestore:rules
```

**Result**: ✅ Rules deployed successfully to `pigeonai-dev`

### **Verify Deployment**:
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click **Firestore Database** → **Rules** tab
4. You should see the updated rules

---

## 🧪 Testing the Rules

### **Test in Firebase Console**:

1. Go to **Firestore Database** → **Rules** tab
2. Click **Simulator** button
3. Test scenarios:

**Test 1: Update Display Name (Should Pass)**
```javascript
Location: /users/test-user-123
Type: update
Authenticated: Yes, as test-user-123
Data before: { uid: 'test-user-123', displayName: 'Old Name' }
Data after: { uid: 'test-user-123', displayName: 'New Name' }
Expected: ✅ ALLOWED
```

**Test 2: Update UID (Should Fail)**
```javascript
Location: /users/test-user-123
Type: update
Authenticated: Yes, as test-user-123
Data before: { uid: 'test-user-123', displayName: 'John' }
Data after: { uid: 'different-uid', displayName: 'John' }
Expected: ❌ DENIED
```

**Test 3: Update FCM Tokens (Should Pass)**
```javascript
Location: /users/test-user-123
Type: update
Authenticated: Yes, as test-user-123
Data before: { uid: 'test-user-123', fcmTokens: [] }
Data after: { uid: 'test-user-123', fcmTokens: ['token1', 'token2'] }
Expected: ✅ ALLOWED
```

**Test 4: Invalid FCM Token Type (Should Fail)**
```javascript
Location: /users/test-user-123
Type: update
Authenticated: Yes, as test-user-123
Data before: { uid: 'test-user-123', fcmTokens: [] }
Data after: { uid: 'test-user-123', fcmTokens: 'invalid-string' }
Expected: ❌ DENIED
```

---

## 📚 Additional Security Measures

### **Already Implemented**:

1. ✅ **Authentication Required** - All operations require `isAuthenticated()`
2. ✅ **Ownership Validation** - Users can only update their own profile
3. ✅ **Field Whitelisting** - Only safe fields can be updated
4. ✅ **Type Validation** - FCM tokens must be an array
5. ✅ **Message Security** - Users can only send messages as themselves
6. ✅ **Conversation Security** - Users can only access conversations they're in
7. ✅ **Typing Indicators** - Users can only set their own typing status

### **Future Enhancements** (Post-MVP):

- [ ] Add rate limiting for FCM token updates
- [ ] Add maximum array size for `fcmTokens` (e.g., max 5 devices)
- [ ] Add token format validation (e.g., starts with `ExponentPushToken[`)
- [ ] Add audit logging for security-sensitive operations
- [ ] Add admin role validation if you implement admin features

---

## 🔗 Resources

- [Firestore Security Rules Documentation](https://firebase.google.com/docs/firestore/security/get-started)
- [Security Rules Best Practices](https://firebase.google.com/docs/firestore/security/rules-conditions)
- [Testing Security Rules](https://firebase.google.com/docs/firestore/security/test-rules-emulator)

---

## ✅ Summary

**Task 10.11: Update Firestore Rules for FCM Tokens** - **COMPLETE!**

### **What We Did**:
1. ✅ Updated user profile security rules
2. ✅ Added field whitelisting for updates
3. ✅ Added type validation for `fcmTokens`
4. ✅ Deployed rules to Firebase
5. ✅ Documented security measures

### **Security Improvements**:
- Protected against privilege escalation
- Protected against identity theft
- Protected against data corruption
- Protected against timestamp manipulation
- Validated FCM token storage format

### **Next Steps**:
- Task 10.12: Write Unit Tests (optional)
- Task 10.13: Manual Testing (requires EAS Build)

---

**Your FCM token storage is now secure! 🔐**

