import React from 'react';

interface SeverityBadgeProps {
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'NORMAL' | string;
  size?: 'sm' | 'md' | 'lg';
}

export const SeverityBadge: React.FC<SeverityBadgeProps> = ({ severity, size = 'sm' }) => {
  const sev = (severity || 'LOW').toUpperCase();

  const styles: Record<string, { bg: string; text: string; dot: string; border: string }> = {
    CRITICAL: {
      bg: 'bg-rose-950/40',
      text: 'text-rose-400',
      dot: 'bg-rose-500',
      border: 'border-rose-800/60',
    },
    HIGH: {
      bg: 'bg-orange-950/40',
      text: 'text-orange-400',
      dot: 'bg-orange-500',
      border: 'border-orange-800/60',
    },
    MEDIUM: {
      bg: 'bg-amber-950/40',
      text: 'text-amber-400',
      dot: 'bg-amber-500',
      border: 'border-amber-800/60',
    },
    LOW: {
      bg: 'bg-emerald-950/40',
      text: 'text-emerald-400',
      dot: 'bg-emerald-500',
      border: 'border-emerald-800/60',
    },
    NORMAL: {
      bg: 'bg-slate-900',
      text: 'text-slate-400',
      dot: 'bg-slate-500',
      border: 'border-slate-800',
    },
  };

  const current = styles[sev] || styles.NORMAL;
  const sizeClasses =
    size === 'sm'
      ? 'text-[11px] px-2 py-0.5'
      : size === 'md'
      ? 'text-xs px-2.5 py-1'
      : 'text-sm px-3 py-1.5 font-semibold';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono uppercase tracking-wider font-medium rounded border ${current.bg} ${current.text} ${current.border} ${sizeClasses}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${current.dot} shrink-0`} />
      {sev}
    </span>
  );
};
