import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
  Keyboard,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../../utils/constants';

interface MessageInputProps {
  onSend: (content: string) => void;
  onTypingChange?: (isTyping: boolean) => void; // New prop for typing indicator
  onSendImage?: (uri: string) => void; // New prop for sending images
  placeholder?: string;
  disabled?: boolean;
  sending?: boolean;
  uploadingImage?: boolean; // New prop for image upload state
}

/**
 * Message Input Component
 * 
 * Text input field with send button for composing messages.
 * 
 * Features:
 * - Multi-line text input
 * - Send button (enabled only when text present)
 * - Image picker button (optional)
 * - Keyboard handling
 * - Loading state while sending
 * - Typing indicator support
 */
export const MessageInput: React.FC<MessageInputProps> = ({
  onSend,
  onTypingChange,
  onSendImage,
  placeholder = 'Type a message...',
  disabled = false,
  sending = false,
  uploadingImage = false,
}) => {
  const [text, setText] = useState('');
  const isTypingRef = useRef(false);

  /**
   * Handle image picker
   */
  const handleImagePick = async () => {
    try {
      // Request media library permissions
      const { status} = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please allow access to your photos to send images.',
          [{ text: 'OK' }]
        );
        return;
      }

      // Open image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.7, // Compress to 70% to reduce file size
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const imageUri = result.assets[0].uri;
        console.log('[MessageInput] Image selected:', imageUri);
        
        if (onSendImage) {
          onSendImage(imageUri);
        }
      }
    } catch (error) {
      console.error('[MessageInput] Image picker error:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  /**
   * Handle text change with typing indicator
   * Typing stays active as long as there's text in the input
   */
  const handleTextChange = (newText: string) => {
    setText(newText);

    // Only trigger typing if onTypingChange is provided
    if (!onTypingChange) return;

    // If user is typing (has text), set typing status
    if (newText.trim().length > 0) {
      // Set typing to true if not already
      if (!isTypingRef.current) {
        isTypingRef.current = true;
        onTypingChange(true);
      }
      // Note: We DON'T clear typing after timeout anymore
      // Typing stays active as long as there's text in the input
    } else {
      // If text is cleared, immediately set typing to false
      if (isTypingRef.current) {
        isTypingRef.current = false;
        onTypingChange(false);
      }
    }
  };

  const handleSend = () => {
    const trimmedText = text.trim();
    if (trimmedText.length === 0 || disabled || sending) {
      return;
    }

    // Clear typing status before sending
    if (isTypingRef.current && onTypingChange) {
      isTypingRef.current = false;
      onTypingChange(false);
    }

    onSend(trimmedText);
    setText(''); // Clear input after sending
  };

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      // Clear typing status on unmount
      if (isTypingRef.current && onTypingChange) {
        onTypingChange(false);
      }
    };
  }, [onTypingChange]);

  /**
   * Listen for keyboard dismiss to clear typing status
   */
  useEffect(() => {
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        // When keyboard is dismissed, clear typing status if there's text
        if (isTypingRef.current && onTypingChange) {
          isTypingRef.current = false;
          onTypingChange(false);
        }
      }
    );

    return () => {
      keyboardDidHideListener.remove();
    };
  }, [onTypingChange]);

  const canSend = text.trim().length > 0 && !disabled && !sending;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={styles.container}>
        {/* Image Picker Button */}
        {onSendImage && (
          <TouchableOpacity
            style={styles.iconButton}
            onPress={handleImagePick}
            disabled={disabled || sending || uploadingImage}
          >
            {uploadingImage ? (
              <View style={styles.iconButtonInner}>
                <ActivityIndicator size="small" color={COLORS.primary} />
              </View>
            ) : (
              <View style={styles.iconButtonInner}>
                <Ionicons name="image-outline" size={20} color={COLORS.primary} />
              </View>
            )}
          </TouchableOpacity>
        )}

        {/* Text Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={text}
            onChangeText={handleTextChange}
            placeholder={placeholder}
            placeholderTextColor={COLORS.textPlaceholder}
            multiline
            maxLength={10000}
            editable={!disabled && !sending}
            returnKeyType="default"
            blurOnSubmit={false}
          />
        </View>

        {/* Send Button */}
        <TouchableOpacity
          style={[
            styles.sendButton,
            canSend && styles.sendButtonActive,
          ]}
          onPress={handleSend}
          disabled={!canSend}
        >
          {sending ? (
            <ActivityIndicator size="small" color={COLORS.buttonPrimaryText} />
          ) : (
            <View style={styles.sendIcon}>
              <View style={styles.sendIconTriangle} />
            </View>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: SIZES.paddingMedium,
    paddingVertical: SIZES.paddingSmall,
    backgroundColor: COLORS.backgroundSecondary,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: SIZES.paddingSmall,
  },
  iconButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  iconButtonInner: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.backgroundTertiary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputContainer: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    backgroundColor: COLORS.inputBackground,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    justifyContent: 'center',
    paddingHorizontal: SIZES.paddingMedium,
    paddingVertical: SIZES.paddingSmall,
  },
  input: {
    fontSize: SIZES.fontMedium,
    color: COLORS.inputText,
    maxHeight: 80,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.buttonDisabled,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  sendButtonActive: {
    backgroundColor: COLORS.buttonPrimary,
  },
  sendIcon: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendIconTriangle: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 8,
    borderRightWidth: 0,
    borderBottomWidth: 6,
    borderTopWidth: 6,
    borderLeftColor: COLORS.buttonPrimaryText,
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
    borderTopColor: 'transparent',
    marginLeft: 2,
  },
});

