import React, { useEffect, useState } from 'react';
import { Shield, Radio, Bell, LogOut, User as UserIcon, Terminal } from 'lucide-react';

interface Props {
  user: { name: string; email: string; role: string } | null;
  onLogout: () => void;
  activeIncidentsCount?: number;
  notificationMessage?: string | null;
}

export const Navbar: React.FC<Props> = ({ user, onLogout, activeIncidentsCount = 0, notificationMessage }) => {
  const [time, setTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toISOString().replace('T', ' ').substring(0, 19) + ' UTC'
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-14 bg-slate-950/95 border-b border-slate-800 px-4 flex items-center justify-between sticky top-0 z-30 backdrop-blur">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Shield className="w-4 h-4 text-slate-950 font-bold" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold tracking-tight text-white font-mono">
                CYBERSENTINEL<span className="text-cyan-400">.AI</span>
              </span>
            </div>
            <p className="text-[10px] text-slate-400 hidden sm:block">
              Cyber Incident Detection & Automated Response
            </p>
          </div>
        </div>

        <div className="h-6 w-px bg-slate-800 mx-2 hidden md:block" />

        <div className="hidden lg:flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-950/30 border border-emerald-900/60 px-2.5 py-1 rounded">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
          <span>SOC STATUS: ACTIVE TELEMETRY INGESTION</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {notificationMessage && (
          <div className="hidden xl:flex items-center gap-2 text-xs font-mono text-cyan-300 bg-cyan-950/60 border border-cyan-800 px-3 py-1 rounded animate-pulse">
            <Terminal className="w-3.5 h-3.5" />
            <span className="truncate max-w-xs">{notificationMessage}</span>
          </div>
        )}

        <div className="text-xs font-mono text-slate-400 hidden sm:block">
          {time}
        </div>

        {/* User profile */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-medium text-slate-200">{user?.name || 'Suhani Yadav'}</div>
            <div className="text-[10px] font-mono text-slate-400">{user?.role || 'Lead Analyst'}</div>
          </div>
          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
            <UserIcon className="w-4 h-4" />
          </div>

          <button
            onClick={onLogout}
            className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition-colors ml-1"
            title="Log out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
