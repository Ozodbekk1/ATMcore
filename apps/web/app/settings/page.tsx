"use client";

import React, { useState } from 'react';
import { Save, Bell, Shield, Key, Eye, User } from 'lucide-react';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(true);

  return (
    <div className="p-8 max-w-5xl mx-auto min-h-[calc(100vh-80px)] text-[#e2f1ea] bg-[#03110d]">
      <h1 className="text-3xl font-bold mb-8 text-[#9de1b9] tracking-tight">System Settings</h1>
      
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <div className="w-full md:w-64 space-y-2">
          {[
            { id: 'profile', icon: User, label: 'Profile Settings' },
            { id: 'notifications', icon: Bell, label: 'Notifications' },
            { id: 'security', icon: Shield, label: 'Security & Access' },
            { id: 'appearance', icon: Eye, label: 'Appearance' },
            { id: 'api', icon: Key, label: 'API Keys' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === tab.id ? 'bg-[#0a241c] border border-[#133c2e] text-[#9de1b9]' : 'text-[#78a390] hover:bg-[#061814] hover:text-[#e2f1ea]'}`}
            >
              <tab.icon className="w-5 h-5" />
              <span className="font-medium text-sm">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 bg-[#0a241c] border border-[#133c2e] rounded-2xl p-6 md:p-8 shadow-2xl">
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold border-b border-[#133c2e] pb-4 mb-6">Profile Settings</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm text-[#78a390]">Full Name</label>
                  <input type="text" defaultValue="Admin User" className="w-full bg-[#03110d] border border-[#133c2e] rounded-xl px-4 py-3 focus:outline-none focus:border-[#9de1b9] text-[#e2f1ea] transition-colors" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-[#78a390]">Email Address</label>
                  <input type="email" defaultValue="admin@atmcore.uz" className="w-full bg-[#03110d] border border-[#133c2e] rounded-xl px-4 py-3 focus:outline-none focus:border-[#9de1b9] text-[#e2f1ea] transition-colors" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-[#78a390]">Department</label>
                  <input type="text" defaultValue="Operations" disabled className="w-full bg-[#03110d]/50 border border-[#133c2e] rounded-xl px-4 py-3 text-[#78a390] cursor-not-allowed" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-[#78a390]">Roles</label>
                  <div className="flex gap-2 pt-2">
                    <span className="bg-[#12382c] border border-[#1c5542] text-[#9de1b9] px-3 py-1 rounded-full text-xs font-mono">SuperAdmin</span>
                    <span className="bg-[#1f1115] border border-[#fb7185]/30 text-[#fb7185] px-3 py-1 rounded-full text-xs font-mono">Root</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold border-b border-[#133c2e] pb-4 mb-6">Notification Preferences</h2>
              
              <div className="space-y-4">
                <label className="flex items-center justify-between p-4 bg-[#03110d] border border-[#133c2e] rounded-xl cursor-pointer hover:bg-[#061814] transition-colors">
                  <div>
                    <h3 className="font-semibold text-sm">Critical Alerts</h3>
                    <p className="text-xs text-[#78a390] mt-1">Receive immediate push notifications for critical ATM states (cash below 5%)</p>
                  </div>
                  <div className={`w-12 h-6 rounded-full p-1 transition-colors ${notifications ? 'bg-[#9de1b9]' : 'bg-[#133c2e]'}`} onClick={() => setNotifications(!notifications)}>
                    <div className={`w-4 h-4 bg-[#03110d] rounded-full transition-transform ${notifications ? 'translate-x-6' : 'translate-x-0'}`} />
                  </div>
                </label>

                <label className="flex items-center justify-between p-4 bg-[#03110d] border border-[#133c2e] rounded-xl cursor-pointer hover:bg-[#061814] transition-colors">
                  <div>
                    <h3 className="font-semibold text-sm">Daily Reports</h3>
                    <p className="text-xs text-[#78a390] mt-1">Receive email summary of system performance at 00:00</p>
                  </div>
                  <div className="w-12 h-6 rounded-full p-1 transition-colors bg-[#133c2e]">
                    <div className="w-4 h-4 bg-[#03110d] rounded-full transition-transform translate-x-0" />
                  </div>
                </label>
              </div>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold border-b border-[#133c2e] pb-4 mb-6">Appearance</h2>
              
              <div className="space-y-4">
                <label className="flex items-center justify-between p-4 bg-[#03110d] border border-[#133c2e] rounded-xl cursor-pointer hover:bg-[#061814] transition-colors">
                  <div>
                    <h3 className="font-semibold text-sm">Dark Mode</h3>
                    <p className="text-xs text-[#78a390] mt-1">Toggle the system color scheme</p>
                  </div>
                  <div className={`w-12 h-6 rounded-full p-1 transition-colors ${darkMode ? 'bg-[#9de1b9]' : 'bg-[#133c2e]'}`} onClick={() => setDarkMode(!darkMode)}>
                    <div className={`w-4 h-4 bg-[#03110d] rounded-full transition-transform ${darkMode ? 'translate-x-6' : 'translate-x-0'}`} />
                  </div>
                </label>
              </div>
            </div>
          )}

          {(activeTab === 'security' || activeTab === 'api') && (
            <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-[#133c2e] rounded-xl bg-[#03110d]/50">
              <Shield className="w-12 h-12 text-[#5d8573] mb-4" />
              <h3 className="text-lg font-bold text-[#e2f1ea] mb-2">Restricted Area</h3>
              <p className="text-sm text-[#78a390] max-w-sm">You need elevated permissions to access these configurations. Contact System Administrator.</p>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-[#133c2e] flex justify-end">
            <button className="bg-[#12382c] hover:bg-[#1a4a3a] text-[#9de1b9] border border-[#1c5542] px-6 py-2.5 rounded-xl font-bold text-sm tracking-wide flex items-center gap-2 transition-colors shadow-[0_0_15px_rgba(18,56,44,0.4)]">
              <Save className="w-4 h-4" /> Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
