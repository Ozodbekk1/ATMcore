"use client";
import React from 'react';
import { BrainCircuit } from 'lucide-react';
import { useBadges, defaultBadges } from '../../components/BadgeContext';

export default function AIPredictionsPage() {
  const { badges, mounted } = useBadges();
  const aiBadge = mounted ? badges.ai : defaultBadges.ai;

  return (
    <div className="p-8 max-w-7xl mx-auto w-full space-y-8 flex-1 flex flex-col h-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h2 className="text-3xl font-bold text-[#e2f1ea] mb-2 tracking-tight">AI Predictions 
            {aiBadge > 0 && <span className="ml-2 text-sm bg-[#9de1b9] text-[#071a14] px-2.5 py-1 rounded-full align-middle font-bold">{aiBadge} New</span>}
          </h2>
          <p className="text-[#78a390]">Cash demand forecasts and anomaly detection models</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#0a241c] border border-[#133c2e] rounded-2xl p-6 shadow-xl">
          <h3 className="text-lg font-bold text-[#e2f1ea] flex items-center gap-2 mb-4">
            <BrainCircuit className="h-5 w-5 text-[#9de1b9]" /> Weekend Cash Demand
          </h3>
          <p className="text-sm text-[#78a390]">High probability of cash depletion at Downtown locations due to local events. Recommended to increase cap by 15% before Friday.</p>
        </div>
        <div className="bg-[#0a241c] border border-[#133c2e] rounded-2xl p-6 shadow-xl">
          <h3 className="text-lg font-bold text-[#e2f1ea] flex items-center gap-2 mb-4">
            <BrainCircuit className="h-5 w-5 text-[#9de1b9]" /> Usage Anomalies
          </h3>
          <p className="text-sm text-[#78a390]">Detected unusual withdrawal amounts at Westside Branch between 2:00 AM and 4:00 AM over the past 3 days.</p>
        </div>
      </div>
    </div>
  );
}
