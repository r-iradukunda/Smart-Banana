import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';

interface DiseaseResultCardProps {
  disease: {
    name: string;
    confidence: number;
    description: string;
    treatment: string;
  };
  onPlayAudio: (text: string) => void;
  onMoreInfo: () => void;
  language: string;
}

const DiseaseResultCard: React.FC<DiseaseResultCardProps> = ({
  disease,
  onPlayAudio,
  onMoreInfo,
  language,
}) => {
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

  const getDiseaseIcon = (diseaseName: string) => {
    switch (diseaseName.toLowerCase()) {
      case 'healthy':
        return 'check-circle';
      case 'cordana':
        return 'warning';
      case 'sigatoka':
        return 'error';
      case 'pestalotiopsis':
        return 'info';
      default:
        return 'help';
    }
  };

  const diseaseColor = getDiseaseColor(disease.name);
  const isHealthy = disease.name.toLowerCase() === 'healthy';

  return (
    <View style={[
      styles.container,
      isHealthy ? styles.healthyCard : styles.diseaseCard,
      { borderLeftColor: diseaseColor }
    ]}>
      {/* Header with disease info */}
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: diseaseColor + '20' }]}>
          <MaterialIcons 
            name={getDiseaseIcon(disease.name)} 
            size={32} 
            color={diseaseColor} 
          />
        </View>
        <View style={styles.headerText}>
          <Text style={[styles.diseaseName, { color: diseaseColor }]}>
            {disease.name}
          </Text>
          <View style={styles.confidenceContainer}>
            <MaterialIcons name="analytics" size={16} color="#4A5568" />
            <Text style={styles.confidenceText}>
              {disease.confidence.toFixed(1)}% confidence
            </Text>
          </View>
        </View>
      </View>

      {/* Description Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <MaterialIcons name="description" size={18} color="#1B5E20" />
          <Text style={styles.sectionTitle}>Description</Text>
          <TouchableOpacity 
            style={styles.audioButton}
            onPress={() => onPlayAudio(disease.description)}
          >
            <MaterialIcons name="volume-up" size={18} color="#2E7D32" />
          </TouchableOpacity>
        </View>
        <Text style={styles.sectionText}>{disease.description}</Text>
      </View>

      {/* Treatment Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <MaterialIcons name="healing" size={18} color="#1B5E20" />
          <Text style={styles.sectionTitle}>Treatment</Text>
          <TouchableOpacity 
            style={styles.audioButton}
            onPress={() => onPlayAudio(disease.treatment)}
          >
            <MaterialIcons name="volume-up" size={18} color="#2E7D32" />
          </TouchableOpacity>
        </View>
        <Text style={styles.sectionText}>{disease.treatment}</Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.secondaryButton]}
          onPress={() => {/* Share functionality */}}
        >
          <MaterialIcons name="share" size={18} color="#2E7D32" />
          <Text style={styles.secondaryButtonText}>Share</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.primaryButton, { backgroundColor: diseaseColor }]}
          onPress={onMoreInfo}
        >
          <MaterialIcons name="info" size={18} color="#FFFFFF" />
          <Text style={styles.primaryButtonText}>Learn More</Text>
          <MaterialIcons name="arrow-forward" size={16} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#E8F5E9',
    borderLeftWidth: 4,
  },
  healthyCard: {
    backgroundColor: '#F8FFF8',
  },
  diseaseCard: {
    backgroundColor: '#FFFBFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  headerText: {
    flex: 1,
  },
  diseaseName: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  confidenceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  confidenceText: {
    fontSize: 14,
    color: '#4A5568',
    marginLeft: 6,
    fontWeight: '600',
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1B5E20',
    marginLeft: 8,
    flex: 1,
    letterSpacing: 0.3,
  },
  audioButton: {
    padding: 6,
    borderRadius: 12,
    backgroundColor: '#E8F5E9',
  },
  sectionText: {
    fontSize: 15,
    color: '#4A5568',
    lineHeight: 24,
    textAlign: 'justify',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    flex: 1,
  },
  primaryButton: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  secondaryButton: {
    backgroundColor: '#E8F5E9',
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    marginHorizontal: 6,
    fontSize: 14,
  },
  secondaryButtonText: {
    color: '#2E7D32',
    fontWeight: '700',
    marginLeft: 6,
    fontSize: 14,
  },
});

export default DiseaseResultCard;