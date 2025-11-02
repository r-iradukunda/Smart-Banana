import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useAppSettings } from '@/hooks/useAppSettings';
import { useDiseaseHistory } from '@/hooks/useDiseaseHistory';
import EnhancedHeader from '@/components/ui/EnhancedHeader';
import i18n from '@/components/18n';

interface SettingsScreenProps {
  onBack?: () => void;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ onBack }) => {
  const {
    settings,
    loading,
    updateSetting,
    resetSettings,
    exportSettings,
    setLanguage,
    toggleSound,
    toggleNotifications,
    toggleLocation,
    toggleExpertMode,
    getUserExperienceLevel,
  } = useAppSettings();

  const { clearHistory, getStatistics } = useDiseaseHistory();
  const [showAdvanced, setShowAdvanced] = useState(false);

  const statistics = getStatistics();
  const userLevel = getUserExperienceLevel();

  const handleLanguageChange = (lang: 'en' | 'rw' | 'fr') => {
    setLanguage(lang);
  };

  const handleImageQualityChange = (quality: 'low' | 'medium' | 'high') => {
    updateSetting('imageQuality', quality);
  };

  const handleExportData = async () => {
    try {
      const settingsData = await exportSettings();
      await Share.share({
        message: settingsData,
        title: 'App Settings Export',
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to export settings');
    }
  };

  const handleClearHistory = () => {
    Alert.alert(
      'Clear All Data',
      'This will permanently delete all scan history. This action cannot be undone.',
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

  const handleResetSettings = () => {
    Alert.alert(
      'Reset Settings',
      'This will reset all settings to their default values.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: resetSettings,
        },
      ]
    );
  };

  const renderSettingRow = (
    title: string,
    description: string,
    value: boolean,
    onValueChange: () => void,
    icon: string,
    color: string = '#2E7D32'
  ) => (
    <View style={styles.settingRow}>
      <View style={styles.settingLeft}>
        <View style={[styles.settingIcon, { backgroundColor: color + '20' }]}>
          <MaterialIcons name={icon as any} size={24} color={color} />
        </View>
        <View style={styles.settingText}>
          <Text style={styles.settingTitle}>{title}</Text>
          <Text style={styles.settingDescription}>{description}</Text>
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#E0E0E0', true: color + '40' }}
        thumbColor={value ? color : '#F4F3F4'}
        ios_backgroundColor="#E0E0E0"
      />
    </View>
  );

  const renderLanguageSelector = () => (
    <View style={styles.settingRow}>
      <View style={styles.settingLeft}>
        <View style={[styles.settingIcon, { backgroundColor: '#2196F3' + '20' }]}>
          <MaterialIcons name="language" size={24} color="#2196F3" />
        </View>
        <View style={styles.settingText}>
          <Text style={styles.settingTitle}>Language</Text>
          <Text style={styles.settingDescription}>Choose your preferred language</Text>
        </View>
      </View>
      <View style={styles.languageButtons}>
        {(['en', 'rw', 'fr'] as const).map((lang) => (
          <TouchableOpacity
            key={lang}
            style={[
              styles.languageButton,
              settings.language === lang && styles.activeLanguageButton,
            ]}
            onPress={() => handleLanguageChange(lang)}
          >
            <Text
              style={[
                styles.languageButtonText,
                settings.language === lang && styles.activeLanguageButtonText,
              ]}
            >
              {lang.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderActionButton = (
    title: string,
    description: string,
    icon: string,
    color: string,
    onPress: () => void,
    destructive: boolean = false
  ) => (
    <TouchableOpacity style={styles.actionButton} onPress={onPress}>
      <View style={styles.settingLeft}>
        <View style={[styles.settingIcon, { backgroundColor: color + '20' }]}>
          <MaterialIcons name={icon as any} size={24} color={color} />
        </View>
        <View style={styles.settingText}>
          <Text style={[styles.settingTitle, destructive && { color }]}>{title}</Text>
          <Text style={styles.settingDescription}>{description}</Text>
        </View>
      </View>
      <MaterialIcons name="chevron-right" size={24} color="#C8E6C9" />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Loading settings...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      <EnhancedHeader
        title="Settings"
        subtitle="Customize your experience"
        leftComponent={
          onBack ? (
            <TouchableOpacity onPress={onBack}>
              <MaterialIcons name="arrow-back" size={24} color="#FFC107" />
            </TouchableOpacity>
          ) : (
            <MaterialIcons name="settings" size={24} color="#FFC107" />
          )
        }
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* User Level Badge */}
        <View style={styles.userLevelCard}>
          <View style={styles.userLevelContent}>
            <FontAwesome5
              name={userLevel === 'expert' ? 'crown' : userLevel === 'intermediate' ? 'star' : 'leaf'}
              size={24}
              color="#FFC107"
            />
            <Text style={styles.userLevelText}>
              {userLevel.charAt(0).toUpperCase() + userLevel.slice(1)} User
            </Text>
          </View>
          <Text style={styles.userLevelDescription}>
            {statistics.totalScans} scans completed
          </Text>
        </View>

        {/* General Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>General</Text>
          
          {renderLanguageSelector()}
          
          {renderSettingRow(
            'Sound',
            'Enable audio feedback and narration',
            settings.soundEnabled,
            toggleSound,
            'volume-up'
          )}
          
          {renderSettingRow(
            'Notifications',
            'Receive alerts and reminders',
            settings.notificationsEnabled,
            toggleNotifications,
            'notifications',
            '#4CAF50'
          )}
          
          {renderSettingRow(
            'Location Services',
            'Tag scans with GPS coordinates',
            settings.locationEnabled,
            toggleLocation,
            'location-on',
            '#2196F3'
          )}
        </View>

        {/* Data & Privacy */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data & Privacy</Text>
          
          {renderSettingRow(
            'Auto-save Results',
            'Automatically save scan results to history',
            settings.autoSaveResults,
            () => updateSetting('autoSaveResults', !settings.autoSaveResults),
            'save',
            '#4CAF50'
          )}
          
          {renderSettingRow(
            'Analytics',
            'Help improve the app with usage data',
            settings.analyticsEnabled,
            () => updateSetting('analyticsEnabled', !settings.analyticsEnabled),
            'analytics',
            '#9C27B0'
          )}
        </View>

        {/* Advanced */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => setShowAdvanced(!showAdvanced)}
          >
            <Text style={styles.sectionTitle}>Advanced</Text>
            <MaterialIcons
              name={showAdvanced ? 'expand-less' : 'expand-more'}
              size={24}
              color="#4A5568"
            />
          </TouchableOpacity>
          
          {showAdvanced && (
            <>
              {renderSettingRow(
                'Expert Mode',
                'Show advanced features and detailed information',
                settings.expertMode,
                toggleExpertMode,
                'school',
                '#FF5722'
              )}
              
              {renderActionButton(
                'Export Settings',
                'Share your app configuration',
                'file-download',
                '#2196F3',
                handleExportData
              )}
              
              {renderActionButton(
                'Clear History',
                'Delete all scan records',
                'delete-sweep',
                '#F44336',
                handleClearHistory,
                true
              )}
              
              {renderActionButton(
                'Reset Settings',
                'Restore default settings',
                'settings-backup-restore',
                '#FF9800',
                handleResetSettings,
                true
              )}
            </>
          )}
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appInfoTitle}>Banana Guard v1.0.0</Text>
          <Text style={styles.appInfoText}>
            AI-powered disease detection for sustainable agriculture
          </Text>
          <Text style={styles.appInfoText}>
            Made with ❤️ for banana farmers
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FDF8',
  },
  content: {
    flex: 1,
  },
  
  // User Level
  userLevelCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#2E7D32',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#E8F5E9',
  },
  userLevelContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  userLevelText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1B5E20',
    marginLeft: 12,
  },
  userLevelDescription: {
    fontSize: 14,
    color: '#4A5568',
  },

  // Sections
  section: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1B5E20',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },

  // Setting Rows
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1B5E20',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 12,
    color: '#4A5568',
    lineHeight: 16,
  },

  // Language Buttons
  languageButtons: {
    flexDirection: 'row',
  },
  languageButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginLeft: 4,
    backgroundColor: '#F0F0F0',
  },
  activeLanguageButton: {
    backgroundColor: '#2196F3',
  },
  languageButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4A5568',
  },
  activeLanguageButtonText: {
    color: '#FFFFFF',
  },

  // Action Buttons
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },

  // App Info
  appInfo: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  appInfoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1B5E20',
    marginBottom: 8,
  },
  appInfoText: {
    fontSize: 12,
    color: '#4A5568',
    textAlign: 'center',
    marginBottom: 4,
  },
});

export default SettingsScreen;