import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar, NavTab } from './components/Sidebar';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { LiveMonitor } from './pages/LiveMonitor';
import { Alerts } from './pages/Alerts';
import { Incidents } from './pages/Incidents';
import { IoCs } from './pages/IoCs';
import { MitreAttack } from './pages/MitreAttack';
import { Analytics } from './pages/Analytics';
import { AiDetection } from './pages/AiDetection';
import { RuleEngine } from './pages/RuleEngine';
import { AiVsRules } from './pages/AiVsRules';
import { MlPerformance } from './pages/MlPerformance';
import { ModelManagement } from './pages/ModelManagement';
import { DatasetManagement } from './pages/DatasetManagement';
import { ResponseCenter } from './pages/ResponseCenter';
import { AuditLogs } from './pages/AuditLogs';
import { Settings } from './pages/Settings';
import { api } from './services/api';

export function App() {
  const [user, setUser] = useState<{ id: string; name: string; email: string; role: string } | null>(
    null
  );
  const [token, setToken] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [collapsed, setCollapsed] = useState(false);
  const [notification, setNotification] = useState<{ msg: string; type: 'info' | 'warn' | 'crit' } | null>(
    null
  );
  const [stats, setStats] = useState<{ alertsCount?: number; incidentsCount?: number }>({});

  // Verify auth on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('cybersentinel_token');
    const savedEmail = localStorage.getItem('cybersentinel_email');
    if (savedToken) {
      setToken(savedToken);
      setUser({
        id: 'usr-1',
        name: 'Suhani Yadav',
        email: savedEmail || 'demo@cybersentinel.ai',
        role: 'Lead Incident Responder',
      });
    }
  }, []);

  const refreshBadges = async () => {
    try {
      const dash = await api.getDashboardStats();
      if (dash) {
        setStats({
          alertsCount: dash.suspiciousEvents,
          incidentsCount: dash.activeIncidents,
        });
      }
    } catch (e) {
      // Ignore
    }
  };

  useEffect(() => {
    if (user) {
      refreshBadges();
      const interval = setInterval(refreshBadges, 10000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleLoginSuccess = (userData: any, userToken: string) => {
    setUser(userData);
    setToken(userToken);
    setActiveTab('dashboard');
  };

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch (e) {
      // ignore
    }
    localStorage.removeItem('cybersentinel_token');
    localStorage.removeItem('cybersentinel_email');
    setUser(null);
    setToken(null);
  };

  const showNotification = (msg: string, type: 'info' | 'warn' | 'crit' = 'info') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 6000);
  };

  // If not authenticated, show cybersecurity login
  if (!user) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none antialiased">
      {/* Top SOC Navbar */}
      <Navbar
        user={user}
        onLogout={handleLogout}
        activeIncidentsCount={stats.incidentsCount}
        notificationMessage={notification?.msg}
      />

      {/* Main Workspace: Sidebar + Content */}
      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed(!collapsed)}
          stats={stats}
        />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-950/90 relative">
          {activeTab === 'dashboard' && (
            <Dashboard onNavigate={setActiveTab} onNotification={showNotification} />
          )}
          {activeTab === 'live-monitor' && <LiveMonitor />}
          {activeTab === 'alerts' && <Alerts />}
          {activeTab === 'incidents' && <Incidents />}
          {activeTab === 'iocs' && <IoCs />}
          {activeTab === 'mitre' && <MitreAttack />}
          {activeTab === 'analytics' && <Analytics />}
          {activeTab === 'ai-detection' && <AiDetection />}
          {activeTab === 'rules' && <RuleEngine />}
          {activeTab === 'ai-vs-rules' && <AiVsRules />}
          {activeTab === 'ml-performance' && <MlPerformance />}
          {activeTab === 'model-management' && <ModelManagement />}
          {activeTab === 'datasets' && <DatasetManagement />}
          {activeTab === 'response-center' && <ResponseCenter />}
          {activeTab === 'audit-logs' && <AuditLogs />}
          {activeTab === 'settings' && <Settings />}
        </main>
      </div>
    </div>
  );
}

export default App;
