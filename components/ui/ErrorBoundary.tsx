import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: any) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <SafeAreaView style={styles.container}>
          <View style={styles.content}>
            <MaterialIcons name="error-outline" size={64} color="#F44336" />
            <Text style={styles.title}>Something went wrong</Text>
            <Text style={styles.description}>
              The app encountered an unexpected error. Please try again.
            </Text>
            
            {__DEV__ && this.state.error && (
              <ScrollView style={styles.errorDetails}>
                <Text style={styles.errorTitle}>Error Details (Development):</Text>
                <Text style={styles.errorText}>{this.state.error.toString()}</Text>
                <Text style={styles.errorText}>{this.state.error.stack}</Text>
              </ScrollView>
            )}
            
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => this.setState({ hasError: false, error: null })}
            >
              <MaterialIcons name="refresh" size={20} color="#FFFFFF" />
              <Text style={styles.retryText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FDF8',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1B5E20',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#4A5568',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  errorDetails: {
    maxHeight: 200,
    width: '100%',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 24,
  },
  errorTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F44336',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 12,
    color: '#666666',
    fontFamily: 'monospace',
  },
  retryButton: {
    backgroundColor: '#2E7D32',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    shadowColor: '#2E7D32',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  retryText: {
    color: '#FFFFFF',
    fontWeight: '700',
    marginLeft: 8,
    fontSize: 16,
  },
});

export default ErrorBoundary;