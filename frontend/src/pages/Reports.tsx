import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useCustomer } from '../context/CustomerContext';
import apiClient from '../api/client';
import { FileText, Download, Search, RefreshCw, FileCode, FileSpreadsheet, PlusCircle } from 'lucide-react';

interface Report {
  id: string;
  customer_id: string;
  name: string;
  date: string;
  file_type: string;
  file_size: string;
  file_path: string;
  created_at?: string;
}

export const Reports: React.FC = () => {
  const { selectedCustomerId } = useCustomer();
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch reports from API
  const { 
    data: reports = [], 
    isLoading, 
    isError, 
    refetch 
  } = useQuery<Report[]>({
    queryKey: ['reports', selectedCustomerId],
    queryFn: async () => {
      const url = selectedCustomerId 
        ? `/reports?customer_id=${selectedCustomerId}`
        : '/reports';
      const res = await apiClient.get<Report[]>(url);
      return res.data;
    },
    enabled: true,
  });

  // Filter reports locally
  const filteredReports = reports.filter(r => 
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.file_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getFileIcon = (fileType: string) => {
    switch (fileType.toUpperCase()) {
      case 'PDF':
        return <FileText className="h-5 w-5 text-red-500" />;
      case 'CSV':
        return <FileSpreadsheet className="h-5 w-5 text-emerald-500" />;
      default:
        return <FileCode className="h-5 w-5 text-cortex-copper" />;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 uppercase">Energy Audits & Reports</h2>
          <p className="text-sm text-slate-500 mt-0.5">Compliant energy reports and environmental audits logs</p>
        </div>
        
        {/* Generate report button */}
        <button className="flex items-center gap-2 px-4 py-2 bg-cortex-copper hover:bg-cortex-copper-hover text-white font-semibold rounded-xl text-xs tracking-wider transition-all duration-200 cursor-pointer shadow-md shadow-cortex-copper/15">
          <PlusCircle className="h-4 w-4" /> Compile Audit Report
        </button>
      </div>

      {/* Filter and search bars */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white border border-slate-200 p-4 rounded-2xl items-center justify-between shadow-sm">
        {/* Search input */}
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search report vault..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 focus:border-cortex-copper text-xs rounded-xl pl-8 pr-4 py-2 text-slate-900 focus:outline-none focus:bg-white transition-all duration-200"
          />
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
        </div>
        
        {/* Refetch button */}
        <button 
          onClick={() => refetch()}
          className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-mono font-semibold transition-all cursor-pointer text-slate-600 hover:text-slate-900"
        >
          <RefreshCw className="h-3.5 w-3.5 text-slate-400" /> Refresh Audit DB
        </button>
      </div>

      {/* Reports Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-12 text-center">
            <RefreshCw className="h-8 w-8 text-cortex-copper animate-spin mx-auto" />
            <p className="text-xs text-slate-500 mt-2 font-mono">Scanning storage drives...</p>
          </div>
        ) : isError ? (
          <div className="p-12 text-center text-red-600">
            <p className="text-sm">Failed to connect to report registry backend.</p>
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <p className="text-sm">No energy audit files found in registry matching criteria.</p>
          </div>
        ) : (
          <table className="w-full text-left text-xs font-mono border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 bg-slate-50">
                <th className="py-3 px-6 font-semibold uppercase tracking-wider">Audit Document</th>
                <th className="py-3 px-4 font-semibold uppercase tracking-wider">Date Compiled</th>
                <th className="py-3 px-4 font-semibold uppercase tracking-wider">Format</th>
                <th className="py-3 px-4 font-semibold uppercase tracking-wider">File Size</th>
                <th className="py-3 px-6 font-semibold uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredReports.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-6 font-semibold text-slate-800 flex items-center gap-3">
                    {getFileIcon(row.file_type)}
                    <div>
                      <span className="text-slate-900 hover:text-cortex-copper transition-colors cursor-pointer">{row.name}</span>
                      <p className="text-[9px] text-slate-400 mt-0.5">{row.id}</p>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-slate-600">
                    {new Date(row.date).toLocaleDateString([], { dateStyle: 'medium' })}
                  </td>
                  <td className="py-4 px-4">
                    <span className={`inline-block px-2 py-0.5 rounded-lg text-[9px] font-bold ${
                      row.file_type.toUpperCase() === 'PDF' 
                        ? 'bg-red-50 border border-red-200 text-red-600' 
                        : 'bg-emerald-50 border border-emerald-200 text-emerald-700'
                    }`}>
                      {row.file_type.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-slate-600">{row.file_size}</td>
                  <td className="py-4 px-6 text-right">
                    <button className="p-2 border border-slate-200 hover:border-cortex-copper text-slate-400 hover:text-cortex-copper hover:bg-cortex-copper/5 rounded-xl transition-all duration-200 cursor-pointer">
                      <Download className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

    </div>
  );
};
