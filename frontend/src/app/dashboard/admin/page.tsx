"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Clock, Loader2, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useAuth } from "../../../context/auth";
import { apiFetch } from "../../../lib/api";
import type { PendingImage } from "../../../types/api";

export default function AdminPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && user.role !== "admin") {
      router.replace("/dashboard");
    }
  }, [user, router]);

  const { data: pending = [], isLoading } = useQuery<PendingImage[]>({
    queryKey: ["admin-pending"],
    queryFn: () => apiFetch<PendingImage[]>("/admin/images/pending"),
    enabled: !!user && user.role === "admin",
  });

  if (!user || user.role !== "admin") return null;

  return (
    <section>
      <div className="mb-8">
        <p className="mb-2 inline-flex items-center gap-2 rounded-full border border-border bg-glass px-4 py-2 text-sm font-bold text-neon">
          <ShieldCheck className="size-4" /> Admin
        </p>
        <h1 className="font-display text-3xl font-black">Moderation queue</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {isLoading
            ? "Loading…"
            : `${pending.length} image${pending.length !== 1 ? "s" : ""} awaiting review`}
        </p>
      </div>

      {isLoading && <Loader2 className="size-5 animate-spin text-neon" />}

      {!isLoading && pending.length === 0 && (
        <div className="glass-panel rounded-3xl p-16 text-center text-muted-foreground">
          All clear — no images pending review.
        </div>
      )}

      {pending.length > 0 && (
        <div className="overflow-hidden rounded-3xl border border-border">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-glass">
              <tr>
                <th className="px-5 py-3 text-left font-semibold text-muted-foreground">Title</th>
                <th className="px-5 py-3 text-left font-semibold text-muted-foreground">
                  Uploader
                </th>
                <th className="px-5 py-3 text-left font-semibold text-muted-foreground">Tags</th>
                <th className="px-5 py-3 text-left font-semibold text-muted-foreground">
                  Submitted
                </th>
                <th className="px-5 py-3 text-right font-semibold text-muted-foreground">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {pending.map((img) => (
                <tr
                  key={img.id}
                  className="border-b border-border last:border-0 hover:bg-glass/50"
                >
                  <td className="px-5 py-3 font-medium text-foreground">
                    {img.title ?? (
                      <span className="italic text-muted-foreground">Untitled</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">{img.uploader.email}</td>
                  <td className="px-5 py-3 text-muted-foreground">
                    {img.tags.join(", ") || "—"}
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5 text-xs">
                      <Clock className="size-3.5" />
                      {new Date(img.createdAt).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <Link
                      href={`/admin/images/${img.id}`}
                      className="rounded-full border border-secondary px-4 py-1.5 text-xs font-semibold text-neon transition-colors hover:bg-secondary hover:text-secondary-foreground"
                    >
                      Review
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
