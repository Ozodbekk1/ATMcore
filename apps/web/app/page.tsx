"use client";
import React from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  Activity, 
  CheckCircle, 
  MapPin,
  Clock,
  ChevronRight,
  AlertTriangle,
  Bell,
  BarChart3,
  List,
  Navigation,
  HeartPulse
} from 'lucide-react';
import { StatCard } from '../components/StatCard';
import Link from 'next/link';
import { useAuth } from '../components/AuthContext';

export default function ATMPlatform() {
  const { role } = useAuth();
  const isAdmin = role === 'admin' || role === 'superadmin';

  const atms = [
    { name: "Downtown Financial District", cash: "85%", rawCash: 85, status: "optimal", location: "Main Street Branch" },
    { name: "Nukus Terminal", cash: "15%", rawCash: 15, status: "warning", location: "Amudaryo Mahalla" },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto w-full min-h-[calc(100vh-80px)] text-[#e2f1ea] bg-[#03110d] space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 border-b border-[#133c2e] pb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2 tracking-tight">System Overview</h1>
          <p className="text-[#78a390]">
            {isAdmin ? 'Daily snapshot of ATM operations and active network status.' : 'Find active ATMs and check network status.'}
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/live-map" className="bg-[#12382c] hover:bg-[#1a4a3a] text-[#9de1b9] border border-[#1c5542] px-4 py-2.5 rounded-xl font-bold text-sm tracking-wide transition-colors flex items-center gap-2">
            <BarChart3 className="w-4 h-4" /> Live Map
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {isAdmin ? (
          <>
            <StatCard 
              label="Total Cash Available" 
              value="$2.4M" 
              trend="+5.2%" 
              trendUp={true} 
              icon={<DollarSign className="w-5 h-5 text-[#9de1b9]" />} 
              bgClass="bg-[#0a241c] border-[#133c2e] hover:border-[#1c5542] transition-colors"
              iconBgClass="bg-[#12382c] border border-[#1c5542]"
            />
            <StatCard 
              label="Avg Cash Level" 
              value="51%" 
              trend="-2.1%" 
              trendUp={false} 
              icon={<Activity className="w-5 h-5 text-[#9de1b9]" />} 
              bgClass="bg-[#0a241c] border-[#133c2e] hover:border-[#1c5542] transition-colors"
              iconBgClass="bg-[#12382c] border border-[#1c5542]"
            />
          </>
        ) : (
          <>
            <StatCard 
              label="Nearby ATMs" 
              value="12" 
              trend="+2 available" 
              trendUp={true} 
              icon={<Navigation className="w-5 h-5 text-[#9de1b9]" />} 
              bgClass="bg-[#0a241c] border-[#133c2e] hover:border-[#1c5542] transition-colors"
              iconBgClass="bg-[#12382c] border border-[#1c5542]"
            />
            <StatCard 
              label="Overall Network Health" 
              value="Good" 
              trend="All systems go" 
              trendUp={true} 
              icon={<HeartPulse className="w-5 h-5 text-[#9de1b9]" />} 
              bgClass="bg-[#0a241c] border-[#133c2e] hover:border-[#1c5542] transition-colors"
              iconBgClass="bg-[#12382c] border border-[#1c5542]"
            />
          </>
        )}
        
        <StatCard 
          label="Daily Transactions" 
          value="45,210" 
          trend="+12.5%" 
          trendUp={true} 
          icon={<TrendingUp className="w-5 h-5 text-[#9de1b9]" />} 
          bgClass="bg-[#0a241c] border-[#133c2e] hover:border-[#1c5542] transition-colors"
          iconBgClass="bg-[#12382c] border border-[#1c5542]"
        />
        <StatCard 
          label="Network Uptime" 
          value="99.8%" 
          trend="+0.1%" 
          trendUp={true} 
          icon={<CheckCircle className="w-5 h-5 text-[#9de1b9]" />} 
          bgClass="bg-[#0a241c] border-[#133c2e] hover:border-[#1c5542] transition-colors"
          iconBgClass="bg-[#12382c] border border-[#1c5542]"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* ATMs Overview */}
        <div className="xl:col-span-2 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-[#e2f1ea] flex items-center gap-2">
              <List className="w-5 h-5 text-[#5d8573]" /> Main Terminals
            </h3>
          </div>
          
          <div className="space-y-4">
            {atms.map((node, idx) => {
              const isWarn = node.status === 'warning';
              
              return (
                <div key={idx} className={`bg-[#0a241c] p-6 rounded-2xl border transition-colors ${
                  isWarn ? 'border-amber-500/30' : 'border-[#133c2e]'
                }`}>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-bold text-[#e2f1ea] text-lg mb-1">{node.name}</h4>
                      <p className="text-sm text-[#78a390] flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {node.location}</p>
                    </div>
                    {/* Public status text instead of "Warning" / "Optimal" */}
                    <span className={`px-3 py-1 text-xs font-bold rounded-full border ${
                      isWarn ? 'bg-amber-500/10 text-amber-500 border-amber-500/30' : 'bg-[#12382c] text-[#9de1b9] border-[#1c5542]'
                    }`}>
                      {isWarn ? (isAdmin ? 'Warning' : 'Low Cash') : (isAdmin ? 'Optimal' : 'Available')}
                    </span>
                  </div>
                  
                  {isAdmin ? (
                    <div className="space-y-2">
                       <div className="flex justify-between items-end">
                         <span className="text-sm text-[#78a390]">Cash Level</span>
                         <span className={`text-2xl font-bold ${isWarn ? 'text-amber-500' : 'text-[#e2f1ea]'}`}>{node.cash}</span>
                       </div>
                       <div className="h-3 w-full bg-[#03110d] rounded-full overflow-hidden border border-[#133c2e]">
                         <div 
                           className={`h-full rounded-full ${isWarn ? 'bg-amber-500' : 'bg-[#9de1b9]'}`} 
                           style={{ width: node.cash }}
                         />
                       </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-sm text-[#78a390] bg-[#03110d] p-3 rounded-xl border border-[#133c2e]">
                      <CheckCircle className={`w-4 h-4 ${isWarn ? 'text-amber-500' : 'text-[#9de1b9]'}`} />
                      Terminal is currently functioning and accepting requests.
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Alerts (Hide entirely for normal users, they don't need to see system jams) */}
        {isAdmin && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-[#e2f1ea]">Recent Alerts</h3>
              <div className="bg-[#1f1115] text-[#fb7185] border border-rose-900/30 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5">
                <Bell className="h-3 w-3" /> 2 New
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="bg-[#0a241c] border border-[#133c2e] p-5 rounded-2xl flex gap-4 transition-colors">
                <div className="bg-[#1f1115] border border-[#fb7185]/30 p-2.5 rounded-xl h-max">
                  <AlertTriangle className="h-5 w-5 text-[#fb7185]" />
                </div>
                <div>
                  <h5 className="font-bold text-[#e2f1ea] text-sm mb-1">Receipt Printer Jam</h5>
                  <p className="text-xs text-[#78a390] mb-3">Westside Mall terminal is degraded. Technician recommended.</p>
                  <div className="flex items-center text-xs text-[#5d8573] font-mono">
                    <Clock className="w-3 h-3 mr-1" /> 09:15 AM
                  </div>
                </div>
              </div>

              <div className="bg-[#0a241c] border border-[#133c2e] p-5 rounded-2xl flex gap-4 transition-colors">
                <div className="bg-[#241e17] border border-amber-900/40 p-2.5 rounded-xl h-max">
                  <Activity className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <h5 className="font-bold text-[#e2f1ea] text-sm mb-1">Network Latency</h5>
                  <p className="text-xs text-[#78a390] mb-3">South Park Branch responding slowly (500ms).</p>
                  <div className="flex items-center text-xs text-[#5d8573] font-mono">
                    <Clock className="w-3 h-3 mr-1" /> 08:42 AM
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}