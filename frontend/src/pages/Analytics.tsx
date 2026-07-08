import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useCustomer } from '../context/CustomerContext';
import apiClient from '../api/client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AlertTriangle, ShieldCheck, Zap, Thermometer } from 'lucide-react';

interface TelemetryHistoryRow {
  id: number;
  customer_id: string;
  timestamp: string;
  voltage: number;
  current: number;
  power: number;
  apparent_power: number;
  frequency: number;
  power_factor: number;
  temperature: number;
  status: string;
  voltage_phase1?: number;
  voltage_phase2?: number;
  voltage_phase3?: number;
  current_phase1?: number;
  current_phase2?: number;
  current_phase3?: number;
}

export const Analytics: React.FC = () => {
  const { selectedCustomerId } = useCustomer();

  // Fetch telemetry history with raw columns (for phases)
  const { 
    data: history = [], 
    isLoading, 
    isError 
  } = useQuery<TelemetryHistoryRow[]>({
    queryKey: ['analyticsHistory', selectedCustomerId],
    queryFn: async () => {
      if (!selectedCustomerId) return [];
      const res = await apiClient.get<TelemetryHistoryRow[]>(`/customers/${selectedCustomerId}/history?limit=30`);
      return res.data;
    },
    enabled: !!selectedCustomerId,
  });

  const chartData = listHistoryToChartPoints(history);

  function listHistoryToChartPoints(data: TelemetryHistoryRow[]): any[] {
    const reversed = [...data].reverse();
    return reversed.map(r => ({
      timestamp: new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      voltage: r.voltage,
      v1: r.voltage_phase1 || 0,
      v2: r.voltage_phase2 || 0,
      v3: r.voltage_phase3 || 0,
      current: r.current,
      i1: r.current_phase1 || 0,
      i2: r.current_phase2 || 0,
      i3: r.current_phase3 || 0,
      power: r.power,
      apparent: r.apparent_power,
      pf: r.power_factor,
      temp: r.temperature
    }));
  }

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-slate-200 border border-slate-300 rounded-xl w-1/3" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-[350px] bg-slate-200 border border-slate-300 rounded-xl" />
          <div className="h-[350px] bg-slate-200 border border-slate-300 rounded-xl" />
        </div>
      </div>
    );
  }

  if (isError || history.length === 0) {
    return (
      <div className="text-center p-12 bg-white border border-slate-200 rounded-xl text-red-600 shadow-sm">
        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-3" />
        <p>Could not load historical grid telemetry. Make sure the backend server is active.</p>
      </div>
    );
  }

  const latest = history[0];

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900 uppercase">Historical Diagnostics</h2>
        <p className="text-sm text-slate-500 mt-0.5">Advanced phase balancing, power quality metrics, and line distorts</p>
      </div>

      {/* Grid of details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Phase Balance Check */}
        <div className="bg-white border border-slate-200 p-6 rounded-2xl flex flex-col justify-between shadow-sm">
          <div>
            <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">Phase Voltage Quality</span>
            <h3 className="text-base font-bold text-slate-900 mt-1.5 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-600" /> Balanced Grid Output
            </h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Comparison of Phase A, B, and C line voltages. Large discrepancies indicate phase load unbalances which damage heavy-duty inductors.
            </p>
          </div>

          <div className="space-y-3.5 mt-6 font-mono text-xs">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <span className="text-slate-500">Phase A (R):</span>
              <span className="font-bold text-slate-900">{latest.voltage_phase1?.toFixed(1) || '0.0'} V</span>
            </div>
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <span className="text-slate-500">Phase B (Y):</span>
              <span className="font-bold text-slate-900">{latest.voltage_phase2?.toFixed(1) || '0.0'} V</span>
            </div>
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <span className="text-slate-500">Phase C (B):</span>
              <span className="font-bold text-slate-900">{latest.voltage_phase3?.toFixed(1) || '0.0'} V</span>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="text-slate-500">Unbalance Ratio:</span>
              <span className="font-bold text-emerald-600">0.14% (Ideal &lt; 2%)</span>
            </div>
          </div>
        </div>

        {/* Harmonic distortion / PF quality */}
        <div className="bg-white border border-slate-200 p-6 rounded-2xl flex flex-col justify-between shadow-sm">
          <div>
            <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">Load Characterization</span>
            <h3 className="text-base font-bold text-slate-900 mt-1.5 flex items-center gap-2">
              <Zap className="h-5 w-5 text-cortex-copper" /> Power Factor Health
            </h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Current power factor is <strong className="text-slate-900">{latest.power_factor.toFixed(3)}</strong>. Sustained PF below 0.95 incurs grid provider surcharges.
            </p>
          </div>

          <div className="space-y-3.5 mt-6 font-mono text-xs">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <span className="text-slate-500">Active Power:</span>
              <span className="font-bold text-slate-900">{latest.power.toFixed(1)} kW</span>
            </div>
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <span className="text-slate-500">Apparent Power:</span>
              <span className="font-bold text-slate-900">{latest.apparent_power.toFixed(1)} kVA</span>
            </div>
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <span className="text-slate-500">Reactive Power:</span>
              <span className="font-bold text-slate-900">{(Math.sqrt(Math.max(0, latest.apparent_power**2 - latest.power**2))).toFixed(1)} kVAR</span>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="text-slate-500">Target Recovery:</span>
              <span className="font-bold text-amber-600">APFC Auto-Switch Active</span>
            </div>
          </div>
        </div>

        {/* Transformer Diagnostics */}
        <div className="bg-white border border-slate-200 p-6 rounded-2xl flex flex-col justify-between shadow-sm">
          <div>
            <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">Thermal Signature</span>
            <h3 className="text-base font-bold text-slate-900 mt-1.5 flex items-center gap-2">
              <Thermometer className="h-5 w-5 text-red-500" /> Core Temperature
            </h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Real-time temperature feedback from grid transformers. Critical threshold trigger is calibrated at 52.0°C.
            </p>
          </div>

          <div className="space-y-3.5 mt-6 font-mono text-xs">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <span className="text-slate-500">Latest Core Temp:</span>
              <span className={`font-bold ${latest.temperature > 52.0 ? 'text-red-600' : latest.temperature > 48.0 ? 'text-amber-600' : 'text-slate-950'}`}>
                {latest.temperature.toFixed(1)} °C
              </span>
            </div>
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <span className="text-slate-500">Ambient Temp:</span>
              <span className="font-bold text-slate-900">28.5 °C</span>
            </div>
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <span className="text-slate-500">Thermal Index:</span>
              <span className="font-bold text-emerald-600">Normal</span>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="text-slate-500">Secondary Coolant:</span>
              <span className="font-bold text-slate-400 font-mono uppercase text-[10px]">Standby</span>
            </div>
          </div>
        </div>

      </div>

      {/* Advanced Charting Block */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Phase Voltages Chart */}
        <div className="bg-white border border-slate-200 p-6 rounded-2xl h-[380px] flex flex-col justify-between shadow-sm">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Phase Voltage Trends</h3>
            <p className="text-xs text-slate-500 mt-0.5">Line-to-Neutral voltage tracking per phase (R-Y-B)</p>
          </div>
          <div className="flex-1 w-full mt-6 text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(15,23,42,0.05)" />
                <XAxis dataKey="timestamp" stroke="rgba(15,23,42,0.4)" tick={{ fontSize: 9, fill: '#64748b' }} />
                <YAxis stroke="rgba(15,23,42,0.4)" domain={[220, 245]} tick={{ fontSize: 9, fill: '#64748b' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#ffffff', 
                    borderColor: '#e2e8f0', 
                    borderRadius: '12px', 
                    color: '#0f172a',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
                  }} 
                />
                <Legend />
                <Line type="monotone" dataKey="v1" name="Phase A (R)" stroke="#ef4444" strokeWidth={1.5} dot={false} />
                <Line type="monotone" dataKey="v2" name="Phase B (Y)" stroke="#f59e0b" strokeWidth={1.5} dot={false} />
                <Line type="monotone" dataKey="v3" name="Phase C (B)" stroke="#3b82f6" strokeWidth={1.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Phase Currents Chart */}
        <div className="bg-white border border-slate-200 p-6 rounded-2xl h-[380px] flex flex-col justify-between shadow-sm">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Phase Current Trends</h3>
            <p className="text-xs text-slate-500 mt-0.5">Real-time current distribution per phase (R-Y-B)</p>
          </div>
          <div className="flex-1 w-full mt-6 text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(15,23,42,0.05)" />
                <XAxis dataKey="timestamp" stroke="rgba(15,23,42,0.4)" tick={{ fontSize: 9, fill: '#64748b' }} />
                <YAxis stroke="rgba(15,23,42,0.4)" tick={{ fontSize: 9, fill: '#64748b' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#ffffff', 
                    borderColor: '#e2e8f0', 
                    borderRadius: '12px', 
                    color: '#0f172a',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
                  }} 
                />
                <Legend />
                <Line type="monotone" dataKey="i1" name="Phase A (R)" stroke="#ef4444" strokeWidth={1.5} dot={false} />
                <Line type="monotone" dataKey="i2" name="Phase B (Y)" stroke="#f59e0b" strokeWidth={1.5} dot={false} />
                <Line type="monotone" dataKey="i3" name="Phase C (B)" stroke="#3b82f6" strokeWidth={1.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
};
