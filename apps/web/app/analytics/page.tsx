import React from 'react';
import { BarChart2 } from 'lucide-react';

export default function AnalyticsPage() {
  return (
    <div className="p-8 max-w-7xl mx-auto w-full space-y-8 flex-1 flex flex-col h-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h2 className="text-3xl font-bold text-[#e2f1ea] mb-2 tracking-tight">Analytics</h2>
          <p className="text-[#78a390]">Historical performance data and network insights</p>
        </div>
        <select className="bg-[#0a241c] border border-[#133c2e] text-[#e2f1ea] text-sm rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#9de1b9]">
          <option>Last 7 Days</option>
          <option>Last 30 Days</option>
          <option>This Year</option>
        </select>
      </div>
      
      <div className="flex-1 bg-[#0a241c] border border-[#133c2e] rounded-2xl flex flex-col items-center justify-center p-8 shadow-xl min-h-[400px]">
        <BarChart2 className="h-16 w-16 text-[#5d8573] mb-4" />
        <h3 className="text-xl font-medium text-[#78a390]">Detailed Analytics Ready</h3>
        <p className="text-sm text-[#5d8573] mt-2 max-w-md text-center">Chart components will be rendered here. You can integrate Recharts or Chart.js for beautiful data visualization.</p>
      </div>
    </div>
  );
}
