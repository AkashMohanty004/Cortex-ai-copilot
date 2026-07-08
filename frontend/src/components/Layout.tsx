import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useCustomer } from '../context/CustomerContext';
import { 
  LayoutDashboard, 
  Users, 
  LineChart, 
  MessageSquare, 
  FileText, 
  Settings, 
  Bell, 
  Search, 
  Database,
  Bolt,
  Cpu,
  ChevronDown,
  User,
  LogOut
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { selectedCustomerId, selectedCustomer, error, logout } = useCustomer();
  const location = useLocation();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Customers', path: '/customers', icon: Users },
    { name: 'Analytics', path: '/analytics', icon: LineChart },
    { name: 'AI Copilot', path: '/copilot', icon: MessageSquare },
    { name: 'Reports', path: '/reports', icon: FileText },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  const getPageTitle = () => {
    const matched = navItems.find(item => item.path === location.pathname);
    return matched ? matched.name : 'Cortex AI';
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 cortex-grid-bg text-slate-900 relative">
      {/* Background radial glow */}
      <div className="absolute inset-0 pointer-events-none cortex-radial-glow z-0" />

      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col z-10 shadow-sm">
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-200 flex items-center gap-3">
          <div className="bg-cortex-copper/10 p-2 rounded-lg border border-cortex-copper/30 flex items-center justify-center">
            <Bolt className="h-6 w-6 text-cortex-copper animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-wider m-0 text-slate-900 flex items-center gap-1.5">
              VIREON <span className="text-[10px] bg-cortex-copper/15 border border-cortex-copper/30 text-cortex-copper px-1.5 py-0.5 rounded font-semibold">CORTEX</span>
            </h1>
            <p className="text-[10px] text-slate-400 font-mono uppercase tracking-widest mt-0.5">Edge Platform</p>
          </div>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 border ${
                  isActive
                    ? 'bg-cortex-copper/10 border-cortex-copper/30 text-cortex-copper font-semibold shadow-[0_4px_15px_rgba(184,103,61,0.06)]'
                    : 'border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon className={`h-4.5 w-4.5 ${isActive ? 'text-cortex-copper' : 'text-slate-400 group-hover:text-slate-950'}`} />
                {item.name}
              </NavLink>
            );
          })}
        </nav>

        {/* System Diagnostics Status */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className={`h-2.5 w-2.5 rounded-full ${error ? 'bg-red-500 animate-ping' : 'bg-emerald-500 animate-pulse'}`} />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-900 truncate">
                {error ? 'System Offline' : 'Grid Connection Online'}
              </p>
              <p className="text-[10px] text-slate-500 font-mono truncate">
                {error ? 'DB connection failed' : 'AWS AP-SE-2 (Supabase)'}
              </p>
            </div>
            <Database className="h-4 w-4 text-slate-400" />
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        
        {/* Top Navbar */}
        <header className="h-16 border-b border-slate-200 bg-white/90 backdrop-blur-md px-6 flex items-center justify-between shadow-sm">
          {/* Page Title & Breadcrumbs */}
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold tracking-tight text-slate-900 mb-0">{getPageTitle()}</h2>
            <div className="h-4 w-[1px] bg-slate-200 hidden sm:block" />
            <span className="text-xs text-slate-500 font-mono hidden sm:flex items-center gap-1.5">
              <Cpu className="h-3.5 w-3.5 text-slate-400" />
              Facility ID: <span className="font-semibold text-slate-700">{selectedCustomerId || 'None'}</span>
            </span>
          </div>

          {/* Action Items & Customer Banner */}
          <div className="flex items-center gap-4">
            {/* Logged in Facility Indicator */}
            {selectedCustomer && (
              <div className="hidden md:flex items-center gap-2">
                <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">Facility:</span>
                <span className="text-xs font-semibold text-slate-800 bg-cortex-copper/10 border border-cortex-copper/20 px-3 py-1.5 rounded-xl">
                  {selectedCustomer.name}
                </span>
              </div>
            )}

            {/* Global Search bar (UI only) */}
            <div className="relative hidden lg:block">
              <input
                type="text"
                placeholder="Search facility grids..."
                className="bg-slate-50 border border-slate-200 focus:border-cortex-copper text-xs rounded-xl pl-8 pr-4 py-1.5 w-48 text-slate-950 placeholder-slate-400 focus:outline-none focus:bg-white transition-all duration-200"
              />
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            </div>

            {/* Notifications Button */}
            <div className="relative">
              <button 
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="p-2 hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-500 hover:text-slate-900 transition-all relative"
              >
                <Bell className="h-4.5 w-4.5" />
                <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 bg-cortex-copper rounded-full" />
              </button>
              
              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-xl shadow-xl py-2 z-50">
                  <div className="px-4 py-2 border-b border-slate-200 flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-900">Active Grid Alerts</span>
                    <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-semibold font-mono">3 Active</span>
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    <div className="px-4 py-2 hover:bg-slate-50 border-b border-slate-100">
                      <p className="text-xs text-red-600 font-semibold">[CUST101] Transformer Temperature</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">Exceeds limits: 54.8°C (Limit: 52°C)</p>
                    </div>
                    <div className="px-4 py-2 hover:bg-slate-50 border-b border-slate-100">
                      <p className="text-xs text-amber-600 font-semibold">[CUST101] Power Factor Warning</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">Dropped below target limit: 0.884</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 p-1.5 hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-900 transition-all"
              >
                <div className="h-6 w-6 rounded-md bg-cortex-copper flex items-center justify-center text-xs font-bold text-white font-mono shadow-sm">
                  {selectedCustomer ? selectedCustomer.role.substring(0, 2).toUpperCase() : 'OP'}
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-xl py-1 z-50 text-slate-800">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-xs font-bold truncate text-slate-900">{selectedCustomer ? selectedCustomer.name : 'Operator User'}</p>
                    <p className="text-[10px] text-slate-500 truncate mt-0.5">{selectedCustomer ? selectedCustomer.role : 'Operations Engineer'}</p>
                  </div>
                  <button className="w-full text-left px-4 py-2 text-xs hover:bg-slate-50 flex items-center gap-2 text-slate-700 hover:text-slate-900">
                    <User className="h-3.5 w-3.5 text-slate-400" /> Profile Settings
                  </button>
                  <button 
                    onClick={() => logout()}
                    className="w-full text-left px-4 py-2 text-xs hover:bg-red-50 flex items-center gap-2 text-red-600 hover:text-red-700 border-t border-slate-100"
                  >
                    <LogOut className="h-3.5 w-3.5" /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 overflow-y-auto p-6 bg-slate-50">
          {children}
        </main>
      </div>
    </div>
  );
};
