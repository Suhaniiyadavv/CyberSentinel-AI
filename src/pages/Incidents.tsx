import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Shield,
  Radio,
  Cpu,
  Layers,
  ChevronRight,
  Terminal,
  Activity,
  FileCheck,
  ShieldAlert,
} from 'lucide-react';
import { api } from '../services/api';
import { SeverityBadge } from '../components/SeverityBadge';
import { DetectionSourceBadge } from '../components/DetectionSourceBadge';

export const Incidents: React.FC = () => {
  const [incidents, setIncidents] = useState<any[]>([]);
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIncident, setSelectedIncident] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchIncidents = async () => {
    try {
      const res = await api.getIncidents({
        severity: severityFilter,
        status: statusFilter,
        query: searchTerm,
      });
      setIncidents(res.incidents || []);
      if (!selectedIncident && res.incidents && res.incidents.length > 0) {
        setSelectedIncident(res.incidents[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, [severityFilter, statusFilter, searchTerm]);

  const handleIncidentStatus = async (id: string, newStatus: string) => {
    try {
      await api.updateIncidentStatus(id, newStatus);
      setIncidents((prev) =>
        prev.map((i) => (i.id === id ? { ...i, status: newStatus } : i))
      );
      if (selectedIncident?.id === id) {
        setSelectedIncident((prev: any) => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleResponseAction = async (incidentId: string, recId: string, status: string) => {
    try {
      await api.updateResponseStatus(incidentId, recId, status);
      // Refresh current incident
      const updated = await api.getIncidentById(incidentId);
      if (updated) {
        setSelectedIncident(updated);
        setIncidents((prev) => prev.map((i) => (i.id === incidentId ? updated : i)));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header & Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold text-white font-mono uppercase tracking-wide flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-orange-400" />
            Cyber Incident Investigation Command Desk
          </h2>
          <p className="text-xs text-slate-400">
            Multi-event correlated attack cases with root-cause timelines & containment actions
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
            <input
              type="text"
              placeholder="Search INC ID, IP..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded pl-8 pr-3 py-1 text-xs text-slate-200 placeholder-slate-500 font-mono focus:outline-none focus:border-cyan-500 w-44"
            />
          </div>

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

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-xs text-slate-300 font-mono focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">Status: ALL</option>
            <option value="New">New</option>
            <option value="Investigating">Investigating</option>
            <option value="Contained">Contained</option>
            <option value="Resolved">Resolved</option>
          </select>
        </div>
      </div>

      {/* Two Column Layout: Incident List & Detailed Investigation Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Incident List (Left 5 Cols) */}
        <div className="lg:col-span-5 space-y-3">
          {incidents.map((inc) => {
            const isSelected = selectedIncident?.id === inc.id;
            return (
              <div
                key={inc.id}
                onClick={() => setSelectedIncident(inc)}
                className={`p-4 rounded-lg bg-slate-900 border cursor-pointer transition-all ${
                  isSelected
                    ? 'border-cyan-500 shadow-lg shadow-cyan-950/40 bg-slate-900/90'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-cyan-400">{inc.id}</span>
                    <SeverityBadge severity={inc.severity} />
                    <DetectionSourceBadge source={inc.detection_source} />
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">
                    {inc.detected_at?.replace('T', ' ').substring(11, 19)}
                  </span>
                </div>

                <h4 className="text-sm font-semibold text-white mb-1">{inc.title}</h4>
                <p className="text-xs text-slate-400 line-clamp-2 mb-3 font-sans">
                  {inc.ai_explanation}
                </p>

                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-2 border-t border-slate-800/80">
                  <div className="flex items-center gap-3">
                    <span>Source: <strong className="text-slate-200">{inc.source_ip}</strong></span>
                    <span>Target: <strong className="text-slate-200">{inc.target_ip}</strong></span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    {inc.status}
                  </span>
                </div>
              </div>
            );
          })}

          {incidents.length === 0 && (
            <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-lg text-slate-400 font-mono text-xs">
              No incidents match current filter.
            </div>
          )}
        </div>

        {/* Incident Detail & Investigation Timeline (Right 7 Cols) */}
        <div className="lg:col-span-7">
          {selectedIncident ? (
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 space-y-6 shadow-xl sticky top-20">
              {/* Header Box */}
              <div className="border-b border-slate-800 pb-4">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2.5">
                    <span className="text-base font-bold font-mono text-cyan-400">
                      {selectedIncident.id}
                    </span>
                    <SeverityBadge severity={selectedIncident.severity} size="md" />
                    <DetectionSourceBadge source={selectedIncident.detection_source} />
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-slate-400">Status:</span>
                    <select
                      value={selectedIncident.status}
                      onChange={(e) =>
                        handleIncidentStatus(selectedIncident.id, e.target.value)
                      }
                      className="bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded px-2.5 py-1 font-mono focus:outline-none focus:border-cyan-500"
                    >
                      <option value="New">New</option>
                      <option value="Investigating">Investigating</option>
                      <option value="Contained">Contained</option>
                      <option value="Resolved">Resolved</option>
                    </select>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-white mb-1">
                  {selectedIncident.incident_type.toUpperCase()} ATTACK
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  {selectedIncident.ai_explanation}
                </p>
              </div>

              {/* Case Stats Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs bg-slate-950 p-3.5 rounded-lg border border-slate-800">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase block">AI Risk Score</span>
                  <span className="text-amber-400 font-bold text-sm">
                    {selectedIncident.ai_risk_score} / 100
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase block">ML Confidence</span>
                  <span className="text-emerald-400 font-bold text-sm">
                    {selectedIncident.confidence}%
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase block">Adversary Source</span>
                  <span className="text-cyan-300 font-bold text-xs truncate block">
                    {selectedIncident.source_ip}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase block">Target Asset</span>
                  <span className="text-slate-200 font-bold text-xs truncate block">
                    {selectedIncident.target_ip}
                  </span>
                </div>
              </div>

              {/* Dynamic Severity Evidence Breakdown */}
              {selectedIncident.severity_breakdown && (
                <div>
                  <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-300 mb-2.5">
                    Severity Calculation Evidence (Why {selectedIncident.severity}?)
                  </h4>
                  <div className="space-y-1.5">
                    {selectedIncident.severity_breakdown.map((item: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-2 rounded bg-slate-950 border border-slate-800/80 text-xs flex items-center justify-between"
                      >
                        <div className="font-sans text-slate-300">
                          <strong className="text-white font-mono">{item.factor}:</strong> {item.detail}
                        </div>
                        <SeverityBadge severity={item.impact} size="sm" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* MITRE ATT&CK Mapping Card */}
              {selectedIncident.mitre_technique && (
                <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="text-[10px] font-mono text-cyan-400 uppercase font-semibold mb-1">
                    MITRE ATT&CK MAPPED TECHNIQUE
                  </div>
                  <div className="flex items-center justify-between font-mono text-xs mb-1">
                    <span className="text-cyan-300 font-bold">
                      {selectedIncident.mitre_technique.id} — {selectedIncident.mitre_technique.name}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 uppercase">
                      Tactic: {selectedIncident.mitre_technique.tactic}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-sans mt-1">
                    {selectedIncident.mitre_technique.description}
                  </p>
                </div>
              )}

              {/* Chronological Investigation Timeline */}
              <div>
                <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-cyan-400" />
                  Chronological Incident Timeline
                </h4>

                <div className="space-y-3 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-800 font-mono text-xs pl-2">
                  {selectedIncident.timeline?.map((step: any, idx: number) => (
                    <div key={idx} className="relative flex items-start gap-3 pl-6">
                      <div className="absolute left-1.5 top-1 w-4 h-4 rounded-full bg-slate-900 border-2 border-cyan-400 flex items-center justify-center -translate-x-1/2">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                      </div>
                      <div className="p-2.5 rounded bg-slate-950 border border-slate-800/80 flex-1">
                        <div className="flex items-center justify-between text-[10px] text-slate-400 mb-0.5">
                          <span className="text-cyan-400 font-semibold">{step.action}</span>
                          <span>{step.timestamp?.replace('T', ' ').substring(11, 19)}</span>
                        </div>
                        <div className="text-xs text-slate-300 font-sans">{step.detail}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommended Response Actions */}
              {selectedIncident.recommended_actions && (
                <div className="pt-4 border-t border-slate-800">
                  <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-2">
                    <ShieldAlert className="w-3.5 h-3.5 text-emerald-400" />
                    Recommended Remediation Actions
                  </h4>

                  <div className="space-y-3">
                    {selectedIncident.recommended_actions.map((rec: any) => (
                      <div
                        key={rec.id}
                        className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-2"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="font-semibold text-xs text-white font-sans">
                            {rec.action}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono border ${
                              rec.status === 'Approved'
                                ? 'bg-emerald-950/40 border-emerald-800 text-emerald-400'
                                : rec.status === 'Completed'
                                ? 'bg-blue-950/40 border-blue-800 text-blue-400'
                                : rec.status === 'Rejected'
                                ? 'bg-rose-950/40 border-rose-800 text-rose-400'
                                : 'bg-amber-950/40 border-amber-800 text-amber-400'
                            }`}
                          >
                            {rec.status}
                          </span>
                        </div>

                        <p className="text-xs text-slate-400 font-sans">{rec.reason}</p>

                        {/* Script preview */}
                        {rec.automated_script_preview && (
                          <pre className="p-2 bg-black/60 rounded text-[10px] font-mono text-emerald-400 overflow-x-auto whitespace-pre-wrap">
                            {rec.automated_script_preview}
                          </pre>
                        )}

                        <div className="flex items-center justify-end gap-2 pt-1">
                          {rec.status === 'Pending' && (
                            <>
                              <button
                                onClick={() =>
                                  handleResponseAction(selectedIncident.id, rec.id, 'Approved')
                                }
                                className="px-2.5 py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-slate-950 text-xs font-semibold font-mono"
                              >
                                Approve Action
                              </button>
                              <button
                                onClick={() =>
                                  handleResponseAction(selectedIncident.id, rec.id, 'Rejected')
                                }
                                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          {rec.status === 'Approved' && (
                            <button
                              onClick={() =>
                                handleResponseAction(selectedIncident.id, rec.id, 'Completed')
                              }
                              className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-xs font-semibold font-mono"
                            >
                              Mark Completed
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-lg text-slate-400 font-mono text-xs">
              Select an incident from the left to inspect timeline and telemetry.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
