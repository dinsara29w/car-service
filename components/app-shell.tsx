"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ClipboardList,
  FileCheck2,
  LayoutDashboard,
  ListChecks,
  Plus,
  Settings,
  Users,
} from "lucide-react";
import type { ReactNode } from "react";
import { BrandLockup, BrandMark, DemoBadge } from "@/components/brand";
import { cx } from "@/lib/format";
import { useStore } from "@/lib/store";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/history", label: "Jobs & invoices", icon: ClipboardList },
  { href: "/customers", label: "Customers", icon: Users },
  { href: "/templates", label: "Checklists", icon: ListChecks },
];

const mobileItems = [
  { href: "/", label: "Home", icon: LayoutDashboard },
  { href: "/history", label: "Jobs", icon: ClipboardList },
  { href: "/inspections/new", label: "New", icon: Plus, primary: true },
  { href: "/customers", label: "Customers", icon: Users },
  { href: "/templates", label: "Checklists", icon: ListChecks },
];

function isNavActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  if (href === "/history") {
    return (
      pathname.startsWith("/history") ||
      (pathname.startsWith("/inspections/") && pathname !== "/inspections/new") ||
      pathname.startsWith("/quotes/")
    );
  }
  if (href === "/inspections/new") return pathname === "/inspections/new";
  return pathname.startsWith(href);
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { actions } = useStore();
  const focusedFlow =
    pathname === "/inspections/new" || /^\/inspections\/[^/]+\/sign$/.test(pathname);

  if (!actions.hydrated) {
    return (
      <div className="grid min-h-dvh place-items-center bg-canvas px-6">
        <div className="flex flex-col items-center text-center">
          <BrandMark className="size-14 rounded-2xl shadow-lift" />
          <p className="mt-4 text-sm font-bold tracking-tight text-ink">Demo Auto Workshop</p>
          <div className="mt-3 flex items-center gap-2">
            <span className="size-1.5 animate-pulse rounded-full bg-brand" />
            <p className="text-[11px] font-medium text-ink-muted">Loading demo data…</p>
          </div>
          <div className="mt-4 h-1 w-32 overflow-hidden rounded-full bg-brand-100">
            <div className="h-full w-1/2 animate-pulse rounded-full bg-brand" />
          </div>
          <div className="mt-8 flex items-center gap-2 text-[10px] text-ink-muted/70">
            <DemoBadge />
            <span>Demo by WebMint</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-canvas">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 flex-col border-r border-line bg-white lg:flex">
        <div className="flex h-[96px] flex-col justify-center gap-2 border-b border-line px-5">
          <BrandLockup />
          <DemoBadge className="ml-[52px] w-fit" />
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-6">
          <Link
            href="/inspections/new"
            className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-brand px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-600 active:scale-[0.99]"
          >
            <Plus className="size-4" strokeWidth={2.5} aria-hidden="true" />
            New inspection
          </Link>

          <nav className="mt-7 space-y-1" aria-label="Main navigation">
            <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-ink-muted/70">
              Workshop
            </p>
            {navItems.map((item) => {
              const active = isNavActive(pathname, item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cx(
                    "group flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold transition",
                    active
                      ? "bg-brand-50 text-brand-900"
                      : "text-ink-muted hover:bg-canvas hover:text-ink",
                  )}
                >
                  <span
                    className={cx(
                      "grid size-8 place-items-center rounded-lg transition",
                      active ? "bg-white text-brand-700 shadow-sm" : "text-ink-muted group-hover:text-ink",
                    )}
                  >
                    <Icon className="size-[18px]" strokeWidth={2} aria-hidden="true" />
                  </span>
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <nav className="mt-6 space-y-1 border-t border-line pt-5" aria-label="Settings navigation">
            <Link
              href="/settings"
              aria-current={pathname === "/settings" ? "page" : undefined}
              className={cx(
                "flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold transition",
                pathname === "/settings"
                  ? "bg-brand-50 text-brand-900"
                  : "text-ink-muted hover:bg-canvas hover:text-ink",
              )}
            >
              <span className="grid size-8 place-items-center rounded-lg">
                <Settings className="size-[18px]" strokeWidth={2} aria-hidden="true" />
              </span>
              Settings
            </Link>
          </nav>
        </div>

        <div className="p-4">
          <div className="rounded-2xl bg-ink p-4 text-white">
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-brand-300" />
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-brand-200">
                Demo mode
              </p>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-white/65">
              Sample data is stored in this browser. Reset it anytime from Settings.
            </p>
            <div className="mt-3 flex items-center gap-1.5 text-[10px] font-medium text-white/45">
              <FileCheck2 className="size-3.5" aria-hidden="true" />
              Demo by WebMint
            </div>
          </div>
        </div>
      </aside>

      <div className="flex min-h-dvh flex-col lg:pl-72">
        <header className="sticky top-0 z-30 border-b border-line/80 bg-white/90 pt-[env(safe-area-inset-top)] backdrop-blur-xl lg:hidden">
          <div className="flex h-16 items-center justify-between gap-3 px-4">
            <Link href="/" className="min-w-0" aria-label="Go to dashboard">
              <BrandLockup />
            </Link>
            <div className="flex shrink-0 items-center gap-1.5">
              <DemoBadge />
              <Link
                href="/settings"
                aria-label="Settings"
                className={cx(
                  "grid size-10 place-items-center rounded-xl transition",
                  pathname === "/settings"
                    ? "bg-brand-50 text-brand-800"
                    : "text-ink-muted hover:bg-brand-50 hover:text-ink",
                )}
              >
                <Settings className="size-5" strokeWidth={1.9} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </header>

        <main
          className={cx(
            "mx-auto w-full max-w-6xl flex-1 px-4 pt-6 sm:px-6 lg:px-10 lg:pt-10",
            focusedFlow ? "pb-12" : "pb-28 lg:pb-12",
          )}
        >
          {children}
        </main>

        <footer
          className={cx(
            "mx-auto w-full max-w-6xl px-4 pb-6 pt-4 sm:px-6 lg:px-10",
            focusedFlow ? "pb-8" : "pb-24 lg:pb-8",
          )}
        >
          <div className="flex flex-col gap-2 border-t border-line pt-5 text-[11px] text-ink-muted sm:flex-row sm:items-center sm:justify-between">
            <p className="font-medium">Demo by WebMint</p>
            <p>Demo data only · No real customer information</p>
          </div>
        </footer>
      </div>

      {!focusedFlow && (
        <nav
          className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-white/95 backdrop-blur-xl lg:hidden"
          aria-label="Mobile navigation"
        >
          <div
            className="grid grid-cols-5 px-1 pt-1"
            style={{ paddingBottom: "max(6px, env(safe-area-inset-bottom))" }}
          >
            {mobileItems.map((item) => {
              const active = isNavActive(pathname, item.href);
              const Icon = item.icon;
              if (item.primary) {
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className="group flex min-h-14 flex-col items-center justify-end gap-0.5 pb-1"
                  >
                    <span className="grid size-11 -translate-y-1 place-items-center rounded-2xl bg-brand text-white shadow-[0_6px_16px_rgba(34,165,89,0.3)] ring-4 ring-white transition group-active:scale-95">
                      <Icon className="size-5" strokeWidth={2.5} aria-hidden="true" />
                    </span>
                    <span className="text-[10px] font-bold text-brand-800">{item.label}</span>
                  </Link>
                );
              }
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cx(
                    "flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl pb-0.5 text-[10px] font-semibold transition",
                    active ? "text-brand-800" : "text-ink-muted",
                  )}
                >
                  <span
                    className={cx(
                      "grid size-7 place-items-center rounded-lg transition",
                      active ? "bg-brand-50" : "bg-transparent",
                    )}
                  >
                    <Icon className="size-[19px]" strokeWidth={active ? 2.4 : 2} aria-hidden="true" />
                  </span>
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
}
