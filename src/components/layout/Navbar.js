"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Menu, X, ArrowUpRight } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Button from "@/components/ui/Button";
import NotificationBell from "@/components/layout/NotificationBell";
import { registerGsap, prefersReducedMotion } from "@/lib/animations";

const navLinks = [
  { href: "/auctions", label: "Browse Auctions" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/about", label: "About" },
];

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { data: session, status } = useSession();

  const navRef = useRef(null);
  const pillRef = useRef(null);

  useEffect(() => {
    registerGsap();

    if (prefersReducedMotion()) {
      const handleScrollFallback = () => {
        setIsScrolled(window.scrollY > 50);
      };
      window.addEventListener("scroll", handleScrollFallback, { passive: true });
      return () => window.removeEventListener("scroll", handleScrollFallback);
    }

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        start: "top top",
        end: 99999,
        onUpdate: (self) => {
          const scrolled = self.scroll() > 60;
          setIsScrolled((prev) => {
            if (prev !== scrolled) {
              return scrolled;
            }
            return prev;
          });
        },
      });
    }, navRef);

    return () => ctx.revert();
  }, []);

  return (
    <header
      ref={navRef}
      className="sticky top-0 z-50 w-full pt-2.5 sm:pt-3.5 pb-1 px-3 sm:px-6 pointer-events-none transition-all duration-300"
    >
      <div className="max-w-7xl mx-auto">
        {/* Dark smoked Liquid Glass floating bar — translucent over hero */}
        <nav
          ref={pillRef}
          className={`pointer-events-auto rounded-2xl sm:rounded-3xl ${
            isScrolled ? "liquid-glass-scrolled py-2 sm:py-2.5 px-4 sm:px-6" : "liquid-glass py-3 sm:py-3.5 px-4 sm:px-7"
          } transition-all duration-300 ease-out`}
        >
          <div className="flex items-center justify-between">
            {/* Logo & Primary Nav */}
            <div className="flex items-center gap-6 lg:gap-8">
              <Link href="/" className="flex items-center gap-2 group shrink-0">
                <span
                  className={`font-black tracking-[-0.05em] text-white transition-all duration-300 group-hover:text-violet-300 ${
                    isScrolled ? "text-lg sm:text-xl" : "text-xl sm:text-2xl"
                  }`}
                >
                  TORI
                </span>
                <span className="h-1.5 w-1.5 rounded-full bg-[#7c3aed] mb-1.5 transition-transform duration-300 group-hover:scale-125" />
              </Link>

              <div className="hidden md:flex items-center gap-6 lg:gap-7">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="font-mono text-xs uppercase tracking-wider text-zinc-400 hover:text-white transition-colors relative py-1 after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1.5px] after:bg-[#7c3aed] hover:after:w-full after:transition-all after:duration-200"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* User Session / CTA Nav */}
            <div className="hidden md:flex items-center gap-3">
              {status === "loading" ? (
                <div className="h-8 w-24 bg-white/10 rounded-full animate-pulse" />
              ) : session ? (
                <div className="flex items-center gap-3">
                  <NotificationBell />
                  <Link
                    href="/dashboard"
                    className="font-mono text-xs uppercase tracking-wider text-zinc-300 hover:text-white px-2.5 py-1.5 transition-colors"
                  >
                    Dashboard
                  </Link>

                  {session.user?.role === "ADMIN" && (
                    <Link
                      href="/admin"
                      className="inline-flex items-center gap-1 text-[11px] font-mono uppercase tracking-wider text-violet-300 bg-violet-500/15 border border-violet-400/20 rounded-full px-2.5 py-0.5 transition-colors hover:bg-violet-500/25"
                    >
                      Admin
                    </Link>
                  )}

                  <div className="h-4 w-px bg-white/10 mx-1" />

                  <div className="flex items-center gap-2 pl-1">
                    <div className="h-7 w-7 rounded-full bg-zinc-100 text-zinc-950 ring-1 ring-white/20 flex items-center justify-center text-xs font-semibold">
                      {session.user?.name?.[0]?.toUpperCase() || "U"}
                    </div>
                    <span className="text-xs font-medium text-zinc-100 max-w-[120px] truncate">
                      {session.user?.name}
                    </span>
                  </div>

                  <Button
                    href="/api/auth/signout"
                    variant="ghostDark"
                    size="sm"
                    className="text-xs"
                  >
                    Sign Out
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Button
                    href="/login"
                    variant="ghostDark"
                    size="sm"
                    className="text-xs font-mono uppercase tracking-wider"
                  >
                    Sign In
                  </Button>
                  <Button
                    href="/register"
                    variant="accent"
                    size="sm"
                    className="group rounded-full"
                  >
                    <span className="text-xs">Get Started</span>
                    <ArrowUpRight className="h-3.5 w-3.5 opacity-70 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </Button>
                </div>
              )}
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-zinc-300 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

          {/* Mobile expandable drawer */}
          {mobileMenuOpen && (
            <div className="md:hidden pt-4 mt-3 border-t border-white/10 animate-fadeIn">
              <div className="space-y-1 pb-3">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-xl text-sm font-mono uppercase tracking-wider text-zinc-300 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              <div className="pt-3 border-t border-white/10">
                {status === "loading" ? (
                  <div className="h-10 bg-white/10 rounded-xl animate-pulse" />
                ) : session ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 px-3 py-2.5 bg-white/5 rounded-xl">
                      <div className="h-8 w-8 rounded-full bg-zinc-100 text-zinc-950 flex items-center justify-center text-xs font-bold">
                        {session.user?.name?.[0]?.toUpperCase() || "U"}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                          {session.user?.name}
                        </p>
                        <p className="text-[11px] font-mono uppercase tracking-wider text-violet-300">
                          {session.user?.role?.toLowerCase() || "buyer"}
                        </p>
                      </div>
                    </div>
                    <Link
                      href="/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-3 py-2 text-sm font-mono uppercase tracking-wider text-zinc-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
                    >
                      Dashboard
                    </Link>
                    {session.user?.role === "ADMIN" && (
                      <Link
                        href="/admin"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block px-3 py-2 text-sm font-mono uppercase tracking-wider text-violet-300 hover:bg-violet-500/15 rounded-xl transition-colors"
                      >
                        Admin Console
                      </Link>
                    )}
                    <Button
                      href="/api/auth/signout"
                      variant="ghostDark"
                      size="sm"
                      className="w-full justify-start font-mono text-xs"
                    >
                      Sign Out
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Button href="/login" variant="outlineDark" size="sm" className="w-full rounded-full">
                      Sign In
                    </Button>
                    <Button href="/register" variant="accent" size="sm" className="w-full rounded-full">
                      Create Account
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}