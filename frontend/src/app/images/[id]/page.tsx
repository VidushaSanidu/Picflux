"use client";

import { use, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Calendar, Download, Loader2, MapPin, Shield, Star, StarOff, Tag, Trash2 } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { PicfluxNav } from "../../../components/picflux/PicfluxNav";
import { Button } from "../../../components/ui/button";
import { apiFetch } from "../../../lib/api";
import { useAuth } from "../../../context/auth";
import type { ImageDetail } from "../../../types/api";

export default function ImageDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const isAdmin = user?.role === "admin";

  const { data: image, isLoading, isError } = useQuery<ImageDetail>({
    queryKey: ["image", id],
    queryFn: () => apiFetch<ImageDetail>(`/v1/images/${id}`),
  });

  const deleteMutation = useMutation({
    mutationFn: () =>
      apiFetch(`/admin/images/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["image", id] });
      router.push("/explore");
    },
  });

  const featuredMutation = useMutation({
    mutationFn: (featured: boolean) =>
      apiFetch(`/admin/images/${id}/featured`, {
        method: "PATCH",
        body: JSON.stringify({ featured }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["image", id] });
    },
  });

  async function handleDownload() {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"}/v1/images/${id}/download`,
        { credentials: "include" },
      );
      if (!res.ok) return;
      const { downloadUrl } = (await res.json()) as { downloadUrl: string };
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = image?.title ?? id;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch {}
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <PicfluxNav />
      <section className="mx-auto max-w-5xl px-4 pb-16 pt-32 sm:px-6 lg:px-8">
        <Link
          href="/explore"
          className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Back to explore
        </Link>

        {isLoading && (
          <div className="flex justify-center py-24">
            <Loader2 className="size-8 animate-spin text-neon" />
          </div>
        )}

        {isError && (
          <div className="py-24 text-center text-muted-foreground">
            Image not found or not approved.
          </div>
        )}

        {image && (
          <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
            <div className="relative overflow-hidden rounded-3xl border border-border bg-card shadow-glass">
              <div className="relative aspect-4/3 w-full">
                <Image
                  src={image.viewUrl}
                  alt={image.title ?? "Animal photograph"}
                  fill
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  priority
                  className="object-cover"
                />
              </div>
            </div>

            <div className="flex flex-col gap-6">
              <div className="glass-panel rounded-3xl p-6">
                <h1 className="font-display text-3xl font-black text-foreground">
                  {image.title ?? "Untitled"}
                </h1>
                {image.location && (
                  <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="size-4 text-neon" /> {image.location}
                  </p>
                )}
                <p className="mt-1 text-xs text-muted-foreground">
                  by {image.uploader.email}
                </p>

                {image.tags.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {image.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1.5 rounded-full border border-border bg-glass px-3 py-1 text-xs font-semibold text-muted-foreground"
                      >
                        <Tag className="size-3 text-neon" /> {tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="mt-5 space-y-2 border-t border-border pt-4 text-xs text-muted-foreground">
                  <p className="flex items-center gap-2">
                    <Calendar className="size-3.5 text-neon" />
                    Published on {new Date(image.createdAt).toLocaleDateString()}
                  </p>
                  <p>Download Size: {(image.sizeBytes / 1024).toFixed(0)} KB · {image.mimeType}</p>
                </div>
              </div>

              <Button variant="hero" size="lg" onClick={handleDownload} className="w-full">
                <Download /> Download
              </Button>

              {isAdmin && (
                <div className="glass-panel rounded-3xl p-6">
                  <h2 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-neon">
                    <Shield className="size-4" /> Admin Actions
                  </h2>
                  <div className="grid md:grid-cols-2 gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start gap-2"
                      disabled={featuredMutation.isPending}
                      onClick={() => featuredMutation.mutate(!image.featured)}
                    >
                      {featuredMutation.isPending ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : image.featured ? (
                        <StarOff className="size-4 text-yellow-400" />
                      ) : (
                        <Star className="size-4 text-yellow-400" />
                      )}
                      {image.featured ? "Unfeature" : "Mark as Featured"}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="w-full justify-start gap-2"
                      disabled={deleteMutation.isPending}
                      onClick={() => {
                        if (confirm("Delete this image permanently? This cannot be undone.")) {
                          deleteMutation.mutate();
                        }
                      }}
                    >
                      {deleteMutation.isPending ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Trash2 className="size-4" />
                      )}
                      Delete Image
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
