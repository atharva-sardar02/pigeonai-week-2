/**
 * Image Cache Service
 * Downloads and caches images locally for offline access
 */

import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_DIR = `${FileSystem.cacheDirectory}images/`;
const CACHE_INDEX_KEY = '@image_cache_index';

// Ensure cache directory exists
async function ensureCacheDir() {
  const dirInfo = await FileSystem.getInfoAsync(CACHE_DIR);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(CACHE_DIR, { intermediates: true });
    console.log('[ImageCache] Created cache directory');
  }
}

/**
 * Get cached image index
 */
async function getCacheIndex(): Promise<Record<string, string>> {
  try {
    const index = await AsyncStorage.getItem(CACHE_INDEX_KEY);
    return index ? JSON.parse(index) : {};
  } catch (error) {
    console.error('[ImageCache] Error reading cache index:', error);
    return {};
  }
}

/**
 * Update cache index
 */
async function updateCacheIndex(url: string, localPath: string) {
  try {
    const index = await getCacheIndex();
    index[url] = localPath;
    await AsyncStorage.setItem(CACHE_INDEX_KEY, JSON.stringify(index));
  } catch (error) {
    console.error('[ImageCache] Error updating cache index:', error);
  }
}

/**
 * Get cached image URI or download if not cached
 * @param url Remote image URL
 * @returns Local cached URI
 */
export async function getCachedImage(url: string): Promise<string> {
  try {
    // Check if image is already cached
    const index = await getCacheIndex();
    const cachedPath = index[url];

    if (cachedPath) {
      const fileInfo = await FileSystem.getInfoAsync(cachedPath);
      if (fileInfo.exists) {
        console.log('[ImageCache] Using cached image:', cachedPath);
        return cachedPath;
      } else {
        // File was deleted, remove from index
        console.log('[ImageCache] Cached file missing, re-downloading');
        delete index[url];
        await AsyncStorage.setItem(CACHE_INDEX_KEY, JSON.stringify(index));
      }
    }

    // Download and cache the image
    await ensureCacheDir();
    
    // Generate filename from URL
    const filename = url.split('/').pop() || `${Date.now()}.jpg`;
    const localPath = `${CACHE_DIR}${filename}`;

    console.log('[ImageCache] Downloading image:', url);
    const downloadResult = await FileSystem.downloadAsync(url, localPath);

    if (downloadResult.status === 200) {
      console.log('[ImageCache] Image cached successfully:', localPath);
      await updateCacheIndex(url, localPath);
      return localPath;
    } else {
      console.error('[ImageCache] Download failed:', downloadResult.status);
      return url; // Return original URL as fallback
    }
  } catch (error) {
    console.error('[ImageCache] Error caching image:', error);
    return url; // Return original URL as fallback
  }
}

/**
 * Pre-cache multiple images (for background caching)
 */
export async function preCacheImages(urls: string[]): Promise<void> {
  console.log('[ImageCache] Pre-caching', urls.length, 'images');
  
  await ensureCacheDir();
  
  const promises = urls.map(async (url) => {
    try {
      await getCachedImage(url);
    } catch (error) {
      console.warn('[ImageCache] Failed to pre-cache:', url, error);
    }
  });
  
  await Promise.all(promises);
  console.log('[ImageCache] Pre-caching complete');
}

/**
 * Clear image cache
 */
export async function clearImageCache(): Promise<void> {
  try {
    const dirInfo = await FileSystem.getInfoAsync(CACHE_DIR);
    if (dirInfo.exists) {
      await FileSystem.deleteAsync(CACHE_DIR, { idempotent: true });
      await AsyncStorage.removeItem(CACHE_INDEX_KEY);
      console.log('[ImageCache] Cache cleared');
    }
  } catch (error) {
    console.error('[ImageCache] Error clearing cache:', error);
  }
}

/**
 * Get cache size
 */
export async function getCacheSize(): Promise<number> {
  try {
    const dirInfo = await FileSystem.getInfoAsync(CACHE_DIR);
    if (!dirInfo.exists) return 0;
    
    const files = await FileSystem.readDirectoryAsync(CACHE_DIR);
    let totalSize = 0;
    
    for (const file of files) {
      const fileInfo = await FileSystem.getInfoAsync(`${CACHE_DIR}${file}`);
      if (fileInfo.exists && 'size' in fileInfo) {
        totalSize += fileInfo.size || 0;
      }
    }
    
    return totalSize;
  } catch (error) {
    console.error('[ImageCache] Error calculating cache size:', error);
    return 0;
  }
}


