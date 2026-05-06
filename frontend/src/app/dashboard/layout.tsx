"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Images, Key, Loader2, ShieldCheck, Upload } from "lucide-react";

import { PicfluxNav } from "../../components/picflux/PicfluxNav";
import { useRequireAuth } from "../../context/auth";

const ITEM_BASE =
  "flex items-center gap-3 rounded-xl px-3 py-2.5 font-medium transition-colors duration-200";

function SidebarLink({
  href,
  icon,
  label,
  exact = false,
  small = false,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  exact?: boolean;
  small?: boolean;
}) {
  const pathname = usePathname();
  const active = exact ? pathname === href : pathname.startsWith(href);
  return (
    <Link
      href={href}
      className={`${ITEM_BASE} ${small ? "text-xs" : "text-sm"} ${
        active
          ? "bg-neon/10 text-neon"
          : "text-muted-foreground hover:bg-glass hover:text-foreground"
      }`}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useRequireAuth();
  const pathname = usePathname();
  const apiActive = pathname.startsWith("/dashboard/api");

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="size-8 animate-spin text-neon" />
      </main>
    );
  }

  if (!user) return null;

  return (
    <main className="min-h-screen bg-background text-foreground">
      <PicfluxNav />

      <div className="mx-auto flex max-w-7xl pt-20">
        {/* ── Sidebar ── */}
        <aside className="sticky top-20 hidden h-[calc(100vh-80px)] w-56 shrink-0 overflow-y-auto border-r border-border px-3 py-6 md:block">
          <div className="mb-6 px-3">
            <p className="text-xs font-bold uppercase tracking-wider text-neon">Dashboard</p>
            <p className="mt-1 truncate text-sm text-muted-foreground">{user.email}</p>
          </div>

          <nav className="space-y-1">
            <SidebarLink
              href="/dashboard"
              exact
              icon={<Images className="size-4" />}
              label="My Gallery"
            />

            <SidebarLink
              href="/dashboard/upload"
              icon={<Upload className="size-4" />}
              label="Upload"
            />

            {/* API group — always expanded */}
            <div>
              <div
                className={`${ITEM_BASE} text-sm ${
                  apiActive ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                <Key className="size-4" />
                <span>API</span>
              </div>
              <div className="ml-4 mt-1 space-y-1 border-l border-border pl-3">
                <SidebarLink
                  href="/dashboard/api"
                  exact
                  icon={<Key className="size-3.5" />}
                  label="API Keys"
                  small
                />
                <SidebarLink
                  href="/dashboard/api/docs"
                  icon={<BookOpen className="size-3.5" />}
                  label="Documentation"
                  small
                />
              </div>
            </div>

            {user.role === "admin" && (
              <SidebarLink
                href="/dashboard/admin"
                icon={<ShieldCheck className="size-4" />}
                label="Admin"
              />
            )}
          </nav>
        </aside>

        {/* ── Content ── */}
        <div className="min-w-0 flex-1 px-6 py-8 sm:px-10">{children}</div>
      </div>
    </main>
  );
}
