"use client";

import React, { useState } from 'react';
import { Save, Bell, Shield, Key, Eye, User, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../components/AuthContext';
import { updateProfile, changePassword } from '../../lib/api';

export default function SettingsPage() {
  const { user, role, refetchMe } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(true);

  // Profile form
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profileEmail, setProfileEmail] = useState(user?.email || '');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Password form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const handleSaveProfile = async () => {
    setProfileSaving(true);
    setProfileError(null);
    setProfileSuccess(null);
    try {
      await updateProfile({ name: profileName, email: profileEmail });
      setProfileSuccess('Profile updated successfully');
      await refetchMe();
    } catch (err: any) {
      setProfileError(err.message || 'Failed to update profile');
    } finally {
      setProfileSaving(false);
    }
  };

  const handleChangePassword = async () => {
    setPasswordSaving(true);
    setPasswordError(null);
    setPasswordSuccess(null);
    try {
      await changePassword({ currentPassword, newPassword });
      setPasswordSuccess('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err: any) {
      setPasswordError(err.message || 'Failed to change password');
    } finally {
      setPasswordSaving(false);
    }
  };

  const roleName = role === 'SUPERADMIN' ? 'System Root' : role === 'ADMIN' ? 'Administrator' : 'User';

  return (
    <div className="p-4 sm:p-8 pb-8 sm:pb-12 max-w-5xl mx-auto min-h-[calc(100vh-80px)] text-[#e2f1ea] bg-[#03110d]">
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
              
              {profileSuccess && (
                <div className="p-3 bg-[#12382c] border border-[#1c5542] rounded-xl text-[#9de1b9] text-sm flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" /> {profileSuccess}
                </div>
              )}
              {profileError && (
                <div className="p-3 bg-[#1f1115] border border-rose-900/30 rounded-xl text-[#fb7185] text-sm flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" /> {profileError}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm text-[#78a390]">Full Name</label>
                  <input 
                    type="text" 
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="w-full bg-[#03110d] border border-[#133c2e] rounded-xl px-4 py-3 focus:outline-none focus:border-[#9de1b9] text-[#e2f1ea] transition-colors" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-[#78a390]">Email Address</label>
                  <input 
                    type="email" 
                    value={profileEmail}
                    onChange={(e) => setProfileEmail(e.target.value)}
                    className="w-full bg-[#03110d] border border-[#133c2e] rounded-xl px-4 py-3 focus:outline-none focus:border-[#9de1b9] text-[#e2f1ea] transition-colors" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-[#78a390]">Department</label>
                  <input type="text" defaultValue="Operations" disabled className="w-full bg-[#03110d]/50 border border-[#133c2e] rounded-xl px-4 py-3 text-[#78a390] cursor-not-allowed" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-[#78a390]">Roles</label>
                  <div className="flex gap-2 pt-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-mono border ${
                      role === 'SUPERADMIN' ? 'bg-[#9de1b9]/10 text-[#9de1b9] border-[#1c5542]' :
                      role === 'ADMIN' ? 'bg-[#12382c] text-[#9de1b9] border-[#1c5542]' :
                      'bg-[#12382c] text-[#78a390] border-[#133c2e]'
                    }`}>{roleName}</span>
                    <span className="bg-[#0a241c] border border-[#133c2e] text-[#78a390] px-3 py-1 rounded-full text-xs font-mono">{role}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-[#133c2e] flex justify-end">
                <button 
                  onClick={handleSaveProfile}
                  disabled={profileSaving}
                  className="bg-[#12382c] hover:bg-[#1a4a3a] text-[#9de1b9] border border-[#1c5542] px-6 py-2.5 rounded-xl font-bold text-sm tracking-wide flex items-center gap-2 transition-colors shadow-[0_0_15px_rgba(18,56,44,0.4)] disabled:opacity-50"
                >
                  {profileSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {profileSaving ? 'Saving...' : 'Save Profile'}
                </button>
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

          {activeTab === 'security' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold border-b border-[#133c2e] pb-4 mb-6">Change Password</h2>
              
              {passwordSuccess && (
                <div className="p-3 bg-[#12382c] border border-[#1c5542] rounded-xl text-[#9de1b9] text-sm flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" /> {passwordSuccess}
                </div>
              )}
              {passwordError && (
                <div className="p-3 bg-[#1f1115] border border-rose-900/30 rounded-xl text-[#fb7185] text-sm flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" /> {passwordError}
                </div>
              )}

              <div className="space-y-4 max-w-md">
                <div className="space-y-2">
                  <label className="text-sm text-[#78a390]">Current Password</label>
                  <input 
                    type="password" 
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#03110d] border border-[#133c2e] rounded-xl px-4 py-3 focus:outline-none focus:border-[#9de1b9] text-[#e2f1ea] transition-colors placeholder-[#1f4a38]" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-[#78a390]">New Password</label>
                  <input 
                    type="password" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#03110d] border border-[#133c2e] rounded-xl px-4 py-3 focus:outline-none focus:border-[#9de1b9] text-[#e2f1ea] transition-colors placeholder-[#1f4a38]" 
                  />
                </div>
                <button 
                  onClick={handleChangePassword}
                  disabled={passwordSaving || !currentPassword || !newPassword}
                  className="bg-[#12382c] hover:bg-[#1a4a3a] text-[#9de1b9] border border-[#1c5542] px-6 py-2.5 rounded-xl font-bold text-sm tracking-wide flex items-center gap-2 transition-colors disabled:opacity-50"
                >
                  {passwordSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />}
                  {passwordSaving ? 'Changing...' : 'Change Password'}
                </button>
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

          {activeTab === 'api' && (
            <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-[#133c2e] rounded-xl bg-[#03110d]/50">
              <Shield className="w-12 h-12 text-[#5d8573] mb-4" />
              <h3 className="text-lg font-bold text-[#e2f1ea] mb-2">Restricted Area</h3>
              <p className="text-sm text-[#78a390] max-w-sm">API key management requires elevated permissions. Contact System Administrator.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
