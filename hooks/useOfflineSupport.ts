import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface OfflineData {
  images: Array<{
    id: string;
    uri: string;
    timestamp: Date;
    analysisResult?: any;
  }>;
  pendingSync: boolean;
}

const OFFLINE_STORAGE_KEY = '@offline_data';

export const useOfflineSupport = () => {
  const [isConnected, setIsConnected] = useState<boolean>(true); // Default to connected
  const [offlineData, setOfflineData] = useState<OfflineData>({
    images: [],
    pendingSync: false,
  });

  useEffect(() => {
    // Load offline data on mount
    loadOfflineData();
    
    // Simple connectivity check
    checkConnectivity();
  }, []);

  const checkConnectivity = async () => {
    try {
      // Simple fetch to check connectivity
      const response = await fetch('https://www.google.com', {
        method: 'HEAD',
        mode: 'no-cors',
      });
      setIsConnected(true);
      
      // If connection is restored, sync offline data
      if (offlineData.pendingSync) {
        syncOfflineData();
      }
    } catch (error) {
      setIsConnected(false);
    }
  };

  const loadOfflineData = async () => {
    try {
      const stored = await AsyncStorage.getItem(OFFLINE_STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        // Convert timestamp strings back to Date objects
        data.images = data.images.map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp),
        }));
        setOfflineData(data);
      }
    } catch (error) {
      console.error('Error loading offline data:', error);
    }
  };

  const saveOfflineData = async (data: OfflineData) => {
    try {
      await AsyncStorage.setItem(OFFLINE_STORAGE_KEY, JSON.stringify(data));
      setOfflineData(data);
    } catch (error) {
      console.error('Error saving offline data:', error);
    }
  };

  const storeImageForOfflineAnalysis = async (imageUri: string): Promise<string> => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const newImage = {
      id,
      uri: imageUri,
      timestamp: new Date(),
    };

    const updatedData = {
      ...offlineData,
      images: [...offlineData.images, newImage],
      pendingSync: true,
    };

    await saveOfflineData(updatedData);
    return id;
  };

  const updateOfflineImageResult = async (id: string, analysisResult: any) => {
    const updatedImages = offlineData.images.map(img =>
      img.id === id ? { ...img, analysisResult } : img
    );

    const updatedData = {
      ...offlineData,
      images: updatedImages,
    };

    await saveOfflineData(updatedData);
  };

  const syncOfflineData = async (): Promise<{ success: boolean; syncedCount: number }> => {
    if (!isConnected) {
      return { success: false, syncedCount: 0 };
    }

    let syncedCount = 0;
    const failedImages: typeof offlineData.images = [];

    for (const image of offlineData.images) {
      if (!image.analysisResult) {
        try {
          // Here you would call your actual API
          // const result = await analyzeImageAPI(image.uri);
          // For now, we'll simulate a successful sync
          console.log(`Syncing image ${image.id}...`);
          syncedCount++;
        } catch (error) {
          console.error(`Failed to sync image ${image.id}:`, error);
          failedImages.push(image);
        }
      } else {
        syncedCount++;
      }
    }

    // Update offline data with only failed items
    const updatedData = {
      images: failedImages,
      pendingSync: failedImages.length > 0,
    };

    await saveOfflineData(updatedData);

    return {
      success: failedImages.length === 0,
      syncedCount,
    };
  };

  const clearOfflineData = async () => {
    const emptyData: OfflineData = {
      images: [],
      pendingSync: false,
    };
    await saveOfflineData(emptyData);
  };

  const getOfflineCapabilities = () => {
    return {
      canStoreImages: true,
      canAnalyzeOffline: false, // Would require local ML model
      canSyncLater: true,
      maxOfflineImages: 50, // Arbitrary limit
    };
  };

  return {
    isConnected,
    offlineData,
    storeImageForOfflineAnalysis,
    updateOfflineImageResult,
    syncOfflineData,
    clearOfflineData,
    getOfflineCapabilities,
    hasOfflineData: offlineData.images.length > 0,
    hasPendingSync: offlineData.pendingSync,
  };
};