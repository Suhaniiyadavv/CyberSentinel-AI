/**
 * CyberSentinel AI - Production Resilient API Client
 * Compatible with Netlify Functions, Express servers, and Client-Side Static SOC Runtimes.
 */

import { clientBackend } from './clientBackend.js';

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

// Configurable API base URL (empty defaults to same origin '/api')
const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

const getHeaders = () => {
  const token = localStorage.getItem('cybersentinel_token') || '';
  const email = localStorage.getItem('cybersentinel_email') || 'demo@cybersentinel.ai';
  return {
    'Content-Type': 'application/json',
    Authorization: token ? `Bearer ${token}` : '',
    'x-user-email': email,
  };
};

const getEmail = () => {
  return localStorage.getItem('cybersentinel_email') || 'demo@cybersentinel.ai';
};

/**
 * Robust fetch wrapper that gracefully handles:
 * 1. Empty response bodies (prevents 'Unexpected end of JSON input')
 * 2. HTML 404 / 200 SPA rewrite responses (prevents 'Unexpected token <')
 * 3. Network or serverless routing failures (transparently executes client SOC fallback)
 */
async function safeFetchJson<T>(
  endpoint: string,
  options?: RequestInit,
  fallbackExecutor?: () => Promise<T>
): Promise<T> {
  const url = `${API_BASE}${endpoint}`;

  try {
    const res = await fetch(url, options);
    const contentType = res.headers.get('content-type') || '';
    const rawText = await res.text();

    // Check if response is empty or HTML (e.g. Netlify 404 or index.html SPA rewrite)
    const isHtml =
      contentType.includes('text/html') ||
      rawText.trim().startsWith('<!DOCTYPE') ||
      rawText.trim().startsWith('<html');
    const isEmpty = !rawText || rawText.trim().length === 0;

    if (!res.ok || isHtml || isEmpty) {
      if (fallbackExecutor) {
        // Fallback to client-side SOC engine
        return await fallbackExecutor();
      }

      if (isEmpty) {
        return { error: `Server returned empty response (${res.status})` } as T;
      }

      if (isHtml) {
        return { error: 'Server returned HTML instead of API JSON response' } as T;
      }
    }

    try {
      const data = JSON.parse(rawText);
      return data as T;
    } catch {
      if (fallbackExecutor) {
        return await fallbackExecutor();
      }
      return { error: 'Malformed JSON payload received from server' } as T;
    }
  } catch {
    // Network failure (CORS, offline, unreachable host)
    if (fallbackExecutor) {
      return await fallbackExecutor();
    }
    return { error: 'Network request failed to reach API gateway' } as T;
  }
}

export const api = {
  // Authentication
  login: async (email: string, password: string) => {
    return safeFetchJson(
      '/api/auth/login',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      },
      () => clientBackend.login(email, password)
    );
  },

  logout: async () => {
    const userEmail = getEmail();
    return safeFetchJson(
      '/api/auth/logout',
      {
        method: 'POST',
        headers: getHeaders(),
      },
      () => clientBackend.logout(userEmail)
    );
  },

  getMe: async () => {
    const userEmail = getEmail();
    return safeFetchJson(
      '/api/auth/me',
      { headers: getHeaders() },
      () => clientBackend.getMe(userEmail)
    );
  },

  // Dashboard Stats
  getDashboardStats: async () => {
    return safeFetchJson(
      '/api/dashboard/stats',
      { headers: getHeaders() },
      () => clientBackend.getDashboardStats()
    );
  },

  // Events
  getEvents: async (params?: { limit?: number; offset?: number; severity?: string; category?: string; query?: string }) => {
    const query = new URLSearchParams();
    if (params?.limit) query.set('limit', String(params.limit));
    if (params?.offset) query.set('offset', String(params.offset));
    if (params?.severity) query.set('severity', params.severity);
    if (params?.category) query.set('category', params.category);
    if (params?.query) query.set('query', params.query);
    return safeFetchJson(
      `/api/events?${query.toString()}`,
      { headers: getHeaders() },
      () => clientBackend.getEvents(params)
    );
  },

  uploadDataset: async (csvData: string, filename: string) => {
    const userEmail = getEmail();
    return safeFetchJson(
      '/api/events/upload',
      {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ csvData, filename }),
      },
      () => clientBackend.uploadDataset(csvData, filename, userEmail)
    );
  },

  analyzeEvent: async (eventData: any) => {
    return safeFetchJson(
      '/api/events/analyze',
      {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(eventData),
      },
      () => clientBackend.analyzeEvent(eventData)
    );
  },

  // Alerts
  getAlerts: async (params?: { limit?: number; offset?: number; severity?: string; status?: string; query?: string }) => {
    const query = new URLSearchParams();
    if (params?.limit) query.set('limit', String(params.limit));
    if (params?.offset) query.set('offset', String(params.offset));
    if (params?.severity) query.set('severity', params.severity);
    if (params?.status) query.set('status', params.status);
    if (params?.query) query.set('query', params.query);
    return safeFetchJson(
      `/api/alerts?${query.toString()}`,
      { headers: getHeaders() },
      () => clientBackend.getAlerts(params)
    );
  },

  getAlertById: async (id: string) => {
    return safeFetchJson(
      `/api/alerts/${id}`,
      { headers: getHeaders() },
      () => clientBackend.getAlertById(id)
    );
  },

  updateAlertStatus: async (id: string, status: string) => {
    const userEmail = getEmail();
    return safeFetchJson(
      `/api/alerts/${id}/status`,
      {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ status }),
      },
      () => clientBackend.updateAlertStatus(id, status, userEmail)
    );
  },

  // Incidents
  getIncidents: async (params?: { limit?: number; offset?: number; severity?: string; status?: string; query?: string }) => {
    const query = new URLSearchParams();
    if (params?.limit) query.set('limit', String(params.limit));
    if (params?.offset) query.set('offset', String(params.offset));
    if (params?.severity) query.set('severity', params.severity);
    if (params?.status) query.set('status', params.status);
    if (params?.query) query.set('query', params.query);
    return safeFetchJson(
      `/api/incidents?${query.toString()}`,
      { headers: getHeaders() },
      () => clientBackend.getIncidents(params)
    );
  },

  getIncidentById: async (id: string) => {
    return safeFetchJson(
      `/api/incidents/${id}`,
      { headers: getHeaders() },
      () => clientBackend.getIncidentById(id)
    );
  },

  updateIncidentStatus: async (id: string, status: string) => {
    const userEmail = getEmail();
    return safeFetchJson(
      `/api/incidents/${id}/status`,
      {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ status }),
      },
      () => clientBackend.updateIncidentStatus(id, status, userEmail)
    );
  },

  // IoCs
  getIoCs: async (params?: { limit?: number; offset?: number; type?: string; severity?: string; query?: string }) => {
    const query = new URLSearchParams();
    if (params?.limit) query.set('limit', String(params.limit));
    if (params?.offset) query.set('offset', String(params.offset));
    if (params?.type) query.set('type', params.type);
    if (params?.severity) query.set('severity', params.severity);
    if (params?.query) query.set('query', params.query);
    return safeFetchJson(
      `/api/iocs?${query.toString()}`,
      { headers: getHeaders() },
      () => clientBackend.getIoCs(params)
    );
  },

  // MITRE
  getMitreTechniques: async () => {
    return safeFetchJson(
      '/api/mitre/techniques',
      { headers: getHeaders() },
      () => clientBackend.getMitreTechniques()
    );
  },

  // Analytics
  getAnalytics: async () => {
    return safeFetchJson(
      '/api/analytics',
      { headers: getHeaders() },
      () => clientBackend.getAnalytics()
    );
  },

  // ML Performance & Models
  getModelMetrics: async () => {
    return safeFetchJson(
      '/api/ml/metrics',
      { headers: getHeaders() },
      () => clientBackend.getModelMetrics()
    );
  },

  trainModels: async () => {
    const userEmail = getEmail();
    return safeFetchJson(
      '/api/ml/train',
      {
        method: 'POST',
        headers: getHeaders(),
      },
      () => clientBackend.trainModels(userEmail)
    );
  },

  // Comparison
  getComparison: async () => {
    return safeFetchJson(
      '/api/comparison',
      { headers: getHeaders() },
      () => clientBackend.getComparison()
    );
  },

  // Rules
  getRules: async () => {
    return safeFetchJson(
      '/api/rules',
      { headers: getHeaders() },
      () => clientBackend.getRules()
    );
  },

  toggleRule: async (id: string, enabled: boolean) => {
    const userEmail = getEmail();
    return safeFetchJson(
      `/api/rules/${id}/toggle`,
      {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ enabled }),
      },
      () => clientBackend.toggleRule(id, enabled, userEmail)
    );
  },

  // Responses
  getResponses: async () => {
    return safeFetchJson(
      '/api/responses',
      { headers: getHeaders() },
      () => clientBackend.getResponses()
    );
  },

  updateResponseStatus: async (incidentId: string, recommendationId: string, status: string) => {
    const userEmail = getEmail();
    return safeFetchJson(
      `/api/responses/${incidentId}/${recommendationId}/status`,
      {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ status }),
      },
      () => clientBackend.updateResponseStatus(incidentId, recommendationId, status, userEmail)
    );
  },

  // Demo controls
  runScenario: async (scenario: string) => {
    const userEmail = getEmail();
    return safeFetchJson(
      '/api/demo/scenario',
      {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ scenario }),
      },
      () => clientBackend.runScenario(scenario, userEmail)
    );
  },

  resetDemo: async () => {
    return safeFetchJson(
      '/api/demo/reset',
      {
        method: 'POST',
        headers: getHeaders(),
      },
      () => clientBackend.resetDemo()
    );
  },

  // Audit Logs
  getAuditLogs: async (limit = 50) => {
    return safeFetchJson(
      `/api/audit-logs?limit=${limit}`,
      { headers: getHeaders() },
      () => clientBackend.getAuditLogs(limit)
    );
  },

  // Settings
  getSettings: async () => {
    return safeFetchJson(
      '/api/settings',
      { headers: getHeaders() },
      () => clientBackend.getSettings()
    );
  },
};
