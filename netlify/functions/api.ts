import Papa from 'papaparse';
import { db } from '../../server/database.js';

let initialized = false;
async function ensureDb() {
  if (!initialized) {
    await db.initialize();
    initialized = true;
  }
}

const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-user-email',
};

export const handler = async (event: any) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  await ensureDb();

  const fullPath = event.path || '';
  // Normalize path removing function prefix
  // e.g. /.netlify/functions/api/auth/login -> /auth/login
  // or /api/auth/login -> /auth/login
  let path = fullPath
    .replace(/^\/\.netlify\/functions\/api/, '')
    .replace(/^\/api/, '');

  if (!path.startsWith('/')) path = '/' + path;

  const method = (event.httpMethod || 'GET').toUpperCase();
  const query = event.queryStringParameters || {};
  let body: any = {};
  if (event.body) {
    try {
      body = JSON.parse(event.body);
    } catch {
      body = {};
    }
  }

  const userEmail = event.headers?.['x-user-email'] || query.user_email || 'demo@cybersentinel.ai';

  try {
    // 1. Auth routes
    if (path === '/auth/login' && method === 'POST') {
      const { email, password } = body;
      if (!email || !password) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Email and password are required' }),
        };
      }
      const user = db.verifyCredentials(email, password);
      if (!user) {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ error: 'Invalid email or password' }),
        };
      }
      db.addAuditLog(user.email, 'LOGIN', 'AUTHENTICATION', `Successful SOC login by ${user.name}`);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          token: `token_${user.id}_${Date.now()}`,
          user: { id: user.id, name: user.name, email: user.email, role: user.role },
        }),
      };
    }

    if (path === '/auth/logout' && method === 'POST') {
      db.addAuditLog(userEmail, 'LOGOUT', 'AUTHENTICATION', `User session ended for ${userEmail}`);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, message: 'Logged out successfully' }),
      };
    }

    if (path === '/auth/me' && method === 'GET') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          user: { id: 'usr-1', name: 'Suhani Yadav', email: userEmail, role: 'Lead Incident Responder' },
        }),
      };
    }

    // 2. Dashboard
    if (path === '/dashboard/stats' && method === 'GET') {
      const stats = db.getDashboardStats();
      return { statusCode: 200, headers, body: JSON.stringify(stats) };
    }

    // 3. Events
    if (path === '/events' && method === 'GET') {
      const limit = Math.min(200, Number(query.limit) || 50);
      const offset = Number(query.offset) || 0;
      const severity = query.severity || 'ALL';
      const category = query.category || 'ALL';
      const q = query.query || '';
      const data = db.getEvents(limit, offset, { severity, category, query: q });
      return { statusCode: 200, headers, body: JSON.stringify(data) };
    }

    if (path === '/events/upload' && method === 'POST') {
      const { csvData, filename } = body;
      if (!csvData) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'No CSV data provided' }) };
      }
      const parsed = Papa.parse(csvData, { header: true, skipEmptyLines: true });
      let processedCount = 0;
      let alertsGenerated = 0;
      for (const row of parsed.data as any[]) {
        if (!row.source_ip || !row.destination_ip) continue;
        const result = db.ingestLiveEvent(row, false);
        processedCount++;
        if (result.alert) alertsGenerated++;
      }
      db.addAuditLog(userEmail, 'DATASET_UPLOAD', 'INGESTION', `Ingested ${processedCount} events from ${filename}`);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, processedCount, alertsGenerated }),
      };
    }

    if (path === '/events/analyze' && method === 'POST') {
      const result = db.ingestLiveEvent(body, false);
      return { statusCode: 200, headers, body: JSON.stringify(result) };
    }

    // 4. Alerts
    if (path === '/alerts' && method === 'GET') {
      const limit = Math.min(200, Number(query.limit) || 50);
      const offset = Number(query.offset) || 0;
      const severity = query.severity || 'ALL';
      const status = query.status || 'ALL';
      const q = query.query || '';
      const data = db.getAlerts(limit, offset, { severity, status, query: q });
      return { statusCode: 200, headers, body: JSON.stringify(data) };
    }

    const alertStatusMatch = path.match(/^\/alerts\/([^/]+)\/status$/);
    if (alertStatusMatch && method === 'PATCH') {
      const alertId = alertStatusMatch[1];
      const updated = db.updateAlertStatus(alertId, body.status, userEmail);
      if (!updated) return { statusCode: 404, headers, body: JSON.stringify({ error: 'Alert not found' }) };
      return { statusCode: 200, headers, body: JSON.stringify(updated) };
    }

    const alertIdMatch = path.match(/^\/alerts\/([^/]+)$/);
    if (alertIdMatch && method === 'GET') {
      const alert = db.getAlertById(alertIdMatch[1]);
      if (!alert) return { statusCode: 404, headers, body: JSON.stringify({ error: 'Alert not found' }) };
      return { statusCode: 200, headers, body: JSON.stringify(alert) };
    }

    // 5. Incidents
    if (path === '/incidents' && method === 'GET') {
      const limit = Math.min(200, Number(query.limit) || 50);
      const offset = Number(query.offset) || 0;
      const severity = query.severity || 'ALL';
      const status = query.status || 'ALL';
      const q = query.query || '';
      const data = db.getIncidents(limit, offset, { severity, status, query: q });
      return { statusCode: 200, headers, body: JSON.stringify(data) };
    }

    const incidentStatusMatch = path.match(/^\/incidents\/([^/]+)\/status$/);
    if (incidentStatusMatch && method === 'PATCH') {
      const incidentId = incidentStatusMatch[1];
      const updated = db.updateIncidentStatus(incidentId, body.status, userEmail);
      if (!updated) return { statusCode: 404, headers, body: JSON.stringify({ error: 'Incident not found' }) };
      return { statusCode: 200, headers, body: JSON.stringify(updated) };
    }

    const incidentIdMatch = path.match(/^\/incidents\/([^/]+)$/);
    if (incidentIdMatch && method === 'GET') {
      const incident = db.getIncidentById(incidentIdMatch[1]);
      if (!incident) return { statusCode: 404, headers, body: JSON.stringify({ error: 'Incident not found' }) };
      return { statusCode: 200, headers, body: JSON.stringify(incident) };
    }

    // 6. IoCs
    if (path === '/iocs' && method === 'GET') {
      const limit = Math.min(200, Number(query.limit) || 50);
      const offset = Number(query.offset) || 0;
      const type = query.type || 'ALL';
      const severity = query.severity || 'ALL';
      const q = query.query || '';
      const data = db.getIoCs(limit, offset, { type, severity, query: q });
      return { statusCode: 200, headers, body: JSON.stringify(data) };
    }

    // 7. MITRE
    if (path === '/mitre/techniques' && method === 'GET') {
      const list = db.getMitreTechniques();
      return { statusCode: 200, headers, body: JSON.stringify(list) };
    }

    // 8. Analytics
    if (path === '/analytics' && method === 'GET') {
      const analytics = db.getAnalytics();
      return { statusCode: 200, headers, body: JSON.stringify(analytics) };
    }

    // 9. Machine Learning
    if (path === '/ml/metrics' && method === 'GET') {
      const metrics = db.getModelMetrics();
      return { statusCode: 200, headers, body: JSON.stringify(metrics) };
    }

    if (path === '/ml/train' && method === 'POST') {
      db.trainModels();
      db.addAuditLog(userEmail, 'MODEL_TRAIN', 'ML_PIPELINE', 'Models retrained via Netlify function');
      const metrics = db.getModelMetrics();
      return { statusCode: 200, headers, body: JSON.stringify({ success: true, metrics }) };
    }

    // 10. Comparison
    if (path === '/comparison' && method === 'GET') {
      const comp = db.getComparisonMetrics();
      return { statusCode: 200, headers, body: JSON.stringify(comp) };
    }

    // 11. Rules
    if (path === '/rules' && method === 'GET') {
      const rules = db.getRules();
      return { statusCode: 200, headers, body: JSON.stringify(rules) };
    }

    const ruleToggleMatch = path.match(/^\/rules\/([^/]+)\/toggle$/);
    if (ruleToggleMatch && method === 'PATCH') {
      const ruleId = ruleToggleMatch[1];
      const updated = db.toggleRule(ruleId, Boolean(body.enabled), userEmail);
      if (!updated) return { statusCode: 404, headers, body: JSON.stringify({ error: 'Rule not found' }) };
      return { statusCode: 200, headers, body: JSON.stringify(updated) };
    }

    // 12. Responses
    if (path === '/responses' && method === 'GET') {
      const recs = db.getAllRecommendations();
      return { statusCode: 200, headers, body: JSON.stringify(recs) };
    }

    const recStatusMatch = path.match(/^\/responses\/([^/]+)\/([^/]+)\/status$/);
    if (recStatusMatch && method === 'PATCH') {
      const incidentId = recStatusMatch[1];
      const recId = recStatusMatch[2];
      const updated = db.updateResponseStatus(incidentId, recId, body.status, userEmail);
      if (!updated) return { statusCode: 404, headers, body: JSON.stringify({ error: 'Recommendation not found' }) };
      return { statusCode: 200, headers, body: JSON.stringify(updated) };
    }

    // 13. Demo simulation
    if (path === '/demo/scenario' && method === 'POST') {
      const { scenario } = body;
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
      };
      const events = scenarios[scenario] || scenarios['Brute Force'];
      const results = events.map((ev) => db.ingestLiveEvent(ev, true));
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ scenario, eventsProcessed: results.length, results }),
      };
    }

    if (path === '/demo/reset' && method === 'POST') {
      db.resetDemoData();
      return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
    }

    // 14. Audit logs & Settings
    if (path === '/audit-logs' && method === 'GET') {
      const logs = db.getAuditLogs(Number(query.limit) || 50);
      return { statusCode: 200, headers, body: JSON.stringify(logs) };
    }

    if (path === '/settings' && method === 'GET') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          platformName: 'CyberSentinel AI',
          version: '2.4.0-SOC',
          environment: 'Netlify Serverless Production',
          isolationForestThreshold: 0.55,
          autoContainmentPolicy: 'Assisted Analyst Confirmation',
          iocFeedsEnabled: true,
          sigmaRulesCount: db.getRules().length,
        }),
      };
    }

    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: `Not found: ${method} ${path}` }),
    };
  } catch (err: any) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message || 'Internal server error' }),
    };
  }
};
