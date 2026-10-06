import React from 'react';
import { Cpu, ShieldCheck, Zap } from 'lucide-react';

interface Props {
  source: 'AI' | 'RULE' | 'AI + RULE' | string;
}

export const DetectionSourceBadge: React.FC<Props> = ({ source }) => {
  if (source === 'AI + RULE') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-mono font-medium rounded border border-cyan-800/80 bg-cyan-950/40 text-cyan-300">
        <Zap className="w-3 h-3 text-cyan-400" />
        AI + RULE
      </span>
    );
  }
  if (source === 'RULE') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-mono font-medium rounded border border-purple-800/80 bg-purple-950/40 text-purple-300">
        <ShieldCheck className="w-3 h-3 text-purple-400" />
        RULE
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-mono font-medium rounded border border-teal-800/80 bg-teal-950/40 text-teal-300">
      <Cpu className="w-3 h-3 text-teal-400" />
      AI MODEL
    </span>
  );
};
