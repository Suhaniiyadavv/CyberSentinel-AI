import {
  DetectionSource,
  SecurityAlert,
  SecurityEvent,
  SecurityIncident,
  SeverityLevel,
} from '../types.js';
import { IsolationForest } from '../ml/isolationForest.js';
import { RandomForestClassifier } from '../ml/randomForest.js';
import { PreprocessingPipeline } from './preprocessing.js';
import { RuleEngine } from './ruleEngine.js';
import { SeverityEngine } from './severityEngine.js';
import { IoCExtractor } from './iocExtractor.js';
import { MitreMapper } from './mitreMapper.js';
import { ResponseEngine } from './responseEngine.js';

export interface PipelineResult {
  enrichedEvent: SecurityEvent;
  alert?: SecurityAlert;
  incident?: SecurityIncident;
}

export class DetectionPipeline {
  private iForest: IsolationForest;
  private classifier: RandomForestClassifier;
  private pipeline: PreprocessingPipeline;
  private ruleEngine: RuleEngine;

  constructor(
    iForest: IsolationForest,
    classifier: RandomForestClassifier,
    pipeline: PreprocessingPipeline,
    ruleEngine: RuleEngine
  ) {
    this.iForest = iForest;
    this.classifier = classifier;
    this.pipeline = pipeline;
    this.ruleEngine = ruleEngine;
  }

  public processEvent(
    event: SecurityEvent,
    existingIncidents: Map<string, SecurityIncident>
  ): PipelineResult {
    // 1. Feature extraction and transformation
    const rawFeats = this.pipeline.extractFeatures(event);
    const scaledFeats = this.pipeline.transform(rawFeats);

    // 2. Machine Learning Anomaly Detection (Isolation Forest)
    const anomalyScore = Math.round(this.iForest.anomalyScore(scaledFeats) * 100) / 100;
    const isAnomaly = this.iForest.isAnomaly(scaledFeats);
    const aiRiskScore = this.iForest.riskScore(scaledFeats);

    // 3. Supervised Classification (Random Forest)
    const clfResult = this.classifier.predict(scaledFeats);
    const predictedCategory = clfResult.category;
    const confidence = clfResult.confidence;

    // 4. Deterministic Rule Evaluation (Sigma Rules)
    const ruleMatches = this.ruleEngine.evaluate(event);
    const matchedRuleIds = ruleMatches.map((r) => r.ruleId!);

    // 5. Decision Fusion & Detection Source Classification
    let isMalicious = false;
    let detectionSource: DetectionSource = 'AI';
    let finalCategory = predictedCategory;

    const hasRuleMatch = ruleMatches.length > 0;
    const isAiMalicious = isAnomaly || predictedCategory !== 'Normal';

    if (hasRuleMatch && isAiMalicious) {
      isMalicious = true;
      detectionSource = 'AI + RULE';
      finalCategory = predictedCategory !== 'Normal' ? predictedCategory : ruleMatches[0].category || 'Suspicious Activity';
    } else if (hasRuleMatch && !isAiMalicious) {
      isMalicious = true;
      detectionSource = 'RULE';
      finalCategory = ruleMatches[0].category || 'Known Threat';
    } else if (!hasRuleMatch && isAiMalicious) {
      isMalicious = true;
      detectionSource = 'AI';
      if (isAnomaly && predictedCategory === 'Normal') {
        finalCategory = 'Potential Unknown / Zero-Day Anomaly';
      }
    } else {
      isMalicious = false;
      finalCategory = 'Normal';
    }

    // 6. Generate Contextual AI Explanation from Actual Feature Evidence
    const explanation = this.buildExplanation({
      event,
      isAnomaly,
      anomalyScore,
      predictedCategory: finalCategory,
      confidence,
      ruleMatches,
      detectionSource,
    });

    const durationSec = (event.flow_duration_ms || 1) / 1000;
    const packetRate = (event.packet_count || 0) / (durationSec + 0.001);

    // 7. Calculate Severity
    const severityRes = isMalicious
      ? SeverityEngine.calculate({
          attackCategory: finalCategory,
          confidence,
          anomalyScore,
          aiRiskScore,
          failedLoginCount: event.failed_login_count || 0,
          packetRate,
          destinationPort: event.destination_port || 0,
          iocCount: 1, // baseline
          ruleMatchesCount: ruleMatches.length,
        })
      : { level: 'LOW' as SeverityLevel, numericScore: 10, breakdown: [] };

    // Enriched event object
    const enrichedEvent: SecurityEvent = {
      ...event,
      anomaly_score: anomalyScore,
      is_anomaly: isAnomaly,
      predicted_category: finalCategory,
      classifier_confidence: confidence,
      ai_risk_score: isMalicious ? Math.max(aiRiskScore, severityRes.numericScore) : 12,
      rule_matches: matchedRuleIds,
      detection_source: detectionSource,
      severity: severityRes.level,
    };

    if (!isMalicious) {
      return { enrichedEvent };
    }

    // 8. Indicators of Compromise (IoC) Extraction
    const incidentCorrelationKey = `${event.source_ip}_${finalCategory}`;
    let incident = existingIncidents.get(incidentCorrelationKey);
    const incidentId = incident ? incident.id : `INC-${Math.floor(1000 + Math.random() * 9000)}`;

    const iocs = IoCExtractor.extractFromEvent(enrichedEvent, incidentId);

    // 9. MITRE ATT&CK Mapping
    const mitreTech = MitreMapper.mapCategory(finalCategory, event.payload_sample);

    // 10. Generate Security Alert
    const alertId = `ALT-${Date.now().toString().slice(-6)}-${Math.floor(10 + Math.random() * 90)}`;
    const contributingFeatures = this.getContributingFeatures(event, finalCategory);

    const alert: SecurityAlert = {
      id: alertId,
      timestamp: event.timestamp || new Date().toISOString(),
      title: `${severityRes.level} Severity ${finalCategory} Detected from ${event.source_ip}`,
      source_ip: event.source_ip,
      destination_ip: event.destination_ip,
      destination_port: event.destination_port,
      protocol: event.protocol || 'TCP',
      event_type: `${event.protocol || 'TCP'} Traffic on port ${event.destination_port}`,
      incident_type: finalCategory,
      severity: severityRes.level,
      confidence,
      ai_risk_score: enrichedEvent.ai_risk_score!,
      detection_source: detectionSource,
      status: 'New',
      assigned_analyst: 'SOC Tier-1 Analyst',
      ai_explanation: explanation,
      contributing_features: contributingFeatures,
      iocs: iocs.map((i) => i.value),
      mitre_technique_id: mitreTech.id,
      mitre_technique_name: mitreTech.name,
      mitre_tactic: mitreTech.tactic,
      raw_event_id: event.id,
      is_demo: event.is_demo,
    };

    enrichedEvent.associated_alert_id = alertId;
    enrichedEvent.associated_incident_id = incidentId;

    // 11. Correlate or Create Incident
    const timestamp = event.timestamp || new Date().toISOString();
    if (!incident) {
      const recommendations = ResponseEngine.generateRecommendations({
        incidentId,
        incidentType: finalCategory,
        severity: severityRes.level,
        sourceIp: event.source_ip,
        targetIp: event.destination_ip,
        destinationPort: event.destination_port,
        mitreTechniqueId: mitreTech.id,
        iocs: iocs.map((i) => i.value),
      });

      incident = {
        id: incidentId,
        title: `${finalCategory} Attack Against ${event.destination_ip}`,
        incident_type: finalCategory,
        severity: severityRes.level,
        status: 'New',
        detected_at: timestamp,
        updated_at: timestamp,
        source_ip: event.source_ip,
        target_ip: event.destination_ip,
        affected_hosts: [event.destination_ip],
        confidence,
        ai_risk_score: enrichedEvent.ai_risk_score!,
        detection_source: detectionSource,
        alert_count: 1,
        event_ids: [event.id],
        iocs,
        mitre_technique: {
          id: mitreTech.id,
          name: mitreTech.name,
          tactic: mitreTech.tactic,
          description: mitreTech.description,
        },
        ai_explanation: explanation,
        severity_breakdown: severityRes.breakdown,
        timeline: [
          {
            timestamp,
            action: 'Event Ingestion',
            detail: `Security event received from source ${event.source_ip} to target ${event.destination_ip}:${event.destination_port}`,
            icon: 'Radio',
          },
          {
            timestamp,
            action: 'AI Detection Engine Analysis',
            detail: `Isolation Forest flagged anomaly (Score: ${anomalyScore}); Classifier predicted ${finalCategory} with ${confidence}% confidence`,
            icon: 'Cpu',
          },
          ...(hasRuleMatch
            ? [
                {
                  timestamp,
                  action: 'Rule Engine Corroboration',
                  detail: `Deterministic Sigma rule ${matchedRuleIds.join(', ')} confirmed pattern signature`,
                  icon: 'ShieldCheck',
                },
              ]
            : []),
          {
            timestamp,
            action: 'Incident Created',
            detail: `Correlated ${severityRes.level} severity incident ${incidentId} mapped to MITRE ATT&CK ${mitreTech.id}`,
            icon: 'AlertTriangle',
          },
          {
            timestamp,
            action: 'Automated Response Generated',
            detail: `${recommendations.length} containment & mitigation actions queued for analyst review`,
            icon: 'FileCheck',
          },
        ],
        recommended_actions: recommendations,
        is_demo: event.is_demo,
      };
      existingIncidents.set(incidentCorrelationKey, incident);
    } else {
      // Update existing incident
      incident.alert_count += 1;
      incident.updated_at = timestamp;
      if (!incident.event_ids.includes(event.id)) {
        incident.event_ids.push(event.id);
      }
      if (!incident.affected_hosts.includes(event.destination_ip)) {
        incident.affected_hosts.push(event.destination_ip);
      }
      // Add timeline entry
      incident.timeline.push({
        timestamp,
        action: 'Subsequent Event Correlated',
        detail: `New telemetry matching ${finalCategory} signature added to incident case (Alert ${alertId})`,
        icon: 'Activity',
      });
      // Append any new IoCs
      for (const newIoc of iocs) {
        if (!incident.iocs.some((existing) => existing.value === newIoc.value)) {
          incident.iocs.push(newIoc);
        }
      }
    }

    return {
      enrichedEvent,
      alert,
      incident,
    };
  }

  private buildExplanation(params: {
    event: SecurityEvent;
    isAnomaly: boolean;
    anomalyScore: number;
    predictedCategory: string;
    confidence: number;
    ruleMatches: { ruleId?: string; ruleTitle?: string; reason?: string }[];
    detectionSource: DetectionSource;
  }): string {
    const { event, isAnomaly, anomalyScore, predictedCategory, confidence, ruleMatches, detectionSource } = params;
    const parts: string[] = [];

    parts.push(
      `Classification of ${predictedCategory} (${detectionSource}) established with ${confidence}% supervised confidence.`
    );

    if (isAnomaly) {
      parts.push(
        `Isolation Forest calculated an anomaly score of ${anomalyScore.toFixed(2)}, indicating statistical outlier distance from baseline normal telemetry.`
      );
    }

    if (event.failed_login_count && event.failed_login_count > 0) {
      parts.push(
        `Detected ${event.failed_login_count} consecutive failed login attempts targeting port ${event.destination_port}.`
      );
    }

    if (event.destination_port === 22 || event.destination_port === 3389) {
      parts.push(`Target port ${event.destination_port} corresponds to sensitive remote access service (SSH/RDP).`);
    } else if (event.destination_port === 4444 || event.destination_port === 6667) {
      parts.push(`Target port ${event.destination_port} is a documented C2/Metasploit exploit listener.`);
    }

    if (ruleMatches.length > 0) {
      parts.push(
        `Deterministic Sigma rule ${ruleMatches[0].ruleId} triggered: "${ruleMatches[0].reason || ruleMatches[0].ruleTitle}".`
      );
    }

    return parts.join(' ');
  }

  private getContributingFeatures(
    event: SecurityEvent,
    category: string
  ): { feature: string; importance: string; value: string | number }[] {
    const cat = category.toLowerCase();
    const durationSec = (event.flow_duration_ms || 1) / 1000;
    const pps = Math.round((event.packet_count || 0) / (durationSec + 0.001));

    if (cat.includes('brute')) {
      return [
        { feature: 'failed_login_count', importance: 'HIGH (0.32)', value: event.failed_login_count || 0 },
        { feature: 'destination_port', importance: 'HIGH (0.24)', value: event.destination_port || 22 },
        { feature: 'syn_ack_ratio', importance: 'MEDIUM (0.18)', value: (event.syn_count || 0) / ((event.ack_count || 0) + 1) },
        { feature: 'source_reputation_score', importance: 'MEDIUM (0.15)', value: PreprocessingPipeline.calculateSourceReputation(event.source_ip) },
      ];
    } else if (cat.includes('scan')) {
      return [
        { feature: 'syn_ack_ratio', importance: 'HIGH (0.35)', value: `${event.syn_count || 1} SYN / 0 ACK` },
        { feature: 'flow_duration_ms', importance: 'HIGH (0.26)', value: `${event.flow_duration_ms || 10} ms` },
        { feature: 'port_risk_score', importance: 'MEDIUM (0.20)', value: PreprocessingPipeline.calculatePortRisk(event.destination_port) },
        { feature: 'packet_count', importance: 'LOW (0.10)', value: event.packet_count || 1 },
      ];
    } else if (cat.includes('dos')) {
      return [
        { feature: 'packets_per_sec', importance: 'HIGH (0.42)', value: `${pps} pkts/sec` },
        { feature: 'syn_count', importance: 'HIGH (0.28)', value: event.syn_count || 0 },
        { feature: 'byte_count', importance: 'MEDIUM (0.18)', value: `${Math.round((event.byte_count || 0) / 1024)} KB` },
        { feature: 'destination_port', importance: 'LOW (0.08)', value: event.destination_port || 80 },
      ];
    } else {
      return [
        { feature: 'port_risk_score', importance: 'HIGH (0.30)', value: PreprocessingPipeline.calculatePortRisk(event.destination_port) },
        { feature: 'source_reputation_score', importance: 'HIGH (0.25)', value: PreprocessingPipeline.calculateSourceReputation(event.source_ip) },
        { feature: 'flow_duration_ms', importance: 'MEDIUM (0.20)', value: `${event.flow_duration_ms || 100} ms` },
        { feature: 'bytes_per_sec', importance: 'LOW (0.12)', value: `${Math.round((event.byte_count || 0) / (durationSec + 0.001))} B/s` },
      ];
    }
  }
}
