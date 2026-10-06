import { SecurityEvent } from '../types.js';

export interface PreprocessingPipelineConfig {
  means: number[];
  stds: number[];
  featureNames: string[];
}

export class PreprocessingPipeline {
  private config: PreprocessingPipelineConfig | null = null;

  public static readonly FEATURE_NAMES = [
    'packet_count',
    'byte_count',
    'flow_duration_ms',
    'packets_per_sec',
    'bytes_per_sec',
    'syn_count',
    'ack_count',
    'syn_ack_ratio',
    'failed_login_count',
    'failed_login_ratio',
    'destination_port',
    'port_risk_score',
    'connection_frequency',
    'source_reputation_score',
    'is_tcp',
    'is_udp',
  ];

  /**
   * Computes a port risk score from 0.0 to 1.0 based on common attack targets
   */
  public static calculatePortRisk(port: number): number {
    const criticalPorts = [21, 22, 23, 3389, 4444, 6667, 31337]; // FTP, SSH, Telnet, RDP, Metasploit, IRC
    const elevatedPorts = [80, 443, 1433, 1521, 3306, 5432, 6379, 8080, 8443, 9001, 9200];
    if (criticalPorts.includes(port)) return 0.95;
    if (elevatedPorts.includes(port)) return 0.6;
    if (port < 1024) return 0.4;
    return 0.1;
  }

  /**
   * Calculates source reputation penalty (0 = internal/trusted, 1 = external suspicious)
   */
  public static calculateSourceReputation(ip: string): number {
    if (!ip) return 0.5;
    if (ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('172.16.')) {
      return 0.15; // RFC 1918 private IP
    }
    // High-risk external threat indicators
    if (
      ip.startsWith('185.190.') ||
      ip.startsWith('45.33.') ||
      ip.startsWith('194.26.') ||
      ip.startsWith('185.220.') ||
      ip.startsWith('91.240.')
    ) {
      return 0.95;
    }
    return 0.7; // General external internet IP
  }

  /**
   * Extract numeric feature vector from a raw event
   */
  public extractFeatures(event: Partial<SecurityEvent>, connectionFreqMap?: Map<string, number>): number[] {
    const packetCount = Math.max(0, Number(event.packet_count) || 0);
    const byteCount = Math.max(0, Number(event.byte_count) || 0);
    const flowDuration = Math.max(1, Number(event.flow_duration_ms) || 1);
    const durationSec = flowDuration / 1000;

    const packetsPerSec = packetCount / (durationSec + 0.001);
    const bytesPerSec = byteCount / (durationSec + 0.001);

    const synCount = Math.max(0, Number(event.syn_count) || 0);
    const ackCount = Math.max(0, Number(event.ack_count) || 0);
    const synAckRatio = synCount / (ackCount + 1);

    const failedLogins = Math.max(0, Number(event.failed_login_count) || 0);
    const successLogins = Math.max(0, Number(event.success_login_count) || 0);
    const failedLoginRatio = failedLogins / (failedLogins + successLogins + 0.001);

    const destPort = Math.max(0, Number(event.destination_port) || 0);
    const portRisk = PreprocessingPipeline.calculatePortRisk(destPort);

    const connFreq = connectionFreqMap && event.source_ip ? (connectionFreqMap.get(event.source_ip) || 1) : 1;
    const repScore = PreprocessingPipeline.calculateSourceReputation(event.source_ip || '');

    const protocol = (event.protocol || 'TCP').toUpperCase();
    const isTcp = protocol === 'TCP' ? 1.0 : 0.0;
    const isUdp = protocol === 'UDP' ? 1.0 : 0.0;

    return [
      packetCount,
      byteCount,
      flowDuration,
      packetsPerSec,
      bytesPerSec,
      synCount,
      ackCount,
      synAckRatio,
      failedLogins,
      failedLoginRatio,
      destPort,
      portRisk,
      connFreq,
      repScore,
      isTcp,
      isUdp,
    ];
  }

  /**
   * Fit StandardScaler statistics (mean and std) on feature matrix X
   */
  public fit(X: number[][]): this {
    if (X.length === 0) return this;
    const nFeatures = X[0].length;
    const means: number[] = new Array(nFeatures).fill(0);
    const stds: number[] = new Array(nFeatures).fill(0);

    for (let f = 0; f < nFeatures; f++) {
      let sum = 0;
      for (let i = 0; i < X.length; i++) {
        sum += X[i][f];
      }
      means[f] = sum / X.length;

      let varianceSum = 0;
      for (let i = 0; i < X.length; i++) {
        const diff = X[i][f] - means[f];
        varianceSum += diff * diff;
      }
      const variance = varianceSum / X.length;
      stds[f] = Math.sqrt(variance) || 1.0; // avoid zero division
    }

    this.config = {
      means,
      stds,
      featureNames: PreprocessingPipeline.FEATURE_NAMES,
    };

    return this;
  }

  /**
   * Transform raw feature vector using fitted scaler
   */
  public transform(x: number[]): number[] {
    if (!this.config) {
      return x;
    }
    return x.map((val, idx) => {
      const mean = this.config!.means[idx] || 0;
      const std = this.config!.stds[idx] || 1;
      return (val - mean) / std;
    });
  }

  /**
   * Transform a batch of vectors
   */
  public transformBatch(X: number[][]): number[][] {
    return X.map((row) => this.transform(row));
  }

  public getConfig(): PreprocessingPipelineConfig | null {
    return this.config;
  }

  public setConfig(config: PreprocessingPipelineConfig): void {
    this.config = config;
  }
}
