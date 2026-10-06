import React, { useEffect, useState } from 'react';
import {
  Bell,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldAlert,
  ChevronRight,
  X,
  Cpu,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { api } from '../services/api';
import { SeverityBadge } from '../components/SeverityBadge';
import { DetectionSourceBadge } from '../components/DetectionSourceBadge';

export const Alerts: React.FC = () => {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAlert, setSelectedAlert] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAlerts = async () => {
    try {
      const res = await api.getAlerts({
        severity: severityFilter,
        status: statusFilter,
        query: searchTerm,
      });
      setAlerts(res.alerts || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [severityFilter, statusFilter, searchTerm]);

  const handleStatusChange = async (alertId: string, newStatus: string) => {
    try {
      const updated = await api.updateAlertStatus(alertId, newStatus);
      setAlerts((prev) =>
        prev.map((a) => (a.id === alertId ? { ...a, status: newStatus } : a))
      );
      if (selectedAlert?.id === alertId) {
        setSelectedAlert((prev: any) => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters & Search Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold text-white font-mono uppercase tracking-wide flex items-center gap-2">
            <Bell className="w-4 h-4 text-cyan-400" />
            Security Alerts Triage Desk
          </h2>
          <p className="text-xs text-slate-400">
            Real-time detections flagged by Isolation Forest & Sigma detection rules
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
            <input
              type="text"
              placeholder="Search alert ID, IP..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded pl-8 pr-3 py-1 text-xs text-slate-200 placeholder-slate-500 font-mono focus:outline-none focus:border-cyan-500 w-48"
            />
          </div>

          {/* Severity filter */}
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-xs text-slate-300 font-mono focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">Severity: ALL</option>
            <option value="CRITICAL">CRITICAL</option>
            <option value="HIGH">HIGH</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="LOW">LOW</option>
          </select>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-xs text-slate-300 font-mono focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">Status: ALL</option>
            <option value="New">New</option>
            <option value="Investigating">Investigating</option>
            <option value="Resolved">Resolved</option>
            <option value="False Positive">False Positive</option>
          </select>
        </div>
      </div>

      {/* Alerts Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-slate-950 text-[11px] font-mono text-slate-400 uppercase border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Alert ID</th>
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Incident Classification</th>
                <th className="py-2.5 px-3">Attacker IP</th>
                <th className="py-2.5 px-3">Target IP:Port</th>
                <th className="py-2.5 px-3">Detection</th>
                <th className="py-2.5 px-3">Severity</th>
                <th className="py-2.5 px-3">Confidence</th>
                <th className="py-2.5 px-3">Triage Status</th>
                <th className="py-2.5 px-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
              {alerts.map((alt) => (
                <tr
                  key={alt.id}
                  onClick={() => setSelectedAlert(alt)}
                  className={`hover:bg-slate-800/60 cursor-pointer transition-colors ${
                    selectedAlert?.id === alt.id ? 'bg-cyan-950/30 border-l-2 border-l-cyan-400' : ''
                  }`}
                >
                  <td className="py-2.5 px-3 font-semibold text-cyan-400">{alt.id}</td>
                  <td className="py-2.5 px-3 text-slate-400">
                    {alt.timestamp?.replace('T', ' ').substring(11, 19)}
                  </td>
                  <td className="py-2.5 px-3 font-sans font-medium text-slate-200">
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
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono border ${
                        alt.status === 'New'
                          ? 'bg-rose-950/40 border-rose-800 text-rose-400'
                          : alt.status === 'Investigating'
                          ? 'bg-amber-950/40 border-amber-800 text-amber-400'
                          : alt.status === 'Resolved'
                          ? 'bg-emerald-950/40 border-emerald-800 text-emerald-400'
                          : 'bg-slate-800 border-slate-700 text-slate-400'
                      }`}
                    >
                      {alt.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="text-cyan-400 hover:underline">Investigate &rarr;</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Alert Investigation Modal / Drawer */}
      {selectedAlert && (
        <div className="fixed inset-y-0 right-0 w-full sm:w-130 bg-slate-900 border-l border-slate-800 shadow-2xl p-6 overflow-y-auto z-40">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
            <div>
              <div className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider">
                SECURITY ALERT INVESTIGATION
              </div>
              <h3 className="text-sm font-bold text-white font-mono">{selectedAlert.id}</h3>
            </div>
            <button
              onClick={() => setSelectedAlert(null)}
              className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4 text-xs font-sans">
            {/* Header badges & Status Changer */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-950 rounded-lg border border-slate-800">
              <div className="flex items-center gap-2">
                <SeverityBadge severity={selectedAlert.severity} size="md" />
                <DetectionSourceBadge source={selectedAlert.detection_source} />
              </div>

              {/* Status updater */}
              <div className="flex items-center gap-1.5 font-mono text-xs">
                <span className="text-slate-400 text-[11px]">Status:</span>
                <select
                  value={selectedAlert.status}
                  onChange={(e) => handleStatusChange(selectedAlert.id, e.target.value)}
                  className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded px-2 py-1 font-mono focus:outline-none focus:border-cyan-500"
                >
                  <option value="New">New</option>
                  <option value="Investigating">Investigating</option>
                  <option value="Resolved">Resolved</option>
                  <option value="False Positive">False Positive</option>
                </select>
              </div>
            </div>

            {/* AI Explanation (Explaining WHY with actual feature evidence) */}
            <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-2">
              <div className="text-[11px] font-mono text-cyan-400 uppercase font-semibold flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5" />
                AI Root Cause & Behavioral Analysis
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                {selectedAlert.ai_explanation}
              </p>
            </div>

            {/* Contributing Feature Values from Trained Model */}
            {selectedAlert.contributing_features && (
              <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800">
                <div className="text-[11px] font-mono text-slate-400 uppercase font-semibold mb-2">
                  Top Contributing Model Features (Feature Importance)
                </div>
                <div className="space-y-2">
                  {selectedAlert.contributing_features.map((cf: any, idx: number) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between text-xs p-2 rounded bg-slate-900 border border-slate-800/80 font-mono"
                    >
                      <span className="text-slate-300 font-semibold">{cf.feature}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-cyan-400 font-bold">{String(cf.value)}</span>
                        <span className="text-[10px] text-slate-500">{cf.importance}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Extracted IoCs */}
            <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800">
              <div className="text-[11px] font-mono text-slate-400 uppercase font-semibold mb-2">
                Extracted Indicators of Compromise (IoCs)
              </div>
              {selectedAlert.iocs && selectedAlert.iocs.length > 0 ? (
                <div className="space-y-1.5">
                  {selectedAlert.iocs.map((ioc: string, idx: number) => (
                    <div
                      key={idx}
                      className="p-2 rounded bg-slate-900 border border-slate-800 font-mono text-xs flex items-center justify-between text-slate-200"
                    >
                      <span>{ioc}</span>
                      <span className="text-[10px] text-rose-400 uppercase font-semibold">
                        Hostile IoC
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-slate-500 font-mono">No hostiles IoCs isolated</div>
              )}
            </div>

            {/* MITRE ATT&CK Mapping */}
            <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800">
              <div className="text-[11px] font-mono text-slate-400 uppercase font-semibold mb-2">
                MITRE ATT&CK Mapping
              </div>
              <div className="flex items-center justify-between font-mono text-xs p-2 rounded bg-slate-900 border border-slate-800">
                <div>
                  <span className="text-cyan-400 font-bold">{selectedAlert.mitre_technique_id}</span>
                  <span className="text-slate-300 ml-2">{selectedAlert.mitre_technique_name}</span>
                </div>
                <span className="text-[10px] text-slate-400 uppercase px-2 py-0.5 rounded bg-slate-800">
                  {selectedAlert.mitre_tactic}
                </span>
              </div>
            </div>

            {/* Telemetry Endpoint Details */}
            <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 text-xs font-mono space-y-1 text-slate-300">
              <div>Source IP: <span className="text-cyan-400">{selectedAlert.source_ip}</span></div>
              <div>Destination IP: <span className="text-slate-100">{selectedAlert.destination_ip}:{selectedAlert.destination_port}</span></div>
              <div>Protocol: <span>{selectedAlert.protocol}</span></div>
              <div>Event Type: <span>{selectedAlert.event_type}</span></div>
              <div>Assigned Analyst: <span className="text-slate-200">{selectedAlert.assigned_analyst}</span></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
