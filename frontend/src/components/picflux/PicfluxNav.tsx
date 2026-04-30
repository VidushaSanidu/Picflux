"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Camera, KeyRound, Upload } from "lucide-react";

import { Button } from "../ui/button";

export function PicfluxNav() {
  const pathname = usePathname();

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 py-4 sm:px-6">
      <nav className="glass-panel mx-auto flex max-w-7xl items-center justify-between rounded-full px-4 py-3">
        <Link href="/" className="group flex items-center gap-3" aria-label="picflux home">
          <span className="flex size-10 items-center justify-center rounded-full bg-secondary text-secondary-foreground shadow-glow transition-transform duration-300 group-hover:rotate-6 group-hover:scale-105">
            <Camera className="size-5" />
          </span>
          <span className="font-display text-lg font-bold tracking-normal text-foreground">Picflux</span>
        </Link>
        <div className="hidden items-center gap-6 text-sm font-medium text-muted-foreground md:flex">
          <Link
            href="/explore"
            className={`transition-colors duration-300 hover:text-foreground ${pathname === "/explore" ? "text-foreground" : ""}`}
          >
            Explore
          </Link>
          <span>Verification</span>
          <span>API</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="glass" size="sm" className="hidden sm:inline-flex">
            <KeyRound /> API
          </Button>
          <Button variant="hero" size="sm">
            <Upload /> Upload
          </Button>
        </div>
      </nav>
    </header>
  );
}
