"use client";
import React from 'react';
import { AlertTriangle, Clock } from 'lucide-react';
import { useBadges, defaultBadges } from '../../components/BadgeContext';

export default function AlertsPage() {
  const { badges, mounted } = useBadges();
  const alertsBadge = mounted ? badges.alerts : defaultBadges.alerts;

  return (
    <div className="p-8 max-w-7xl mx-auto w-full space-y-8 flex-1 flex flex-col h-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h2 className="text-3xl font-bold text-[#e2f1ea] mb-2 tracking-tight">System Alerts 
            {alertsBadge > 0 && <span className="ml-2 text-sm bg-rose-500 text-white px-2.5 py-1 rounded-full align-middle">{alertsBadge} Unresolved</span>}
          </h2>
          <p className="text-[#78a390]">Manage required maintenance and security notifications</p>
        </div>
        <button className="bg-[#133c2e] text-[#e2f1ea] border border-[#1c5542] px-4 py-2 rounded-lg text-sm hover:bg-[#1a4a39] transition">
          Acknowledge All
        </button>
      </div>
      
      <div className="bg-[#0a241c] border border-[#133c2e] rounded-2xl shadow-xl flex flex-col gap-0 overflow-hidden divide-y divide-[#133c2e]">
        <AlertItem 
          title="Grand Central Station" 
          description="Cash level at 29% - refill scheduled for tomorrow" 
          time="11:00:00" 
        />
        <AlertItem 
          title="Airport Terminal 3" 
          description="Cash level below 50% - refill recommended within 48 hours" 
          time="10:35:00" 
        />
        <AlertItem 
          title="Westside Mall" 
          description="Hardware malfunction detected: Receipt printer jam" 
          time="09:15:00" 
        />
        <AlertItem 
          title="South Park Branch" 
          description="Network latency exceeding 500ms threshold" 
          time="08:42:00" 
        />
        <AlertItem 
          title="Downtown Financial District" 
          description="Unusual withdrawal frequency flagged by AI monitor" 
          time="Yesterday, 22:30:00" 
        />
      </div>
    </div>
  );
}

function AlertItem({ title, description, time }: { title: string, description: string, time: string }) {
  return (
    <div className="bg-[#0e2d24] hover:bg-[#12382c] p-5 flex gap-4 transition-colors group">
      <div className="mt-0.5">
        <AlertTriangle className="h-6 w-6 text-amber-500 group-hover:text-amber-400 transition-colors" />
      </div>
      <div className="flex-1">
        <div className="flex justify-between items-start mb-1">
          <h5 className="font-semibold text-[#e2f1ea] text-base">{title}</h5>
          <button className="bg-transparent border border-amber-800 text-amber-500 text-xs px-3 py-1.5 rounded-lg hover:bg-amber-900/50 hover:text-white transition-colors">Acknowledge</button>
        </div>
        <p className="text-sm text-[#9de1b9]/80 mb-3">{description}</p>
        <div className="flex items-center text-xs text-[#5d8573] font-medium">
          <Clock className="h-3.5 w-3.5 mr-1.5" /> {time}
        </div>
      </div>
    </div>
  );
}
