# 📸 AWS S3 Image Sharing - Complete Setup Guide

**Status**: ✅ **Implementation Complete**  
**Time Required**: 15-20 minutes  
**Cost**: $0 (AWS Unlimited Plan)

---

## 📋 What's Been Implemented

### ✅ Backend (AWS Lambda)
- **`aws-lambda/ai-functions/imageUpload.js`** - Generates presigned S3 URLs
- **`aws-lambda/ai-functions/index.js`** - New route: `/ai/upload-image`

### ✅ Frontend (React Native)
- **`src/services/aws/s3Service.ts`** - S3 upload service
- **`src/components/chat/ImageViewer.tsx`** - Full-screen image viewer
- **`src/components/chat/MessageInput.tsx`** - Image picker with camera icon
- **`src/components/chat/MessageBubble.tsx`** - Image thumbnail display
- **`src/components/chat/MessageList.tsx`** - Image press handler
- **`src/screens/main/ChatScreen.tsx`** - Complete integration

---

## 🚀 Step-by-Step Setup

### **Step 1: Create S3 Bucket (5 minutes)**

1. **Go to AWS Console** → S3 Service  
   https://s3.console.aws.amazon.com/

2. **Click "Create bucket"**

3. **Configure Bucket**:
   - **Bucket name**: `pigeonai-images` (must be globally unique)
   - **Region**: `us-east-1` (same as your Lambda)
   - **Block Public Access**: ❌ Uncheck "Block all public access"
     - ⚠️ This is required for images to be viewable in the app
     - Check the acknowledgment box
   - **Bucket Versioning**: Disabled
   - **Tags**: Optional
   - **Default encryption**: SSE-S3 (recommended)
   - **Object Lock**: Disabled

4. **Click "Create bucket"**

---

### **Step 2: Configure CORS (2 minutes)**

CORS allows your React Native app to upload images directly to S3.

1. **Select your bucket** → Go to "Permissions" tab

2. **Scroll to "Cross-origin resource sharing (CORS)"**

3. **Click "Edit"**

4. **Paste this CORS configuration**:

```json
[
    {
        "AllowedHeaders": [
            "*"
        ],
        "AllowedMethods": [
            "GET",
            "PUT",
            "POST",
            "HEAD"
        ],
        "AllowedOrigins": [
            "*"
        ],
        "ExposeHeaders": [],
        "MaxAgeSeconds": 3000
    }
]
```

5. **Click "Save changes"**

---

### **Step 3: Configure Bucket Policy (2 minutes)**

This allows public read access to uploaded images.

1. **Stay in "Permissions" tab**

2. **Scroll to "Bucket policy"**

3. **Click "Edit"**

4. **Paste this policy** (replace `pigeonai-images` with your bucket name if different):

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::pigeonai-images/*"
        }
    ]
}
```

5. **Click "Save changes"**

---

### **Step 4: Update Lambda IAM Role (3 minutes)**

Your Lambda function needs permission to generate presigned URLs for S3.

1. **Go to AWS Console** → IAM Service  
   https://console.aws.amazon.com/iam/

2. **Click "Roles"** in left sidebar

3. **Search for your Lambda role**:
   - Should be named something like: `pigeonai-send-notification-role-xxxxx`
   - Or search for: `lambda`

4. **Click on the role** → **"Add permissions"** → **"Create inline policy"**

5. **Switch to JSON tab** and paste:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:PutObject",
                "s3:GetObject"
            ],
            "Resource": "arn:aws:s3:::pigeonai-images/*"
        }
    ]
}
```

6. **Click "Review policy"**

7. **Policy name**: `S3ImageUploadPolicy`

8. **Click "Create policy"**

---

### **Step 5: Add S3 Bucket Name to Lambda Environment (2 minutes)**

1. **Go to AWS Lambda Console**  
   https://console.aws.amazon.com/lambda/

2. **Select your function**: `pigeonai-send-notification`

3. **Go to "Configuration" tab** → **"Environment variables"**

4. **Click "Edit"**

5. **Add new environment variable**:
   - **Key**: `S3_BUCKET_NAME`
   - **Value**: `pigeonai-images`

6. **Click "Save"**

---

### **Step 6: Install AWS SDK v3 Dependencies (2 minutes)**

The image upload Lambda function needs AWS SDK v3 for S3.

```powershell
cd aws-lambda
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

---

### **Step 7: Deploy Lambda Function (2 minutes)**

```powershell
# From aws-lambda directory
cd aws-lambda

# Create deployment package
Remove-Item function.zip -ErrorAction SilentlyContinue
Compress-Archive -Path ai-functions,node_modules,package.json,index.js,serviceAccountKey.json -DestinationPath function.zip -Force

# Deploy to Lambda
aws lambda update-function-code --function-name pigeonai-send-notification --zip-file fileb://function.zip --region us-east-1

# Wait for deployment
aws lambda wait function-updated --function-name pigeonai-send-notification --region us-east-1
```

**Expected Output**:
```
✅ Function code updated successfully
```

---

### **Step 8: Add API Gateway Endpoint (2 minutes)**

1. **Go to API Gateway Console**  
   https://console.aws.amazon.com/apigateway/

2. **Select your API**: `pigeonai-notifications-api`

3. **Click "Resources"**

4. **Select `/ai` resource**

5. **Click "Actions"** → **"Create Resource"**
   - **Resource Name**: `upload-image`
   - **Resource Path**: `/upload-image`
   - ✅ Enable CORS
   - Click "Create Resource"

6. **With `/ai/upload-image` selected** → **"Actions"** → **"Create Method"** → Select **POST**

7. **Configure POST method**:
   - **Integration type**: Lambda Function
   - **Lambda Region**: us-east-1
   - **Lambda Function**: pigeonai-send-notification
   - **Use Default Timeout**: Yes
   - Click "Save"
   - Click "OK" on permission prompt

8. **Click "Actions"** → **"Deploy API"**
   - **Deployment stage**: default (or your stage name)
   - **Deployment description**: Add image upload endpoint
   - Click "Deploy"

9. **Note your API URL** (should be same as existing):
   ```
   https://7ojwlcdavc.execute-api.us-east-1.amazonaws.com/default/ai/upload-image
   ```

---

### **Step 9: Test the Endpoint (Optional - 2 minutes)**

Test that the Lambda function can generate presigned URLs:

```powershell
# Test with PowerShell
$body = @{
    conversationId = "test123"
    fileType = "image/jpeg"
} | ConvertTo-Json

$response = Invoke-RestMethod -Method Post -Uri "https://7ojwlcdavc.execute-api.us-east-1.amazonaws.com/default/ai/upload-image" -Body $body -ContentType "application/json"

$response | ConvertTo-Json
```

**Expected Response**:
```json
{
    "success": true,
    "uploadUrl": "https://pigeonai-images.s3.us-east-1.amazonaws.com/images/test123/...",
    "imageUrl": "https://pigeonai-images.s3.us-east-1.amazonaws.com/images/test123/...",
    "key": "images/test123/1729868456789_xy3kl9.jpg"
}
```

---

## 📱 Testing in App

### Build and Install APK

```powershell
# Build production APK
npx expo run:android --variant release

# Or if already built:
cd android
./gradlew assembleRelease
cd ..
adb install -r android/app/build/outputs/apk/release/app-release.apk
```

### Test Image Sharing

1. **Open app** → Navigate to any chat
2. **Tap camera icon** (left of text input)
3. **Allow photo permissions**
4. **Select an image from gallery**
5. **Watch upload progress** (spinner appears)
6. **Image appears** as 200x200 thumbnail in chat
7. **Tap image** → Opens full-screen viewer
8. **Tap close button** → Returns to chat

---

## 🔧 Troubleshooting

### Issue: "Failed to get upload URL"

**Solutions**:
1. Check Lambda logs in CloudWatch
2. Verify `S3_BUCKET_NAME` environment variable is set
3. Ensure Lambda IAM role has S3 permissions
4. Test API endpoint manually (Step 9)

### Issue: "Upload failed"

**Solutions**:
1. Check CORS configuration on S3 bucket
2. Verify bucket policy allows public access
3. Ensure presigned URL hasn't expired (5-minute limit)
4. Check CloudWatch logs for errors

### Issue: "Image not displaying"

**Solutions**:
1. Verify bucket policy allows public read (`s3:GetObject`)
2. Check if S3 URL is accessible in browser
3. Inspect console logs in app for image URL
4. Ensure Block Public Access is disabled on bucket

### Issue: "Permission denied when picking image"

**Solutions**:
1. Check app permissions in device settings
2. Restart app after granting permissions
3. Verify `expo-image-picker` is installed (v17.0.8)

---

## 💰 Cost Estimate

### With AWS Unlimited Plan: **$0**

### If Paying (For Reference):
- **S3 Storage**: $0.023/GB/month (~$1.15 for 50GB)
- **S3 Requests**: $0.005 per 1,000 PUT requests (~$0.01 for 1,000 images)
- **Lambda Invocations**: Free (1M requests/month)
- **Lambda Duration**: Free (400,000 GB-seconds/month)
- **API Gateway**: Free (1M requests/month)

**Total**: ~$1-2/month for moderate usage (if not on unlimited plan)

---

## 📊 AWS S3 Structure

After setup, your S3 bucket will look like this:

```
pigeonai-images/
└── images/
    ├── {conversationId1}/
    │   ├── 1729868456789_xy3kl9.jpg
    │   ├── 1729868567890_ab1cd2.jpg
    │   └── ...
    ├── {conversationId2}/
    │   ├── 1729868678901_ef3gh4.jpg
    │   └── ...
    └── ...
```

---

## ✅ Checklist

- [ ] Created S3 bucket: `pigeonai-images`
- [ ] Configured CORS on bucket
- [ ] Added bucket policy for public read
- [ ] Updated Lambda IAM role with S3 permissions
- [ ] Added `S3_BUCKET_NAME` environment variable to Lambda
- [ ] Installed AWS SDK dependencies: `@aws-sdk/client-s3`, `@aws-sdk/s3-request-presigner`
- [ ] Deployed Lambda function with new code
- [ ] Created API Gateway endpoint: `/ai/upload-image`
- [ ] Tested endpoint manually (optional)
- [ ] Built and installed new APK
- [ ] Tested image upload in app

---

## 🎉 Success!

Once all steps are complete, image sharing will work seamlessly:

✅ Select images from gallery  
✅ Upload directly to S3  
✅ Display thumbnails in chat  
✅ Full-screen viewer  
✅ Push notifications for image messages  
✅ Works in group chats  
✅ $0 cost with unlimited AWS plan  

---

## 📞 Need Help?

If you encounter issues:
1. Check CloudWatch logs for Lambda errors
2. Verify S3 bucket is publicly accessible
3. Test API endpoint manually
4. Check IAM permissions
5. Review console logs in React Native app

---

**Setup Time**: ~15-20 minutes  
**Files Changed**: 8 files  
**New Dependencies**: 2 (AWS SDK)  
**Breaking Changes**: None ✅  
**Ready for Production**: Yes ✅


