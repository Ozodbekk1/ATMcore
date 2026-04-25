"use client";
import React, { useState } from 'react';
import { ShieldCheck, AlertTriangle, X, Target, Crosshair, ChevronRight, BrainCircuit, BarChart2 } from 'lucide-react';
import dynamic from 'next/dynamic';

const RealMap = dynamic(() => import('./MapComponent'), { ssr: false, loading: () => <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#061814] text-[#9de1b9] font-mono text-sm tracking-widest uppercase"><div className="w-8 h-8 border-2 border-[#9de1b9] border-t-transparent rounded-full animate-spin mb-4"></div>Initialize Satellite Link...</div> });
import { useSearchParams } from 'next/navigation';

export interface RegionMarker {
  id: number;
  name: string;
  coords: [number, number];
  status: string;
  cash: string;
  details: {
    uptime: string;
    transactions: number;
    dailyTrend: string;
    mahallas: { name: string; cash: string; status: string }[];
  }
}

function MapContent() {
  const [selectedRegion, setSelectedRegion] = useState<RegionMarker | null>(null);
  const [showAIChatPanel, setShowAIChatPanel] = useState(false);
  const searchParams = useSearchParams();

  React.useEffect(() => {
    setShowAIChatPanel(false);
  }, [selectedRegion]);

  const markers: RegionMarker[] = [
    { 
      id: 1, name: "Tashkent Hub", coords: [41.2995, 69.2401] as [number, number], status: 'optimal', cash: "85%",
      details: {
        uptime: "99.9%", transactions: 15420, dailyTrend: "+4.2%",
        mahallas: [
          { name: "Yunusobod 4-daha", cash: "92%", status: "optimal" },
          { name: "Chilonzor 9-kv", cash: "15%", status: "warning" },
          { name: "Mirzo Ulugbek", cash: "5%", status: "critical" },
          { name: "Sirg'ali 7A", cash: "88%", status: "optimal" },
        ]
      }
    },
    { 
      id: 2, name: "Fergana Node", coords: [40.3864, 71.7864] as [number, number], status: 'optimal', cash: "60%",
      details: {
        uptime: "98.5%", transactions: 8200, dailyTrend: "-1.5%",
        mahallas: [
          { name: "Marg'ilon Markaz", cash: "60%", status: "optimal" },
          { name: "Qo'qon Avtoshow", cash: "45%", status: "optimal" },
          { name: "Farg'ona City", cash: "81%", status: "optimal" },
        ]
      }
    },
    { 
      id: 3, name: "Samarkand Core", coords: [39.6270, 66.9749] as [number, number], status: 'warning', cash: "25%",
      details: {
        uptime: "97.2%", transactions: 12050, dailyTrend: "+12.1%",
        mahallas: [
          { name: "Registon Maydoni", cash: "20%", status: "warning" },
          { name: "Siyob Bozori", cash: "10%", status: "critical" },
          { name: "So'g'diyona Makro", cash: "55%", status: "optimal" },
        ]
      }
    },
    { 
      id: 4, name: "Bukhara Point", coords: [39.7681, 64.4556] as [number, number], status: 'optimal', cash: "70%",
      details: {
        uptime: "99.1%", transactions: 6400, dailyTrend: "+2.0%",
        mahallas: [
          { name: "Labi Hovuz", cash: "65%", status: "optimal" },
          { name: "Buxoro Vokzal", cash: "78%", status: "optimal" },
        ]
      }
    },
    { 
      id: 5, name: "Nukus Terminal", coords: [42.4608, 59.6105] as [number, number], status: 'critical', cash: "5%",
      details: {
        uptime: "92.4%", transactions: 2100, dailyTrend: "-8.4%",
        mahallas: [
          { name: "Nukus Markaziy Box", cash: "3%", status: "critical" },
          { name: "Amudaryo Mahalla", cash: "7%", status: "critical" },
        ]
      }
    },
    { 
      id: 6, name: "Termez Gateway", coords: [37.2242, 67.2783] as [number, number], status: 'optimal', cash: "90%",
      details: {
        uptime: "99.8%", transactions: 3500, dailyTrend: "+0.5%",
        mahallas: [
          { name: "Termez City Mall", cash: "88%", status: "optimal" },
          { name: "Aeroport", cash: "92%", status: "optimal" },
        ]
      }
    },
    { 
      id: 7, name: "Navoi Vault", coords: [40.0844, 65.3792] as [number, number], status: 'optimal', cash: "65%",
      details: {
        uptime: "99.5%", transactions: 4400, dailyTrend: "+1.9%",
        mahallas: [
          { name: "Bozor Hududi", cash: "50%", status: "optimal" },
          { name: "Navoi AZS", cash: "85%", status: "optimal" },
        ]
      }
    },
    { 
      id: 8, name: "Andijan Link", coords: [40.8154, 72.2837] as [number, number], status: 'optimal', cash: "80%",
      details: {
        uptime: "98.9%", transactions: 9100, dailyTrend: "+4.7%",
        mahallas: [
          { name: "Jahon Bozori", cash: "75%", status: "optimal" },
          { name: "Eski Shahar", cash: "82%", status: "optimal" },
        ]
      }
    }
  ];

  const activeMarkers = markers.filter(m => m.status !== 'optimal');

  React.useEffect(() => {
    const idParam = searchParams.get('id');
    if (idParam) {
      const found = markers.find(m => m.id.toString() === idParam);
      if (found) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSelectedRegion(found);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  return (
    <div className="relative w-full h-[calc(100vh-80px)] overflow-hidden bg-[#03110d]">
      
      {/* Real Leaflet Map Background */}
      <div className="absolute inset-0 z-0">
        <RealMap markers={markers} selectedRegion={selectedRegion} setSelectedRegion={setSelectedRegion} />
      </div>

      {/* Floating Header UI overlay - No Pointer Events on wrapper so map clicks aren't blocked */}
      <div className={`absolute top-0 left-0 w-full z-[5] p-6 pointer-events-none flex justify-between items-start transition-all duration-500 ${selectedRegion ? '-translate-y-full opacity-0' : 'translate-y-0 opacity-100'}`}>
        <div className="pointer-events-auto bg-[#071a14]/90 backdrop-blur-md p-4 rounded-2xl border border-[#133c2e] shadow-2xl flex flex-col gap-1">
          <h2 className="text-2xl font-bold text-[#e2f1ea] tracking-tight flex items-center">
            Satellite Mode
            <span className="ml-3 text-[10px] bg-[#12382c] border border-[#1c5542] text-[#9de1b9] px-2 py-0.5 rounded-full align-middle animate-pulse font-mono tracking-widest">
              LIVE
            </span>
          </h2>
          <p className="text-xs text-[#78a390]">Full-screen geographic zoom active</p>
        </div>
        <div className="pointer-events-auto flex gap-4 bg-[#0a241c]/90 backdrop-blur-md p-3 rounded-xl border border-[#133c2e] shadow-2xl">
          <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 bg-[#9de1b9] rounded-sm shadow-[0_0_8px_#9de1b9]"></span> <span className="text-xs font-mono text-[#78a390] uppercase">Optimal</span></div>
          <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 bg-amber-400 rounded-sm shadow-[0_0_8px_#fbbf24]"></span> <span className="text-xs font-mono text-[#78a390] uppercase">Warning</span></div>
          <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 bg-[#fb7185] rounded-sm shadow-[0_0_8px_#fb7185]"></span> <span className="text-xs font-mono text-[#78a390] uppercase">Critical</span></div>
        </div>
      </div>
        
      {/* HUD Overlay - Left Side */}
      <div className={`absolute top-[120px] left-6 bg-[#04120e]/80 backdrop-blur-xl border-l-2 border-l-[#9de1b9] border border-[#133c2e]/50 p-6 rounded-r-2xl shadow-2xl w-64 pointer-events-auto z-10 transition-all duration-500 hidden sm:block ${selectedRegion ? '-translate-x-[150%] opacity-0' : 'translate-x-0 opacity-100'}`}>
         <h4 className="text-[#9de1b9] font-black text-sm mb-5 uppercase tracking-[0.2em] flex items-center gap-2">
           <Target className="w-5 h-5 text-[#9de1b9]" /> Telemetry
         </h4>
         <div className="space-y-4 font-mono">
            <div className="flex justify-between items-center border-b border-[#133c2e]/50 pb-2">
               <span className="text-[#5d8573] text-[10px] uppercase tracking-wider">System State</span>
               <span className="text-[#9de1b9] font-bold text-xs flex items-center gap-1.5"><ShieldCheck className="w-3 h-3" /> OK</span>
            </div>
            <div className="flex justify-between items-center border-b border-[#133c2e]/50 pb-2">
               <span className="text-[#5d8573] text-[10px] uppercase tracking-wider">Active Nodes</span>
               <span className="text-[#e2f1ea] font-bold text-xs">8 / 8</span>
            </div>
            <div className="flex justify-between items-center">
               <span className="text-[#5d8573] text-[10px] uppercase tracking-wider">Critical Sync</span>
               <span className="text-[#fb7185] font-bold text-xs flex items-center gap-1.5"><AlertTriangle className="w-3 h-3 animate-pulse" /> 1 NODE</span>
            </div>
         </div>
      </div>

      {/* Drill-Down Details Panel - Slides in from right when a region is selected */}
      <div className={`absolute top-0 right-0 h-full w-full ${showAIChatPanel ? 'sm:w-[480px]' : 'sm:w-[380px]'} bg-[#061814]/95 backdrop-blur-3xl border-l border-[#1c5542] shadow-[-20px_0_40px_rgba(3,17,13,0.8)] transition-all duration-500 ease-in-out transform z-[20] ${selectedRegion ? 'translate-x-0' : 'translate-x-full'}`}>
        {selectedRegion && (
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-[#133c2e] bg-[#04120e]/80">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <Crosshair className={`w-6 h-6 ${selectedRegion.status === 'optimal' ? 'text-[#9de1b9]' : selectedRegion.status === 'warning' ? 'text-amber-400' : 'text-[#fb7185]'}`} />
                  <h3 className="text-xl font-bold text-[#e2f1ea] tracking-tight">{selectedRegion.name}</h3>
                </div>
                <button onClick={() => setSelectedRegion(null)} className="p-2 bg-[#0a241c] rounded-full text-[#78a390] hover:text-[#fb7185] hover:bg-[#1f1115] transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-3 mb-2 font-mono">
                <div className="bg-[#0a241c] p-3 rounded-xl border border-[#133c2e]">
                  <p className="text-[#5d8573] text-[9px] uppercase tracking-widest mb-1">Total Cash</p>
                  <p className="text-[#e2f1ea] text-lg font-bold">{selectedRegion.cash}</p>
                </div>
                <div className="bg-[#0a241c] p-3 rounded-xl border border-[#133c2e]">
                  <p className="text-[#5d8573] text-[9px] uppercase tracking-widest mb-1">Trend</p>
                  <p className={`text-lg font-bold ${selectedRegion.details.dailyTrend.startsWith('+') ? 'text-[#9de1b9]' : 'text-[#fb7185]'}`}>{selectedRegion.details.dailyTrend}</p>
                </div>
              </div>
              <button 
                onClick={() => setShowAIChatPanel(!showAIChatPanel)}
                className="mt-4 w-full bg-[#12382c]/80 hover:bg-[#1a4a3a] border border-[#1c5542] text-[#9de1b9] py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-colors shadow-[0_0_15px_rgba(18,56,44,0.4)]"
              >
                <BrainCircuit className="w-4 h-4 animate-pulse" />
                {showAIChatPanel ? 'Close AI Analysis' : 'Analyze with Nexus AI'}
              </button>
            </div>

            {/* Panel Body: AI or Mahallas */}
            {showAIChatPanel ? (
              <div className="flex-1 flex flex-col h-0 bg-[#03110d]/50">
                {/* Chat History View */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-[#133c2e]">
                  
                  {/* AI Intro Bubble */}
                  <div className="bg-[#0a241c] border border-[#1c5542] p-5 rounded-2xl rounded-tl-sm self-start inline-block w-[90%] text-[#e2f1ea] shadow-lg text-[13px] font-mono leading-relaxed relative">
                     <div className="absolute -left-2 top-0 w-2 h-2 rounded-full bg-[#9de1b9] shadow-[0_0_8px_#9de1b9]"></div>
                     <strong className="text-[#9de1b9] flex items-center gap-2 mb-3 border-b border-[#133c2e] pb-2 font-sans tracking-tight text-sm"><BrainCircuit className="w-4 h-4"/> NEXUS AI ANALYSIS</strong>
                     I have performed a deep-scan on the transaction flow for <strong className="text-[#9de1b9] font-sans">{selectedRegion.name}</strong>.<br/><br/>
                     Current node uptime is <strong className="font-sans text-[#e2f1ea]">{selectedRegion.details.uptime}</strong> involving <strong className="font-sans text-[#e2f1ea]">{selectedRegion.details.transactions}</strong> active operations in the last 24H window.
                  </div>

                  {/* AI Status Conclusion */}
                  <div className="bg-[#0a241c] border border-[#1c5542] p-5 rounded-2xl rounded-tl-sm self-start inline-block w-[90%] text-[#e2f1ea] shadow-lg text-[13px] font-mono leading-relaxed mt-2">
                     {selectedRegion.status === 'optimal' 
                       ? <span className="text-[#9de1b9] block"><strong className="font-sans">SYSTEM OPTIMAL:</strong> No immediate cash fill required. Predictive models suggest a holding pattern is perfectly safe.</span>
                       : selectedRegion.status === 'warning'
                       ? <span className="text-amber-400 block"><strong className="font-sans">WARNING DETECTED:</strong> High transaction velocity (<strong>{selectedRegion.details.dailyTrend} trend</strong>) suggests depletion before weekend peak. Pre-fill highly recommended.</span>
                       : <span className="text-[#fb7185] block"><strong className="font-sans">CRITICAL PRIORITY:</strong> Immediate dispatch required! Cash levels universally low at <strong>{selectedRegion.cash}</strong>. Initiating emergency bypass routing protocol recommendations.</span>
                     }
                  </div>

                  {/* Action Override Bubble (If necessary) */}
                  {(selectedRegion.status === 'warning' || selectedRegion.status === 'critical') && (
                    <div className="bg-[#1f1115] border border-rose-900/40 p-5 rounded-2xl rounded-tl-sm self-start w-[90%] flex flex-col gap-3 shadow-lg mt-2">
                       <span className="text-[#fb7185] text-xs font-bold uppercase tracking-widest"><AlertTriangle className="inline w-4 h-4 mb-0.5 mr-1"/> Auto-Resolution Available</span>
                       <p className="text-[12px] text-rose-300 font-mono mb-2">Shall I execute the automated Smart Contract override and deploy the nearest available armored transport to this location?</p>
                       <button className="bg-[#fb7185]/10 text-[#fb7185] border border-[#fb7185]/50 hover:bg-[#fb7185] hover:text-[#071a14] px-4 py-3 rounded-xl text-xs font-bold transition-all w-max shadow-lg">
                          Approve Smart Override
                       </button>
                    </div>
                  )}

                  {/* Fake User History Bubble */}
                   <div className="bg-[#12382c] border border-[#1c5542] p-4 rounded-2xl rounded-tr-sm self-end inline-block ml-auto text-[#9de1b9] shadow-lg text-[13px] font-mono mt-6 w-max max-w-[85%] text-right float-right clear-both">
                      What are the backup nodes nearby?
                   </div>

                </div>

                {/* Pinned Embedded Chat Input Box */}
                <div className="p-5 border-t border-[#133c2e] bg-[#04120e]">
                   <div className="relative">
                     <input 
                       type="text" 
                       className="w-full bg-[#03110d] border border-[#133c2e] p-4 rounded-2xl text-[#e2f1ea] pr-14 focus:outline-none focus:border-[#9de1b9] focus:ring-1 focus:ring-[#9de1b9] placeholder-[#5d8573] font-sans text-[13px] transition-all shadow-inner" 
                       placeholder="Ask Nexus AI about this node..." 
                     />
                     <button className="absolute right-2 top-2 p-2 bg-[#12382c] border border-[#1c5542] rounded-xl text-[#9de1b9] hover:bg-[#1a4a3a] transition-colors shadow-lg">
                        <ChevronRight size={18} />
                     </button>
                   </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-[#133c2e] pb-12">
                <h4 className="text-[10px] font-bold text-[#5d8573] uppercase tracking-[0.2em] mb-4">Micro-Zones (Mahallas)</h4>
                <div className="space-y-3">
                  {selectedRegion.details.mahallas.map((m: { name: string, cash: string, status: string }, i: number) => {
                    const isOpt = m.status === 'optimal';
                    const isWarn = m.status === 'warning';
                    const colorClass = isOpt ? 'bg-[#9de1b9] shadow-[#9de1b9]' : isWarn ? 'bg-amber-400 shadow-amber-400' : 'bg-[#fb7185] shadow-[#fb7185]';
                    const bgClass = isOpt ? 'bg-[#0a241c] border-[#133c2e]' : isWarn ? 'bg-[#241e17] border-amber-900/40' : 'bg-[#1f1115] border-[#fb7185]/30';
                    
                    return (
                      <div key={i} className={`${bgClass} rounded-xl p-4 border transition-all cursor-pointer hover:-translate-y-0.5 group`}>
                        <div className="flex justify-between items-center mb-3">
                          <div className="flex items-center gap-3">
                             <div className={`w-2 h-2 rounded-full ${colorClass} shadow-[0_0_8px] opacity-80`} />
                             <span className="font-semibold text-[#e2f1ea] text-sm group-hover:text-[#9de1b9] transition-colors">{m.name}</span>
                          </div>
                          <ChevronRight className="w-4 h-4 text-[#5d8573] group-hover:text-[#9de1b9] transition-colors" />
                        </div>
                        
                        <div className="space-y-2">
                           <div className="flex justify-between items-center text-xs">
                              <span className="text-[#5d8573] uppercase tracking-wider text-[9px]">Local Cash</span>
                              <span className="font-mono font-bold text-[#e2f1ea]">{m.cash}</span>
                           </div>
                           <div className="h-1.5 w-full bg-[#04120e] rounded-full overflow-hidden">
                              <div className={`h-full rounded-full ${isOpt ? 'bg-[#9de1b9]' : isWarn ? 'bg-amber-400' : 'bg-[#fb7185]'}`} style={{ width: m.cash }}></div>
                           </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function LiveMapPage() {
  return (
    <React.Suspense fallback={<div className="flex w-full h-[calc(100vh-80px)] items-center justify-center bg-[#03110d] text-[#9de1b9] font-mono tracking-widest h-full">Connecting Telemetry...</div>}>
      <MapContent />
    </React.Suspense>
  );
}
