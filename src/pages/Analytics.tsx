import React, { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { BarChart3, Database, Shield, Radio, Activity } from 'lucide-react';
import { api } from '../services/api';

const COLORS = ['#06b6d4', '#f43f5e', '#f59e0b', '#10b981', '#8b5cf6', '#ec4899', '#3b82f6'];

export const Analytics: React.FC = () => {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.getAnalytics();
        setData(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading || !data) {
    return (
      <div className="p-12 text-center text-slate-400 font-mono text-xs">
        Loading analytics telemetry...
      </div>
    );
  }

  const normalVsMalicious = [
    { name: 'Normal Traffic', value: data.normalEvents },
    { name: 'Malicious Flows', value: data.maliciousEvents },
  ];

  return (
    <div className="space-y-6">
      {/* Header & Dataset Summary KPI Strip */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4 border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-sm font-bold text-white font-mono uppercase tracking-wide flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-cyan-400" />
              Exploratory Data Analysis (EDA) & Security Telemetry
            </h2>
            <p className="text-xs text-slate-400">
              Statistical distributions across network flows, port frequencies, and attack profiles
            </p>
          </div>
          <span className="text-xs font-mono px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-slate-300">
            Source: CIC-IDS2017 & NSL-KDD Ingested Stream
          </span>
        </div>

        {/* Dataset Statistics Strip */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3 font-mono text-xs">
          <div className="p-3 rounded bg-slate-950 border border-slate-800">
            <span className="text-slate-400 text-[10px] uppercase block">Total Records</span>
            <span className="text-white font-bold text-base">{data.totalRecords}</span>
          </div>
          <div className="p-3 rounded bg-slate-950 border border-slate-800">
            <span className="text-slate-400 text-[10px] uppercase block">Normal Flows</span>
            <span className="text-emerald-400 font-bold text-base">{data.normalEvents}</span>
          </div>
          <div className="p-3 rounded bg-slate-950 border border-slate-800">
            <span className="text-slate-400 text-[10px] uppercase block">Malicious Flows</span>
            <span className="text-rose-400 font-bold text-base">{data.maliciousEvents}</span>
          </div>
          <div className="p-3 rounded bg-slate-950 border border-slate-800">
            <span className="text-slate-400 text-[10px] uppercase block">Unique Source IPs</span>
            <span className="text-cyan-400 font-bold text-base">{data.uniqueSourceIps}</span>
          </div>
          <div className="p-3 rounded bg-slate-950 border border-slate-800">
            <span className="text-slate-400 text-[10px] uppercase block">Unique Target IPs</span>
            <span className="text-slate-200 font-bold text-base">{data.uniqueDestinationIps}</span>
          </div>
          <div className="p-3 rounded bg-slate-950 border border-slate-800">
            <span className="text-slate-400 text-[10px] uppercase block">Missing / Inf Values</span>
            <span className="text-emerald-400 font-bold text-base">0 (Sanitized)</span>
          </div>
        </div>
      </div>

      {/* Row 1 Charts: Normal vs Malicious & Attacks by Category */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Normal vs Malicious Pie */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
          <h3 className="text-xs font-semibold text-slate-300 font-mono uppercase tracking-wider mb-4">
            Class Distribution: Normal vs Malicious Traffic
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={normalVsMalicious}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${((percent || 0) * 100).toFixed(1)}%)`}
                >
                  <Cell fill="#10b981" />
                  <Cell fill="#f43f5e" />
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#020617', borderColor: '#334155', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Attacks by Category Bar */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
          <h3 className="text-xs font-semibold text-slate-300 font-mono uppercase tracking-wider mb-4">
            Attacks Classified by Category
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.attackCategoryDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#020617', borderColor: '#334155', fontSize: '12px' }}
                />
                <Bar dataKey="value" fill="#06b6d4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 2 Charts: Events Over Time & Top Destination Ports */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Events Over Time */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
          <h3 className="text-xs font-semibold text-slate-300 font-mono uppercase tracking-wider mb-4">
            Flow Rate & Alert Volume Over Time
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.timeTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#94a3b8" fontSize={10} />
                <YAxis stroke="#94a3b8" fontSize={10} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#020617', borderColor: '#334155', fontSize: '12px' }}
                />
                <Legend />
                <Line type="monotone" dataKey="normal" stroke="#10b981" strokeWidth={2} name="Normal" />
                <Line type="monotone" dataKey="malicious" stroke="#f43f5e" strokeWidth={2} name="Malicious" />
                <Line type="monotone" dataKey="alerts" stroke="#f59e0b" strokeWidth={2} strokeDasharray="3 3" name="Alerts" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Destination Ports Bar */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
          <h3 className="text-xs font-semibold text-slate-300 font-mono uppercase tracking-wider mb-4">
            Target Destination Port Distribution
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.topDestinationPorts}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="port" stroke="#94a3b8" fontSize={10} />
                <YAxis stroke="#94a3b8" fontSize={10} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#020617', borderColor: '#334155', fontSize: '12px' }}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 3 Charts: Top Source IPs & Protocol Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Source IPs */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
          <h3 className="text-xs font-semibold text-slate-300 font-mono uppercase tracking-wider mb-4">
            Top Active Source Host IPs
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.topSourceIps} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis type="number" stroke="#94a3b8" fontSize={10} />
                <YAxis dataKey="ip" type="category" stroke="#94a3b8" fontSize={10} width={110} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#020617', borderColor: '#334155', fontSize: '12px' }}
                />
                <Bar dataKey="count" fill="#8b5cf6" name="Total Flows" />
                <Bar dataKey="malicious" fill="#f43f5e" name="Malicious Flows" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Severity Distribution */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
          <h3 className="text-xs font-semibold text-slate-300 font-mono uppercase tracking-wider mb-4">
            Alert Severity Tiers Breakdown
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.severityDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} />
                <YAxis stroke="#94a3b8" fontSize={10} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#020617', borderColor: '#334155', fontSize: '12px' }}
                />
                <Bar dataKey="value" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
