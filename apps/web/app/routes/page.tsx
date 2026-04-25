"use client";
import React from 'react';
import { Route as RouteIcon, Truck } from 'lucide-react';
import { useBadges, defaultBadges } from '../../components/BadgeContext';

export default function RoutesPage() {
  const { badges, mounted } = useBadges();
  const routesBadge = mounted ? badges.routes : defaultBadges.routes;

  return (
    <div className="p-8 max-w-7xl mx-auto w-full space-y-8 flex-1 flex flex-col h-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h2 className="text-3xl font-bold text-[#e2f1ea] mb-2 tracking-tight">Active Routes 
            {routesBadge > 0 && <span className="ml-2 text-sm bg-[#9de1b9] text-[#071a14] px-2.5 py-1 rounded-full align-middle font-bold">{routesBadge} Active</span>}
          </h2>
          <p className="text-[#78a390]">Cash transport and maintenance dispatch routing</p>
        </div>
      </div>
      
      <div className="bg-[#0a241c] border border-[#133c2e] rounded-2xl p-6 shadow-xl">
        <ul className="divide-y divide-[#133c2e]">
          <li className="py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-[#12382c] p-3 rounded-xl border border-[#1c5542]">
                <Truck className="h-6 w-6 text-[#9de1b9]" />
              </div>
              <div>
                <h4 className="font-bold text-[#e2f1ea]">Route Alpha - Cash Refill</h4>
                <p className="text-sm text-[#78a390]">3 locations remaining • Driver: Marcus T.</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="bg-[#12382c] text-[#9de1b9] border border-[#1c5542] px-3 py-1 rounded-full text-xs font-bold">
                In Progress
              </span>
            </div>
          </li>
          <li className="py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-[#241e17] p-3 rounded-xl border border-amber-900/40">
                <RouteIcon className="h-6 w-6 text-amber-500" />
              </div>
              <div>
                <h4 className="font-bold text-[#e2f1ea]">Route Beta - Maintenance</h4>
                <p className="text-sm text-[#78a390]">Heading to Airport Terminal 3 • Tech: Sarah J.</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="bg-[#2b241c] text-amber-500 border border-[#3b2a12] px-3 py-1 rounded-full text-xs font-bold">
                Dispatched
              </span>
            </div>
          </li>
        </ul>
      </div>
    </div>
  );
}
