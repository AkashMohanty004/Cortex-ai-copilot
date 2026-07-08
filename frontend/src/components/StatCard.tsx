import React from 'react';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  unit: string;
  changePct: number;
  status: 'normal' | 'warning' | 'critical';
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  unit,
  changePct,
  status,
  icon: Icon
}) => {
  const getStatusColor = () => {
    switch (status) {
      case 'warning':
        return {
          border: 'border-amber-200 hover:border-amber-400',
          bg: 'bg-amber-50',
          text: 'text-amber-600',
          glow: 'glow-yellow'
        };
      case 'critical':
        return {
          border: 'border-red-200 hover:border-red-400',
          bg: 'bg-red-50',
          text: 'text-red-600',
          glow: 'glow-red'
        };
      case 'normal':
      default:
        return {
          border: 'border-slate-200 hover:border-cortex-copper',
          bg: 'bg-slate-50',
          text: 'text-cortex-copper',
          glow: ''
        };
    }
  };

  const statusColors = getStatusColor();
  const isPositive = changePct >= 0;

  return (
    <div className={`bg-white border ${statusColors.border} ${statusColors.glow} p-5 rounded-2xl transition-all duration-200 flex flex-col justify-between h-[135px] relative group overflow-hidden shadow-sm`}>
      {/* Background Hover Glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />

      <div className="flex justify-between items-start z-10">
        <div>
          <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">{title}</span>
          <h3 className="text-2xl font-bold font-mono tracking-tight mt-1 flex items-baseline gap-1 text-slate-900">
            {value} <span className="text-xs font-semibold text-slate-400">{unit}</span>
          </h3>
        </div>
        <div className={`p-2 rounded-xl ${statusColors.bg} border border-slate-100`}>
          <Icon className={`h-5 w-5 ${statusColors.text}`} />
        </div>
      </div>

      <div className="flex justify-between items-center mt-3 z-10">
        <div className="flex items-center gap-1">
          {changePct !== 0 ? (
            <>
              {isPositive ? (
                <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
              ) : (
                <TrendingDown className="h-3.5 w-3.5 text-red-600" />
              )}
              <span className={`text-xs font-mono font-semibold ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
                {isPositive ? '+' : ''}{changePct}%
              </span>
            </>
          ) : (
            <span className="text-xs font-mono font-semibold text-slate-400">0.00%</span>
          )}
          <span className="text-[9px] text-slate-400 font-mono ml-1">vs last reading</span>
        </div>

        {/* Small badge status */}
        <div className="flex items-center gap-1 text-[9px] font-semibold font-mono uppercase tracking-wider">
          {status === 'critical' && (
            <span className="text-red-600 flex items-center gap-1">
              <XCircle className="h-3.5 w-3.5 text-red-500" /> Critical
            </span>
          )}
          {status === 'warning' && (
            <span className="text-amber-600 flex items-center gap-1">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-500" /> Warn
            </span>
          )}
          {status === 'normal' && (
            <span className="text-emerald-600 flex items-center gap-1">
              <CheckCircle className="h-3.5 w-3.5 text-emerald-500" /> Nom
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
