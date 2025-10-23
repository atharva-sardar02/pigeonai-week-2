import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../../utils/constants';

interface ChatOptionsMenuProps {
  visible: boolean;
  onClose: () => void;
  onDeleteAllMessages: () => void;
}

/**
 * Chat Options Menu Component
 * 
 * Dropdown menu shown when 3-dot button is pressed.
 * Shows options like "Delete all messages".
 */
export const ChatOptionsMenu: React.FC<ChatOptionsMenuProps> = ({
  visible,
  onClose,
  onDeleteAllMessages,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.menu}>
              {/* Delete All Messages Option */}
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  onClose();
                  onDeleteAllMessages();
                }}
              >
                <Ionicons name="trash-outline" size={20} color={COLORS.error} />
                <Text style={styles.menuItemTextDanger}>Delete All Messages</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 60, // Below header
    paddingRight: SIZES.paddingMedium,
  },
  menu: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: 8,
    minWidth: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SIZES.paddingMedium,
    paddingHorizontal: SIZES.paddingMedium,
    gap: 12,
  },
  menuItemText: {
    fontSize: SIZES.fontMedium,
    color: COLORS.text,
  },
  menuItemTextDanger: {
    fontSize: SIZES.fontMedium,
    color: COLORS.error,
    fontWeight: '500',
  },
});

