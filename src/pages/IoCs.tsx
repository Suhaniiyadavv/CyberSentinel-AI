import React, { useEffect, useState } from 'react';
import {
  Fingerprint,
  Search,
  Filter,
  ShieldAlert,
  Hash,
  Globe,
  Radio,
  Server,
  Mail,
  ExternalLink,
  ChevronRight,
  X,
  FileCheck,
} from 'lucide-react';
import { api } from '../services/api';
import { SeverityBadge } from '../components/SeverityBadge';

export const IoCs: React.FC = () => {
  const [iocs, setIocs] = useState<any[]>([]);
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIoc, setSelectedIoc] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchIoCs = async () => {
    try {
      const res = await api.getIoCs({
        type: typeFilter,
        severity: severityFilter,
        query: searchTerm,
      });
      setIocs(res.iocs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIoCs();
  }, [typeFilter, severityFilter, searchTerm]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'IPv4':
        return <Radio className="w-3.5 h-3.5 text-cyan-400" />;
      case 'Domain':
      case 'URL':
        return <Globe className="w-3.5 h-3.5 text-blue-400" />;
      case 'MD5':
      case 'SHA256':
        return <Hash className="w-3.5 h-3.5 text-emerald-400" />;
      case 'Port':
        return <Server className="w-3.5 h-3.5 text-amber-400" />;
      default:
        return <Fingerprint className="w-3.5 h-3.5 text-purple-400" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Header & Filter Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold text-white font-mono uppercase tracking-wide flex items-center gap-2">
            <Fingerprint className="w-4 h-4 text-cyan-400" />
            Indicators of Compromise (IoC) Database
          </h2>
          <p className="text-xs text-slate-400">
            Cryptographic signatures, adversarial IPs, C2 domains, and malicious socket artifacts
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
            <input
              type="text"
              placeholder="Search hash, IP, domain..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded pl-8 pr-3 py-1 text-xs text-slate-200 placeholder-slate-500 font-mono focus:outline-none focus:border-cyan-500 w-48"
            />
          </div>

          {/* Type filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-xs text-slate-300 font-mono focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">Type: ALL</option>
            <option value="IPv4">IPv4</option>
            <option value="Domain">Domain</option>
            <option value="URL">URL</option>
            <option value="SHA256">SHA256</option>
            <option value="MD5">MD5</option>
            <option value="Port">Port</option>
          </select>

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
          </select>
        </div>
      </div>

      {/* IoCs Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-slate-950 text-[11px] font-mono text-slate-400 uppercase border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Indicator Value</th>
                <th className="py-2.5 px-3">Risk Score</th>
                <th className="py-2.5 px-3">Severity</th>
                <th className="py-2.5 px-3">Associated Case</th>
                <th className="py-2.5 px-3">First Seen</th>
                <th className="py-2.5 px-3">Threat Context</th>
                <th className="py-2.5 px-3">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
              {iocs.map((ioc) => (
                <tr
                  key={ioc.id || ioc.value}
                  onClick={() => setSelectedIoc(ioc)}
                  className={`hover:bg-slate-800/60 cursor-pointer transition-colors ${
                    selectedIoc?.value === ioc.value ? 'bg-cyan-950/30 border-l-2 border-l-cyan-400' : ''
                  }`}
                >
                  <td className="py-2.5 px-3">
                    <span className="flex items-center gap-1.5 text-slate-300">
                      {getTypeIcon(ioc.type)}
                      {ioc.type}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-cyan-300 max-w-xs truncate">
                    {ioc.value}
                  </td>
                  <td className="py-2.5 px-3 text-amber-400 font-bold">{ioc.risk_score}/100</td>
                  <td className="py-2.5 px-3">
                    <SeverityBadge severity={ioc.severity} />
                  </td>
                  <td className="py-2.5 px-3 text-slate-400">
                    {ioc.incident_id || 'Global Intel'}
                  </td>
                  <td className="py-2.5 px-3 text-slate-400 whitespace-nowrap">
                    {ioc.first_seen?.replace('T', ' ').substring(11, 19)}
                  </td>
                  <td className="py-2.5 px-3 text-slate-300 font-sans max-w-sm truncate">
                    {ioc.threat_context}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="text-cyan-400 hover:underline">Dossier &rarr;</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* IoC Dossier Drawer */}
      {selectedIoc && (
        <div className="fixed inset-y-0 right-0 w-full sm:w-120 bg-slate-900 border-l border-slate-800 shadow-2xl p-6 overflow-y-auto z-40 font-mono text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
            <div>
              <div className="text-[10px] text-cyan-400 uppercase">THREAT INTELLIGENCE DOSSIER</div>
              <h3 className="text-sm font-bold text-white break-all">{selectedIoc.value}</h3>
            </div>
            <button
              onClick={() => setSelectedIoc(null)}
              className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <SeverityBadge severity={selectedIoc.severity} size="md" />
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                Type: {selectedIoc.type}
              </span>
              <span className="px-2 py-0.5 rounded bg-amber-950/60 border border-amber-800 text-amber-400 font-bold">
                Risk: {selectedIoc.risk_score} / 100
              </span>
            </div>

            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1.5 text-slate-300">
              <div className="text-[11px] text-slate-400 uppercase font-semibold mb-2">
                Intelligence Summary
              </div>
              <div>First Seen: <span>{selectedIoc.first_seen?.replace('T', ' ')}</span></div>
              <div>Last Observed: <span>{selectedIoc.last_seen?.replace('T', ' ')}</span></div>
              <div>Linked Incident: <span className="text-cyan-400">{selectedIoc.incident_id || 'Case TBD'}</span></div>
              <div>Threat Category: <span>{selectedIoc.incident_type || 'Malicious Telemetry'}</span></div>
            </div>

            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
              <div className="text-[11px] text-slate-400 uppercase font-semibold mb-1">
                Contextual Analysis
              </div>
              <p className="text-slate-300 font-sans leading-relaxed text-xs">
                {selectedIoc.threat_context}
              </p>
            </div>

            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-2">
              <div className="text-[11px] text-emerald-400 uppercase font-semibold flex items-center gap-1.5">
                <FileCheck className="w-3.5 h-3.5" />
                Recommended Response Policy
              </div>
              <p className="text-slate-300 font-sans text-xs">
                Enforce global perimeter drop rule and propagate indicator to enterprise EDR / SIEM blocklist.
              </p>
              <pre className="p-2 bg-black/60 rounded text-[10px] text-emerald-400 overflow-x-auto whitespace-pre-wrap">
                {selectedIoc.type === 'IPv4'
                  ? `iptables -I INPUT -s ${selectedIoc.value} -j DROP`
                  : selectedIoc.type === 'Domain'
                  ? `pihole -b ${selectedIoc.value}`
                  : `# Hash Quarantine\nGet-AppLockerPolicy -Xml | Out-File -FilePath BlockPolicy.xml`}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
