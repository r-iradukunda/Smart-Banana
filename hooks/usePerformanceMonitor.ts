import { useState, useEffect, useRef, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';

export interface PerformanceMetrics {
  memoryUsage: number;
  renderTime: number;
  apiResponseTime: number;
  cacheHitRate: number;
  errorRate: number;
  sessionDuration: number;
  screenLoadTimes: Record<string, number>;
  userInteractions: number;
}

export interface PerformanceIssue {
  type: 'memory' | 'render' | 'api' | 'error';
  severity: 'low' | 'medium' | 'high';
  message: string;
  timestamp: Date;
  metadata?: any;
}

const PERFORMANCE_THRESHOLDS = {
  maxRenderTime: 16, // 60fps = 16ms per frame
  maxMemoryUsage: 100, // MB
  maxApiResponseTime: 5000, // 5 seconds
  minCacheHitRate: 0.8, // 80%
  maxErrorRate: 0.05, // 5%
};

export const usePerformanceMonitor = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    memoryUsage: 0,
    renderTime: 0,
    apiResponseTime: 0,
    cacheHitRate: 1,
    errorRate: 0,
    sessionDuration: 0,
    screenLoadTimes: {},
    userInteractions: 0,
  });

  const [issues, setIssues] = useState<PerformanceIssue[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  
  const sessionStartTime = useRef<Date | null>(null);
  const renderStartTimes = useRef<Map<string, number>>(new Map());
  const apiCallTimes = useRef<Map<string, number>>(new Map());
  const errorCount = useRef<number>(0);
  const totalCalls = useRef<number>(0);
  const cacheHits = useRef<number>(0);
  const cacheMisses = useRef<number>(0);

  // Start monitoring session
  const startMonitoring = useCallback(() => {
    sessionStartTime.current = new Date();
    setIsMonitoring(true);
  }, []);

  // Stop monitoring session
  const stopMonitoring = useCallback(() => {
    setIsMonitoring(false);
    if (sessionStartTime.current) {
      const duration = (Date.now() - sessionStartTime.current.getTime()) / 1000;
      setMetrics(prev => ({ ...prev, sessionDuration: duration }));
    }
  }, []);

  // Track render performance
  const trackRenderStart = useCallback((componentName: string) => {
    renderStartTimes.current.set(componentName, performance.now());
  }, []);

  const trackRenderEnd = useCallback((componentName: string) => {
    const startTime = renderStartTimes.current.get(componentName);
    if (startTime) {
      const renderTime = performance.now() - startTime;
      setMetrics(prev => ({ ...prev, renderTime }));
      
      if (renderTime > PERFORMANCE_THRESHOLDS.maxRenderTime) {
        addIssue({
          type: 'render',
          severity: 'medium',
          message: `Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms`,
          timestamp: new Date(),
          metadata: { componentName, renderTime },
        });
      }
      
      renderStartTimes.current.delete(componentName);
    }
  }, []);

  // Track API performance
  const trackApiCall = useCallback((callId: string) => {
    apiCallTimes.current.set(callId, performance.now());
    totalCalls.current += 1;
  }, []);

  const trackApiResponse = useCallback((callId: string, success: boolean = true) => {
    const startTime = apiCallTimes.current.get(callId);
    if (startTime) {
      const responseTime = performance.now() - startTime;
      setMetrics(prev => ({ ...prev, apiResponseTime: responseTime }));
      
      if (!success) {
        errorCount.current += 1;
      }
      
      if (responseTime > PERFORMANCE_THRESHOLDS.maxApiResponseTime) {
        addIssue({
          type: 'api',
          severity: 'high',\n          message: `Slow API response: ${responseTime.toFixed(2)}ms`,
          timestamp: new Date(),
          metadata: { callId, responseTime, success },
        });
      }
      
      // Update error rate
      const errorRate = errorCount.current / totalCalls.current;
      setMetrics(prev => ({ ...prev, errorRate }));
      
      if (errorRate > PERFORMANCE_THRESHOLDS.maxErrorRate) {
        addIssue({
          type: 'error',
          severity: 'high',
          message: `High error rate detected: ${(errorRate * 100).toFixed(1)}%`,
          timestamp: new Date(),
          metadata: { errorRate, totalCalls: totalCalls.current, errorCount: errorCount.current },
        });
      }
      
      apiCallTimes.current.delete(callId);
    }
  }, []);

  // Track cache performance
  const trackCacheHit = useCallback(() => {
    cacheHits.current += 1;
    updateCacheHitRate();
  }, []);

  const trackCacheMiss = useCallback(() => {
    cacheMisses.current += 1;
    updateCacheHitRate();
  }, []);

  const updateCacheHitRate = useCallback(() => {
    const total = cacheHits.current + cacheMisses.current;
    if (total > 0) {
      const hitRate = cacheHits.current / total;
      setMetrics(prev => ({ ...prev, cacheHitRate: hitRate }));
      
      if (hitRate < PERFORMANCE_THRESHOLDS.minCacheHitRate) {
        addIssue({
          type: 'memory',
          severity: 'medium',
          message: `Low cache hit rate: ${(hitRate * 100).toFixed(1)}%`,
          timestamp: new Date(),
          metadata: { hitRate, cacheHits: cacheHits.current, cacheMisses: cacheMisses.current },
        });
      }
    }
  }, []);

  // Track screen load times
  const trackScreenLoad = useCallback((screenName: string, loadTime: number) => {
    setMetrics(prev => ({
      ...prev,
      screenLoadTimes: { ...prev.screenLoadTimes, [screenName]: loadTime },
    }));
  }, []);

  // Track user interactions
  const trackUserInteraction = useCallback(() => {
    setMetrics(prev => ({ ...prev, userInteractions: prev.userInteractions + 1 }));
  }, []);

  // Add performance issue
  const addIssue = useCallback((issue: PerformanceIssue) => {
    setIssues(prev => [issue, ...prev.slice(0, 49)]); // Keep last 50 issues
  }, []);

  // Get memory usage (mock implementation - would use actual memory APIs in production)
  const updateMemoryUsage = useCallback(() => {
    // This would typically use native modules to get actual memory usage
    // For now, we'll estimate based on app state
    const estimatedUsage = Math.random() * 50 + 20; // 20-70 MB estimate
    setMetrics(prev => ({ ...prev, memoryUsage: estimatedUsage }));
    
    if (estimatedUsage > PERFORMANCE_THRESHOLDS.maxMemoryUsage) {
      addIssue({
        type: 'memory',
        severity: 'high',
        message: `High memory usage detected: ${estimatedUsage.toFixed(1)}MB`,
        timestamp: new Date(),
        metadata: { memoryUsage: estimatedUsage },
      });
    }
  }, [addIssue]);

  // Monitor app state changes
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active' && !isMonitoring) {
        startMonitoring();
      } else if (nextAppState === 'background' && isMonitoring) {
        stopMonitoring();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    
    // Start monitoring if app is already active
    if (AppState.currentState === 'active') {
      startMonitoring();
    }

    return () => subscription?.remove();
  }, [isMonitoring, startMonitoring, stopMonitoring]);

  // Periodic memory usage updates
  useEffect(() => {
    if (!isMonitoring) return;

    const interval = setInterval(updateMemoryUsage, 10000); // Every 10 seconds
    return () => clearInterval(interval);
  }, [isMonitoring, updateMemoryUsage]);

  // Clear old issues
  const clearIssues = useCallback(() => {
    setIssues([]);
  }, []);

  // Get performance summary
  const getPerformanceSummary = useCallback(() => {
    const criticalIssues = issues.filter(issue => issue.severity === 'high').length;
    const warningIssues = issues.filter(issue => issue.severity === 'medium').length;
    
    const avgRenderTime = metrics.renderTime;
    const avgApiResponse = metrics.apiResponseTime;
    
    return {
      overallScore: calculateOverallScore(),
      criticalIssues,
      warningIssues,
      avgRenderTime,
      avgApiResponse,
      memoryUsage: metrics.memoryUsage,
      cacheEfficiency: metrics.cacheHitRate,
      recommendations: generateRecommendations(),
    };
  }, [metrics, issues]);

  const calculateOverallScore = useCallback(() => {
    let score = 100;
    
    // Deduct points for issues
    const criticalIssues = issues.filter(issue => issue.severity === 'high').length;
    const mediumIssues = issues.filter(issue => issue.severity === 'medium').length;
    const lowIssues = issues.filter(issue => issue.severity === 'low').length;
    
    score -= criticalIssues * 20;
    score -= mediumIssues * 10;
    score -= lowIssues * 5;
    
    // Performance factor adjustments
    if (metrics.renderTime > PERFORMANCE_THRESHOLDS.maxRenderTime) score -= 10;
    if (metrics.apiResponseTime > PERFORMANCE_THRESHOLDS.maxApiResponseTime) score -= 15;
    if (metrics.memoryUsage > PERFORMANCE_THRESHOLDS.maxMemoryUsage) score -= 15;
    if (metrics.cacheHitRate < PERFORMANCE_THRESHOLDS.minCacheHitRate) score -= 10;
    if (metrics.errorRate > PERFORMANCE_THRESHOLDS.maxErrorRate) score -= 20;
    
    return Math.max(0, Math.min(100, score));
  }, [metrics, issues]);

  const generateRecommendations = useCallback(() => {
    const recommendations: string[] = [];
    
    if (metrics.renderTime > PERFORMANCE_THRESHOLDS.maxRenderTime) {
      recommendations.push('Optimize component renders with React.memo and useMemo');
    }
    
    if (metrics.apiResponseTime > PERFORMANCE_THRESHOLDS.maxApiResponseTime) {
      recommendations.push('Implement request caching and optimize API endpoints');
    }
    
    if (metrics.memoryUsage > PERFORMANCE_THRESHOLDS.maxMemoryUsage) {
      recommendations.push('Review memory usage and implement cleanup strategies');
    }
    
    if (metrics.cacheHitRate < PERFORMANCE_THRESHOLDS.minCacheHitRate) {
      recommendations.push('Improve caching strategy and cache key design');
    }
    
    if (metrics.errorRate > PERFORMANCE_THRESHOLDS.maxErrorRate) {
      recommendations.push('Review error handling and implement retry mechanisms');
    }
    
    return recommendations;
  }, [metrics]);

  return {
    metrics,
    issues,
    isMonitoring,
    trackRenderStart,
    trackRenderEnd,
    trackApiCall,
    trackApiResponse,
    trackCacheHit,
    trackCacheMiss,
    trackScreenLoad,
    trackUserInteraction,
    clearIssues,
    getPerformanceSummary,
    startMonitoring,
    stopMonitoring,
  };
};