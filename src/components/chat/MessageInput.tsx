import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
} from 'react-native';
import { COLORS, SIZES } from '../../utils/constants';

interface MessageInputProps {
  onSend: (content: string) => void;
  onImagePick?: () => void;
  placeholder?: string;
  disabled?: boolean;
  sending?: boolean;
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
 */
export const MessageInput: React.FC<MessageInputProps> = ({
  onSend,
  onImagePick,
  placeholder = 'Type a message...',
  disabled = false,
  sending = false,
}) => {
  const [text, setText] = useState('');

  const handleSend = () => {
    const trimmedText = text.trim();
    if (trimmedText.length === 0 || disabled || sending) {
      return;
    }

    onSend(trimmedText);
    setText(''); // Clear input after sending
  };

  const canSend = text.trim().length > 0 && !disabled && !sending;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={styles.container}>
        {/* Image Picker Button (optional) */}
        {onImagePick && (
          <TouchableOpacity
            style={styles.iconButton}
            onPress={onImagePick}
            disabled={disabled || sending}
          >
            <View style={styles.iconButtonInner}>
              <View style={styles.imagePlaceholder}>
                <View style={styles.imagePlaceholderInner} />
              </View>
            </View>
          </TouchableOpacity>
        )}

        {/* Text Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={text}
            onChangeText={setText}
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
  imagePlaceholder: {
    width: 20,
    height: 18,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderRadius: 4,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  imagePlaceholderInner: {
    width: 6,
    height: 6,
    backgroundColor: COLORS.primary,
    borderRadius: 3,
    marginRight: 2,
    marginBottom: 2,
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

