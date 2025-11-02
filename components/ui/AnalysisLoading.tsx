import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

interface AnalysisLoadingProps {
  isVisible: boolean;
  text?: string;
  progress?: number;
}

const AnalysisLoading: React.FC<AnalysisLoadingProps> = ({
  isVisible,
  text = 'Analyzing image...',
  progress = 0,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isVisible) {
      // Start animations
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();

      // Continuous rotation for icons
      const rotateAnimation = Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        })
      );
      rotateAnimation.start();

      // Progress animation
      Animated.timing(progressAnim, {
        toValue: progress,
        duration: 1000,
        useNativeDriver: false,
      }).start();

      return () => {
        rotateAnimation.stop();
      };
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isVisible, progress]);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const rotateReverse = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '-360deg'],
  });

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
    extrapolate: 'clamp',
  });

  if (!isVisible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <View style={styles.content}>
        {/* Animated Icons */}
        <View style={styles.iconContainer}>
          <Animated.View style={{ transform: [{ rotate }] }}>
            <MaterialIcons name="psychology" size={40} color="#2E7D32" />
          </Animated.View>
          <View style={styles.smallIcons}>
            <Animated.View style={[styles.smallIcon, styles.smallIcon1, { transform: [{ rotate }] }]}>
              <MaterialIcons name="visibility" size={16} color="#4CAF50" />
            </Animated.View>
            <Animated.View style={[styles.smallIcon, styles.smallIcon2, { transform: [{ rotate: rotateReverse }] }]}>
              <MaterialIcons name="analytics" size={16} color="#FFC107" />
            </Animated.View>
          </View>
        </View>

        {/* Loading Indicator */}
        <ActivityIndicator size="large" color="#2E7D32" style={styles.spinner} />

        {/* Text */}
        <Text style={styles.title}>AI Analysis in Progress</Text>
        <Text style={styles.subtitle}>{text}</Text>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <Animated.View 
              style={[
                styles.progressFill,
                { width: progressWidth }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>Processing neural networks...</Text>
        </View>

        {/* Steps */}
        <View style={styles.steps}>
          <View style={styles.step}>
            <MaterialIcons name="image" size={16} color="#4CAF50" />
            <Text style={styles.stepText}>Image preprocessing</Text>
            <MaterialIcons name="check" size={16} color="#4CAF50" />
          </View>
          <View style={styles.step}>
            <MaterialIcons name="psychology" size={16} color="#4CAF50" />
            <Text style={styles.stepText}>Feature extraction</Text>
            <ActivityIndicator size="small" color="#4CAF50" />
          </View>
          <View style={styles.step}>
            <MaterialIcons name="analytics" size={16} color="#9E9E9E" />
            <Text style={[styles.stepText, { color: '#9E9E9E' }]}>Classification</Text>
            <View style={styles.placeholder} />
          </View>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    marginHorizontal: 16,
    marginVertical: 16,
  },
  content: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    width: width - 32,
    shadowColor: '#2E7D32',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#E8F5E9',
  },
  iconContainer: {
    position: 'relative',
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
    width: 80,
    height: 80,
  },
  smallIcons: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  smallIcon: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F8FDF8',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  smallIcon1: {
    top: 0,
    right: 10,
  },
  smallIcon2: {
    bottom: 0,
    left: 10,
  },
  spinner: {
    marginVertical: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1B5E20',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 16,
    color: '#4A5568',
    marginBottom: 24,
    textAlign: 'center',
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 24,
  },
  progressBar: {
    width: '100%',
    height: 6,
    backgroundColor: '#E8F5E9',
    borderRadius: 3,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: '#4A5568',
    fontStyle: 'italic',
  },
  steps: {
    width: '100%',
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 4,
    backgroundColor: '#F8FDF8',
    borderRadius: 12,
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    color: '#2E7D32',
    marginLeft: 12,
    fontWeight: '500',
  },
  placeholder: {
    width: 16,
    height: 16,
  },
});

export default AnalysisLoading;