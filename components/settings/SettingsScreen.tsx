import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useAppSettings } from '@/hooks/useAppSettings';
import { useDiseaseHistory } from '@/hooks/useDiseaseHistory';
import EnhancedHeader from '@/components/ui/EnhancedHeader';

interface SettingsScreenProps {
  onBack?: () => void;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ onBack }) => {
  const {
    settings,
    loading,
    setLanguage,
    toggleSound,
    toggleNotifications,
  } = useAppSettings();

  const { clearHistory } = useDiseaseHistory();

  const handleLanguageChange = (lang: 'en' | 'rw' | 'fr') => {
    setLanguage(lang);
    Alert.alert('Language Changed', `Language set to ${lang.toUpperCase()}`);
  };

  const handleClearHistory = () => {
    Alert.alert(
      'Clear History',
      'Are you sure you want to delete all scan history? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            clearHistory();
            Alert.alert('Success', 'History cleared successfully');
          },
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
        <View style={[styles.settingIcon, { backgroundColor: '#2196F320' }]}>
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
    onPress: () => void
  ) => (
    <TouchableOpacity style={styles.actionButton} onPress={onPress}>
      <View style={styles.settingLeft}>
        <View style={[styles.settingIcon, { backgroundColor: color + '20' }]}>
          <MaterialIcons name={icon as any} size={24} color={color} />
        </View>
        <View style={styles.settingText}>
          <Text style={[styles.settingTitle, { color }]}>{title}</Text>
          <Text style={styles.settingDescription}>{description}</Text>
        </View>
      </View>
      <MaterialIcons name="chevron-right" size={24} color="#C8E6C9" />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading settings...</Text>
        </View>
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
        {/* General Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>General</Text>
          
          {renderLanguageSelector()}
          
          {renderSettingRow(
            'Sound',
            'Enable audio feedback',
            settings.soundEnabled,
            toggleSound,
            'volume-up',
            '#2E7D32'
          )}
          
          {renderSettingRow(
            'Notifications',
            'Receive alerts and reminders',
            settings.notificationsEnabled,
            toggleNotifications,
            'notifications',
            '#4CAF50'
          )}
        </View>

        {/* Data Management */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Management</Text>
          
          {renderActionButton(
            'Clear History',
            'Delete all scan records',
            'delete-sweep',
            '#F44336',
            handleClearHistory
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
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