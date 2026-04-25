"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, Moon, Settings, LogOut, MapPin, AlertTriangle, Route } from 'lucide-react';
import { useBadges, defaultBadges } from './BadgeContext';
import { useAuth } from './AuthContext';
import { useRouter } from 'next/navigation';

const searchDatabase = [
  { id: 1, type: 'atm', name: 'Tashkent Hub', detail: 'Main Branch • 85% Cash (Optimal)', link: '/live-map' },
  { id: 3, type: 'atm', name: 'Samarkand Core', detail: 'Registon • 25% Cash (Warning)', link: '/live-map' },
  { id: 4, type: 'atm', name: 'Bukhara Point', detail: 'Labi Hovuz • 70% Cash (Optimal)', link: '/live-map' },
  { id: 5, type: 'atm', name: 'Nukus Terminal', detail: 'Markaziy Box • 5% Cash (Critical)', link: '/live-map' },
  { id: 'alpha', type: 'route', name: 'Route Alpha - Cash Refill', detail: '3 locations remaining', link: '/routes' },
  { id: 'beta', type: 'route', name: 'Route Beta - Maintenance', detail: 'Heading to Airport Terminal 3', link: '/routes' },
  { id: 'alert1', type: 'alert', name: 'System Malfunction', detail: 'Receipt printer jam at Westside', link: '/alerts' },
  { id: 'alert2', type: 'alert', name: 'Network Latency', detail: 'Latency exceeding 500ms threshold', link: '/alerts' }
];

export function Header() {
  const { badges, mounted } = useBadges();
  const { logout } = useAuth();
  const alertsBadge = mounted ? badges.alerts : defaultBadges.alerts;
  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const router = useRouter();
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close dropdown if clicked outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const results = searchDatabase.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    item.detail.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (item: { id?: string | number, link: string }) => {
    setSearchQuery('');
    setIsFocused(false);
    router.push(item.id ? `${item.link}?id=${item.id}` : item.link);
  };

  return (
    <header className="h-[80px] px-8 flex items-center justify-between sticky top-0 bg-[#071a14]/80 backdrop-blur-md z-50 border-b border-[#133c2e]/50">
      {/* Search */}
      <div className="relative w-full max-w-[400px]" ref={wrapperRef}>
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-[#78a390]" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          placeholder="Search ATMs, locations, routes..."
          className="bg-[#0a241c] border border-[#133c2e] text-sm rounded-full w-full pl-10 pr-4 py-2.5 focus:outline-none focus:border-[#9de1b9] focus:ring-1 focus:ring-[#9de1b9] transition-all text-[#e2f1ea] placeholder-[#5d8573] shadow-sm"
        />
        
        {/* Dropdown Results */}
        {isFocused && searchQuery.length > 0 && (
          <div className="absolute top-full left-0 w-full mt-2 bg-[#071a14] border border-[#133c2e] rounded-xl shadow-[0_15px_40px_rgba(3,17,13,0.8)] py-2 z-50 max-h-[300px] overflow-y-auto">
             {results.length > 0 ? results.map((result, idx) => (
                <div 
                  key={idx} 
                  onClick={() => handleSelect(result)}
                  className="px-4 py-3 hover:bg-[#0e3227] cursor-pointer flex items-start gap-3 transition-colors border-b border-[#133c2e]/50 last:border-0"
                >
                   <div className="mt-0.5">
                     {result.type === 'atm' && <MapPin className="h-4 w-4 text-[#9de1b9]" />}
                     {result.type === 'route' && <Route className="h-4 w-4 text-amber-500" />}
                     {result.type === 'alert' && <AlertTriangle className="h-4 w-4 text-[#fb7185]" />}
                   </div>
                   <div>
                      <h5 className="text-[#e2f1ea] text-sm font-semibold">{result.name}</h5>
                      <p className="text-[#5d8573] text-xs mt-0.5">{result.detail}</p>
                   </div>
                </div>
             )) : (
                <div className="px-4 py-4 text-[#5d8573] text-sm text-center border border-dashed border-[#133c2e] m-2 rounded-lg">No results found for &quot;{searchQuery}&quot;</div>
             )}
          </div>
        )}
      </div>

      {/* Top Right Actions */}
      <div className="flex items-center gap-6">
        <div className="hidden lg:flex items-center gap-6 mr-2">
          <div className="flex flex-col items-end">
            <span className="text-xs text-[#78a390]">Active ATMs</span>
            <span className="text-sm font-semibold text-[#e2f1ea]">8/8</span>
          </div>
          <div className="h-8 w-px bg-[#133c2e]"></div>
          <div className="flex flex-col items-end">
            <span className="text-xs text-[#78a390]">Alerts</span>
            <span className={`text-sm font-semibold ${alertsBadge > 0 ? 'text-[#fb7185]' : 'text-[#e2f1ea]'}`}>
              {alertsBadge}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="relative bg-[#0a241c] p-2.5 rounded-full border border-[#133c2e] hover:bg-[#0e3227] transition-colors">
            <Bell className="h-4 w-4 text-[#9de1b9]" />
            {alertsBadge > 0 && (
              <span className="absolute top-0 right-0 h-2.5 w-2.5 bg-[#fb7185] rounded-full border-2 border-[#0a241c]"></span>
            )}
          </button>
          <button className="bg-[#0a241c] p-2.5 rounded-full border border-[#133c2e] hover:bg-[#0e3227] transition-colors">
            <Moon className="h-4 w-4 text-[#9de1b9]" />
          </button>
          <button className="bg-[#0a241c] p-2.5 rounded-full border border-[#133c2e] hover:bg-[#0e3227] transition-colors">
            <Settings className="h-4 w-4 text-[#9de1b9]" />
          </button>
          <button onClick={logout} className="bg-[#1f1115] p-2.5 rounded-full border border-rose-900/30 hover:bg-[#2b161c] transition-colors ml-2" title="Log Out">
            <LogOut className="h-4 w-4 text-[#fb7185]" />
          </button>
        </div>
      </div>
    </header>
  );
}
