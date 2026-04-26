"use client";
import React, { useEffect, useState } from 'react';
import { BrainCircuit, Loader2, AlertTriangle, RefreshCw, TrendingUp, Clock, Shield, Zap } from 'lucide-react';
import { useBadges, defaultBadges } from '../../components/BadgeContext';
import { fetchAllPredictions, fetchPrediction, fetchAtmList, type PredictionData, type AtmData } from '../../lib/api';

export default function AIPredictionsPage() {
  const { badges, mounted } = useBadges();
  const aiBadge = mounted ? badges.ai : defaultBadges.ai;

  const [predictions, setPredictions] = useState<PredictionData[]>([]);
  const [atms, setAtms] = useState<AtmData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [runningPrediction, setRunningPrediction] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [predRes, atmRes] = await Promise.all([
        fetchAllPredictions().catch(() => ({ data: [] })),
        fetchAtmList(1, 200),
      ]);
      setPredictions(predRes.data || []);
      setAtms(atmRes.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load predictions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const runPredictionForAtm = async (atmId: string) => {
    setRunningPrediction(atmId);
    try {
      const res = await fetchPrediction(atmId);
      if (res.data) {
        setPredictions(prev => {
          const filtered = prev.filter(p => p.atmId !== atmId);
          return [...filtered, res.data].sort((a, b) => b.riskScore - a.riskScore);
        });
      }
    } catch (err: any) {
      setError(`Failed prediction for ${atmId}: ${err.message}`);
    } finally {
      setRunningPrediction(null);
    }
  };

  const getRiskColor = (score: number) => {
    if (score >= 70) return { bg: 'bg-[#1f1115]', border: 'border-[#fb7185]/40', text: 'text-[#fb7185]', label: 'HIGH RISK' };
    if (score >= 40) return { bg: 'bg-[#241e17]', border: 'border-amber-500/30', text: 'text-amber-400', label: 'MODERATE' };
    return { bg: 'bg-[#0a241c]', border: 'border-[#133c2e]', text: 'text-[#9de1b9]', label: 'LOW RISK' };
  };

  const atmMap = new Map(atms.map(a => [a.atmId, a]));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] bg-[#03110d]">
        <div className="flex flex-col items-center gap-4 text-[#9de1b9]">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span className="font-mono text-sm tracking-widest uppercase">Loading AI Predictions...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 pb-8 sm:pb-12 max-w-7xl mx-auto w-full space-y-8 text-[#e2f1ea] bg-[#03110d]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-[#133c2e] pb-6">
        <div>
          <h2 className="text-3xl font-bold text-[#e2f1ea] mb-2 tracking-tight">AI Predictions 
            {aiBadge > 0 && <span className="ml-2 text-sm bg-[#9de1b9] text-[#071a14] px-2.5 py-1 rounded-full align-middle font-bold">{aiBadge} New</span>}
          </h2>
          <p className="text-[#78a390]">Cash demand forecasts and anomaly detection powered by Gemini AI</p>
        </div>
        <button onClick={loadData} className="bg-[#12382c] hover:bg-[#1a4a3a] text-[#9de1b9] border border-[#1c5542] px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {error && (
        <div className="bg-[#1f1115] border border-rose-900/30 text-[#fb7185] p-4 rounded-xl text-sm flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" /> {error}
        </div>
      )}

      {/* Existing Predictions */}
      {predictions.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-[#e2f1ea] flex items-center gap-2">
            <BrainCircuit className="h-5 w-5 text-[#9de1b9]" /> Latest Predictions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {predictions.map((pred) => {
              const risk = getRiskColor(pred.riskScore);
              const atm = atmMap.get(pred.atmId);
              return (
                <div key={pred._id || pred.atmId} className={`${risk.bg} border ${risk.border} rounded-2xl p-5 shadow-xl transition-all hover:-translate-y-0.5`}>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-bold text-[#e2f1ea] text-sm mb-1">{atm?.branch || pred.atmId}</h4>
                      <span className="text-[10px] text-[#5d8573] font-mono">{pred.atmId}</span>
                    </div>
                    <span className={`text-[9px] uppercase font-bold tracking-widest ${risk.text} px-2 py-0.5 rounded-md border ${risk.border}`}>
                      {risk.label}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-[#5d8573] flex items-center gap-1"><Shield className="w-3 h-3" /> Risk Score</span>
                      <span className={`font-bold font-mono ${risk.text}`}>{pred.riskScore}/100</span>
                    </div>
                    
                    {/* Risk bar */}
                    <div className="h-1.5 w-full bg-[#03110d] rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${pred.riskScore >= 70 ? 'bg-[#fb7185]' : pred.riskScore >= 40 ? 'bg-amber-400' : 'bg-[#9de1b9]'}`} 
                        style={{ width: `${pred.riskScore}%` }} />
                    </div>

                    <div className="flex justify-between items-center text-xs">
                      <span className="text-[#5d8573] flex items-center gap-1"><TrendingUp className="w-3 h-3" /> Cash Demand</span>
                      <span className="font-bold font-mono text-[#e2f1ea]">${pred.predictedCashDemand?.toLocaleString()}</span>
                    </div>

                    <div className="flex justify-between items-center text-xs">
                      <span className="text-[#5d8573] flex items-center gap-1"><Clock className="w-3 h-3" /> Time to Cashout</span>
                      <span className={`font-bold font-mono ${pred.predictedTimeToCashout < 24 ? 'text-[#fb7185]' : pred.predictedTimeToCashout < 72 ? 'text-amber-400' : 'text-[#9de1b9]'}`}>
                        {pred.predictedTimeToCashout < 24 ? `${pred.predictedTimeToCashout.toFixed(0)}h` : `${(pred.predictedTimeToCashout / 24).toFixed(1)} days`}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-xs">
                      <span className="text-[#5d8573] flex items-center gap-1"><Zap className="w-3 h-3" /> Confidence</span>
                      <span className="font-bold font-mono text-[#e2f1ea]">{(pred.confidence * 100).toFixed(0)}%</span>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-[#133c2e]/50 flex justify-between items-center">
                    <span className="text-[9px] text-[#5d8573] font-mono">{pred.modelVersion}</span>
                    <span className="text-[9px] text-[#5d8573] font-mono">{new Date(pred.timestamp).toLocaleString()}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Run new predictions */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-[#e2f1ea] flex items-center gap-2">
          <Zap className="h-5 w-5 text-amber-400" /> Generate Predictions
        </h3>
        <p className="text-sm text-[#78a390]">Select an ATM to run an AI prediction analysis on its cash demand.</p>
        
        {atms.length === 0 ? (
          <div className="bg-[#0a241c] border border-[#133c2e] rounded-2xl p-8 text-center">
            <p className="text-sm text-[#78a390]">No ATMs found. Generate test data first.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {atms.slice(0, 12).map(atm => {
              const cashPercent = atm.capacity > 0 ? Math.round((atm.currentCash / atm.capacity) * 100) : 0;
              const hasPrediction = predictions.some(p => p.atmId === atm.atmId);
              const isRunning = runningPrediction === atm.atmId;
              
              return (
                <button
                  key={atm._id}
                  onClick={() => runPredictionForAtm(atm.atmId)}
                  disabled={isRunning}
                  className={`bg-[#0a241c] border border-[#133c2e] hover:border-[#1c5542] p-4 rounded-xl text-left transition-all group disabled:opacity-60 disabled:cursor-wait ${hasPrediction ? 'ring-1 ring-[#1c5542]' : ''}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-mono text-[#5d8573]">{atm.atmId}</span>
                    {hasPrediction && <span className="text-[8px] bg-[#12382c] text-[#9de1b9] px-1.5 py-0.5 rounded-sm font-mono">HAS DATA</span>}
                  </div>
                  <h4 className="text-sm font-bold text-[#e2f1ea] group-hover:text-[#9de1b9] transition-colors mb-2 line-clamp-1">{atm.branch}</h4>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[#5d8573]">Cash: <span className={`font-bold ${cashPercent < 20 ? 'text-[#fb7185]' : cashPercent < 50 ? 'text-amber-400' : 'text-[#9de1b9]'}`}>{cashPercent}%</span></span>
                    {isRunning ? (
                      <Loader2 className="w-3 h-3 animate-spin text-[#9de1b9]" />
                    ) : (
                      <BrainCircuit className="w-3 h-3 text-[#5d8573] group-hover:text-[#9de1b9] transition-colors" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
