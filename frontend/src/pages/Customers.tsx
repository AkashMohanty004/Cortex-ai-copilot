import React from 'react';
import { useCustomer } from '../context/CustomerContext';
import { MapPin, Shield, Server, Activity, Lock, CheckCircle } from 'lucide-react';

export const Customers: React.FC = () => {
  const { customers, loading, error, selectedCustomerId } = useCustomer();

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-slate-200 border border-slate-300 rounded-xl w-1/3" />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-[200px] bg-slate-200 border border-slate-300 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-12 bg-white border border-slate-200 rounded-xl text-red-600">
        <p>Error loading customers: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900 uppercase">Registered Facilities</h2>
        <p className="text-sm text-slate-500 mt-0.5">Active monitoring grid locations and access credentials</p>
      </div>

      {/* Grid of customers */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {customers.map((c) => {
          const isActive = c.id === selectedCustomerId;
          return (
            <div 
              key={c.id} 
              className={`bg-white border rounded-2xl p-6 transition-all duration-200 flex flex-col justify-between h-[230px] relative group shadow-sm ${
                isActive 
                  ? 'border-cortex-copper ring-2 ring-cortex-copper/10 bg-cortex-copper/5 shadow-md shadow-cortex-copper/5' 
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              {/* Header info */}
              <div>
                <div className="flex justify-between items-start">
                  <div className={`p-2.5 rounded-xl border ${isActive ? 'bg-cortex-copper/15 border-cortex-copper/30 text-cortex-copper' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                    <Server className="h-5 w-5" />
                  </div>
                  <span className={`text-[10px] font-mono border px-2 py-0.5 rounded-lg ${isActive ? 'bg-cortex-copper/20 border-cortex-copper/30 text-cortex-copper font-semibold' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                    {c.id}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 mt-4">
                  {c.name}
                </h3>
                
                <div className="mt-3.5 space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                    <span>{c.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="h-3.5 w-3.5 text-slate-400" />
                    <span>{c.role}</span>
                  </div>
                </div>
              </div>

              {/* Selector footer */}
              <div className="border-t border-slate-100 pt-4 flex justify-between items-center mt-4">
                <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1.5">
                  <Activity className="h-3.5 w-3.5 text-emerald-500" /> Grid Online
                </span>
                
                {isActive ? (
                  <span className="text-[11px] font-semibold text-cortex-copper flex items-center gap-1">
                    <CheckCircle className="h-4 w-4" /> Active Session
                  </span>
                ) : (
                  <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                    <Lock className="h-3.5 w-3.5" /> Session Locked
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
