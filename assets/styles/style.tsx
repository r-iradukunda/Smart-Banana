import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

// Enhanced styles with modern design principles
export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FDF8',
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F8FDF8',
  },
  
  // Header styles with gradient support
  header: {
    backgroundColor: '#2E7D32',
    paddingVertical: 20,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  
  // Language selector with pill design
  languageSelector: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    padding: 2,
  },
  langButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginHorizontal: 1,
    borderRadius: 18,
    minWidth: 36,
    alignItems: 'center',
  },
  activeLang: {
    backgroundColor: '#FFFFFF',
  },
  langText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 12,
  },
  activeLangText: {
    color: '#2E7D32',
    fontWeight: '700',
  },
  
  contentContainer: {
    flex: 1,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#2E7D32',
    fontWeight: '500',
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#D32F2F',
    textAlign: 'center',
    fontWeight: '500',
  },
  
  // Camera styles
  cameraContainer: {
    aspectRatio: 3/4,
    width: width - 32,
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 24,
    margin: 16,
  },
  camera: {
    flex: 1,
  },
  cameraControlsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: 40,
    paddingHorizontal: 40,
    height: 140,
  },
  cameraButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 35,
    width: 70,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  cancelButton: {
    backgroundColor: '#D32F2F',
    borderRadius: 35,
    width: 70,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  
  // Enhanced placeholder with modern card design
  placeholderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    borderRadius: 24,
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: '#FFFFFF',
    shadowColor: '#2E7D32',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#E8F5E9',
  },
  placeholderIcon: {
    marginBottom: 16,
  },
  placeholderText: {
    fontSize: 18,
    textAlign: 'center',
    color: '#2E7D32',
    marginBottom: 32,
    fontWeight: '600',
    lineHeight: 24,
  },
  captureOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    gap: 16,
  },
  optionButton: {
    backgroundColor: '#2E7D32',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    flex: 1,
    justifyContent: 'center',
    shadowColor: '#2E7D32',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  optionButtonText: {
    color: '#FFFFFF',
    marginLeft: 8,
    fontWeight: '700',
    fontSize: 16,
  },
  
  // Image preview with enhanced styling
  imagePreviewContainer: {
    margin: 16,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  imagePreview: {
    width: '100%',
    height: 300,
  },
  resetButton: {
    backgroundColor: '#FFC107',
    paddingVertical: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  resetButtonText: {
    color: '#1B5E20',
    fontWeight: '700',
    fontSize: 16,
    marginLeft: 8,
  },
  
  // Analysis loading with enhanced animation support
  analysisContainer: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 20,
    shadowColor: '#2E7D32',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  analysisText: {
    marginTop: 16,
    fontSize: 18,
    color: '#2E7D32',
    fontWeight: '600',
  },
  
  // Enhanced results section
  resultsContainer: {
    margin: 16,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1B5E20',
    letterSpacing: 0.5,
  },
  confidenceIndicator: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  confidenceText: {
    color: '#2E7D32',
    fontWeight: '700',
    fontSize: 14,
  },
  
  // Disease card with modern design
  diseaseCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#E8F5E9',
  },
  diseaseTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#D32F2F',
    marginBottom: 20,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  healthyTitle: {
    color: '#4CAF50',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1B5E20',
    marginTop: 20,
    marginBottom: 12,
    letterSpacing: 0.3,
  },
  descriptionText: {
    flex: 1,
    fontSize: 16,
    color: '#4A5568',
    lineHeight: 26,
    textAlign: 'justify',
  },
  treatmentText: {
    flex: 1,
    fontSize: 16,
    color: '#4A5568',
    lineHeight: 26,
    textAlign: 'justify',
  },
  
  // Speaker controls with enhanced design
  speakerPlace: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
    gap: 12,
  },
  speakerButton: {
    padding: 12,
    borderRadius: 16,
    backgroundColor: '#F8FDF8',
    borderWidth: 1,
    borderColor: '#E8F5E9',
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2E7D32',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  speakerButtonLoading: {
    backgroundColor: '#E8F5E9',
    borderColor: '#C8E6C9',
    shadowOpacity: 0.05,
  },
  speakerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingHint: {
    fontSize: 10,
    color: '#2E7D32',
    marginTop: 4,
    fontStyle: 'italic',
    textAlign: 'center',
    backgroundColor: '#F0F9FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E8F5E9',
    minWidth: 80,
  },
  
  // Enhanced buttons
  moreInfoButton: {
    backgroundColor: '#2E7D32',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    marginTop: 24,
    shadowColor: '#2E7D32',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  moreInfoButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    marginRight: 8,
    fontSize: 16,
    letterSpacing: 0.5,
  },
  
  // Info section with gradient background support
  infoContainer: {
    margin: 16,
    marginTop: 8,
    backgroundColor: '#E8F5E9',
    padding: 24,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#C8E6C9',
    shadowColor: '#2E7D32',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1B5E20',
    marginBottom: 12,
    letterSpacing: 0.3,
  },
  infoText: {
    fontSize: 16,
    color: '#2E7D32',
    lineHeight: 24,
    textAlign: 'justify',
  },
  
  // Additional utility styles
  retry: {
    width: '100%',
    justifyContent: 'center',
    padding: 20,
  },
  
  // Gradient overlays and effects
  gradientOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 100,
  },
  
  // Statistics and progress indicators
  progressBar: {
    height: 6,
    backgroundColor: '#E8F5E9',
    borderRadius: 3,
    marginVertical: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 3,
  },
  
  // Card variations
  warningCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  errorCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#D32F2F',
  },
  successCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
});