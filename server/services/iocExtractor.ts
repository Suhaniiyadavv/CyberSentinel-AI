import { IoCRecord, SecurityEvent, SeverityLevel } from '../types.js';

export class IoCExtractor {
  private static readonly IP_REGEX = /\b(?:\d{1,3}\.){3}\d{1,3}\b/g;
  private static readonly DOMAIN_REGEX = /\b(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+(?:ru|cn|su|xyz|top|biz|cc|com|org|net|internal)\b/gi;
  private static readonly URL_REGEX = /https?:\/\/[^\s"'<>]+/gi;
  private static readonly MD5_REGEX = /\b[a-fA-F0-9]{32}\b/g;
  private static readonly SHA256_REGEX = /\b[a-fA-F0-9]{64}\b/g;
  private static readonly EMAIL_REGEX = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b/g;

  /**
   * Extract all IoCs present in an event and its payload
   */
  public static extractFromEvent(event: SecurityEvent, incidentId?: string): IoCRecord[] {
    const results: Map<string, IoCRecord> = new Map();
    const timestamp = event.timestamp || new Date().toISOString();
    const payload = (event.payload_sample || '') + ' ' + (event.user_agent || '') + ' ' + (event.http_method || '');

    // 1. Check Source IP (if non-internal or malicious context)
    if (event.source_ip) {
      const isInternal = event.source_ip.startsWith('10.') || event.source_ip.startsWith('192.168.1.');
      const isMaliciousEvent = event.ground_truth_label === 'Malicious' || (event.ai_risk_score || 0) > 60;
      
      if (!isInternal || isMaliciousEvent) {
        const key = `ip:${event.source_ip}`;
        const risk = isInternal ? 65 : 92;
        results.set(key, {
          id: `ioc-ip-${event.source_ip.replace(/\./g, '-')}`,
          value: event.source_ip,
          type: 'IPv4',
          risk_score: risk,
          severity: risk >= 85 ? 'HIGH' : 'MEDIUM',
          first_seen: timestamp,
          last_seen: timestamp,
          incident_id: incidentId,
          incident_type: event.predicted_category || event.ground_truth_category || 'Suspicious Traffic',
          event_count: 1,
          threat_context: isInternal
            ? `Internal compromised staging host generating ${event.predicted_category || 'anomalous'} activity`
            : `Adversary source IP initiating unauthorized connections`,
        });
      }
    }

    // 2. Check MD5 & SHA256 hashes in payload
    const sha256Matches = payload.match(IoCExtractor.SHA256_REGEX) || [];
    for (const hash of sha256Matches) {
      const key = `sha256:${hash.toLowerCase()}`;
      results.set(key, {
        id: `ioc-sha256-${hash.substring(0, 8)}`,
        value: hash.toLowerCase(),
        type: 'SHA256',
        risk_score: 95,
        severity: 'CRITICAL',
        first_seen: timestamp,
        last_seen: timestamp,
        incident_id: incidentId,
        incident_type: event.predicted_category || 'Malware',
        event_count: 1,
        threat_context: `Cryptographic SHA256 malware artifact payload signature identified in stream`,
      });
    }

    const md5Matches = payload.match(IoCExtractor.MD5_REGEX) || [];
    for (const hash of md5Matches) {
      if (sha256Matches.some((s) => s.includes(hash))) continue; // avoid substring collision
      const key = `md5:${hash.toLowerCase()}`;
      results.set(key, {
        id: `ioc-md5-${hash.substring(0, 8)}`,
        value: hash.toLowerCase(),
        type: 'MD5',
        risk_score: 90,
        severity: 'HIGH',
        first_seen: timestamp,
        last_seen: timestamp,
        incident_id: incidentId,
        incident_type: event.predicted_category || 'Malware',
        event_count: 1,
        threat_context: `MD5 binary payload hash indicator extracted from packet telemetry`,
      });
    }

    // 3. URLs & Domains
    const urlMatches = payload.match(IoCExtractor.URL_REGEX) || [];
    for (const url of urlMatches) {
      const key = `url:${url}`;
      results.set(key, {
        id: `ioc-url-${Math.abs(hashString(url))}`,
        value: url,
        type: 'URL',
        risk_score: 88,
        severity: 'HIGH',
        first_seen: timestamp,
        last_seen: timestamp,
        incident_id: incidentId,
        incident_type: event.predicted_category || 'Web Attack',
        event_count: 1,
        threat_context: `Malicious command/exfiltration endpoint reference in payload`,
      });
    }

    const domainMatches = payload.match(IoCExtractor.DOMAIN_REGEX) || [];
    for (const domain of domainMatches) {
      const lower = domain.toLowerCase();
      if (lower.endsWith('.internal') || lower.endsWith('.company.com')) continue;
      const key = `domain:${lower}`;
      results.set(key, {
        id: `ioc-dom-${Math.abs(hashString(lower))}`,
        value: lower,
        type: 'Domain',
        risk_score: 85,
        severity: 'HIGH',
        first_seen: timestamp,
        last_seen: timestamp,
        incident_id: incidentId,
        incident_type: event.predicted_category || 'Botnet C2',
        event_count: 1,
        threat_context: `Suspicious C2 or dropper hosting domain observed in traffic`,
      });
    }

    // 4. Suspicious non-standard ports
    const suspiciousPorts = [4444, 6667, 8888, 9001, 31337];
    if (suspiciousPorts.includes(event.destination_port)) {
      const key = `port:${event.destination_port}`;
      results.set(key, {
        id: `ioc-port-${event.destination_port}`,
        value: `TCP/${event.destination_port}`,
        type: 'Port',
        risk_score: 82,
        severity: 'HIGH',
        first_seen: timestamp,
        last_seen: timestamp,
        incident_id: incidentId,
        incident_type: event.predicted_category || 'Infiltration',
        event_count: 1,
        threat_context: `Well-known exploit/C2 communication listening port (Metasploit/IRC)`,
      });
    }

    return Array.from(results.values());
  }
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return hash;
}
