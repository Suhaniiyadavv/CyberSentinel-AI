import React, { useState } from 'react';
import { Settings as SettingsIcon, Shield, Sliders, Database, Save, CheckCircle2 } from 'lucide-react';

export const Settings: React.FC = () => {
  const [threshold, setThreshold] = useState(0.55);
  const [autoContainment, setAutoContainment] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
        <h2 className="text-sm font-bold text-white font-mono uppercase tracking-wide flex items-center gap-2 mb-1">
          <SettingsIcon className="w-4 h-4 text-cyan-400" />
          SOC Detection Engine & Platform Configuration
        </h2>
        <p className="text-xs text-slate-400">
          Tune algorithmic sensitivity thresholds, containment enforcement modes, and database parameters
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Detection Engine Parameters */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4">
          <h3 className="text-xs font-semibold text-slate-200 font-mono uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2">
            <Sliders className="w-4 h-4 text-cyan-400" />
            Anomaly Detection Sensitivity
          </h3>

          <div>
            <div className="flex justify-between items-center text-xs font-mono mb-2">
              <span className="text-slate-300">Isolation Forest Anomaly Threshold (&tau;)</span>
              <span className="text-cyan-400 font-bold">{threshold}</span>
            </div>
            <input
              type="range"
              min="0.30"
              max="0.80"
              step="0.05"
              value={threshold}
              onChange={(e) => setThreshold(parseFloat(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
              <span>0.30 (High Alert Sensitivity / Higher FP)</span>
              <span>0.55 (Recommended Benchmark)</span>
              <span>0.80 (Conservative / Only Extreme Outliers)</span>
            </div>
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={autoContainment}
                onChange={(e) => setAutoContainment(e.target.checked)}
                className="rounded bg-slate-950 border-slate-700 text-cyan-500"
              />
              <div>
                <div className="text-xs font-medium text-slate-200 font-sans">
                  Automated Autonomous Remediation Execution (Simulation Mode)
                </div>
                <div className="text-[11px] text-slate-400 font-sans">
                  Automatically approve Tier-1 firewall drop rules without manual SOC analyst click confirmation.
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Platform Metadata & Privacy Box */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-3 font-mono text-xs">
          <h3 className="text-xs font-semibold text-slate-200 font-mono uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2">
            <Shield className="w-4 h-4 text-emerald-400" />
            Security & Data Privacy Standard
          </h3>

          <div className="space-y-1.5 text-slate-300">
            <div className="flex justify-between"><span>Execution Runtime:</span><strong className="text-emerald-400">Air-Gapped Local Environment</strong></div>
            <div className="flex justify-between"><span>Third-Party Cloud APIs:</span><strong className="text-slate-100">0 (No external telemetry egress)</strong></div>
            <div className="flex justify-between"><span>Authentication Salt:</span><strong className="text-cyan-400">SHA-256 with Internal Salt</strong></div>
            <div className="flex justify-between"><span>Compliance Mapping:</span><strong className="text-slate-100">NIST SP 800-61 Rev. 2 / MITRE ATT&CK</strong></div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          {saved ? (
            <span className="text-xs font-mono text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              Configurations updated successfully.
            </span>
          ) : <span />}

          <button
            type="submit"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 text-xs font-bold font-mono transition-colors shadow-md"
          >
            <Save className="w-4 h-4" />
            SAVE SOC SETTINGS
          </button>
        </div>
      </form>
    </div>
  );
};
