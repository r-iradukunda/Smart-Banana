import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

interface EnhancedHeaderProps {
  title: string;
  subtitle?: string;
  showLanguageSelector?: boolean;
  selectedLanguage?: string;
  onLanguageChange?: (language: string) => void;
  rightComponent?: React.ReactNode;
  leftComponent?: React.ReactNode;
}

const EnhancedHeader: React.FC<EnhancedHeaderProps> = ({
  title,
  subtitle,
  showLanguageSelector = false,
  selectedLanguage = 'en',
  onLanguageChange,
  rightComponent,
  leftComponent,
}) => {
  const languages = [
    { code: 'en', name: 'EN' },
    { code: 'rw', name: 'RW' },
    { code: 'fr', name: 'FR' },
  ];

  return (
    <>
      <StatusBar style="light" />
      <View style={styles.container}>
        <View style={styles.content}>
          {/* Left side */}
          <View style={styles.leftSection}>
            {leftComponent || (
              <FontAwesome5 name="leaf" size={24} color="#FFC107" />
            )}
            <View style={styles.titleContainer}>
              <Text style={styles.title}>{title}</Text>
              {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
            </View>
          </View>

          {/* Right side */}
          <View style={styles.rightSection}>
            {showLanguageSelector && onLanguageChange ? (
              <View style={styles.languageSelector}>
                {languages.map((lang) => (
                  <TouchableOpacity
                    key={lang.code}
                    style={[
                      styles.langButton,
                      selectedLanguage === lang.code && styles.activeLang,
                    ]}
                    onPress={() => onLanguageChange(lang.code)}
                  >
                    <Text
                      style={[
                        styles.langText,
                        selectedLanguage === lang.code && styles.activeLangText,
                      ]}
                    >
                      {lang.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              rightComponent
            )}
          </View>
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#2E7D32',
    paddingTop: Platform.OS === 'ios' ? 0 : 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  titleContainer: {
    marginLeft: 12,
    flex: 1,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  subtitle: {
    color: '#C8E6C9',
    fontSize: 14,
    marginTop: 2,
  },
  rightSection: {
    alignItems: 'flex-end',
  },
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
});

export default EnhancedHeader;