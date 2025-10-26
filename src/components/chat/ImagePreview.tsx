import React from 'react';
import {
  Modal,
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Text,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../utils/constants';

const { width, height } = Dimensions.get('window');

interface ImagePreviewProps {
  visible: boolean;
  imageUri: string | null;
  onSend: () => void;
  onCancel: () => void;
  uploading?: boolean;
}

export function ImagePreview({
  visible,
  imageUri,
  onSend,
  onCancel,
  uploading = false,
}: ImagePreviewProps) {
  if (!imageUri) return null;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onCancel}
            disabled={uploading}
          >
            <Ionicons name="close" size={28} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Send Image</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Image Preview */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: imageUri }}
            style={styles.image}
            resizeMode="contain"
          />
        </View>

        {/* Send Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.sendButton, uploading && styles.sendButtonDisabled]}
            onPress={onSend}
            disabled={uploading}
          >
            {uploading ? (
              <>
                <ActivityIndicator size="small" color="#FFF" />
                <Text style={styles.sendButtonText}>Sending...</Text>
              </>
            ) : (
              <>
                <Ionicons name="send" size={20} color="#FFF" />
                <Text style={styles.sendButtonText}>Send Image</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
  },
  placeholder: {
    width: 44, // Same as close button to center title
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: width,
    height: height * 0.7,
  },
  footer: {
    padding: 20,
    paddingBottom: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  sendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    gap: 8,
  },
  sendButtonDisabled: {
    backgroundColor: COLORS.buttonDisabled,
  },
  sendButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});


