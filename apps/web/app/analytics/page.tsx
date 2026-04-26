"use client";
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Loader2, AlertTriangle, RefreshCw, TrendingUp, TrendingDown, MapPin, Lightbulb, ShieldAlert, Activity, Truck, Calendar, Sparkles, Terminal } from 'lucide-react';
import { fetchAnalytics, type AnalyticsReport } from '../../lib/api';

export default function AnalyticsPage() {
  const [report, setReport] = useState<AnalyticsReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamStatus, setStreamStatus] = useState('');
  const [streamText, setStreamText] = useState('');
  const [streamError, setStreamError] = useState<string | null>(null);
  const streamRef = useRef<HTMLPreElement>(null);

  // Process an SSE stream response
  const processStream = useCallback(async (res: Response) => {
    const reader = res.body!.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        try {
          const event = JSON.parse(line.slice(6));
          switch (event.type) {
            case 'status':
              setStreamStatus(event.message);
              break;
            case 'chunk':
              setStreamText(prev => prev + event.text);
              if (streamRef.current) streamRef.current.scrollTop = streamRef.current.scrollHeight;
              break;
            case 'complete':
              setReport(event.data);
              setIsStreaming(false);
              setStreamText('');
              break;
            case 'error':
              setStreamError(event.message);
              setStreamStatus('AI analysis failed');
              break;
          }
        } catch {}
      }
    }
  }, []);

  // Initial load — always returns DB data (no AI call)
  const loadAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/analytics', { credentials: 'include' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Request failed');
      setReport(data.data);
    } catch (err: any) {
      setError(err.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }, []);

  // Regenerate — forces fresh AI call, always streams
  const regenerateReport = useCallback(async () => {
    setReport(null);
    setError(null);
    setIsStreaming(true);
    setStreamText('');
    setStreamStatus('Clearing cache...');
    setStreamError(null);
    try {
      const res = await fetch('/api/analytics?force=true', { credentials: 'include' });
      await processStream(res);
    } catch (err: any) {
      setError(err.message || 'Failed to regenerate report');
      setIsStreaming(false);
    }
  }, [processStream]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  // Streaming UI
  if (isStreaming) {
    return (
      <div className="p-4 sm:p-8 max-w-7xl mx-auto w-full space-y-6 text-[#e2f1ea] bg-[#03110d] min-h-[calc(100vh-80px)]">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-[#133c2e] pb-6">
          <div>
            <h2 className="text-3xl font-bold text-[#e2f1ea] mb-2 tracking-tight">Network Analytics</h2>
            <p className="text-[#78a390]">AI-powered performance analysis and network insights</p>
          </div>
        </div>

        <div className="bg-[#0a241c] border border-[#1c5542] rounded-2xl overflow-hidden shadow-2xl">
          {/* Terminal header */}
          <div className="flex items-center gap-3 px-5 py-3 bg-[#04120e] border-b border-[#133c2e]">
            <div className="flex gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#fb7185]" />
              <span className="w-3 h-3 rounded-full bg-amber-400" />
              <span className="w-3 h-3 rounded-full bg-[#9de1b9]" />
            </div>
            <div className="flex items-center gap-2 ml-2">
              <Terminal className="w-4 h-4 text-[#5d8573]" />
              <span className="text-xs font-mono text-[#5d8573]">AI Analysis Engine</span>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#9de1b9] opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#9de1b9]" />
              </span>
              <span className="text-xs font-mono text-[#9de1b9]">LIVE</span>
            </div>
          </div>

          {/* Status bar */}
          <div className={`px-5 py-3 border-b border-[#133c2e]/50 flex items-center gap-3 ${streamError ? 'bg-[#1f1115]' : 'bg-[#071a14]'}`}>
            {streamError ? <AlertTriangle className="w-4 h-4 text-[#fb7185]" /> : <Sparkles className="w-4 h-4 text-[#9de1b9] animate-pulse" />}
            <span className={`text-sm font-mono ${streamError ? 'text-[#fb7185]' : 'text-[#9de1b9]'}`}>{streamStatus}</span>
            {!streamError && <Loader2 className="w-4 h-4 animate-spin text-[#5d8573] ml-auto" />}
          </div>

          {/* Streaming output or error */}
          {streamError ? (
            <div className="p-6 flex flex-col items-center gap-4">
              <p className="text-sm text-[#fb7185]/80 font-mono text-center max-w-lg leading-relaxed">
                {streamError.includes('429') || streamError.includes('quota')
                  ? 'Gemini API quota exceeded (free tier: 20 requests/day). Wait for quota reset or upgrade your API key.'
                  : streamError}
              </p>
              <button onClick={regenerateReport} className="bg-[#12382c] hover:bg-[#1a4a3a] text-[#9de1b9] border border-[#1c5542] px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2">
                <RefreshCw className="w-4 h-4" /> Retry AI Analysis
              </button>
            </div>
          ) : (
            <pre
              ref={streamRef}
              className="p-5 text-xs font-mono text-[#78a390] leading-relaxed max-h-[60vh] overflow-y-auto whitespace-pre-wrap break-words"
              style={{ scrollBehavior: 'smooth' }}
            >
              {streamText || <span className="text-[#5d8573] italic">Waiting for AI response...</span>}
              <span className="inline-block w-2 h-4 bg-[#9de1b9] ml-0.5 animate-pulse" />
            </pre>
          )}

          {/* Footer */}
          <div className="px-5 py-2.5 border-t border-[#133c2e]/50 bg-[#04120e] flex items-center justify-between">
            <span className="text-[10px] font-mono text-[#5d8573]">
              {streamError ? 'Error' : streamText.length > 0 ? `${streamText.length} chars received` : 'Connecting...'}
            </span>
            <span className="text-[10px] font-mono text-[#5d8573]">Gemini AI</span>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] bg-[#03110d]">
        <div className="flex flex-col items-center gap-4 text-[#9de1b9]">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span className="font-mono text-sm tracking-widest uppercase">Loading Analytics...</span>
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
          <button onClick={regenerateReport} className="bg-[#12382c] hover:bg-[#1a4a3a] text-[#9de1b9] border border-[#1c5542] px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2">
            <RefreshCw className="w-4 h-4" /> Retry with AI
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
        <button onClick={regenerateReport} className="bg-[#12382c] hover:bg-[#1a4a3a] text-[#9de1b9] border border-[#1c5542] px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2">
          <Sparkles className="w-4 h-4" /> Regenerate Report
        </button>
      </div>

      {/* Executive Summary / Network Summary */}
      {(report.executiveSummary || report.network_summary || report.final_summary) && (
        <div className="bg-[#0a241c] border border-[#1c5542] p-6 rounded-2xl shadow-xl">
          <h3 className="text-lg font-bold text-[#9de1b9] flex items-center gap-2 mb-3">
            <Lightbulb className="h-5 w-5" /> {report.networkSize || report.network_summary ? 'Network Intelligence Overview' : 'Executive Summary'}
          </h3>
          <div className="space-y-4">
            <p className="text-sm text-[#e2f1ea]/80 leading-relaxed">
              {report.executiveSummary || report.network_summary?.general_observation || report.final_summary}
            </p>

            {(report.networkSize || report.network_summary) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-[#133c2e]">
                <div>
                  <h4 className="text-xs text-[#5d8573] uppercase tracking-widest mb-2 font-bold">Key Focus Areas</h4>
                  <ul className="space-y-1">
                    {(report.overallRecommendations || report.network_summary?.key_focus_areas || []).map((area, i) => (
                      <li key={i} className="text-xs text-[#e2f1ea]/70 flex gap-2">
                        <span className="text-[#9de1b9]">•</span> {area}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex flex-col justify-center items-end">
                  <div className="text-right">
                    <span className="text-xs text-[#5d8573] block uppercase tracking-widest font-bold">Total ATMs</span>
                    <span className="text-2xl font-bold text-[#9de1b9] font-mono">{report.networkSize || report.network_summary?.total_atms_in_network}</span>
                  </div>
                  {report.network_summary?.analysis_period_days && (
                    <div className="text-right mt-2">
                      <span className="text-xs text-[#5d8573] block uppercase tracking-widest font-bold">Period</span>
                      <span className="text-sm font-bold text-[#e2f1ea]">{report.network_summary.analysis_period_days} Days</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* High Priority Actions (V2) or Performance & Risks (V1) */}
      {report.highPriorityActions ? (
        <div className="space-y-6">
          <div className="bg-[#0a241c] border border-[#133c2e] rounded-2xl p-6 shadow-xl">
            <h3 className="text-lg font-bold text-[#fb7185] flex items-center gap-2 mb-6 border-b border-[#133c2e] pb-3">
              <ShieldAlert className="h-5 w-5" /> High Priority Actions
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h4 className="text-xs text-[#fb7185] uppercase tracking-widest mb-4 font-bold flex items-center gap-2">
                  Critical Understocking
                </h4>
                <div className="space-y-4">
                  {report.highPriorityActions.criticalUnderstocking.map((item, i) => (
                    <div key={i} className="bg-[#1f1115] border border-[#fb7185]/20 p-4 rounded-xl">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-bold text-[#e2f1ea]">{item.atmId}</span>
                        <span className="text-[10px] text-[#fb7185] bg-[#fb7185]/10 px-2 py-0.5 rounded-md border border-[#fb7185]/30 uppercase font-bold">Stockout Risk</span>
                      </div>
                      <p className="text-xs text-[#e2f1ea]/70 mb-3">{item.issue}</p>
                      <div className="bg-[#fb7185]/10 p-2.5 rounded-lg border border-[#fb7185]/20">
                        <span className="text-[9px] text-[#fb7185] font-bold block uppercase mb-1">Action Required</span>
                        <p className="text-[11px] text-[#fb7185]/90 font-medium italic">{item.action}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-xs text-amber-400 uppercase tracking-widest mb-4 font-bold flex items-center gap-2">
                  System Anomalies & Overstock
                </h4>
                <div className="space-y-4">
                  {report.highPriorityActions.severeOverstockingAndAnomalies.map((item, i) => (
                    <div key={i} className="bg-[#241e17] border border-amber-500/20 p-4 rounded-xl">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-bold text-[#e2f1ea]">{item.atmId}</span>
                        <span className="text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/30 uppercase font-bold">Investigation</span>
                      </div>
                      <p className="text-xs text-[#e2f1ea]/70 mb-3">{item.issue}</p>
                      <div className="bg-amber-500/10 p-2.5 rounded-lg border border-amber-500/20">
                        <span className="text-[9px] text-amber-400 font-bold block uppercase mb-1">Action Required</span>
                        <p className="text-[11px] text-amber-400/90 font-medium italic">{item.action}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (report.high_performance_atms_analysis || report.low_performance_atms_analysis) ? (
        <div className="space-y-6">
          {/* High Performance Analysis */}
          {report.high_performance_atms_analysis && (
            <div className="bg-[#0a241c] border border-[#133c2e] rounded-2xl p-6 shadow-xl">
              <h3 className="text-lg font-bold text-[#9de1b9] flex items-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5" /> High Performance Analysis
              </h3>
              <p className="text-xs text-[#78a390] mb-6">{report.high_performance_atms_analysis.description}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-xs text-[#fb7185] uppercase tracking-widest mb-3 font-bold flex items-center gap-2">
                    <ShieldAlert className="w-3 h-3" /> Immediate Attention
                  </h4>
                  <div className="space-y-3">
                    {report.high_performance_atms_analysis.atms_with_immediate_attention.map((atm, i) => (
                      <div key={i} className="bg-[#1f1115] border border-[#fb7185]/20 p-3 rounded-xl">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-bold text-[#e2f1ea]">{atm.id}</span>
                          <span className="text-[10px] text-[#fb7185] bg-[#fb7185]/10 px-2 py-0.5 rounded-md border border-[#fb7185]/30">
                            {atm.issue}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#e2f1ea]/70 mb-2">{atm.details}</p>
                        <div className="bg-[#fb7185]/5 p-2 rounded-lg border border-[#fb7185]/10">
                          <span className="text-[9px] text-[#fb7185] font-bold block uppercase mb-0.5">Recommendation</span>
                          <p className="text-[10px] text-[#fb7185]/90 italic">{atm.actionable_recommendation}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs text-amber-400 uppercase tracking-widest mb-3 font-bold flex items-center gap-2">
                    <AlertTriangle className="w-3 h-3" /> Overstocking Risk
                  </h4>
                  <div className="space-y-3">
                    {report.high_performance_atms_analysis.atms_with_overstocking_potential.map((atm, i) => (
                      <div key={i} className="bg-[#241e17] border border-amber-500/20 p-3 rounded-xl">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-bold text-[#e2f1ea]">{atm.id}</span>
                          <span className="text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/30">
                            {atm.issue}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#e2f1ea]/70 mb-2">{atm.details}</p>
                        <div className="bg-amber-500/5 p-2 rounded-lg border border-amber-500/10">
                          <span className="text-[9px] text-amber-400 font-bold block uppercase mb-0.5">Recommendation</span>
                          <p className="text-[10px] text-amber-400/90 italic">{atm.actionable_recommendation}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Low Performance Analysis */}
          {report.low_performance_atms_analysis && (
            <div className="bg-[#0a241c] border border-[#133c2e] rounded-2xl p-6 shadow-xl">
              <h3 className="text-lg font-bold text-amber-400 flex items-center gap-2 mb-2">
                <TrendingDown className="h-5 w-5" /> Underutilization Analysis
              </h3>
              <p className="text-xs text-[#78a390] mb-6">{report.low_performance_atms_analysis.description}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <h4 className="text-xs text-[#fb7185] uppercase tracking-widest mb-3 font-bold">Urgent Action Required</h4>
                  <div className="space-y-3">
                    {report.low_performance_atms_analysis.atms_requiring_urgent_action.map((atm, i) => (
                      <div key={i} className="bg-[#1f1115] border border-[#fb7185]/20 p-3 rounded-xl">
                        <span className="text-sm font-bold text-[#e2f1ea] block mb-1">{atm.id}</span>
                        <span className="text-[10px] text-[#fb7185] font-mono block mb-2">{atm.issue}</span>
                        <p className="text-[11px] text-[#e2f1ea]/70 mb-2">{atm.details}</p>
                        <p className="text-[10px] text-[#fb7185]/90 border-t border-[#fb7185]/10 pt-1 mt-1 font-medium">{atm.actionable_recommendation}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs text-[#fb7185] uppercase tracking-widest mb-3 font-bold">Cash-Out Trends</h4>
                  <div className="space-y-3">
                    {report.low_performance_atms_analysis.atms_with_cash_out_risk_despite_lower_volume.map((atm, i) => (
                      <div key={i} className="bg-[#1f1115] border border-[#fb7185]/20 p-3 rounded-xl">
                        <span className="text-sm font-bold text-[#e2f1ea] block mb-1">{atm.id}</span>
                        <span className="text-[10px] text-[#fb7185] font-mono block mb-2">{atm.issue}</span>
                        <p className="text-[11px] text-[#e2f1ea]/70 mb-2">{atm.details}</p>
                        <p className="text-[10px] text-[#fb7185]/90 border-t border-[#fb7185]/10 pt-1 mt-1 font-medium">{atm.actionable_recommendation}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs text-amber-400 uppercase tracking-widest mb-3 font-bold">Inefficient Overstock</h4>
                  <div className="space-y-3">
                    {report.low_performance_atms_analysis.atms_with_overstocking_potential.map((atm, i) => (
                      <div key={i} className="bg-[#241e17] border border-amber-500/20 p-3 rounded-xl">
                        <span className="text-sm font-bold text-[#e2f1ea] block mb-1">{atm.id}</span>
                        <span className="text-[10px] text-amber-400 font-mono block mb-2">{atm.issue}</span>
                        <p className="text-[11px] text-[#e2f1ea]/70 mb-2">{atm.details}</p>
                        <p className="text-[10px] text-amber-400/90 border-t border-amber-500/10 pt-1 mt-1 font-medium">{atm.actionable_recommendation}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Risk Analysis (Old Structure Fallback) */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-[#0a241c] border border-[#133c2e] rounded-2xl p-6 shadow-xl">
            <h3 className="text-lg font-bold text-[#fb7185] flex items-center gap-2 mb-4 border-b border-[#133c2e] pb-3">
              <ShieldAlert className="h-5 w-5" /> Critical ATMs
            </h3>
            <div className="space-y-3">
              {(report.risk_analysis?.critical_atms || []).length === 0 ? (
                <p className="text-sm text-[#5d8573]">No critical ATMs at this time</p>
              ) : (
                (report.risk_analysis?.critical_atms || []).slice(0, 5).map((atm: any, i: number) => (
                  <div key={i} className="bg-[#1f1115] border border-[#fb7185]/20 p-3 rounded-xl">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold text-[#e2f1ea]">{atm.atm_id || atm.atmId || `ATM ${i + 1}`}</span>
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
                (report.risk_analysis?.warning_atms || []).slice(0, 5).map((atm: any, i: number) => (
                  <div key={i} className="bg-[#241e17] border border-amber-500/20 p-3 rounded-xl">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold text-[#e2f1ea]">{atm.atm_id || atm.atmId || `ATM ${i + 1}`}</span>
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
      )}

      {/* Cash Optimization Opportunities (V2 or V1) */}
      {(report.cashOptimizationOpportunities || report.overall_optimization_opportunities || report.optimization_recommendations) && (
        <div className="bg-[#0a241c] border border-[#133c2e] rounded-2xl p-6 shadow-xl">
          <h3 className="text-lg font-bold text-[#9de1b9] flex items-center gap-2 mb-4 border-b border-[#133c2e] pb-3">
            <Truck className="h-5 w-5" /> Optimization & Strategic Recommendations
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {report.cashOptimizationOpportunities ? (
              report.cashOptimizationOpportunities.map((opp, i) => (
                <div key={i} className="bg-[#04120e] border border-[#133c2e] p-5 rounded-2xl flex flex-col shadow-inner">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="text-sm font-bold text-[#9de1b9] flex items-center gap-2">
                      <Activity className="w-4 h-4" /> {opp.category}
                    </h4>
                  </div>
                  <p className="text-xs text-[#e2f1ea]/80 leading-relaxed mb-4 flex-1">{opp.description}</p>
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {opp.atms.map((atmId, j) => (
                      <span key={j} className="text-[10px] bg-[#12382c] text-[#9de1b9] px-2 py-0.5 rounded-full border border-[#1c5542] font-mono">
                        {atmId}
                      </span>
                    ))}
                  </div>
                  <div className="bg-[#12382c]/30 p-3 rounded-xl border border-[#1c5542]/50 mt-auto">
                    <span className="text-[9px] text-[#9de1b9] font-bold block uppercase mb-1">Actionable Strategy</span>
                    <p className="text-[11px] text-[#e2f1ea]/90 leading-snug">{opp.action}</p>
                  </div>
                </div>
              ))
            ) : report.overall_optimization_opportunities ? (
              report.overall_optimization_opportunities.map((opp, i) => (
                <div key={i} className="bg-[#04120e] border border-[#133c2e] p-4 rounded-xl flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-sm font-bold text-[#9de1b9]">{opp.opportunity}</h4>
                  </div>
                  <p className="text-xs text-[#e2f1ea]/80 leading-relaxed mb-3 flex-1">{opp.details}</p>
                  <div className="bg-[#12382c]/50 p-2 rounded-lg border border-[#1c5542]">
                    <span className="text-[9px] text-[#9de1b9] font-bold block uppercase mb-1">Expected Impact</span>
                    <p className="text-[10px] text-[#e2f1ea]/90">{opp.impact}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-[#04120e] border border-[#133c2e] p-4 rounded-xl">
                  <h4 className="text-xs text-[#5d8573] uppercase tracking-widest mb-2 font-bold">Refill Strategy</h4>
                  <p className="text-sm text-[#e2f1ea]/80 leading-relaxed">{report.optimization_recommendations?.refill_strategy || 'N/A'}</p>
                </div>
                <div className="bg-[#04120e] border border-[#133c2e] p-4 rounded-xl">
                  <h4 className="text-xs text-[#5d8573] uppercase tracking-widest mb-2 font-bold">Cash Distribution</h4>
                  <p className="text-sm text-[#e2f1ea]/80 leading-relaxed">{report.optimization_recommendations?.cash_distribution_plan || 'N/A'}</p>
                </div>
                <div className="bg-[#04120e] border border-[#133c2e] p-4 rounded-xl">
                  <h4 className="text-xs text-[#5d8573] uppercase tracking-widest mb-2 font-bold">Logistics Cost Reduction</h4>
                  <p className="text-sm text-[#e2f1ea]/80 leading-relaxed">{report.optimization_recommendations?.logistics_cost_reduction || 'N/A'}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Weekly Analysis (Old Fallback) */}
      {report.weekly_analysis && !report.network_summary && (
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
                    <span className="text-[#e2f1ea] font-medium">{atm.atm_id || atm.atmId || `ATM ${i + 1}`}</span>
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
                    <span className="text-[#e2f1ea] font-medium">{atm.atm_id || atm.atmId || `ATM ${i + 1}`}</span>
                    <span className="text-amber-400 font-mono">{typeof atm === 'string' ? atm : (atm.reason || '')}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Event Analysis (Old Fallback) */}
      {report.event_analysis && !report.network_summary && (
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

      {/* Location Intelligence (Old Fallback) */}
      {report.location_intelligence && report.location_intelligence.length > 0 && !report.network_summary && (
        <div className="bg-[#0a241c] border border-[#133c2e] rounded-2xl p-6 shadow-xl">
          <h3 className="text-lg font-bold text-[#e2f1ea] flex items-center gap-2 mb-4 border-b border-[#133c2e] pb-3">
            <MapPin className="h-5 w-5 text-[#9de1b9]" /> Location Intelligence
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {report.location_intelligence.slice(0, 9).map((loc, i) => (
              <div key={i} className="bg-[#04120e] border border-[#133c2e] p-3 rounded-xl">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-bold text-[#e2f1ea]">{loc.atm_id}</span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-md border font-mono font-bold uppercase ${loc.status === 'KEEP' ? 'bg-[#12382c] text-[#9de1b9] border-[#1c5542]' :
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
