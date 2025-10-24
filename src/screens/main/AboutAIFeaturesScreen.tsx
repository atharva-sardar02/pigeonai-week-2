import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainStackParamList } from '../../types';
import { COLORS, SPACING, TYPOGRAPHY } from '../../utils/constants';
import { Ionicons } from '@expo/vector-icons';

type AboutAIFeaturesScreenNavigationProp = NativeStackNavigationProp<
  MainStackParamList,
  'AboutAIFeatures'
>;

interface AboutAIFeaturesScreenProps {
  navigation: AboutAIFeaturesScreenNavigationProp;
}

interface AIFeature {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  howItWorks: string;
  benefits: string[];
}

const AI_FEATURES: AIFeature[] = [
  {
    icon: 'rocket-outline',
    title: '1. Proactive Agent (Advanced)',
    description: 'Multi-step AI scheduling assistant that proactively coordinates meetings across timezones.',
    howItWorks: 'Scans conversations for scheduling keywords, extracts details, analyzes availability, and suggests 3 time slots across timezones.',
    benefits: [
      'Save 90% of time on meeting coordination',
      'Smart timezone handling (PST, GMT, IST, etc.)',
      'Multiple scheduling threads detected automatically',
      'Share meeting details via calendar integration',
    ],
  },
  {
    icon: 'document-text-outline',
    title: '2. Thread Summarization',
    description: 'Get instant summaries of long conversation threads without reading every message.',
    howItWorks: 'Analyzes conversation history using GPT-4o-mini to extract key decisions, action items, blockers, and next steps.',
    benefits: [
      'Save 15-30 minutes per day catching up on conversations',
      'Never miss important context after being offline',
      'Quick overview of 100+ messages in seconds',
      'Focus on what matters without information overload',
    ],
  },
  {
    icon: 'checkbox-outline',
    title: '3. Action Item Extraction',
    description: 'Automatically extracts tasks, deadlines, and assignments from your conversations.',
    howItWorks: 'Uses AI to identify action items with assignees, deadlines, priorities, and dependencies from chat messages.',
    benefits: [
      'Never miss a deadline or commitment',
      'Clear visibility of who\'s doing what',
      'Automatic task tracking without manual effort',
      'Link back to original context in chat',
    ],
  },
  {
    icon: 'search-outline',
    title: '4. Smart Semantic Search',
    description: 'Search conversations by meaning, not just keywords. Find what you need instantly.',
    howItWorks: 'RAG pipeline with OpenSearch vector embeddings enables semantic similarity search across all messages.',
    benefits: [
      'Find information even without exact keywords',
      'Search by concept: "database decision" finds "PostgreSQL vs MongoDB"',
      'Instant retrieval of past decisions and discussions',
      'Better than traditional keyword search',
    ],
  },
  {
    icon: 'alert-circle-outline',
    title: '5. Priority Message Detection',
    description: 'AI automatically flags urgent messages so you never miss critical information.',
    howItWorks: 'Real-time analysis of message content and context to classify urgency as HIGH, MEDIUM, or LOW.',
    benefits: [
      'Instant awareness of production issues and blockers',
      'Reduce anxiety from constant checking',
      'Focus on urgent matters first',
      'Visual badges highlight important messages',
    ],
  },
  {
    icon: 'bulb-outline',
    title: '6. Decision Tracking',
    description: 'Maintains a timeline of all decisions made in conversations with full context.',
    howItWorks: 'Identifies finalized decisions (not just suggestions) with participants, reasoning, alternatives, and timestamps.',
    benefits: [
      'Never re-debate decisions ("didn\'t we already decide this?")',
      'Audit trail for architecture and technical choices',
      'Onboarding resource for new team members',
      'Quick reference for past agreements',
    ],
  },
];

export function AboutAIFeaturesScreen({ navigation }: AboutAIFeaturesScreenProps) {
  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>About AI Features</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Introduction */}
        <View style={styles.introSection}>
          <Text style={styles.introTitle}>✨ AI-Powered Communication</Text>
          <Text style={styles.introText}>
            PigeonAi combines reliable messaging with intelligent AI features designed specifically for{' '}
            <Text style={styles.highlightText}>Remote Team Professionals</Text>.
          </Text>
          <Text style={styles.introSubtext}>
            All features use cutting-edge GPT-4o-mini and semantic search to solve real communication problems.
          </Text>
        </View>

        {/* Features */}
        {AI_FEATURES.map((feature, index) => (
          <View key={index} style={styles.featureCard}>
            <View style={styles.featureHeader}>
              <View style={styles.featureIcon}>
                <Ionicons name={feature.icon} size={28} color={COLORS.primary} />
              </View>
              <View style={styles.featureTitleContainer}>
                <Text style={styles.featureTitle}>{feature.title}</Text>
              </View>
            </View>

            <Text style={styles.featureDescription}>{feature.description}</Text>

            <View style={styles.sectionDivider}>
              <Text style={styles.sectionLabel}>How It Works</Text>
            </View>
            <Text style={styles.howItWorksText}>{feature.howItWorks}</Text>

            <View style={styles.sectionDivider}>
              <Text style={styles.sectionLabel}>Key Benefits</Text>
            </View>
            {feature.benefits.map((benefit, idx) => (
              <View key={idx} style={styles.benefitRow}>
                <Ionicons name="checkmark-circle" size={18} color={COLORS.success} />
                <Text style={styles.benefitText}>{benefit}</Text>
              </View>
            ))}
          </View>
        ))}

        {/* Technology Section */}
        <View style={styles.techSection}>
          <Text style={styles.techTitle}>🚀 Powered By</Text>
          <View style={styles.techGrid}>
            <View style={styles.techItem}>
              <Text style={styles.techName}>OpenAI GPT-4o-mini</Text>
              <Text style={styles.techDesc}>Fast & accurate AI processing</Text>
            </View>
            <View style={styles.techItem}>
              <Text style={styles.techName}>AWS OpenSearch</Text>
              <Text style={styles.techDesc}>Vector embeddings (1536-dim)</Text>
            </View>
            <View style={styles.techItem}>
              <Text style={styles.techName}>RAG Pipeline</Text>
              <Text style={styles.techDesc}>Retrieval-augmented generation</Text>
            </View>
            <View style={styles.techItem}>
              <Text style={styles.techName}>Firebase + AWS</Text>
              <Text style={styles.techDesc}>Hybrid cloud infrastructure</Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            All AI features are designed to help remote teams communicate more effectively across timezones.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  } as ViewStyle,

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  } as ViewStyle,

  backButton: {
    padding: SPACING.xs,
  } as ViewStyle,

  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold as TextStyle['fontWeight'],
    color: COLORS.text,
  } as TextStyle,

  headerSpacer: {
    width: 40,
  } as ViewStyle,

  scrollView: {
    flex: 1,
  } as ViewStyle,

  scrollContent: {
    paddingBottom: SPACING.xxl,
  } as ViewStyle,

  introSection: {
    padding: SPACING.lg,
    backgroundColor: COLORS.primary + '10',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  } as ViewStyle,

  introTitle: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold as TextStyle['fontWeight'],
    color: COLORS.text,
    marginBottom: SPACING.sm,
  } as TextStyle,

  introText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.text,
    lineHeight: 22,
    marginBottom: SPACING.sm,
  } as TextStyle,

  highlightText: {
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.fontWeight.semibold as TextStyle['fontWeight'],
  } as TextStyle,

  introSubtext: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
  } as TextStyle,

  featureCard: {
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
    padding: SPACING.md,
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  } as ViewStyle,

  featureHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  } as ViewStyle,

  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,

  featureTitleContainer: {
    flex: 1,
    marginLeft: SPACING.md,
  } as ViewStyle,

  featureTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold as TextStyle['fontWeight'],
    color: COLORS.text,
  } as TextStyle,

  featureDescription: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
    lineHeight: 22,
    marginBottom: SPACING.md,
  } as TextStyle,

  sectionDivider: {
    marginTop: SPACING.sm,
    marginBottom: SPACING.xs,
  } as ViewStyle,

  sectionLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold as TextStyle['fontWeight'],
    color: COLORS.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  } as TextStyle,

  howItWorksText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text,
    lineHeight: 20,
    marginBottom: SPACING.md,
    fontStyle: 'italic',
  } as TextStyle,

  benefitRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.xs,
  } as ViewStyle,

  benefitText: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text,
    lineHeight: 20,
    marginLeft: SPACING.xs,
  } as TextStyle,

  techSection: {
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.xl,
    padding: SPACING.md,
    backgroundColor: COLORS.backgroundTertiary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  } as ViewStyle,

  techTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold as TextStyle['fontWeight'],
    color: COLORS.text,
    marginBottom: SPACING.md,
  } as TextStyle,

  techGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  } as ViewStyle,

  techItem: {
    flex: 1,
    minWidth: '45%',
    padding: SPACING.sm,
    backgroundColor: COLORS.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  } as ViewStyle,

  techName: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold as TextStyle['fontWeight'],
    color: COLORS.primary,
    marginBottom: SPACING.xs / 2,
  } as TextStyle,

  techDesc: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textTertiary,
  } as TextStyle,

  footer: {
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.xl,
    padding: SPACING.md,
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  } as ViewStyle,

  footerText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
    fontStyle: 'italic',
  } as TextStyle,
});

