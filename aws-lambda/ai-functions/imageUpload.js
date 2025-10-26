/**
 * Image Upload Lambda Function (AWS S3)
 * Generates presigned URLs for direct S3 uploads from mobile app
 */

const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

// S3 Configuration
const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME || 'pigeonai-images';
const S3_REGION = process.env.AWS_REGION || 'us-east-1';

// Initialize S3 client
const s3Client = new S3Client({ 
  region: S3_REGION,
  // Uses default credentials from Lambda execution role
});

/**
 * Generate presigned upload URL
 * @param {Object} body - Request body { conversationId, fileType }
 * @returns {Object} - { uploadUrl, imageUrl, key }
 */
async function generateUploadUrl(body) {
  const startTime = Date.now();
  
  try {
    const { conversationId, fileType = 'image/jpeg' } = body;

    // Validate inputs
    if (!conversationId) {
      throw new Error('conversationId is required');
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(fileType)) {
      throw new Error(`Invalid file type. Allowed: ${allowedTypes.join(', ')}`);
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(7);
    const extension = fileType.split('/')[1] || 'jpg';
    const key = `images/${conversationId}/${timestamp}_${randomId}.${extension}`;

    console.log('[ImageUpload] Generating presigned URL:', { conversationId, key, fileType });

    // Create PutObject command
    const command = new PutObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key: key,
      ContentType: fileType,
      // ACL: 'public-read', // Make images publicly readable
    });

    // Generate presigned URL (valid for 5 minutes)
    const uploadUrl = await getSignedUrl(s3Client, command, { 
      expiresIn: 300 // 5 minutes
    });

    // Construct public image URL
    const imageUrl = `https://${S3_BUCKET_NAME}.s3.${S3_REGION}.amazonaws.com/${key}`;

    const duration = Date.now() - startTime;
    console.log(`[ImageUpload] Presigned URL generated successfully (${duration}ms)`);

    return {
      success: true,
      uploadUrl, // Use this to upload the image
      imageUrl,  // Use this to display the image after upload
      key,
      expiresIn: 300,
      bucket: S3_BUCKET_NAME,
      region: S3_REGION,
    };

  } catch (error) {
    console.error('[ImageUpload] Error generating presigned URL:', error);
    throw error;
  }
}

/**
 * Lambda handler
 */
async function handler(event) {
  const startTime = Date.now();
  
  try {
    console.log('[ImageUpload] Request received');

    // Parse request body
    let body;
    if (typeof event.body === 'string') {
      body = JSON.parse(event.body);
    } else {
      body = event.body || {};
    }

    // Generate presigned URL
    const result = await generateUploadUrl(body);

    const duration = Date.now() - startTime;
    console.log(`[ImageUpload] Request completed (${duration}ms)`);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        'Access-Control-Allow-Methods': 'POST,OPTIONS',
      },
      body: JSON.stringify(result),
    };

  } catch (error) {
    console.error('[ImageUpload] Handler error:', error);

    return {
      statusCode: error.message.includes('required') ? 400 : 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        success: false,
        error: error.message || 'Internal server error',
      }),
    };
  }
}

module.exports = { handler, generateUploadUrl };


