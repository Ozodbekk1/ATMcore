"use client";
import React, { useEffect, useState } from 'react';
import { BarChart2, Loader2, AlertTriangle, RefreshCw, TrendingUp, TrendingDown, MapPin, Lightbulb, ShieldAlert, Activity, Truck, Calendar } from 'lucide-react';
import { fetchAnalytics, type AnalyticsReport } from '../../lib/api';

export default function AnalyticsPage() {
  const [report, setReport] = useState<AnalyticsReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchAnalytics();
      setReport(res.data);
    } catch (err: any) {
      setError(err.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] bg-[#03110d]">
        <div className="flex flex-col items-center gap-4 text-[#9de1b9]">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span className="font-mono text-sm tracking-widest uppercase">Generating AI Analytics Report...</span>
          <span className="text-xs text-[#5d8573]">This may take 10-30 seconds</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 max-w-7xl mx-auto w-full space-y-8 flex-1 flex flex-col h-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <h2 className="text-3xl font-bold text-[#e2f1ea] mb-2 tracking-tight">Analytics</h2>
            <p className="text-[#78a390]">Historical performance data and network insights</p>
          </div>
        </div>
        <div className="flex-1 bg-[#1f1115] border border-rose-900/30 rounded-2xl flex flex-col items-center justify-center p-8 min-h-[400px]">
          <AlertTriangle className="h-12 w-12 text-[#fb7185] mb-4" />
          <h3 className="text-lg font-bold text-[#e2f1ea] mb-2">Failed to Load Analytics</h3>
          <p className="text-sm text-[#78a390] mb-4 max-w-md text-center">{error}</p>
          <button onClick={loadAnalytics} className="bg-[#12382c] hover:bg-[#1a4a3a] text-[#9de1b9] border border-[#1c5542] px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2">
            <RefreshCw className="w-4 h-4" /> Retry
          </button>
        </div>
      </div>
    );
  }

  if (!report) return null;

  return (
    <div className="p-4 sm:p-8 pb-8 sm:pb-12 max-w-7xl mx-auto w-full space-y-8 text-[#e2f1ea] bg-[#03110d]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-[#133c2e] pb-6">
        <div>
          <h2 className="text-3xl font-bold text-[#e2f1ea] mb-2 tracking-tight">Network Analytics</h2>
          <p className="text-[#78a390]">AI-powered performance analysis and network insights</p>
        </div>
        <button onClick={loadAnalytics} className="bg-[#12382c] hover:bg-[#1a4a3a] text-[#9de1b9] border border-[#1c5542] px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2">
          <RefreshCw className="w-4 h-4" /> Regenerate Report
        </button>
      </div>

      {/* Final Summary */}
      {report.final_summary && (
        <div className="bg-[#0a241c] border border-[#1c5542] p-6 rounded-2xl shadow-xl">
          <h3 className="text-lg font-bold text-[#9de1b9] flex items-center gap-2 mb-3">
            <Lightbulb className="h-5 w-5" /> Executive Summary
          </h3>
          <p className="text-sm text-[#e2f1ea]/80 leading-relaxed">{report.final_summary}</p>
        </div>
      )}

      {/* Risk Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#0a241c] border border-[#133c2e] rounded-2xl p-6 shadow-xl">
          <h3 className="text-lg font-bold text-[#fb7185] flex items-center gap-2 mb-4 border-b border-[#133c2e] pb-3">
            <ShieldAlert className="h-5 w-5" /> Critical ATMs
          </h3>
          <div className="space-y-3">
            {(report.risk_analysis?.critical_atms || []).length === 0 ? (
              <p className="text-sm text-[#5d8573]">No critical ATMs at this time</p>
            ) : (
              (report.risk_analysis.critical_atms).slice(0, 5).map((atm: any, i: number) => (
                <div key={i} className="bg-[#1f1115] border border-[#fb7185]/20 p-3 rounded-xl">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-[#e2f1ea]">{atm.atm_id || atm.atmId || `ATM ${i+1}`}</span>
                    <span className="text-xs text-[#fb7185] bg-[#fb7185]/10 px-2 py-0.5 rounded-md border border-[#fb7185]/30 font-mono">
                      {atm.risk || atm.reason || 'HIGH RISK'}
                    </span>
                  </div>
                  {atm.reason && <p className="text-xs text-[#78a390] mt-1">{atm.reason}</p>}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-[#0a241c] border border-[#133c2e] rounded-2xl p-6 shadow-xl">
          <h3 className="text-lg font-bold text-amber-400 flex items-center gap-2 mb-4 border-b border-[#133c2e] pb-3">
            <AlertTriangle className="h-5 w-5" /> Warning ATMs
          </h3>
          <div className="space-y-3">
            {(report.risk_analysis?.warning_atms || []).length === 0 ? (
              <p className="text-sm text-[#5d8573]">No warning ATMs at this time</p>
            ) : (
              (report.risk_analysis.warning_atms).slice(0, 5).map((atm: any, i: number) => (
                <div key={i} className="bg-[#241e17] border border-amber-500/20 p-3 rounded-xl">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-[#e2f1ea]">{atm.atm_id || atm.atmId || `ATM ${i+1}`}</span>
                    <span className="text-xs text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/30 font-mono">
                      WARNING
                    </span>
                  </div>
                  {atm.reason && <p className="text-xs text-[#78a390] mt-1">{atm.reason}</p>}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Optimization Recommendations */}
      {report.optimization_recommendations && (
        <div className="bg-[#0a241c] border border-[#133c2e] rounded-2xl p-6 shadow-xl">
          <h3 className="text-lg font-bold text-[#9de1b9] flex items-center gap-2 mb-4 border-b border-[#133c2e] pb-3">
            <Truck className="h-5 w-5" /> Optimization Recommendations
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#04120e] border border-[#133c2e] p-4 rounded-xl">
              <h4 className="text-xs text-[#5d8573] uppercase tracking-widest mb-2 font-bold">Refill Strategy</h4>
              <p className="text-sm text-[#e2f1ea]/80 leading-relaxed">{report.optimization_recommendations.refill_strategy || 'N/A'}</p>
            </div>
            <div className="bg-[#04120e] border border-[#133c2e] p-4 rounded-xl">
              <h4 className="text-xs text-[#5d8573] uppercase tracking-widest mb-2 font-bold">Cash Distribution</h4>
              <p className="text-sm text-[#e2f1ea]/80 leading-relaxed">{report.optimization_recommendations.cash_distribution_plan || 'N/A'}</p>
            </div>
            <div className="bg-[#04120e] border border-[#133c2e] p-4 rounded-xl">
              <h4 className="text-xs text-[#5d8573] uppercase tracking-widest mb-2 font-bold">Logistics Cost Reduction</h4>
              <p className="text-sm text-[#e2f1ea]/80 leading-relaxed">{report.optimization_recommendations.logistics_cost_reduction || 'N/A'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Weekly Analysis */}
      {report.weekly_analysis && (
        <div className="bg-[#0a241c] border border-[#133c2e] rounded-2xl p-6 shadow-xl">
          <h3 className="text-lg font-bold text-[#e2f1ea] flex items-center gap-2 mb-4 border-b border-[#133c2e] pb-3">
            <Calendar className="h-5 w-5 text-[#9de1b9]" /> Weekly Analysis
          </h3>
          {report.weekly_analysis.trend_summary && (
            <p className="text-sm text-[#e2f1ea]/80 leading-relaxed mb-4 bg-[#04120e] p-4 rounded-xl border border-[#133c2e]">{report.weekly_analysis.trend_summary}</p>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-xs text-[#5d8573] uppercase tracking-widest mb-3 font-bold flex items-center gap-2">
                <TrendingUp className="w-3 h-3 text-[#9de1b9]" /> Top Performers
              </h4>
              <div className="space-y-2">
                {(report.weekly_analysis.top_atms || []).slice(0, 5).map((atm: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-2 bg-[#04120e] rounded-lg border border-[#133c2e]/50 text-xs">
                    <span className="text-[#e2f1ea] font-medium">{atm.atm_id || atm.atmId || `ATM ${i+1}`}</span>
                    <span className="text-[#9de1b9] font-mono">{typeof atm === 'string' ? atm : (atm.transactions || atm.volume || '')}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-xs text-[#5d8573] uppercase tracking-widest mb-3 font-bold flex items-center gap-2">
                <TrendingDown className="w-3 h-3 text-amber-400" /> Low Performers
              </h4>
              <div className="space-y-2">
                {(report.weekly_analysis.low_performing_atms || []).slice(0, 5).map((atm: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-2 bg-[#04120e] rounded-lg border border-[#133c2e]/50 text-xs">
                    <span className="text-[#e2f1ea] font-medium">{atm.atm_id || atm.atmId || `ATM ${i+1}`}</span>
                    <span className="text-amber-400 font-mono">{typeof atm === 'string' ? atm : (atm.reason || '')}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Event Analysis */}
      {report.event_analysis && (
        <div className="bg-[#0a241c] border border-[#133c2e] rounded-2xl p-6 shadow-xl">
          <h3 className="text-lg font-bold text-[#e2f1ea] flex items-center gap-2 mb-4 border-b border-[#133c2e] pb-3">
            <Activity className="h-5 w-5 text-[#9de1b9]" /> Event Impact Analysis
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#04120e] border border-[#133c2e] p-4 rounded-xl">
              <h4 className="text-xs text-[#5d8573] uppercase tracking-widest mb-2 font-bold">Holiday Effect</h4>
              <p className="text-sm text-[#e2f1ea]/80">{report.event_analysis.holiday_effect || 'No data'}</p>
            </div>
            <div className="bg-[#04120e] border border-[#133c2e] p-4 rounded-xl">
              <h4 className="text-xs text-[#5d8573] uppercase tracking-widest mb-2 font-bold">Salary Day Effect</h4>
              <p className="text-sm text-[#e2f1ea]/80">{report.event_analysis.salary_day_effect || 'No data'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Location Intelligence */}
      {report.location_intelligence && report.location_intelligence.length > 0 && (
        <div className="bg-[#0a241c] border border-[#133c2e] rounded-2xl p-6 shadow-xl">
          <h3 className="text-lg font-bold text-[#e2f1ea] flex items-center gap-2 mb-4 border-b border-[#133c2e] pb-3">
            <MapPin className="h-5 w-5 text-[#9de1b9]" /> Location Intelligence
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {report.location_intelligence.slice(0, 9).map((loc, i) => (
              <div key={i} className="bg-[#04120e] border border-[#133c2e] p-3 rounded-xl">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-bold text-[#e2f1ea]">{loc.atm_id}</span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-md border font-mono font-bold uppercase ${
                    loc.status === 'KEEP' ? 'bg-[#12382c] text-[#9de1b9] border-[#1c5542]' :
                    loc.status === 'INCREASE_CAPACITY' ? 'bg-[#12382c] text-[#9de1b9] border-[#1c5542]' :
                    loc.status === 'MOVE' || loc.status === 'REMOVE' ? 'bg-[#fb7185]/10 text-[#fb7185] border-[#fb7185]/30' :
                    'bg-amber-500/10 text-amber-400 border-amber-500/30'
                  }`}>{loc.status}</span>
                </div>
                <p className="text-xs text-[#5d8573]">{loc.reason}</p>
                <div className="mt-1">
                  <span className="text-[9px] text-[#78a390] font-mono">Confidence: {(loc.confidence * 100).toFixed(0)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
