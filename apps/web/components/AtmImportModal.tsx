"use client";

import React, { useState, useCallback, useRef } from 'react';
import {
    X,
    Upload,
    FileJson,
    Table2,
    Loader2,
    CheckCircle,
    AlertTriangle,
    Download,
    FileUp,
    Link as LinkIcon,
    Eye,
    Trash2,
    Info
} from 'lucide-react';
import { importAtmsJson, syncAtmsFromSheets } from '../lib/api';

interface AtmImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onImportComplete: () => void;
}

type ImportTab = 'json' | 'sheets';

interface ImportResult {
    success: boolean;
    message: string;
    details?: {
        atmsUpdated?: number;
        transactionsUpdated?: number;
    };
}

const SAMPLE_JSON = {
    atms: [
        {
            atmId: "ATM-001",
            lat: 41.2995,
            lng: 69.2401,
            branch: "Tashkent Central",
            capacity: 500000,
            currentCash: 320000,
            status: "ONLINE"
        },
        {
            atmId: "ATM-002",
            lat: 41.3111,
            lng: 69.2797,
            branch: "Chorsu Branch",
            capacity: 400000,
            currentCash: 185000,
            status: "ONLINE"
        }
    ],
    transactions: [
        {
            atmId: "ATM-001",
            timestamp: "2026-04-25T10:30:00Z",
            withdrawAmount: 50000,
            depositAmount: 0,
            cashRemaining: 270000,
            isHoliday: false,
            period: "DAILY"
        }
    ]
};

export default function AtmImportModal({ isOpen, onClose, onImportComplete }: AtmImportModalProps) {
    const [activeTab, setActiveTab] = useState<ImportTab>('json');
    const [importing, setImporting] = useState(false);
    const [result, setResult] = useState<ImportResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    // JSON tab state
    const [jsonText, setJsonText] = useState('');
    const [parsedData, setParsedData] = useState<any>(null);
    const [parseError, setParseError] = useState<string | null>(null);
    const [showPreview, setShowPreview] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    // Sheets tab state
    const [spreadsheetId, setSpreadsheetId] = useState('');

    const resetState = () => {
        setResult(null);
        setError(null);
        setParseError(null);
        setParsedData(null);
        setShowPreview(false);
    };

    // --- JSON Tab Logic ---
    const parseJson = useCallback((text: string) => {
        setJsonText(text);
        setParseError(null);
        setParsedData(null);
        if (!text.trim()) return;

        try {
            const data = JSON.parse(text);
            if (!data.atms && !data.transactions) {
                setParseError('JSON must contain "atms" and/or "transactions" arrays');
                return;
            }
            setParsedData(data);
        } catch (e: any) {
            setParseError(`Invalid JSON: ${e.message}`);
        }
    }, []);

    const handleFileUpload = (file: File) => {
        if (!file.name.endsWith('.json')) {
            setParseError('Please upload a .json file');
            return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result as string;
            parseJson(text);
        };
        reader.readAsText(file);
    };

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFileUpload(file);
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback(() => {
        setIsDragging(false);
    }, []);

    const handleJsonImport = async () => {
        if (!parsedData) return;
        setImporting(true);
        setError(null);
        setResult(null);
        try {
            const res = await importAtmsJson(parsedData);
            setResult(res);
            onImportComplete();
        } catch (err: any) {
            setError(err.message || 'Import failed');
        } finally {
            setImporting(false);
        }
    };

    // --- Sheets Tab Logic ---
    const handleSheetsSync = async () => {
        if (!spreadsheetId.trim()) return;
        setImporting(true);
        setError(null);
        setResult(null);
        try {
            const res = await syncAtmsFromSheets(spreadsheetId.trim());
            setResult(res);
            onImportComplete();
        } catch (err: any) {
            setError(err.message || 'Sync failed');
        } finally {
            setImporting(false);
        }
    };

    const downloadSampleJson = () => {
        const blob = new Blob([JSON.stringify(SAMPLE_JSON, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'atm_sample_data.json';
        a.click();
        URL.revokeObjectURL(url);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

            {/* Modal */}
            <div className="relative w-full max-w-3xl mx-4 bg-[#04120e] border border-[#133c2e] rounded-3xl shadow-2xl shadow-black/50 animate-in fade-in zoom-in-95 duration-300 max-h-[90vh] flex flex-col">

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-[#133c2e]">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-[#12382c] rounded-xl border border-[#1c5542]">
                            <Upload className="w-5 h-5 text-[#9de1b9]" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-[#e2f1ea]">Import ATM Data</h2>
                            <p className="text-xs text-[#5d8573]">Bulk import via JSON file or sync from Google Sheets</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-[#0a241c] rounded-xl transition-colors text-[#5d8573] hover:text-[#e2f1ea]">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Tab Switcher */}
                <div className="flex border-b border-[#133c2e]">
                    <button
                        onClick={() => { setActiveTab('json'); resetState(); }}
                        className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-semibold transition-all border-b-2 ${activeTab === 'json'
                                ? 'border-[#9de1b9] text-[#9de1b9] bg-[#0a241c]'
                                : 'border-transparent text-[#5d8573] hover:text-[#78a390] hover:bg-[#061814]'
                            }`}
                    >
                        <FileJson className="w-4 h-4" /> JSON Import
                    </button>
                    <button
                        onClick={() => { setActiveTab('sheets'); resetState(); }}
                        className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-semibold transition-all border-b-2 ${activeTab === 'sheets'
                                ? 'border-[#9de1b9] text-[#9de1b9] bg-[#0a241c]'
                                : 'border-transparent text-[#5d8573] hover:text-[#78a390] hover:bg-[#061814]'
                            }`}
                    >
                        <Table2 className="w-4 h-4" /> Google Sheets
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto flex-1">

                    {/* Success Message */}
                    {result && result.success && (
                        <div className="mb-5 p-4 bg-[#12382c] border border-[#1c5542] rounded-xl text-[#9de1b9] text-sm flex items-start gap-3 animate-in slide-in-from-top duration-300">
                            <CheckCircle className="w-5 h-5 mt-0.5 shrink-0" />
                            <div>
                                <p className="font-bold">{result.message}</p>
                                {result.details && (
                                    <p className="text-xs text-[#78a390] mt-1">
                                        {result.details.atmsUpdated !== undefined && `${result.details.atmsUpdated} ATMs imported`}
                                        {result.details.atmsUpdated !== undefined && result.details.transactionsUpdated !== undefined && ' · '}
                                        {result.details.transactionsUpdated !== undefined && `${result.details.transactionsUpdated} transactions imported`}
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Error Message */}
                    {error && (
                        <div className="mb-5 p-4 bg-[#1f1115] border border-rose-900/30 rounded-xl text-[#fb7185] text-sm flex items-start gap-3 animate-in slide-in-from-top duration-300">
                            <AlertTriangle className="w-5 h-5 mt-0.5 shrink-0" />
                            <div>
                                <p className="font-bold">Import Failed</p>
                                <p className="text-xs mt-1 opacity-80">{error}</p>
                            </div>
                        </div>
                    )}

                    {/* ====== JSON TAB ====== */}
                    {activeTab === 'json' && (
                        <div className="space-y-5">

                            {/* Drag & Drop Upload */}
                            <div
                                onDrop={handleDrop}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onClick={() => fileInputRef.current?.click()}
                                className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 ${isDragging
                                        ? 'border-[#9de1b9] bg-[#0a241c] scale-[1.01]'
                                        : 'border-[#133c2e] bg-[#061814] hover:border-[#1c5542] hover:bg-[#0a241c]'
                                    }`}
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".json"
                                    className="hidden"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) handleFileUpload(file);
                                    }}
                                />
                                <div className="flex flex-col items-center gap-3">
                                    <div className={`p-4 rounded-2xl transition-colors ${isDragging ? 'bg-[#12382c]' : 'bg-[#0a241c]'}`}>
                                        <FileUp className={`w-8 h-8 ${isDragging ? 'text-[#9de1b9]' : 'text-[#5d8573]'}`} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-[#e2f1ea]">
                                            {isDragging ? 'Drop your JSON file here' : 'Drop JSON file or click to browse'}
                                        </p>
                                        <p className="text-xs text-[#5d8573] mt-1">Supports .json files with ATM and transaction data</p>
                                    </div>
                                </div>
                            </div>

                            {/* OR Divider */}
                            <div className="flex items-center gap-4">
                                <div className="flex-1 h-px bg-[#133c2e]" />
                                <span className="text-[10px] text-[#5d8573] font-bold tracking-widest uppercase">or paste json</span>
                                <div className="flex-1 h-px bg-[#133c2e]" />
                            </div>

                            {/* JSON Textarea */}
                            <textarea
                                value={jsonText}
                                onChange={(e) => parseJson(e.target.value)}
                                placeholder={'{\n  "atms": [...],\n  "transactions": [...]\n}'}
                                rows={8}
                                className="w-full bg-[#061814] border border-[#133c2e] rounded-xl p-4 text-sm font-mono text-[#e2f1ea] placeholder-[#2a4a3a] focus:outline-none focus:border-[#1c5542] focus:ring-1 focus:ring-[#1c5542]/50 resize-none transition-all"
                            />

                            {/* Parse Error */}
                            {parseError && (
                                <div className="p-3 bg-[#1f1115] border border-rose-900/30 rounded-xl text-[#fb7185] text-xs flex items-center gap-2">
                                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" /> {parseError}
                                </div>
                            )}

                            {/* Data Preview */}
                            {parsedData && (
                                <div className="space-y-3">
                                    <button
                                        onClick={() => setShowPreview(!showPreview)}
                                        className="flex items-center gap-2 text-xs text-[#9de1b9] font-semibold hover:underline"
                                    >
                                        <Eye className="w-3.5 h-3.5" />
                                        {showPreview ? 'Hide Preview' : 'Show Preview'} ({parsedData.atms?.length || 0} ATMs, {parsedData.transactions?.length || 0} transactions)
                                    </button>

                                    {showPreview && parsedData.atms && parsedData.atms.length > 0 && (
                                        <div className="bg-[#061814] border border-[#133c2e] rounded-xl overflow-hidden">
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-xs">
                                                    <thead>
                                                        <tr className="border-b border-[#133c2e] bg-[#0a241c]">
                                                            <th className="px-4 py-2.5 text-left text-[#5d8573] font-bold uppercase tracking-wider">ATM ID</th>
                                                            <th className="px-4 py-2.5 text-left text-[#5d8573] font-bold uppercase tracking-wider">Branch</th>
                                                            <th className="px-4 py-2.5 text-left text-[#5d8573] font-bold uppercase tracking-wider">Location</th>
                                                            <th className="px-4 py-2.5 text-left text-[#5d8573] font-bold uppercase tracking-wider">Capacity</th>
                                                            <th className="px-4 py-2.5 text-left text-[#5d8573] font-bold uppercase tracking-wider">Status</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-[#133c2e]/50">
                                                        {parsedData.atms.slice(0, 10).map((atm: any, i: number) => (
                                                            <tr key={i} className="hover:bg-[#0a241c] transition-colors">
                                                                <td className="px-4 py-2 text-[#9de1b9] font-mono">{atm.atmId}</td>
                                                                <td className="px-4 py-2 text-[#e2f1ea]">{atm.branch || 'N/A'}</td>
                                                                <td className="px-4 py-2 text-[#78a390] font-mono">
                                                                    {(atm.lat || atm.location?.lat || 0).toFixed(2)}, {(atm.lng || atm.location?.lng || 0).toFixed(2)}
                                                                </td>
                                                                <td className="px-4 py-2 text-[#78a390]">${(atm.capacity || 0).toLocaleString()}</td>
                                                                <td className="px-4 py-2">
                                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${atm.status === 'ONLINE' ? 'bg-[#12382c] text-[#9de1b9]' :
                                                                            atm.status === 'OFFLINE' ? 'bg-[#1f1115] text-[#fb7185]' :
                                                                                'bg-[#241e17] text-amber-400'
                                                                        }`}>{atm.status || 'ONLINE'}</span>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                            {parsedData.atms.length > 10 && (
                                                <div className="px-4 py-2 text-[10px] text-[#5d8573] border-t border-[#133c2e] bg-[#0a241c]">
                                                    Showing 10 of {parsedData.atms.length} ATMs
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Action Row */}
                            <div className="flex items-center justify-between pt-2">
                                <button
                                    onClick={downloadSampleJson}
                                    className="flex items-center gap-2 text-xs text-[#78a390] hover:text-[#9de1b9] transition-colors font-medium"
                                >
                                    <Download className="w-3.5 h-3.5" /> Download Sample JSON
                                </button>
                                <button
                                    onClick={handleJsonImport}
                                    disabled={!parsedData || importing}
                                    className="bg-[#9de1b9] text-[#071a14] px-6 py-3 rounded-xl font-bold text-sm shadow-[0_0_20px_rgba(157,225,185,0.3)] hover:bg-[#b0ebd1] transition-all flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
                                >
                                    {importing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                                    {importing ? 'Importing...' : 'Import Data'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ====== SHEETS TAB ====== */}
                    {activeTab === 'sheets' && (
                        <div className="space-y-5">

                            {/* Info Box */}
                            <div className="p-4 bg-[#0a241c] border border-[#133c2e] rounded-xl">
                                <div className="flex items-start gap-3">
                                    <Info className="w-5 h-5 text-[#9de1b9] shrink-0 mt-0.5" />
                                    <div className="text-xs text-[#78a390] space-y-2">
                                        <p className="font-semibold text-[#e2f1ea] text-sm">Google Sheets Format</p>
                                        <p>Your spreadsheet must have two sheets:</p>
                                        <ul className="list-disc pl-4 space-y-1">
                                            <li><span className="text-[#9de1b9] font-mono">ATM_Registry</span> — Columns: atmId, lat, lng, branch, capacity, currentCash</li>
                                            <li><span className="text-[#9de1b9] font-mono">Transactions</span> — Columns: atmId, timestamp, withdrawAmount, depositAmount, cashRemaining, isHoliday, period</li>
                                        </ul>
                                        <p className="text-[#5d8573]">Headers should be in row 1. Data starts from row 2.</p>
                                    </div>
                                </div>
                            </div>

                            {/* Spreadsheet ID Input */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-[#78a390] uppercase tracking-wider">Spreadsheet ID</label>
                                <div className="flex gap-3">
                                    <div className="flex-1 relative">
                                        <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5d8573]" />
                                        <input
                                            type="text"
                                            value={spreadsheetId}
                                            onChange={(e) => setSpreadsheetId(e.target.value)}
                                            placeholder="e.g. 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms"
                                            className="w-full bg-[#061814] border border-[#133c2e] rounded-xl pl-11 pr-4 py-3.5 text-sm font-mono text-[#e2f1ea] placeholder-[#2a4a3a] focus:outline-none focus:border-[#1c5542] focus:ring-1 focus:ring-[#1c5542]/50 transition-all"
                                        />
                                    </div>
                                </div>
                                <p className="text-[10px] text-[#5d8573]">
                                    Find the ID in your Google Sheets URL: docs.google.com/spreadsheets/d/<span className="text-[#9de1b9]">SPREADSHEET_ID</span>/edit
                                </p>
                            </div>

                            {/* Sync Button */}
                            <div className="flex justify-end pt-2">
                                <button
                                    onClick={handleSheetsSync}
                                    disabled={!spreadsheetId.trim() || importing}
                                    className="bg-[#9de1b9] text-[#071a14] px-6 py-3 rounded-xl font-bold text-sm shadow-[0_0_20px_rgba(157,225,185,0.3)] hover:bg-[#b0ebd1] transition-all flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
                                >
                                    {importing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Table2 className="w-4 h-4" />}
                                    {importing ? 'Syncing Data...' : 'Sync from Sheets'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
