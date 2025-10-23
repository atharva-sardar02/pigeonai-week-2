/**
 * SearchModal Component (PR #18)
 * 
 * Full-screen modal for semantic search
 * Features:
 * - Natural language search bar
 * - Real-time results with relevance scores
 * - Navigate to source message
 * - Loading/error states
 * 
 * Persona: Remote Team Professional
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../utils/constants';

export interface SearchResult {
  messageId: string;
  content: string;
  senderId: string;
  senderName: string;
  timestamp: string;
  score: number;
  relevance: number; // 0-100 percentage
}

export interface SearchResultData {
  results: SearchResult[];
  query: string;
  conversationId: string;
  resultCount: number;
  cached: boolean;
  duration: number;
}

interface SearchModalProps {
  visible: boolean;
  conversationId: string;
  onClose: () => void;
  onSearch: (query: string) => Promise<SearchResultData | null>;
  onNavigateToMessage: (messageId: string) => void;
}

export default function SearchModal({
  visible,
  conversationId,
  onClose,
  onSearch,
  onNavigateToMessage,
}: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchInfo, setSearchInfo] = useState<{
    resultCount: number;
    duration: number;
    cached: boolean;
  } | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const searchInputRef = useRef<TextInput>(null);

  // Focus input when modal opens
  useEffect(() => {
    if (visible) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    } else {
      // Reset state when modal closes
      setQuery('');
      setResults([]);
      setError(null);
      setSearchInfo(null);
      setHasSearched(false);
    }
  }, [visible]);

  const handleSearch = async () => {
    if (query.trim().length === 0) {
      setError('Please enter a search query');
      return;
    }

    if (query.length < 3) {
      setError('Query must be at least 3 characters');
      return;
    }

    setIsLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const searchData = await onSearch(query);

      if (searchData) {
        setResults(searchData.results);
        setSearchInfo({
          resultCount: searchData.resultCount,
          duration: searchData.duration,
          cached: searchData.cached,
        });

        if (searchData.results.length === 0) {
          setError('No results found. Try rephrasing your search.');
        }
      } else {
        setError('Search failed. Please try again.');
      }
    } catch (err) {
      console.error('Search error:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResultPress = (messageId: string) => {
    onNavigateToMessage(messageId);
    onClose();
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  const getRelevanceColor = (relevance: number) => {
    if (relevance >= 80) return COLORS.success;
    if (relevance >= 60) return COLORS.primary;
    return COLORS.warning;
  };

  const getRelevanceLabel = (relevance: number) => {
    if (relevance >= 80) return 'Highly Relevant';
    if (relevance >= 60) return 'Relevant';
    return 'Possibly Relevant';
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={28} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Semantic Search</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color={COLORS.textSecondary} />
            <TextInput
              ref={searchInputRef}
              style={styles.searchInput}
              placeholder="Search messages (e.g., 'database migration discussion')"
              value={query}
              onChangeText={setQuery}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
              autoCapitalize="none"
              autoCorrect={false}
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={() => setQuery('')}>
                <Ionicons name="close-circle" size={20} color={COLORS.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity
            style={[styles.searchButton, isLoading && styles.searchButtonDisabled]}
            onPress={handleSearch}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={COLORS.background} size="small" />
            ) : (
              <Text style={styles.searchButtonText}>Search</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Search Info */}
        {searchInfo && (
          <View style={styles.searchInfo}>
            <Text style={styles.searchInfoText}>
              {searchInfo.resultCount} result{searchInfo.resultCount !== 1 ? 's' : ''} •{' '}
              {searchInfo.duration}ms {searchInfo.cached && '(cached)'}
            </Text>
          </View>
        )}

        {/* Results */}
        <ScrollView style={styles.resultsContainer} contentContainerStyle={styles.resultsContent}>
          {/* Loading State */}
          {isLoading && (
            <View style={styles.emptyState}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={styles.emptyStateText}>Searching messages...</Text>
            </View>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle-outline" size={48} color={COLORS.error} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Indexing State (when embeddings are being generated) */}
          {results.length === 0 && hasSearched && !isLoading && !error && (
            <View style={styles.emptyState}>
              <Ionicons name="sync-circle-outline" size={64} color={COLORS.primary} />
              <Text style={styles.emptyStateTitle}>Indexing Messages</Text>
              <Text style={styles.emptyStateText}>
                Messages are being indexed for search. Try again in 10 seconds!
              </Text>
            </View>
          )}

          {/* Empty State (no search yet) */}
          {!hasSearched && !isLoading && (
            <View style={styles.emptyState}>
              <Ionicons name="search" size={64} color={COLORS.textSecondary} />
              <Text style={styles.emptyStateTitle}>Search Your Messages</Text>
              <Text style={styles.emptyStateText}>
                Find messages using natural language
              </Text>
              <View style={styles.exampleContainer}>
                <Text style={styles.exampleTitle}>Examples:</Text>
                <Text style={styles.exampleText}>• "database migration strategy"</Text>
                <Text style={styles.exampleText}>• "authentication bug discussion"</Text>
                <Text style={styles.exampleText}>• "API design decisions"</Text>
              </View>
            </View>
          )}

          {/* Results List */}
          {results.length > 0 && !isLoading && (
            <View style={styles.resultsList}>
              {results.map((result, index) => (
                <TouchableOpacity
                  key={result.messageId}
                  style={styles.resultItem}
                  onPress={() => handleResultPress(result.messageId)}
                >
                  {/* Result Header */}
                  <View style={styles.resultHeader}>
                    <View style={styles.resultHeaderLeft}>
                      <Text style={styles.resultSender}>{result.senderName}</Text>
                      <Text style={styles.resultTime}>{formatDate(result.timestamp)}</Text>
                    </View>
                    <View style={styles.relevanceBadge}>
                      <View
                        style={[
                          styles.relevanceDot,
                          { backgroundColor: getRelevanceColor(result.relevance) },
                        ]}
                      />
                      <Text
                        style={[
                          styles.relevanceText,
                          { color: getRelevanceColor(result.relevance) },
                        ]}
                      >
                        {result.relevance}%
                      </Text>
                    </View>
                  </View>

                  {/* Message Content */}
                  <Text style={styles.resultContent} numberOfLines={3}>
                    {result.content}
                  </Text>

                  {/* Relevance Label */}
                  <Text
                    style={[
                      styles.relevanceLabel,
                      { color: getRelevanceColor(result.relevance) },
                    ]}
                  >
                    {getRelevanceLabel(result.relevance)}
                  </Text>

                  {/* Navigate Icon */}
                  <View style={styles.navigateIcon}>
                    <Ionicons name="arrow-forward" size={20} color={COLORS.primary} />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingTop: Platform.OS === 'ios' ? 50 : 12,
  },
  closeButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  placeholder: {
    width: 44,
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.inputBackground,
    borderRadius: 12,
    paddingHorizontal: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: COLORS.text,
    paddingVertical: 12,
  },
  searchButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 80,
  },
  searchButtonDisabled: {
    backgroundColor: COLORS.textSecondary,
  },
  searchButtonText: {
    color: COLORS.background,
    fontSize: 15,
    fontWeight: '600',
  },
  searchInfo: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  searchInfoText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  resultsContainer: {
    flex: 1,
  },
  resultsContent: {
    flexGrow: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 8,
  },
  exampleContainer: {
    marginTop: 32,
    padding: 16,
    backgroundColor: COLORS.inputBackground,
    borderRadius: 12,
    width: '100%',
  },
  exampleTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  exampleText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  errorText: {
    fontSize: 15,
    color: COLORS.error,
    textAlign: 'center',
    marginTop: 16,
  },
  resultsList: {
    padding: 16,
    gap: 12,
  },
  resultItem: {
    backgroundColor: COLORS.inputBackground,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    position: 'relative',
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  resultHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  resultSender: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  resultTime: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  relevanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  relevanceDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  relevanceText: {
    fontSize: 12,
    fontWeight: '600',
  },
  resultContent: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
    marginBottom: 8,
  },
  relevanceLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  navigateIcon: {
    position: 'absolute',
    right: 16,
    bottom: 16,
  },
});

