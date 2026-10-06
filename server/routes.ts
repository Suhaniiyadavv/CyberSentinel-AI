import { Router } from 'express';
import Papa from 'papaparse';
import { db } from './database.js';

export const apiRouter = Router();

// Middleware to extract user email or default to demo user
const getUserEmail = (req: any): string => {
  return req.headers['x-user-email'] || req.query.user_email || 'demo@cybersentinel.ai';
};

// ================= AUTHENTICATION =================
apiRouter.post('/auth/login', (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const user = db.verifyCredentials(email, password);
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  db.addAuditLog(user.email, 'LOGIN', 'AUTHENTICATION', `Successful SOC login by ${user.name} (${user.role})`);
  return res.json({
    token: `token_${user.id}_${Date.now()}`,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
});

apiRouter.post('/auth/logout', (req, res) => {
  const email = getUserEmail(req);
  db.addAuditLog(email, 'LOGOUT', 'AUTHENTICATION', `User session ended for ${email}`);
  return res.json({ success: true, message: 'Logged out successfully' });
});

apiRouter.get('/auth/me', (req, res) => {
  const email = getUserEmail(req);
  return res.json({
    user: {
      id: 'usr-1',
      name: 'Suhani Yadav',
      email,
      role: 'Lead Incident Responder',
    },
  });
});

// ================= DASHBOARD & STATS =================
apiRouter.get('/dashboard/stats', (req, res) => {
  const stats = db.getDashboardStats();
  return res.json(stats);
});

// ================= SECURITY EVENTS =================
apiRouter.get('/events', (req, res) => {
  const limit = Math.min(200, Number(req.query.limit) || 50);
  const offset = Number(req.query.offset) || 0;
  const severity = (req.query.severity as string) || 'ALL';
  const category = (req.query.category as string) || 'ALL';
  const query = (req.query.query as string) || '';

  const data = db.getEvents(limit, offset, { severity, category, query });
  return res.json(data);
});

apiRouter.post('/events/upload', (req, res) => {
  const { csvData, filename } = req.body || {};
  if (!csvData) {
    return res.status(400).json({ error: 'No CSV data provided' });
  }

  try {
    const parsed = Papa.parse(csvData, { header: true, skipEmptyLines: true });
    if (!parsed.data || parsed.data.length === 0) {
      return res.status(400).json({ error: 'CSV file is empty or invalid format' });
    }

    let processedCount = 0;
    let alertsGenerated = 0;

    for (const row of parsed.data as any[]) {
      if (!row.source_ip || !row.destination_ip) continue;
      const result = db.ingestLiveEvent(
        {
          source_ip: row.source_ip,
          destination_ip: row.destination_ip,
          source_port: Number(row.source_port) || 0,
          destination_port: Number(row.destination_port) || 0,
          protocol: row.protocol || 'TCP',
          packet_count: Number(row.packet_count) || 10,
          byte_count: Number(row.byte_count) || 1200,
          flow_duration_ms: Number(row.flow_duration_ms) || 500,
          syn_count: Number(row.syn_count) || 0,
          ack_count: Number(row.ack_count) || 0,
          fin_count: Number(row.fin_count) || 0,
          failed_login_count: Number(row.failed_login_count) || 0,
          success_login_count: Number(row.success_login_count) || 0,
          http_method: row.http_method || '-',
          user_agent: row.user_agent || '-',
          payload_sample: row.payload_sample || '',
          ground_truth_label: row.label === 'Malicious' ? 'Malicious' : 'Normal',
          ground_truth_category: row.attack_category || row.label,
        },
        false
      );

      processedCount++;
      if (result.alert) alertsGenerated++;
    }

    db.addAuditLog(
      getUserEmail(req),
      'DATASET_UPLOAD',
      'INGESTION',
      `Ingested ${processedCount} events from ${filename || 'dataset.csv'}; generated ${alertsGenerated} alerts`
    );

    return res.json({
      success: true,
      processedCount,
      alertsGenerated,
      message: `Successfully processed ${processedCount} events from dataset.`,
    });
  } catch (err: any) {
    return res.status(500).json({ error: `Dataset ingestion failed: ${err.message}` });
  }
});

// Single manual event analysis
apiRouter.post('/events/analyze', (req, res) => {
  const rawEvent = req.body;
  if (!rawEvent.source_ip || !rawEvent.destination_ip) {
    return res.status(400).json({ error: 'source_ip and destination_ip are required' });
  }

  const result = db.ingestLiveEvent(rawEvent, false);
  return res.json(result);
});

// ================= ALERTS =================
apiRouter.get('/alerts', (req, res) => {
  const limit = Math.min(200, Number(req.query.limit) || 50);
  const offset = Number(req.query.offset) || 0;
  const severity = (req.query.severity as string) || 'ALL';
  const status = (req.query.status as string) || 'ALL';
  const query = (req.query.query as string) || '';

  const data = db.getAlerts(limit, offset, { severity, status, query });
  return res.json(data);
});

apiRouter.get('/alerts/:id', (req, res) => {
  const alert = db.getAlertById(req.params.id);
  if (!alert) return res.status(404).json({ error: 'Alert not found' });
  return res.json(alert);
});

apiRouter.patch('/alerts/:id/status', (req, res) => {
  const { status } = req.body || {};
  if (!status) return res.status(400).json({ error: 'Status is required' });
  const updated = db.updateAlertStatus(req.params.id, status, getUserEmail(req));
  if (!updated) return res.status(404).json({ error: 'Alert not found' });
  return res.json(updated);
});

// ================= INCIDENTS =================
apiRouter.get('/incidents', (req, res) => {
  const limit = Math.min(200, Number(req.query.limit) || 50);
  const offset = Number(req.query.offset) || 0;
  const severity = (req.query.severity as string) || 'ALL';
  const status = (req.query.status as string) || 'ALL';
  const query = (req.query.query as string) || '';

  const data = db.getIncidents(limit, offset, { severity, status, query });
  return res.json(data);
});

apiRouter.get('/incidents/:id', (req, res) => {
  const incident = db.getIncidentById(req.params.id);
  if (!incident) return res.status(404).json({ error: 'Incident not found' });
  return res.json(incident);
});

apiRouter.patch('/incidents/:id/status', (req, res) => {
  const { status } = req.body || {};
  if (!status) return res.status(400).json({ error: 'Status is required' });
  const updated = db.updateIncidentStatus(req.params.id, status, getUserEmail(req));
  if (!updated) return res.status(404).json({ error: 'Incident not found' });
  return res.json(updated);
});

// ================= INDICATORS OF COMPROMISE (IoCs) =================
apiRouter.get('/iocs', (req, res) => {
  const limit = Math.min(200, Number(req.query.limit) || 50);
  const offset = Number(req.query.offset) || 0;
  const type = (req.query.type as string) || 'ALL';
  const severity = (req.query.severity as string) || 'ALL';
  const query = (req.query.query as string) || '';

  const data = db.getIoCs(limit, offset, { type, severity, query });
  return res.json(data);
});

apiRouter.get('/iocs/:value', (req, res) => {
  const ioc = db.getIoCByValue(decodeURIComponent(req.params.value));
  if (!ioc) return res.status(404).json({ error: 'IoC not found' });
  return res.json(ioc);
});

// ================= MITRE ATT&CK =================
apiRouter.get('/mitre/techniques', (req, res) => {
  const list = db.getMitreTechniques();
  return res.json(list);
});

// ================= ANALYTICS =================
apiRouter.get('/analytics', (req, res) => {
  const analytics = db.getAnalytics();
  return res.json(analytics);
});

// ================= MACHINE LEARNING =================
apiRouter.get('/ml/metrics', (req, res) => {
  const metrics = db.getModelMetrics();
  return res.json(metrics);
});

apiRouter.post('/ml/train', (req, res) => {
  const email = getUserEmail(req);
  db.trainModels();
  db.addAuditLog(email, 'MODEL_TRAIN', 'ML_PIPELINE', 'Random Forest & Isolation Forest retrained on current dataset');
  const metrics = db.getModelMetrics();
  return res.json({
    success: true,
    message: 'Models successfully trained and persisted.',
    metrics,
  });
});

// ================= AI VS RULES COMPARISON =================
apiRouter.get('/comparison', (req, res) => {
  const comparison = db.getComparisonMetrics();
  return res.json(comparison);
});

// ================= RULES & SIGMA =================
apiRouter.get('/rules', (req, res) => {
  const rules = db.getRules();
  return res.json(rules);
});

apiRouter.patch('/rules/:id/toggle', (req, res) => {
  const { enabled } = req.body || {};
  const updated = db.toggleRule(req.params.id, Boolean(enabled), getUserEmail(req));
  if (!updated) return res.status(404).json({ error: 'Rule not found' });
  return res.json(updated);
});

// ================= RESPONSE RECOMMENDATIONS =================
apiRouter.get('/responses', (req, res) => {
  const recs = db.getAllRecommendations();
  return res.json(recs);
});

apiRouter.patch('/responses/:incidentId/:recommendationId/status', (req, res) => {
  const { status } = req.body || {};
  if (!status) return res.status(400).json({ error: 'Status is required' });
  const updated = db.updateResponseStatus(
    req.params.incidentId,
    req.params.recommendationId,
    status,
    getUserEmail(req)
  );
  if (!updated) return res.status(404).json({ error: 'Recommendation not found' });
  return res.json(updated);
});

// ================= LIVE DEMO SIMULATION =================
apiRouter.post('/demo/scenario', (req, res) => {
  const { scenario } = req.body || {};

  const scenarios: Record<string, Partial<any>[]> = {
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
      {
        source_ip: '45.33.32.156',
        destination_ip: '10.0.0.50',
        destination_port: 22,
        protocol: 'TCP',
        packet_count: 1,
        byte_count: 40,
        flow_duration_ms: 11,
        syn_count: 1,
        ack_count: 0,
        payload_sample: 'TCP SYN stealth scan probe port 22 ssh',
        ground_truth_label: 'Malicious',
        ground_truth_category: 'Port Scan',
      },
      {
        source_ip: '45.33.32.156',
        destination_ip: '10.0.0.50',
        destination_port: 80,
        protocol: 'TCP',
        packet_count: 1,
        byte_count: 40,
        flow_duration_ms: 10,
        syn_count: 1,
        ack_count: 0,
        payload_sample: 'TCP SYN stealth scan probe port 80 http',
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

  const eventsToInject = scenarios[scenario] || scenarios['Normal Traffic'];
  const generatedResults = [];

  for (const ev of eventsToInject) {
    const res = db.ingestLiveEvent(ev, true);
    generatedResults.push(res);
  }

  db.addAuditLog(
    getUserEmail(req),
    'DEMO_SCENARIO',
    'SIMULATION',
    `Executed demonstration attack scenario: "${scenario}" (${generatedResults.length} events processed)`
  );

  return res.json({
    scenario,
    eventsProcessed: generatedResults.length,
    results: generatedResults,
  });
});

apiRouter.post('/demo/reset', (req, res) => {
  db.resetDemoData();
  return res.json({ success: true, message: 'Demo events cleared successfully' });
});

// ================= AUDIT LOGS =================
apiRouter.get('/audit-logs', (req, res) => {
  const limit = Math.min(100, Number(req.query.limit) || 50);
  const logs = db.getAuditLogs(limit);
  return res.json(logs);
});

// ================= SETTINGS =================
apiRouter.get('/settings', (req, res) => {
  return res.json({
    platformName: 'CyberSentinel AI',
    version: '2.4.0-SOC',
    environment: 'Local SOC Deployment',
    isolationForestThreshold: 0.55,
    autoContainmentPolicy: 'Assisted Analyst Confirmation',
    iocFeedsEnabled: true,
    sigmaRulesCount: db.getRules().length,
  });
});
