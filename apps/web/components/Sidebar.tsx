"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Zap,
  LayoutGrid,
  Map,
  BrainCircuit,
  Route,
  BarChart2,
  Bell,
  Shield,
} from "lucide-react";
import { useBadges, defaultBadges } from "./BadgeContext";
import { useAuth } from "./AuthContext";

export function Sidebar() {
  const pathname = usePathname();
  const { badges, mounted } = useBadges();
  const { role, user, clearSession } = useAuth();

  const logout = async () => {
    await clearSession();
  };

  const aiBadge = mounted ? (badges.ai > 0 ? badges.ai : undefined) : defaultBadges.ai;
  const routesBadge = mounted ? (badges.routes > 0 ? badges.routes : undefined) : defaultBadges.routes;
  const alertsBadge = mounted ? (badges.alerts > 0 ? badges.alerts : undefined) : defaultBadges.alerts;

  const displayName = user?.name || (role === "SUPERADMIN" ? "System Root" : role === "ADMIN" ? "Admin" : "User");
  const initials = role === "SUPERADMIN" ? "SA" : role === "ADMIN" ? "AM" : "US";

  return (
    <aside className="w-[260px] bg-[#071a14] border-r border-[#133c2e] flex flex-col justify-between hidden md:flex">
      <div>
        {/* Logo */}
        <div className="flex items-center px-6 py-8">
          <div className="bg-[#9de1b9] p-2 rounded-xl mr-3 shadow-[0_0_15px_rgba(157,225,185,0.3)]">
            <Zap className="h-5 w-5 text-[#071a14]" fill="currentColor" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-widest text-[#e2f1ea] uppercase">ATM CORE</h1>
          </div>
        </div>

        {/* Navigation */}
        <nav className="px-4 space-y-1.5">
          {(role === "ADMIN" || role === "SUPERADMIN") && (
            <NavItem href="/" currentPath={pathname} icon={<LayoutGrid size={18} />} label="Overview" />
          )}
          <NavItem href="/live-map" currentPath={pathname} icon={<Map size={18} />} label="Live Map" />
          {(role === "ADMIN" || role === "SUPERADMIN") && (
            <>
              <NavItem
                href="/ai-predictions"
                currentPath={pathname}
                icon={<BrainCircuit size={18} />}
                label="AI Predictions"
                badge={aiBadge}
              />
              <NavItem href="/routes" currentPath={pathname} icon={<Route size={18} />} label="Routes" badge={routesBadge} />
              <NavItem href="/analytics" currentPath={pathname} icon={<BarChart2 size={18} />} label="Analytics" />
              <NavItem href="/alerts" currentPath={pathname} icon={<Bell size={18} />} label="Alerts" badge={alertsBadge} />
              <NavItem href="/admin" currentPath={pathname} icon={<Shield size={18} />} label="Command Center" />
            </>
          )}
        </nav>
      </div>

      {/* User Profile */}
      <div
        onClick={logout}
        className="p-4 mb-4 mx-4 bg-[#0a241c] rounded-2xl flex items-center gap-3 border border-[#133c2e]/50 cursor-pointer hover:bg-[#133c2e] transition-colors"
        title="Click to logout"
      >
        <div className="bg-[#9de1b9] h-9 w-9 rounded-full flex items-center justify-center text-sm font-bold text-[#071a14] shadow-lg">
          {initials}
        </div>
        <div className="flex-1 overflow-hidden">
          <p className="text-sm font-medium text-[#e2f1ea] truncate">{displayName}</p>
          <p className="text-[10px] text-[#78a390] uppercase tracking-wider font-bold truncate">
            {role || "Unknown"}
          </p>
        </div>
      </div>
    </aside>
  );
}

function NavItem({
  href,
  currentPath,
  icon,
  label,
  badge,
}: {
  href: string;
  currentPath: string;
  icon: React.ReactNode;
  label: string;
  badge?: number;
}) {
  const active = currentPath === href;
  return (
    <Link
      href={href}
      className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group ${active
          ? "bg-[#9de1b9] text-[#071a14] shadow-md"
          : "text-[#78a390] hover:bg-[#0e3227] hover:text-[#e2f1ea]"
        }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`${active ? "text-[#071a14]" : "text-[#5d8573] group-hover:text-[#9de1b9]"} transition-colors`}
        >
          {icon}
        </div>
        <span className="font-semibold text-sm">{label}</span>
      </div>
      {badge && (
        <span
          className={`text-xs font-bold px-2 py-0.5 rounded-full ${active ? "bg-[#071a14] text-[#9de1b9]" : "bg-[#133c2e] text-[#9de1b9]"
            }`}
        >
          {badge}
        </span>
      )}
    </Link>
  );
}
