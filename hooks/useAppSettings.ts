import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '@/components/18n';

export interface AppSettings {
  language: 'en' | 'rw' | 'fr';
  theme: 'light' | 'dark' | 'auto';
  soundEnabled: boolean;
  notificationsEnabled: boolean;
  locationEnabled: boolean;
  autoSaveResults: boolean;
  imageQuality: 'low' | 'medium' | 'high';
  analyticsEnabled: boolean;
  firstLaunch: boolean;
  onboardingCompleted: boolean;
  cameraFlash: boolean;
  vibrationEnabled: boolean;
  autoSync: boolean;
  dataUsageWarning: boolean;
  expertMode: boolean;
}

const DEFAULT_SETTINGS: AppSettings = {
  language: 'en',
  theme: 'auto',
  soundEnabled: true,
  notificationsEnabled: true,
  locationEnabled: true,
  autoSaveResults: true,
  imageQuality: 'high',
  analyticsEnabled: true,
  firstLaunch: true,
  onboardingCompleted: false,
  cameraFlash: false,
  vibrationEnabled: true,
  autoSync: true,
  dataUsageWarning: true,
  expertMode: false,
};

const SETTINGS_STORAGE_KEY = '@app_settings';

export const useAppSettings = () => {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, []);

  // Update i18n locale when language changes
  useEffect(() => {
    i18n.locale = settings.language;
  }, [settings.language]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const storedSettings = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
      if (storedSettings) {
        const parsedSettings = JSON.parse(storedSettings);
        // Merge with defaults to handle new settings
        const mergedSettings = { ...DEFAULT_SETTINGS, ...parsedSettings };
        setSettings(mergedSettings);
      } else {
        // First time user - save defaults
        await saveSettings(DEFAULT_SETTINGS);
      }
    } catch (err) {
      setError('Failed to load settings');
      console.error('Error loading settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (newSettings: AppSettings) => {
    try {
      await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (err) {
      setError('Failed to save settings');
      console.error('Error saving settings:', err);
      throw err;
    }
  };

  const updateSetting = async <K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K]
  ) => {
    try {
      const updatedSettings = { ...settings, [key]: value };
      await saveSettings(updatedSettings);
    } catch (err) {
      console.error(`Error updating setting ${key}:`, err);
      throw err;
    }
  };

  const updateMultipleSettings = async (updates: Partial<AppSettings>) => {
    try {
      const updatedSettings = { ...settings, ...updates };
      await saveSettings(updatedSettings);
    } catch (err) {
      console.error('Error updating multiple settings:', err);
      throw err;
    }
  };

  const resetSettings = async () => {
    try {
      await saveSettings(DEFAULT_SETTINGS);
    } catch (err) {
      console.error('Error resetting settings:', err);
      throw err;
    }
  };

  const exportSettings = async (): Promise<string> => {
    try {
      return JSON.stringify(settings, null, 2);
    } catch (err) {
      console.error('Error exporting settings:', err);
      throw err;
    }
  };

  const importSettings = async (settingsJson: string): Promise<void> => {
    try {
      const importedSettings = JSON.parse(settingsJson);
      // Validate imported settings against defaults
      const validatedSettings = { ...DEFAULT_SETTINGS };
      
      for (const key in importedSettings) {
        if (key in DEFAULT_SETTINGS) {
          validatedSettings[key as keyof AppSettings] = importedSettings[key];
        }
      }
      
      await saveSettings(validatedSettings);
    } catch (err) {
      console.error('Error importing settings:', err);
      throw new Error('Invalid settings format');
    }
  };

  // Convenience methods for common actions
  const completeOnboarding = async () => {
    await updateMultipleSettings({
      firstLaunch: false,
      onboardingCompleted: true,
    });
  };

  const setLanguage = async (language: 'en' | 'rw' | 'fr') => {
    await updateSetting('language', language);
  };

  const setTheme = async (theme: 'light' | 'dark' | 'auto') => {
    await updateSetting('theme', theme);
  };

  const toggleSound = async () => {
    await updateSetting('soundEnabled', !settings.soundEnabled);
  };

  const toggleNotifications = async () => {
    await updateSetting('notificationsEnabled', !settings.notificationsEnabled);
  };

  const toggleLocation = async () => {
    await updateSetting('locationEnabled', !settings.locationEnabled);
  };

  const toggleExpertMode = async () => {
    await updateSetting('expertMode', !settings.expertMode);
  };

  // Get current theme based on settings and system
  const getCurrentTheme = () => {
    if (settings.theme === 'auto') {
      // Here you would check system theme
      // For now, default to light
      return 'light';
    }
    return settings.theme;
  };

  // Check if specific features are enabled
  const isFeatureEnabled = (feature: keyof AppSettings): boolean => {
    return Boolean(settings[feature]);
  };

  // Get user experience level
  const getUserExperienceLevel = (): 'beginner' | 'intermediate' | 'expert' => {
    if (settings.expertMode) return 'expert';
    if (settings.onboardingCompleted) return 'intermediate';
    return 'beginner';
  };

  // Get recommended settings based on user level
  const getRecommendedSettings = (): Partial<AppSettings> => {
    const level = getUserExperienceLevel();
    
    switch (level) {
      case 'expert':
        return {
          imageQuality: 'high',
          autoSaveResults: false,
          analyticsEnabled: true,
          dataUsageWarning: false,
        };
      case 'intermediate':
        return {
          imageQuality: 'medium',
          autoSaveResults: true,
          analyticsEnabled: true,
          dataUsageWarning: true,
        };
      default:
        return {
          imageQuality: 'medium',
          autoSaveResults: true,
          analyticsEnabled: false,
          dataUsageWarning: true,
        };
    }
  };

  return {
    settings,
    loading,
    error,
    updateSetting,
    updateMultipleSettings,
    resetSettings,
    exportSettings,
    importSettings,
    completeOnboarding,
    setLanguage,
    setTheme,
    toggleSound,
    toggleNotifications,
    toggleLocation,
    toggleExpertMode,
    getCurrentTheme,
    isFeatureEnabled,
    getUserExperienceLevel,
    getRecommendedSettings,
    refresh: loadSettings,
  };
};