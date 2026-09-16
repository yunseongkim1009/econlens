import type { Metadata } from "next";
import { Suspense } from "react";
import { Shell } from "@/components/shell";
import "./globals.css";
import { AccessibilityAudit } from "@/components/accessibility-audit";
export const metadata: Metadata = {
  title: "EconLens | Economic research dashboard",
  description:
    "Explore economic indicators across countries with transparent World Bank and OECD data.",
  icons: { icon: "/favicon.svg" },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <Suspense
          fallback={<div className="loading-shell">Loading EconLens…</div>}
        >
          <Shell>{children}</Shell>
          {process.env.NODE_ENV === "development" && <AccessibilityAudit />}
        </Suspense>
      </body>
    </html>
  );
}
