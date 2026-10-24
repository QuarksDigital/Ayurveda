"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "./Logo";
import { useCart } from "@/components/providers/CartProvider";

const NAV = [
  { href: "/shop", label: "Shop" },
  { href: "/#concerns", label: "Concerns" },
  { href: "/#process", label: "Our Process" },
  { href: "/#doshas", label: "Doshas" },
];

export default function Header() {
  const { count, open, ready } = useCart();
  const pathname = usePathname();
  // Remember which page the menu was opened on so navigating closes it.
  const [menuPath, setMenuPath] = useState<string | null>(null);
  const menuOpen = menuPath === pathname;

  return (
    <header className="site-header fixed inset-x-0 top-0 z-50 border-b border-black/5 bg-white/80 text-ink backdrop-blur-xl backdrop-saturate-150 touch-solid">
      <div className="container-x flex h-14 items-center justify-between">
        <Link href="/" aria-label="Mirasha home">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-9 md:flex" aria-label="Main">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="text-[13px] opacity-80 transition-opacity hover:opacity-100">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={open}
            className="relative flex h-10 w-10 items-center justify-center rounded-full opacity-80 transition hover:opacity-100"
            aria-label={`Open cart, ${ready ? count : 0} items`}
          >
            <svg viewBox="0 0 24 24" className="h-[19px] w-[19px]" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
              <path d="M5 8h14l-1.2 11.1a2 2 0 0 1-2 1.9H8.2a2 2 0 0 1-2-1.9L5 8Z" />
              <path d="M9 10V6.5a3 3 0 0 1 6 0V10" />
            </svg>
            {ready && count > 0 && (
              <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-semibold text-white">
                {count}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setMenuPath(menuOpen ? null : pathname)}
            className="flex h-10 w-10 items-center justify-center rounded-full md:hidden"
            aria-expanded={menuOpen}
            aria-label="Toggle menu"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
              {menuOpen ? <path d="M6 6l12 12M18 6 6 18" /> : <path d="M4 9h16M4 15h16" />}
            </svg>
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav className="container-x pb-6 pt-2 md:hidden" aria-label="Mobile">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="block py-3 text-2xl font-semibold tracking-tight">
              {item.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
