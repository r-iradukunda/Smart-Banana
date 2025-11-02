import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  Share,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useDiseaseHistory, DiseaseRecord } from '@/hooks/useDiseaseHistory';
import EnhancedHeader from '@/components/ui/EnhancedHeader';
import StatisticsDashboard from '@/components/ui/StatisticsDashboard';

const { width } = Dimensions.get('window');

interface HistoryScreenProps {
  onBack?: () => void;
}

const HistoryScreen: React.FC<HistoryScreenProps> = ({ onBack }) => {
  const {
    history,
    loading,
    error,
    deleteRecord,
    clearHistory,
    getStatistics,
  } = useDiseaseHistory();

  const [selectedFilter, setSelectedFilter] = useState<'all' | 'healthy' | 'disease'>('all');
  const [showStats, setShowStats] = useState(false);

  const statistics = useMemo(() => getStatistics(), [history]);

  const filteredHistory = useMemo(() => {
    switch (selectedFilter) {
      case 'healthy':
        return history.filter(record => 
          record.disease.toLowerCase() === 'healthy'
        );
      case 'disease':
        return history.filter(record => 
          record.disease.toLowerCase() !== 'healthy'
        );
      default:
        return history;
    }
  }, [history, selectedFilter]);

  const handleDeleteRecord = (id: string) => {
    Alert.alert(
      'Delete Record',
      'Are you sure you want to delete this record?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteRecord(id),
        },
      ]
    );
  };

  const handleClearHistory = () => {
    Alert.alert(
      'Clear All History',
      'Are you sure you want to delete all scan records? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: clearHistory,
        },
      ]
    );
  };

  const handleShareRecord = async (record: DiseaseRecord) => {
    try {
      const message = `Banana Disease Scan Result:
Disease: ${record.disease}
Confidence: ${record.confidence.toFixed(1)}%
Date: ${record.timestamp.toLocaleDateString()}
${record.location?.address ? `Location: ${record.location.address}` : ''}

Description: ${record.description}

Treatment: ${record.treatment}

Scanned with Smart Banana Disease Detection App`;

      await Share.share({
        message,
        title: 'Disease Scan Result',
      });
    } catch (error) {
      console.error('Error sharing record:', error);
    }
  };

  const handleExportData = async () => {
    try {
      const csvData = history.map(record => [
        record.timestamp.toISOString(),
        record.disease,
        record.confidence.toFixed(1),
        record.location?.latitude || '',
        record.location?.longitude || '',
        record.location?.address || '',
        record.notes || '',
      ]);

      const csvHeaders = [
        'Timestamp',
        'Disease',
        'Confidence',
        'Latitude',
        'Longitude',
        'Address',
        'Notes',
      ];

      const csvContent = [csvHeaders, ...csvData]
        .map(row => row.join(','))
        .join('\n');

      await Share.share({
        message: csvContent,
        title: 'Disease History Data',
      });
    } catch (error) {
      console.error('Error exporting data:', error);
      Alert.alert('Error', 'Failed to export data');
    }
  };

  const getDiseaseColor = (disease: string): string => {
    switch (disease.toLowerCase()) {
      case 'healthy':
        return '#4CAF50';
      case 'cordana':
        return '#D32F2F';
      case 'sigatoka':
        return '#FF5722';
      case 'pestalotiopsis':
        return '#FF9800';
      default:
        return '#9E9E9E';
    }
  };

  const getDiseaseIcon = (disease: string): string => {
    switch (disease.toLowerCase()) {
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

  const renderHistoryItem = ({ item }: { item: DiseaseRecord }) => {
    const diseaseColor = getDiseaseColor(item.disease);
    const isHealthy = item.disease.toLowerCase() === 'healthy';

    return (
      <View style={[styles.historyItem, { borderLeftColor: diseaseColor }]}>
        <View style={styles.itemHeader}>
          <View style={styles.itemLeft}>
            <View style={[styles.diseaseIcon, { backgroundColor: diseaseColor + '20' }]}>
              <MaterialIcons 
                name={getDiseaseIcon(item.disease) as any} 
                size={24} 
                color={diseaseColor} 
              />
            </View>
            <View style={styles.itemInfo}>
              <Text style={[styles.diseaseName, { color: diseaseColor }]}>
                {item.disease}
              </Text>
              <Text style={styles.timestamp}>
                {item.timestamp.toLocaleDateString()} • {item.timestamp.toLocaleTimeString()}
              </Text>
              <Text style={styles.confidence}>
                {item.confidence.toFixed(1)}% confidence
              </Text>
            </View>
          </View>
          <View style={styles.itemActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleShareRecord(item)}
            >
              <MaterialIcons name="share" size={20} color="#4A5568" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleDeleteRecord(item.id)}
            >
              <MaterialIcons name="delete" size={20} color="#F44336" />
            </TouchableOpacity>
          </View>
        </View>

        {item.imageUri && (
          <Image source={{ uri: item.imageUri }} style={styles.itemImage} />
        )}

        {item.location?.address && (
          <View style={styles.locationContainer}>
            <MaterialIcons name="location-on" size={16} color="#4A5568" />
            <Text style={styles.locationText}>{item.location.address}</Text>
          </View>
        )}

        {item.notes && (
          <View style={styles.notesContainer}>
            <Text style={styles.notesLabel}>Notes:</Text>
            <Text style={styles.notesText}>{item.notes}</Text>
          </View>
        )}
      </View>
    );
  };

  const renderFilterButton = (filter: typeof selectedFilter, label: string, count: number) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        selectedFilter === filter && styles.activeFilter,
      ]}
      onPress={() => setSelectedFilter(filter)}
    >
      <Text style={[
        styles.filterText,
        selectedFilter === filter && styles.activeFilterText,
      ]}>
        {label}
      </Text>
      <Text style={[
        styles.filterCount,
        selectedFilter === filter && styles.activeFilterCount,
      ]}>
        {count}
      </Text>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <FontAwesome5 name="history" size={64} color="#C8E6C9" />
      <Text style={styles.emptyTitle}>No Scan History</Text>
      <Text style={styles.emptyDescription}>
        Start scanning banana leaves to build your disease detection history
      </Text>
    </View>
  );

  if (showStats) {
    return (
      <SafeAreaView style={styles.container}>
        <EnhancedHeader
          title="Statistics"
          subtitle="Farm health analytics"
          leftComponent={
            <TouchableOpacity onPress={() => setShowStats(false)}>
              <MaterialIcons name="arrow-back" size={24} color="#FFC107" />
            </TouchableOpacity>
          }
        />
        <StatisticsDashboard
          data={statistics}
          onViewHistory={() => setShowStats(false)}
          onExportData={handleExportData}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      <EnhancedHeader
        title="Scan History"
        subtitle={`${history.length} record${history.length !== 1 ? 's' : ''}`}
        leftComponent={
          onBack ? (
            <TouchableOpacity onPress={onBack}>
              <MaterialIcons name="arrow-back" size={24} color="#FFC107" />
            </TouchableOpacity>
          ) : (
            <FontAwesome5 name="history" size={24} color="#FFC107" />
          )
        }
        rightComponent={
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => setShowStats(true)}
          >
            <MaterialIcons name="analytics" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        }
      />

      {/* Action Bar */}
      <View style={styles.actionBar}>
        <View style={styles.filterContainer}>
          {renderFilterButton('all', 'All', history.length)}
          {renderFilterButton('healthy', 'Healthy', statistics.healthyCount)}
          {renderFilterButton('disease', 'Disease', statistics.diseaseDetectedCount)}
        </View>
        
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.clearButton}
            onPress={handleClearHistory}
            disabled={history.length === 0}
          >
            <MaterialIcons name="clear-all" size={20} color="#F44336" />
          </TouchableOpacity>
        </View>
      </View>

      {/* History List */}
      <FlatList
        data={filteredHistory}
        renderItem={renderHistoryItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyState}
        refreshing={loading}
        onRefresh={() => {/* refresh logic */}}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FDF8',
  },
  headerButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  
  // Action Bar
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E8F5E9',
  },
  filterContainer: {
    flexDirection: 'row',
    flex: 1,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: '#F8FDF8',
    borderWidth: 1,
    borderColor: '#E8F5E9',
    flexDirection: 'row',
    alignItems: 'center',
  },
  activeFilter: {
    backgroundColor: '#2E7D32',
    borderColor: '#2E7D32',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4A5568',
    marginRight: 6,
  },
  activeFilterText: {
    color: '#FFFFFF',
  },
  filterCount: {
    fontSize: 12,
    fontWeight: '700',
    color: '#718096',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    textAlign: 'center',
  },
  activeFilterCount: {
    color: '#2E7D32',
    backgroundColor: '#FFFFFF',
  },
  actionButtons: {
    flexDirection: 'row',
  },
  clearButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#FFEBEE',
  },

  // List
  listContainer: {
    flexGrow: 1,
    paddingVertical: 8,
  },
  
  // History Items
  historyItem: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  itemLeft: {
    flexDirection: 'row',
    flex: 1,
  },
  diseaseIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  itemInfo: {
    flex: 1,
  },
  diseaseName: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 12,
    color: '#718096',
    marginBottom: 2,
  },
  confidence: {
    fontSize: 12,
    color: '#4A5568',
    fontWeight: '600',
  },
  itemActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 8,
    marginLeft: 4,
    borderRadius: 8,
  },
  itemImage: {
    width: '100%',
    height: 120,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: '#F5F5F5',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationText: {
    fontSize: 12,
    color: '#4A5568',
    marginLeft: 4,
    flex: 1,
  },
  notesContainer: {
    backgroundColor: '#F8FDF8',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E8F5E9',
  },
  notesLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2E7D32',
    marginBottom: 4,
  },
  notesText: {
    fontSize: 14,
    color: '#4A5568',
    lineHeight: 20,
  },

  // Empty State
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1B5E20',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 16,
    color: '#4A5568',
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default HistoryScreen;