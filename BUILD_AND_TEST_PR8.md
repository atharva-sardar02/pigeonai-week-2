# Build & Test PR #8 Fixes - Quick Guide

## 🏗️ Build Process

### Option 1: Full Production Build (Recommended - 10-15 min)

```powershell
# Clean previous build
cd android
./gradlew clean

# Build release APK
./gradlew assembleRelease

# Install on device
adb install app/build/outputs/apk/release/app-release.apk
```

### Option 2: Development Build (Faster - 5 min)

```powershell
# Just rebuild and install
cd android
./gradlew installDebug
```

### Option 3: Expo Prebuild (If needed)

```powershell
# If gradle fails, regenerate native code
npx expo prebuild --clean
cd android
./gradlew assembleRelease
adb install app/build/outputs/apk/release/app-release.apk
```

---

## 🧪 Testing Checklist

### **Test 1: Offline Message Queue** (5 minutes)

**Setup**:
- Open the app
- Connect to device via `adb logcat` to see console logs

**Steps**:
1. ✅ Send 1 message while online → Should show ✓
2. ✅ Turn **airplane mode ON**
3. ✅ Send 3 messages
   - **Expected**: All show ○ (clock icon - sending)
4. ✅ Wait 10 seconds (messages stay as ○)
5. ✅ Turn **airplane mode OFF**
6. ✅ Watch console logs for:
   ```
   🌐 Network state changed: offline → online
   📶 Network reconnected! Processing offline queue...
   📨 Retrying message: temp_...
   ✅ Message sent successfully: [real-id]
   ```
7. ✅ Watch UI: All 3 messages should change ○ → ✓ → ✓✓
   - Takes 5-10 seconds for all to process

**Success Criteria**:
- ✅ All 3 offline messages automatically sent
- ✅ Status icons updated (○ → ✓ → ✓✓)
- ✅ Messages appear on other device

**If it fails**:
- Check console logs for errors
- Verify network state detection logs appear
- Check offline_queue table has entries

---

### **Test 2: Automatic Delivery Status** (3 minutes)

**Setup**:
- Use 2 devices (or 1 device + web browser with Firebase)
- Both devices online

**Steps**:
1. ✅ **Device A**: Send message "Test delivery"
2. ✅ **Device A**: Should see single tick ✓ (sent)
3. ✅ **Device B**: Open the app (but DON'T open the chat yet)
4. ✅ **Device A**: Should see gray double ticks ✓✓ (delivered) - **NEW!**
5. ✅ **Device B**: Now open the chat and scroll to message
6. ✅ **Device A**: Should see **green** double ticks ✓✓ (read)

**Success Criteria**:
- ✅ Gray ✓✓ appears when message reaches Device B (not when opened)
- ✅ Green ✓✓ appears when message is read on Device B
- ✅ Console logs show: "✓ Message [id] marked as delivered"

**Expected Timeline**:
- Sent: Instant (✓)
- Delivered: 1-2 seconds after Device B receives (✓✓ gray)
- Read: When Device B scrolls to message (✓✓ green)

**If it fails**:
- Check console logs for "marked as delivered"
- Verify Firestore listener is running
- Check message status in Firestore console

---

### **Test 3: Cache-First Instant Loading** (2 minutes)

**Steps**:
1. ✅ Open any chat with 20+ messages
   - **Expected**: Messages appear INSTANTLY (0ms, no spinner)
2. ✅ **Force quit app** (swipe away from recent apps)
3. ✅ Reopen app
4. ✅ Open same chat
   - **Expected**: Messages appear INSTANTLY from cache (no spinner)
5. ✅ Create a NEW conversation (no messages yet)
   - **Expected**: Empty state appears INSTANTLY (no spinner)
6. ✅ Send first message in new conversation
   - **Expected**: Message appears instantly with ○ icon

**Success Criteria**:
- ✅ No loading spinner on chat open (even for empty chats)
- ✅ Messages from cache appear in <100ms
- ✅ Console logs show: "📖 Retrieved X messages from SQLite"

**If it fails**:
- Check if loading state is being set somewhere
- Verify cache has data (`SELECT * FROM messages`)
- Check console logs for cache loading

---

### **Test 4: Group Chat Delivery (Bonus - 5 minutes)**

**Setup**:
- Create or use existing group with 3+ members

**Steps**:
1. ✅ Send message in group
2. ✅ Should show single tick ✓ (sent)
3. ✅ As members receive (but haven't read): Still ✓
4. ✅ When ALL members have read: Changes to green ✓✓

**Success Criteria**:
- ✅ Single tick until all members read
- ✅ Green double ticks only when all read

---

## 📱 ADB Commands for Testing

### View Real-Time Logs:
```powershell
# Filter for network and queue logs
adb logcat | Select-String "Network|queue|offline|delivered"

# Or see all logs
adb logcat *:D
```

### Check SQLite Database:
```powershell
# Enter device shell
adb shell

# Navigate to app database
cd /data/data/com.yourpackage.pigeonai/databases/

# Open SQLite
sqlite3 SQLite

# Check offline queue
SELECT * FROM offline_queue;

# Check messages
SELECT id, status, content FROM messages LIMIT 10;

# Exit
.exit
```

### Force Airplane Mode (if physical button broken):
```powershell
# Turn off WiFi and mobile data
adb shell svc wifi disable
adb shell svc data disable

# Turn back on
adb shell svc wifi enable
adb shell svc data enable
```

---

## 🐛 Troubleshooting

### Issue: Build Fails

**Error**: `Task assembleRelease FAILED`

**Fix**:
```powershell
cd android
./gradlew clean
cd ..
npx expo prebuild --clean
cd android
./gradlew assembleRelease
```

### Issue: ADB Not Found

**Fix**:
```powershell
# Check if device connected
adb devices

# If not found, restart ADB
adb kill-server
adb start-server
```

### Issue: App Won't Install

**Error**: `INSTALL_FAILED_UPDATE_INCOMPATIBLE`

**Fix**:
```powershell
# Uninstall old version first
adb uninstall com.yourpackage.pigeonai

# Then reinstall
adb install app/build/outputs/apk/release/app-release.apk
```

### Issue: Offline Queue Not Processing

**Check**:
1. Console logs show network state change?
2. Queue has entries? (`SELECT * FROM offline_queue`)
3. User object exists? (logged in?)
4. Network actually reconnected?

**Debug**:
```powershell
# Watch network logs specifically
adb logcat | Select-String "Network state changed|Processing offline queue"
```

### Issue: Delivery Status Not Working

**Check**:
1. Both devices have internet?
2. Firestore listener active?
3. Console shows "marked as delivered"?
4. Message status in Firestore is "sent" not "delivered"?

**Debug**:
```powershell
# Watch delivery logs
adb logcat | Select-String "marked as delivered|updateMessageStatus"
```

---

## ✅ Success Criteria Summary

All 3 fixes must work:

1. ✅ **Offline Queue**: Messages sent offline are automatically sent when reconnecting
2. ✅ **Delivery Status**: Gray ✓✓ appears when message reaches recipient (not just when read)
3. ✅ **Cache-First**: Messages appear instantly (0ms) on chat open, even after app restart

**If all 3 pass**: PR #8 is complete! 🎉

**If any fail**: Check console logs and let me know the error messages.

---

## 📝 Report Template

After testing, report results like this:

```
✅ Test 1 (Offline Queue): PASS - All 3 messages sent automatically
✅ Test 2 (Delivery Status): PASS - Gray ✓✓ appeared in 2 seconds
✅ Test 3 (Cache-First): PASS - Instant loading, no spinner
✅ Test 4 (Group Chat): PASS - Green ✓✓ only when all read

Console Logs:
[Paste any relevant logs here]

Issues Found:
[List any problems]
```

---

Good luck with testing! 🚀

