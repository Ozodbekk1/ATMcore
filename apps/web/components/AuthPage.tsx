"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "./AuthContext";
import { ShieldCheck, Lock, Mail, User, ShieldAlert, Loader2 } from "lucide-react";

type AuthMode = "login" | "register";

interface LoginFormData {
  email: string;
  password: string;
}

interface RegisterFormData {
  fullName: string;
  email: string;
  password: string;
}

export default function AuthPage() {
  const [mode, setMode] = useState<AuthMode>("login");
  const { login, register: registerUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LoginFormData & RegisterFormData>();

  const onSubmit = async (data: LoginFormData & RegisterFormData) => {
    setApiError(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    try {
      if (mode === "login") {
        await login({ email: data.email, password: data.password });
        // On success, AuthContext will update and DashboardLayout will redirect
      } else {
        const message = await registerUser({
          name: data.fullName,
          email: data.email,
          password: data.password,
        });
        setSuccessMessage(message || "Registration successful! Please check your email to verify your account.");
        reset();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An unexpected error occurred";
      setApiError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#03110d] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative dark cyber grids */}
      <div
        className="absolute inset-0 z-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(#133c2e 1px, transparent 1px), linear-gradient(90deg, #133c2e 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      ></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#9de1b9]/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md bg-[#071a14]/90 backdrop-blur-xl border border-[#133c2e] rounded-3xl shadow-[0_0_50px_rgba(3,17,13,0.8)] p-8 relative z-10 transition-all">
        <div className="flex justify-center mb-8 relative">
          {/* Premium Ambient Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-[#9de1b9] blur-[40px] opacity-20 pointer-events-none"></div>

          {/* Glassmorphism Icon Wrapper */}
          <div className="bg-gradient-to-br from-[#0a241c] to-[#03110d] p-4 rounded-2xl border border-[#1c5542]/70 shadow-[0_15px_35px_rgba(0,0,0,0.5),_inset_0_1px_1px_rgba(157,225,185,0.1)] relative z-10 transform transition-transform duration-500 hover:scale-[1.03]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.png"
              alt="ATM Core Logo"
              className="w-16 h-16 object-contain filter brightness-[1.05] contrast-[1.05]"
            />
          </div>
        </div>

        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-[#e2f1ea] tracking-tight">
            {mode === "login" ? "System Authentication" : "Initial Registration"}
          </h2>
          <p className="text-sm text-[#78a390] mt-1 space-x-1">
            <span>Secure connection to</span>
            <span className="font-mono text-[#9de1b9]">ATM CORE</span>
          </p>
        </div>

        {/* Error Message */}
        {apiError && (
          <div className="mb-4 p-3 bg-[#1f1115] border border-rose-900/40 rounded-xl text-[#fb7185] text-sm flex items-start gap-2">
            <ShieldAlert className="h-4 w-4 mt-0.5 shrink-0" />
            <span>{apiError}</span>
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div className="mb-4 p-3 bg-[#0a241c] border border-[#1c5542] rounded-xl text-[#9de1b9] text-sm flex items-start gap-2">
            <ShieldCheck className="h-4 w-4 mt-0.5 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {mode === "register" && (
            <div>
              <label className="block text-xs font-bold text-[#5d8573] uppercase tracking-wider mb-1.5 ml-1">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-4 w-4 text-[#5d8573]" />
                </div>
                <input
                  {...register("fullName", { required: mode === "register" })}
                  type="text"
                  placeholder="Enter full name"
                  className="w-full bg-[#04120e] border border-[#133c2e] rounded-xl pl-10 pr-4 py-3 text-[#e2f1ea] focus:outline-none focus:border-[#9de1b9] focus:ring-1 focus:ring-[#9de1b9] transition-all placeholder-[#1f4a38]"
                />
              </div>
              {errors.fullName && (
                <span className="text-[#fb7185] text-xs ml-1 mt-1 block">Name is required</span>
              )}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-[#5d8573] uppercase tracking-wider mb-1.5 ml-1">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-4 w-4 text-[#5d8573]" />
              </div>
              <input
                {...register("email", { required: true, pattern: /^\S+@\S+$/i })}
                type="email"
                placeholder="you@example.com"
                className="w-full bg-[#04120e] border border-[#133c2e] rounded-xl pl-10 pr-4 py-3 text-[#e2f1ea] focus:outline-none focus:border-[#9de1b9] focus:ring-1 focus:ring-[#9de1b9] transition-all placeholder-[#1f4a38]"
              />
            </div>
            {errors.email && (
              <span className="text-[#fb7185] text-xs ml-1 mt-1 block">Valid email is required</span>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-[#5d8573] uppercase tracking-wider mb-1.5 ml-1">
              Secure Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-4 w-4 text-[#5d8573]" />
              </div>
              <input
                {...register("password", { required: true, minLength: 6 })}
                type="password"
                placeholder="••••••••"
                className="w-full bg-[#04120e] border border-[#133c2e] rounded-xl pl-10 pr-4 py-3 text-[#e2f1ea] focus:outline-none focus:border-[#9de1b9] focus:ring-1 focus:ring-[#9de1b9] transition-all placeholder-[#1f4a38]"
              />
            </div>
            {errors.password && (
              <span className="text-[#fb7185] text-xs ml-1 mt-1 block">
                Minimum 6 characters required
              </span>
            )}
          </div>

          {/* Role selection removed: All new registrations force 'user' role automatically */}

          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#9de1b9] text-[#071a14] font-bold py-3 px-4 rounded-xl shadow-[0_0_15px_#9de1b9] hover:bg-[#b0ebd1] hover:shadow-[0_0_25px_#9de1b9] transition-all transform active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isSubmitting
                ? "Processing..."
                : mode === "login"
                  ? "Authenticate"
                  : "Initialize Account"}
            </button>
          </div>
        </form>

        <div className="mt-6 text-center border-t border-[#133c2e] pt-6">
          <p className="text-sm text-[#78a390]">
            {mode === "login" ? "Don\u0027t have an access code? " : "Already initialized? "}
            <button
              onClick={() => {
                setMode(mode === "login" ? "register" : "login");
                setApiError(null);
                setSuccessMessage(null);
              }}
              className="text-[#9de1b9] font-semibold hover:underline"
            >
              {mode === "login" ? "Register Now" : "Login Here"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
