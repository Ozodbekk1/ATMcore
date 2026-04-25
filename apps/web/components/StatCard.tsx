import React from 'react';

export function StatCard({ label, value, trend, trendUp, icon, bgClass, iconBgClass }: {
  label: string;
  value: string | number;
  trend: string;
  trendUp: boolean;
  icon: React.ReactElement;
  bgClass: string;
  iconBgClass: string;
}) {
  return (
    <div className={`p-6 rounded-2xl border backdrop-blur-sm ${bgClass} shadow-xl hover:shadow-2xl transition-all`}>
      <div className="flex justify-between items-start mb-4">
        <div className={`${iconBgClass} p-3 rounded-2xl shadow-lg`}>
          {React.cloneElement(icon as React.ReactElement<{ className: string }>, { className: "h-6 w-6 text-[#071a14]" })}
        </div>
        <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${
          trendUp ? 'text-emerald-400 bg-emerald-400/10' : 'text-rose-400 bg-rose-400/10'
        }`}>
          {trendUp ? '↑' : '↓'} {trend}
        </div>
      </div>
      <div>
        <h3 className="text-3xl font-bold text-[#e2f1ea] mb-2 tracking-tight">{value}</h3>
        <p className="text-sm font-medium text-[#78a390]">{label}</p>
      </div>
    </div>
  );
}
