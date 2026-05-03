"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Camera, KeyRound, LayoutDashboard, LogIn, LogOut, ShieldCheck, Upload } from "lucide-react";

import { useAuth } from "../../context/auth";
import { Button } from "../ui/button";

export function PicfluxNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout } = useAuth();

  async function handleLogout() {
    await logout();
    router.push("/");
  }

  const isActive = (href: string) => pathname === href;

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 py-4 sm:px-6">
      <nav className="glass-panel mx-auto flex max-w-7xl items-center justify-between rounded-full px-4 py-3">
        <Link href="/" className="group flex items-center gap-3" aria-label="picflux home">
          <span className="flex size-10 items-center justify-center rounded-full bg-secondary text-secondary-foreground shadow-glow transition-transform duration-300 group-hover:rotate-6 group-hover:scale-105">
            <Camera className="size-5" />
          </span>
          <span className="hero-gradient-text font-display text-lg font-black tracking-normal">Picflux</span>
        </Link>
        <div className="hidden items-center gap-6 text-sm font-medium text-muted-foreground md:flex">
          <Link href="/explore" className={`transition-colors duration-300 hover:text-foreground ${isActive("/explore") ? "text-foreground" : ""}`}>
            Explore
          </Link>
          <Link href="/license" className={`transition-colors duration-300 hover:text-foreground ${isActive("/license") ? "text-foreground" : ""}`}>
            License
          </Link>
          <Link href="/about" className={`transition-colors duration-300 hover:text-foreground ${isActive("/about") ? "text-foreground" : ""}`}>
            About Us
          </Link>
          
          {user?.role === "admin" && (
            <Link href="/admin" className={`flex items-center gap-1.5 transition-colors duration-300 hover:text-foreground ${isActive("/admin") ? "text-foreground" : ""}`}>
              <ShieldCheck className="size-3.5 text-neon" /> Admin
            </Link>
          )}
        </div>
        <div className="flex items-center gap-2">
          {!loading && !user && (
            <>
              <Button variant="glass" size="sm" asChild className="hidden sm:inline-flex">
                <Link href="/login"><LogIn className="size-4" /> Sign in</Link>
              </Button>
              <Button variant="hero" size="sm" asChild>
                <Link href="/register">Get started</Link>
              </Button>
            </>
          )}
          {!loading && user && (
            <>
              <Button variant="glass" size="sm" asChild className="hidden sm:inline-flex">
                <Link href="/dashboard"><LayoutDashboard className="size-4" /> Dashboard</Link>
              </Button>
              <Button variant="hero" size="sm" asChild>
                <Link href="/upload"><Upload className="size-4" /> Upload</Link>
              </Button>
              <Button variant="glass" size="sm" onClick={handleLogout} aria-label="Sign out">
                <LogOut className="size-4" />
              </Button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
