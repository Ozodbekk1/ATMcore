"use client";

import React, { useState } from 'react';
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
  Server
} from 'lucide-react';

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
        <TabButton active={activeTab === 'dispatch'} onClick={() => setActiveTab('dispatch')} icon={<Activity />} label="Logistics Sync" />
        {isSuper && <TabButton active={activeTab === 'users'} onClick={() => setActiveTab('users')} icon={<Users />} label="Access Roster" />}
        {isSuper && <TabButton active={activeTab === 'logs'} onClick={() => setActiveTab('logs')} icon={<Terminal />} label="System Audit" />}
      </div>

      {/* Content Areas */}
      <div className="min-h-[500px]">
        {activeTab === 'network' && <NetworkControl />}
        {activeTab === 'dispatch' && <DispatchControl />}
        {activeTab === 'users' && isSuper && <UserManagement />}
        {activeTab === 'logs' && isSuper && <SystemLogs />}
      </div>

    </div>
  );
}

// ----------------------------------------------------
// SUBCOMPONENTS
// ----------------------------------------------------

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

// --- Network Control (ATMs) ---
function NetworkControl() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-[#0a241c] p-4 rounded-2xl border border-[#133c2e]">
         <div className="flex items-center gap-4">
            <div className="p-3 bg-[#061814] rounded-xl"><Database className="text-[#9de1b9] w-5 h-5"/></div>
            <div>
               <h3 className="text-[#e2f1ea] font-bold">ATM Node Registry</h3>
               <p className="text-xs text-[#78a390]">Provision, calibrate, or disable ATM terminals.</p>
            </div>
         </div>
         <button className="flex items-center gap-2 bg-[#9de1b9] text-[#071a14] px-4 py-2 rounded-xl text-sm font-bold shadow-[0_0_15px_rgba(157,225,185,0.4)] hover:bg-[#b0ebd1] transition-colors">
           <Plus className="w-4 h-4" /> Provision Node
         </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* Mock Nodes List */}
         {[1,2,3].map(i => (
           <div key={i} className="bg-[#04120e] border border-[#133c2e] p-5 rounded-2xl relative overflow-hidden group">
             <div className="flex justify-between items-start mb-4">
               <div>
                  <div className="text-[10px] text-[#9de1b9] bg-[#12382c] px-2 py-0.5 rounded-sm inline-block font-mono tracking-widest mb-1.5">NODE-{i}00X</div>
                  <h4 className="text-[#e2f1ea] font-medium">Regional Core {i}</h4>
               </div>
               <span className="w-2 h-2 rounded-full bg-[#9de1b9] shadow-[0_0_8px_#9de1b9]"></span>
             </div>
             
             <div className="space-y-2 mb-6 border-b border-[#133c2e]/50 pb-4">
                <div className="flex justify-between text-xs">
                   <span className="text-[#5d8573]">IP Binding</span>
                   <span className="font-mono text-[#78a390]">192.168.10.{i}5</span>
                </div>
                <div className="flex justify-between text-xs">
                   <span className="text-[#5d8573]">Capacity Limit</span>
                   <span className="font-mono text-[#78a390]">$250,000</span>
                </div>
             </div>

             <div className="flex gap-2">
                <button className="flex-1 bg-[#12382c] text-[#9de1b9] text-xs font-semibold py-2 rounded-lg border border-[#1c5542] hover:bg-[#1a4a3a]">Calibrate</button>
                <button className="p-2 bg-[#1f1115] text-[#fb7185] rounded-lg border border-rose-900/40 hover:bg-[#2b161c]" title="Deactivate"><Trash2 className="w-4 h-4" /></button>
             </div>
           </div>
         ))}
      </div>
    </div>
  );
}

// --- Logistics & Dispatch ---
function DispatchControl() {
  return (
    <div className="space-y-6">
       <div className="bg-[#0a241c] p-6 rounded-2xl border border-[#133c2e]">
          <h3 className="text-lg font-bold text-[#e2f1ea] mb-4">Fleet & Route Assignments</h3>
          <p className="text-sm text-[#78a390] mb-6">Assign armored transport schedules and adjust logic boundaries for AI predictions.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="p-4 bg-[#04120e] rounded-xl border border-[#133c2e]">
                <h4 className="text-[#9de1b9] font-mono text-xs uppercase mb-3 border-b border-[#133c2e] pb-2">Active Protocols</h4>
                <div className="space-y-3">
                   <div className="flex justify-between items-center text-sm">
                     <span className="text-[#e2f1ea]">Dynamic Routing AI</span>
                     <div className="w-10 h-5 bg-[#9de1b9] rounded-full relative"><div className="absolute right-1 top-1 w-3 h-3 bg-[#071a14] rounded-full"></div></div>
                   </div>
                   <div className="flex justify-between items-center text-sm">
                     <span className="text-[#e2f1ea]">Predictive Pre-Fill</span>
                     <div className="w-10 h-5 bg-[#9de1b9] rounded-full relative"><div className="absolute right-1 top-1 w-3 h-3 bg-[#071a14] rounded-full"></div></div>
                   </div>
                </div>
             </div>
             
             <div className="p-4 bg-[#04120e] border border-amber-900/30 rounded-xl relative overflow-hidden">
                <h4 className="text-amber-400 font-mono text-xs uppercase mb-3 border-b border-amber-900/30 pb-2">Emergency Override</h4>
                <p className="text-xs text-amber-200/60 mb-4">Manually seize control of route distribution to bypass AI.</p>
                <button className="w-full bg-amber-500/10 text-amber-400 border border-amber-500/30 font-bold py-2 rounded-lg text-sm hover:bg-amber-500/20 transition-all">
                  Initiate Manual Sync
                </button>
             </div>
          </div>
       </div>
    </div>
  );
}

// --- User Management (Superadmin Only) ---
function UserManagement() {
  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center mb-4">
         <h3 className="text-xl font-bold text-[#e2f1ea]">Access Clearance Roster</h3>
         <button className="bg-[#12382c] border border-[#1c5542] text-[#9de1b9] px-4 py-2 rounded-xl text-sm hover:bg-[#1a4a3a]">Export List</button>
       </div>
       
       <div className="bg-[#0a241c] border border-[#133c2e] rounded-2xl overflow-hidden shadow-2xl">
         <table className="w-full text-left border-collapse">
           <thead>
             <tr className="bg-[#061814] border-b border-[#133c2e]">
               <th className="px-6 py-4 text-xs tracking-widest text-[#5d8573] uppercase font-bold">Operative Name</th>
               <th className="px-6 py-4 text-xs tracking-widest text-[#5d8573] uppercase font-bold">Email Config</th>
               <th className="px-6 py-4 text-xs tracking-widest text-[#5d8573] uppercase font-bold">Role Matrix</th>
               <th className="px-6 py-4 text-xs tracking-widest text-[#5d8573] uppercase font-bold text-right">Actions</th>
             </tr>
           </thead>
           <tbody className="divide-y divide-[#133c2e]/50 text-sm">
             <tr className="hover:bg-[#071a14] transition-colors">
               <td className="px-6 py-4 font-semibold text-[#e2f1ea]">Alex Morgan</td>
               <td className="px-6 py-4 text-[#78a390] font-mono text-xs">admin@atm.uz</td>
               <td className="px-6 py-4"><span className="bg-[#1f4a38] text-[#9de1b9] px-2 py-1 rounded text-[10px] font-bold">ADMIN</span></td>
               <td className="px-6 py-4 text-right">
                 <button className="text-[#5d8573] hover:text-[#9de1b9] mr-3"><Settings className="w-4 h-4 inline"/></button>
                 <button className="text-[#5d8573] hover:text-[#fb7185]"><Lock className="w-4 h-4 inline"/></button>
               </td>
             </tr>
             <tr className="hover:bg-[#071a14] transition-colors">
               <td className="px-6 py-4 font-semibold text-[#e2f1ea]">Root Master</td>
               <td className="px-6 py-4 text-[#78a390] font-mono text-xs">super@atm.uz</td>
               <td className="px-6 py-4"><span className="bg-[#9de1b9] text-[#071a14] px-2 py-1 rounded text-[10px] font-bold">SUPERADMIN</span></td>
               <td className="px-6 py-4 text-right">
                 <button className="text-[#5d8573] hover:text-[#9de1b9] mr-3" disabled><Settings className="w-4 h-4 inline opacity-50"/></button>
                 <button className="text-[#5d8573] hover:text-[#fb7185]" disabled><Eye className="w-4 h-4 inline opacity-50"/></button>
               </td>
             </tr>
             <tr className="hover:bg-[#071a14] transition-colors">
               <td className="px-6 py-4 font-semibold text-[#e2f1ea]">Field Tech #1</td>
               <td className="px-6 py-4 text-[#78a390] font-mono text-xs">tech1@atm.uz</td>
               <td className="px-6 py-4"><span className="bg-[#12382c] text-[#78a390] px-2 py-1 rounded text-[10px] font-bold">USER</span></td>
               <td className="px-6 py-4 text-right">
                 <button className="text-[#5d8573] hover:text-[#9de1b9] mr-3"><Settings className="w-4 h-4 inline"/></button>
                 <button className="text-[#5d8573] hover:text-[#fb7185]"><Lock className="w-4 h-4 inline"/></button>
               </td>
             </tr>
           </tbody>
         </table>
       </div>
    </div>
  );
}

// --- System Logs (Superadmin Only) ---
function SystemLogs() {
  return (
    <div className="bg-[#03110d] border border-[#133c2e] p-6 rounded-2xl font-mono text-xs shadow-inner relative">
      <div className="absolute top-4 right-4 flex gap-2">
         <div className="w-2 h-2 rounded-full bg-[#9de1b9] animate-pulse"></div>
         <span className="text-[#5d8573] text-[10px]">LIVE TAIL</span>
      </div>
      <h3 className="text-[#5d8573] uppercase mb-4 font-bold tracking-widest flex items-center gap-2"><Terminal className="w-4 h-4"/> System Execution Audit</h3>
      
      <div className="space-y-3 font-mono">
        <div className="text-[#78a390]"><span className="text-[#5d8573]">[12:44:03]</span> [AUTH] Validated signature for 'admin@atm.uz'</div>
        <div className="text-[#e2f1ea]"><span className="text-[#5d8573]">[12:48:11]</span> [NODE] Admin executed bypass cache on Route Alpha</div>
        <div className="text-amber-400"><span className="text-[#5d8573]">[12:51:30]</span> [WARN] High latency detected on socket connection (512ms)</div>
        <div className="text-[#fb7185]"><span className="text-[#5d8573]">[12:55:01]</span> [CRIT] Unhandled route conflict in 'Nukus Terminal' dispatch</div>
        <div className="text-[#78a390]"><span className="text-[#5d8573]">[13:02:14]</span> [AUTH] 'super@atm.uz' engaged root shell privileges</div>
        <div className="text-[#9de1b9]"><span className="text-[#5d8573]">[13:05:44]</span> [SYNC] Database replication confirmed on standby shard</div>
      </div>
    </div>
  );
}
