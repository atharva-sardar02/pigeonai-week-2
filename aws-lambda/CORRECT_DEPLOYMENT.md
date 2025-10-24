# ✅ CORRECT Lambda Deployment - Fix "Missing required fields" Error

## 🔴 Problem

After deployment, all AI features return:
```
❌ Missing required fields
```

**Root Cause**: Lambda is using the wrong entry point (`index.js` - push notifications) instead of the AI router (`ai-functions/index.js`).

---

## ✅ Solution: Deploy with Correct Structure

### **Option 1: Quick Fix - Copy AI Router to Root (RECOMMENDED)**

```powershell
cd aws-lambda

# Copy the AI router to root as the main handler
Copy-Item ai-functions\index.js main-handler.js

# Update the deployment zip structure
Remove-Item function.zip -ErrorAction SilentlyContinue
Compress-Archive -Path main-handler.js,ai-functions\*,node_modules\*,package.json,serviceAccountKey.json -DestinationPath function.zip -Force

# Deploy
aws lambda update-function-code --function-name pigeonai-send-notification --zip-file fileb://function.zip --region us-east-1

# Wait for update
aws lambda wait function-updated --function-name pigeonai-send-notification --region us-east-1

cd ..
```

**BUT**: This won't work because Lambda needs a file named `index.js` as the entry point!

---

### **Option 2: Replace Root index.js with AI Router (CORRECT WAY)**

```powershell
cd aws-lambda

# Backup old push notification handler
Copy-Item index.js index-push-notifications.js -Force

# Replace with AI router
Copy-Item ai-functions\index.js index.js -Force

# Deploy
Remove-Item function.zip -ErrorAction SilentlyContinue
Compress-Archive -Path ai-functions\*,node_modules\*,package.json,index.js,serviceAccountKey.json -DestinationPath function.zip -Force
aws lambda update-function-code --function-name pigeonai-send-notification --zip-file fileb://function.zip --region us-east-1
aws lambda wait function-updated --function-name pigeonai-send-notification --region us-east-1

cd ..
```

---

### **Option 3: Update Lambda Handler Setting in AWS Console (CLEANEST)**

Keep the AI router in `ai-functions/index.js` and tell Lambda to use it:

```powershell
# Update Lambda handler to point to ai-functions/index.js
aws lambda update-function-configuration --function-name pigeonai-send-notification --handler ai-functions/index.handler --region us-east-1

# Wait for config update
aws lambda wait function-updated --function-name pigeonai-send-notification --region us-east-1

# Then deploy as normal
cd aws-lambda
Remove-Item function.zip -ErrorAction SilentlyContinue
Compress-Archive -Path ai-functions\*,node_modules\*,package.json,index.js,serviceAccountKey.json -DestinationPath function.zip -Force
aws lambda update-function-code --function-name pigeonai-send-notification --zip-file fileb://function.zip --region us-east-1

cd ..
```

---

## 🎯 Which Option Should You Use?

**Use Option 2** (Replace root index.js) - It's the simplest and most reliable.

Why?
- Lambda defaults to looking for `index.js` → `exports.handler`
- Option 1 won't work (wrong filename)
- Option 3 requires changing AWS configuration (more risky)
- **Option 2** just swaps the files and deploys - clean and simple!

---

## ✅ Verify After Deployment

Check the logs for the router:
```
✅ GOOD LOGS:
📨 Lambda triggered: { "routeKey": "POST /ai/summarize" ... }
🔍 Route: POST /ai/summarize
🤖 Routing to summarization handler
🚀 SummarizeConversation invoked

❌ BAD LOGS (old handler):
📨 Lambda triggered: ...
❌ Missing required fields: conversationId, messageId, message
```

---

## 📝 Summary

The issue is that your deployment is using the **push notification handler** (root `index.js`) which expects:
- `conversationId`
- `messageId`
- `message` (with senderId, content, etc.)

But the AI features are sending:
- `conversationId`
- `messageCount`

**Solution**: Replace the root `index.js` with the AI router (`ai-functions/index.js`) so Lambda routes correctly to AI handlers!


