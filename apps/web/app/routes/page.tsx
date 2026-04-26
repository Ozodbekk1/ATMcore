"use client";
import React, { useState, useEffect } from 'react';
import { Route as RouteIcon, Truck, Map, CheckCircle2, Search, Filter, Clock, MapPin, Wrench, ShieldAlert, Loader2, RefreshCw, Zap } from 'lucide-react';
import { useBadges, defaultBadges } from '../../components/BadgeContext';
import { fetchOptimizedRoutes, fetchAtmList, type OptimizedRoute, type AtmData } from '../../lib/api';

type RouteType = 'refill' | 'maintenance' | 'emergency';
type RouteStatus = 'pending' | 'dispatched' | 'in-progress' | 'completed';

interface RouteStop {
  name: string;
  status: 'pending' | 'completed';
}

interface TransportRoute {
  id: string;
  name: string;
  driver: string;
  vehicle: string;
  type: RouteType;
  status: RouteStatus;
  progress: number;
  estimatedCompletion: string;
  stops: RouteStop[];
  totalDistance: number;
  priorityScore: number;
}

const drivers = ['M. Tursunov', 'S. Jalilov', 'K. Alimov', 'D. Karimov', 'B. Azimov', 'T. Nurov'];
const vehicles = ['Armored TS-04', 'Service SV-12', 'Armored TS-01', 'Armored TS-08', 'Armored TS-02', 'Service SV-05'];

function buildDisplayRoutes(optimized: OptimizedRoute[], atms: AtmData[]): TransportRoute[] {
  const atmMap: Record<string, AtmData> = {};
  atms.forEach(a => { atmMap[a.atmId] = a; });
  
  return optimized.map((route, idx) => {
    const isEmergency = route.priorityScore > 80;
    const isMaintenance = route.priorityScore < 55;
    const type: RouteType = isEmergency ? 'emergency' : isMaintenance ? 'maintenance' : 'refill';
    const completedCount = Math.floor(Math.random() * route.route.length);
    
    const stops: RouteStop[] = route.route.map((atmId, i) => ({
      name: atmMap[atmId]?.branch || atmId,
      status: i < completedCount ? 'completed' : 'pending',
    }));

    const progress = route.route.length > 0 ? Math.round((completedCount / route.route.length) * 100) : 0;
    const statusMap: RouteStatus[] = ['in-progress', 'dispatched', 'pending'];
    const status = progress === 100 ? 'completed' : statusMap[idx % 3] || 'pending';

    return {
      id: `RT-${String(idx + 1).padStart(2, '0')}`,
      name: `Route ${String.fromCharCode(65 + idx)} - ${type === 'refill' ? 'Cash Replenishment' : type === 'maintenance' ? 'System Diagnostics' : 'Priority Escort'}`,
      driver: drivers[idx % drivers.length],
      vehicle: vehicles[idx % vehicles.length],
      type,
      status,
      progress,
      estimatedCompletion: progress === 100 ? 'Completed' : `${14 + idx}:${String(idx * 15 % 60).padStart(2, '0')}`,
      stops,
      totalDistance: route.totalDistance,
      priorityScore: route.priorityScore,
    };
  });
}

export default function RoutesPage() {
  const [routes, setRoutes] = useState<TransportRoute[]>([]);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [optimizing, setOptimizing] = useState(false);

  const { badges, mounted } = useBadges();
  const routesBadge = mounted ? badges.routes : defaultBadges.routes;

  const loadRoutes = async () => {
    setLoading(true);
    setError(null);
    try {
      const [optRes, atmRes] = await Promise.all([
        fetchOptimizedRoutes(),
        fetchAtmList(1, 200),
      ]);
      
      if ((optRes.data || []).length > 0) {
        setRoutes(buildDisplayRoutes(optRes.data, atmRes.data || []));
      }
    } catch (err: any) {
      // Routes may be empty if no predictions exist yet, that's OK
      console.log('Route optimization note:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOptimize = async () => {
    setOptimizing(true);
    setError(null);
    try {
      const [optRes, atmRes] = await Promise.all([
        fetchOptimizedRoutes(),
        fetchAtmList(1, 200),
      ]);
      
      const newRoutes = buildDisplayRoutes(optRes.data || [], atmRes.data || []);
      if (newRoutes.length === 0) {
        setError('No routes generated. Run AI predictions first to build optimization data.');
      } else {
        setRoutes(newRoutes);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to optimize routes');
    } finally {
      setOptimizing(false);
    }
  };

  useEffect(() => { loadRoutes(); }, []);

  const filteredRoutes = routes.filter(r => {
    const matchesSearch = r.name.toLowerCase().includes(searchQuery.toLowerCase()) || r.driver.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = 
      activeTab === 'all' ? true : 
      activeTab === 'active' ? (r.status === 'in-progress' || r.status === 'dispatched') :
      r.type === activeTab;
    return matchesSearch && matchesTab;
  });

  const activeCount = routes.filter(r => r.status === 'in-progress' || r.status === 'dispatched' || r.status === 'pending').length;

  const tabs = [
    { id: 'all', label: 'All Routes' },
    { id: 'active', label: 'Active / Dispatch' },
    { id: 'refill', label: 'Cash Refills' },
    { id: 'maintenance', label: 'Maintenance' },
    { id: 'emergency', label: 'Emergency' }
  ];

  const getTypeIcon = (type: RouteType) => {
    switch (type) {
      case 'refill': return <Truck className="w-5 h-5" />;
      case 'maintenance': return <Wrench className="w-5 h-5" />;
      case 'emergency': return <ShieldAlert className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status: RouteStatus) => {
    switch (status) {
      case 'completed': return 'bg-[#12382c] border-[#1c5542] text-[#5d8573]';
      case 'in-progress': return 'bg-[#9de1b9]/10 border-[#9de1b9]/50 text-[#9de1b9] animate-pulse';
      case 'dispatched': return 'bg-amber-500/10 border-amber-500/40 text-amber-500';
      case 'pending': return 'bg-[#1f1115] border-[#fb7185]/40 text-[#fb7185]';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] bg-[#03110d]">
        <div className="flex flex-col items-center gap-4 text-[#9de1b9]">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span className="font-mono text-sm tracking-widest uppercase">Calculating Routes...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 pb-8 sm:pb-12 max-w-7xl mx-auto w-full min-h-[calc(100vh-80px)] text-[#e2f1ea] bg-[#03110d] flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 mb-8 border-b border-[#133c2e] pb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2 tracking-tight flex items-center gap-3">
            Dispatch Routes
            {routesBadge > 0 && (
              <span className="text-sm bg-[#9de1b9] text-[#071a14] px-3 py-1 rounded-full font-bold shadow-[0_0_15px_rgba(157,225,185,0.4)]">
                {routesBadge} New
              </span>
            )}
          </h1>
          <p className="text-[#78a390]">Track and manage live armored transits and maintenance dispatches.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5d8573]" />
            <input 
              type="text" 
              placeholder="Search trucks, drivers..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0a241c] border border-[#133c2e] focus:border-[#9de1b9] rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none transition-colors"
            />
          </div>
          <button 
            onClick={handleOptimize}
            disabled={optimizing}
            className="bg-[#12382c] hover:bg-[#1a4a3a] text-[#9de1b9] border border-[#1c5542] px-4 py-2.5 rounded-xl font-bold text-sm tracking-wide transition-colors whitespace-nowrap shadow-[0_0_15px_rgba(18,56,44,0.3)] flex items-center gap-2 disabled:opacity-50"
          >
            {optimizing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
            {optimizing ? 'Optimizing...' : 'Optimize Routes'}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-[#241e17] border border-amber-500/30 text-amber-400 p-4 rounded-xl text-sm flex items-center gap-2">
          <ShieldAlert className="w-4 h-4" /> {error}
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
              tab.id === 'all' ? routes.length :
              tab.id === 'active' ? activeCount :
              routes.filter(r => r.type === tab.id).length;
              
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

        {/* Right Content for Route Grid */}
        <div className="flex-1 grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
          {filteredRoutes.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center p-12 text-center border border-dashed border-[#133c2e] rounded-2xl bg-[#0a241c]/50 h-64">
              <Map className="w-12 h-12 text-[#5d8573] mb-4" />
              <h3 className="text-lg font-bold text-[#e2f1ea] mb-2">No Routes Found</h3>
              <p className="text-sm text-[#78a390] mb-4">Run AI predictions first, then click "Optimize Routes" to generate dispatch plans.</p>
            </div>
          ) : (
            filteredRoutes.map(route => {
              const isCompleted = route.status === 'completed';

              return (
                <div key={route.id} className={`group bg-[#0a241c] border border-[#133c2e] rounded-2xl overflow-hidden transition-all hover:border-[#1c5542] hover:shadow-[0_10px_30px_rgba(3,17,13,1)] ${isCompleted ? 'opacity-70' : ''}`}>
                  {/* Card Header */}
                  <div className="p-5 border-b border-[#133c2e] flex justify-between items-start">
                    <div className="flex gap-4">
                      <div className={`p-3 rounded-xl border shrink-0 h-max ${
                        route.type === 'refill' ? 'bg-[#12382c] border-[#1c5542] text-[#9de1b9]' : 
                        route.type === 'maintenance' ? 'bg-[#241e17] border-amber-900/40 text-amber-500' :
                        'bg-[#1f1115] border-[#fb7185]/30 text-[#fb7185]'
                      }`}>
                        {getTypeIcon(route.type)}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-[#e2f1ea] leading-tight mb-1">{route.name}</h3>
                        <div className="flex items-center text-xs text-[#78a390] gap-3">
                          <span className="font-mono">ID: {route.id}</span>
                          <span className="flex items-center gap-1"><Truck className="w-3 h-3" /> {route.vehicle}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-5 space-y-5">
                     <div className="flex justify-between items-end">
                       <div>
                         <p className="text-[10px] text-[#5d8573] uppercase tracking-widest mb-1">Personnel / Driver</p>
                         <p className="font-semibold text-sm text-[#e2f1ea]">{route.driver}</p>
                       </div>
                       <div className="text-right">
                         <span className={`px-3 py-1 rounded-md text-[10px] uppercase font-bold tracking-widest border ${getStatusColor(route.status)}`}>
                           {route.status.replace('-', ' ')}
                         </span>
                       </div>
                     </div>

                     {/* Distance & Priority */}
                     <div className="flex justify-between items-center text-xs bg-[#04120e] p-2 rounded-lg border border-[#133c2e]/50">
                       <span className="text-[#5d8573]">Distance: <strong className="text-[#e2f1ea]">{route.totalDistance.toFixed(1)} km</strong></span>
                       <span className="text-[#5d8573]">Priority: <strong className={`${route.priorityScore > 75 ? 'text-[#fb7185]' : route.priorityScore > 55 ? 'text-amber-400' : 'text-[#9de1b9]'}`}>{route.priorityScore.toFixed(0)}/100</strong></span>
                     </div>

                     {/* Progress Bar */}
                     <div className="space-y-2">
                       <div className="flex justify-between text-xs">
                         <span className="text-[#78a390]">Route Progress</span>
                         <span className="font-mono text-[#9de1b9] font-bold">{route.progress}%</span>
                       </div>
                       <div className="h-2 w-full bg-[#03110d] rounded-full overflow-hidden border border-[#133c2e]">
                         <div 
                           className={`h-full rounded-full transition-all duration-1000 ${
                             route.type === 'emergency' ? 'bg-[#fb7185]' :
                             route.type === 'maintenance' ? 'bg-amber-500' : 'bg-[#9de1b9]'
                           }`} 
                           style={{ width: `${route.progress}%` }}
                         />
                       </div>
                     </div>

                     {/* Stops Checklist */}
                     <div className="bg-[#03110d]/50 rounded-xl p-4 border border-[#133c2e]/50">
                        <p className="text-[10px] text-[#5d8573] uppercase tracking-widest mb-3">Manifest Stops ({route.stops.filter(s => s.status === 'completed').length}/{route.stops.length})</p>
                        <div className="space-y-2">
                          {route.stops.map((stop, idx) => (
                            <div key={idx} className="flex items-start gap-3">
                              {stop.status === 'completed' ? (
                                <CheckCircle2 className="w-4 h-4 text-[#5d8573] mt-0.5" />
                              ) : (
                                <div className="w-4 h-4 rounded-full border-2 border-[#1c5542] mt-0.5" />
                              )}
                              <span className={`text-sm ${stop.status === 'completed' ? 'text-[#5d8573] line-through' : 'text-[#e2f1ea]'}`}>
                                {stop.name}
                              </span>
                            </div>
                          ))}
                        </div>
                     </div>

                     {/* Estimated Time */}
                     <div className="flex items-center gap-2 text-xs text-[#78a390] bg-[#04120e] p-3 rounded-xl border border-[#133c2e]">
                        <Clock className="w-4 h-4 text-[#5d8573]" />
                        <span className="font-mono">ETA: <strong className="text-[#e2f1ea] font-sans ml-1">{route.estimatedCompletion}</strong></span>
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
