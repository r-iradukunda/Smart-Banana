import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
  Dimensions,
  Animated,
} from 'react-native';
import { Camera } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { MaterialIcons, FontAwesome5, AntDesign, Ionicons } from '@expo/vector-icons';
// LinearGradient removed due to dependency issues

import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import i18n from '@/components/18n';
import { styles } from '@/assets/styles/style';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { Button} from 'react-native';
import * as FileSystem from 'expo-file-system';
import { Audio } from 'expo-av';
import { useDiseaseHistory } from '@/hooks/useDiseaseHistory';
import { useLocation } from '@/hooks/useLocation';
import { useAppSettings } from '@/hooks/useAppSettings';
import { useNotifications } from '@/components/ui/NotificationManager';
import AnalysisLoading from '@/components/ui/AnalysisLoading';
import OnboardingScreen from '@/components/ui/OnboardingScreen';
import { TTSService, TTSOptions } from '@/services/TTSService';
import ErrorModal from '@/components/ErrorModal';
import Logger from '@/utils/Logger';

const { width } = Dimensions.get('window');

// Enhanced Types for new API response
interface Disease {
  name: string;
  confidence: number;
  description: string;
  treatment: string;
}

// New interface for API response with rejection handling
interface ApiResponse {
  success: boolean;
  is_rejected: boolean;
  message: string;
  
  // Fields present when rejected
  rejection_reasons?: string[];
  technical_details?: {
    confidence: number;
    entropy: number;
    is_leaf_like: boolean;
    predicted_class: string;
    all_probabilities: Record<string, number>;
  };
  
  // Fields present when accepted (valid banana leaf)
  predicted_disease?: string;
  confidence?: string;
  confidence_score?: number;
  entropy?: number;
  certainty_score?: number;
  detailed_probabilities?: Record<string, string>;
  raw_probabilities?: Record<string, number>;
  is_leaf_like?: boolean;
  disease_info?: {
    description: string;
    severity: string;
    recommendation: string;
    urgent: boolean;
  };
}

const BananaDiseaseDetectionScreen: React.FC = () => {
  // ALL HOOKS MUST BE DECLARED FIRST - BEFORE ANY CONDITIONAL LOGIC
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [detectedDisease, setDetectedDisease] = useState<Disease | null>(null);
  const [cameraVisible, setCameraVisible] = useState<boolean>(false);
  const [cameraRef, setCameraRef] = useState<any | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('en');
  const [isSoundMuted, setIsSoundMuted] = useState<boolean>(false);
  const [isSoundMuted2, setIsSoundMuted2] = useState<boolean>(false);
  const [audiourl, setAudiourl] = useState<any>(null);
  const [responseData, setResponseData] = useState<ApiResponse | null>(null);
  const [facing, setFacing] = useState<CameraType>('back');
  const [isLoadingAudio1, setIsLoadingAudio1] = useState<boolean>(false);
  const [isLoadingAudio2, setIsLoadingAudio2] = useState<boolean>(false);
  
  // New states for rejection handling
  const [isImageRejected, setIsImageRejected] = useState<boolean>(false);
  const [rejectionMessage, setRejectionMessage] = useState<string>('');
  const [rejectionReasons, setRejectionReasons] = useState<string[]>([]);
  
  // Error modal states
  const [showErrorModal, setShowErrorModal] = useState<boolean>(false);
  const [retryAttempt, setRetryAttempt] = useState<number>(0);
  
  // Custom hooks
  const [permission, requestPermission] = useCameraPermissions();
  const { addRecord, getStatistics } = useDiseaseHistory();
  const { getCurrentLocation } = useLocation();
  const { settings, completeOnboarding } = useAppSettings();
  const { showSuccess, showError, showWarning } = useNotifications();
  
  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  // Request camera permissions and initialize audio on component mount
  useEffect(() => {
    (async () => {
      // Camera permissions
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
      
      // Initialize audio for mobile
      if (Platform.OS !== 'web') {
        try {
          await Audio.setAudioModeAsync({
            allowsRecordingIOS: false,
            staysActiveInBackground: false,
            playsInSilentModeIOS: true,
            shouldDuckAndroid: true,
            playThroughEarpieceAndroid: false,
          });
          Logger.debug("Audio mode configured successfully");
        } catch (audioError) {
          Logger.silentError('Failed to configure audio mode:', audioError);
        }
        
        // Media library permissions
        const { status: mediaLibraryStatus } = 
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (mediaLibraryStatus !== 'granted') {
          Alert.alert(
            i18n.t('permissions.mediaTitle'),
            i18n.t('permissions.mediaMessage')
          );
        }
      }
      
      // Note: Location permission is handled gracefully in analyzeImage()
      // The app works perfectly without location data
    })();
  }, []);

  // Animate components on mount
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Animate results when disease is detected
  useEffect(() => {
    if (detectedDisease) {
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 0.95,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [detectedDisease]);

  // Animate rejection feedback
  useEffect(() => {
    if (isImageRejected) {
      // Shake animation for rejection
      Animated.sequence([
        Animated.timing(shakeAnim, {
          toValue: 10,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: -10,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: 10,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isImageRejected]);

  // Cleanup audio when component unmounts
  useEffect(() => {
    return () => {
      if (audiourl) {
        audiourl.unloadAsync().catch(Logger.silentError);
      }
    };
  }, [audiourl]);

  // CONDITIONAL RENDERING AFTER ALL HOOKS
  // Check if onboarding should be shown
  if (settings.firstLaunch && !settings.onboardingCompleted) {
    return (
      <OnboardingScreen
        onComplete={async () => {
          await completeOnboarding();
          showSuccess(
            i18n.t('appTitle'),
            i18n.t('instructions.capture'),
            5000
          );
        }}
      />
    );
  }

  // Permission checks
  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }

  if (hasPermission === null) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#2E7D32" />
        <Text style={styles.loadingText}>{i18n.t('loading')}</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.centeredContainer}>
        <MaterialIcons name="no-photography" size={64} color="#D32F2F" />
        <Text style={styles.errorText}>{i18n.t('permissions.cameraRequired')}</Text>
      </View>
    );
  }

  // FUNCTION DEFINITIONS
  const takePicture = async () => {
    if (cameraRef) {
      try {
        const photo = await cameraRef.takePictureAsync();
  
        const timestamp = Date.now();
        const newPath = `${FileSystem.cacheDirectory}capturedPhoto_${timestamp}.jpg`;
  
        await FileSystem.copyAsync({
          from: photo.uri,
          to: newPath,
        });
  
        setCapturedImage(newPath);
        setCameraVisible(false);
        analyzeImage(newPath);
        Logger.debug("Captured image path:", newPath);
      } catch (error) {
        Logger.silentError('Error taking picture:', error);
        Alert.alert(i18n.t('errors.cameraError'));
      }
    } else {
      Logger.silentError('Camera reference is not available');
      Alert.alert('Error', 'Camera is not ready');
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setCapturedImage(result.assets[0].uri);
        analyzeImage(result.assets[0].uri);
      }
    } catch (error) {
      Logger.silentError('Error picking image:', error);
      Alert.alert(i18n.t('errors.galleryError'));
    }
  };

  const handlePindoTextRead = async (text: string, setLoadingState?: (loading: boolean) => void) => {
    try {
      Logger.debug('Starting enhanced text-to-speech for:', text.substring(0, 50) + '...');
      
      // Set loading state
      if (setLoadingState) {
        setLoadingState(true);
      }

      // Reset retry attempt counter
      setRetryAttempt(0);

      const ttsOptions: TTSOptions = {
        text: text,
        language: 'rw',
        onSuccess: async (audioUrl: string) => {
          Logger.debug('Enhanced TTS Success, playing audio from:', audioUrl);
          
          try {
            // Unload any existing sound
            if (audiourl) {
              try {
                await audiourl.unloadAsync();
              } catch (unloadError) {
                Logger.silentError('Error unloading previous sound:', unloadError);
              }
            }

            // Create and play new sound
            const { sound } = await Audio.Sound.createAsync(
              { uri: audioUrl },
              { 
                shouldPlay: true,
                volume: 1.0,
                rate: 1.0,
                positionMillis: 0,
                progressUpdateIntervalMillis: 100,
                isLooping: false,
              }
            );
            
            setAudiourl(sound);
            
            // Set up completion handler to unload sound
            sound.setOnPlaybackStatusUpdate((status) => {
              if (status.isLoaded && status.didJustFinish) {
                Logger.debug('Audio playback finished');
                sound.unloadAsync().catch(Logger.silentError);
              }
            });
            
            // Show success notification
            showSuccess(i18n.t('notifications.audioPlaying'), i18n.t('notifications.audioPlaying'), 2000);
            
          } catch (playError) {
            Logger.silentError('Error playing audio:', playError);
            showError(i18n.t('notifications.audioError'), i18n.t('notifications.audioError'), 3000);
          } finally {
            if (setLoadingState) {
              setLoadingState(false);
            }
          }
        },
        onError: (error: any) => {
          Logger.silentError('Enhanced TTS Error:', error);
          if (setLoadingState) {
            setLoadingState(false);
          }
          setShowErrorModal(true);
        },
        onRetryAttempt: (attempt: number) => {
          setRetryAttempt(attempt);
          Logger.debug(`TTS Retry attempt: ${attempt}`);
        }
      };

      const result = await TTSService.generateAudio(ttsOptions);
      
      if (!result.success) {
        Logger.debug('Enhanced TTS failed after all retries');
        // Error was already handled by onError callback
      }
      
    } catch (error) {
      Logger.silentError('Unexpected error in enhanced handlePindoTextRead:', error);
      if (setLoadingState) {
        setLoadingState(false);
      }
      setShowErrorModal(true);
    }
  };

  // Enhanced analyzeImage function with rejection handling
  const analyzeImage = async (imageUri: string) => {
    Logger.debug("Processing image:", imageUri);
    setIsAnalyzing(true);
    
    // Reset previous states
    setDetectedDisease(null);
    setIsImageRejected(false);
    setRejectionMessage('');
    setRejectionReasons([]);
    
    try {
      const formData = new FormData();
      
      const filename = imageUri?.split('/').pop() || 'image.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';
      
      if (Platform.OS === 'web') {
        const response = await fetch(imageUri);
        const blob = await response.blob();
        formData.append('file', blob, 'image.jpg');
      } else {
        formData.append('file', {
          uri: imageUri,
          name: filename,
          type,
        } as any);
      }
      
      const requestOptions = {
        method: 'POST',
        body: formData,
        headers: {},
      };
      
      Logger.debug('Sending request to enhanced prediction API...');
      
      const response = await fetch('https://smart-banana.onrender.com/predict', requestOptions);
      Logger.debug('Response from prediction API:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        Logger.silentError('API Error:', response.status, errorText);
        throw new Error(`API request failed with status: ${response.status}`);
      }
      
      const data: ApiResponse = await response.json();
      Logger.debug('Enhanced Prediction API Response:', data);
      setResponseData(data);
      
      // Handle rejection cases
      if (data.is_rejected) {
        setIsImageRejected(true);
        setRejectionMessage(data.message);
        setRejectionReasons(data.rejection_reasons || []);
        
        // Show rejection warning
        showWarning(
          i18n.t('notifications.imageRejected'),
          data.message,
          5000
        );
        
        // Optional: Save rejected attempt to history for analysis (graceful handling)
        try {
          let location = null;
          try {
            const currentLocation = await getCurrentLocation();
            location = currentLocation; // Will be null if no permission, that's fine
          } catch (locationError) {
            // Completely ignore location errors
            location = null;
          }
          
          await addRecord({
            disease: 'REJECTED',
            confidence: 0,
            imageUri: imageUri,
            description: data.message,
            treatment: i18n.t('rejectionMessage'),
            location: location,
            language: selectedLanguage,
            isRejected: true,
            rejectionReasons: data.rejection_reasons || [],
          });
        } catch (err) {
          Logger.silentError('Failed to save rejection to history:', err);
        }
        
        return; // Exit early for rejected images
      }
      
      // Handle accepted images (valid banana leaves)
      if (data.predicted_disease) {
        const diseaseKey = data.predicted_disease;
        const details = getDiseaseDetails(diseaseKey);
        
        const detectedDisease: Disease = {
          name: capitalizeFirstLetter(diseaseKey),
          confidence: data.confidence_score ? data.confidence_score * 100 : parseFloat(data.confidence?.replace('%', '') || '0'),
          description: data.disease_info?.description || details.description,
          treatment: data.disease_info?.recommendation || details.treatment,
        };
        
        setDetectedDisease(detectedDisease);
      
        // Add to disease history with location (graceful handling)
        try {
          let location = null;
          try {
            const currentLocation = await getCurrentLocation();
            location = currentLocation; // Will be null if no permission, that's fine
          } catch (locationError) {
            // Completely ignore location errors
            location = null;
          }
          
          await addRecord({
            disease: detectedDisease.name,
            confidence: detectedDisease.confidence,
            imageUri: imageUri,
            description: detectedDisease.description,
            treatment: detectedDisease.treatment,
            location: location,
            language: selectedLanguage,
            isRejected: false,
            // Additional enhanced data
            entropy: data.entropy,
            certaintyScore: data.certainty_score,
            rawProbabilities: data.raw_probabilities,
            isUrgent: data.disease_info?.urgent,
          });
          
          // Show appropriate success message based on disease severity
          const isHealthy = diseaseKey.toLowerCase() === 'healthy';
          const isUrgent = data.disease_info?.urgent;
          
          if (isHealthy) {
            showSuccess(
              i18n.t('notifications.healthyDetected'),
              `${i18n.t('results.confidence')}: ${detectedDisease.confidence.toFixed(1)}%`,
              4000
            );
          } else if (isUrgent) {
            showError(
              i18n.t('notifications.urgentDisease'),
              `${detectedDisease.name} ${i18n.t('notifications.urgentMessage')}`,
              6000
            );
          } else {
            showWarning(
              i18n.t('notifications.diseaseDetected'),
              `${detectedDisease.name} (${detectedDisease.confidence.toFixed(1)}% ${i18n.t('results.confidence')})`,
              5000
            );
          }
        } catch (err) {
          Logger.silentError('Failed to save to history:', err);
        }
      }
    } catch (error) {
      Logger.silentError('Error during image analysis:', error);
      showError(
        i18n.t('errors.analyzeError'),
        i18n.t('errors.analysisFailedNetwork'),
        5000
      );
      
      if (__DEV__) {
        Logger.debug('Using mock data for development');
        const mockResponse: Disease = {
          name: 'Sigatoka',
          confidence: 94.7,
          description: 'Mock disease description for development.',
          treatment: 'Mock treatment information for development.'
        };
        setDetectedDisease(mockResponse);
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  interface DiseaseDetails {
    description: string;
    treatment: string;
  }

  const getDiseaseDetails = (diseaseKey: string): { description: string; treatment: string } => {
    switch (diseaseKey.toLowerCase()) {
      case 'cordana':
        return {
          description: i18n.t('cordanadescription'),
          treatment: i18n.t('cordanatreatment'),
        };
      case 'healthy':
        return {
          description: i18n.t('healthyDescription'),
          treatment: i18n.t('healthyTreatment'),
        };
      case 'pestalotiopsis':
        return {
          description: i18n.t('pestalotiopsisDescription'),
          treatment: i18n.t('pestalotiopsisTreatment'),
        };
      case 'sigatoka':
        return {
          description: i18n.t('sigatokaDescription'),
          treatment: i18n.t('sigatokaTreatment'),
        };
      default:
        return {
          description: 'No detailed information available.',
          treatment: 'Consult with an agricultural expert for appropriate treatment options.',
        };
    }
  };

  const capitalizeFirstLetter = (string: string): string => {
    if (!string) return '';
    return string.charAt(0).toUpperCase() + string.replace('_', ' ').slice(1);
  };

  const resetDetection = () => {
    setCapturedImage(null);
    setDetectedDisease(null);
    setResponseData(null);
    setIsImageRejected(false);
    setRejectionMessage('');
    setRejectionReasons([]);
    
    // Reset animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 50,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  const changeLanguage = (langCode: string) => {
    setSelectedLanguage(langCode);
    i18n.locale = langCode;
  };

  const renderSpeakerButton = (
    text: string, 
    isMuted: boolean, 
    setMuted: (value: boolean) => void,
    isLoading: boolean,
    setLoadingState: (loading: boolean) => void
  ) => (
    <TouchableOpacity
      style={[
        styles.speakerButton,
        isLoading && styles.speakerButtonLoading
      ]}
      onPress={() => {
        if (isLoading) return; // Prevent clicks while loading
        
        if (isMuted) {
          // If currently muted, unmute and play
          setMuted(false);
          handlePindoTextRead(text, setLoadingState);
        } else {
          // If currently playing, mute/stop
          setMuted(true);
          if (audiourl) {
            audiourl.stopAsync().catch(Logger.silentError);
          }
        }
      }}
      disabled={isLoading}
    >
      {isLoading ? (
        <ActivityIndicator size={16} color="#2E7D32" />
      ) : isMuted ? (
        <Ionicons name="volume-mute-outline" size={20} color="#718096" />
      ) : (
        <AntDesign name="sound" size={20} color="#2E7D32" />
      )}
    </TouchableOpacity>
  );

  const getDiseaseColor = (diseaseName: string) => {
    switch (diseaseName.toLowerCase()) {
      case 'healthy':
        return '#4CAF50';
      case 'cordana':
        return '#D32F2F';
      case 'sigatoka':
        return '#FF5722';
      case 'pestalotiopsis':
        return '#FF9800';
      default:
        return '#D32F2F';
    }
  };

  // New component for rendering rejection feedback
  const renderRejectionFeedback = () => {
    if (!isImageRejected) return null;

    return (
      <Animated.View style={[
        rejectionStyles.rejectionContainer,
        { transform: [{ translateX: shakeAnim }] }
      ]}>
        <View style={rejectionStyles.rejectionHeader}>
          <MaterialIcons name="warning" size={32} color="#FF5722" />
          <Text style={rejectionStyles.rejectionTitle}>{i18n.t('imageRejected')}</Text>
        </View>
        
        <Text style={rejectionStyles.rejectionMessage}>{rejectionMessage}</Text>
        
        {rejectionReasons.length > 0 && (
          <View style={rejectionStyles.rejectionReasonsContainer}>
            <Text style={rejectionStyles.rejectionReasonsTitle}>{i18n.t('rejectionReasons')}:</Text>
            {rejectionReasons.map((reason, index) => (
              <View key={index} style={rejectionStyles.rejectionReasonItem}>
                <MaterialIcons name="error-outline" size={16} color="#FF5722" />
                <Text style={rejectionStyles.rejectionReasonText}>{reason}</Text>
              </View>
            ))}
          </View>
        )}
        
        <View style={rejectionStyles.rejectionTips}>
          <Text style={rejectionStyles.rejectionTipsTitle}>{i18n.t('rejectionTips.title')}</Text>
          <Text style={rejectionStyles.rejectionTip}>{i18n.t('rejectionTips.tip1')}</Text>
          <Text style={rejectionStyles.rejectionTip}>{i18n.t('rejectionTips.tip2')}</Text>
          <Text style={rejectionStyles.rejectionTip}>{i18n.t('rejectionTips.tip3')}</Text>
          <Text style={rejectionStyles.rejectionTip}>{i18n.t('rejectionTips.tip4')}</Text>
        </View>
        
        {responseData?.technical_details && (
          <TouchableOpacity 
            style={rejectionStyles.technicalDetailsButton}
            onPress={() => {
              Alert.alert(
                i18n.t('technicalDetails'),
                `${i18n.t('results.confidence')}: ${(responseData.technical_details!.confidence * 100).toFixed(2)}%\nEntropy: ${responseData.technical_details!.entropy.toFixed(4)}\nIs Leaf-like: ${responseData.technical_details!.is_leaf_like ? 'Yes' : 'No'}\nPredicted: ${responseData.technical_details!.predicted_class}`
              );
            }}
          >
            <MaterialIcons name="info-outline" size={16} color="#2E7D32" />
            <Text style={rejectionStyles.technicalDetailsText}>{i18n.t('technicalDetails')}</Text>
          </TouchableOpacity>
        )}
      </Animated.View>
    );
  };

  // MAIN RENDER
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      {/* Enhanced Header with Gradient */}
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <FontAwesome5 name="leaf" size={24} color="#FFC107" style={{ marginRight: 12 }} />
          <Text style={styles.headerTitle}>{i18n.t('appTitle')}</Text>
        </View>
        
        {/* Enhanced Language selector */}
        <View style={styles.languageSelector}>
          {['en', 'rw', 'fr'].map((lang) => (
            <TouchableOpacity 
              key={lang}
              style={[
                styles.langButton, 
                selectedLanguage === lang && styles.activeLang
              ]} 
              onPress={() => changeLanguage(lang)}
            >
              <Text style={[
                styles.langText,
                selectedLanguage === lang && styles.activeLangText
              ]}>
                {lang.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>
        {cameraVisible ? (
          <View style={styles.cameraContainer}>
            <CameraView 
              style={styles.camera}
              facing={facing}
              ref={(ref: any) => setCameraRef(ref)}
            />
            <View style={styles.cameraControlsContainer}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setCameraVisible(false)}
              >
                <MaterialIcons name="close" size={32} color="#FFF" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.cameraButton} 
                onPress={takePicture}
              >
                <MaterialIcons name="camera" size={32} color="#FFF" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.cameraButton}
                onPress={() => setFacing(facing === 'back' ? 'front' : 'back')}
              >
                <MaterialIcons name="flip-camera-ios" size={32} color="#FFF" />
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <Animated.View style={{ 
            opacity: fadeAnim, 
            transform: [{ translateY: slideAnim }] 
          }}>
            {/* Image preview with enhanced styling */}
            {capturedImage ? (
              <View style={styles.imagePreviewContainer}>
                <Image 
                  source={{ uri: capturedImage }} 
                  style={styles.imagePreview} 
                  resizeMode="cover"
                />
                <TouchableOpacity 
                  style={styles.resetButton}
                  onPress={resetDetection}
                >
                  <MaterialIcons name="refresh" size={20} color="#1B5E20" />
                  <Text style={styles.resetButtonText}>{i18n.t('buttons.takeAnother')}</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.placeholderContainer}>
                <View style={styles.placeholderIcon}>
                  <FontAwesome5 name="leaf" size={80} color="#2E7D32" />
                </View>
                <Text style={styles.placeholderText}>
                  {i18n.t('instructions.capture')}
                </Text>
                <View style={styles.captureOptions}>
                  <TouchableOpacity 
                    style={styles.optionButton}
                    onPress={() => setCameraVisible(true)}
                  >
                    <MaterialIcons name="camera-alt" size={24} color="#FFF" />
                    <Text style={styles.optionButtonText}>{i18n.t('buttons.camera')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.optionButton}
                    onPress={pickImage}
                  >
                    <MaterialIcons name="photo-library" size={24} color="#FFF" />
                    <Text style={styles.optionButtonText}>{i18n.t('buttons.gallery')}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Enhanced Analysis Loading */}
            {isAnalyzing && (
              <AnalysisLoading 
                isVisible={isAnalyzing}
                text={i18n.t('analyzing')}
                progress={70}
              />
            )}

            {/* Rejection Feedback */}
            {renderRejectionFeedback()}

            {/* Enhanced Results section */}
            {detectedDisease && !isAnalyzing && !isImageRejected && (
              <Animated.View style={{ 
                transform: [{ scale: scaleAnim }] 
              }}>
                <View style={styles.resultsContainer}>
                  <View style={styles.resultHeader}>
                    <Text style={styles.resultTitle}>{i18n.t('results.title')}</Text>
                    <View style={styles.confidenceIndicator}>
                      <Text style={styles.confidenceText}>
                        {i18n.t('results.aiPowered')}
                      </Text>
                    </View>
                  </View>

                  <View style={[
                    styles.diseaseCard,
                    detectedDisease.name.toLowerCase() === 'healthy' && styles.successCard,
                    detectedDisease.name.toLowerCase() !== 'healthy' && styles.errorCard
                  ]}>
                    <Text style={[
                      styles.diseaseTitle,
                      detectedDisease.name.toLowerCase() === 'healthy' && styles.healthyTitle,
                      { color: getDiseaseColor(detectedDisease.name) }
                    ]}>
                      {detectedDisease.name === 'Cordana' ? i18n.t('kirabiranya') : detectedDisease.name}
                    </Text>

                    {/* Description Section */}
                    <Text style={styles.sectionTitle}>
                      <MaterialIcons name="description" size={18} color="#1B5E20" /> {i18n.t('results.description')}
                    </Text>
                    <View style={styles.speakerPlace}>
                      <Text style={styles.descriptionText}>
                        {getDiseaseDetails(detectedDisease.name).description}
                      </Text>
                      <View style={styles.speakerContainer}>
                        {renderSpeakerButton(
                          getDiseaseDetails(detectedDisease.name).description,
                          isSoundMuted,
                          setIsSoundMuted,
                          isLoadingAudio1,
                          setIsLoadingAudio1
                        )}
                        {isLoadingAudio1 && (
                          <Text style={styles.loadingHint}>
                            {retryAttempt > 0 ? `Retrying... (${retryAttempt}/3)` : `${i18n.t('notifications.audioPlaying')}...`}
                          </Text>
                        )}
                      </View>
                    </View>

                    {/* Treatment Section */}
                    <Text style={styles.sectionTitle}>
                      <MaterialIcons name="healing" size={18} color="#1B5E20" /> {i18n.t('results.treatment')}
                    </Text>
                    <View style={styles.speakerPlace}>
                      <Text style={styles.treatmentText}>
                        {getDiseaseDetails(detectedDisease.name).treatment}
                      </Text>
                      <View style={styles.speakerContainer}>
                        {renderSpeakerButton(
                          getDiseaseDetails(detectedDisease.name).treatment,
                          isSoundMuted2,
                          setIsSoundMuted2,
                          isLoadingAudio2,
                          setIsLoadingAudio2
                        )}
                        {isLoadingAudio2 && (
                          <Text style={styles.loadingHint}>
                            {retryAttempt > 0 ? `Retrying... (${retryAttempt}/3)` : `${i18n.t('notifications.audioPlaying')}...`}
                          </Text>
                        )}
                      </View>
                    </View>

                    {/* Enhanced More Info Button */}
                    {/* <TouchableOpacity style={styles.moreInfoButton}>
                      <MaterialIcons name="info" size={20} color="#FFF" />
                      <Text style={styles.moreInfoButtonText}>
                        {i18n.t('buttons.moreInfo')}
                      </Text>
                      <MaterialIcons name="arrow-forward" size={16} color="#FFF" />
                    </TouchableOpacity> */}
                  </View>
                </View>
              </Animated.View>
            )}

            {/* Enhanced Information Section */}
            <View style={styles.infoContainer}>
              <Text style={styles.infoTitle}>
                <MaterialIcons name="info" size={22} color="#1B5E20" /> {i18n.t('about.title')}
              </Text>
              <Text style={styles.infoText}>{i18n.t('about.description')}</Text>
            </View>

            {/* Quick Stats */}
            {(() => {
              const stats = getStatistics();
              return stats.totalScans > 0 ? (
                <View style={styles.quickStatsContainer}>
                  <Text style={styles.quickStatsTitle}>
                    <MaterialIcons name="analytics" size={18} color="#1B5E20" /> {i18n.t('stats.title')}
                  </Text>
                  <View style={styles.quickStatsGrid}>
                    <View style={styles.quickStat}>
                      <Text style={styles.quickStatValue}>{stats.totalScans}</Text>
                      <Text style={styles.quickStatLabel}>{i18n.t('stats.totalScans')}</Text>
                    </View>
                    <View style={styles.quickStat}>
                      <Text style={[styles.quickStatValue, { color: '#4CAF50' }]}>{stats.healthyCount}</Text>
                      <Text style={styles.quickStatLabel}>{i18n.t('stats.healthy')}</Text>
                    </View>
                    <View style={styles.quickStat}>
                      <Text style={[styles.quickStatValue, { color: '#FF5722' }]}>{stats.diseaseDetectedCount}</Text>
                      <Text style={styles.quickStatLabel}>{i18n.t('stats.diseases')}</Text>
                    </View>
                  </View>
                </View>
              ) : null;
            })()}
          </Animated.View>
        )}
      </ScrollView>
      
      {/* Error Modal for TTS failures */}
      <ErrorModal
        visible={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        onRetry={() => {
          setShowErrorModal(false);
          // Note: The retry will happen automatically through the TTS service
          // This just dismisses the modal, the user can try the speaker button again
        }}
        language={selectedLanguage as 'en' | 'fr' | 'rw'}
      />
    </SafeAreaView>
  );
};

export default BananaDiseaseDetectionScreen;

// Add to existing styles or create new styles for quick stats
const quickStatsStyles = {
  quickStatsContainer: {
    margin: 16,
    marginTop: 8,
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#2E7D32',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E8F5E9',
  },
  quickStatsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1B5E20',
    marginBottom: 12,
    letterSpacing: 0.3,
  },
  quickStatsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  quickStat: {
    alignItems: 'center',
  },
  quickStatValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#2E7D32',
  },
  quickStatLabel: {
    fontSize: 12,
    color: '#4A5568',
    marginTop: 4,
  },
};

// Enhanced styles for rejection feedback
const rejectionStyles = {
  rejectionContainer: {
    margin: 16,
    backgroundColor: '#FFF3E0',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: '#FFB74D',
    shadowColor: '#FF5722',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  rejectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  rejectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FF5722',
    marginLeft: 12,
    letterSpacing: 0.5,
  },
  rejectionMessage: {
    fontSize: 16,
    color: '#E65100',
    lineHeight: 24,
    marginBottom: 16,
    textAlign: 'center',
    fontWeight: '500',
  },
  rejectionReasonsContainer: {
    backgroundColor: '#FFEBEE',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  rejectionReasonsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#D32F2F',
    marginBottom: 12,
  },
  rejectionReasonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  rejectionReasonText: {
    fontSize: 14,
    color: '#C62828',
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
  rejectionTips: {
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  rejectionTipsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2E7D32',
    marginBottom: 12,
  },
  rejectionTip: {
    fontSize: 14,
    color: '#388E3C',
    lineHeight: 22,
    marginBottom: 4,
  },
  technicalDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8F5E9',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  technicalDetailsText: {
    fontSize: 14,
    color: '#2E7D32',
    fontWeight: '600',
    marginLeft: 6,
  },
};

// Merge styles (this would typically be done in the main styles file)
Object.assign(styles, quickStatsStyles);