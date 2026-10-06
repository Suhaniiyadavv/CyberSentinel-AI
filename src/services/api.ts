/**
 * CyberSentinel AI - API Client
 */

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

const getHeaders = () => {
  const token = localStorage.getItem('cybersentinel_token') || '';
  const email = localStorage.getItem('cybersentinel_email') || 'demo@cybersentinel.ai';
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
    'x-user-email': email,
  };
};

export const api = {
  // Auth
  login: async (email: string, password: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return res.json();
  },
  logout: async () => {
    const res = await fetch('/api/auth/logout', {
      method: 'POST',
      headers: getHeaders(),
    });
    return res.json();
  },
  getMe: async () => {
    const res = await fetch('/api/auth/me', { headers: getHeaders() });
    return res.json();
  },

  // Dashboard Stats
  getDashboardStats: async () => {
    const res = await fetch('/api/dashboard/stats', { headers: getHeaders() });
    return res.json();
  },

  // Events
  getEvents: async (params?: { limit?: number; offset?: number; severity?: string; category?: string; query?: string }) => {
    const query = new URLSearchParams();
    if (params?.limit) query.set('limit', String(params.limit));
    if (params?.offset) query.set('offset', String(params.offset));
    if (params?.severity) query.set('severity', params.severity);
    if (params?.category) query.set('category', params.category);
    if (params?.query) query.set('query', params.query);
    const res = await fetch(`/api/events?${query.toString()}`, { headers: getHeaders() });
    return res.json();
  },
  uploadDataset: async (csvData: string, filename: string) => {
    const res = await fetch('/api/events/upload', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ csvData, filename }),
    });
    return res.json();
  },
  analyzeEvent: async (eventData: any) => {
    const res = await fetch('/api/events/analyze', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(eventData),
    });
    return res.json();
  },

  // Alerts
  getAlerts: async (params?: { limit?: number; offset?: number; severity?: string; status?: string; query?: string }) => {
    const query = new URLSearchParams();
    if (params?.limit) query.set('limit', String(params.limit));
    if (params?.offset) query.set('offset', String(params.offset));
    if (params?.severity) query.set('severity', params.severity);
    if (params?.status) query.set('status', params.status);
    if (params?.query) query.set('query', params.query);
    const res = await fetch(`/api/alerts?${query.toString()}`, { headers: getHeaders() });
    return res.json();
  },
  getAlertById: async (id: string) => {
    const res = await fetch(`/api/alerts/${id}`, { headers: getHeaders() });
    return res.json();
  },
  updateAlertStatus: async (id: string, status: string) => {
    const res = await fetch(`/api/alerts/${id}/status`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ status }),
    });
    return res.json();
  },

  // Incidents
  getIncidents: async (params?: { limit?: number; offset?: number; severity?: string; status?: string; query?: string }) => {
    const query = new URLSearchParams();
    if (params?.limit) query.set('limit', String(params.limit));
    if (params?.offset) query.set('offset', String(params.offset));
    if (params?.severity) query.set('severity', params.severity);
    if (params?.status) query.set('status', params.status);
    if (params?.query) query.set('query', params.query);
    const res = await fetch(`/api/incidents?${query.toString()}`, { headers: getHeaders() });
    return res.json();
  },
  getIncidentById: async (id: string) => {
    const res = await fetch(`/api/incidents/${id}`, { headers: getHeaders() });
    return res.json();
  },
  updateIncidentStatus: async (id: string, status: string) => {
    const res = await fetch(`/api/incidents/${id}/status`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ status }),
    });
    return res.json();
  },

  // IoCs
  getIoCs: async (params?: { limit?: number; offset?: number; type?: string; severity?: string; query?: string }) => {
    const query = new URLSearchParams();
    if (params?.limit) query.set('limit', String(params.limit));
    if (params?.offset) query.set('offset', String(params.offset));
    if (params?.type) query.set('type', params.type);
    if (params?.severity) query.set('severity', params.severity);
    if (params?.query) query.set('query', params.query);
    const res = await fetch(`/api/iocs?${query.toString()}`, { headers: getHeaders() });
    return res.json();
  },

  // MITRE
  getMitreTechniques: async () => {
    const res = await fetch('/api/mitre/techniques', { headers: getHeaders() });
    return res.json();
  },

  // Analytics
  getAnalytics: async () => {
    const res = await fetch('/api/analytics', { headers: getHeaders() });
    return res.json();
  },

  // ML Performance & Models
  getModelMetrics: async () => {
    const res = await fetch('/api/ml/metrics', { headers: getHeaders() });
    return res.json();
  },
  trainModels: async () => {
    const res = await fetch('/api/ml/train', {
      method: 'POST',
      headers: getHeaders(),
    });
    return res.json();
  },

  // Comparison
  getComparison: async () => {
    const res = await fetch('/api/comparison', { headers: getHeaders() });
    return res.json();
  },

  // Rules
  getRules: async () => {
    const res = await fetch('/api/rules', { headers: getHeaders() });
    return res.json();
  },
  toggleRule: async (id: string, enabled: boolean) => {
    const res = await fetch(`/api/rules/${id}/toggle`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ enabled }),
    });
    return res.json();
  },

  // Responses
  getResponses: async () => {
    const res = await fetch('/api/responses', { headers: getHeaders() });
    return res.json();
  },
  updateResponseStatus: async (incidentId: string, recommendationId: string, status: string) => {
    const res = await fetch(`/api/responses/${incidentId}/${recommendationId}/status`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ status }),
    });
    return res.json();
  },

  // Demo controls
  runScenario: async (scenario: string) => {
    const res = await fetch('/api/demo/scenario', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ scenario }),
    });
    return res.json();
  },
  resetDemo: async () => {
    const res = await fetch('/api/demo/reset', {
      method: 'POST',
      headers: getHeaders(),
    });
    return res.json();
  },

  // Audit Logs
  getAuditLogs: async (limit = 50) => {
    const res = await fetch(`/api/audit-logs?limit=${limit}`, { headers: getHeaders() });
    return res.json();
  },

  // Settings
  getSettings: async () => {
    const res = await fetch('/api/settings', { headers: getHeaders() });
    return res.json();
  },
};
