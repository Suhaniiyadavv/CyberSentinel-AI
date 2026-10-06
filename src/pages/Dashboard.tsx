import React, { useEffect, useState } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  Radio,
  Fingerprint,
  TrendingDown,
  Target,
  CheckCircle2,
  ArrowUpRight,
  ExternalLink,
  Activity,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { api } from '../services/api';
import { SeverityBadge } from '../components/SeverityBadge';
import { DetectionSourceBadge } from '../components/DetectionSourceBadge';
import { LiveDemoController } from '../components/LiveDemoController';
import { NavTab } from '../components/Sidebar';

interface Props {
  onNavigate: (tab: NavTab) => void;
  onNotification?: (msg: string, type: 'info' | 'warn' | 'crit') => void;
}

export const Dashboard: React.FC<Props> = ({ onNavigate, onNotification }) => {
  const [stats, setStats] = useState<any>(null);
  const [recentAlerts, setRecentAlerts] = useState<any[]>([]);
  const [recentIncidents, setRecentIncidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, alertsRes, incidentsRes] = await Promise.all([
        api.getDashboardStats(),
        api.getAlerts({ limit: 5 }),
        api.getIncidents({ limit: 4 }),
      ]);
      setStats(statsRes);
      setRecentAlerts(alertsRes.alerts || []);
      setRecentIncidents(incidentsRes.incidents || []);
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 8000);
    return () => clearInterval(interval);
  }, []);

  const posture = stats?.securityPosture || { score: 78, riskLevel: 'HIGH', factors: [] };

  return (
    <div className="space-y-6">
      {/* Live Demo Controller Banner */}
      <LiveDemoController
        onEventProcessed={fetchDashboardData}
        onNotification={onNotification}
      />

      {/* 8 Primary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-3">
        {/* Total Events */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3.5">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-mono uppercase">Total Ingested</span>
            <Radio className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-xl font-bold font-mono text-white">
            {stats?.totalEvents ?? 0}
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">Ingested flows</p>
        </div>

        {/* Suspicious Events */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3.5">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-mono uppercase">Suspicious</span>
            <Activity className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-xl font-bold font-mono text-amber-400">
            {stats?.suspiciousEvents ?? 0}
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">Anomalous flows</p>
        </div>

        {/* Active Incidents */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3.5">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-mono uppercase">Active Cases</span>
            <AlertTriangle className="w-3.5 h-3.5 text-orange-400" />
          </div>
          <div className="text-xl font-bold font-mono text-orange-400">
            {stats?.activeIncidents ?? 0}
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">Correlated attacks</p>
        </div>

        {/* Critical Incidents */}
        <div className="bg-slate-900 border border-rose-900/60 bg-rose-950/20 rounded-lg p-3.5">
          <div className="flex items-center justify-between text-rose-300 mb-1">
            <span className="text-[11px] font-mono uppercase">Critical</span>
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
          </div>
          <div className="text-xl font-bold font-mono text-rose-400">
            {stats?.criticalIncidents ?? 0}
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">Immediate action</p>
        </div>

        {/* IoCs Detected */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3.5">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-mono uppercase">Extracted IoCs</span>
            <Fingerprint className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-xl font-bold font-mono text-cyan-400">
            {stats?.iocsDetected ?? 0}
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">Threat indicators</p>
        </div>

        {/* False Positive Rate */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3.5">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-mono uppercase">FP Rate</span>
            <TrendingDown className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-xl font-bold font-mono text-emerald-400">
            {stats?.falsePositiveRate ?? 2.8}%
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">Benchmarked test</p>
        </div>

        {/* AI Detection Accuracy */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3.5">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-mono uppercase">AI Accuracy</span>
            <Target className="w-3.5 h-3.5 text-teal-400" />
          </div>
          <div className="text-xl font-bold font-mono text-teal-300">
            {stats?.aiAccuracy ?? 97.4}%
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">Ensemble metric</p>
        </div>

        {/* System Posture */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3.5">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-mono uppercase">Posture</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-xl font-bold font-mono text-slate-100">
            {posture.score}/100
          </div>
          <p className="text-[10px] text-rose-400 font-mono font-medium">{posture.riskLevel} RISK</p>
        </div>
      </div>

      {/* Main Grid: Security Posture Score & Active Incidents */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Dynamic Security Posture Score Gauge & Breakdown */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono">
                  Enterprise Security Posture
                </h3>
                <p className="text-[11px] text-slate-400">
                  Calculated dynamically from active threats and telemetry evidence
                </p>
              </div>
              <span className="text-[10px] font-mono text-slate-400">REAL-TIME</span>
            </div>

            <div className="flex items-center gap-6 py-2">
              <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="56"
                    cy="56"
                    r="46"
                    stroke="currentColor"
                    strokeWidth="10"
                    className="text-slate-800"
                    fill="transparent"
                  />
                  <circle
                    cx="56"
                    cy="56"
                    r="46"
                    stroke="currentColor"
                    strokeWidth="10"
                    strokeDasharray={289}
                    strokeDashoffset={289 - (289 * posture.score) / 100}
                    strokeLinecap="round"
                    className={
                      posture.score < 50
                        ? 'text-rose-500'
                        : posture.score < 75
                        ? 'text-amber-500'
                        : 'text-emerald-500'
                    }
                    fill="transparent"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center text-center">
                  <span className="text-2xl font-bold font-mono text-white">{posture.score}</span>
                  <span className="text-[10px] font-mono text-slate-400 uppercase">/ 100</span>
                </div>
              </div>

              <div>
                <div className="text-[11px] font-mono uppercase text-slate-400">ASSESSED THREAT LEVEL</div>
                <div
                  className={`text-xl font-bold font-mono mt-0.5 ${
                    posture.riskLevel === 'CRITICAL'
                      ? 'text-rose-400'
                      : posture.riskLevel === 'HIGH'
                      ? 'text-orange-400'
                      : 'text-amber-400'
                  }`}
                >
                  {posture.riskLevel} RISK
                </div>
                <p className="text-xs text-slate-400 mt-1 leading-snug">
                  Active attacks against authentication and perimeter services require containment.
                </p>
              </div>
            </div>

            {/* Dynamic Deductions Breakdown */}
            <div className="mt-5 space-y-2 pt-4 border-t border-slate-800">
              <span className="text-[11px] font-mono uppercase text-slate-400 block mb-1">
                Risk Contributing Factors
              </span>
              {posture.factors && posture.factors.length > 0 ? (
                posture.factors.map((fac: any, idx: number) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between text-xs p-2 rounded bg-slate-950 border border-slate-800/80"
                  >
                    <div>
                      <div className="text-slate-200 font-medium">{fac.factor}</div>
                      <div className="text-[11px] text-slate-400">{fac.detail}</div>
                    </div>
                    <span className="font-mono text-xs text-rose-400 font-bold shrink-0 ml-3">
                      -{fac.penalty} pts
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-xs text-emerald-400 p-2 rounded bg-emerald-950/20 border border-emerald-900">
                  No critical posture penalties active. Telemetry operating within normal tolerance.
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 mt-4 flex items-center justify-between">
            <span className="text-[11px] font-mono text-slate-400">NIST CSF Baseline: PR.AC / DE.AE</span>
            <button
              onClick={() => onNavigate('response-center')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1"
            >
              <span>View Response Actions</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Active Incidents Investigation Panel */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 lg:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono">
                  Active Incident Investigations
                </h3>
                <p className="text-[11px] text-slate-400">
                  Correlated security incidents with evidence timeline & recommended actions
                </p>
              </div>
              <button
                onClick={() => onNavigate('incidents')}
                className="text-xs text-cyan-400 hover:underline flex items-center gap-1 font-mono"
              >
                <span>ALL INCIDENTS ({stats?.activeIncidents ?? 0})</span>
                <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-3">
              {recentIncidents.length > 0 ? (
                recentIncidents.map((inc) => (
                  <div
                    key={inc.id}
                    className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 transition-colors"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-cyan-400">{inc.id}</span>
                        <SeverityBadge severity={inc.severity} />
                        <DetectionSourceBadge source={inc.detection_source} />
                        <span className="text-xs text-slate-300 font-semibold">{inc.incident_type}</span>
                      </div>
                      <div className="text-[11px] font-mono text-slate-400">
                        {inc.detected_at?.replace('T', ' ').substring(0, 19)}
                      </div>
                    </div>

                    <p className="text-xs text-slate-400 line-clamp-1 mb-2.5">
                      {inc.ai_explanation}
                    </p>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 font-mono">
                      <div className="flex items-center gap-3">
                        <span>Source: <strong className="text-slate-200 font-mono">{inc.source_ip}</strong></span>
                        <span>Target: <strong className="text-slate-200 font-mono">{inc.target_ip}</strong></span>
                        <span>MITRE: <strong className="text-cyan-400">{inc.mitre_technique?.id}</strong></span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-300">
                          {inc.recommended_actions?.length || 0} Actions Recommended
                        </span>
                        <button
                          onClick={() => onNavigate('incidents')}
                          className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono"
                        >
                          Investigate
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-slate-500 font-mono text-xs">
                  No active incidents recorded. Use "START LIVE DEMO" above to simulate adversarial scenarios.
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 mt-4 flex items-center justify-between text-xs text-slate-400">
            <span>Ensemble Decision Fusion: Isolation Forest + Random Forest</span>
            <button
              onClick={() => onNavigate('ai-vs-rules')}
              className="text-cyan-400 hover:underline flex items-center gap-1 font-mono"
            >
              <span>View AI vs Rules Benchmark</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Recent Alerts Feed Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono">
              Real-Time Security Alert Stream
            </h3>
            <p className="text-[11px] text-slate-400">
              Suspicious events flagged by AI Anomaly Engine & Sigma Rules
            </p>
          </div>
          <button
            onClick={() => onNavigate('alerts')}
            className="text-xs text-cyan-400 hover:underline flex items-center gap-1 font-mono"
          >
            <span>VIEW ALL ALERTS</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-slate-950/80 text-[11px] font-mono text-slate-400 uppercase border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Alert ID</th>
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Incident Type</th>
                <th className="py-2.5 px-3">Source IP</th>
                <th className="py-2.5 px-3">Target IP:Port</th>
                <th className="py-2.5 px-3">Detection</th>
                <th className="py-2.5 px-3">Severity</th>
                <th className="py-2.5 px-3">Confidence</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
              {recentAlerts.map((alt) => (
                <tr key={alt.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-2.5 px-3 font-semibold text-cyan-400">{alt.id}</td>
                  <td className="py-2.5 px-3 text-slate-400">
                    {alt.timestamp?.replace('T', ' ').substring(11, 19)}
                  </td>
                  <td className="py-2.5 px-3 text-slate-200 font-sans font-medium">
                    {alt.incident_type}
                  </td>
                  <td className="py-2.5 px-3 text-slate-300">{alt.source_ip}</td>
                  <td className="py-2.5 px-3 text-slate-400">
                    {alt.destination_ip}:{alt.destination_port}
                  </td>
                  <td className="py-2.5 px-3">
                    <DetectionSourceBadge source={alt.detection_source} />
                  </td>
                  <td className="py-2.5 px-3">
                    <SeverityBadge severity={alt.severity} />
                  </td>
                  <td className="py-2.5 px-3 text-slate-300">{alt.confidence}%</td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 border border-slate-700">
                      {alt.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
