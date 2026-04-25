"use client";

import React, { useEffect, useRef } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { useRouter, usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { BadgeProvider } from "./BadgeContext";
import { AuthProvider, useAuth } from "./AuthContext";
import AuthPage from "./AuthPage";
import { makeQueryClient } from "../lib/queryClient";

function LayoutContent({ children }: { children: React.ReactNode }) {
  const { role, isInitialized, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isInitialized && isAuthenticated && role === "USER" && pathname !== "/live-map") {
      router.push("/live-map");
    }
  }, [role, isInitialized, isAuthenticated, pathname, router]);

  // Show blank screen while loading session
  if (isLoading || !isInitialized) {
    return <div className="min-h-screen bg-[#03110d]"></div>;
  }

  // Not authenticated → show auth page
  if (!isAuthenticated) {
    return <AuthPage />;
  }

  return (
    <div className="flex h-screen bg-[#061814] text-[#e2f1ea] font-sans overflow-hidden">
      <Sidebar />
      <main className="flex-1 flex flex-col h-screen overflow-y-auto overflow-x-hidden bg-[#03110d]">
        <Header />
        <div className={`flex-1 ${pathname === "/live-map" ? "" : "pb-4"}`}>{children}</div>
      </main>
    </div>
  );
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  // Stable QueryClient — survives re-renders but not SSR
  const queryClientRef = useRef(makeQueryClient());

  return (
    <QueryClientProvider client={queryClientRef.current}>
      <AuthProvider>
        <BadgeProvider>
          <LayoutContent>{children}</LayoutContent>
        </BadgeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
