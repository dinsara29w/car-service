import type { Metadata, Viewport } from "next";
import "./globals.css";
import { StoreProvider } from "@/lib/store";
import { ToastProvider } from "@/components/ui/toast";
import { AppShell } from "@/components/app-shell";

export const metadata: Metadata = {
  title: {
    default: "Demo Auto Workshop — Workshop management demo",
    template: "%s | Demo Auto Workshop",
  },
  description:
    "A clickable demo of a modern workshop management app for a New Zealand auto repair shop.",
  applicationName: "Demo Auto Workshop",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Demo Auto",
    statusBarStyle: "default",
  },
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/apple-touch-icon.png",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0F3D2E",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-NZ">
      <body>
        <StoreProvider>
          <ToastProvider>
            <AppShell>{children}</AppShell>
          </ToastProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
