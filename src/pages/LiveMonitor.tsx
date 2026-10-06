import React, { useEffect, useState, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Search,
  Filter,
  Radio,
  SlidersHorizontal,
  ChevronRight,
  X,
  Cpu,
  Terminal,
} from 'lucide-react';
import { api } from '../services/api';
import { SeverityBadge } from '../components/SeverityBadge';
import { DetectionSourceBadge } from '../components/DetectionSourceBadge';

export const LiveMonitor: React.FC = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchEvents = async () => {
    if (isPaused) return;
    try {
      const res = await api.getEvents({
        limit: 40,
        severity: severityFilter,
        category: categoryFilter,
        query: searchTerm,
      });
      setEvents(res.events || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
    const interval = setInterval(fetchEvents, 3000);
    return () => clearInterval(interval);
  }, [isPaused, severityFilter, categoryFilter, searchTerm]);

  return (
    <div className="space-y-4">
      {/* Stream Controls Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isPaused ? 'bg-amber-500' : 'bg-emerald-500 animate-ping'
              }`}
            />
            <h2 className="text-sm font-bold text-white font-mono uppercase tracking-wide">
              Live Network Flow Telemetry Stream
            </h2>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            {events.length} flows captured
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Pause / Resume */}
          <button
            onClick={() => setIsPaused(!isPaused)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono font-medium border transition-colors ${
              isPaused
                ? 'bg-emerald-950/40 border-emerald-800 text-emerald-400 hover:bg-emerald-900/60'
                : 'bg-amber-950/40 border-amber-800 text-amber-400 hover:bg-amber-900/60'
            }`}
          >
            {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
            <span>{isPaused ? 'RESUME STREAM' : 'PAUSE STREAM'}</span>
          </button>

          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
            <input
              type="text"
              placeholder="Search IP, payload..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded pl-8 pr-3 py-1 text-xs text-slate-200 placeholder-slate-500 font-mono focus:outline-none focus:border-cyan-500 w-44"
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
        </div>
      </div>

      {/* Main Stream Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-slate-950 text-[11px] font-mono text-slate-400 uppercase border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Flow Time</th>
                <th className="py-2.5 px-3">Source IP</th>
                <th className="py-2.5 px-3">Target IP:Port</th>
                <th className="py-2.5 px-3">Proto</th>
                <th className="py-2.5 px-3">Attack Category</th>
                <th className="py-2.5 px-3">Detection</th>
                <th className="py-2.5 px-3">Score / Anomaly</th>
                <th className="py-2.5 px-3">Severity</th>
                <th className="py-2.5 px-3">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
              {events.map((ev) => {
                const isSelected = selectedEvent?.id === ev.id;
                return (
                  <tr
                    key={ev.id}
                    onClick={() => setSelectedEvent(ev)}
                    className={`hover:bg-slate-800/60 cursor-pointer transition-colors ${
                      isSelected ? 'bg-cyan-950/30 border-l-2 border-l-cyan-400' : ''
                    } ${
                      ev.severity === 'CRITICAL' ? 'bg-rose-950/10' : ''
                    }`}
                  >
                    <td className="py-2.5 px-3 text-slate-400 whitespace-nowrap">
                      {ev.timestamp?.replace('T', ' ').substring(11, 19)}
                    </td>
                    <td className="py-2.5 px-3 text-slate-200 font-semibold">{ev.source_ip}</td>
                    <td className="py-2.5 px-3 text-slate-300">
                      {ev.destination_ip}:{ev.destination_port}
                    </td>
                    <td className="py-2.5 px-3 text-slate-400">{ev.protocol}</td>
                    <td className="py-2.5 px-3 font-sans font-medium text-slate-200">
                      {ev.predicted_category || ev.ground_truth_category || 'Normal'}
                    </td>
                    <td className="py-2.5 px-3">
                      <DetectionSourceBadge source={ev.detection_source || 'AI'} />
                    </td>
                    <td className="py-2.5 px-3 text-slate-300">
                      <span className="text-cyan-400 font-bold">{ev.ai_risk_score ?? 12}</span>
                      <span className="text-slate-500 text-[10px]"> / 100</span>
                    </td>
                    <td className="py-2.5 px-3">
                      <SeverityBadge severity={ev.severity || 'LOW'} />
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <span className="text-[10px] text-cyan-400 hover:underline">Detail</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Deep Event Inspection Drawer / Modal */}
      {selectedEvent && (
        <div className="fixed inset-y-0 right-0 w-full sm:w-110 bg-slate-900 border-l border-slate-800 shadow-2xl p-5 overflow-y-auto z-40">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
            <div>
              <div className="text-[10px] font-mono text-cyan-400 uppercase">
                SECURITY FLOW INSPECTOR
              </div>
              <h3 className="text-sm font-bold text-white font-mono">{selectedEvent.id}</h3>
            </div>
            <button
              onClick={() => setSelectedEvent(null)}
              className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4 text-xs font-mono">
            {/* Header badges */}
            <div className="flex items-center gap-2">
              <SeverityBadge severity={selectedEvent.severity || 'LOW'} size="md" />
              <DetectionSourceBadge source={selectedEvent.detection_source || 'AI'} />
            </div>

            {/* Network Attributes */}
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1.5">
              <div className="text-[11px] text-slate-400 uppercase font-semibold mb-2">
                Flow Headers
              </div>
              <div className="grid grid-cols-2 gap-2 text-slate-300">
                <div>Source IP: <span className="text-cyan-400">{selectedEvent.source_ip}</span></div>
                <div>Target IP: <span className="text-slate-100">{selectedEvent.destination_ip}</span></div>
                <div>Source Port: <span>{selectedEvent.source_port}</span></div>
                <div>Target Port: <span className="text-amber-400">{selectedEvent.destination_port}</span></div>
                <div>Protocol: <span>{selectedEvent.protocol}</span></div>
                <div>Flow Duration: <span>{selectedEvent.flow_duration_ms} ms</span></div>
                <div>Packets: <span>{selectedEvent.packet_count}</span></div>
                <div>Bytes: <span>{selectedEvent.byte_count} B</span></div>
                <div>SYN Count: <span>{selectedEvent.syn_count}</span></div>
                <div>ACK Count: <span>{selectedEvent.ack_count}</span></div>
                <div>Failed Logins: <span className="text-rose-400 font-bold">{selectedEvent.failed_login_count}</span></div>
                <div>Success Logins: <span>{selectedEvent.success_login_count}</span></div>
              </div>
            </div>

            {/* AI Decision Analysis */}
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-2">
              <div className="text-[11px] text-cyan-400 uppercase font-semibold flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5" />
                AI Detection Breakdown
              </div>
              <div className="text-slate-300 space-y-1">
                <div>Anomaly Score (iForest): <span className="text-cyan-300 font-bold">{selectedEvent.anomaly_score ?? '0.45'}</span></div>
                <div>Classification: <span className="text-slate-100 font-semibold">{selectedEvent.predicted_category || 'Normal'}</span></div>
                <div>Supervised Confidence: <span className="text-emerald-400">{selectedEvent.classifier_confidence ?? 94.5}%</span></div>
                <div>Composite Risk Score: <span className="text-amber-400 font-bold">{selectedEvent.ai_risk_score ?? 20} / 100</span></div>
              </div>
            </div>

            {/* Payload Sample */}
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <div className="text-[11px] text-slate-400 uppercase font-semibold mb-1 flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-slate-400" />
                Payload Content / Telemetry Trace
              </div>
              <pre className="p-2 bg-black/60 rounded text-[11px] text-emerald-400 overflow-x-auto whitespace-pre-wrap font-mono">
                {selectedEvent.payload_sample || 'No application payload recorded for transport flow'}
              </pre>
            </div>

            {/* Associated Records */}
            {selectedEvent.associated_alert_id && (
              <div className="p-2.5 rounded bg-cyan-950/40 border border-cyan-800/80 text-cyan-300 text-[11px]">
                Linked Alert: <strong>{selectedEvent.associated_alert_id}</strong>
              </div>
            )}
            {selectedEvent.associated_incident_id && (
              <div className="p-2.5 rounded bg-orange-950/40 border border-orange-800/80 text-orange-300 text-[11px]">
                Linked Incident: <strong>{selectedEvent.associated_incident_id}</strong>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
