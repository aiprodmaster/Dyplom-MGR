// types/assistant.types.ts
export interface Message {
  id: string;
  type: 'user' | 'assistant' | 'system' | 'error';
  content: string;
  timestamp: Date;
  metadata?: {
    tokens?: number;
    model?: string;
    confidence?: number;
    sources?: Source[];
    processingTime?: number;
  };
}

export interface Source {
  id: string;
  title: string;
  content: string;
  url?: string;
  type: 'document' | 'database' | 'api';
  relevanceScore: number;
  metadata?: {
    page?: number;
    section?: string;
    lastModified?: Date;
  };
}

export interface AssistantSettings {
  detailLevel: 'basic' | 'intermediate' | 'expert';
  communicationStyle: 'casual' | 'professional' | 'technical';
  specializations: string[];
  autoSearch: boolean;
  useCitations: boolean;
  language: 'pl' | 'en';
  maxResponseLength: number;
  enabledFeatures: {
    sqlGeneration: boolean;
    documentAnalysis: boolean;
    riskAssessment: boolean;
    costCalculation: boolean;
  };
}

export interface RAGResponse {
  response: string;
  confidence: number;
  sources: Source[];
  processingTime: number;
  searchResults: number;
  model: string;
  tokenUsage?: {
    prompt: number;
    completion: number;
    total: number;
  };
}

export interface ChatSession {
  id: string;
  userId: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
  settings: AssistantSettings;
  metadata?: {
    projectId?: string;
    category?: string;
    tags?: string[];
  };
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'consultant' | 'admin' | 'viewer';
  settings: AssistantSettings;
  preferences: {
    theme: 'light' | 'dark' | 'system';
    notifications: boolean;
    autoSave: boolean;
  };
  stats?: {
    totalQueries: number;
    avgResponseTime: number;
    satisfaction: number;
    lastActive: Date;
  };
}

export interface Analytics {
  totalQueries: number;
  queriesChange: number;
  avgResponseTime: number;
  responseTimeChange: number;
  satisfaction: number;
  satisfactionChange: number;
  monthlyCost: number;
  costChange: number;
  queryVolume: Array<{
    date: string;
    count: number;
  }>;
  responseTimeDistribution: Array<{
    range: string;
    count: number;
  }>;
  queryCategories: Array<{
    category: string;
    count: number;
    percentage: number;
  }>;
  modelUsage: Array<{
    model: string;
    usage: number;
    cost: number;
  }>;
  recentActivity: Activity[];
}

export interface Activity {
  id: string;
  type: 'query' | 'document_upload' | 'settings_change' | 'error';
  description: string;
  timestamp: Date;
  user: string;
  metadata?: Record<string, any>;
}

export interface APIError extends Error {
  status?: number;
  code?: string;
  details?: Record<string, any>;
}

export interface DocumentUpload {
  id: string;
  filename: string;
  size: number;
  type: string;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  progress: number;
  uploadedAt: Date;
  processedAt?: Date;
  metadata?: {
    pages?: number;
    language?: string;
    category?: string;
  };
}

export interface SystemStatus {
  online: boolean;
  services: {
    api: 'online' | 'offline' | 'degraded';
    database: 'online' | 'offline' | 'degraded';
    rag: 'online' | 'offline' | 'degraded';
    search: 'online' | 'offline' | 'degraded';
  };
  performance: {
    responseTime: number;
    uptime: number;
    errorRate: number;
  };
  maintenance?: {
    scheduled: boolean;
    startTime?: Date;
    endTime?: Date;
    description?: string;
  };
}
