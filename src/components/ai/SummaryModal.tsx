import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Share,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Clipboard from '@react-native-clipboard/clipboard';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, FONT_WEIGHTS } from '../../utils/constants';

interface SummaryModalProps {
  visible: boolean;
  onClose: () => void;
  summary: string | null;
  loading?: boolean;
  error?: string | null;
  messageCount?: number;
  cached?: boolean;
  duration?: number;
}

/**
 * Modal to display AI-generated conversation summary
 * Features:
 * - Formatted markdown-like display
 * - Copy to clipboard
 * - Share summary
 * - Loading and error states
 */
export default function SummaryModal({
  visible,
  onClose,
  summary,
  loading = false,
  error = null,
  messageCount = 0,
  cached = false,
  duration = 0,
}: SummaryModalProps) {
  const handleCopyToClipboard = () => {
    if (summary) {
      Clipboard.setString(summary);
      Alert.alert('Copied!', 'Summary copied to clipboard');
    }
  };

  const handleShare = async () => {
    if (summary) {
      try {
        await Share.share({
          message: summary,
          title: 'Thread Summary',
        });
      } catch (error) {
        console.error('Share error:', error);
      }
    }
  };

  const renderSummaryContent = () => {
    if (loading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Generating summary...</Text>
          <Text style={styles.loadingSubtext}>This may take a few seconds</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle" size={48} color={COLORS.error} />
          <Text style={styles.errorText}>Failed to generate summary</Text>
          <Text style={styles.errorSubtext}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={onClose}>
            <Text style={styles.retryButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (!summary) {
      return (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>No summary available</Text>
        </View>
      );
    }

    // ✅ SIMPLIFIED: Just display the summary as plain text with basic formatting
    // Remove the emoji if it exists
    const cleanSummary = summary.replace(/^📋\s*/gm, '');
    
    const formattedContent = [{
      type: 'text',
      content: cleanSummary,
    }];

    return (
      <ScrollView style={styles.summaryContent} showsVerticalScrollIndicator={true}>
        {formattedContent.map((item: any, index: number) => (
          <Text key={index} style={styles.summaryText}>
            {item.content}
          </Text>
        ))}

        {/* Metadata footer */}
        <View style={styles.metadataContainer}>
          <Text style={styles.metadata}>
            {messageCount} messages analyzed
            {cached && ' • From cache'}
            {duration > 0 && ` • ${(duration / 1000).toFixed(1)}s`}
          </Text>
        </View>
      </ScrollView>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Ionicons name="sparkles" size={24} color={COLORS.primary} />
            <Text style={styles.headerTitle}>Thread Summary</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={28} color={COLORS.text} />
          </TouchableOpacity>
        </View>

        {/* Summary content */}
        {renderSummaryContent()}

        {/* Action buttons (only show when summary is loaded) */}
        {summary && !loading && !error && (
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.actionButton, styles.copyButton]}
              onPress={handleCopyToClipboard}
            >
              <Ionicons name="copy-outline" size={20} color={COLORS.primary} />
              <Text style={styles.actionButtonText}>Copy</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.shareButton]}
              onPress={handleShare}
            >
              <Ionicons name="share-outline" size={20} color={COLORS.primary} />
              <Text style={styles.actionButtonText}>Share</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  headerTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semibold as any,
    color: COLORS.text,
  },
  closeButton: {
    padding: SPACING.xs,
  },
  summaryContent: {
    flex: 1,
    padding: SPACING.md,
  },
  summaryTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold as any,
    color: COLORS.text,
    marginBottom: SPACING.lg,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionHeader: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semibold as any,
    color: COLORS.primary,
    marginBottom: SPACING.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  bulletContainer: {
    flexDirection: 'row',
    marginBottom: SPACING.sm,
    paddingLeft: SPACING.sm,
  },
  bullet: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    marginRight: SPACING.sm,
    lineHeight: FONT_SIZES.md * 1.5,
  },
  bulletText: {
    flex: 1,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    lineHeight: FONT_SIZES.md * 1.5,
  },
  summaryText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    lineHeight: FONT_SIZES.md * 1.6,
    marginBottom: SPACING.md,
  },
  metadataContainer: {
    marginTop: SPACING.lg,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  metadata: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  loadingText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semibold as any,
    color: COLORS.text,
    marginTop: SPACING.md,
  },
  loadingSubtext: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  errorText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semibold as any,
    color: COLORS.error,
    marginTop: SPACING.md,
  },
  errorSubtext: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: SPACING.lg,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
  },
  retryButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semibold as any,
    color: COLORS.white,
  },
  emptyText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
  },
  footer: {
    flexDirection: 'row',
    padding: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: SPACING.sm,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    gap: SPACING.xs,
  },
  copyButton: {
    backgroundColor: COLORS.primaryLight,
  },
  shareButton: {
    backgroundColor: COLORS.primaryLight,
  },
  actionButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semibold as any,
    color: COLORS.primary,
  },
});

