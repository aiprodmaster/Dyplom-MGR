// config/environment.config.ts
interface EnvironmentConfig {
  API_BASE_URL: string;
  LOG_LEVEL: 'debug' | 'info' | 'warn' | 'error';
  CACHE_TTL: number;
  ENABLE_MOCK_API: boolean;
  WS_URL: string;
  MAX_FILE_SIZE: number;
  SUPPORTED_FORMATS: string[];
  FEATURES: {
    ENABLE_ANALYTICS: boolean;
    ENABLE_WEBSOCKET: boolean;
    ENABLE_PWA: boolean;
    ENABLE_DARK_MODE: boolean;
  };
}

const config: Record<string, EnvironmentConfig> = {
  development: {
    API_BASE_URL: 'http://localhost:5000',
    LOG_LEVEL: 'debug',
    CACHE_TTL: 60000, // 1 minute
    ENABLE_MOCK_API: true,
    WS_URL: 'ws://localhost:5000/ws',
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
    SUPPORTED_FORMATS: ['pdf', 'doc', 'docx', 'txt', 'html'],
    FEATURES: {
      ENABLE_ANALYTICS: true,
      ENABLE_WEBSOCKET: true,
      ENABLE_PWA: false,
      ENABLE_DARK_MODE: true,
    },
  },
  production: {
    API_BASE_URL: 'https://api.erp-assistant.com',
    LOG_LEVEL: 'error',
    CACHE_TTL: 300000, // 5 minutes
    ENABLE_MOCK_API: false,
    WS_URL: 'wss://api.erp-assistant.com/ws',
    MAX_FILE_SIZE: 25 * 1024 * 1024, // 25MB
    SUPPORTED_FORMATS: ['pdf', 'doc', 'docx', 'txt', 'html', 'xml'],
    FEATURES: {
      ENABLE_ANALYTICS: true,
      ENABLE_WEBSOCKET: true,
      ENABLE_PWA: true,
      ENABLE_DARK_MODE: true,
    },
  },
  test: {
    API_BASE_URL: 'http://localhost:3001',
    LOG_LEVEL: 'warn',
    CACHE_TTL: 10000, // 10 seconds
    ENABLE_MOCK_API: true,
    WS_URL: 'ws://localhost:3001/ws',
    MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
    SUPPORTED_FORMATS: ['pdf', 'txt'],
    FEATURES: {
      ENABLE_ANALYTICS: false,
      ENABLE_WEBSOCKET: false,
      ENABLE_PWA: false,
      ENABLE_DARK_MODE: false,
    },
  },
};

const currentEnv = process.env.NODE_ENV || 'development';
export const ENV_CONFIG = config[currentEnv];

// Helper functions
export const isProduction = () => currentEnv === 'production';
export const isDevelopment = () => currentEnv === 'development';
export const isTest = () => currentEnv === 'test';

// Feature flags
export const featureFlags = {
  isAnalyticsEnabled: () => ENV_CONFIG.FEATURES.ENABLE_ANALYTICS,
  isWebSocketEnabled: () => ENV_CONFIG.FEATURES.ENABLE_WEBSOCKET,
  isPWAEnabled: () => ENV_CONFIG.FEATURES.ENABLE_PWA,
  isDarkModeEnabled: () => ENV_CONFIG.FEATURES.ENABLE_DARK_MODE,
  isMockAPIEnabled: () => ENV_CONFIG.ENABLE_MOCK_API,
};

// Validation
export const validateEnvironment = (): boolean => {
  const required = ['API_BASE_URL', 'WS_URL'];
  
  for (const key of required) {
    if (!ENV_CONFIG[key as keyof EnvironmentConfig]) {
      console.error(`Missing required environment variable: ${key}`);
      return false;
    }
  }
  
  return true;
};

export default ENV_CONFIG;
