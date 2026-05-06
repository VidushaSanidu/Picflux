"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, Clock, Loader2, Upload, XCircle } from "lucide-react";

import { Button } from "../../components/ui/button";
import { useAuth } from "../../context/auth";
import { apiFetch } from "../../lib/api";
import type { MyImage } from "../../types/api";

const STATUS_STYLES: Record<string, string> = {
  Pending: "border-yellow-400/30 bg-yellow-400/10 text-yellow-400",
  Approved: "border-green-400/30 bg-green-400/10 text-green-400",
  Rejected: "border-red-400/30 bg-red-400/10 text-red-400",
};

const STATUS_ICONS: Record<string, React.ReactNode> = {
  Pending: <Clock className="size-3.5" />,
  Approved: <CheckCircle2 className="size-3.5" />,
  Rejected: <XCircle className="size-3.5" />,
};

export default function GalleryPage() {
  const { user } = useAuth();

  const { data: images = [], isLoading } = useQuery<MyImage[]>({
    queryKey: ["my-images"],
    queryFn: () => apiFetch<MyImage[]>("/images/mine"),
    enabled: !!user,
  });

  return (
    <section>
      <div className="mb-8">
        <p className="text-xs font-bold uppercase tracking-wider text-neon">Dashboard</p>
        <h1 className="mt-1 font-display text-3xl font-black">My Gallery</h1>
        <p className="mt-2 text-sm text-muted-foreground">All images you have submitted.</p>
      </div>

      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-xl font-black text-foreground">Uploads</h2>
        <Button variant="hero" size="sm" asChild>
          <Link href="/dashboard/upload">
            <Upload className="size-4" /> Upload new
          </Link>
        </Button>
      </div>

      {isLoading && <Loader2 className="size-5 animate-spin text-neon" />}

      {!isLoading && images.length === 0 && (
        <div className="glass-panel rounded-3xl p-10 text-center text-muted-foreground">
          No uploads yet.{" "}
          <Link href="/dashboard/upload" className="text-neon hover:underline">
            Upload your first image
          </Link>
        </div>
      )}

      {images.length > 0 && (
        <div className="overflow-hidden rounded-3xl border border-border">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-glass">
              <tr>
                <th className="px-5 py-3 text-left font-semibold text-muted-foreground">Title</th>
                <th className="px-5 py-3 text-left font-semibold text-muted-foreground">Tags</th>
                <th className="px-5 py-3 text-left font-semibold text-muted-foreground">Status</th>
                <th className="px-5 py-3 text-left font-semibold text-muted-foreground">Uploaded</th>
              </tr>
            </thead>
            <tbody>
              {images.map((img) => (
                <tr key={img.id} className="border-b border-border last:border-0 hover:bg-glass/50">
                  <td className="px-5 py-3 font-medium text-foreground">
                    {img.title ?? <span className="italic text-muted-foreground">Untitled</span>}
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">
                    {img.tags.join(", ") || "—"}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[img.status]}`}
                    >
                      {STATUS_ICONS[img.status]} {img.status}
                    </span>
                    {img.status === "Rejected" && img.rejectionReason && (
                      <p className="mt-1 text-xs text-muted-foreground">{img.rejectionReason}</p>
                    )}
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">
                    {new Date(img.createdAt).toLocaleDateString()}
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
