import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useCustomer } from '../context/CustomerContext';
import apiClient from '../api/client';
import { StatCard } from '../components/StatCard';
import { 
  Zap, 
  Activity, 
  TrendingUp, 
  Gauge, 
  Flame, 
  Cpu, 
  AlertTriangle, 
  RefreshCw, 
  FileSpreadsheet
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

interface MetricSummary {
  current: number;
  change_pct: number;
  status: 'normal' | 'warning' | 'critical';
}

interface Alert {
  id: string;
  customer_id: string;
  timestamp: string;
  severity: string;
  source: string;
  message: string;
  status: string;
  value: string;
}

interface DashboardSummaryData {
  customer_id: string;
  voltage: MetricSummary;
  current: MetricSummary;
  power: MetricSummary;
  power_factor: MetricSummary;
  frequency: MetricSummary;
  energy: MetricSummary;
  active_alerts_count: number;
  health_score: number;
  recent_alerts: Alert[];
}

interface ChartPoint {
  timestamp: string;
  voltage: number;
  current: number;
  power: number;
  power_factor: number;
  frequency: number;
  energy: number;
  temperature: number;
}

interface DashboardChartsData {
  customer_id: string;
  data: ChartPoint[];
}

export const Dashboard: React.FC = () => {
  const { selectedCustomerId, selectedCustomer } = useCustomer();
  const [activeChartTab, setActiveChartTab] = useState<'power' | 'voltage' | 'current' | 'temperature'>('power');

  // Fetch Summary
  const { 
    data: summary, 
    isLoading: summaryLoading, 
    isError: summaryError, 
    error: summaryErrObj,
    refetch: refetchSummary 
  } = useQuery<DashboardSummaryData>({
    queryKey: ['dashboardSummary', selectedCustomerId],
    queryFn: async () => {
      if (!selectedCustomerId) throw new Error('No facility selected');
      const res = await apiClient.get<DashboardSummaryData>(`/dashboard/summary?customer_id=${selectedCustomerId}`);
      return res.data;
    },
    enabled: !!selectedCustomerId,
    refetchInterval: 10000,
  });

  // Fetch Charts
  const { 
    data: charts, 
    isLoading: chartsLoading, 
    isError: chartsError,
    refetch: refetchCharts
  } = useQuery<DashboardChartsData>({
    queryKey: ['dashboardCharts', selectedCustomerId],
    queryFn: async () => {
      if (!selectedCustomerId) throw new Error('No facility selected');
      const res = await apiClient.get<DashboardChartsData>(`/dashboard/charts?customer_id=${selectedCustomerId}&limit=30`);
      return res.data;
    },
    enabled: !!selectedCustomerId,
    refetchInterval: 10000,
  });

  // Fetch Telemetry History
  const { 
    data: history,
    isLoading: historyLoading,
    refetch: refetchHistory
  } = useQuery<any[]>({
    queryKey: ['customerHistory', selectedCustomerId],
    queryFn: async () => {
      if (!selectedCustomerId) throw new Error('No facility selected');
      const res = await apiClient.get<any[]>(`/customers/${selectedCustomerId}/history?limit=10`);
      return res.data;
    },
    enabled: !!selectedCustomerId,
  });

  const handleRetry = () => {
    refetchSummary();
    refetchCharts();
    refetchHistory();
  };

  // Loading skeleton state
  if (summaryLoading || chartsLoading || historyLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        {/* Header Skeleton */}
        <div className="h-10 bg-slate-200 border border-slate-300 rounded-xl w-1/3" />
        
        {/* Stat Cards Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-[135px] bg-slate-200 border border-slate-300 rounded-xl" />
          ))}
        </div>

        {/* Charts & Alerts Row Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-[400px] bg-slate-200 border border-slate-300 rounded-xl" />
          <div className="h-[400px] bg-slate-200 border border-slate-300 rounded-xl" />
        </div>
      </div>
    );
  }

  // Error state
  if (summaryError || chartsError) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-center p-6 bg-white border border-slate-200 rounded-2xl max-w-2xl mx-auto shadow-sm">
        <AlertTriangle className="h-16 w-16 text-red-500 mb-4 animate-bounce" />
        <h3 className="text-xl font-bold text-slate-900">Database Fetch Interrupted</h3>
        <p className="text-sm text-slate-500 mt-2 max-w-md">
          {summaryErrObj instanceof Error ? summaryErrObj.message : 'Could not pull the latest grid statistics from Supabase.'}
        </p>
        <button 
          onClick={handleRetry}
          className="mt-6 flex items-center gap-2 px-5 py-2.5 bg-cortex-copper hover:bg-cortex-copper-hover text-white font-semibold rounded-lg text-sm transition-all cursor-pointer shadow-md shadow-cortex-copper/25"
        >
          <RefreshCw className="h-4 w-4" /> Retry Connection
        </button>
      </div>
    );
  }

  if (!summary || !charts) {
    return (
      <div className="text-center p-12 bg-white border border-slate-200 rounded-xl shadow-sm">
        <p className="text-slate-500">No telemetry data recorded yet for this facility.</p>
      </div>
    );
  }

  const getChartConfig = () => {
    switch (activeChartTab) {
      case 'voltage':
        return {
          dataKey: 'voltage',
          color: '#10b981',
          name: 'Line-to-Line Voltage (V)',
          domain: [380, 420]
        };
      case 'current':
        return {
          dataKey: 'current',
          color: '#f59e0b',
          name: 'Phase Current Average (A)',
          domain: [400, 800]
        };
      case 'temperature':
        return {
          dataKey: 'temperature',
          color: '#dc2626',
          name: 'Transformer Temp (°C)',
          domain: [20, 60]
        };
      case 'power':
      default:
        return {
          dataKey: 'power',
          color: '#b8673d',
          name: 'Active Power Consumption (kW)',
          domain: [200, 600]
        };
    }
  };

  const chartConfig = getChartConfig();

  return (
    <div className="space-y-6">
      
      {/* Top Banner Overview (Premium Dark Slate Header Banner style matching website screenshot) */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl relative overflow-hidden text-white shadow-lg">
        <div className="absolute inset-y-0 right-0 w-64 bg-gradient-to-l from-cortex-copper/20 to-transparent pointer-events-none" />
        <div className="z-10">
          <h2 className="text-xl font-bold tracking-tight text-white mb-1">
            {selectedCustomer ? selectedCustomer.name : 'Facility Dashboard'}
          </h2>
          <p className="text-sm text-slate-300">
            {selectedCustomer ? selectedCustomer.location : 'Loading location...'} • Industrial Grid Monitoring
          </p>
        </div>
        <div className="flex gap-6 z-10 font-mono">
          <div className="text-left">
            <span className="text-[10px] text-slate-400 uppercase tracking-widest block">Operational Health</span>
            <span className={`text-xl font-bold ${summary.health_score > 90 ? 'text-emerald-400' : summary.health_score > 75 ? 'text-amber-400' : 'text-red-400'}`}>
              {summary.health_score}%
            </span>
          </div>
          <div className="w-[1px] bg-slate-800" />
          <div className="text-left">
            <span className="text-[10px] text-slate-400 uppercase tracking-widest block">Active Alerts</span>
            <span className={`text-xl font-bold ${summary.active_alerts_count > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
              {summary.active_alerts_count}
            </span>
          </div>
        </div>
      </div>

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          title="Voltage L-L"
          value={summary.voltage.current}
          unit="V"
          changePct={summary.voltage.change_pct}
          status={summary.voltage.status}
          icon={Gauge}
        />
        <StatCard
          title="Phase Current"
          value={summary.current.current}
          unit="A"
          changePct={summary.current.change_pct}
          status={summary.current.status}
          icon={Activity}
        />
        <StatCard
          title="Active Power"
          value={summary.power.current}
          unit="kW"
          changePct={summary.power.change_pct}
          status={summary.power.status}
          icon={Zap}
        />
        <StatCard
          title="Power Factor"
          value={summary.power_factor.current}
          unit="PF"
          changePct={summary.power_factor.change_pct}
          status={summary.power_factor.status}
          icon={TrendingUp}
        />
        <StatCard
          title="Grid Frequency"
          value={summary.frequency.current}
          unit="Hz"
          changePct={summary.frequency.change_pct}
          status={summary.frequency.status}
          icon={Cpu}
        />
        <StatCard
          title="Energy Today"
          value={summary.energy.current}
          unit="kWh"
          changePct={summary.energy.change_pct}
          status={summary.energy.status}
          icon={Flame}
        />
      </div>

      {/* Charts & Alerts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Telemetry Line Chart */}
        <div className="lg:col-span-2 bg-white border border-slate-200 p-6 rounded-2xl flex flex-col justify-between h-[420px] shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Historical Grid Trends</h3>
              <p className="text-xs text-slate-500 mt-0.5">Real-time polling (10-second intervals)</p>
            </div>
            
            {/* Chart Metric Selectors */}
            <div className="bg-slate-100 border border-slate-200 p-1 rounded-xl flex gap-1 font-mono text-[10px] font-bold">
              {(['power', 'voltage', 'current', 'temperature'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveChartTab(tab)}
                  className={`px-3 py-1.5 rounded-lg uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                    activeChartTab === tab 
                      ? 'bg-cortex-copper text-white shadow-sm' 
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 w-full mt-6 text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts.data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={chartConfig.color} stopOpacity={0.2}/>
                    <stop offset="95%" stopColor={chartConfig.color} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(15,23,42,0.05)" vertical={false} />
                <XAxis 
                  dataKey="timestamp" 
                  stroke="rgba(15,23,42,0.4)" 
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 10, fontFamily: 'monospace', fill: '#64748b' }}
                />
                <YAxis 
                  stroke="rgba(15,23,42,0.4)" 
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 10, fontFamily: 'monospace', fill: '#64748b' }}
                  domain={chartConfig.domain}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#ffffff', 
                    borderColor: '#e2e8f0', 
                    borderRadius: '12px', 
                    color: '#0f172a',
                    fontFamily: 'monospace',
                    fontSize: '11px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
                  }}
                  itemStyle={{ color: chartConfig.color }}
                  cursor={{ stroke: 'rgba(15,23,42,0.1)' }}
                />
                <Area 
                  type="monotone" 
                  dataKey={chartConfig.dataKey} 
                  name={chartConfig.name}
                  stroke={chartConfig.color} 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#chartGradient)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Alerts Panel */}
        <div className="bg-white border border-slate-200 p-6 rounded-2xl flex flex-col h-[420px] overflow-hidden shadow-sm">
          <div className="border-b border-slate-100 pb-4 flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Facility Alerts</h3>
              <p className="text-xs text-slate-500 mt-0.5">Real-time safety diagnostic log</p>
            </div>
            <span className="text-[10px] font-mono px-2 py-1 bg-slate-50 border border-slate-200 text-slate-600 rounded-lg">
              Logs
            </span>
          </div>

          <div className="flex-1 overflow-y-auto mt-4 space-y-3.5 pr-1">
            {summary.recent_alerts.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center text-slate-400">
                <p className="text-xs">No active alerts recorded.</p>
                <p className="text-[10px] text-slate-400/80 mt-1 font-mono">System running within limits</p>
              </div>
            ) : (
              summary.recent_alerts.map((alert) => (
                <div 
                  key={alert.id} 
                  className={`p-3.5 rounded-xl border bg-slate-50/50 flex gap-3 transition-all duration-200 ${
                    alert.severity === 'Critical' 
                      ? 'border-red-200 hover:border-red-300 hover:bg-red-50/10' 
                      : 'border-amber-200 hover:border-amber-300 hover:bg-amber-50/10'
                  }`}
                >
                  <AlertTriangle className={`h-5 w-5 shrink-0 ${
                    alert.severity === 'Critical' ? 'text-red-500' : 'text-amber-500'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline gap-2">
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${
                        alert.severity === 'Critical' ? 'text-red-600' : 'text-amber-700'
                      }`}>
                        {alert.severity} • {alert.source}
                      </span>
                      <span className="text-[9px] text-slate-400 font-mono shrink-0">
                        {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-800 mt-1 font-medium leading-relaxed">
                      {alert.message}
                    </p>
                    {alert.value && (
                      <span className="inline-block mt-1.5 text-[10px] font-semibold bg-white border border-slate-200 text-slate-600 px-2 py-0.5 rounded-lg font-mono">
                        Value: {alert.value}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Latest Readings Table */}
      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4 mb-6">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Latest Telemetry Readings</h3>
            <p className="text-xs text-slate-500 mt-0.5">Raw parameter logs stored in database</p>
          </div>
          <button className="flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider text-cortex-copper hover:text-white border border-cortex-copper/30 hover:border-cortex-copper px-3 py-1.5 rounded-lg transition-all duration-200 cursor-pointer bg-cortex-copper/5 hover:bg-cortex-copper">
            <FileSpreadsheet className="h-3.5 w-3.5" /> Export Logs
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="py-3 px-4 font-semibold">Timestamp</th>
                <th className="py-3 px-4 font-semibold text-right">Voltage (V)</th>
                <th className="py-3 px-4 font-semibold text-right">Current (A)</th>
                <th className="py-3 px-4 font-semibold text-right">Power (kW)</th>
                <th className="py-3 px-4 font-semibold text-right">Power Factor</th>
                <th className="py-3 px-4 font-semibold text-right">Frequency (Hz)</th>
                <th className="py-3 px-4 font-semibold text-right">Temp (°C)</th>
                <th className="py-3 px-4 font-semibold text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {history && history.length > 0 ? (
                history.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-4 text-slate-800">
                      {new Date(row.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'medium' })}
                    </td>
                    <td className="py-3.5 px-4 text-right text-slate-800">{row.voltage.toFixed(1)}</td>
                    <td className="py-3.5 px-4 text-right text-slate-800">{row.current.toFixed(1)}</td>
                    <td className="py-3.5 px-4 text-right text-slate-800">{row.power.toFixed(1)}</td>
                    <td className="py-3.5 px-4 text-right text-slate-800">{row.power_factor.toFixed(3)}</td>
                    <td className="py-3.5 px-4 text-right text-slate-800">{row.frequency.toFixed(2)}</td>
                    <td className="py-3.5 px-4 text-right text-slate-800">{row.temperature.toFixed(1)}</td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                        row.status === 'Normal' 
                          ? 'bg-emerald-50 border border-emerald-200 text-emerald-700' 
                          : 'bg-red-50 border border-red-200 text-red-700'
                      }`}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No readings found in history.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
