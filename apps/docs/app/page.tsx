"use client";
import React, { useState } from "react";

/* ═══════ Platform Colors ═══════ */
const C = {
  bg: "#03110d", sidebar: "#071a14", surface: "#0a241c", surface2: "#0d2e24",
  border: "#133c2e", border2: "#1c5542", accent: "#9de1b9", accent2: "#78a390",
  text: "#e2f1ea", text2: "#a3c4b5", text3: "#5d8573",
};

/* ═══════ UI Components ═══════ */
function CopyBtn({ text }: { text: string }) {
  const [ok, setOk] = useState(false);
  return <button onClick={() => { navigator.clipboard.writeText(text); setOk(true); setTimeout(() => setOk(false), 1400); }}
    style={{ fontSize: 11, padding: "3px 10px", borderRadius: 6, background: C.surface2, color: ok ? C.accent : C.text3, border: `1px solid ${C.border}`, cursor: "pointer" }}>
    {ok ? "✓ Copied" : "Copy"}
  </button>;
}

function Code({ code, title }: { code: string; title?: string }) {
  return (
    <div style={{ margin: "16px 0", borderRadius: 10, overflow: "hidden", border: `1px solid ${C.border}` }}>
      {title && <div style={{ padding: "8px 16px", background: C.surface, borderBottom: `1px solid ${C.border}`, fontSize: 13, color: C.text3 }}>{title}</div>}
      <div style={{ position: "relative", background: "#020c08" }}>
        <div style={{ position: "absolute", top: 8, right: 8 }}><CopyBtn text={code} /></div>
        <pre style={{ padding: 16, overflowX: "auto", fontSize: 13, lineHeight: 1.8, color: C.accent2, margin: 0 }}><code>{code}</code></pre>
      </div>
    </div>
  );
}

function EP({ method, path, desc, body, resp }: { method: string; path: string; desc: string; body?: string; resp?: string }) {
  const [open, setOpen] = useState(false);
  const mc: Record<string, { bg: string; color: string }> = {
    GET: { bg: "#0d3320", color: "#4ade80" }, POST: { bg: "#0c2d4a", color: "#60a5fa" },
    PATCH: { bg: "#3d2800", color: "#fbbf24" }, DELETE: { bg: "#3d0c0c", color: "#f87171" },
  };
  const s = mc[method] || mc.GET;
  return (
    <div style={{ border: `1px solid ${C.border}`, borderRadius: 10, margin: "10px 0", overflow: "hidden", background: open ? C.surface : "transparent" }}>
      <button onClick={() => setOpen(!open)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", background: "transparent", border: "none", cursor: "pointer", textAlign: "left" }}>
        <span style={{ background: s.bg, color: s.color, padding: "2px 10px", borderRadius: 6, fontSize: 11, fontWeight: 700, fontFamily: "monospace", letterSpacing: 1 }}>{method}</span>
        <code style={{ flex: 1, fontSize: 14, color: C.accent, wordBreak: "break-all" }}>{path}</code>
        <span style={{ color: C.text3, transform: open ? "rotate(180deg)" : "none", transition: "transform 0.15s" }}>▾</span>
      </button>
      {open && (
        <div style={{ padding: "12px 16px 16px", borderTop: `1px solid ${C.border}` }}>
          <p style={{ fontSize: 15, color: C.text2, lineHeight: 1.8 }}>{desc}</p>
          {body && <><p style={{ fontSize: 10, color: C.text3, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, marginTop: 16 }}>Request Body</p><Code code={body} /></>}
          {resp && <><p style={{ fontSize: 10, color: C.text3, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, marginTop: 16 }}>Response</p><Code code={resp} /></>}
        </div>
      )}
    </div>
  );
}

function H1({ children }: { children: React.ReactNode }) {
  return <h1 style={{ fontSize: 32, fontWeight: 800, color: C.text, marginBottom: 12, letterSpacing: -0.5 }}>{children}</h1>;
}
function H2({ children }: { children: React.ReactNode }) {
  return <h2 style={{ fontSize: 22, fontWeight: 700, color: C.text, marginTop: 32, marginBottom: 8 }}>{children}</h2>;
}
function H3({ children }: { children: React.ReactNode }) {
  return <h3 style={{ fontSize: 17, fontWeight: 600, color: C.accent, marginTop: 24, marginBottom: 8 }}>{children}</h3>;
}
function P({ children }: { children: React.ReactNode }) {
  return <p style={{ fontSize: 15, color: C.text2, lineHeight: 1.85, marginBottom: 16 }}>{children}</p>;
}
function B({ children }: { children: React.ReactNode }) {
  return <strong style={{ color: C.text, fontWeight: 600 }}>{children}</strong>;
}
function Cd({ children }: { children: React.ReactNode }) {
  return <code style={{ fontSize: 13, background: C.surface, color: C.accent, padding: "2px 7px", borderRadius: 5, border: `1px solid ${C.border}` }}>{children}</code>;
}
function Tbl({ h, r }: { h: string[]; r: string[][] }) {
  return <div style={{ overflowX: "auto", margin: "16px 0", borderRadius: 10, border: `1px solid ${C.border}` }}>
    <table style={{ width: "100%", textAlign: "left", fontSize: 14, borderCollapse: "collapse" }}>
      <thead><tr style={{ background: C.surface }}>{h.map((v, i) => <th key={i} style={{ padding: "10px 16px", fontSize: 12, color: C.text3, fontWeight: 600, borderBottom: `1px solid ${C.border}` }}>{v}</th>)}</tr></thead>
      <tbody>{r.map((row, i) => <tr key={i} style={{ borderBottom: `1px solid ${C.border}` }}>{row.map((v, j) => <td key={j} style={{ padding: "10px 16px", color: j === 0 ? C.accent : C.text2, fontFamily: j === 0 ? "monospace" : "inherit", fontSize: j === 0 ? 13 : 14 }}>{v}</td>)}</tr>)}</tbody>
    </table>
  </div>;
}
function Info({ children }: { children: React.ReactNode }) {
  return <div style={{ background: C.surface, border: `1px solid ${C.border2}`, borderRadius: 8, padding: "12px 16px", margin: "16px 0", fontSize: 14, color: C.accent }}><strong>💡 Eslatma: </strong><span style={{ color: C.text2 }}>{children}</span></div>;
}

/* ═══════ NAV SECTIONS ═══════ */
const NAV = [
  { g: "Boshlash", items: [
    { id: "overview", l: "Platform haqida", e: "📋" },
    { id: "arch", l: "Arxitektura", e: "🏗️" },
    { id: "tech", l: "Texnologiyalar", e: "⚙️" },
    { id: "env", l: "Konfiguratsiya", e: "🔧" },
  ]},
  { g: "API Reference", items: [
    { id: "auth", l: "Authentication", e: "🔐" },
    { id: "atm", l: "ATM Management", e: "🏧" },
    { id: "alerts", l: "Alerts", e: "🔔" },
    { id: "analytics", l: "Analytics", e: "📊" },
    { id: "ai", l: "AI / Gemini", e: "🧠" },
    { id: "optimize", l: "Route Optimization", e: "🗺️" },
    { id: "logs", l: "System Logs", e: "📟" },
    { id: "admin", l: "Admin Panel", e: "🛡️" },
  ]},
  { g: "Architecture", items: [
    { id: "models", l: "Database Models", e: "🗄️" },
    { id: "services", l: "Backend Services", e: "⚡" },
    { id: "ws", l: "WebSocket", e: "📡" },
  ]},
  { g: "Reference", items: [
    { id: "pages", l: "Frontend Pages", e: "🌐" },
    { id: "roles", l: "Roles & Permissions", e: "👥" },
  ]},
];

/* ═══════ SECTION CONTENT ═══════ */
function SectionContent({ id }: { id: string }) {
  switch (id) {
    case "overview": return <>
      <H1>Platform haqida</H1>
      <P><B>ATM CORE</B> — O'zbekiston Markaziy banki va moliya muassasalari uchun mo'ljallangan ATM tarmoq monitoring platformasi. Platforma har bir bankomat qurilmasining holatini, naqd pul zahirasini va tranzaksiya tarixini real-vaqtda kuzatib boradi.</P>
      <P>Sun'iy intellekt yordamida qaysi bankomatda qachon pul tugashini bashorat qiladi va inkassator marshrutlarini avtomatik optimizatsiya qiladi.</P>
      <P>Platformada jami <B>25 ta API endpoint</B>, <B>6 ta database model</B>, <B>5 ta backend xizmat</B> va <B>3 ta foydalanuvchi roli</B> mavjud. AI xizmatlari Google Gemini 2.5 Flash modeli orqali ishlaydi.</P>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, margin: "24px 0" }}>
        {[["🗺️ Jonli Xarita","Leaflet.js interaktiv xarita. Geolokatsiya bilan yaqin ATMlarni topish."],
          ["🧠 AI Prognoz","Gemini 2.5 Flash — 7 kunlik naqd pul prognozi va risk ball."],
          ["📊 Tahlil","AI hisoboti: risk, trend, tavsiyalar, joylashuv intellekti."],
          ["🗺️ Yo'nalish","Greedy TSP algoritm bilan inkassator marshrutlari."],
          ["🔔 Alertlar","4 darajali ogohlantirish. WebSocket real-vaqt yetkazish."],
          ["🛡️ Admin","User, ATM, log boshqaruvi. Role-based access."],
        ].map(([t,d],i) => <div key={i} style={{ background: C.surface, border: `1px solid ${C.border}`, padding: 16, borderRadius: 10 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: C.text, marginBottom: 4 }}>{t}</div>
          <div style={{ fontSize: 13, color: C.text3, lineHeight: 1.6 }}>{d}</div>
        </div>)}
      </div>
    </>;

    case "arch": return <>
      <H1>Tizim Arxitekturasi</H1>
      <P>Platforma <B>Turborepo monorepo</B> tuzilishida qurilgan. Asosiy ilova Next.js 16 (App Router) da ishlaydi. API routelar server-side da bajariladi. Ma'lumotlar bazasi — MongoDB Atlas.</P>
      <Code title="Loyiha tuzilishi" code={`ATMcore/
├── apps/
│   ├── docs/                 ← Hujjatlar (shu sahifa)
│   └── web/                  ← Asosiy Next.js platforma
│       ├── app/api/          ← 25 ta backend API endpoint
│       │   ├── auth/         ← 10 ta avtorizatsiya
│       │   ├── atm/          ← 4 ta ATM boshqaruvi
│       │   ├── alerts/       ← 3 ta ogohlantirish
│       │   ├── analytics/    ← 2 ta AI tahlil
│       │   ├── predict/      ← 2 ta AI prognoz
│       │   ├── optimize/     ← 1 ta yo'nalish
│       │   ├── logs/         ← 2 ta tizim logi
│       │   └── admin/        ← 3 ta boshqaruv
│       ├── components/       ← React komponentlari
│       ├── lib/              ← api.ts, mongodb.ts
│       ├── models/           ← 6 ta Mongoose model
│       └── services/         ← 5 ta backend xizmat
└── packages/ui/              ← Shared UI`} />
    </>;

    case "tech": return <>
      <H1>Texnologiyalar</H1>
      <P>Platformada ishlatiladigan barcha texnologiyalar:</P>
      <Tbl h={["Texnologiya","Versiya","Vazifasi"]} r={[
        ["Next.js","16","Full-stack framework"],["React","19","UI kutubxonasi"],["TypeScript","5","Tip tekshiruvi"],
        ["MongoDB Atlas","7+","NoSQL baza"],["Mongoose","8+","MongoDB ODM"],["Google Gemini","2.5 Flash","AI prognoz, tahlil, chat"],
        ["TanStack Query","5","Server state"],["Leaflet.js","1.9","Xaritalar"],["Socket.IO","4","WebSocket"],
        ["jose","5","JWT"],["bcryptjs","2","Parol hash"],["luxon","3","Sana/vaqt"],
      ]} />
    </>;

    case "env": return <>
      <H1>Konfiguratsiya</H1>
      <P>Barcha maxfiy kalitlar <Cd>.env.local</Cd> faylida saqlanadi:</P>
      <Code title=".env.local" code={`MONGODB_URI="mongodb+srv://user:pass@cluster.mongodb.net/atmcore"
JWT_SECRET="de9fccc82d9271f113d59fb183a9..."
GEMINI_API_KEY="AIzaSy..."
NEXT_PUBLIC_APP_URL=http://localhost:3000`} />
      <H2>Ishga tushirish</H2>
      <Code title="Terminal" code={`npm install          # Dependencies
npm run dev          # Development (localhost:3000)
npm run build        # Production build`} />
      <Info>Test ma'lumotlarni generatsiya qilish: brauzerda <Cd>GET /api/admin/generate-data</Cd></Info>
    </>;

    case "auth": return <>
      <H1>Authentication API</H1>
      <P><B>JWT</B> (HTTP-only cookie) asosida. Parollar <Cd>bcryptjs</Cd>, tokenlar <Cd>jose</Cd> bilan.</P>
      <H2>Ro'yxatdan o'tish va kirish</H2>
      <EP method="POST" path="/api/auth/register" desc="Yangi foydalanuvchi. Email unikal, role avtomatik USER."
        body={`{\n  "name": "Ali Valiyev",\n  "email": "ali@example.com",\n  "password": "MySecure@123"\n}`}
        resp={`{ "message": "Muvaffaqiyatli!" }`} />
      <EP method="POST" path="/api/auth/login" desc="Tizimga kirish + JWT cookie."
        body={`{ "email": "ali@example.com", "password": "MySecure@123" }`}
        resp={`{ "user": { "name": "Ali", "email": "ali@example.com", "role": "USER" } }`} />
      <EP method="POST" path="/api/auth/demo-login" desc="Demo rejim (DB siz)."
        body={`{ "role": "ADMIN" }`} resp={`{ "user": { "name": "Demo Admin", "role": "ADMIN" } }`} />
      <H2>Sessiya boshqaruvi</H2>
      <EP method="GET" path="/api/auth/me" desc="Joriy foydalanuvchi (cookie dan)."
        resp={`{ "user": { "name": "Ali", "role": "USER" } }`} />
      <EP method="POST" path="/api/auth/logout" desc="Cookie o'chirish." resp={`{ "message": "Logged out" }`} />
      <H2>Profil va parol</H2>
      <EP method="PATCH" path="/api/auth/update-profile" desc="Ism/email yangilash."
        body={`{ "name": "Yangi", "email": "yangi@mail.com" }`} resp={`{ "message": "Updated" }`} />
      <EP method="POST" path="/api/auth/change-password" desc="Parol o'zgartirish."
        body={`{ "currentPassword": "eski", "newPassword": "yangi" }`} resp={`{ "message": "Changed" }`} />
      <H2>Email va parol tiklash</H2>
      <EP method="GET" path="/api/auth/verify?token=xxx" desc="Email tasdiqlash." />
      <EP method="POST" path="/api/auth/forgot-password" desc="Parol tiklash emaili." body={`{ "email": "ali@example.com" }`} />
      <EP method="POST" path="/api/auth/reset-password" desc="Yangi parol (token)." body={`{ "token": "abc...", "password": "Yangi" }`} />
    </>;

    case "atm": return <>
      <H1>ATM Management API</H1>
      <P>Har bir ATMda unikal <Cd>atmId</Cd>, koordinatalar, sig'im va holat saqlanadi.</P>
      <EP method="GET" path="/api/atm/list?page=1&limit=50" desc="ATMlar ro'yxati (pagination)."
        resp={`{\n  "data": [{\n    "atmId": "ATM-TAS-001",\n    "branch": "Tashkent Hub - Yunusobod",\n    "location": { "lat": 41.31, "lng": 69.28 },\n    "capacity": 500000000,\n    "currentCash": 425000000,\n    "status": "ONLINE"\n  }],\n  "meta": { "total": 20, "page": 1, "totalPages": 1 }\n}`} />
      <EP method="GET" path="/api/atm/:atmId" desc="Bitta ATM ma'lumotlari." />
      <EP method="POST" path="/api/atm/sync" desc="Tashqi tizimdan sinxronizatsiya." />
      <EP method="POST" path="/api/atm/import" desc="JSON ommaviy import." />
    </>;

    case "alerts": return <>
      <H1>Alerts API</H1>
      <P>4 daraja: <Cd>LOW</Cd>, <Cd>MEDIUM</Cd>, <Cd>HIGH</Cd>, <Cd>CRITICAL</Cd>. WebSocket orqali real-vaqt.</P>
      <EP method="GET" path="/api/alerts?resolved=false" desc="Alertlar ro'yxati."
        resp={`{ "data": [{ "atmId": "ATM-NUK-001", "severity": "CRITICAL", "message": "Naqd pul 3%", "resolved": false }] }`} />
      <EP method="POST" path="/api/alerts" desc="Yangi alert + WebSocket."
        body={`{ "atmId": "ATM-TAS-002", "severity": "HIGH", "message": "Cash below 15%" }`} />
      <EP method="PATCH" path="/api/alerts/:id/resolve" desc="Alertni hal qilish." resp={`{ "data": { "resolved": true } }`} />
    </>;

    case "analytics": return <>
      <H1>Analytics API</H1>
      <P>Gemini AI 30 kunlik tranzaksiyalarni tahlil qiladi. 10-30 sek.</P>
      <EP method="GET" path="/api/analytics" desc="To'liq tarmoq tahlili: risk, trend, tavsiyalar."
        resp={`{\n  "data": {\n    "risk_analysis": { "critical_atms": [...], "warning_atms": [...] },\n    "optimization_recommendations": {\n      "refill_strategy": "...",\n      "cash_distribution_plan": "..."\n    },\n    "location_intelligence": [{ "atm_id": "...", "status": "KEEP", "confidence": 0.92 }],\n    "final_summary": "Tarmoq barqaror..."\n  }\n}`} />
      <EP method="POST" path="/api/analytics/chat" desc="AI bilan savol-javob."
        body={`{ "message": "Qaysi ATMlarda pul kam?" }`} resp={`{ "reply": "ATM-NUK-001da faqat 3%..." }`} />
    </>;

    case "ai": return <>
      <H1>AI / Gemini Predictions API</H1>
      <P><B>Google Gemini 2.5 Flash</B> — cash demand, risk score (0-100), confidence (0-1), cashout ETA (soat).</P>
      <EP method="POST" path="/api/predict" desc="Bitta ATM uchun AI prognoz → DB ga saqlash."
        body={`{ "atmId": "ATM-TAS-001" }`}
        resp={`{\n  "data": {\n    "atmId": "ATM-TAS-001",\n    "predictedCashDemand": 320000000,\n    "riskScore": 35,\n    "confidence": 0.87,\n    "predictedTimeToCashout": 168,\n    "modelVersion": "gemini-2.5-flash"\n  }\n}`} />
      <EP method="GET" path="/api/predict/all" desc="Barcha prognozlar (riskScore ↓)."
        resp={`{ "data": [{ "atmId": "ATM-NUK-001", "riskScore": 92, ... }] }`} />
      <H2>AI Pipeline</H2>
      <Code code={`1. Feature Engineering → rollingAvg7/14/30, withdrawalVelocity, isWeekend, isHoliday
2. ATM kontekst: capacity, currentCash, status
3. Gemini AI → JSON response
4. Parse → Prediction modelida saqlash`} />
    </>;

    case "optimize": return <>
      <H1>Route Optimization API</H1>
      <P>Priority Score → Greedy TSP → Klasterlash (max 5) → Haversine masofa.</P>
      <Code title="Formula" code={`Priority = riskScore × 0.7 + (100 − timeToCashout) × 0.3
Faqat score > 50 tanlanadi`} />
      <EP method="POST" path="/api/optimize" desc="Optimallashtirilgan marshrutlar."
        resp={`{ "data": [{ "route": ["ATM-NUK-001","ATM-NUK-002"], "totalDistance": 12.5, "priorityScore": 85 }] }`} />
    </>;

    case "logs": return <>
      <H1>System Logs API</H1>
      <P>7 daraja: <Cd>INFO</Cd> <Cd>WARN</Cd> <Cd>ERROR</Cd> <Cd>CRIT</Cd> <Cd>AUTH</Cd> <Cd>SYNC</Cd> <Cd>NODE</Cd></P>
      <EP method="GET" path="/api/logs?limit=100&level=CRIT" desc="Loglar (level/limit filtr)."
        resp={`{ "data": [{ "level": "CRIT", "message": "Route conflict", "source": "route-engine" }] }`} />
      <EP method="POST" path="/api/logs" desc="Yangi log."
        body={`{ "level": "INFO", "message": "System init", "source": "core" }`} />
    </>;

    case "admin": return <>
      <H1>Admin Panel API</H1>
      <EP method="GET" path="/api/admin/users" desc="Barcha userlar (SUPERADMIN)."
        resp={`{ "data": [{ "name": "Ali", "email": "...", "role": "USER", "isVerified": true }] }`} />
      <EP method="PATCH" path="/api/admin/users/:id" desc="Role o'zgartirish." body={`{ "role": "ADMIN" }`} />
      <EP method="GET" path="/api/admin/generate-data" desc="Test data: 20 ATM, 620 tranzaksiya, 10 alert, 10 log."
        resp={`{ "message": "Generated", "counts": { "atms": 20, "transactions": 620 } }`} />
    </>;

    case "models": return <>
      <H1>Database Models</H1>
      <P>MongoDB Atlas da <B>6 ta Mongoose modeli</B>. Barchasi <Cd>timestamps: true</Cd>.</P>
      <H3>Atm</H3>
      <Tbl h={["Maydon","Turi","Tavsif"]} r={[["atmId","String (unique)","ATM-TAS-001"],["location","{ lat, lng }","Koordinatalar"],["branch","String","Filial"],["capacity","Number","Max sig'im"],["currentCash","Number","Joriy pul"],["status","Enum","ONLINE | OFFLINE | MAINTENANCE"]]} />
      <H3>User</H3>
      <Tbl h={["Maydon","Turi","Tavsif"]} r={[["email","String (unique)","Email"],["password","String (bcrypt)","Hash parol"],["name","String","Ism"],["role","Enum","SUPERADMIN | ADMIN | USER"],["isVerified","Boolean","Tasdiqlangan"]]} />
      <H3>Alert</H3>
      <Tbl h={["Maydon","Turi","Tavsif"]} r={[["atmId","String","ATM"],["severity","Enum","LOW|MEDIUM|HIGH|CRITICAL"],["message","String","Matn"],["resolved","Boolean","Hal qilingan"]]} />
      <H3>AtmTransaction</H3>
      <Tbl h={["Maydon","Turi","Tavsif"]} r={[["atmId","String","ATM"],["timestamp","Date","Vaqt"],["withdrawAmount","Number","Yechish"],["depositAmount","Number","Kiritish"],["cashRemaining","Number","Qolgan"],["period","Enum","DAILY|WEEKLY|MONTHLY"]]} />
      <H3>Prediction</H3>
      <Tbl h={["Maydon","Turi","Tavsif"]} r={[["atmId","String","ATM"],["predictedCashDemand","Number","7 kun prognoz"],["riskScore","Number","0-100"],["confidence","Number","0-1"],["predictedTimeToCashout","Number","Soatlar"],["modelVersion","String","gemini-2.5-flash"]]} />
      <H3>Log</H3>
      <Tbl h={["Maydon","Turi","Tavsif"]} r={[["level","Enum","INFO|WARN|ERROR|CRIT|AUTH|SYNC|NODE"],["message","String","Matn"],["source","String","Xizmat"]]} />
    </>;

    case "services": return <>
      <H1>Backend Services</H1>
      <Tbl h={["Servis","Funksiya","Vazifasi"]} r={[
        ["analyticsService","generateNetworkAnalyticsReport()","Gemini tarmoq hisoboti"],
        ["analyticsService","chatWithAnalytics(msg)","AI savol-javob"],
        ["geminiAiService","predictAtmCashDemand(atmId)","AI prognoz"],
        ["featureEngineering","generateFeaturesForAtm(atmId)","Statistik featurelar"],
        ["optimizationService","optimizeRoutes()","Greedy TSP"],
        ["websocketService","emitAlert(atmId,sev,msg)","Real-time broadcast"],
      ]} />
      <H3>Feature Engineering</H3>
      <Code code={`rollingAvg7/14/30:     O'rtacha yechish summasi
withdrawalVelocity:   7d/30d nisbat (>1 = tezlashyotgan)
isWeekend/isHoliday:  Hafta oxiri / bayram
lastCashRemaining:    Oxirgi qolgan pul`} />
    </>;

    case "ws": return <>
      <H1>WebSocket / Realtime</H1>
      <P>Socket.IO — path: <Cd>/api/realtime/ws</Cd></P>
      <Code code={`// Server
emitAlert("ATM-NUK-001", "CRITICAL", "Pul 3%")
// → "alert" event: { atmId, severity, message, timestamp }

// Client
const socket = io({ path: "/api/realtime/ws" });
socket.on("alert", (data) => console.log("Alert:", data));`} />
    </>;

    case "pages": return <>
      <H1>Frontend Sahifalar</H1>
      <Tbl h={["URL","Sahifa","API bog'liqliklari"]} r={[
        ["/","Dashboard","/api/atm/list, /api/alerts"],
        ["/live-map","Jonli Xarita","/api/atm/list, /api/analytics/chat"],
        ["/ai-predictions","AI Prognozlar","/api/predict/all, /api/predict"],
        ["/routes","Yo'nalishlar","/api/optimize, /api/atm/list"],
        ["/analytics","Tahlil","/api/analytics"],
        ["/alerts","Alertlar","/api/alerts"],
        ["/admin","Admin Panel","/api/admin/*, /api/logs"],
        ["/settings","Sozlamalar","/api/auth/update-profile"],
      ]} />
    </>;

    case "roles": return <>
      <H1>Rollar va Huquqlar</H1>
      <P>3 ta rol. USER avtomatik <Cd>/live-map</Cd> ga yo'naltiriladi.</P>
      <Tbl h={["Sahifa","USER","ADMIN","SUPERADMIN"]} r={[
        ["Live Map","✅","✅","✅"],["Dashboard","❌ → /live-map","✅","✅"],
        ["AI Predictions","❌","✅","✅"],["Routes","❌","✅","✅"],
        ["Analytics","❌","✅","✅"],["Alerts","❌","✅","✅"],
        ["Admin","❌","✅","✅"],["User Management","❌","❌","✅"],
        ["System Logs","❌","❌","✅"],["Settings","✅","✅","✅"],
      ]} />
    </>;

    default: return <P>Sahifa topilmadi.</P>;
  }
}

/* ═══════ MAIN PAGE ═══════ */
export default function Docs() {
  const [active, setActive] = useState("overview");
  const allItems = NAV.flatMap(g => g.items);
  const current = allItems.find(i => i.id === active);

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: C.bg }}>

      {/* TOP BAR */}
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: 52, background: C.sidebar, borderBottom: `1px solid ${C.border}`, zIndex: 50, display: "flex", alignItems: "center", padding: "0 24px", gap: 8 }}>
        <div style={{ width: 28, height: 28, borderRadius: 8, background: C.accent, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ color: C.bg, fontWeight: 900, fontSize: 12 }}>⚡</span>
        </div>
        <span style={{ fontWeight: 800, fontSize: 15, color: C.text }}>ATM CORE</span>
        <span style={{ fontSize: 13, color: C.text3 }}>Docs</span>
      </div>

      {/* SIDEBAR */}
      <aside style={{ width: 256, background: C.sidebar, borderRight: `1px solid ${C.border}`, position: "fixed", top: 52, bottom: 0, left: 0, overflowY: "auto", padding: "16px 0" }}>
        {NAV.map(sec => (
          <div key={sec.g} style={{ marginBottom: 8 }}>
            <div style={{ padding: "8px 20px", fontSize: 11, fontWeight: 700, color: C.text3, textTransform: "uppercase", letterSpacing: 1.5 }}>{sec.g}</div>
            {sec.items.map(item => (
              <button key={item.id} onClick={() => setActive(item.id)}
                style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "8px 20px", fontSize: 14, border: "none", cursor: "pointer", textAlign: "left", transition: "all 0.15s",
                  background: active === item.id ? C.surface : "transparent",
                  color: active === item.id ? C.accent : C.text2,
                  fontWeight: active === item.id ? 600 : 400,
                  borderLeft: active === item.id ? `3px solid ${C.accent}` : "3px solid transparent",
                }}>
                <span style={{ fontSize: 15 }}>{item.e}</span>
                <span>{item.l}</span>
              </button>
            ))}
          </div>
        ))}
      </aside>

      {/* MAIN CONTENT */}
      <main style={{ marginLeft: 256, marginTop: 52, padding: "32px 48px 80px", maxWidth: 820, flex: 1 }}>
        {/* Breadcrumb */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 24, fontSize: 14, color: C.text3 }}>
          <span style={{ color: C.accent }}>Docs</span>
          <span>›</span>
          <span>{current?.l || "..."}</span>
        </div>

        {/* Section Content */}
        <SectionContent id={active} />

        {/* Prev / Next */}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 48, paddingTop: 24, borderTop: `1px solid ${C.border}` }}>
          {(() => {
            const idx = allItems.findIndex(i => i.id === active);
            const prev = idx > 0 ? allItems[idx - 1] : null;
            const next = idx < allItems.length - 1 ? allItems[idx + 1] : null;
            return <>
              {prev ? <button onClick={() => setActive(prev.id)} style={{ background: "none", border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 20px", cursor: "pointer", color: C.text2, fontSize: 14 }}>← {prev.l}</button> : <div />}
              {next ? <button onClick={() => setActive(next.id)} style={{ background: "none", border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 20px", cursor: "pointer", color: C.accent, fontSize: 14 }}>{next.l} →</button> : <div />}
            </>;
          })()}
        </div>

        <div style={{ marginTop: 32, textAlign: "center" }}>
          <p style={{ fontSize: 12, color: C.text3 }}>ATM CORE Documentation v1.0.0 · © 2026</p>
        </div>
      </main>
    </div>
  );
}
