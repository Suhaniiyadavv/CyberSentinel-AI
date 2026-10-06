import { SeverityLevel } from '../types.js';

export interface SeverityCalculationInput {
  attackCategory: string;
  confidence: number;
  anomalyScore: number;
  aiRiskScore: number;
  failedLoginCount: number;
  packetRate: number;
  destinationPort: number;
  iocCount: number;
  ruleMatchesCount: number;
  isPrivilegedTarget?: boolean;
}

export interface SeverityResult {
  level: SeverityLevel;
  numericScore: number; // 0 to 100
  breakdown: {
    factor: string;
    impact: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    detail: string;
  }[];
}

export class SeverityEngine {
  public static calculate(input: SeverityCalculationInput): SeverityResult {
    let score = 20; // baseline
    const breakdown: SeverityResult['breakdown'] = [];

    // 1. Attack Category Base Weight
    const cat = (input.attackCategory || '').toLowerCase();
    if (cat.includes('infiltrat') || cat.includes('malware')) {
      score += 40;
      breakdown.push({
        factor: 'High-Impact Threat Category',
        impact: 'CRITICAL',
        detail: `Incident classified under post-compromise execution/infiltration vector (${input.attackCategory})`,
      });
    } else if (cat.includes('brute') || cat.includes('dos') || cat.includes('web')) {
      score += 30;
      breakdown.push({
        factor: 'Exploitation / Resource Attack',
        impact: 'HIGH',
        detail: `Active unauthorized access or availability disruption campaign (${input.attackCategory})`,
      });
    } else if (cat.includes('scan') || cat.includes('botnet')) {
      score += 20;
      breakdown.push({
        factor: 'Reconnaissance / Staging Indicator',
        impact: 'MEDIUM',
        detail: `Pre-attack discovery or command-channel staging activity detected`,
      });
    } else {
      breakdown.push({
        factor: 'Anomalous Baseline Deviation',
        impact: 'LOW',
        detail: `Statistical telemetry anomaly with unspecified signature`,
      });
    }

    // 2. Classifier Confidence & Anomaly Score
    if (input.confidence >= 90) {
      score += 15;
      breakdown.push({
        factor: 'High ML Decision Confidence',
        impact: 'HIGH',
        detail: `Supervised classification model confidence exceeds 90% (${input.confidence}%)`,
      });
    } else if (input.confidence >= 75) {
      score += 10;
      breakdown.push({
        factor: 'Elevated ML Decision Confidence',
        impact: 'MEDIUM',
        detail: `Supervised classification confidence stands at ${input.confidence}%`,
      });
    }

    if (input.anomalyScore >= 0.7) {
      score += 15;
      breakdown.push({
        factor: 'Severe Statistical Isolation Anomaly',
        impact: 'HIGH',
        detail: `Isolation Forest anomaly score is ${input.anomalyScore.toFixed(2)} (well above normal threshold)`,
      });
    }

    // 3. Credential Attacks / Repetitive Volume
    if (input.failedLoginCount >= 5) {
      score += 15;
      breakdown.push({
        factor: 'Repeated Authentication Failures',
        impact: 'CRITICAL',
        detail: `Observed ${input.failedLoginCount} repeated failed attempts against credentials`,
      });
    }

    // 4. Volumetric Packet Floods
    if (input.packetRate > 1500) {
      score += 15;
      breakdown.push({
        factor: 'Volumetric Bandwidth Flooding',
        impact: 'HIGH',
        detail: `Packet delivery velocity ${Math.round(input.packetRate)} pkts/sec saturating link`,
      });
    }

    // 5. IoCs and Rule Corroboration
    if (input.iocCount >= 2) {
      score += 10;
      breakdown.push({
        factor: 'Multiple Verified IoCs',
        impact: 'MEDIUM',
        detail: `${input.iocCount} distinct indicators of compromise extracted from session payload`,
      });
    }

    if (input.ruleMatchesCount >= 1) {
      score += 10;
      breakdown.push({
        factor: 'Deterministic Rule Corroboration',
        impact: 'HIGH',
        detail: `Event corroborated by ${input.ruleMatchesCount} static Sigma security rules`,
      });
    }

    const clampedScore = Math.min(100, Math.max(10, score));
    let level: SeverityLevel = 'LOW';
    if (clampedScore >= 80) level = 'CRITICAL';
    else if (clampedScore >= 60) level = 'HIGH';
    else if (clampedScore >= 40) level = 'MEDIUM';

    return {
      level,
      numericScore: clampedScore,
      breakdown,
    };
  }
}
