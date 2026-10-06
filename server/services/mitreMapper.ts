import { MitreTechnique, SeverityLevel } from '../types.js';

export class MitreMapper {
  private static readonly TECHNIQUES_DB: Record<string, MitreTechnique> = {
    T1110: {
      id: 'T1110',
      name: 'Brute Force',
      tactic: 'Credential Access',
      description:
        'Adversaries may use brute force techniques to attempt credential access by systematically trying passwords, passphrases, or guessing credentials to gain valid account access.',
      detection:
        'Monitor authentication logs for repeated failed logins (Event ID 4625 on Windows or pam/sshd failure logs on Linux) exceeding statistical thresholds.',
      mitigation:
        'Implement account lockout policies, multi-factor authentication (MFA), and source rate limiting at perimeter firewalls.',
      severity: 'HIGH',
      incident_count: 0,
    },
    T1046: {
      id: 'T1046',
      name: 'Network Service Discovery',
      tactic: 'Discovery',
      description:
        'Adversaries may attempt to get a listing of services running on remote hosts, including port scans (SYN/FIN/Xmas scans) to identify open network listeners and vulnerable daemon versions.',
      detection:
        'Detect unusual volumes of TCP SYN packets with no subsequent ACK/completion, or a single source targeting numerous distinct ports within a brief time window.',
      mitigation:
        'Configure network firewalls and access control lists (ACLs) to drop unsolicited inbound probes; employ stealth port configurations and intrusion prevention (IPS).',
      severity: 'MEDIUM',
      incident_count: 0,
    },
    T1498: {
      id: 'T1498',
      name: 'Network Denial of Service',
      tactic: 'Impact',
      description:
        'Adversaries may perform Network Denial of Service (DoS) attacks to degrade or block the availability of targeted services to legitimate users through volumetric packet floods.',
      detection:
        'Monitor for abnormal spikes in packet rates (PPS), SYN-flood signatures, flow duration anomalies, and saturation of inbound gateway bandwidth.',
      mitigation:
        'Deploy upstream DDoS scrubbing providers, configure SYN cookies, and enforce per-IP rate-limiting on border routers.',
      severity: 'HIGH',
      incident_count: 0,
    },
    T1190: {
      id: 'T1190',
      name: 'Exploit Public-Facing Application',
      tactic: 'Initial Access',
      description:
        'Adversaries may attempt to exploit vulnerabilities in Internet-facing applications such as SQL Injection (SQLi), Cross-Site Scripting (XSS), or Path Traversal to gain initial execution.',
      detection:
        'Inspect HTTP request query parameters and POST bodies for SQL syntax, script tags, directory traversal tokens (../), and atypical user-agent headers.',
      mitigation:
        'Deploy Web Application Firewalls (WAF) with signature & behavioral inspection, use parameterized queries, and enforce input sanitization.',
      severity: 'CRITICAL',
      incident_count: 0,
    },
    T1071: {
      id: 'T1071',
      name: 'Application Layer Protocol (C2)',
      tactic: 'Command and Control',
      description:
        'Adversaries may communicate using application layer protocols (e.g., HTTP, IRC, Tor, DNS tunneling) to avoid detection and blend with normal network traffic.',
      detection:
        'Identify periodic beaconing intervals, connections to known dynamic DNS or non-standard ports (e.g., 6667, 9001), and unusual payload sizes.',
      mitigation:
        'Implement outbound egress filtering, inspect TLS traffic using deep packet inspection (DPI), and sinkhole known malicious C2 domains.',
      severity: 'CRITICAL',
      incident_count: 0,
    },
    T1059: {
      id: 'T1059',
      name: 'Command and Scripting Interpreter',
      tactic: 'Execution',
      description:
        'Adversaries may abuse command and script interpreters (e.g., /bin/sh, Bash, PowerShell) to execute arbitrary commands, reverse shells, and persistence scripts.',
      detection:
        'Monitor outbound sessions on non-standard ports (such as Metasploit port 4444) exhibiting shell interactive banners or command syntax.',
      mitigation:
        'Restrict interactive shell execution for web service accounts and isolate endpoints with least-privilege network segmentation.',
      severity: 'CRITICAL',
      incident_count: 0,
    },
    T1041: {
      id: 'T1041',
      name: 'Exfiltration Over C2 Channel',
      tactic: 'Exfiltration',
      description:
        'Adversaries may steal data by exfiltrating it over an existing command and control channel or high-bandwidth outbound socket.',
      detection:
        'Identify massive asymmetrical outbound byte transfers from internal endpoints toward external unclassified IP addresses.',
      mitigation:
        'Enforce strict outbound data loss prevention (DLP) controls and restrict high-volume egress bandwidth to authorized cloud backup destinations only.',
      severity: 'CRITICAL',
      incident_count: 0,
    },
    T1204: {
      id: 'T1204',
      name: 'User Execution: Malicious File',
      tactic: 'Execution',
      description:
        'An adversary may rely on a user executing a malicious executable, script, or dropper downloaded from an untrusted source.',
      detection:
        'Track payload downloads containing known malware hashes, suspicious executable headers, or unusual script extensions.',
      mitigation:
        'Implement Endpoint Detection and Response (EDR), application allowlisting, and automated sandbox attachment inspection.',
      severity: 'HIGH',
      incident_count: 0,
    },
    T1078: {
      id: 'T1078',
      name: 'Valid Accounts / Anomalous Behavior',
      tactic: 'Defense Evasion',
      description:
        'Adversaries may obtain and abuse credentials of existing accounts, producing subtle statistical anomalies not caught by static signature rules.',
      detection:
        'Unsupervised machine learning (Isolation Forest) flags unusual login times, abnormal connection frequencies, or rare destination ports.',
      mitigation:
        'Enforce continuous behavioral anomaly monitoring, zero-trust conditional access, and step-up MFA verification.',
      severity: 'MEDIUM',
      incident_count: 0,
    },
  };

  /**
   * Map attack category and behavioral evidence to MITRE ATT&CK technique
   */
  public static mapCategory(category: string, payload?: string): MitreTechnique {
    const cat = (category || '').toLowerCase();
    const pay = (payload || '').toLowerCase();

    if (cat.includes('brute') || pay.includes('ssh') || pay.includes('auth attempt')) {
      return MitreMapper.TECHNIQUES_DB['T1110'];
    }
    if (cat.includes('scan') || cat.includes('probe') || pay.includes('syn stealth')) {
      return MitreMapper.TECHNIQUES_DB['T1046'];
    }
    if (cat.includes('dos') || cat.includes('ddos') || cat.includes('flood')) {
      return MitreMapper.TECHNIQUES_DB['T1498'];
    }
    if (cat.includes('web') || pay.includes('union select') || pay.includes('<script>') || pay.includes('../')) {
      return MitreMapper.TECHNIQUES_DB['T1190'];
    }
    if (cat.includes('botnet') || pay.includes('c2') || pay.includes('irc') || pay.includes('tor')) {
      return MitreMapper.TECHNIQUES_DB['T1071'];
    }
    if (cat.includes('malware') || pay.includes('dropper') || pay.includes('malicious_agent')) {
      return MitreMapper.TECHNIQUES_DB['T1204'];
    }
    if (cat.includes('infiltrat') || pay.includes('reverse tcp') || pay.includes('metasploit')) {
      return MitreMapper.TECHNIQUES_DB['T1059'];
    }
    if (pay.includes('exfiltration') || pay.includes('/etc/shadow')) {
      return MitreMapper.TECHNIQUES_DB['T1041'];
    }

    // Default to behavioral / valid account anomaly
    return MitreMapper.TECHNIQUES_DB['T1078'];
  }

  public static getAllTechniques(): MitreTechnique[] {
    return Object.values(MitreMapper.TECHNIQUES_DB);
  }

  public static getTechniqueById(id: string): MitreTechnique | undefined {
    return MitreMapper.TECHNIQUES_DB[id];
  }
}
