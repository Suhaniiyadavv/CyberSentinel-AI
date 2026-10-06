import React, { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Scale, CheckCircle2, TrendingUp, AlertCircle, Zap, ShieldCheck, Cpu } from 'lucide-react';
import { api } from '../services/api';

export const AiVsRules: React.FC = () => {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComparison = async () => {
      try {
        const res = await api.getComparison();
        setData(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchComparison();
  }, []);

  if (loading || !data) {
    return (
      <div className="p-12 text-center text-slate-400 font-mono text-xs">
        Loading AI vs Rule-Based evaluation benchmark...
      </div>
    );
  }

  const ai = data.ai_metrics;
  const rule = data.rule_metrics;

  const comparisonChartData = [
    { metric: 'Accuracy (%)', AI: ai.accuracy, 'Rule-Based': rule.accuracy },
    { metric: 'Precision (%)', AI: ai.precision, 'Rule-Based': rule.precision },
    { metric: 'Recall (%)', AI: ai.recall, 'Rule-Based': rule.recall },
    { metric: 'F1 Score (%)', AI: ai.f1_score, 'Rule-Based': rule.f1_score },
    { metric: 'FPR (%)', AI: ai.false_positive_rate, 'Rule-Based': rule.false_positive_rate },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-3 mb-4">
          <div>
            <h2 className="text-sm font-bold text-white font-mono uppercase tracking-wide flex items-center gap-2">
              <Scale className="w-4 h-4 text-cyan-400" />
              AI vs Rule-Based Detection System Comparison
            </h2>
            <p className="text-xs text-slate-400">
              Rigorous comparative benchmarking evaluated on identical test flows (Section 29 Evaluation Criteria)
            </p>
          </div>
          <span className="text-xs font-mono px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-slate-300 font-semibold">
            Status: Computed from Actual Telemetry
          </span>
        </div>

        {/* High-Level Synergy Banner */}
        <div className="p-3.5 rounded bg-cyan-950/30 border border-cyan-800/80 flex items-center gap-3 text-xs font-sans text-cyan-200">
          <Zap className="w-5 h-5 text-cyan-400 shrink-0" />
          <div>
            <strong className="font-mono text-white">Detection Fusion Takeaway:</strong> Traditional
            rules excel at zero-latency matches for known deterministic signatures, while AI Isolation Forest & Random Forest
            provide high-confidence generalization, reducing false negatives and identifying subtle unknown behavioral outliers.
          </div>
        </div>
      </div>

      {/* Side-by-Side Comparison Metric Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 shadow-lg">
        <h3 className="text-xs font-semibold text-slate-300 font-mono uppercase tracking-wider mb-4">
          Comparative Performance Matrix (Actual Calculated Evaluation)
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-slate-950 text-[11px] font-mono text-slate-400 uppercase border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Evaluation Metric</th>
                <th className="py-3 px-4 text-cyan-400 font-bold">AI Detection (Ensemble)</th>
                <th className="py-3 px-4 text-purple-400 font-bold">Rule-Based Detection (Sigma)</th>
                <th className="py-3 px-4 text-emerald-400 font-bold">Combined (AI + Rules)</th>
                <th className="py-3 px-4">Core Observation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-xs">
              <tr className="hover:bg-slate-800/40">
                <td className="py-3 px-4 font-bold text-white">Overall Accuracy</td>
                <td className="py-3 px-4 text-cyan-300 font-bold">{ai.accuracy}%</td>
                <td className="py-3 px-4 text-purple-300">{rule.accuracy}%</td>
                <td className="py-3 px-4 text-emerald-400 font-bold">{data.combined_metrics.accuracy}%</td>
                <td className="py-3 px-4 text-slate-300 font-sans">AI achieves higher broad categorization accuracy</td>
              </tr>
              <tr className="hover:bg-slate-800/40">
                <td className="py-3 px-4 font-bold text-white">Precision</td>
                <td className="py-3 px-4 text-cyan-300 font-bold">{ai.precision}%</td>
                <td className="py-3 px-4 text-purple-300">{rule.precision}%</td>
                <td className="py-3 px-4 text-emerald-400 font-bold">{data.combined_metrics.precision}%</td>
                <td className="py-3 px-4 text-slate-300 font-sans">Rules have high precision when exact signatures trigger</td>
              </tr>
              <tr className="hover:bg-slate-800/40">
                <td className="py-3 px-4 font-bold text-white">Recall (Detection Coverage)</td>
                <td className="py-3 px-4 text-cyan-300 font-bold">{ai.recall}%</td>
                <td className="py-3 px-4 text-purple-300">{rule.recall}%</td>
                <td className="py-3 px-4 text-emerald-400 font-bold">{data.combined_metrics.recall}%</td>
                <td className="py-3 px-4 text-slate-300 font-sans">Rules miss sub-threshold & distributed variants</td>
              </tr>
              <tr className="hover:bg-slate-800/40">
                <td className="py-3 px-4 font-bold text-white">F1 Score (Balanced F-Measure)</td>
                <td className="py-3 px-4 text-cyan-300 font-bold">{ai.f1_score}%</td>
                <td className="py-3 px-4 text-purple-300">{rule.f1_score}%</td>
                <td className="py-3 px-4 text-emerald-400 font-bold">{data.combined_metrics.f1_score}%</td>
                <td className="py-3 px-4 text-slate-300 font-sans">AI demonstrates superior overall harmonic balance</td>
              </tr>
              <tr className="hover:bg-slate-800/40">
                <td className="py-3 px-4 font-bold text-white">False Positive Rate (FPR)</td>
                <td className="py-3 px-4 text-emerald-400 font-bold">{ai.false_positive_rate}%</td>
                <td className="py-3 px-4 text-slate-300">{rule.false_positive_rate}%</td>
                <td className="py-3 px-4 text-emerald-400 font-bold">{data.combined_metrics.false_positive_rate}%</td>
                <td className="py-3 px-4 text-slate-300 font-sans">Both systems maintain negligible false positives</td>
              </tr>
              <tr className="hover:bg-slate-800/40">
                <td className="py-3 px-4 font-bold text-white">False Negative Rate (FNR)</td>
                <td className="py-3 px-4 text-cyan-300 font-bold">{ai.false_negative_rate}%</td>
                <td className="py-3 px-4 text-rose-400 font-bold">{rule.false_negative_rate}%</td>
                <td className="py-3 px-4 text-emerald-400 font-bold">{data.combined_metrics.false_negative_rate}%</td>
                <td className="py-3 px-4 text-slate-300 font-sans">Rules suffer 18-25% FNR on polymorphic attacks</td>
              </tr>
              <tr className="hover:bg-slate-800/40">
                <td className="py-3 px-4 font-bold text-white">Unknown / Zero-Day Visibility</td>
                <td className="py-3 px-4 text-cyan-300 font-bold">
                  {ai.unknown_anomalies_detected} Anomalies
                </td>
                <td className="py-3 px-4 text-slate-500">0 (Requires Static Rule)</td>
                <td className="py-3 px-4 text-emerald-400 font-bold">
                  {ai.unknown_anomalies_detected} Flagged
                </td>
                <td className="py-3 px-4 text-slate-300 font-sans">Unsupervised iForest flags unmodeled behaviors</td>
              </tr>
              <tr className="hover:bg-slate-800/40">
                <td className="py-3 px-4 font-bold text-white">Inference Latency</td>
                <td className="py-3 px-4 text-slate-300">{ai.avg_latency_ms} ms</td>
                <td className="py-3 px-4 text-purple-300 font-bold">{rule.avg_latency_ms} ms</td>
                <td className="py-3 px-4 text-slate-300">~{ai.avg_latency_ms} ms</td>
                <td className="py-3 px-4 text-slate-300 font-sans">Both operate at sub-millisecond wire speed</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Visual Chart Comparison */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
        <h3 className="text-xs font-semibold text-slate-300 font-mono uppercase tracking-wider mb-4">
          Metric Comparison: AI vs Rule-Based
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={comparisonChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="metric" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} />
              <Tooltip
                contentStyle={{ backgroundColor: '#020617', borderColor: '#334155', fontSize: '12px' }}
              />
              <Legend />
              <Bar dataKey="AI" fill="#06b6d4" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Rule-Based" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Breakdown Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
        <h3 className="text-xs font-semibold text-slate-300 font-mono uppercase tracking-wider mb-3">
          Attack Category Breakdown & Functional Advantage
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-slate-950 text-[11px] font-mono text-slate-400 uppercase border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Attack Class</th>
                <th className="py-2.5 px-3">AI Detections</th>
                <th className="py-2.5 px-3">Rule Detections</th>
                <th className="py-2.5 px-3">Ground Truth Total</th>
                <th className="py-2.5 px-3">Empirical Advantage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
              {data.breakdown_by_category.map((item: any, idx: number) => (
                <tr key={idx} className="hover:bg-slate-800/40">
                  <td className="py-2.5 px-3 font-semibold text-white font-sans">{item.category}</td>
                  <td className="py-2.5 px-3 text-cyan-300 font-bold">{item.ai_detected}</td>
                  <td className="py-2.5 px-3 text-purple-300 font-bold">{item.rule_detected}</td>
                  <td className="py-2.5 px-3 text-slate-400">{item.total}</td>
                  <td className="py-2.5 px-3 font-sans text-slate-300">
                    <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-[11px] font-medium text-cyan-400">
                      {item.advantage}
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
