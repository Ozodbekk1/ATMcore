"use client";
import React, { createContext, useContext, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

interface Badges {
  ai: number;
  routes: number;
  alerts: number;
}

interface BadgeContextType {
  badges: Badges;
  mounted: boolean;
}

export const defaultBadges: Badges = { ai: 3, routes: 2, alerts: 5 };

const BadgeContext = createContext<BadgeContextType>({ badges: defaultBadges, mounted: false });

export function BadgeProvider({ children }: { children: React.ReactNode }) {
  const [badges, setBadges] = useState<Badges>(defaultBadges);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    const saved = localStorage.getItem('atm_badges');
    if (saved) {
      try {
        setBadges(JSON.parse(saved));
      } catch { /* ignore */ }
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    let updated = false;
    const newBadges = { ...badges };

    if (pathname === '/ai-predictions' && newBadges.ai > 0) {
      newBadges.ai = 0;
      updated = true;
    }
    if (pathname === '/routes' && newBadges.routes > 0) {
      newBadges.routes = 0;
      updated = true;
    }
    if (pathname === '/alerts' && newBadges.alerts > 0) {
      newBadges.alerts = 0;
      updated = true;
    }

    if (updated) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setBadges(newBadges);
      localStorage.setItem('atm_badges', JSON.stringify(newBadges));
    }
  }, [pathname, mounted, badges]);

  return (
    <BadgeContext.Provider value={{ badges, mounted }}>
      {children}
    </BadgeContext.Provider>
  );
}

export function useBadges() {
  return useContext(BadgeContext);
}
