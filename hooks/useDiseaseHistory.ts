import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface DiseaseRecord {
  id: string;
  timestamp: Date;
  disease: string;
  confidence: number;
  imageUri: string;
  description: string;
  treatment: string;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  notes?: string;
  language: string;
}

const STORAGE_KEY = '@banana_disease_history';

export const useDiseaseHistory = () => {
  const [history, setHistory] = useState<DiseaseRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load history from storage
  const loadHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const storedHistory = await AsyncStorage.getItem(STORAGE_KEY);
      if (storedHistory) {
        const parsedHistory = JSON.parse(storedHistory);
        // Convert timestamp strings back to Date objects
        const historyWithDates = parsedHistory.map((record: any) => ({
          ...record,
          timestamp: new Date(record.timestamp),
        }));
        setHistory(historyWithDates);
      }
    } catch (err) {
      setError('Failed to load disease history');
      console.error('Error loading disease history:', err);
    } finally {
      setLoading(false);
    }
  };

  // Save history to storage
  const saveHistory = async (newHistory: DiseaseRecord[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
    } catch (err) {
      setError('Failed to save disease history');
      console.error('Error saving disease history:', err);
    }
  };

  // Add new disease record
  const addRecord = async (record: Omit<DiseaseRecord, 'id' | 'timestamp'>) => {
    try {
      const newRecord: DiseaseRecord = {
        ...record,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        timestamp: new Date(),
      };
      
      const updatedHistory = [newRecord, ...history];
      setHistory(updatedHistory);
      await saveHistory(updatedHistory);
      return newRecord;
    } catch (err) {
      setError('Failed to add disease record');
      console.error('Error adding disease record:', err);
      throw err;
    }
  };

  // Update existing record
  const updateRecord = async (id: string, updates: Partial<DiseaseRecord>) => {
    try {
      const updatedHistory = history.map(record =>
        record.id === id ? { ...record, ...updates } : record
      );
      setHistory(updatedHistory);
      await saveHistory(updatedHistory);
    } catch (err) {
      setError('Failed to update disease record');
      console.error('Error updating disease record:', err);
      throw err;
    }
  };

  // Delete record
  const deleteRecord = async (id: string) => {
    try {
      const updatedHistory = history.filter(record => record.id !== id);
      setHistory(updatedHistory);
      await saveHistory(updatedHistory);
    } catch (err) {
      setError('Failed to delete disease record');
      console.error('Error deleting disease record:', err);
      throw err;
    }
  };

  // Clear all history
  const clearHistory = async () => {
    try {
      setHistory([]);
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (err) {
      setError('Failed to clear disease history');
      console.error('Error clearing disease history:', err);
      throw err;
    }
  };

  // Get statistics
  const getStatistics = () => {
    const totalScans = history.length;
    const diseaseCount = history.reduce((acc, record) => {
      acc[record.disease] = (acc[record.disease] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const healthyCount = diseaseCount['Healthy'] || diseaseCount['healthy'] || 0;
    const diseaseDetectedCount = totalScans - healthyCount;
    
    const averageConfidence = history.length > 0 
      ? history.reduce((sum, record) => sum + record.confidence, 0) / history.length
      : 0;

    const recentScans = history.filter(record => {
      const daysDiff = (Date.now() - record.timestamp.getTime()) / (1000 * 60 * 60 * 24);
      return daysDiff <= 30;
    }).length;

    return {
      totalScans,
      healthyCount,
      diseaseDetectedCount,
      averageConfidence: Math.round(averageConfidence * 10) / 10,
      recentScans,
      diseaseBreakdown: diseaseCount,
      mostCommonDisease: Object.entries(diseaseCount).reduce((a, b) => 
        diseaseCount[a[0]] > diseaseCount[b[0]] ? a : b, ['None', 0]
      )[0],
    };
  };

  // Filter records by date range
  const getRecordsByDateRange = (startDate: Date, endDate: Date) => {
    return history.filter(record => 
      record.timestamp >= startDate && record.timestamp <= endDate
    );
  };

  // Filter records by disease type
  const getRecordsByDisease = (disease: string) => {
    return history.filter(record => 
      record.disease.toLowerCase() === disease.toLowerCase()
    );
  };

  useEffect(() => {
    loadHistory();
  }, []);

  return {
    history,
    loading,
    error,
    addRecord,
    updateRecord,
    deleteRecord,
    clearHistory,
    getStatistics,
    getRecordsByDateRange,
    getRecordsByDisease,
    refresh: loadHistory,
  };
};