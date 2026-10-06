import { SecurityEvent, SigmaRule } from '../types.js';

export interface RuleMatchResult {
  matched: boolean;
  ruleId?: string;
  ruleTitle?: string;
  category?: string;
  reason?: string;
}

export class RuleEngine {
  private rules: SigmaRule[] = [
    {
      id: 'SIGMA-001',
      title: 'Excessive Failed Authentication Attempts (Brute Force)',
      description: 'Detects a high volume of failed authentication events originating from a single source host within a brief observation interval.',
      severity: 'HIGH',
      category: 'Brute Force',
      enabled: true,
      author: 'CyberSentinel Detection Team',
      mitre_attack_id: 'T1110',
      condition: 'failed_login_count >= 5 OR (failed_login_count >= 3 AND destination_port IN [22, 3389])',
      matches_count: 0,
      sigma_yaml: `title: Excessive Failed Authentication Attempts
id: 5a8a12d3-1384-4861-9c60-8f921869e8b1
status: production
description: Identifies potential credential brute force attacks against SSH and RDP daemons
logsource:
  category: authentication
detection:
  selection:
    destination_port: [22, 3389]
    failed_login_count: '>= 3'
  condition: selection
level: high`,
    },
    {
      id: 'SIGMA-002',
      title: 'Network Port Scanning & Reconnaissance Activity',
      description: 'Detects stealth SYN-only scanning probes targeting common discovery ports without completed handshakes.',
      severity: 'MEDIUM',
      category: 'Port Scan',
      enabled: true,
      author: 'CyberSentinel Detection Team',
      mitre_attack_id: 'T1046',
      condition: 'syn_count > 0 AND ack_count == 0 AND flow_duration_ms < 100',
      matches_count: 0,
      sigma_yaml: `title: Network Service Discovery Scanning Probe
id: 9c7198bb-3e4b-4b19-b50a-f10d481878d2
status: production
description: Identifies rapid TCP SYN probes characteristic of nmap or zgrab discovery
logsource:
  category: network_flow
detection:
  selection:
    syn_count: '> 0'
    ack_count: 0
    flow_duration_ms: '< 100'
  condition: selection
level: medium`,
    },
    {
      id: 'SIGMA-003',
      title: 'Suspicious Non-Standard Exploitation Port Connection',
      description: 'Flags network traffic utilizing notorious command-and-control, IRC, or exploit framework listener ports.',
      severity: 'CRITICAL',
      category: 'Infiltration',
      enabled: true,
      author: 'CyberSentinel Detection Team',
      mitre_attack_id: 'T1059',
      condition: 'destination_port IN [4444, 6667, 8888, 9001, 31337]',
      matches_count: 0,
      sigma_yaml: `title: Metasploit and IRC Known Exploitation Port Connection
id: b71d4a8e-287e-40cc-9d41-456cb049e771
status: production
description: Outbound or inbound socket on notorious exploit ports
logsource:
  category: firewall
detection:
  selection:
    destination_port: [4444, 6667, 8888, 9001, 31337]
  condition: selection
level: critical`,
    },
    {
      id: 'SIGMA-004',
      title: 'Volumetric Network Traffic Exhaustion Spike (DoS/DDoS)',
      description: 'Identifies massive packet throughput spikes exceeding 1500 packets per second with asymmetric SYN counts.',
      severity: 'HIGH',
      category: 'DoS/DDoS',
      enabled: true,
      author: 'CyberSentinel Detection Team',
      mitre_attack_id: 'T1498',
      condition: 'packets_per_second > 1500 OR syn_count > 1000',
      matches_count: 0,
      sigma_yaml: `title: Volumetric Packet Saturation (DoS)
id: f42cb091-6677-49f2-8923-018274092bc3
status: production
description: Extreme packet velocity and connection flooding
logsource:
  category: flow_metrics
detection:
  selection:
    packets_per_sec: '> 1500'
  condition: selection
level: high`,
    },
    {
      id: 'SIGMA-005',
      title: 'Known Threat Intelligence Indicator of Compromise',
      description: 'Matches source IP or hashes against configured threat intelligence indicator feeds.',
      severity: 'HIGH',
      category: 'Botnet',
      enabled: true,
      author: 'CyberSentinel Threat Intel',
      mitre_attack_id: 'T1071',
      condition: 'source_ip IN blocklist OR payload MATCHES known_malware_hashes',
      matches_count: 0,
      sigma_yaml: `title: Threat Intelligence Blocklist Match
id: a8912e55-91ab-4022-811c-d781b01c37b4
status: production
description: Connection involving known hostile IP or malware hash
logsource:
  category: threat_intel
detection:
  selection:
    reputation: malicious
  condition: selection
level: high`,
    },
    {
      id: 'SIGMA-006',
      title: 'Web Application Attack Signature (SQLi / XSS)',
      description: 'Detects typical SQL injection queries, XSS script tags, or directory traversal tokens in request parameters.',
      severity: 'HIGH',
      category: 'Web Attack',
      enabled: true,
      author: 'CyberSentinel AppSec',
      mitre_attack_id: 'T1190',
      condition: 'payload_sample CONTAINS ["UNION SELECT", "OR 1=1", "<script>", "../"]',
      matches_count: 0,
      sigma_yaml: `title: Web Application Injection Signature
id: c4e18349-2180-4927-b50a-aa8409192eb9
status: production
description: Common web application exploitation patterns in HTTP stream
logsource:
  category: web_proxy
detection:
  keywords:
    - 'UNION SELECT'
    - 'OR 1=1'
    - '<script>'
    - '../'
  condition: keywords
level: high`,
    },
  ];

  private blocklistedIps = new Set([
    '185.190.140.22',
    '45.33.32.156',
    '194.26.29.112',
    '185.220.101.5',
    '91.240.118.170',
    '103.224.182.245',
    '212.192.241.10',
    '203.0.113.77',
  ]);

  public evaluate(event: SecurityEvent): RuleMatchResult[] {
    const results: RuleMatchResult[] = [];
    const payload = (event.payload_sample || '').toLowerCase();
    const durationSec = (event.flow_duration_ms || 1) / 1000;
    const packetsPerSec = (event.packet_count || 0) / (durationSec + 0.001);

    for (const rule of this.rules) {
      if (!rule.enabled) continue;
      let matched = false;
      let reason = '';

      switch (rule.id) {
        case 'SIGMA-001': {
          const failedLogins = event.failed_login_count || 0;
          const port = event.destination_port;
          if (failedLogins >= 5 || (failedLogins >= 3 && (port === 22 || port === 3389))) {
            matched = true;
            reason = `Observed ${failedLogins} consecutive failed authentication attempts on sensitive service port ${port}`;
          }
          break;
        }

        case 'SIGMA-002': {
          const syn = event.syn_count || 0;
          const ack = event.ack_count || 0;
          const dur = event.flow_duration_ms || 0;
          if (syn > 0 && ack === 0 && dur < 100) {
            matched = true;
            reason = `Short-duration (${dur}ms) unacknowledged TCP SYN probe observed targeting port ${event.destination_port}`;
          }
          break;
        }

        case 'SIGMA-003': {
          const badPorts = [4444, 6667, 8888, 9001, 31337];
          if (badPorts.includes(event.destination_port)) {
            matched = true;
            reason = `Communication detected on known exploit/C2 listener destination port ${event.destination_port}`;
          }
          break;
        }

        case 'SIGMA-004': {
          const syn = event.syn_count || 0;
          if (packetsPerSec > 1500 || syn > 1000) {
            matched = true;
            reason = `Volumetric packet flood rate of ${Math.round(packetsPerSec)} pkts/sec (SYN count: ${syn})`;
          }
          break;
        }

        case 'SIGMA-005': {
          if (this.blocklistedIps.has(event.source_ip)) {
            matched = true;
            reason = `Source IP ${event.source_ip} matches active threat intelligence feed blocklist`;
          }
          break;
        }

        case 'SIGMA-006': {
          const webKeywords = ['union select', 'or 1=1', '<script>', '../../', 'passwd'];
          if (webKeywords.some((kw) => payload.includes(kw))) {
            matched = true;
            reason = `Detected web exploitation payload signature matching SQLi/XSS/Traversal patterns`;
          }
          break;
        }
      }

      if (matched) {
        rule.matches_count += 1;
        results.push({
          matched: true,
          ruleId: rule.id,
          ruleTitle: rule.title,
          category: rule.category,
          reason,
        });
      }
    }

    return results;
  }

  public getRules(): SigmaRule[] {
    return this.rules;
  }

  public toggleRule(id: string, enabled: boolean): SigmaRule | null {
    const rule = this.rules.find((r) => r.id === id);
    if (rule) {
      rule.enabled = enabled;
      return rule;
    }
    return null;
  }
}
