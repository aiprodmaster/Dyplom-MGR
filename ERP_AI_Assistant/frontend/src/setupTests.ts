// src/setupTests.ts
import '@testing-library/jest-dom';

// Global type declarations
declare global {
  var global: any;
  var process: any;
  var jest: any;
  var afterEach: any;
}

// Mock environment variables for tests
(global as any).process = { env: { NODE_ENV: 'test' } };

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() {
    return null;
  }
  disconnect() {
    return null;
  }
  unobserve() {
    return null;
  }
};

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  observe() {
    return null;
  }
  disconnect() {
    return null;
  }
  unobserve() {
    return null;
  }
};

// Mock WebSocket
global.WebSocket = class WebSocket {
  constructor() {}
  send() {}
  close() {}
  addEventListener() {}
  removeEventListener() {}
};

// Mock fetch
global.fetch = jest.fn();

// Global test utilities
global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
};

// Setup after each test
afterEach(() => {
  jest.clearAllMocks();
});
