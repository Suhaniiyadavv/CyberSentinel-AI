export type SeverityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type IncidentStatus = 'New' | 'Investigating' | 'Contained' | 'Resolved' | 'False Positive';
export type AlertStatus = 'New' | 'Investigating' | 'Resolved' | 'False Positive';
export type ResponseStatus = 'Pending' | 'Approved' | 'Completed' | 'Rejected';
export type DetectionSource = 'AI' | 'RULE' | 'AI + RULE';

export interface SecurityEvent {
  id: string;
  timestamp: string;
  source_ip: string;
  destination_ip: string;
  source_port: number;
  destination_port: number;
  protocol: string;
  packet_count: number;
  byte_count: number;
  flow_duration_ms: number;
  syn_count: number;
  ack_count: number;
  fin_count: number;
  failed_login_count: number;
  success_login_count: number;
  http_method: string;
  user_agent: string;
  payload_sample: string;
  ground_truth_label?: 'Normal' | 'Malicious';
  ground_truth_category?: string;

  // AI & Detection Pipeline enriched fields
  anomaly_score?: number;
  is_anomaly?: boolean;
  predicted_category?: string;
  classifier_confidence?: number;
  ai_risk_score?: number;
  rule_matches?: string[];
  detection_source?: DetectionSource;
  severity?: SeverityLevel;
  associated_incident_id?: string;
  associated_alert_id?: string;
  is_demo?: boolean;
}

export interface SecurityAlert {
  id: string;
  timestamp: string;
  title: string;
  source_ip: string;
  destination_ip: string;
  destination_port: number;
  protocol: string;
  event_type: string;
  incident_type: string;
  severity: SeverityLevel;
  confidence: number;
  ai_risk_score: number;
  detection_source: DetectionSource;
  status: AlertStatus;
  assigned_analyst: string;
  ai_explanation: string;
  contributing_features: { feature: string; importance: string; value: string | number }[];
  iocs: string[];
  mitre_technique_id: string;
  mitre_technique_name: string;
  mitre_tactic: string;
  raw_event_id: string;
  is_demo?: boolean;
}

export interface SecurityIncident {
  id: string;
  title: string;
  incident_type: string;
  severity: SeverityLevel;
  status: IncidentStatus;
  detected_at: string;
  updated_at: string;
  source_ip: string;
  target_ip: string;
  affected_hosts: string[];
  confidence: number;
  ai_risk_score: number;
  detection_source: DetectionSource;
  alert_count: number;
  event_ids: string[];
  iocs: IoCRecord[];
  mitre_technique: {
    id: string;
    name: string;
    tactic: string;
    description: string;
  };
  ai_explanation: string;
  severity_breakdown: {
    factor: string;
    impact: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    detail: string;
  }[];
  timeline: {
    timestamp: string;
    action: string;
    detail: string;
    icon: string;
  }[];
  recommended_actions: ResponseRecommendation[];
  is_demo?: boolean;
}

export interface IoCRecord {
  id: string;
  value: string;
  type: 'IPv4' | 'Domain' | 'URL' | 'MD5' | 'SHA256' | 'Port' | 'Email';
  risk_score: number;
  severity: SeverityLevel;
  first_seen: string;
  last_seen: string;
  incident_id?: string;
  incident_type?: string;
  event_count: number;
  threat_context: string;
}

export interface MitreTechnique {
  id: string;
  name: string;
  tactic: string;
  description: string;
  detection: string;
  mitigation: string;
  severity: SeverityLevel;
  incident_count: number;
}

export interface ResponseRecommendation {
  id: string;
  incident_id: string;
  action: string;
  reason: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  mitre_technique_id: string;
  status: ResponseStatus;
  automated_script_preview: string;
  created_at: string;
  updated_at: string;
}

export interface SigmaRule {
  id: string;
  title: string;
  description: string;
  severity: SeverityLevel;
  category: string;
  enabled: boolean;
  author: string;
  mitre_attack_id: string;
  condition: string;
  matches_count: number;
  sigma_yaml: string;
}

export interface ModelMetrics {
  algorithm: string;
  version: string;
  trained_at: string;
  dataset_name: string;
  dataset_size: number;
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
  false_positive_rate: number;
  false_negative_rate: number;
  auc_roc: number;
  confusion_matrix: {
    classes: string[];
    matrix: number[][];
  };
  classification_report: {
    category: string;
    precision: number;
    recall: number;
    f1: number;
    support: number;
  }[];
  feature_importances: {
    feature: string;
    importance: number;
    description: string;
  }[];
}

export interface DetectionComparison {
  ai_metrics: {
    accuracy: number;
    precision: number;
    recall: number;
    f1_score: number;
    false_positive_rate: number;
    false_negative_rate: number;
    detection_count: number;
    unknown_anomalies_detected: number;
    avg_latency_ms: number;
  };
  rule_metrics: {
    accuracy: number;
    precision: number;
    recall: number;
    f1_score: number;
    false_positive_rate: number;
    false_negative_rate: number;
    detection_count: number;
    unknown_anomalies_detected: number;
    avg_latency_ms: number;
  };
  combined_metrics: {
    accuracy: number;
    precision: number;
    recall: number;
    f1_score: number;
    false_positive_rate: number;
    false_negative_rate: number;
    detection_count: number;
  };
  breakdown_by_category: {
    category: string;
    ai_detected: number;
    rule_detected: number;
    total: number;
    advantage: string;
  }[];
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user_email: string;
  action: string;
  category: string;
  details: string;
  ip_address: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'SOC Analyst' | 'Lead Incident Responder' | 'Security Admin';
  password_hash: string;
  created_at: string;
}
