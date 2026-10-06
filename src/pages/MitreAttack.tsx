import React, { useEffect, useState } from 'react';
import { Grid, ExternalLink, ShieldAlert, Cpu, CheckCircle2, ChevronRight, X, Activity } from 'lucide-react';
import { api } from '../services/api';
import { SeverityBadge } from '../components/SeverityBadge';

export const MitreAttack: React.FC = () => {
  const [techniques, setTechniques] = useState<any[]>([]);
  const [selectedTech, setSelectedTech] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMitre = async () => {
      try {
        const res = await api.getMitreTechniques();
        setTechniques(res || []);
        if (res && res.length > 0) {
          setSelectedTech(res[0]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMitre();
  }, []);

  // Group by tactic
  const tactics = [
    'Initial Access',
    'Execution',
    'Defense Evasion',
    'Credential Access',
    'Discovery',
    'Command and Control',
    'Exfiltration',
    'Impact',
  ];

  return (
    <div className="space-y-4">
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold text-white font-mono uppercase tracking-wide flex items-center gap-2">
            <Grid className="w-4 h-4 text-cyan-400" />
            MITRE ATT&CK Framework Enterprise Matrix Mapping
          </h2>
          <p className="text-xs text-slate-400">
            Adversarial Tactics, Techniques, and Common Knowledge correlated with detected incident telemetry
          </p>
        </div>
        <span className="text-xs font-mono px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-slate-300">
          ATT&CK v14.1 Enterprise Matrix
        </span>
      </div>

      {/* Tactic Matrix Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {tactics.map((tactic) => {
          const matchedTechniques = techniques.filter(
            (t) => t.tactic.toLowerCase() === tactic.toLowerCase()
          );

          return (
            <div
              key={tactic}
              className="bg-slate-900 border border-slate-800 rounded-lg p-3.5 flex flex-col justify-between"
            >
              <div>
                <div className="border-b border-slate-800 pb-2 mb-3">
                  <div className="text-[10px] font-mono uppercase text-cyan-400 tracking-wider">
                    TACTIC
                  </div>
                  <h3 className="text-xs font-bold text-slate-200">{tactic}</h3>
                </div>

                <div className="space-y-2">
                  {matchedTechniques.length > 0 ? (
                    matchedTechniques.map((tech) => (
                      <div
                        key={tech.id}
                        onClick={() => setSelectedTech(tech)}
                        className={`p-2.5 rounded cursor-pointer transition-all border ${
                          selectedTech?.id === tech.id
                            ? 'bg-cyan-950/60 border-cyan-500 text-white shadow-md'
                            : 'bg-slate-950 border-slate-800/80 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                          <span className="text-cyan-400 font-bold">{tech.id}</span>
                          {tech.incident_count > 0 ? (
                            <span className="px-1.5 py-0.2 rounded bg-rose-950 text-rose-400 border border-rose-800 text-[10px] font-bold">
                              {tech.incident_count} Incidents
                            </span>
                          ) : (
                            <span className="text-slate-500 text-[10px]">No active</span>
                          )}
                        </div>
                        <div className="text-xs font-medium truncate font-sans">{tech.name}</div>
                      </div>
                    ))
                  ) : (
                    <div className="text-[11px] text-slate-400 italic p-3 text-center">
                      No baseline mapped techniques
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Technique Investigation Details Card */}
      {selectedTech && (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 shadow-xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold font-mono text-cyan-400">{selectedTech.id}</span>
                <span className="text-sm font-semibold text-white font-sans">{selectedTech.name}</span>
                <SeverityBadge severity={selectedTech.severity} />
              </div>
              <p className="text-xs font-mono text-slate-400 mt-0.5">
                Tactic Phase: <strong className="text-slate-200">{selectedTech.tactic}</strong>
              </p>
            </div>

            <div className="text-right">
              <span className="text-xs font-mono text-slate-400 block">Correlated Cases</span>
              <span className="text-sm font-mono font-bold text-orange-400">
                {selectedTech.incident_count} Active Incidents
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-sans">
            <div className="p-3.5 bg-slate-950 rounded-lg border border-slate-800 space-y-1.5">
              <h4 className="text-[11px] font-mono uppercase font-semibold text-slate-300">
                Technique Description
              </h4>
              <p className="text-slate-300 leading-relaxed">{selectedTech.description}</p>
            </div>

            <div className="p-3.5 bg-slate-950 rounded-lg border border-slate-800 space-y-1.5">
              <h4 className="text-[11px] font-mono uppercase font-semibold text-cyan-400 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5" />
                Detection & AI Strategy
              </h4>
              <p className="text-slate-300 leading-relaxed">{selectedTech.detection}</p>
            </div>

            <div className="p-3.5 bg-slate-950 rounded-lg border border-slate-800 space-y-1.5">
              <h4 className="text-[11px] font-mono uppercase font-semibold text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Mitigation & Countermeasures
              </h4>
              <p className="text-slate-300 leading-relaxed">{selectedTech.mitigation}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
