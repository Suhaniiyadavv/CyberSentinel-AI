import { ResponseRecommendation, SeverityLevel } from '../types.js';

export interface ResponseEngineInput {
  incidentId: string;
  incidentType: string;
  severity: SeverityLevel;
  sourceIp: string;
  targetIp: string;
  destinationPort: number;
  mitreTechniqueId: string;
  iocs: string[];
}

export class ResponseEngine {
  public static generateRecommendations(input: ResponseEngineInput): ResponseRecommendation[] {
    const recommendations: ResponseRecommendation[] = [];
    const now = new Date().toISOString();
    const cat = (input.incidentType || '').toLowerCase();

    // 1. Primary containment action based on attack category
    if (cat.includes('brute')) {
      recommendations.push({
        id: `rec-${Date.now()}-1`,
        incident_id: input.incidentId,
        action: `Temporarily block source IP ${input.sourceIp} at perimeter firewall`,
        reason: `Source IP has initiated excessive consecutive failed authentication attempts against target ${input.targetIp}:${input.destinationPort}.`,
        priority: 'HIGH',
        mitre_technique_id: 'T1110',
        status: 'Pending',
        automated_script_preview: `# Perimeter Firewall Rule
iptables -I INPUT -s ${input.sourceIp} -j DROP
ufw insert 1 deny from ${input.sourceIp} to any port ${input.destinationPort}`,
        created_at: now,
        updated_at: now,
      });

      recommendations.push({
        id: `rec-${Date.now()}-2`,
        incident_id: input.incidentId,
        action: `Lock targeted account & trigger mandatory password reset`,
        reason: `Potential credential compromise or offline dictionary attack underway against host ${input.targetIp}.`,
        priority: 'HIGH',
        mitre_technique_id: 'T1110',
        status: 'Pending',
        automated_script_preview: `# Linux PAM Lockout / Active Directory disable
passwd -l targeted_user
echo "Account locked by CyberSentinel automated response policy" >> /var/log/auth.audit`,
        created_at: now,
        updated_at: now,
      });

      recommendations.push({
        id: `rec-${Date.now()}-3`,
        incident_id: input.incidentId,
        action: `Enforce step-up Multi-Factor Authentication (MFA) policy`,
        reason: `Strengthen authentication perimeter against credential stuffing and brute force attempts.`,
        priority: 'MEDIUM',
        mitre_technique_id: 'T1110',
        status: 'Pending',
        automated_script_preview: `# Conditional Access Enforcement
curl -X POST https://iam.company.internal/api/v1/policies/enforce-mfa \\
  -H "Authorization: Bearer $IAM_ADMIN_KEY" \\
  -d '{"target_host": "${input.targetIp}", "scope": "ssh_rdp"}'`,
        created_at: now,
        updated_at: now,
      });
    } else if (cat.includes('scan')) {
      recommendations.push({
        id: `rec-${Date.now()}-1`,
        incident_id: input.incidentId,
        action: `Drop exploratory packets from reconnaissance source IP ${input.sourceIp}`,
        reason: `Host is conducting systematic port and service discovery sweeps across internal subnets.`,
        priority: 'MEDIUM',
        mitre_technique_id: 'T1046',
        status: 'Pending',
        automated_script_preview: `# Rate-limit & Block scanner
ipset add scanners ${input.sourceIp}
iptables -A INPUT -m set --match-set scanners src -j DROP`,
        created_at: now,
        updated_at: now,
      });

      recommendations.push({
        id: `rec-${Date.now()}-2`,
        incident_id: input.incidentId,
        action: `Audit and close unnecessary listening service daemons on ${input.targetIp}`,
        reason: `Reduce attack surface by verifying exposed service ports (e.g. port ${input.destinationPort}).`,
        priority: 'LOW',
        mitre_technique_id: 'T1046',
        status: 'Pending',
        automated_script_preview: `# Verify local listeners
ss -tulpn | grep :${input.destinationPort}
systemctl stop unused_service.service`,
        created_at: now,
        updated_at: now,
      });
    } else if (cat.includes('dos') || cat.includes('ddos')) {
      recommendations.push({
        id: `rec-${Date.now()}-1`,
        incident_id: input.incidentId,
        action: `Enable TCP SYN Cookie protection and rate-limit source ${input.sourceIp}`,
        reason: `Volumetric exhaustion stream detected targeting gateway ${input.targetIp}.`,
        priority: 'CRITICAL',
        mitre_technique_id: 'T1498',
        status: 'Pending',
        automated_script_preview: `# Enable SYN cookies & rate limit
sysctl -w net.ipv4.tcp_syncookies=1
iptables -A INPUT -p tcp --syn -m limit --limit 50/s --limit-burst 100 -j ACCEPT
iptables -A INPUT -s ${input.sourceIp} -j DROP`,
        created_at: now,
        updated_at: now,
      });

      recommendations.push({
        id: `rec-${Date.now()}-2`,
        incident_id: input.incidentId,
        action: `Notify upstream ISP / Cloud Provider for edge traffic scrubbing`,
        reason: `Prevent saturating internal WAN uplink with high PPS volumetric load.`,
        priority: 'HIGH',
        mitre_technique_id: 'T1498',
        status: 'Pending',
        automated_script_preview: `# Trigger upstream Cloudflare / AWS Shield mitigation route
curl -X POST https://api.scrubbing-service.com/v1/routes/divert \\
  -d '{"victim_ip": "${input.targetIp}", "duration_minutes": 60}'`,
        created_at: now,
        updated_at: now,
      });
    } else if (cat.includes('web')) {
      recommendations.push({
        id: `rec-${Date.now()}-1`,
        incident_id: input.incidentId,
        action: `Deploy Web Application Firewall (WAF) blocking rule for source IP`,
        reason: `Web application exploit signature (SQLi/XSS/Traversal) detected in HTTP payload.`,
        priority: 'CRITICAL',
        mitre_technique_id: 'T1190',
        status: 'Pending',
        automated_script_preview: `# ModSecurity / Cloudflare WAF Rule
SecRule REMOTE_ADDR "@ipMatch ${input.sourceIp}" "id:10009,phase:1,deny,status:403,msg:'Blocked by CyberSentinel WAF Engine'"`,
        created_at: now,
        updated_at: now,
      });

      recommendations.push({
        id: `rec-${Date.now()}-2`,
        incident_id: input.incidentId,
        action: `Invalidate active user sessions and rotate backend database credentials`,
        reason: `Mitigate risk of SQL injection data exfiltration or session hijacking.`,
        priority: 'HIGH',
        mitre_technique_id: 'T1190',
        status: 'Pending',
        automated_script_preview: `# Redis session purge
redis-cli --eval /scripts/purge_suspicious_sessions.lua ${input.sourceIp}`,
        created_at: now,
        updated_at: now,
      });
    } else if (cat.includes('botnet') || cat.includes('malware') || cat.includes('infiltrat')) {
      recommendations.push({
        id: `rec-${Date.now()}-1`,
        incident_id: input.incidentId,
        action: `Quarantine affected endpoint ${input.targetIp} from corporate VLAN`,
        reason: `Active Command & Control beaconing or interactive reverse shell confirmed.`,
        priority: 'CRITICAL',
        mitre_technique_id: 'T1071',
        status: 'Pending',
        automated_script_preview: `# Network Isolation
curl -X POST https://edr.corp/api/v2/endpoints/${input.targetIp}/isolate \\
  -H "Authorization: Bearer $EDR_API_TOKEN" \\
  -d '{"action": "network_isolation", "preserve_forensics": true}'`,
        created_at: now,
        updated_at: now,
      });

      recommendations.push({
        id: `rec-${Date.now()}-2`,
        incident_id: input.incidentId,
        action: `Acquire volatile memory image and process tree for forensic triage`,
        reason: `Capture in-memory payloads and injected DLL/shellcode prior to reboot.`,
        priority: 'HIGH',
        mitre_technique_id: 'T1059',
        status: 'Pending',
        automated_script_preview: `# Volatile memory acquisition
ssh admin@${input.targetIp} "winpmem.exe -o memdump_${Date.now()}.raw"`,
        created_at: now,
        updated_at: now,
      });

      if (input.iocs.length > 0) {
        recommendations.push({
          id: `rec-${Date.now()}-3`,
          incident_id: input.incidentId,
          action: `Broadcast ${input.iocs.length} extracted IoCs to enterprise SIEM/EDR blocklists`,
          reason: `Immunize all remaining corporate endpoints against known malicious hashes and C2 IPs.`,
          priority: 'HIGH',
          mitre_technique_id: 'T1041',
          status: 'Pending',
          automated_script_preview: `# Push IoCs to MISP / OpenCTI
python3 /opt/cybersentinel/scripts/sync_ioc_feed.py --iocs "${input.iocs.join(',')}"`,
          created_at: now,
          updated_at: now,
        });
      }
    } else {
      // Default / Behavioral anomaly
      recommendations.push({
        id: `rec-${Date.now()}-1`,
        incident_id: input.incidentId,
        action: `Initiate endpoint security telemetry inspection on ${input.targetIp}`,
        reason: `Unsupervised Isolation Forest detected statistical behavioral anomaly without prior signature.`,
        priority: 'MEDIUM',
        mitre_technique_id: 'T1078',
        status: 'Pending',
        automated_script_preview: `# Query endpoint audit logs
auditctl -w /etc/passwd -p wa -k identity_anomaly
tail -n 100 /var/log/syslog | grep ${input.sourceIp}`,
        created_at: now,
        updated_at: now,
      });
    }

    return recommendations;
  }
}
