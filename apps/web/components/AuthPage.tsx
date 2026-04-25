"use client";

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth, Role } from './AuthContext';
import { ShieldCheck, Lock, Mail, User, ShieldAlert } from 'lucide-react';

type AuthMode = 'login' | 'register';

export default function AuthPage() {
  const [mode, setMode] = useState<AuthMode>('login');
  const { login } = useAuth();
  
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = (data: Record<string, string>) => {
    // In a real application, you would send this to the backend API here.
    // Since this is frontend-only, we mock the role-based auth.
    let selectedRole: Role = 'user';
    if (mode === 'register' && data.role) {
       selectedRole = data.role as Role;
    } else {
       // Simple mock logic for Login to assign role based on email input
       if (data.email.includes('super')) selectedRole = 'superadmin';
       else if (data.email.includes('admin')) selectedRole = 'admin';
       else selectedRole = 'user';
    }
    
    // Simulate API delay
    setTimeout(() => {
      login(selectedRole);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#03110d] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative dark cyber grids */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'linear-gradient(#133c2e 1px, transparent 1px), linear-gradient(90deg, #133c2e 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#9de1b9]/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md bg-[#071a14]/90 backdrop-blur-xl border border-[#133c2e] rounded-3xl shadow-[0_0_50px_rgba(3,17,13,0.8)] p-8 relative z-10 transition-all">
        <div className="flex justify-center mb-6">
          <div className="bg-[#0a241c] p-4 rounded-2xl border border-[#1c5542] shadow-[0_0_20px_#133c2e]">
            {mode === 'login' ? <Lock className="w-8 h-8 text-[#9de1b9]" /> : <ShieldCheck className="w-8 h-8 text-[#9de1b9]" />}
          </div>
        </div>

        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-[#e2f1ea] tracking-tight">{mode === 'login' ? 'System Authentication' : 'Initial Registration'}</h2>
          <p className="text-sm text-[#78a390] mt-1 space-x-1">
            <span>Secure connection to</span>
            <span className="font-mono text-[#9de1b9]">ATM CORE</span>
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-bold text-[#5d8573] uppercase tracking-wider mb-1.5 ml-1">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-4 w-4 text-[#5d8573]" />
                </div>
                <input
                  {...register('fullName', { required: mode === 'register' })}
                  type="text"
                  placeholder="Enter full name"
                  className="w-full bg-[#04120e] border border-[#133c2e] rounded-xl pl-10 pr-4 py-3 text-[#e2f1ea] focus:outline-none focus:border-[#9de1b9] focus:ring-1 focus:ring-[#9de1b9] transition-all placeholder-[#1f4a38]"
                />
              </div>
              {errors.fullName && <span className="text-[#fb7185] text-xs ml-1 mt-1 block">Name is required</span>}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-[#5d8573] uppercase tracking-wider mb-1.5 ml-1">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-4 w-4 text-[#5d8573]" />
              </div>
              <input
                {...register('email', { required: true, pattern: /^\S+@\S+$/i })}
                type="email"
                placeholder={mode === 'login' ? "admin@atm.uz or super@atm.uz" : "you@example.com"}
                className="w-full bg-[#04120e] border border-[#133c2e] rounded-xl pl-10 pr-4 py-3 text-[#e2f1ea] focus:outline-none focus:border-[#9de1b9] focus:ring-1 focus:ring-[#9de1b9] transition-all placeholder-[#1f4a38]"
              />
            </div>
            {errors.email && <span className="text-[#fb7185] text-xs ml-1 mt-1 block">Valid email is required</span>}
            {mode === 'login' && <p className="text-[10px] text-[#5d8573] mt-1 ml-1 font-mono">Tip: Use &apos;admin@&apos; for Admin, &apos;super@&apos; for Superadmin</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-[#5d8573] uppercase tracking-wider mb-1.5 ml-1">Secure Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <ShieldAlert className="h-4 w-4 text-[#5d8573]" />
              </div>
              <input
                {...register('password', { required: true, minLength: 6 })}
                type="password"
                placeholder="••••••••"
                className="w-full bg-[#04120e] border border-[#133c2e] rounded-xl pl-10 pr-4 py-3 text-[#e2f1ea] focus:outline-none focus:border-[#9de1b9] focus:ring-1 focus:ring-[#9de1b9] transition-all placeholder-[#1f4a38]"
              />
            </div>
            {errors.password && <span className="text-[#fb7185] text-xs ml-1 mt-1 block">Minimum 6 characters required</span>}
          </div>

          {mode === 'register' && (
            <div>
              <label className="block text-xs font-bold text-[#5d8573] uppercase tracking-wider mb-1.5 ml-1">Requested Role</label>
              <select
                {...register('role', { required: mode === 'register' })}
                className="w-full bg-[#04120e] border border-[#133c2e] rounded-xl px-4 py-3 text-[#e2f1ea] focus:outline-none focus:border-[#9de1b9] focus:ring-1 focus:ring-[#9de1b9] transition-all appearance-none"
              >
                <option value="user">User (Map View Only)</option>
                <option value="admin">System Admin</option>
                <option value="superadmin">Super Administrator</option>
              </select>
            </div>
          )}

          <div className="pt-4">
            <button
              type="submit"
              className="w-full bg-[#9de1b9] text-[#071a14] font-bold py-3 px-4 rounded-xl shadow-[0_0_15px_#9de1b9] hover:bg-[#b0ebd1] hover:shadow-[0_0_25px_#9de1b9] transition-all transform active:scale-[0.98]"
            >
              {mode === 'login' ? 'Authenticate' : 'Initialize Account'}
            </button>
          </div>
        </form>

        <div className="mt-6 text-center border-t border-[#133c2e] pt-6">
          <p className="text-sm text-[#78a390]">
            {mode === 'login' ? "Don't have an access code? " : "Already initialized? "}
            <button
              onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
              className="text-[#9de1b9] font-semibold hover:underline"
            >
              {mode === 'login' ? 'Register Now' : 'Login Here'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
