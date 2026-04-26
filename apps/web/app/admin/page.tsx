"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../components/AuthContext';
import { 
  ShieldAlert, 
  Users, 
  Settings, 
  Database, 
  Terminal, 
  Activity,
  Plus,
  Trash2,
  Lock,
  Eye,
  Server,
  Loader2,
  RefreshCw,
  AlertTriangle,
  Download,
  CheckCircle
} from 'lucide-react';
import { fetchAtmList, fetchAdminUsers, fetchLogs, generateTestData, type AtmData, type UserData, type LogData } from '../../lib/api';

export default function AdminPanelPage() {
  const { role } = useAuth();
  const isSuper = role === 'SUPERADMIN';
  const [activeTab, setActiveTab] = useState<'network' | 'dispatch' | 'users' | 'logs'>('network');

  if (role !== 'ADMIN' && role !== 'SUPERADMIN') {
    return <div className="p-8 text-[#fb7185] font-mono tracking-widest uppercase">Unauthorized Access</div>;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto w-full space-y-8 animate-in fade-in zoom-in-95 duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-[#133c2e] pb-6">
        <div>
          <h1 className="text-3xl font-black text-[#e2f1ea] tracking-tight mb-2 flex items-center gap-3">
            <Server className="w-8 h-8 text-[#9de1b9]" /> Command Center
          </h1>
          <p className="text-[#78a390] text-sm">Direct structural management and logical overrides.</p>
        </div>
        <div className="flex items-center gap-3 bg-[#0a241c] p-2 rounded-xl border border-[#133c2e]">
          <span className="text-[#5d8573] text-[10px] uppercase font-bold tracking-widest pl-2">Clearance:</span>
          <span className={`px-3 py-1 rounded-lg text-xs font-bold tracking-wider ${isSuper ? 'bg-[#9de1b9] text-[#071a14]' : 'bg-[#1f4a38] text-[#9de1b9]'}`}>
            {isSuper ? 'LEVEL 5 (ROOT)' : 'LEVEL 3 (ADMIN)'}
          </span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-2 border-b border-[#133c2e] mb-8">
        <TabButton active={activeTab === 'network'} onClick={() => setActiveTab('network')} icon={<Database />} label="Network Nodes" />
        <TabButton active={activeTab === 'dispatch'} onClick={() => setActiveTab('dispatch')} icon={<Activity />} label="Data Generator" />
        {isSuper && <TabButton active={activeTab === 'users'} onClick={() => setActiveTab('users')} icon={<Users />} label="Access Roster" />}
        {isSuper && <TabButton active={activeTab === 'logs'} onClick={() => setActiveTab('logs')} icon={<Terminal />} label="System Audit" />}
      </div>

      {/* Content Areas */}
      <div className="min-h-[500px]">
        {activeTab === 'network' && <NetworkControl />}
        {activeTab === 'dispatch' && <DataGeneratorControl />}
        {activeTab === 'users' && isSuper && <UserManagement />}
        {activeTab === 'logs' && isSuper && <SystemLogs />}
      </div>

    </div>
  );
}

// SUBCOMPONENTS

function TabButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-6 py-3 border-b-2 transition-all font-semibold ${
        active 
          ? 'border-[#9de1b9] text-[#9de1b9] bg-[#0a241c]' 
          : 'border-transparent text-[#5d8573] hover:text-[#78a390] hover:bg-[#061814]'
      }`}
    >
      <span className="w-4 h-4">{icon}</span>
      {label}
    </button>
  );
}

// --- Network Control (ATMs from API) ---
function NetworkControl() {
  const [atms, setAtms] = useState<AtmData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetchAtmList(1, 200);
      setAtms(res.data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 animate-spin text-[#9de1b9]" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-[#0a241c] p-4 rounded-2xl border border-[#133c2e]">
         <div className="flex items-center gap-4">
            <div className="p-3 bg-[#061814] rounded-xl"><Database className="text-[#9de1b9] w-5 h-5"/></div>
            <div>
               <h3 className="text-[#e2f1ea] font-bold">ATM Node Registry</h3>
               <p className="text-xs text-[#78a390]">{atms.length} nodes registered in the system.</p>
            </div>
         </div>
         <button onClick={load} className="flex items-center gap-2 bg-[#12382c] text-[#9de1b9] px-4 py-2 rounded-xl text-sm font-bold border border-[#1c5542] hover:bg-[#1a4a3a] transition-colors">
           <RefreshCw className="w-4 h-4" /> Refresh
         </button>
      </div>

      {error && (
        <div className="bg-[#1f1115] border border-rose-900/30 text-[#fb7185] p-3 rounded-xl text-sm flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" /> {error}
        </div>
      )}

      {atms.length === 0 ? (
        <div className="bg-[#0a241c] border border-[#133c2e] p-8 rounded-2xl text-center text-[#78a390] text-sm">
          No ATM nodes found. Use the Data Generator tab to create test data.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
           {atms.map(atm => {
             const cashPercent = atm.capacity > 0 ? Math.round((atm.currentCash / atm.capacity) * 100) : 0;
             const isOnline = atm.status === 'ONLINE';
             return (
               <div key={atm._id} className="bg-[#04120e] border border-[#133c2e] p-5 rounded-2xl relative overflow-hidden group">
                 <div className="flex justify-between items-start mb-4">
                   <div>
                      <div className="text-[10px] text-[#9de1b9] bg-[#12382c] px-2 py-0.5 rounded-sm inline-block font-mono tracking-widest mb-1.5">{atm.atmId}</div>
                      <h4 className="text-[#e2f1ea] font-medium text-sm">{atm.branch}</h4>
                   </div>
                   <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-[#9de1b9] shadow-[0_0_8px_#9de1b9]' : 'bg-[#fb7185] shadow-[0_0_8px_#fb7185]'}`}></span>
                 </div>
                 
                 <div className="space-y-2 mb-4 border-b border-[#133c2e]/50 pb-4">
                    <div className="flex justify-between text-xs">
                       <span className="text-[#5d8573]">Status</span>
                       <span className={`font-mono font-bold ${isOnline ? 'text-[#9de1b9]' : 'text-[#fb7185]'}`}>{atm.status}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                       <span className="text-[#5d8573]">Cash Level</span>
                       <span className={`font-mono font-bold ${cashPercent < 15 ? 'text-[#fb7185]' : cashPercent < 30 ? 'text-amber-400' : 'text-[#78a390]'}`}>{cashPercent}%</span>
                    </div>
                    <div className="h-1.5 bg-[#03110d] rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${cashPercent < 15 ? 'bg-[#fb7185]' : cashPercent < 30 ? 'bg-amber-400' : 'bg-[#9de1b9]'}`} style={{ width: `${cashPercent}%` }} />
                    </div>
                    <div className="flex justify-between text-xs">
                       <span className="text-[#5d8573]">Capacity</span>
                       <span className="font-mono text-[#78a390]">${atm.capacity.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                       <span className="text-[#5d8573]">Location</span>
                       <span className="font-mono text-[#78a390]">{atm.location.lat.toFixed(4)}, {atm.location.lng.toFixed(4)}</span>
                    </div>
                 </div>

                 <div className="flex gap-2">
                    <button className="flex-1 bg-[#12382c] text-[#9de1b9] text-xs font-semibold py-2 rounded-lg border border-[#1c5542] hover:bg-[#1a4a3a]">View Details</button>
                 </div>
               </div>
             );
           })}
        </div>
      )}
    </div>
  );
}

// --- Data Generator ---
function DataGeneratorControl() {
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setGenerating(true);
    setResult(null);
    setError(null);
    try {
      const res = await generateTestData();
      setResult(`Successfully generated: ${res.counts?.atms || 0} ATMs, ${res.counts?.transactions || 0} transactions, ${res.counts?.alerts || 0} alerts, ${res.counts?.logs || 0} logs`);
    } catch (err: any) {
      setError(err.message || 'Failed to generate data');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
       <div className="bg-[#0a241c] p-6 rounded-2xl border border-[#133c2e]">
          <h3 className="text-lg font-bold text-[#e2f1ea] mb-4">Test Data Generator</h3>
          <p className="text-sm text-[#78a390] mb-6">Generate realistic ATM, transaction, alert, and log data for testing. This populates the database with 20 ATMs across 8 Uzbekistan regions with 30 days of transaction history.</p>
          
          {result && (
            <div className="mb-4 p-4 bg-[#12382c] border border-[#1c5542] rounded-xl text-[#9de1b9] text-sm flex items-center gap-2">
              <CheckCircle className="w-4 h-4" /> {result}
            </div>
          )}

          {error && (
            <div className="mb-4 p-4 bg-[#1f1115] border border-rose-900/30 rounded-xl text-[#fb7185] text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" /> {error}
            </div>
          )}

          <button 
            onClick={handleGenerate} 
            disabled={generating}
            className="bg-[#9de1b9] text-[#071a14] px-6 py-3 rounded-xl font-bold text-sm shadow-[0_0_15px_rgba(157,225,185,0.4)] hover:bg-[#b0ebd1] transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            {generating ? 'Generating Data...' : 'Generate Test Data'}
          </button>
       </div>
    </div>
  );
}

// --- User Management (Superadmin Only) ---
function UserManagement() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetchAdminUsers();
      setUsers(res.data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 animate-spin text-[#9de1b9]" /></div>;

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center mb-4">
         <h3 className="text-xl font-bold text-[#e2f1ea]">Access Clearance Roster</h3>
         <button onClick={load} className="bg-[#12382c] border border-[#1c5542] text-[#9de1b9] px-4 py-2 rounded-xl text-sm hover:bg-[#1a4a3a] flex items-center gap-2">
           <RefreshCw className="w-4 h-4" /> Refresh
         </button>
       </div>

       {error && (
         <div className="bg-[#1f1115] border border-rose-900/30 text-[#fb7185] p-3 rounded-xl text-sm flex items-center gap-2">
           <AlertTriangle className="w-4 h-4" /> {error}
         </div>
       )}
       
       {users.length === 0 ? (
         <div className="bg-[#0a241c] border border-[#133c2e] p-8 rounded-2xl text-center text-[#78a390] text-sm">
           No registered users found.
         </div>
       ) : (
         <div className="bg-[#0a241c] border border-[#133c2e] rounded-2xl overflow-hidden shadow-2xl">
           <table className="w-full text-left border-collapse">
             <thead>
               <tr className="bg-[#061814] border-b border-[#133c2e]">
                 <th className="px-6 py-4 text-xs tracking-widest text-[#5d8573] uppercase font-bold">Operative Name</th>
                 <th className="px-6 py-4 text-xs tracking-widest text-[#5d8573] uppercase font-bold">Email Config</th>
                 <th className="px-6 py-4 text-xs tracking-widest text-[#5d8573] uppercase font-bold">Role Matrix</th>
                 <th className="px-6 py-4 text-xs tracking-widest text-[#5d8573] uppercase font-bold">Verified</th>
                 <th className="px-6 py-4 text-xs tracking-widest text-[#5d8573] uppercase font-bold">Joined</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-[#133c2e]/50 text-sm">
               {users.map(user => (
                 <tr key={user._id} className="hover:bg-[#071a14] transition-colors">
                   <td className="px-6 py-4 font-semibold text-[#e2f1ea]">{user.name}</td>
                   <td className="px-6 py-4 text-[#78a390] font-mono text-xs">{user.email}</td>
                   <td className="px-6 py-4">
                     <span className={`px-2 py-1 rounded text-[10px] font-bold ${
                       user.role === 'SUPERADMIN' ? 'bg-[#9de1b9] text-[#071a14]' :
                       user.role === 'ADMIN' ? 'bg-[#1f4a38] text-[#9de1b9]' :
                       'bg-[#12382c] text-[#78a390]'
                     }`}>{user.role}</span>
                   </td>
                   <td className="px-6 py-4">
                     {user.isVerified ? (
                       <span className="text-[#9de1b9] text-xs flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Yes</span>
                     ) : (
                       <span className="text-[#fb7185] text-xs">No</span>
                     )}
                   </td>
                   <td className="px-6 py-4 text-[#5d8573] text-xs font-mono">
                     {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                   </td>
                 </tr>
               ))}
             </tbody>
           </table>
         </div>
       )}
    </div>
  );
}

// --- System Logs (Superadmin Only) ---
function SystemLogs() {
  const [logs, setLogs] = useState<LogData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetchLogs(50);
      setLogs(res.data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'CRIT': case 'ERROR': return 'text-[#fb7185]';
      case 'WARN': return 'text-amber-400';
      case 'AUTH': return 'text-[#78a390]';
      case 'SYNC': return 'text-[#9de1b9]';
      case 'NODE': return 'text-[#e2f1ea]';
      default: return 'text-[#78a390]';
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 animate-spin text-[#9de1b9]" /></div>;

  return (
    <div className="bg-[#03110d] border border-[#133c2e] p-6 rounded-2xl font-mono text-xs shadow-inner relative">
      <div className="absolute top-4 right-4 flex gap-2 items-center">
         <div className="w-2 h-2 rounded-full bg-[#9de1b9] animate-pulse"></div>
         <span className="text-[#5d8573] text-[10px]">LIVE TAIL</span>
         <button onClick={load} className="text-[#5d8573] hover:text-[#9de1b9] transition-colors ml-2"><RefreshCw className="w-3 h-3" /></button>
      </div>
      <h3 className="text-[#5d8573] uppercase mb-4 font-bold tracking-widest flex items-center gap-2"><Terminal className="w-4 h-4"/> System Execution Audit</h3>
      
      {error && (
        <div className="text-[#fb7185] mb-4">{error}</div>
      )}

      <div className="space-y-3 font-mono max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-[#133c2e]">
        {logs.length === 0 ? (
          <div className="text-[#5d8573] text-center py-8">No logs found. Generate test data first.</div>
        ) : (
          logs.map(log => (
            <div key={log._id} className={`${getLevelColor(log.level)}`}>
              <span className="text-[#5d8573]">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
              {' '}
              <span className={`${getLevelColor(log.level)} font-bold`}>[{log.level}]</span>
              {' '}
              {log.source && <span className="text-[#5d8573]">({log.source})</span>}
              {' '}{log.message}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
