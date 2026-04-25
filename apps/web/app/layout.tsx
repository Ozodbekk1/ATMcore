import type { Metadata } from "next";
import "./globals.css";
import { DashboardLayout } from "../components/DashboardLayout";

export const metadata: Metadata = {
  title: "ATMzone",
  description: "ATMzone is a platform that provides various services related to ATMs, including ATM management, monitoring, and support. Our goal is to enhance the efficiency and reliability of ATM operations while ensuring a seamless user experience for both customers and operators.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`h-full antialiased`}
    >
      <head>
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossOrigin="" />
      </head>
      <body className="min-h-full flex flex-col font-sans">
        <DashboardLayout>{children}</DashboardLayout>
      </body>
    </html>
  );
}
