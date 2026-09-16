"use client";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  Activity,
  LayoutDashboard,
  TrendingUp,
  ChartNoAxesCombined,
  Users,
  Wallet,
  Scale,
  GitCompareArrows,
  Info,
  Menu,
  X,
  ArrowUpRight,
  Globe2,
} from "lucide-react";
import { CountrySelector } from "./country-selector";
import { resolveCountry } from "@/lib/countries";
const navigation = [
  { name: "Inflation", icon: TrendingUp },
  { name: "GDP", icon: ChartNoAxesCombined },
  { name: "Labor", icon: Users },
  { name: "Wages", icon: Wallet },
  { name: "Inequality", icon: Scale },
  { name: "Compare", icon: GitCompareArrows },
];
export function Shell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const sidebarRef = useRef<HTMLElement>(null);
  const menuRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    sidebarRef.current?.querySelector<HTMLButtonElement>(".close-nav")?.focus();
    const menuButton = menuRef.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
      menuButton?.focus();
    };
  }, [open]);
  useEffect(() => {
    const media = window.matchMedia("(min-width:901px)");
    const onResize = () => {
      if (media.matches) setOpen(false);
    };
    media.addEventListener("change", onResize);
    return () => media.removeEventListener("change", onResize);
  }, []);
  const params = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const country = resolveCountry(params.get("country"));
  function href(path: string) {
    return `${path}?${params.toString()}`;
  }
  return (
    <div className="app-shell">
      {open && (
        <button
          className="scrim"
          aria-label="Close navigation"
          onClick={() => setOpen(false)}
        />
      )}
      <aside
        ref={sidebarRef}
        onKeyDown={(event) => {
          if (!open) return;
          if (event.key === "Escape") setOpen(false);
          if (event.key === "Tab") {
            const items =
              sidebarRef.current?.querySelectorAll<HTMLElement>(
                "a[href], button",
              );
            if (!items?.length) return;
            const first = items[0];
            const last = items[items.length - 1];
            if (event.shiftKey && document.activeElement === first) {
              event.preventDefault();
              last.focus();
            }
            if (!event.shiftKey && document.activeElement === last) {
              event.preventDefault();
              first.focus();
            }
          }
        }}
        className={`sidebar ${open ? "open" : ""}`}
        aria-label="Main navigation"
      >
        <Link href={href("/")} className="brand" onClick={() => setOpen(false)}>
          <span className="brand-mark">
            <Activity size={22} />
          </span>
          EconLens<span className="brand-dot">.</span>
        </Link>
        <button
          className="close-nav"
          aria-label="Close navigation"
          onClick={() => setOpen(false)}
        >
          <X />
        </button>
        <div className="nav-caption">WORKSPACE</div>
        <nav>
          <Link
            className={`nav-item ${pathname === "/" ? "active" : ""}`}
            href={href("/")}
            aria-current={pathname === "/" ? "page" : undefined}
            onClick={() => setOpen(false)}
          >
            <LayoutDashboard size={18} />
            Overview
          </Link>
          {navigation.map(({ name, icon: Icon }) => (
            <Link
              key={name}
              href={href(`/${name.toLowerCase()}`)}
              className={`nav-item ${pathname === `/${name.toLowerCase()}` ? "active" : ""}`}
              aria-current={
                pathname === `/${name.toLowerCase()}` ? "page" : undefined
              }
              onClick={() => setOpen(false)}
            >
              <Icon size={18} />
              {name}
            </Link>
          ))}
          <div className="nav-divider" />
          <Link
            className={`nav-item ${pathname === "/about" ? "active" : ""}`}
            href={href("/about")}
            aria-current={pathname === "/about" ? "page" : undefined}
            onClick={() => setOpen(false)}
          >
            <Info size={18} />
            About
          </Link>
        </nav>
        <div className="sidebar-bottom">
          <Globe2 size={18} />
          <div>
            World Bank & OECD<small>Economic indicators</small>
          </div>
        </div>
        <a
          className="author"
          href="https://yunseong-kim.vercel.app/"
          target="_blank"
          rel="noreferrer"
        >
          Built by Yunseong Kim
          <ArrowUpRight size={14} />
        </a>
      </aside>
      <div className="workspace" inert={open || undefined}>
        <header className="topbar">
          <div className="breadcrumb">
            <button
              ref={menuRef}
              className="mobile-menu"
              aria-label="Open navigation"
              aria-expanded={open}
              onClick={() => setOpen(true)}
            >
              <Menu />
            </button>
            <span>Workspace</span>
            <span>/</span>
            <strong>
              {pathname === "/"
                ? "Overview"
                : pathname
                    .slice(1)
                    .replace(/^./, (c) => c.toUpperCase())
                    .replace("Gdp", "GDP")}
            </strong>
          </div>
          {pathname !== "/compare" && (
            <CountrySelector
              value={country.code}
              onChange={(value) => {
                const next = new URLSearchParams(params.toString());
                next.set("country", value);
                router.replace(`${pathname}?${next}`, { scroll: false });
              }}
            />
          )}
        </header>
        <main id="main">{children}</main>
        <footer className="footer">
          <span>
            EconLens{" "}
            <span className="muted">/ Independent economic research</span>
          </span>
          <span>Annual data · No financial advice</span>
        </footer>
      </div>
    </div>
  );
}
