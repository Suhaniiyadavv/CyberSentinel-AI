import React, { useEffect, useState } from 'react';
import { FileCode, Shield, CheckCircle2, XCircle, Code2, Eye, EyeOff, Sliders } from 'lucide-react';
import { api } from '../services/api';
import { SeverityBadge } from '../components/SeverityBadge';

export const RuleEngine: React.FC = () => {
  const [rules, setRules] = useState<any[]>([]);
  const [selectedRule, setSelectedRule] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchRules = async () => {
    try {
      const res = await api.getRules();
      setRules(res || []);
      if (!selectedRule && res && res.length > 0) {
        setSelectedRule(res[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  const handleToggle = async (ruleId: string, currentEnabled: boolean) => {
    try {
      const updated = await api.toggleRule(ruleId, !currentEnabled);
      setRules((prev) =>
        prev.map((r) => (r.id === ruleId ? { ...r, enabled: !currentEnabled } : r))
      );
      if (selectedRule?.id === ruleId) {
        setSelectedRule((prev: any) => ({ ...prev, enabled: !currentEnabled }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold text-white font-mono uppercase tracking-wide flex items-center gap-2">
            <FileCode className="w-4 h-4 text-purple-400" />
            Deterministic Sigma Rule Detection Engine
          </h2>
          <p className="text-xs text-slate-400">
            Generic signature format for traditional rule-based SIEM detection & behavioral matching
          </p>
        </div>
        <span className="text-xs font-mono px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-purple-400 font-semibold">
          Format: Sigma Specification 2.0
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Rules Table (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-lg overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-slate-950 text-[11px] font-mono text-slate-400 uppercase border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Rule ID</th>
                  <th className="py-2.5 px-3">Rule Title</th>
                  <th className="py-2.5 px-3">MITRE</th>
                  <th className="py-2.5 px-3">Matches</th>
                  <th className="py-2.5 px-3">Severity</th>
                  <th className="py-2.5 px-3">Enabled</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                {rules.map((rule) => {
                  const isSelected = selectedRule?.id === rule.id;
                  return (
                    <tr
                      key={rule.id}
                      onClick={() => setSelectedRule(rule)}
                      className={`hover:bg-slate-800/60 cursor-pointer transition-colors ${
                        isSelected ? 'bg-purple-950/30 border-l-2 border-l-purple-400' : ''
                      }`}
                    >
                      <td className="py-2.5 px-3 font-semibold text-purple-400">{rule.id}</td>
                      <td className="py-2.5 px-3 font-sans font-medium text-slate-200 max-w-xs truncate">
                        {rule.title}
                      </td>
                      <td className="py-2.5 px-3 text-cyan-400">{rule.mitre_attack_id}</td>
                      <td className="py-2.5 px-3 text-slate-300 font-bold">
                        {rule.matches_count}
                      </td>
                      <td className="py-2.5 px-3">
                        <SeverityBadge severity={rule.severity} />
                      </td>
                      <td className="py-2.5 px-3" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleToggle(rule.id, rule.enabled)}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors ${
                            rule.enabled
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800 hover:bg-emerald-900/60'
                              : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700'
                          }`}
                        >
                          {rule.enabled ? 'ACTIVE' : 'OFF'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selected Sigma Rule YAML & Definition Inspector (5 cols) */}
        <div className="lg:col-span-5">
          {selectedRule ? (
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <span className="text-[10px] font-mono text-purple-400 uppercase">
                    SIGMA SPECIFICATION INSPECTOR
                  </span>
                  <h3 className="text-sm font-bold text-white font-mono">{selectedRule.id}</h3>
                </div>
                <button
                  onClick={() => handleToggle(selectedRule.id, selectedRule.enabled)}
                  className={`px-3 py-1 rounded text-xs font-mono font-bold ${
                    selectedRule.enabled
                      ? 'bg-emerald-600 text-slate-950 hover:bg-emerald-500'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {selectedRule.enabled ? 'Rule Enabled' : 'Rule Disabled'}
                </button>
              </div>

              <div className="space-y-2 font-mono text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Title:</span>
                  <span className="text-white font-semibold font-sans">{selectedRule.title}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Condition:</span>
                  <code className="p-1.5 rounded bg-slate-950 border border-slate-800 text-cyan-300 block text-[11px]">
                    {selectedRule.condition}
                  </code>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Description:</span>
                  <p className="text-slate-300 font-sans text-xs leading-relaxed">
                    {selectedRule.description}
                  </p>
                </div>
              </div>

              {/* Full Sigma YAML preview */}
              <div>
                <span className="text-[11px] font-mono text-slate-400 uppercase font-semibold block mb-1 flex items-center gap-1.5">
                  <Code2 className="w-3.5 h-3.5 text-purple-400" />
                  Sigma Rule Definition (YAML)
                </span>
                <pre className="p-3 bg-black/70 rounded-lg border border-slate-800 text-xs font-mono text-purple-300 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                  {selectedRule.sigma_yaml}
                </pre>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-lg text-slate-400 font-mono text-xs">
              Select a Sigma rule on the left to view condition definitions.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
