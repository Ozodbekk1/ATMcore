import React from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  Activity, 
  CheckCircle, 
  MapPin,
  Clock,
  ChevronRight,
  ChevronDown,
  AlertTriangle,
  Bell
} from 'lucide-react';
import { StatCard } from '../components/StatCard';

export default function ATMPlatform() {
  return (
    <div className="p-8 max-w-7xl mx-auto w-full space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          label="Total Cash Available" 
          value="$0.95M" 
          trend="+5.2%" 
          trendUp={true} 
          icon={<DollarSign className="h-5 w-5 text-[#071a14]" />} 
          bgClass="bg-[#0a241c] border-[#133c2e]"
          iconBgClass="bg-[#9de1b9]"
        />
        <StatCard 
          label="Avg Cash Level" 
          value="51%" 
          trend="-2.1%" 
          trendUp={false} 
          icon={<TrendingUp className="h-5 w-5 text-[#071a14]" />} 
          bgClass="bg-[#0a241c] border-[#133c2e]"
          iconBgClass="bg-[#9de1b9]"
        />
        <StatCard 
          label="Daily Transactions" 
          value="435" 
          trend="+12.5%" 
          trendUp={true} 
          icon={<Activity className="h-5 w-5 text-[#071a14]" />} 
          bgClass="bg-[#0a241c] border-[#133c2e]"
          iconBgClass="bg-[#9de1b9]"
        />
        <StatCard 
          label="Network Uptime" 
          value="97.1%" 
          trend="+0.3%" 
          trendUp={true} 
          icon={<CheckCircle className="h-5 w-5 text-[#071a14]" />} 
          bgClass="bg-[#0a241c] border-[#133c2e]"
          iconBgClass="bg-[#9de1b9]"
        />
      </div>

      {/* Main Dashboard Area */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* ATM Status */}
        <div className="xl:col-span-2 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-bold text-[#e2f1ea]">ATM Status</h3>
            <button className="flex items-center gap-2 bg-[#0a241c] border border-[#133c2e] px-4 py-2 rounded-full text-sm font-medium hover:bg-[#0e3227] transition-colors text-[#9de1b9]">
              All ATMs <ChevronDown className="h-4 w-4 text-[#9de1b9]" />
            </button>
          </div>
          
          {/* ATM Card */}
          <div className="bg-[#0a241c] border border-[#133c2e] rounded-2xl p-6 shadow-xl hover:border-[#1c5542] transition-all cursor-pointer group">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h4 className="text-xl font-bold text-[#e2f1ea] mb-2 group-hover:text-[#9de1b9] transition-colors">Downtown Financial District</h4>
                <div className="flex items-center text-[#78a390] text-sm">
                  <MapPin className="h-4 w-4 mr-1.5" />
                  Main Street Branch
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="bg-[#12382c] text-[#9de1b9] border border-[#1c5542] px-3 py-1 rounded-full text-xs font-bold tracking-wide">
                  OPTIMAL
                </span>
                <ChevronRight className="h-5 w-5 text-[#5d8573] group-hover:text-[#9de1b9]" />
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between items-end">
                <span className="text-sm font-medium text-[#78a390]">Cash Level</span>
                <span className="text-3xl font-bold text-[#e2f1ea]">85%</span>
              </div>
              <div className="h-3 w-full bg-[#061814] rounded-full overflow-hidden border border-[#133c2e]">
                <div className="h-full bg-[#9de1b9] rounded-full" style={{ width: '85%' }}></div>
              </div>
              <div className="flex justify-between text-xs text-[#5d8573] font-medium tracking-wide">
                <span>$212 500</span>
                <span>Cap: $250 000</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-5 border-t border-[#133c2e]/60">
              <div className="flex items-center gap-2">
                <div className="bg-[#061814] p-2 rounded-lg border border-[#133c2e]">
                  <Clock className="h-4 w-4 text-[#78a390]" />
                </div>
                <div>
                  <p className="text-xs text-[#5d8573] mb-0.5">Empty in</p>
                  <p className="text-sm font-semibold text-[#e2f1ea]">7d</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="bg-[#061814] p-2 rounded-lg border border-[#133c2e]">
                  <Activity className="h-4 w-4 text-[#78a390]" />
                </div>
                <div>
                  <p className="text-xs text-[#5d8573] mb-0.5">Today</p>
                  <p className="text-sm font-semibold text-[#e2f1ea]">48</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="bg-[#061814] p-2 rounded-lg border border-[#133c2e]">
                  <TrendingUp className="h-4 w-4 text-[#78a390]" />
                </div>
                <div>
                  <p className="text-xs text-[#5d8573] mb-0.5">Trend</p>
                  <p className="text-sm font-semibold text-[#e2f1ea]">→</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Alerts */}
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-bold text-[#e2f1ea]">Recent Alerts</h3>
            <div className="bg-[#1f1115] text-[#fb7185] border border-rose-900/30 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5">
              <Bell className="h-3 w-3" /> 4
            </div>
          </div>
          
          <div className="bg-[#0a241c] border border-[#133c2e] rounded-2xl p-4 shadow-xl flex flex-col gap-3 relative overflow-hidden">
             {/* Decorative vertical line */}
             <div className="absolute right-3 top-6 bottom-6 w-1 bg-[#133c2e] rounded-full">
                <div className="h-1/3 bg-[#5d8573] rounded-full"></div>
             </div>

            {/* Alert Item 1 */}
            <div className="bg-[#1a2d1d] border border-[#9de1b9]/30 p-4 rounded-xl flex gap-4 mr-6">
              <div className="mt-0.5">
                <AlertTriangle className="h-5 w-5 text-[#9de1b9]" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                  <h5 className="font-semibold text-[#e2f1ea] text-sm">Grand Central Station</h5>
                  <button className="bg-[#071a14] border border-[#133c2e] text-[#9de1b9] text-xs px-2 py-1 rounded hover:bg-[#133c2e] transition-colors">Ack</button>
                </div>
                <p className="text-xs text-[#9de1b9]/80 mb-2">Cash level at 29% - refill scheduled for tomorrow</p>
                <div className="flex items-center text-[10px] text-[#5d8573] font-medium">
                  <Clock className="h-3 w-3 mr-1" /> 11:00:00
                </div>
              </div>
            </div>

            {/* Alert Item 2 */}
            <div className="bg-[#241e17] border border-amber-900/40 p-4 rounded-xl flex gap-4 mr-6">
              <div className="mt-0.5">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                  <h5 className="font-semibold text-[#e2f1ea] text-sm">Airport Terminal 3</h5>
                  <button className="bg-transparent border border-amber-800 text-amber-200 text-xs px-2 py-1 rounded hover:bg-amber-900/50 transition-colors">Ack</button>
                </div>
                <p className="text-xs text-amber-200/70 mb-2">Cash level below 50% - refill recommended within 48 hours</p>
                <div className="flex items-center text-[10px] text-[#5d8573] font-medium">
                  <Clock className="h-3 w-3 mr-1" /> 10:35:00
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}