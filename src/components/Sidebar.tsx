import React from 'react';
import {
  LayoutDashboard,
  Activity,
  Bell,
  AlertTriangle,
  Fingerprint,
  Grid,
  BarChart3,
  Cpu,
  FileCode,
  Scale,
  CheckSquare,
  Database,
  UploadCloud,
  ShieldAlert,
  ScrollText,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export type NavTab =
  | 'dashboard'
  | 'live-monitor'
  | 'alerts'
  | 'incidents'
  | 'iocs'
  | 'mitre'
  | 'analytics'
  | 'ai-detection'
  | 'rules'
  | 'ai-vs-rules'
  | 'ml-performance'
  | 'model-management'
  | 'datasets'
  | 'response-center'
  | 'audit-logs'
  | 'settings';

interface Props {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  stats?: {
    alertsCount?: number;
    incidentsCount?: number;
  };
}

export const Sidebar: React.FC<Props> = ({
  activeTab,
  onSelectTab,
  collapsed,
  onToggleCollapse,
  stats,
}) => {
  const navSections = [
    {
      title: 'OPERATIONS',
      items: [
        { id: 'dashboard' as NavTab, label: 'SOC Command Center', icon: LayoutDashboard },
        { id: 'live-monitor' as NavTab, label: 'Live Monitoring', icon: Activity, live: true },
        { id: 'alerts' as NavTab, label: 'Security Alerts', icon: Bell, badge: stats?.alertsCount },
        { id: 'incidents' as NavTab, label: 'Incidents & Cases', icon: AlertTriangle, badge: stats?.incidentsCount },
        { id: 'response-center' as NavTab, label: 'Response Center', icon: ShieldAlert },
      ],
    },
    {
      title: 'THREAT INTELLIGENCE',
      items: [
        { id: 'iocs' as NavTab, label: 'Indicators of Compromise', icon: Fingerprint },
        { id: 'mitre' as NavTab, label: 'MITRE ATT&CK Matrix', icon: Grid },
        { id: 'analytics' as NavTab, label: 'Analytics & EDA', icon: BarChart3 },
      ],
    },
    {
      title: 'DETECTION & ML ENGINES',
      items: [
        { id: 'ai-detection' as NavTab, label: 'AI Anomaly Engine', icon: Cpu },
        { id: 'rules' as NavTab, label: 'Sigma Rule Engine', icon: FileCode },
        { id: 'ai-vs-rules' as NavTab, label: 'AI vs Rule Comparison', icon: Scale },
        { id: 'ml-performance' as NavTab, label: 'ML Performance Metrics', icon: CheckSquare },
      ],
    },
    {
      title: 'DATA & SYSTEM',
      items: [
        { id: 'model-management' as NavTab, label: 'Model Versioning & Train', icon: Database },
        { id: 'datasets' as NavTab, label: 'Dataset Management', icon: UploadCloud },
        { id: 'audit-logs' as NavTab, label: 'SOC Audit Logs', icon: ScrollText },
        { id: 'settings' as NavTab, label: 'System Configuration', icon: Settings },
      ],
    },
  ];

  return (
    <aside
      className={`bg-slate-950 border-r border-slate-800 transition-all duration-200 flex flex-col shrink-0 select-none ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      <div className="flex-1 overflow-y-auto py-3 px-2 space-y-5">
        {navSections.map((sec) => (
          <div key={sec.title}>
            {!collapsed && (
              <div className="px-3 pb-1 text-[10px] font-mono font-semibold tracking-wider text-slate-400">
                {sec.title}
              </div>
            )}
            <div className="space-y-0.5">
              {sec.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onSelectTab(item.id)}
                    title={collapsed ? item.label : undefined}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded text-xs font-medium transition-colors text-left relative ${
                      isActive
                        ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-800/80 font-semibold shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 shrink-0 ${
                        isActive ? 'text-cyan-400' : 'text-slate-400'
                      }`}
                    />
                    {!collapsed && (
                      <span className="truncate flex-1">{item.label}</span>
                    )}

                    {!collapsed && item.live && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                    )}

                    {!collapsed && item.badge !== undefined && item.badge > 0 && (
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="p-2 border-t border-slate-800 flex justify-end">
        <button
          onClick={onToggleCollapse}
          className="p-1.5 rounded hover:bg-slate-900 text-slate-400 hover:text-slate-200 text-xs flex items-center gap-1 font-mono"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4" />
              <span className="text-[11px]">COLLAPSE</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
};
