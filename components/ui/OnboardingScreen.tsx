import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  FlatList,
  Animated,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

const { width, height } = Dimensions.get('window');

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  illustration?: any;
}

const onboardingSteps: OnboardingStep[] = [
  {
    id: '1',
    title: 'AI-Powered Detection',
    description: 'Advanced artificial intelligence analyzes your banana leaves to detect diseases with 95% accuracy in seconds.',
    icon: 'psychology',
    color: '#2E7D32',
  },
  {
    id: '2',
    title: 'Instant Results',
    description: 'Get immediate diagnosis with detailed treatment recommendations tailored to your specific plant condition.',
    icon: 'flash-on',
    color: '#FFC107',
  },
  {
    id: '3',
    title: 'Track Your Progress',
    description: 'Monitor your plantation health over time with comprehensive history tracking and analytics.',
    icon: 'trending-up',
    color: '#4CAF50',
  },
  {
    id: '4',
    title: 'Expert Knowledge',
    description: 'Access professional agricultural advice and treatment guides in multiple languages.',
    icon: 'school',
    color: '#FF5722',
  },
];

interface OnboardingScreenProps {
  onComplete: () => void;
}

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const handleNext = () => {
    if (currentIndex < onboardingSteps.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const handleDotPress = (index: number) => {
    setCurrentIndex(index);
    flatListRef.current?.scrollToIndex({ index, animated: true });
  };

  const renderStep = ({ item, index }: { item: OnboardingStep; index: number }) => {
    return (
      <View style={styles.stepContainer}>
        <View style={styles.stepContent}>
          {/* Icon/Illustration */}
          <View style={[styles.iconContainer, { backgroundColor: item.color + '20' }]}>
            <MaterialIcons name={item.icon as any} size={80} color={item.color} />
          </View>

          {/* Title */}
          <Text style={styles.stepTitle}>{item.title}</Text>

          {/* Description */}
          <Text style={styles.stepDescription}>{item.description}</Text>

          {/* Feature Highlights */}
          <View style={styles.featuresContainer}>
            {index === 0 && (
              <>
                <View style={styles.feature}>
                  <MaterialIcons name="check-circle" size={20} color={item.color} />
                  <Text style={styles.featureText}>Real-time analysis</Text>
                </View>
                <View style={styles.feature}>
                  <MaterialIcons name="check-circle" size={20} color={item.color} />
                  <Text style={styles.featureText}>Multiple disease detection</Text>
                </View>
                <View style={styles.feature}>
                  <MaterialIcons name="check-circle" size={20} color={item.color} />
                  <Text style={styles.featureText}>Offline capability</Text>
                </View>
              </>
            )}
            {index === 1 && (
              <>
                <View style={styles.feature}>
                  <MaterialIcons name="check-circle" size={20} color={item.color} />
                  <Text style={styles.featureText}>Detailed treatment plans</Text>
                </View>
                <View style={styles.feature}>
                  <MaterialIcons name="check-circle" size={20} color={item.color} />
                  <Text style={styles.featureText}>Audio narration</Text>
                </View>
                <View style={styles.feature}>
                  <MaterialIcons name="check-circle" size={20} color={item.color} />
                  <Text style={styles.featureText}>Multi-language support</Text>
                </View>
              </>
            )}
            {index === 2 && (
              <>
                <View style={styles.feature}>
                  <MaterialIcons name="check-circle" size={20} color={item.color} />
                  <Text style={styles.featureText}>Health statistics</Text>
                </View>
                <View style={styles.feature}>
                  <MaterialIcons name="check-circle" size={20} color={item.color} />
                  <Text style={styles.featureText}>Disease trends</Text>
                </View>
                <View style={styles.feature}>
                  <MaterialIcons name="check-circle" size={20} color={item.color} />
                  <Text style={styles.featureText}>Export data</Text>
                </View>
              </>
            )}
            {index === 3 && (
              <>
                <View style={styles.feature}>
                  <MaterialIcons name="check-circle" size={20} color={item.color} />
                  <Text style={styles.featureText}>Professional guidance</Text>
                </View>
                <View style={styles.feature}>
                  <MaterialIcons name="check-circle" size={20} color={item.color} />
                  <Text style={styles.featureText}>Prevention tips</Text>
                </View>
                <View style={styles.feature}>
                  <MaterialIcons name="check-circle" size={20} color={item.color} />
                  <Text style={styles.featureText}>Best practices</Text>
                </View>
              </>
            )}
          </View>
        </View>
      </View>
    );
  };

  const renderDots = () => {
    return (
      <View style={styles.dotsContainer}>
        {onboardingSteps.map((_, index) => {
          const opacity = scrollX.interpolate({
            inputRange: [
              (index - 1) * width,
              index * width,
              (index + 1) * width,
            ],
            outputRange: [0.3, 1, 0.3],
            extrapolate: 'clamp',
          });

          const scale = scrollX.interpolate({
            inputRange: [
              (index - 1) * width,
              index * width,
              (index + 1) * width,
            ],
            outputRange: [0.8, 1.2, 0.8],
            extrapolate: 'clamp',
          });

          return (
            <TouchableOpacity
              key={index}
              onPress={() => handleDotPress(index)}
              style={styles.dotTouchable}
            >
              <Animated.View
                style={[
                  styles.dot,
                  {
                    opacity,
                    transform: [{ scale }],
                    backgroundColor: currentIndex === index ? '#2E7D32' : '#C8E6C9',
                  },
                ]}
              />
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <FontAwesome5 name="leaf" size={32} color="#FFC107" />
          <Text style={styles.headerTitle}>Banana Guard</Text>
        </View>
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      {/* Steps */}
      <FlatList
        ref={flatListRef}
        data={onboardingSteps}
        renderItem={renderStep}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(event.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
        scrollEventThrottle={16}
      />

      {/* Bottom Section */}
      <View style={styles.bottomSection}>
        {renderDots()}
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.button,
              styles.nextButton,
              { backgroundColor: onboardingSteps[currentIndex]?.color || '#2E7D32' },
            ]}
            onPress={handleNext}
          >
            <Text style={styles.buttonText}>
              {currentIndex === onboardingSteps.length - 1 ? 'Get Started' : 'Next'}
            </Text>
            <MaterialIcons 
              name={currentIndex === onboardingSteps.length - 1 ? 'check' : 'arrow-forward'} 
              size={20} 
              color="#FFFFFF" 
            />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FDF8',
  },
  header: {
    backgroundColor: '#2E7D32',
    paddingVertical: 24,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
    marginLeft: 12,
    letterSpacing: 0.5,
  },
  skipButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  skipText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  
  // Steps
  stepContainer: {
    width,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  stepContent: {
    alignItems: 'center',
    maxWidth: 320,
  },
  iconContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1B5E20',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  stepDescription: {
    fontSize: 16,
    color: '#4A5568',
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 32,
  },
  featuresContainer: {
    width: '100%',
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  featureText: {
    fontSize: 14,
    color: '#2E7D32',
    marginLeft: 12,
    fontWeight: '600',
  },

  // Bottom Section
  bottomSection: {
    paddingVertical: 32,
    paddingHorizontal: 32,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  dotTouchable: {
    padding: 8,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginHorizontal: 4,
  },
  buttonContainer: {
    alignItems: 'center',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    minWidth: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  nextButton: {
    backgroundColor: '#2E7D32',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginRight: 8,
    letterSpacing: 0.5,
  },
});

export default OnboardingScreen;