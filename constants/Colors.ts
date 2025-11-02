/**
 * Enhanced color scheme with modern gradients and sophisticated banana-themed colors
 */

const primaryGreen = '#2E7D32'; // Deep forest green
const accentYellow = '#FFC107'; // Banana yellow
const warningRed = '#D32F2F'; // Disease red
const successGreen = '#4CAF50'; // Healthy green
const backgroundLight = '#F8FDF8'; // Very light green
const cardWhite = '#FFFFFF';
const textDark = '#1B5E20';
const textMedium = '#4A5568';
const textLight = '#718096';

export const Colors = {
  light: {
    // Primary colors
    primary: primaryGreen,
    primaryLight: '#4CAF50',
    primaryDark: '#1B5E20',
    
    // Accent colors
    accent: accentYellow,
    accentLight: '#FFD54F',
    accentDark: '#FF8F00',
    
    // Status colors
    success: successGreen,
    warning: '#FF9800',
    error: warningRed,
    info: '#2196F3',
    
    // Background colors
    background: backgroundLight,
    surface: cardWhite,
    surfaceVariant: '#E8F5E9',
    
    // Text colors
    text: textDark,
    onPrimary: '#FFFFFF',
    onSurface: textDark,
    onBackground: textDark,
    onSurfaceVariant: textMedium,
    outline: '#C8E6C9',
    
    // Original properties for compatibility
    tint: primaryGreen,
    icon: textMedium,
    tabIconDefault: textLight,
    tabIconSelected: primaryGreen,
    
    // Disease-specific colors
    diseases: {
      healthy: '#4CAF50',
      cordana: '#D32F2F',
      sigatoka: '#FF5722',
      pestalotiopsis: '#FF9800',
    },
  },
  
  dark: {
    // Primary colors
    primary: '#4CAF50',
    primaryLight: '#81C784',
    primaryDark: '#2E7D32',
    
    // Accent colors
    accent: '#FFD54F',
    accentLight: '#FFF176',
    accentDark: '#FFC107',
    
    // Status colors
    success: '#66BB6A',
    warning: '#FFB74D',
    error: '#EF5350',
    info: '#42A5F5',
    
    // Background colors
    background: '#121212',
    surface: '#1E1E1E',
    surfaceVariant: '#2A2A2A',
    
    // Text colors
    text: '#FFFFFF',
    onPrimary: '#000000',
    onSurface: '#FFFFFF',
    onBackground: '#FFFFFF',
    onSurfaceVariant: '#CCCCCC',
    outline: '#616161',
    
    // Original properties for compatibility
    tint: '#4CAF50',
    icon: '#888888',
    tabIconDefault: '#888888',
    tabIconSelected: '#4CAF50',
    
    // Disease-specific colors
    diseases: {
      healthy: '#66BB6A',
      cordana: '#EF5350',
      sigatoka: '#FF7043',
      pestalotiopsis: '#FFB74D',
    },
  },
};
