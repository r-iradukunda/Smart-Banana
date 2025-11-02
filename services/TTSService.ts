// services/TTSService.ts
import Logger from '../utils/Logger';

export interface TTSResponse {
  success: boolean;
  audioUrl?: string;
  error?: {
    code: number;
    message: string;
    details: string;
  };
}

export interface TTSOptions {
  text: string;
  language?: string;
  onError?: (error: any) => void;
  onSuccess?: (audioUrl: string) => void;
  onRetryAttempt?: (attempt: number) => void;
}

// Custom error class for Pindo API errors
export class PindoAPIError extends Error {
  constructor(
    message: string,
    public code: number,
    public details: string
  ) {
    super(message);
    this.name = 'PindoAPIError';
  }
}

export class TTSService {
  private static readonly PINDO_API_URL = 'https://api.pindo.io/ai/tts/rw/public';
  private static readonly MAX_RETRIES = 3;
  private static readonly RETRY_DELAY = 10000; // 1 second
  private static readonly REQUEST_TIMEOUT = 100000; // 10 seconds

  /**
   * Generate audio from text using Pindo.io TTS API
   * @param options TTSOptions object containing text, language, and callbacks
   * @returns Promise<TTSResponse>
   */
  static async generateAudio(options: TTSOptions): Promise<TTSResponse> {
    const { text, language = 'rw', onError, onSuccess, onRetryAttempt } = options;
    
    return this._attemptTTSRequest(text, language, 0, onError, onSuccess, onRetryAttempt);
  }

  /**
   * Internal method to attempt TTS request with retry logic
   */
  private static async _attemptTTSRequest(
    text: string,
    language: string,
    retryCount: number,
    onError?: (error: any) => void,
    onSuccess?: (audioUrl: string) => void,
    onRetryAttempt?: (attempt: number) => void
  ): Promise<TTSResponse> {
    try {
      Logger.debug(`TTS Attempt ${retryCount + 1} for language: ${language}`);
      
      // Notify about retry attempt
      if (retryCount > 0 && onRetryAttempt) {
        onRetryAttempt(retryCount);
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.REQUEST_TIMEOUT);

      const response = await fetch(this.PINDO_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const data = await response.json();

      Logger.debug('Pindo API Response:', data);

      // Handle Pindo API errors (like the 500 error example)
      if (!response.ok || data.status === 'error' || data.code !== 200) {
        const errorCode = data.code || response.status;
        const errorMessage = data.error?.message || `HTTP ${response.status}`;
        const errorDetails = data.error?.details || 'Unknown error occurred';

        throw new PindoAPIError(errorMessage, errorCode, errorDetails);
      }

      // Success case
      const audioUrl = data.data?.generated_audio_url;
      if (audioUrl) {
        Logger.debug('TTS Success:', audioUrl);
        if (onSuccess) {
          onSuccess(audioUrl);
        }
        return {
          success: true,
          audioUrl
        };
      } else {
        throw new PindoAPIError('No audio URL in response', 200, 'Invalid response format');
      }

    } catch (error: any) {
      Logger.silentError(`TTS Error on attempt ${retryCount + 1}:`, error);

      // Check if we should retry
      if (this._isRetryableError(error) && retryCount < this.MAX_RETRIES) {
        Logger.debug(`Retrying TTS request... Attempt ${retryCount + 2}`);
        
        // Wait before retry with exponential backoff
        await this._delay(this.RETRY_DELAY * Math.pow(2, retryCount));
        
        return this._attemptTTSRequest(
          text, 
          language, 
          retryCount + 1, 
          onError, 
          onSuccess, 
          onRetryAttempt
        );
      }

      // All retries failed or non-retryable error
      const finalError = this._formatError(error);
      
      if (onError) {
        onError(finalError);
      }

      return {
        success: false,
        error: finalError
      };
    }
  }

  /**
   * Determine if an error is retryable
   */
  private static _isRetryableError(error: any): boolean {
    // Network errors and timeouts are retryable
    if (error.name === 'AbortError' || error.name === 'TypeError') {
      return true;
    }

    // Pindo API server errors (5xx) are retryable
    if (error instanceof PindoAPIError) {
      return error.code >= 500 && error.code < 600;
    }

    // Other network-related errors
    return error.message?.includes('network') || 
           error.message?.includes('timeout') ||
           error.message?.includes('fetch');
  }

  /**
   * Format error for consistent handling
   */
  private static _formatError(error: any): { code: number; message: string; details: string } {
    if (error instanceof PindoAPIError) {
      return {
        code: error.code,
        message: error.message,
        details: error.details
      };
    }

    // Network/timeout errors
    if (error.name === 'AbortError') {
      return {
        code: 408,
        message: 'Request timeout',
        details: 'The request took too long to complete'
      };
    }

    // Generic network error
    return {
      code: 0,
      message: 'Network error',
      details: error.message || 'Unable to connect to audio service'
    };
  }

  /**
   * Utility method for delays
   */
  private static _delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Quick method for simple TTS requests (backward compatibility)
   */
  static async generateAudioSimple(
    text: string, 
    language: string = 'rw'
  ): Promise<string | null> {
    const result = await this.generateAudio({ text, language });
    return result.success ? result.audioUrl! : null;
  }

  /**
   * Check if TTS service is available
   */
  static async checkServiceHealth(): Promise<boolean> {
    try {
      const result = await this.generateAudio({
        text: 'test',
        language: 'rw'
      });
      return result.success;
    } catch {
      return false;
    }
  }
}