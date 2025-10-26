/**
 * AWS S3 Image Upload Service
 * Handles image uploads using presigned URLs from Lambda
 */

import { API_BASE_URL } from '../ai/aiService';

/**
 * Get presigned upload URL from Lambda
 * @param conversationId Conversation ID for organizing images
 * @param fileType MIME type of the image (e.g., 'image/jpeg')
 * @returns {Promise<{uploadUrl: string, imageUrl: string, key: string}>}
 */
export async function getPresignedUploadUrl(
  conversationId: string,
  fileType: string = 'image/jpeg'
): Promise<{ uploadUrl: string; imageUrl: string; key: string }> {
  try {
    console.log('[S3Service] Requesting presigned URL for:', { conversationId, fileType });

    const response = await fetch(`${API_BASE_URL}/ai/upload-image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        conversationId,
        fileType,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'Failed to get upload URL');
    }

    console.log('[S3Service] Presigned URL received');

    return {
      uploadUrl: data.uploadUrl,
      imageUrl: data.imageUrl,
      key: data.key,
    };
  } catch (error) {
    console.error('[S3Service] Error getting presigned URL:', error);
    throw error;
  }
}

/**
 * Upload image directly to S3 using presigned URL
 * @param imageUri Local file URI
 * @param uploadUrl Presigned upload URL from Lambda
 * @param fileType MIME type of the image
 * @param onProgress Optional progress callback (0-100)
 * @returns {Promise<void>}
 */
export async function uploadImageToS3(
  imageUri: string,
  uploadUrl: string,
  fileType: string = 'image/jpeg',
  onProgress?: (progress: number) => void
): Promise<void> {
  try {
    console.log('[S3Service] Starting upload to S3');

    // Convert local URI to blob
    const response = await fetch(imageUri);
    const blob = await response.blob();

    console.log('[S3Service] Image blob created, size:', blob.size);

    // Upload to S3 using presigned URL
    const uploadResponse = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': fileType,
      },
      body: blob,
    });

    if (!uploadResponse.ok) {
      throw new Error(`S3 upload failed: ${uploadResponse.status} ${uploadResponse.statusText}`);
    }

    console.log('[S3Service] Upload to S3 successful');
    
    if (onProgress) {
      onProgress(100);
    }
  } catch (error) {
    console.error('[S3Service] Error uploading to S3:', error);
    throw error;
  }
}

/**
 * Complete image upload workflow
 * 1. Get presigned URL from Lambda
 * 2. Upload image to S3
 * 3. Return public image URL
 * 
 * @param imageUri Local file URI
 * @param conversationId Conversation ID
 * @param onProgress Optional progress callback (0-100)
 * @returns {Promise<string>} Public S3 image URL
 */
export async function uploadImage(
  imageUri: string,
  conversationId: string,
  onProgress?: (progress: number) => void
): Promise<string> {
  try {
    console.log('[S3Service] Starting complete upload workflow');

    // Report initial progress
    if (onProgress) onProgress(10);

    // Step 1: Get presigned URL (10% - 30%)
    const { uploadUrl, imageUrl } = await getPresignedUploadUrl(conversationId, 'image/jpeg');
    
    if (onProgress) onProgress(30);

    // Step 2: Upload to S3 (30% - 90%)
    await uploadImageToS3(imageUri, uploadUrl, 'image/jpeg', (progress) => {
      if (onProgress) {
        // Map 0-100 to 30-90
        const adjustedProgress = 30 + (progress * 0.6);
        onProgress(Math.round(adjustedProgress));
      }
    });

    // Step 3: Complete (100%)
    if (onProgress) onProgress(100);

    console.log('[S3Service] Complete upload workflow finished, image URL:', imageUrl);

    return imageUrl;
  } catch (error) {
    console.error('[S3Service] Complete upload workflow failed:', error);
    throw error;
  }
}

