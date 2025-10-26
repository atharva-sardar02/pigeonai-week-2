/**
 * ImageViewer Component
 * Full-screen modal for viewing images
 */

import React from 'react';
import {
  Modal,
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Text,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ImageViewerProps {
  visible: boolean;
  imageUrl: string | null;
  onClose: () => void;
}

export function ImageViewer({ visible, imageUrl, onClose }: ImageViewerProps) {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(false);

  // Reset state when modal opens
  React.useEffect(() => {
    if (visible) {
      setLoading(true);
      setError(false);
    }
  }, [visible]);

  if (!imageUrl) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.container}>
        {/* Close Button */}
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <View style={styles.closeButtonBackground}>
            <Ionicons name="close" size={28} color="#FFF" />
          </View>
        </TouchableOpacity>

        {/* Loading Indicator */}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FFF" />
            <Text style={styles.loadingText}>Loading image...</Text>
          </View>
        )}

        {/* Error State */}
        {error && (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={64} color="#FFF" />
            <Text style={styles.errorText}>Failed to load image</Text>
            <TouchableOpacity style={styles.retryButton} onPress={() => setError(false)}>
              <Text style={styles.retryText}>Tap to retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Full-Screen Image */}
        {!error && (
          <Image
            source={{ uri: imageUrl }}
            style={styles.image}
            resizeMode="contain"
            onLoadStart={() => setLoading(true)}
            onLoadEnd={() => setLoading(false)}
            onError={() => {
              setLoading(false);
              setError(true);
            }}
          />
        )}
      </View>
    </Modal>
  );
}

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
  },
  closeButtonBackground: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: width,
    height: height,
  },
  loadingContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFF',
    marginTop: 12,
    fontSize: 16,
  },
  errorContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#FFF',
    fontSize: 18,
    marginTop: 16,
    marginBottom: 12,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
  },
  retryText: {
    color: '#FFF',
    fontSize: 16,
  },
});


