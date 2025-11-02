import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface NotificationData {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onPress: () => void;
  };
}

interface NotificationProps {
  notification: NotificationData;
  onDismiss: (id: string) => void;
}

const Notification: React.FC<NotificationProps> = ({ notification, onDismiss }) => {
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    // Animate in
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto dismiss
    const timer = setTimeout(() => {
      handleDismiss();
    }, notification.duration || 4000);

    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -100,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 0.9,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss(notification.id);
    });
  };

  const getNotificationStyle = () => {
    switch (notification.type) {
      case 'success':
        return {
          backgroundColor: '#4CAF50',
          borderColor: '#388E3C',
          icon: 'check-circle',
        };
      case 'error':
        return {
          backgroundColor: '#F44336',
          borderColor: '#D32F2F',
          icon: 'error',
        };
      case 'warning':
        return {
          backgroundColor: '#FF9800',
          borderColor: '#F57C00',
          icon: 'warning',
        };
      case 'info':
      default:
        return {
          backgroundColor: '#2196F3',
          borderColor: '#1976D2',
          icon: 'info',
        };
    }
  };

  const notificationStyle = getNotificationStyle();

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: notificationStyle.backgroundColor,
          borderColor: notificationStyle.borderColor,
          transform: [{ translateY }, { scale }],
          opacity,
        },
      ]}
    >
      <View style={styles.content}>
        <MaterialIcons
          name={notificationStyle.icon as any}
          size={24}
          color="#FFFFFF"
          style={styles.icon}
        />
        <View style={styles.textContainer}>
          <Text style={styles.title}>{notification.title}</Text>
          {notification.message && (
            <Text style={styles.message}>{notification.message}</Text>
          )}
        </View>
        {notification.action && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={notification.action.onPress}
          >
            <Text style={styles.actionText}>{notification.action.label}</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.closeButton} onPress={handleDismiss}>
          <MaterialIcons name="close" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

interface NotificationManagerProps {
  notifications: NotificationData[];
  onDismiss: (id: string) => void;
}

const NotificationManager: React.FC<NotificationManagerProps> = ({
  notifications,
  onDismiss,
}) => {
  return (
    <View style={styles.manager}>
      {notifications.map((notification) => (
        <Notification
          key={notification.id}
          notification={notification}
          onDismiss={onDismiss}
        />
      ))}
    </View>
  );
};

// Hook for managing notifications
export const useNotifications = () => {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);

  const showNotification = (notification: Omit<NotificationData, 'id'>) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const newNotification: NotificationData = {
      ...notification,
      id,
    };
    setNotifications((prev) => [...prev, newNotification]);
    return id;
  };

  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  // Convenience methods
  const showSuccess = (title: string, message?: string, duration?: number) =>
    showNotification({ type: 'success', title, message, duration });

  const showError = (title: string, message?: string, duration?: number) =>
    showNotification({ type: 'error', title, message, duration });

  const showWarning = (title: string, message?: string, duration?: number) =>
    showNotification({ type: 'warning', title, message, duration });

  const showInfo = (title: string, message?: string, duration?: number) =>
    showNotification({ type: 'info', title, message, duration });

  return {
    notifications,
    showNotification,
    dismissNotification,
    clearAll,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    NotificationManager: () => (
      <NotificationManager
        notifications={notifications}
        onDismiss={dismissNotification}
      />
    ),
  };
};

const styles = StyleSheet.create({
  manager: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    zIndex: 9999,
    paddingHorizontal: 16,
  },
  container: {
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  icon: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  message: {
    color: '#FFFFFF',
    fontSize: 14,
    opacity: 0.9,
    lineHeight: 20,
  },
  actionButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginRight: 8,
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  closeButton: {
    padding: 4,
  },
});

export default NotificationManager;