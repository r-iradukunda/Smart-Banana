import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Share } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { Alert } from 'react-native';

export interface ExportFormat {
  type: 'json' | 'csv' | 'pdf';
  name: string;
  description: string;
  extension: string;
}

export const EXPORT_FORMATS: ExportFormat[] = [
  {
    type: 'json',
    name: 'JSON',
    description: 'Complete data with all details',
    extension: 'json',
  },
  {
    type: 'csv',
    name: 'CSV',
    description: 'Spreadsheet format for analysis',
    extension: 'csv',
  },
  {
    type: 'pdf',
    name: 'PDF',
    description: 'Formatted report document',
    extension: 'pdf',
  },
];

export const useDataExport = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  const exportToJSON = useCallback(async (data: any, filename: string) => {
    try {
      const jsonString = JSON.stringify(data, null, 2);
      const fileUri = `${FileSystem.documentDirectory}${filename}.json`;
      
      await FileSystem.writeAsStringAsync(fileUri, jsonString);
      return fileUri;
    } catch (error) {
      console.error('Error exporting to JSON:', error);
      throw new Error('Failed to export JSON file');
    }
  }, []);

  const exportToCSV = useCallback(async (data: any[], filename: string) => {
    try {
      if (!data || data.length === 0) {
        throw new Error('No data to export');
      }

      // Get headers from first object
      const headers = Object.keys(data[0]);
      
      // Create CSV content
      const csvRows = [
        headers.join(','), // Header row
        ...data.map(row => 
          headers.map(header => {
            const value = row[header];
            // Handle values that might contain commas or quotes
            if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value || '';
          }).join(',')
        )
      ];

      const csvContent = csvRows.join('\n');
      const fileUri = `${FileSystem.documentDirectory}${filename}.csv`;
      
      await FileSystem.writeAsStringAsync(fileUri, csvContent);
      return fileUri;
    } catch (error) {
      console.error('Error exporting to CSV:', error);
      throw new Error('Failed to export CSV file');
    }
  }, []);

  const generateReport = useCallback(async (data: any, filename: string) => {
    try {
      // Simple HTML report generation
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Banana Disease Detection Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { color: #2E7D32; border-bottom: 2px solid #4CAF50; padding-bottom: 10px; }
            .section { margin: 20px 0; }
            .stat { display: inline-block; margin: 10px; padding: 15px; background: #F8FDF8; border-radius: 8px; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #4CAF50; color: white; }
            .healthy { color: #4CAF50; }
            .disease { color: #D32F2F; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🍌 Banana Disease Detection Report</h1>
            <p>Generated on ${new Date().toLocaleDateString()}</p>
          </div>
          
          <div class="section">
            <h2>Summary Statistics</h2>
            <div class="stat">
              <h3>${data.statistics?.totalScans || 0}</h3>
              <p>Total Scans</p>
            </div>
            <div class="stat">
              <h3 class="healthy">${data.statistics?.healthyCount || 0}</h3>
              <p>Healthy Plants</p>
            </div>
            <div class="stat">
              <h3 class="disease">${data.statistics?.diseaseDetectedCount || 0}</h3>
              <p>Diseases Detected</p>
            </div>
          </div>

          <div class="section">
            <h2>Recent Scans</h2>
            <table>
              <tr>
                <th>Date</th>
                <th>Disease</th>
                <th>Confidence</th>
                <th>Location</th>
              </tr>
              ${(data.history || []).slice(0, 20).map((record: any) => `
                <tr>
                  <td>${new Date(record.timestamp).toLocaleDateString()}</td>
                  <td class="${record.disease.toLowerCase() === 'healthy' ? 'healthy' : 'disease'}">
                    ${record.disease}
                  </td>
                  <td>${record.confidence.toFixed(1)}%</td>
                  <td>${record.location?.address || 'Unknown'}</td>
                </tr>
              `).join('')}
            </table>
          </div>
        </body>
        </html>
      `;

      const fileUri = `${FileSystem.documentDirectory}${filename}.html`;
      await FileSystem.writeAsStringAsync(fileUri, html);
      return fileUri;
    } catch (error) {
      console.error('Error generating report:', error);
      throw new Error('Failed to generate report');
    }
  }, []);

  const exportData = useCallback(async (
    data: any,
    format: ExportFormat['type'],
    filename: string,
    onProgress?: (progress: number) => void
  ) => {
    try {
      setIsExporting(true);
      setExportProgress(0);

      onProgress?.(25);

      let fileUri: string;
      
      switch (format) {
        case 'json':
          fileUri = await exportToJSON(data, filename);
          break;
        case 'csv':
          // Convert history data to CSV format
          const csvData = Array.isArray(data) ? data : data.history || [];
          fileUri = await exportToCSV(csvData, filename);
          break;
        case 'pdf':
          fileUri = await generateReport(data, filename);
          break;
        default:
          throw new Error('Unsupported export format');
      }

      onProgress?.(75);

      // Use React Native Share API
      try {
        await Share.share({
          url: fileUri,
          title: `${format.toUpperCase()} Export`,
          message: `Banana Disease Detection ${format.toUpperCase()} export`,
        });
      } catch (error) {
        // Fallback to showing file location
        Alert.alert(
          'Export Complete',
          `File saved to: ${fileUri}`,
          [{ text: 'OK' }]
        );
      }

      onProgress?.(100);
      return fileUri;
    } catch (error) {
      console.error('Export error:', error);
      Alert.alert(
        'Export Failed',
        error instanceof Error ? error.message : 'Unknown error occurred',
        [{ text: 'OK' }]
      );
      throw error;
    } finally {
      setIsExporting(false);
      setExportProgress(0);
    }
  }, [exportToJSON, exportToCSV, generateReport]);

  const importData = useCallback(async (fileUri: string): Promise<any> => {
    try {
      setIsExporting(true);
      
      const fileContent = await FileSystem.readAsStringAsync(fileUri);
      const data = JSON.parse(fileContent);
      
      // Validate data structure
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid data format');
      }

      return data;
    } catch (error) {
      console.error('Import error:', error);
      throw new Error('Failed to import data. Please check the file format.');
    } finally {
      setIsExporting(false);
    }
  }, []);

  const getExportSize = useCallback(async (data: any, format: ExportFormat['type']): Promise<number> => {
    try {
      let content: string;
      
      switch (format) {
        case 'json':
          content = JSON.stringify(data, null, 2);
          break;
        case 'csv':
          const csvData = Array.isArray(data) ? data : data.history || [];
          if (csvData.length === 0) return 0;
          const headers = Object.keys(csvData[0]).join(',');
          const rows = csvData.map((row: any) => Object.values(row).join(','));
          content = [headers, ...rows].join('\n');
          break;
        default:
          return 0;
      }
      
      return new Blob([content]).size;
    } catch (error) {
      console.error('Error calculating export size:', error);
      return 0;
    }
  }, []);

  return {
    exportData,
    importData,
    getExportSize,
    isExporting,
    exportProgress,
    supportedFormats: EXPORT_FORMATS,
  };
};