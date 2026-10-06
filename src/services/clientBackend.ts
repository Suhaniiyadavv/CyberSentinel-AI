/**
 * Client-Side SOC Backend Engine
 * Provides resilient zero-dependency fallback when deployed on purely static hosts
 * without running backend processes or serverless functions.
 * Executes the EXACT same Isolation Forest, Random Forest, Sigma rules, and DB methods!
 */

import Papa from 'papaparse';
import { db } from '../../server/database.js';

let initialized = false;

export async function ensureClientDb() {
  if (!initialized) {
    await db.initialize();
    initialized = true;
  }
  return db;
}

export const clientBackend = {
  login: async (email: string, password: string) => {
    const database = await ensureClientDb();
    const user = database.verifyCredentials(email, password);
    if (!user) {
      return { error: 'Invalid email or password' };
    }
    database.addAuditLog(user.email, 'LOGIN', 'AUTHENTICATION', `Successful SOC login by ${user.name}`);
    return {
      token: `token_${user.id}_${Date.now()}`,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  },

  logout: async (userEmail: string) => {
    const database = await ensureClientDb();
    database.addAuditLog(userEmail, 'LOGOUT', 'AUTHENTICATION', `User session ended for ${userEmail}`);
    return { success: true, message: 'Logged out successfully' };
  },

  getMe: async (userEmail: string) => {
    return {
      user: {
        id: 'usr-1',
        name: 'Suhani Yadav',
        email: userEmail,
        role: 'Lead Incident Responder',
      },
    };
  },

  getDashboardStats: async () => {
    const database = await ensureClientDb();
    return database.getDashboardStats();
  },

  getEvents: async (params?: { limit?: number; offset?: number; severity?: string; category?: string; query?: string }) => {
    const database = await ensureClientDb();
    return database.getEvents(params?.limit || 50, params?.offset || 0, {
      severity: params?.severity,
      category: params?.category,
      query: params?.query,
    });
  },

  uploadDataset: async (csvData: string, filename: string, userEmail: string) => {
    const database = await ensureClientDb();
    const parsed = Papa.parse(csvData, { header: true, skipEmptyLines: true });
    let processedCount = 0;
    let alertsGenerated = 0;
    for (const row of parsed.data as any[]) {
      if (!row.source_ip || !row.destination_ip) continue;
      const result = database.ingestLiveEvent(row, false);
      processedCount++;
      if (result.alert) alertsGenerated++;
    }
    database.addAuditLog(userEmail, 'DATASET_UPLOAD', 'INGESTION', `Ingested ${processedCount} events from ${filename}`);
    return { success: true, processedCount, alertsGenerated };
  },

  analyzeEvent: async (eventData: any) => {
    const database = await ensureClientDb();
    return database.ingestLiveEvent(eventData, false);
  },

  getAlerts: async (params?: { limit?: number; offset?: number; severity?: string; status?: string; query?: string }) => {
    const database = await ensureClientDb();
    return database.getAlerts(params?.limit || 50, params?.offset || 0, {
      severity: params?.severity,
      status: params?.status,
      query: params?.query,
    });
  },

  getAlertById: async (id: string) => {
    const database = await ensureClientDb();
    return database.getAlertById(id) || { error: 'Alert not found' };
  },

  updateAlertStatus: async (id: string, status: string, userEmail: string) => {
    const database = await ensureClientDb();
    return database.updateAlertStatus(id, status as any, userEmail) || { error: 'Alert not found' };
  },

  getIncidents: async (params?: { limit?: number; offset?: number; severity?: string; status?: string; query?: string }) => {
    const database = await ensureClientDb();
    return database.getIncidents(params?.limit || 50, params?.offset || 0, {
      severity: params?.severity,
      status: params?.status,
      query: params?.query,
    });
  },

  getIncidentById: async (id: string) => {
    const database = await ensureClientDb();
    return database.getIncidentById(id) || { error: 'Incident not found' };
  },

  updateIncidentStatus: async (id: string, status: string, userEmail: string) => {
    const database = await ensureClientDb();
    return database.updateIncidentStatus(id, status as any, userEmail) || { error: 'Incident not found' };
  },

  getIoCs: async (params?: { limit?: number; offset?: number; type?: string; severity?: string; query?: string }) => {
    const database = await ensureClientDb();
    return database.getIoCs(params?.limit || 50, params?.offset || 0, {
      type: params?.type,
      severity: params?.severity,
      query: params?.query,
    });
  },

  getMitreTechniques: async () => {
    const database = await ensureClientDb();
    return database.getMitreTechniques();
  },

  getAnalytics: async () => {
    const database = await ensureClientDb();
    return database.getAnalytics();
  },

  getModelMetrics: async () => {
    const database = await ensureClientDb();
    return database.getModelMetrics();
  },

  trainModels: async (userEmail: string) => {
    const database = await ensureClientDb();
    database.trainModels();
    database.addAuditLog(userEmail, 'MODEL_TRAIN', 'ML_PIPELINE', 'Models retrained in client SOC instance');
    return { success: true, metrics: database.getModelMetrics() };
  },

  getComparison: async () => {
    const database = await ensureClientDb();
    return database.getComparisonMetrics();
  },

  getRules: async () => {
    const database = await ensureClientDb();
    return database.getRules();
  },

  toggleRule: async (id: string, enabled: boolean, userEmail: string) => {
    const database = await ensureClientDb();
    return database.toggleRule(id, enabled, userEmail) || { error: 'Rule not found' };
  },

  getResponses: async () => {
    const database = await ensureClientDb();
    return database.getAllRecommendations();
  },

  updateResponseStatus: async (incidentId: string, recommendationId: string, status: string, userEmail: string) => {
    const database = await ensureClientDb();
    return (
      database.updateResponseStatus(incidentId, recommendationId, status as any, userEmail) || {
        error: 'Recommendation not found',
      }
    );
  },

  runScenario: async (scenario: string, userEmail: string) => {
    const database = await ensureClientDb();
    const scenarios: Record<string, any[]> = {
      'Brute Force': [
        {
          source_ip: '192.168.1.145',
          destination_ip: '10.0.0.12',
          destination_port: 22,
          protocol: 'TCP',
          packet_count: 4,
          byte_count: 220,
          flow_duration_ms: 90,
          syn_count: 4,
          ack_count: 0,
          failed_login_count: 12,
          success_login_count: 0,
          payload_sample: 'SSH-2.0-OpenSSH dictionary attack attempt root password=Password123',
          ground_truth_label: 'Malicious',
          ground_truth_category: 'Brute Force',
        },
      ],
      'Port Scan': [
        {
          source_ip: '45.33.32.156',
          destination_ip: '10.0.0.50',
          destination_port: 21,
          protocol: 'TCP',
          packet_count: 1,
          byte_count: 40,
          flow_duration_ms: 12,
          syn_count: 1,
          ack_count: 0,
          payload_sample: 'TCP SYN stealth scan probe port 21 ftp',
          ground_truth_label: 'Malicious',
          ground_truth_category: 'Port Scan',
        },
      ],
      'DoS/DDoS': [
        {
          source_ip: '185.190.140.22',
          destination_ip: '10.0.0.100',
          destination_port: 80,
          protocol: 'TCP',
          packet_count: 3200,
          byte_count: 1900000,
          flow_duration_ms: 950,
          syn_count: 3100,
          ack_count: 0,
          payload_sample: 'TCP SYN Flood volumetric exhaustion DoS rate=3300 pps',
          ground_truth_label: 'Malicious',
          ground_truth_category: 'DoS/DDoS',
        },
      ],
      'Web Attack': [
        {
          source_ip: '198.51.100.89',
          destination_ip: '10.0.0.25',
          destination_port: 80,
          protocol: 'TCP',
          packet_count: 10,
          byte_count: 3200,
          flow_duration_ms: 220,
          syn_count: 1,
          ack_count: 8,
          payload_sample: "GET /admin/users.php?id=1' UNION SELECT username,password_hash FROM admin_users-- HTTP/1.1",
          ground_truth_label: 'Malicious',
          ground_truth_category: 'Web Attack',
        },
      ],
      'Infiltration & C2': [
        {
          source_ip: '192.168.1.190',
          destination_ip: '203.0.113.77',
          destination_port: 4444,
          protocol: 'TCP',
          packet_count: 80,
          byte_count: 16400,
          flow_duration_ms: 6800,
          syn_count: 2,
          ack_count: 75,
          payload_sample: 'Metasploit reverse meterpreter session established /bin/sh interactive root',
          ground_truth_label: 'Malicious',
          ground_truth_category: 'Infiltration',
        },
      ],
      'Normal Traffic': [
        {
          source_ip: '192.168.1.108',
          destination_ip: '10.0.0.15',
          destination_port: 443,
          protocol: 'TCP',
          packet_count: 42,
          byte_count: 28000,
          flow_duration_ms: 1200,
          syn_count: 2,
          ack_count: 38,
          failed_login_count: 0,
          success_login_count: 1,
          payload_sample: 'Standard TLSv1.3 application telemetry handshake',
          ground_truth_label: 'Normal',
          ground_truth_category: 'Normal',
        },
      ],
    };

    const events = scenarios[scenario] || scenarios['Brute Force'];
    const results = events.map((ev) => database.ingestLiveEvent(ev, true));
    database.addAuditLog(userEmail, 'DEMO_SCENARIO', 'SIMULATION', `Executed scenario: "${scenario}"`);
    return { scenario, eventsProcessed: results.length, results };
  },

  resetDemo: async () => {
    const database = await ensureClientDb();
    database.resetDemoData();
    return { success: true, message: 'Demo events cleared successfully' };
  },

  getAuditLogs: async (limit = 50) => {
    const database = await ensureClientDb();
    return database.getAuditLogs(limit);
  },

  getSettings: async () => {
    const database = await ensureClientDb();
    return {
      platformName: 'CyberSentinel AI',
      version: '2.4.0-SOC',
      environment: 'Netlify Standalone & Serverless SOC',
      isolationForestThreshold: 0.55,
      autoContainmentPolicy: 'Assisted Analyst Confirmation',
      iocFeedsEnabled: true,
      sigmaRulesCount: database.getRules().length,
    };
  },
};
