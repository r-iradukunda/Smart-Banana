// components/ErrorModal.tsx
import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface ErrorModalProps {
  visible: boolean;
  onClose: () => void;
  onRetry: () => void;
  language: 'en' | 'fr' | 'rw';
}

const { width } = Dimensions.get('window');

const ErrorModal: React.FC<ErrorModalProps> = ({
  visible,
  onClose,
  onRetry,
  language,
}) => {
  const messages = {
    en: {
      title: 'Audio Service Unavailable',
      message: 'The audio service is temporarily unavailable. You can still view your results on screen.',
      retry: 'Try Again',
      continue: 'Continue Without Audio',
      subtitle: 'Third-party service not responding'
    },
    fr: {
      title: 'Service Audio Indisponible',
      message: 'Le service audio est temporairement indisponible. Vous pouvez toujours voir vos résultats à l\'écran.',
      retry: 'Réessayer',
      continue: 'Continuer Sans Audio',
      subtitle: 'Service tiers ne répond pas'
    },
    rw: {
      title: 'Serivisi y\'Amajwi Ntiboneka',
      message: 'Serivisi y\'amajwi ntiboneka bwite. Urashobora kubona ibisubizo byawe kuri ecran.',
      retry: 'Ongera Ugerageze',
      continue: 'Komeza Utamaze Amajwi',
      subtitle: 'Serivisi y\'indi kigo ntisubiza'
    }
  };

  const currentMessages = messages[language] || messages.en;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.iconContainer}>
            <MaterialIcons name="volume-off" size={48} color="#FF6B6B" />
          </View>
          
          <Text style={styles.title}>{currentMessages.title}</Text>
          <Text style={styles.subtitle}>{currentMessages.subtitle}</Text>
          <Text style={styles.message}>{currentMessages.message}</Text>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.button, styles.retryButton]} 
              onPress={onRetry}
            >
              <MaterialIcons name="refresh" size={20} color="#fff" />
              <Text style={styles.retryButtonText}>{currentMessages.retry}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.button, styles.continueButton]} 
              onPress={onClose}
            >
              <Text style={styles.continueButtonText}>{currentMessages.continue}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: width * 0.85,
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  iconContainer: {
    marginBottom: 16,
    backgroundColor: '#FFF5F5',
    borderRadius: 50,
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
    fontStyle: 'italic',
  },
  message: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  retryButton: {
    backgroundColor: '#4CAF50',
  },
  continueButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  continueButtonText: {
    color: '#555',
    fontWeight: '600',
    fontSize: 14,
  },
});

export default ErrorModal;