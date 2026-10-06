import React, { useState } from 'react';
import { Play, Pause, RotateCcw, AlertOctagon, Terminal, CheckCircle2, ChevronRight, Activity } from 'lucide-react';
import { api } from '../services/api';

interface Props {
  onEventProcessed?: () => void;
  onNotification?: (msg: string, type: 'info' | 'warn' | 'crit') => void;
}

export const LiveDemoController: React.FC<Props> = ({ onEventProcessed, onNotification }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState('Brute Force');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [currentStage, setCurrentStage] = useState<number>(0);
  const [lastIncidentId, setLastIncidentId] = useState<string | null>(null);

  const scenarios = [
    'Brute Force',
    'Port Scan',
    'DoS/DDoS',
    'Web Attack',
    'Infiltration & C2',
    'Normal Traffic',
  ];

  const stages = [
    'Event Ingestion',
    'AI Feature Extraction',
    'Isolation Forest Anomaly Check',
    'Random Forest Classification',
    'Sigma Rule Engine Evaluation',
    'IoC Identification & Extraction',
    'MITRE ATT&CK Mapping',
    'Response Recommendation Generated',
  ];

  const handleRunScenario = async (scenarioName = selectedScenario) => {
    setIsRunning(true);
    setStatusMessage(`Injecting simulated scenario: ${scenarioName}...`);
    setCurrentStage(1);

    try {
      // Step-by-step visual animation for viva demonstration
      setTimeout(() => setCurrentStage(2), 250);
      setTimeout(() => setCurrentStage(3), 500);
      setTimeout(() => setCurrentStage(4), 750);
      setTimeout(() => setCurrentStage(5), 1000);
      setTimeout(() => setCurrentStage(6), 1250);
      setTimeout(() => setCurrentStage(7), 1500);

      const res = await api.runScenario(scenarioName);
      if (res.results && res.results.length > 0) {
        const last = res.results[res.results.length - 1];
        if (last.incident) {
          setLastIncidentId(last.incident.id);
          setStatusMessage(
            `Detection Complete: ${last.incident.severity} Incident ${last.incident.id} generated (${last.incident.incident_type})`
          );
          onNotification?.(
            `Live Demo: ${last.incident.severity} ${last.incident.incident_type} detected from ${last.incident.source_ip}!`,
            last.incident.severity === 'CRITICAL' ? 'crit' : 'warn'
          );
        } else {
          setStatusMessage(`Processed ${res.eventsProcessed} benign event(s) — Telemetry classified as Normal.`);
          onNotification?.(`Live Demo: Benign flow verified clean.`, 'info');
        }
      }

      onEventProcessed?.();
    } catch (err: any) {
      setStatusMessage(`Simulation error: ${err.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  const handleReset = async () => {
    try {
      await api.resetDemo();
      setCurrentStage(0);
      setStatusMessage('Demo events cleared. Baseline models and configuration preserved.');
      setLastIncidentId(null);
      onEventProcessed?.();
      onNotification?.('Demo state reset. Baseline records restored.', 'info');
    } catch (err: any) {
      setStatusMessage(`Reset error: ${err.message}`);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 shadow-xl">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded bg-cyan-950/60 border border-cyan-800 text-cyan-400">
            <Activity className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              Live SOC Demonstration Controller
            </h3>
            <p className="text-xs text-slate-400">
              Trigger controlled adversary traffic to observe the end-to-end AI detection & mitigation lifecycle
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedScenario}
            onChange={(e) => setSelectedScenario(e.target.value)}
            className="bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded px-3 py-1.5 font-medium focus:outline-none focus:border-cyan-500"
          >
            {scenarios.map((sc) => (
              <option key={sc} value={sc}>
                Scenario: {sc}
              </option>
            ))}
          </select>

          <button
            onClick={() => handleRunScenario()}
            disabled={isRunning}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded bg-cyan-500 text-slate-950 hover:bg-cyan-400 disabled:opacity-50 transition-colors shadow-sm"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            {isRunning ? 'Simulating...' : 'START DEMO'}
          </button>

          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors"
            title="Reset demo generated events"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
        </div>
      </div>

      {/* Progress Pipeline Visualization */}
      <div className="mt-3">
        <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5 font-mono">
          <span>PIPELINE EXECUTION TRACE</span>
          <span>{currentStage > 0 ? `Stage ${currentStage} of 8` : 'Idle / Standby'}</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-1.5">
          {stages.map((stage, idx) => {
            const isCompleted = currentStage > idx + 1;
            const isCurrent = currentStage === idx + 1;
            return (
              <div
                key={stage}
                className={`p-1.5 rounded text-[10px] font-mono border transition-all ${
                  isCurrent
                    ? 'bg-cyan-950/80 border-cyan-400 text-cyan-200 animate-pulse'
                    : isCompleted
                    ? 'bg-emerald-950/30 border-emerald-800/60 text-emerald-400'
                    : 'bg-slate-950/50 border-slate-800 text-slate-500'
                }`}
              >
                <div className="flex items-center justify-between mb-0.5">
                  <span>{idx + 1}.</span>
                  {isCompleted && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                </div>
                <div className="truncate font-medium">{stage}</div>
              </div>
            );
          })}
        </div>

        {statusMessage && (
          <div className="mt-3 p-2 bg-slate-950 rounded border border-slate-800 flex items-center justify-between text-xs font-mono text-slate-300">
            <span className="flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              {statusMessage}
            </span>
            {lastIncidentId && (
              <span className="text-cyan-400 font-bold ml-2 shrink-0">
                Created: {lastIncidentId}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
