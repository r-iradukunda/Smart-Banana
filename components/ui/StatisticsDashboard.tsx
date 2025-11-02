import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

interface StatisticData {
  totalScans: number;
  healthyCount: number;
  diseaseDetectedCount: number;
  averageConfidence: number;
  recentScans: number;
  diseaseBreakdown: Record<string, number>;
  mostCommonDisease: string;
}

interface StatisticsDashboardProps {
  data: StatisticData;
  onViewHistory?: () => void;
  onExportData?: () => void;
}

const StatisticsDashboard: React.FC<StatisticsDashboardProps> = ({
  data,
  onViewHistory,
  onExportData,
}) => {
  const healthPercentage = data.totalScans > 0 
    ? Math.round((data.healthyCount / data.totalScans) * 100) 
    : 0;

  const diseasePercentage = 100 - healthPercentage;

  const renderStatCard = (
    title: string,
    value: string | number,
    icon: string,
    color: string,
    subtitle?: string,
    trend?: 'up' | 'down' | 'stable'
  ) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={styles.statHeader}>
        <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
          <MaterialIcons name={icon as any} size={24} color={color} />
        </View>
        <View style={styles.statContent}>
          <Text style={styles.statValue}>{value}</Text>
          <Text style={styles.statTitle}>{title}</Text>
          {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
        </View>
        {trend && (
          <View style={styles.trendContainer}>
            <MaterialIcons
              name={
                trend === 'up' ? 'trending-up' : 
                trend === 'down' ? 'trending-down' : 'trending-flat'
              }
              size={16}
              color={
                trend === 'up' ? '#4CAF50' : 
                trend === 'down' ? '#F44336' : '#FF9800'
              }
            />
          </View>
        )}
      </View>
    </View>
  );

  const renderDiseaseBreakdown = () => {
    const diseases = Object.entries(data.diseaseBreakdown)
      .filter(([disease]) => disease.toLowerCase() !== 'healthy')
      .sort(([,a], [,b]) => b - a);

    return (
      <View style={styles.breakdownContainer}>
        <Text style={styles.breakdownTitle}>
          <MaterialIcons name="pie-chart" size={18} color="#1B5E20" />
          {' '}Disease Breakdown
        </Text>
        {diseases.length > 0 ? (
          diseases.map(([disease, count]) => {
            const percentage = data.totalScans > 0 
              ? Math.round((count / data.totalScans) * 100) 
              : 0;
            
            const diseaseColor = getDiseaseColor(disease);
            
            return (
              <View key={disease} style={styles.diseaseItem}>
                <View style={styles.diseaseInfo}>
                  <View style={[styles.diseaseIndicator, { backgroundColor: diseaseColor }]} />
                  <Text style={styles.diseaseName}>{disease}</Text>
                </View>
                <View style={styles.diseaseStats}>
                  <Text style={styles.diseaseCount}>{count}</Text>
                  <Text style={styles.diseasePercentage}>({percentage}%)</Text>
                </View>
              </View>
            );
          })
        ) : (
          <View style={styles.noDiseaseContainer}>
            <MaterialIcons name="check-circle" size={48} color="#4CAF50" />
            <Text style={styles.noDiseaseText}>No diseases detected!</Text>
            <Text style={styles.noDiseaseSubtext}>Your plants are healthy</Text>
          </View>
        )}
      </View>
    );
  };

  const getDiseaseColor = (disease: string): string => {
    switch (disease.toLowerCase()) {
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

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Farm Statistics</Text>
        <Text style={styles.headerSubtitle}>
          Based on {data.totalScans} scan{data.totalScans !== 1 ? 's' : ''}
        </Text>
      </View>

      {/* Main Statistics Grid */}
      <View style={styles.statsGrid}>
        {renderStatCard('Total Scans', data.totalScans, 'analytics', '#2196F3', 'All time')}
        {renderStatCard('Healthy Plants', data.healthyCount, 'check-circle', '#4CAF50', `${healthPercentage}% of total`)}
        {renderStatCard('Diseases Found', data.diseaseDetectedCount, 'warning', '#FF5722', `${diseasePercentage}% of total`)}
        {renderStatCard('Avg Confidence', `${data.averageConfidence}%`, 'psychology', '#9C27B0', 'AI accuracy')}
      </View>

      {/* Recent Activity */}
      <View style={styles.recentActivity}>
        <Text style={styles.sectionTitle}>
          <MaterialIcons name="schedule" size={18} color="#1B5E20" />
          {' '}Recent Activity (30 days)
        </Text>
        <View style={styles.recentCard}>
          <View style={styles.recentIcon}>
            <MaterialIcons name="camera-alt" size={32} color="#2E7D32" />
          </View>
          <View style={styles.recentContent}>
            <Text style={styles.recentValue}>{data.recentScans}</Text>
            <Text style={styles.recentLabel}>Recent Scans</Text>
            <Text style={styles.recentSubtext}>
              {data.recentScans > 0 ? 'Keep monitoring your plants!' : 'No recent activity'}
            </Text>
          </View>
        </View>
      </View>

      {/* Disease Breakdown */}
      {renderDiseaseBreakdown()}

      {/* Health Score */}
      <View style={styles.healthScore}>
        <Text style={styles.sectionTitle}>
          <MaterialIcons name="favorite" size={18} color="#1B5E20" />
          {' '}Farm Health Score
        </Text>
        <View style={styles.scoreContainer}>
          <View style={styles.scoreCircle}>
            <Text style={styles.scoreValue}>{healthPercentage}</Text>
            <Text style={styles.scoreUnit}>%</Text>
          </View>
          <View style={styles.scoreDetails}>
            <Text style={styles.scoreTitle}>Overall Health</Text>
            <Text style={styles.scoreDescription}>
              {healthPercentage >= 80 ? 'Excellent! Your farm is very healthy.' :
               healthPercentage >= 60 ? 'Good! Most plants are healthy.' :
               healthPercentage >= 40 ? 'Fair. Monitor plants more closely.' :
               'Needs attention. Consider consulting an expert.'}
            </Text>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    width: `${healthPercentage}%`,
                    backgroundColor: healthPercentage >= 60 ? '#4CAF50' : '#FF9800'
                  }
                ]} 
              />
            </View>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton} onPress={onViewHistory}>
          <MaterialIcons name="history" size={20} color="#2E7D32" />
          <Text style={styles.actionButtonText}>View History</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton} onPress={onExportData}>
          <MaterialIcons name="file-download" size={20} color="#2E7D32" />
          <Text style={styles.actionButtonText}>Export Data</Text>
        </TouchableOpacity>
      </View>

      {/* Tips Section */}
      <View style={styles.tips}>
        <Text style={styles.sectionTitle}>
          <MaterialIcons name="lightbulb" size={18} color="#1B5E20" />
          {' '}Recommendations
        </Text>
        <View style={styles.tip}>
          <MaterialIcons name="schedule" size={16} color="#FF9800" />
          <Text style={styles.tipText}>
            {data.recentScans < 5 
              ? 'Scan your plants more frequently for better monitoring'
              : 'Great scanning frequency! Keep it up for optimal plant health.'}
          </Text>
        </View>
        {data.diseaseDetectedCount > 0 && (
          <View style={styles.tip}>
            <MaterialIcons name="warning" size={16} color="#F44336" />
            <Text style={styles.tipText}>
              Consider consulting an agricultural expert for treatment advice
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FDF8',
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1B5E20',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#4A5568',
  },
  
  // Stats Grid
  statsGrid: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1B5E20',
    marginBottom: 2,
  },
  statTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4A5568',
    marginBottom: 2,
  },
  statSubtitle: {
    fontSize: 12,
    color: '#718096',
  },
  trendContainer: {
    alignItems: 'center',
  },

  // Sections
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1B5E20',
    marginBottom: 16,
    paddingHorizontal: 16,
  },

  // Recent Activity
  recentActivity: {
    marginBottom: 24,
  },
  recentCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  recentIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  recentContent: {
    flex: 1,
  },
  recentValue: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1B5E20',
  },
  recentLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4A5568',
    marginBottom: 4,
  },
  recentSubtext: {
    fontSize: 12,
    color: '#718096',
  },

  // Disease Breakdown
  breakdownContainer: {
    marginBottom: 24,
  },
  diseaseItem: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  diseaseInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  diseaseIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  diseaseName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1B5E20',
    flex: 1,
  },
  diseaseStats: {
    alignItems: 'flex-end',
  },
  diseaseCount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1B5E20',
  },
  diseasePercentage: {
    fontSize: 12,
    color: '#718096',
  },
  noDiseaseContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  noDiseaseText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4CAF50',
    marginTop: 12,
    marginBottom: 4,
  },
  noDiseaseSubtext: {
    fontSize: 14,
    color: '#4A5568',
  },

  // Health Score
  healthScore: {
    marginBottom: 24,
  },
  scoreContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  scoreCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  scoreValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#2E7D32',
  },
  scoreUnit: {
    fontSize: 12,
    color: '#4A5568',
    position: 'absolute',
    bottom: 18,
    right: 8,
  },
  scoreDetails: {
    flex: 1,
  },
  scoreTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1B5E20',
    marginBottom: 4,
  },
  scoreDescription: {
    fontSize: 14,
    color: '#4A5568',
    marginBottom: 12,
    lineHeight: 20,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },

  // Actions
  actions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 24,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E8F5E9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2E7D32',
    marginLeft: 8,
  },

  // Tips
  tips: {
    marginBottom: 32,
  },
  tip: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tipText: {
    fontSize: 14,
    color: '#4A5568',
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
});

export default StatisticsDashboard;