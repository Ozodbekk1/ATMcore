"use client";
import React, { useEffect, useState } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  Activity, 
  CheckCircle, 
  MapPin,
  Clock,
  AlertTriangle,
  Bell,
  BarChart3,
  List,
  Navigation,
  HeartPulse,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { StatCard } from '../components/StatCard';
import Link from 'next/link';
import { useAuth } from '../components/AuthContext';
import { fetchAtmList, fetchAlerts, type AtmData, type AlertData } from '../lib/api';

export default function ATMPlatform() {
  const { role } = useAuth();
  const isAdmin = role === 'ADMIN' || role === 'SUPERADMIN';

  const [atms, setAtms] = useState<AtmData[]>([]);
  const [alerts, setAlerts] = useState<AlertData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [atmRes, alertRes] = await Promise.all([
        fetchAtmList(1, 200),
        fetchAlerts(false),
      ]);
      setAtms(atmRes.data || []);
      setAlerts((alertRes.data || []).slice(0, 5));
    } catch (err: any) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Calculate stats from real data
  const totalCash = atms.reduce((sum, a) => sum + (a.currentCash || 0), 0);
  const totalCapacity = atms.reduce((sum, a) => sum + (a.capacity || 0), 0);
  const avgCashLevel = totalCapacity > 0 ? Math.round((totalCash / totalCapacity) * 100) : 0;
  const onlineAtms = atms.filter(a => a.status === 'ONLINE').length;
  const uptimePercent = atms.length > 0 ? ((onlineAtms / atms.length) * 100).toFixed(1) : '0';

  // Get top ATMs for display (mix of warning and optimal)
  const displayAtms = atms
    .map(a => ({
      ...a,
      cashPercent: a.capacity > 0 ? Math.round((a.currentCash / a.capacity) * 100) : 0,
    }))
    .sort((a, b) => a.cashPercent - b.cashPercent)
    .slice(0, 6);

  const activeAlertCount = alerts.filter(a => !a.resolved).length;

  const formatCurrency = (n: number) => {
    if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
    return `$${n}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] bg-[#03110d]">
        <div className="flex flex-col items-center gap-4 text-[#9de1b9]">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span className="font-mono text-sm tracking-widest uppercase">Loading System Data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 pb-8 sm:pb-12 max-w-7xl mx-auto w-full min-h-[calc(100vh-80px)] text-[#e2f1ea] bg-[#03110d] space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 border-b border-[#133c2e] pb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2 tracking-tight">System Overview</h1>
          <p className="text-[#78a390]">
            {isAdmin ? 'Daily snapshot of ATM operations and active network status.' : 'Find active ATMs and check network status.'}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto mt-4 sm:mt-0">
          <button onClick={loadData} className="bg-[#0a241c] hover:bg-[#12382c] text-[#9de1b9] border border-[#133c2e] px-4 py-2.5 rounded-xl font-bold text-sm tracking-wide transition-colors flex items-center gap-2">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
          <Link href="/live-map" className="bg-[#12382c] hover:bg-[#1a4a3a] text-[#9de1b9] border border-[#1c5542] px-4 py-2.5 rounded-xl font-bold text-sm tracking-wide transition-colors flex items-center gap-2">
            <BarChart3 className="w-4 h-4" /> Live Map
          </Link>
        </div>
      </div>

      {error && (
        <div className="bg-[#1f1115] border border-rose-900/30 text-[#fb7185] p-4 rounded-xl text-sm flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" /> {error}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {isAdmin ? (
          <>
            <StatCard 
              label="Total Cash Available" 
              value={formatCurrency(totalCash)} 
              trend={`${atms.length} ATMs`} 
              trendUp={true} 
              icon={<DollarSign className="w-5 h-5 text-[#9de1b9]" />} 
              bgClass="bg-[#0a241c] border-[#133c2e] hover:border-[#1c5542] transition-colors"
              iconBgClass="bg-[#12382c] border border-[#1c5542]"
            />
            <StatCard 
              label="Avg Cash Level" 
              value={`${avgCashLevel}%`} 
              trend={avgCashLevel < 30 ? 'Low' : avgCashLevel < 60 ? 'Moderate' : 'Healthy'} 
              trendUp={avgCashLevel >= 50} 
              icon={<Activity className="w-5 h-5 text-[#9de1b9]" />} 
              bgClass="bg-[#0a241c] border-[#133c2e] hover:border-[#1c5542] transition-colors"
              iconBgClass="bg-[#12382c] border border-[#1c5542]"
            />
          </>
        ) : (
          <>
            <StatCard 
              label="Nearby ATMs" 
              value={String(onlineAtms)} 
              trend={`${onlineAtms} available`} 
              trendUp={true} 
              icon={<Navigation className="w-5 h-5 text-[#9de1b9]" />} 
              bgClass="bg-[#0a241c] border-[#133c2e] hover:border-[#1c5542] transition-colors"
              iconBgClass="bg-[#12382c] border border-[#1c5542]"
            />
            <StatCard 
              label="Overall Network Health" 
              value={Number(uptimePercent) > 95 ? 'Good' : 'Fair'} 
              trend={Number(uptimePercent) > 95 ? 'All systems go' : 'Some issues'} 
              trendUp={Number(uptimePercent) > 95} 
              icon={<HeartPulse className="w-5 h-5 text-[#9de1b9]" />} 
              bgClass="bg-[#0a241c] border-[#133c2e] hover:border-[#1c5542] transition-colors"
              iconBgClass="bg-[#12382c] border border-[#1c5542]"
            />
          </>
        )}
        
        <StatCard 
          label="Total ATMs" 
          value={String(atms.length)} 
          trend={`${onlineAtms} online`} 
          trendUp={true} 
          icon={<TrendingUp className="w-5 h-5 text-[#9de1b9]" />} 
          bgClass="bg-[#0a241c] border-[#133c2e] hover:border-[#1c5542] transition-colors"
          iconBgClass="bg-[#12382c] border border-[#1c5542]"
        />
        <StatCard 
          label="Network Uptime" 
          value={`${uptimePercent}%`} 
          trend={`${atms.length - onlineAtms} offline`} 
          trendUp={Number(uptimePercent) > 95} 
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
            {displayAtms.length === 0 ? (
              <div className="bg-[#0a241c] p-8 rounded-2xl border border-[#133c2e] text-center">
                <p className="text-[#78a390] text-sm">No ATM data available yet. 
                  {isAdmin && <Link href="/api/admin/generate-data" className="text-[#9de1b9] underline ml-1">Generate test data</Link>}
                </p>
              </div>
            ) : (
              displayAtms.map((node) => {
                const isWarn = node.cashPercent <= 20;
                const isCrit = node.cashPercent <= 10;
                
                return (
                  <div key={node._id} className={`bg-[#0a241c] p-6 rounded-2xl border transition-colors ${
                    isCrit ? 'border-[#fb7185]/30' : isWarn ? 'border-amber-500/30' : 'border-[#133c2e]'
                  }`}>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-bold text-[#e2f1ea] text-lg mb-1">{node.branch}</h4>
                        <p className="text-sm text-[#78a390] flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {node.atmId}</p>
                      </div>
                      <span className={`px-3 py-1 text-xs font-bold rounded-full border ${
                        isCrit ? 'bg-[#fb7185]/10 text-[#fb7185] border-[#fb7185]/30' : 
                        isWarn ? 'bg-amber-500/10 text-amber-500 border-amber-500/30' : 
                        'bg-[#12382c] text-[#9de1b9] border-[#1c5542]'
                      }`}>
                        {isCrit ? (isAdmin ? 'Critical' : 'Low Cash') : isWarn ? (isAdmin ? 'Warning' : 'Low Cash') : (isAdmin ? 'Optimal' : 'Available')}
                      </span>
                    </div>
                    
                    {isAdmin ? (
                      <div className="space-y-2">
                         <div className="flex justify-between items-end">
                           <span className="text-sm text-[#78a390]">Cash Level</span>
                           <span className={`text-2xl font-bold ${isCrit ? 'text-[#fb7185]' : isWarn ? 'text-amber-500' : 'text-[#e2f1ea]'}`}>{node.cashPercent}%</span>
                         </div>
                         <div className="h-3 w-full bg-[#03110d] rounded-full overflow-hidden border border-[#133c2e]">
                           <div 
                             className={`h-full rounded-full ${isCrit ? 'bg-[#fb7185]' : isWarn ? 'bg-amber-500' : 'bg-[#9de1b9]'}`} 
                             style={{ width: `${node.cashPercent}%` }}
                           />
                         </div>
                         <div className="flex justify-between text-xs text-[#5d8573] font-mono mt-1">
                           <span>{formatCurrency(node.currentCash)}</span>
                           <span>/ {formatCurrency(node.capacity)}</span>
                         </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-sm text-[#78a390] bg-[#03110d] p-3 rounded-xl border border-[#133c2e]">
                        <CheckCircle className={`w-4 h-4 ${isCrit || isWarn ? 'text-amber-500' : 'text-[#9de1b9]'}`} />
                        Terminal is currently functioning and accepting requests.
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Recent Alerts (Hide entirely for normal users) */}
        {isAdmin && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-[#e2f1ea]">Recent Alerts</h3>
              <div className={`${activeAlertCount > 0 ? 'bg-[#1f1115] text-[#fb7185] border-rose-900/30' : 'bg-[#12382c] text-[#9de1b9] border-[#1c5542]'} border px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5`}>
                <Bell className="h-3 w-3" /> {activeAlertCount} Active
              </div>
            </div>
            
            <div className="space-y-3">
              {alerts.length === 0 ? (
                <div className="bg-[#0a241c] border border-[#133c2e] p-5 rounded-2xl text-center">
                  <p className="text-[#78a390] text-sm">No recent alerts</p>
                </div>
              ) : (
                alerts.map(alert => {
                  const isCritical = alert.severity === 'CRITICAL' || alert.severity === 'HIGH';
                  return (
                    <div key={alert._id} className="bg-[#0a241c] border border-[#133c2e] p-5 rounded-2xl flex gap-4 transition-colors">
                      <div className={`${isCritical ? 'bg-[#1f1115] border-[#fb7185]/30' : 'bg-[#241e17] border-amber-900/40'} border p-2.5 rounded-xl h-max`}>
                        {isCritical ? <AlertTriangle className="h-5 w-5 text-[#fb7185]" /> : <Activity className="h-5 w-5 text-amber-500" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h5 className="font-bold text-[#e2f1ea] text-sm mb-1 flex items-center gap-2">
                          {alert.atmId}
                          <span className={`text-[9px] px-1.5 py-0.5 rounded-md border font-mono ${
                            alert.severity === 'CRITICAL' ? 'bg-[#fb7185]/10 text-[#fb7185] border-[#fb7185]/30' :
                            alert.severity === 'HIGH' ? 'bg-amber-500/10 text-amber-500 border-amber-500/30' :
                            'bg-[#12382c] text-[#78a390] border-[#133c2e]'
                          }`}>{alert.severity}</span>
                        </h5>
                        <p className="text-xs text-[#78a390] mb-3 line-clamp-2">{alert.message}</p>
                        <div className="flex items-center text-xs text-[#5d8573] font-mono">
                          <Clock className="w-3 h-3 mr-1" /> {new Date(alert.triggeredAt).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}

              {alerts.length > 0 && (
                <Link href="/alerts" className="block text-center text-xs text-[#9de1b9] hover:underline py-2 font-semibold">
                  View All Alerts →
                </Link>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}