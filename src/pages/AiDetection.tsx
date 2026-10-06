import React, { useEffect, useState } from 'react';
import { Cpu, Zap, Activity, AlertTriangle, ShieldCheck, CheckCircle2, ChevronRight, HelpCircle } from 'lucide-react';
import { api } from '../services/api';
import { SeverityBadge } from '../components/SeverityBadge';

export const AiDetection: React.FC = () => {
  const [metrics, setMetrics] = useState<any | null>(null);
  const [testEvents, setTestEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAiData = async () => {
      try {
        const [mRes, evRes] = await Promise.all([
          api.getModelMetrics(),
          api.getEvents({ limit: 12 }),
        ]);
        setMetrics(mRes);
        setTestEvents(evRes.events || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadAiData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-3 mb-3">
          <div>
            <h2 className="text-sm font-bold text-white font-mono uppercase tracking-wide flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              AI Detection Engine: Isolation Forest & Supervised Classification
            </h2>
            <p className="text-xs text-slate-400">
              Unsupervised anomaly detection paired with ensemble decision trees for zero-day & known attack identification
            </p>
          </div>
          <span className="text-xs font-mono px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-cyan-400 font-semibold">
            Pipeline: Isolation Forest + Random Forest
          </span>
        </div>

        {/* Mathematical Formulation Explainer */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 font-mono text-xs">
          <div className="p-3.5 rounded bg-slate-950 border border-slate-800 space-y-1.5">
            <div className="text-[11px] text-cyan-400 uppercase font-semibold">
              Isolation Forest Anomaly Scoring Formulation
            </div>
            <p className="text-slate-300 font-sans text-xs leading-relaxed">
              Calculates tree path length $E(h(x))$ relative to average BST unsuccessful search length $c(n)$:
            </p>
            <div className="p-2 rounded bg-slate-900 border border-slate-800 text-center text-cyan-300 font-bold text-xs">
              s(x, n) = 2^&#123;- E(h(x)) / c(n)&#125;
            </div>
            <p className="text-[11px] text-slate-400 font-sans">
              Score $s \to 1$: Highly anomalous (short path length). Score $s &lt; 0.5$: Normal baseline. Configured threshold $\tau = 0.55$.
            </p>
          </div>

          <div className="p-3.5 rounded bg-slate-950 border border-slate-800 space-y-1.5">
            <div className="text-[11px] text-teal-400 uppercase font-semibold">
              Ensemble Decision Fusion Logic
            </div>
            <div className="space-y-1 font-sans text-xs text-slate-300">
              <div className="flex items-center justify-between p-1 rounded bg-slate-900">
                <span>Anomaly = True & Classifier = Attack</span>
                <span className="font-mono text-rose-400 font-bold">HIGH Confidence Malicious</span>
              </div>
              <div className="flex items-center justify-between p-1 rounded bg-slate-900">
                <span>Anomaly = True & Classifier = Normal</span>
                <span className="font-mono text-amber-400 font-bold">Potential Unknown Anomaly</span>
              </div>
              <div className="flex items-center justify-between p-1 rounded bg-slate-900">
                <span>Anomaly = False & Rule Triggered</span>
                <span className="font-mono text-purple-400 font-bold">Known Signature Threat</span>
              </div>
              <div className="flex items-center justify-between p-1 rounded bg-slate-900">
                <span>Both Engines = Normal</span>
                <span className="font-mono text-emerald-400 font-bold">Clean Telemetry Flow</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section 56: Potential Unknown / Zero-Day-Like Behavior */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <h3 className="text-xs font-semibold text-white font-mono uppercase tracking-wider">
            Potential Unknown / Zero-Day-Like Anomaly Detection
          </h3>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed font-sans mb-4">
          Unsupervised Isolation Forest isolates data points purely through topological feature space partitions. 
          When an adversary deploys a novel variant or bypasses known static rule signatures, the anomaly score flags
          an extreme statistical outlier even when the supervised classifier cannot map it to an existing historical class.
        </p>

        <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800/80 font-mono text-xs">
          <div className="flex items-center justify-between text-slate-300 mb-2">
            <span className="font-semibold text-cyan-400">SOC Triage Rule for Unknown Behavior:</span>
            <span className="text-slate-400">Zero-Day Protocol Active</span>
          </div>
          <p className="text-slate-400 font-sans leading-relaxed text-xs">
            "Events flagged with Anomaly Score &gt; 0.65 without matching standard signatures are routed to Tier-3 Threat Hunting for immediate memory capture and behavioral containment."
          </p>
        </div>
      </div>

      {/* Live AI Inference Inspection Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
        <h3 className="text-xs font-semibold text-slate-300 font-mono uppercase tracking-wider mb-3">
          Live AI Inference & Decision Fusion Stream (Sample Feed)
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-slate-950 text-[11px] font-mono text-slate-400 uppercase border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Flow ID</th>
                <th className="py-2.5 px-3">Source Host</th>
                <th className="py-2.5 px-3">Anomaly Score s(x)</th>
                <th className="py-2.5 px-3">iForest Result</th>
                <th className="py-2.5 px-3">Classifier Category</th>
                <th className="py-2.5 px-3">Confidence</th>
                <th className="py-2.5 px-3">Composite AI Risk</th>
                <th className="py-2.5 px-3">Ensemble Decision</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
              {testEvents.map((ev) => {
                const isAnom = (ev.anomaly_score ?? 0.45) >= 0.55;
                return (
                  <tr key={ev.id} className="hover:bg-slate-800/40">
                    <td className="py-2.5 px-3 font-semibold text-cyan-400">{ev.id}</td>
                    <td className="py-2.5 px-3 text-slate-300">{ev.source_ip}</td>
                    <td className="py-2.5 px-3 text-white font-bold">
                      {ev.anomaly_score?.toFixed(2) ?? '0.42'}
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          isAnom
                            ? 'bg-rose-950 text-rose-400 border border-rose-800'
                            : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        }`}
                      >
                        {isAnom ? 'ANOMALOUS' : 'NORMAL'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-sans font-medium text-slate-200">
                      {ev.predicted_category || 'Normal'}
                    </td>
                    <td className="py-2.5 px-3 text-slate-300">
                      {ev.classifier_confidence ?? 92.4}%
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="text-amber-400 font-bold">{ev.ai_risk_score ?? 15}</span>
                      <span className="text-slate-500"> / 100</span>
                    </td>
                    <td className="py-2.5 px-3">
                      <SeverityBadge severity={ev.severity || 'LOW'} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
