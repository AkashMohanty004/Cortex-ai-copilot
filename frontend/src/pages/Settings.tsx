import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/client';
import { useCustomer } from '../context/CustomerContext';
import { 
  Settings as SettingsIcon, 
  Database, 
  Sparkles, 
  Cpu, 
  Terminal, 
  RefreshCw, 
  FileCode
} from 'lucide-react';

interface SystemHealth {
  status: string;
  database: string;
  gemini_api_key_configured: boolean;
}

export const Settings: React.FC = () => {
  const { selectedCustomer } = useCustomer();
  const [indexStatus, setIndexStatus] = useState<string | null>(null);
  const [indexing, setIndexing] = useState(false);

  // Fetch system health status from backend /health
  const { data: health, isLoading, refetch } = useQuery<SystemHealth>({
    queryKey: ['systemHealth'],
    queryFn: async () => {
      const res = await apiClient.get<SystemHealth>('/health');
      return res.data;
    }
  });

  const handleIndexDocuments = async () => {
    try {
      setIndexing(true);
      setIndexStatus("Scanning docs directory and initializing chunks...");
      
      const res = await apiClient.post('/copilot/index');
      if (res.data.status === 'success') {
        setIndexStatus(`✅ Indexing complete! Indexed ${res.data.files_indexed} documents successfully.`);
      } else {
        setIndexStatus(`❌ Indexing failed: ${res.data.message}`);
      }
    } catch (err: any) {
      setIndexStatus(`❌ Indexing error: ${err.response?.data?.detail || err.message}`);
    } finally {
      setIndexing(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900 uppercase">System Configuration</h2>
        <p className="text-sm text-slate-500 mt-0.5">Control facility calibration profiles and local system telemetry endpoints</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Core System Status */}
        <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-4 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Cpu className="h-4.5 w-4.5 text-cortex-copper" /> Diagnostics Status
          </h3>
          
          <div className="space-y-3 font-mono text-xs pt-2">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2.5">
              <span className="text-slate-500 flex items-center gap-1.5"><Terminal className="h-3.5 w-3.5" /> API Hostname:</span>
              <span className="text-slate-900">localhost:8000</span>
            </div>
            
            <div className="flex justify-between items-center border-b border-slate-100 pb-2.5">
              <span className="text-slate-500 flex items-center gap-1.5"><Database className="h-3.5 w-3.5" /> Supabase Connection:</span>
              {isLoading ? (
                <span className="text-slate-500">checking...</span>
              ) : health?.database === 'connected' ? (
                <span className="text-emerald-600 font-semibold">CONNECTED</span>
              ) : (
                <span className="text-red-600 font-semibold">DISCONNECTED</span>
              )}
            </div>

            <div className="flex justify-between items-center pb-2.5">
              <span className="text-slate-500 flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5" /> Gemini API Key:</span>
              {isLoading ? (
                <span className="text-slate-500">checking...</span>
              ) : health?.gemini_api_key_configured ? (
                <span className="text-emerald-600 font-semibold">CONFIGURED</span>
              ) : (
                <span className="text-amber-600 font-semibold">MISSING (FALLBACK ACTIVE)</span>
              )}
            </div>
          </div>
          
          <button 
            onClick={() => refetch()}
            className="w-full flex items-center justify-center gap-1.5 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-mono font-semibold transition-all cursor-pointer text-slate-600 hover:text-slate-900"
          >
            <RefreshCw className="h-3.5 w-3.5 text-slate-400" /> Check API State
          </button>
        </div>

        {/* Document Ingestion & RAG Index Settings */}
        <div className="bg-white border border-slate-200 p-6 rounded-2xl flex flex-col justify-between h-full shadow-sm">
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <FileCode className="h-4.5 w-4.5 text-cortex-copper" /> Document Ingestion Pipeline
            </h3>
            
            <p className="text-xs text-slate-600 leading-relaxed">
              Triggers the backend pipeline scanner to reload company manuals, compliance guidelines, and safety protocol files located in the <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-800">backend/docs/</code> folder.
            </p>
          </div>

          <div className="mt-6 space-y-4">
            {indexStatus && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 leading-relaxed whitespace-pre-wrap">
                {indexStatus}
              </div>
            )}
            
            <button
              onClick={handleIndexDocuments}
              disabled={indexing}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-cortex-copper hover:bg-cortex-copper-hover disabled:bg-slate-100 disabled:text-slate-400 text-white font-semibold rounded-xl text-xs tracking-wider transition-all duration-200 cursor-pointer shadow-md shadow-cortex-copper/15"
            >
              {indexing ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" /> Indexing Documents...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4" /> (Re)index Local Docs
                </>
              )}
            </button>
          </div>
        </div>

      </div>

      {/* Facility calibration profile */}
      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
          <SettingsIcon className="h-4.5 w-4.5 text-cortex-copper" /> Current Calibration Profile
        </h3>
        
        {selectedCustomer ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 font-mono text-xs">
            <div>
              <span className="text-slate-500 block uppercase text-[10px] tracking-wider">Facility ID</span>
              <span className="text-slate-900 font-bold block mt-1">{selectedCustomer.id}</span>
            </div>
            <div>
              <span className="text-slate-500 block uppercase text-[10px] tracking-wider">Plant Name</span>
              <span className="text-slate-900 font-bold block mt-1">{selectedCustomer.name}</span>
            </div>
            <div>
              <span className="text-slate-500 block uppercase text-[10px] tracking-wider">Location</span>
              <span className="text-slate-900 font-bold block mt-1">{selectedCustomer.location}</span>
            </div>
            <div>
              <span className="text-slate-500 block uppercase text-[10px] tracking-wider">Supervised Role</span>
              <span className="text-slate-900 font-bold block mt-1">{selectedCustomer.role}</span>
            </div>
          </div>
        ) : (
          <p className="text-xs text-slate-500">No active facility profile loaded.</p>
        )}
      </div>

    </div>
  );
};
