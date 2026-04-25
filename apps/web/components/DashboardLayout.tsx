"use client";

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { BadgeProvider } from './BadgeContext';
import { AuthProvider, useAuth } from './AuthContext';
import AuthPage from './AuthPage';

function LayoutContent({ children }: { children: React.ReactNode }) {
  const { role, isInitialized } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isInitialized && role === 'user' && pathname !== '/live-map') {
      router.push('/live-map');
    }
  }, [role, isInitialized, pathname, router]);
  
  if (!isInitialized) return <div className="min-h-screen bg-[#03110d]"></div>;
  if (!role) return <AuthPage />;

  return (
    <div className="flex h-screen bg-[#061814] text-[#e2f1ea] font-sans overflow-hidden">
      <Sidebar />
      <main className="flex-1 flex flex-col h-screen overflow-y-auto overflow-x-hidden bg-[#03110d]">
        <Header />
        <div className={`flex-1 ${pathname === '/live-map' ? '' : 'pb-4'}`}>
          {children}
        </div>
      </main>
    </div>
  );
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <BadgeProvider>
        <LayoutContent>{children}</LayoutContent>
      </BadgeProvider>
    </AuthProvider>
  );
}
