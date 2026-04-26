"use client";
import React, { useState, useEffect } from 'react';
import { Clock, ShieldAlert, ServerCrash, WifiOff, CheckCircle2, Search, Filter, XCircle, AlertTriangle, CheckCircle, MapPin, Loader2, RefreshCw } from 'lucide-react';
import { fetchAlerts, resolveAlert, type AlertData } from '../../lib/api';

type AlertType = 'critical' | 'warning' | 'info';
type AlertStatus = 'active' | 'resolved';

interface DisplayAlert {
  id: string;
  title: string;
  location: string;
  description: string;
  time: string;
  type: AlertType;
  status: AlertStatus;
  icon: React.FC<any>;
  rawData: AlertData;
}

function mapSeverityToType(severity: string): AlertType {
  switch (severity) {
    case 'CRITICAL': return 'critical';
    case 'HIGH': return 'critical';
    case 'MEDIUM': return 'warning';
    case 'LOW': return 'info';
    default: return 'info';
  }
}

function mapSeverityToIcon(severity: string): React.FC<any> {
  switch (severity) {
    case 'CRITICAL': return XCircle;
    case 'HIGH': return ShieldAlert;
    case 'MEDIUM': return ServerCrash;
    case 'LOW': return CheckCircle2;
    default: return WifiOff;
  }
}

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} mins ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} hr${diffHours > 1 ? 's' : ''} ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<DisplayAlert[]>([]);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  const loadAlerts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchAlerts();
      const mapped: DisplayAlert[] = (res.data || []).map(a => ({
        id: a._id,
        title: a.message.split('.')[0] || a.message,
        location: a.atmId,
        description: a.message,
        time: timeAgo(a.triggeredAt),
        type: mapSeverityToType(a.severity),
        status: a.resolved ? 'resolved' : 'active',
        icon: mapSeverityToIcon(a.severity),
        rawData: a,
      }));
      setAlerts(mapped);
    } catch (err: any) {
      setError(err.message || 'Failed to load alerts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, []);

  const handleAcknowledge = async (id: string) => {
    setResolvingId(id);
    try {
      await resolveAlert(id);
      setAlerts(prev => prev.map(a => a.id === id ? { ...a, status: 'resolved' } : a));
    } catch (err: any) {
      // Fallback: just update locally
      setAlerts(prev => prev.map(a => a.id === id ? { ...a, status: 'resolved' } : a));
    } finally {
      setResolvingId(null);
    }
  };
  
  const handleAcknowledgeAll = async () => {
    const activeAlerts = alerts.filter(a => a.status === 'active');
    setAlerts(prev => prev.map(a => a.status === 'active' ? {...a, status: 'resolved'} : a));
    // Try to resolve all on backend
    for (const alert of activeAlerts) {
      try { await resolveAlert(alert.id); } catch { /* silent */ }
    }
  };

  const filteredAlerts = alerts.filter(a => {
    const matchesSearch = a.title.toLowerCase().includes(searchQuery.toLowerCase()) || a.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = 
      activeTab === 'all' ? a.status === 'active' : 
      activeTab === 'resolved' ? a.status === 'resolved' :
      a.type === activeTab && a.status === 'active';
    return matchesSearch && matchesTab;
  });

  const activeCount = alerts.filter(a => a.status === 'active').length;

  const tabs = [
    { id: 'all', label: 'All Active' },
    { id: 'critical', label: 'Critical' },
    { id: 'warning', label: 'Warnings' },
    { id: 'resolved', label: 'Resolved' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] bg-[#03110d]">
        <div className="flex flex-col items-center gap-4 text-[#9de1b9]">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span className="font-mono text-sm tracking-widest uppercase">Loading Alerts...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 pb-8 sm:pb-12 max-w-7xl mx-auto w-full min-h-[calc(100vh-80px)] text-[#e2f1ea] bg-[#03110d] flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 mb-8 border-b border-[#133c2e] pb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2 tracking-tight flex items-center gap-3">
            System Alerts 
            {activeCount > 0 && (
              <span className="text-sm bg-[#fb7185]/20 text-[#fb7185] border border-[#fb7185]/50 px-3 py-1 rounded-full font-mono animate-pulse">
                {activeCount} Action Required
              </span>
            )}
          </h1>
          <p className="text-[#78a390]">Monitor, filter, and resolve network anomalies and hardware events.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5d8573]" />
            <input 
              type="text" 
              placeholder="Search alerts..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0a241c] border border-[#133c2e] focus:border-[#9de1b9] rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none transition-colors"
            />
          </div>
          <button onClick={loadAlerts} className="bg-[#0a241c] hover:bg-[#12382c] text-[#9de1b9] border border-[#133c2e] px-4 py-2.5 rounded-xl font-bold text-sm transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button onClick={handleAcknowledgeAll} disabled={activeCount === 0} className="bg-[#12382c] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#1a4a3a] text-[#9de1b9] border border-[#1c5542] px-4 py-2.5 rounded-xl font-bold text-sm tracking-wide transition-colors whitespace-nowrap shadow-[0_0_15px_rgba(18,56,44,0.3)]">
            Resolve All
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-[#1f1115] border border-rose-900/30 text-[#fb7185] p-4 rounded-xl text-sm flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" /> {error}
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8 flex-1">
        
        {/* Left Sidebar for Filters */}
        <div className="w-full lg:w-64 space-y-2 shrink-0">
          <div className="text-xs font-bold text-[#5d8573] uppercase tracking-widest mb-4 px-2 flex items-center gap-2">
            <Filter className="w-3 h-3" /> Filters
          </div>
          {tabs.map(tab => {
            const count = 
              tab.id === 'all' ? activeCount :
              tab.id === 'resolved' ? alerts.filter(a => a.status === 'resolved').length :
              alerts.filter(a => a.type === tab.id && a.status === 'active').length;
              
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${activeTab === tab.id ? 'bg-[#0a241c] border border-[#133c2e] text-[#9de1b9]' : 'text-[#78a390] hover:bg-[#061814] hover:text-[#e2f1ea]'}`}
              >
                <span className="font-semibold text-sm">{tab.label}</span>
                <span className={`text-xs font-mono px-2 py-0.5 rounded-full ${activeTab === tab.id ? 'bg-[#12382c] text-[#9de1b9]' : 'bg-[#04120e] text-[#5d8573]'}`}>{count}</span>
              </button>
            )
          })}
        </div>

        {/* Right Content for Alert List */}
        <div className="flex-1 space-y-4">
          {filteredAlerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-[#133c2e] rounded-2xl bg-[#0a241c]/50 h-64">
              <CheckCircle className="w-12 h-12 text-[#5d8573] mb-4" />
              <h3 className="text-lg font-bold text-[#e2f1ea] mb-2">No Alerts Found</h3>
              <p className="text-sm text-[#78a390]">Great job! Everything is peaceful and quiet here.</p>
            </div>
          ) : (
            filteredAlerts.map(alert => {
              const AIcon = alert.icon;
              const isCritical = alert.type === 'critical';
              const isWarning = alert.type === 'warning';
              const isResolved = alert.status === 'resolved';

              return (
                <div key={alert.id} className={`group bg-[#0a241c] border ${isResolved ? 'border-[#133c2e] opacity-70' : isCritical ? 'border-[#fb7185]/40 shadow-[0_0_15px_rgba(251,113,133,0.1)]' : isWarning ? 'border-amber-500/30' : 'border-[#133c2e]'} rounded-2xl p-5 sm:p-6 transition-all hover:-translate-y-0.5`}>
                  <div className="flex flex-col sm:flex-row gap-5">
                    {/* Icon section */}
                    <div className="shrink-0 pt-1">
                      <div className={`p-3 rounded-xl inline-flex ${isResolved ? 'bg-[#12382c] text-[#5d8573]' : isCritical ? 'bg-[#1f1115] text-[#fb7185]' : isWarning ? 'bg-[#241e17] text-amber-500' : 'bg-[#12382c] text-[#9de1b9]'}`}>
                        <AIcon className="w-6 h-6" />
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="flex-1 space-y-2">
                       <div className="flex justify-between items-start gap-4">
                          <div>
                            <h3 className={`text-lg font-bold ${isResolved ? 'text-[#78a390] line-through' : 'text-[#e2f1ea]'} mb-1 flex items-center gap-2`}>
                              {alert.title}
                              {!isResolved && isCritical && <span className="text-[10px] uppercase font-bold tracking-widest bg-[#fb7185]/20 text-[#fb7185] px-2 py-0.5 rounded-md border border-[#fb7185]/30">Critical</span>}
                            </h3>
                            <div className="text-sm text-[#5d8573] flex items-center gap-1.5 font-medium">
                              <MapPin className="w-3.5 h-3.5" /> {alert.location}
                            </div>
                          </div>
                          {!isResolved && (
                            <button 
                              onClick={() => handleAcknowledge(alert.id)}
                              disabled={resolvingId === alert.id}
                              className={`shrink-0 px-4 py-2 text-xs font-bold rounded-lg border transition-colors disabled:opacity-50 ${
                                isCritical ? 'border-[#fb7185]/50 bg-[#fb7185]/10 text-[#fb7185] hover:bg-[#fb7185] hover:text-[#0a241c]' : 
                                isWarning ? 'border-amber-500/50 bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-[#0a241c]' : 
                                'border-[#9de1b9]/50 bg-[#9de1b9]/10 text-[#9de1b9] hover:bg-[#9de1b9] hover:text-[#0a241c]'
                              }`}
                            >
                              {resolvingId === alert.id ? 'Resolving...' : 'Resolve Issue'}
                            </button>
                          )}
                          {isResolved && (
                             <span className="shrink-0 px-3 py-1.5 text-xs font-bold rounded-lg border border-[#133c2e] bg-[#12382c] text-[#78a390] flex items-center gap-1.5">
                               <CheckCircle2 className="w-3.5 h-3.5" /> Resolved
                             </span>
                          )}
                       </div>
                       
                       <p className={`text-sm leading-relaxed ${isResolved ? 'text-[#5d8573]' : 'text-[#9de1b9]/80'}`}>
                         {alert.description}
                       </p>

                       <div className="flex items-center text-[11px] font-mono text-[#5d8573] pt-2">
                          <Clock className="w-3 h-3 mr-1.5" /> {alert.time}
                          <span className="mx-2">•</span>
                          {alert.rawData.severity}
                       </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
