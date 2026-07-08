import React, { useState } from 'react';
import { useCustomer } from '../context/CustomerContext';
import { ShieldAlert, Zap, Lock, AlertTriangle } from 'lucide-react';

export const Login: React.FC = () => {
  const { login, customers, loading, error } = useCustomer();
  const [facilityId, setFacilityId] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!facilityId.trim()) return;

    setIsSubmitting(true);
    setLoginError(null);

    // Give a short delay to feel premium/secure
    setTimeout(async () => {
      const success = await login(facilityId);
      setIsSubmitting(false);
      if (!success) {
        setLoginError('Invalid Facility Key. Please double check credentials.');
      }
    }, 600);
  };

  return (
    <div className="min-h-screen bg-slate-50 cortex-grid-bg flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Absolute floating copper accent glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-cortex-copper/5 blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex items-center justify-center space-x-2">
          <div className="h-10 w-10 rounded-lg bg-cortex-copper flex items-center justify-center text-white shadow-md shadow-cortex-copper/30 animate-pulse">
            <Zap className="h-6 w-6" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-slate-900 font-sans">
            VIREON <span className="text-cortex-copper font-normal">CORTEX</span>
          </span>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900 tracking-tight">
          Cortex Edge Login
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Industrial Energy Diagnostics Portal
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white py-8 px-4 shadow-xl border border-slate-200 rounded-2xl sm:px-10">
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 p-4 border border-red-200">
              <div className="flex">
                <div className="flex-shrink-0">
                  <ShieldAlert className="h-5 w-5 text-red-500" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-semibold text-red-800">Connection Error</h3>
                  <p className="mt-1 text-xs text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="facility_id" className="block text-sm font-semibold text-slate-700">
                Facility Security Key
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="facility_id"
                  name="facility_id"
                  type="text"
                  required
                  disabled={loading || isSubmitting}
                  value={facilityId}
                  onChange={(e) => {
                    setFacilityId(e.target.value);
                    if (loginError) setLoginError(null);
                  }}
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-xl bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cortex-copper focus:border-cortex-copper focus:bg-white text-sm transition-all"
                  placeholder="e.g. CUST101"
                />
              </div>
            </div>

            {loginError && (
              <div className="rounded-lg bg-amber-50 p-3 border border-amber-200 flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0" />
                <span className="text-xs text-amber-800 font-medium">{loginError}</span>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading || isSubmitting}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-semibold text-white bg-cortex-copper hover:bg-cortex-copper-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cortex-copper transition-all duration-200 disabled:opacity-50"
              >
                {isSubmitting ? 'Authenticating Facility...' : 'Access Dashboard'}
              </button>
            </div>
          </form>

          {/* Diagnostics Credentials Drawer for Local Verification */}
          <div className="mt-8 border-t border-slate-200 pt-6">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">
              Available Test Keys
            </h3>
            <div className="mt-3 grid grid-cols-1 gap-2 text-center text-xs text-slate-700">
              {customers.length > 0 ? (
                customers.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      setFacilityId(c.id);
                      setLoginError(null);
                    }}
                    type="button"
                    className="p-2 border border-slate-200 bg-slate-50 hover:bg-cortex-copper/5 hover:border-cortex-copper/30 rounded-xl transition-all flex justify-between items-center px-4 font-mono text-left group"
                  >
                    <span className="font-semibold text-slate-900 group-hover:text-cortex-copper transition-colors">
                      {c.id}
                    </span>
                    <span className="text-slate-500 text-[10px]">
                      {c.name.split(' ')[0]} ({c.location})
                    </span>
                  </button>
                ))
              ) : (
                <div className="text-slate-400">Loading diagnostic keys from database...</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
