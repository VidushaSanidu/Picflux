"use client";

import { use, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, CheckCircle2, Loader2, MapPin, Tag, XCircle } from "lucide-react";

import { PicfluxNav } from "../../../../components/picflux/PicfluxNav";
import { Button } from "../../../../components/ui/button";
import { useRequireAdmin } from "../../../../context/auth";
import { apiFetch, ApiError } from "../../../../lib/api";
import type { PendingImageDetail } from "../../../../types/api";

export default function AdminImageReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user, loading } = useRequireAdmin();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const { data: image, isLoading, isError } = useQuery<PendingImageDetail>({
    queryKey: ["admin-image", id],
    queryFn: () => apiFetch<PendingImageDetail>(`/admin/images/${id}`),
    enabled: !!user,
  });

  const approveMutation = useMutation({
    mutationFn: () => apiFetch(`/admin/images/${id}/approve`, { method: "PATCH" }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin-pending"] });
      router.push("/admin");
    },
    onError: (err) => setActionError(err instanceof ApiError ? err.message : "Failed to approve"),
  });

  const rejectMutation = useMutation({
    mutationFn: () =>
      apiFetch(`/admin/images/${id}/reject`, {
        method: "PATCH",
        body: JSON.stringify({ reason: rejectReason || undefined }),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin-pending"] });
      router.push("/admin");
    },
    onError: (err) => setActionError(err instanceof ApiError ? err.message : "Failed to reject"),
  });

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
      <div className="mx-auto max-w-5xl px-4 pb-16 pt-32 sm:px-6 lg:px-8">
        <Link
          href="/admin"
          className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Back to queue
        </Link>

        {isLoading && <Loader2 className="size-8 animate-spin text-neon" />}
        {isError && <p className="text-muted-foreground">Image not found.</p>}

        {image && (
          <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
            <div className="relative overflow-hidden rounded-3xl border border-border bg-card shadow-glass">
              <div className="relative aspect-4/3 w-full">
                <Image
                  src={image.previewUrl}
                  alt={image.title ?? "Pending image"}
                  fill
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  priority
                  className="object-cover"
                />
              </div>
            </div>

            <div className="flex flex-col gap-5">
              <div className="glass-panel rounded-3xl p-6">
                <h1 className="font-display text-2xl font-black text-foreground">
                  {image.title ?? "Untitled"}
                </h1>
                {image.location && (
                  <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="size-4 text-neon" /> {image.location}
                  </p>
                )}
                <p className="mt-1 text-xs text-muted-foreground">by {image.uploader.email}</p>

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

                <div className="mt-4 border-t border-border pt-4 text-xs text-muted-foreground">
                  <p>{(image.sizeBytes / 1024).toFixed(0)} KB · {image.mimeType}</p>
                  <p>Submitted {new Date(image.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              {actionError && (
                <p className="rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-400">
                  {actionError}
                </p>
              )}

              <Button
                variant="hero"
                onClick={() => approveMutation.mutate()}
                disabled={approveMutation.isPending || rejectMutation.isPending}
              >
                {approveMutation.isPending ? <Loader2 className="animate-spin" /> : <CheckCircle2 />}
                Approve
              </Button>

              {!showRejectForm ? (
                <Button
                  variant="glass"
                  onClick={() => setShowRejectForm(true)}
                  disabled={approveMutation.isPending}
                >
                  <XCircle /> Reject
                </Button>
              ) : (
                <div className="space-y-3">
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Rejection reason (optional)"
                    rows={3}
                    className="w-full rounded-2xl border border-border bg-glass px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary"
                  />
                  <div className="flex gap-2">
                    <Button
                      variant="glass"
                      className="flex-1 border-red-400/40 text-red-400 hover:bg-red-400/10"
                      onClick={() => rejectMutation.mutate()}
                      disabled={rejectMutation.isPending}
                    >
                      {rejectMutation.isPending ? <Loader2 className="animate-spin" /> : <XCircle />}
                      Confirm reject
                    </Button>
                    <Button variant="glass" onClick={() => setShowRejectForm(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
