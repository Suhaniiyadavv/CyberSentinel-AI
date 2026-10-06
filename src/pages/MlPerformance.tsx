import React, { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { CheckSquare, Cpu, Layers, Award, BarChart2, RefreshCw } from 'lucide-react';
import { api } from '../services/api';

export const MlPerformance: React.FC = () => {
  const [metrics, setMetrics] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMetrics = async () => {
    try {
      const res = await api.getModelMetrics();
      setMetrics(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  if (loading || !metrics) {
    return (
      <div className="p-12 text-center text-slate-400 font-mono text-xs">
        Loading ML performance metrics...
      </div>
    );
  }

  const featureChartData = (metrics.feature_importances || []).slice(0, 10).map((f: any) => ({
    name: f.feature,
    importance: f.importance,
    description: f.description,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-3 mb-4">
          <div>
            <h2 className="text-sm font-bold text-white font-mono uppercase tracking-wide flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-cyan-400" />
              Machine Learning Model Performance & Validation Metrics
            </h2>
            <p className="text-xs text-slate-400">
              Validated on held-out security event test set (Section 30 Evaluation Criteria)
            </p>
          </div>
          <div className="text-right font-mono text-xs text-slate-400">
            <div>Model: <strong className="text-cyan-400">{metrics.algorithm}</strong></div>
            <div>Version: <span className="text-slate-300">{metrics.version}</span></div>
          </div>
        </div>

        {/* Primary Metrics Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-3 font-mono text-xs">
          <div className="p-3 rounded bg-slate-950 border border-slate-800">
            <span className="text-slate-400 text-[10px] uppercase block">Accuracy</span>
            <span className="text-cyan-300 font-bold text-lg">{metrics.accuracy}%</span>
          </div>
          <div className="p-3 rounded bg-slate-950 border border-slate-800">
            <span className="text-slate-400 text-[10px] uppercase block">Precision</span>
            <span className="text-white font-bold text-lg">{metrics.precision}%</span>
          </div>
          <div className="p-3 rounded bg-slate-950 border border-slate-800">
            <span className="text-slate-400 text-[10px] uppercase block">Recall</span>
            <span className="text-emerald-400 font-bold text-lg">{metrics.recall}%</span>
          </div>
          <div className="p-3 rounded bg-slate-950 border border-slate-800">
            <span className="text-slate-400 text-[10px] uppercase block">F1-Score</span>
            <span className="text-cyan-400 font-bold text-lg">{metrics.f1_score}%</span>
          </div>
          <div className="p-3 rounded bg-slate-950 border border-slate-800">
            <span className="text-slate-400 text-[10px] uppercase block">False Pos Rate</span>
            <span className="text-emerald-400 font-bold text-lg">{metrics.false_positive_rate}%</span>
          </div>
          <div className="p-3 rounded bg-slate-950 border border-slate-800">
            <span className="text-slate-400 text-[10px] uppercase block">False Neg Rate</span>
            <span className="text-amber-400 font-bold text-lg">{metrics.false_negative_rate}%</span>
          </div>
          <div className="p-3 rounded bg-slate-950 border border-slate-800">
            <span className="text-slate-400 text-[10px] uppercase block">AUC-ROC</span>
            <span className="text-teal-300 font-bold text-lg">{metrics.auc_roc}</span>
          </div>
        </div>
      </div>

      {/* Feature Importance (Top MDI Features) */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
        <h3 className="text-xs font-semibold text-slate-300 font-mono uppercase tracking-wider mb-2">
          Random Forest Feature Importance (Mean Decrease in Impurity - MDI)
        </h3>
        <p className="text-xs text-slate-400 font-sans mb-4">
          Identifies the most discriminative telemetry signals used by decision trees to separate attacks from normal flows.
        </p>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={featureChartData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis type="number" stroke="#94a3b8" fontSize={10} unit="%" />
              <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={10} width={150} />
              <Tooltip
                contentStyle={{ backgroundColor: '#020617', borderColor: '#334155', fontSize: '12px' }}
                formatter={(val: any) => [`${val}%`, 'Importance Weight']}
              />
              <Bar dataKey="importance" fill="#06b6d4" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Confusion Matrix (Actual vs Predicted) */}
      {metrics.confusion_matrix && (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
          <h3 className="text-xs font-semibold text-slate-300 font-mono uppercase tracking-wider mb-2">
            Multi-Class Confusion Matrix (Actual vs Predicted)
          </h3>
          <p className="text-xs text-slate-400 font-sans mb-4">
            Diagonal cells indicate correct classifications (True Positives); off-diagonal represent misclassifications.
          </p>

          <div className="overflow-x-auto">
            <table className="text-center text-xs font-mono border-collapse">
              <thead>
                <tr>
                  <th className="p-2 border border-slate-800 bg-slate-950 text-slate-400 text-[10px] uppercase">
                    Actual \ Predicted
                  </th>
                  {metrics.confusion_matrix.classes.map((cls: string) => (
                    <th
                      key={cls}
                      className="p-2 border border-slate-800 bg-slate-950 text-slate-300 text-[10px] uppercase whitespace-nowrap"
                    >
                      {cls}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {metrics.confusion_matrix.classes.map((actualCls: string, rIdx: number) => (
                  <tr key={actualCls}>
                    <td className="p-2 border border-slate-800 bg-slate-950 text-slate-300 font-semibold text-left whitespace-nowrap text-[11px]">
                      {actualCls}
                    </td>
                    {metrics.confusion_matrix.classes.map((_predCls: string, cIdx: number) => {
                      const count = metrics.confusion_matrix.matrix[rIdx]?.[cIdx] ?? 0;
                      const isDiagonal = rIdx === cIdx;
                      return (
                        <td
                          key={cIdx}
                          className={`p-2 border border-slate-800 text-xs font-bold ${
                            isDiagonal
                              ? count > 0
                                ? 'bg-emerald-950/40 text-emerald-300 border-emerald-900'
                                : 'text-slate-500'
                              : count > 0
                              ? 'bg-rose-950/40 text-rose-300'
                              : 'text-slate-600'
                          }`}
                        >
                          {count}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Classification Report per Class Table */}
      {metrics.classification_report && (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
          <h3 className="text-xs font-semibold text-slate-300 font-mono uppercase tracking-wider mb-3">
            Detailed Classification Report per Attack Category
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-slate-950 text-[11px] font-mono text-slate-400 uppercase border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Precision (%)</th>
                  <th className="py-2.5 px-3">Recall (%)</th>
                  <th className="py-2.5 px-3">F1-Score (%)</th>
                  <th className="py-2.5 px-3">Support (Test Samples)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                {metrics.classification_report.map((rep: any) => (
                  <tr key={rep.category} className="hover:bg-slate-800/40">
                    <td className="py-2.5 px-3 font-semibold text-white font-sans">{rep.category}</td>
                    <td className="py-2.5 px-3 text-cyan-300">{rep.precision}%</td>
                    <td className="py-2.5 px-3 text-emerald-300">{rep.recall}%</td>
                    <td className="py-2.5 px-3 text-amber-300 font-bold">{rep.f1}%</td>
                    <td className="py-2.5 px-3 text-slate-400">{rep.support}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
