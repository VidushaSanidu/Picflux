"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Clock, Key, Loader2, Plus, Trash2, Upload, XCircle } from "lucide-react";

import { PicfluxNav } from "../../components/picflux/PicfluxNav";
import { Button } from "../../components/ui/button";
import { useRequireAuth } from "../../context/auth";
import { apiFetch, ApiError } from "../../lib/api";
import type { ApiKey, MyImage, NewApiKey } from "../../types/api";

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

export default function DashboardPage() {
  const { user, loading } = useRequireAuth();

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
        <div className="mb-10 animate-soft-rise">
          <p className="text-sm font-bold uppercase text-neon">Dashboard</p>
          <h1 className="mt-2 font-display text-4xl font-black">My account</h1>
          <p className="mt-2 text-muted-foreground">{user.email}</p>
        </div>

        <div className="space-y-12">
          <MyImagesSection />
          <ApiKeysSection />
        </div>
      </div>
    </main>
  );
}

function MyImagesSection() {
  const { data: images = [], isLoading } = useQuery<MyImage[]>({
    queryKey: ["my-images"],
    queryFn: () => apiFetch<MyImage[]>("/images/mine"),
  });

  return (
    <section>
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-xl font-black text-foreground">My uploads</h2>
        <Button variant="hero" size="sm" asChild>
          <a href="/upload"><Upload className="size-4" /> Upload new</a>
        </Button>
      </div>

      {isLoading && <Loader2 className="size-5 animate-spin text-neon" />}

      {!isLoading && images.length === 0 && (
        <div className="glass-panel rounded-3xl p-10 text-center text-muted-foreground">
          No uploads yet.{" "}
          <a href="/upload" className="text-neon hover:underline">Upload your first image</a>
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
                  <td className="px-5 py-3 font-medium text-foreground">{img.title ?? <span className="text-muted-foreground italic">Untitled</span>}</td>
                  <td className="px-5 py-3 text-muted-foreground">{img.tags.join(", ") || "—"}</td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[img.status]}`}>
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

function ApiKeysSection() {
  const queryClient = useQueryClient();
  const [newKey, setNewKey] = useState<NewApiKey | null>(null);
  const [copied, setCopied] = useState(false);

  const { data: keys = [], isLoading } = useQuery<ApiKey[]>({
    queryKey: ["api-keys"],
    queryFn: () => apiFetch<ApiKey[]>("/api-keys/"),
  });

  const createMutation = useMutation({
    mutationFn: () => apiFetch<NewApiKey>("/api-keys/", { method: "POST" }),
    onSuccess: (data) => {
      setNewKey(data);
      void queryClient.invalidateQueries({ queryKey: ["api-keys"] });
    },
  });

  const revokeMutation = useMutation({
    mutationFn: (id: string) => apiFetch(`/api-keys/${id}`, { method: "DELETE" }),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["api-keys"] }),
  });

  async function copyKey() {
    if (!newKey) return;
    await navigator.clipboard.writeText(newKey.key);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <section>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-foreground">API keys</h2>
          <p className="text-sm text-muted-foreground">Use these keys for programmatic uploads via <code className="text-neon">Authorization: Bearer &lt;key&gt;</code></p>
        </div>
        <Button
          variant="glass"
          size="sm"
          onClick={() => createMutation.mutate()}
          disabled={createMutation.isPending}
        >
          {createMutation.isPending ? <Loader2 className="animate-spin" /> : <Plus />}
          New key
        </Button>
      </div>

      {createMutation.isError && (
        <p className="mb-4 rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-400">
          {createMutation.error instanceof ApiError ? createMutation.error.message : "Failed to create key"}
        </p>
      )}

      {newKey && (
        <div className="mb-5 rounded-3xl border border-yellow-400/30 bg-yellow-400/10 p-5">
          <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-yellow-400">
            <Key className="size-4" /> Copy your key now — it won&apos;t be shown again
          </p>
          <div className="flex items-center gap-3">
            <code className="flex-1 overflow-auto rounded-xl border border-border bg-background/50 px-4 py-2 text-xs text-foreground">
              {newKey.key}
            </code>
            <Button variant="glass" size="sm" onClick={copyKey}>
              {copied ? "Copied!" : "Copy"}
            </Button>
          </div>
          <button onClick={() => setNewKey(null)} className="mt-3 text-xs text-muted-foreground hover:text-foreground">
            Dismiss
          </button>
        </div>
      )}

      {isLoading && <Loader2 className="size-5 animate-spin text-neon" />}

      {!isLoading && keys.length === 0 && (
        <div className="glass-panel rounded-3xl p-10 text-center text-muted-foreground">
          No API keys yet. Generate one above.
        </div>
      )}

      {keys.length > 0 && (
        <div className="overflow-hidden rounded-3xl border border-border">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-glass">
              <tr>
                <th className="px-5 py-3 text-left font-semibold text-muted-foreground">Key prefix</th>
                <th className="px-5 py-3 text-left font-semibold text-muted-foreground">Created</th>
                <th className="px-5 py-3 text-right font-semibold text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {keys.map((k) => (
                <tr key={k.id} className="border-b border-border last:border-0 hover:bg-glass/50">
                  <td className="px-5 py-3">
                    <code className="rounded-lg border border-border bg-glass px-2 py-1 text-xs text-neon">
                      {k.keyPrefix}…
                    </code>
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">
                    {new Date(k.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button
                      onClick={() => revokeMutation.mutate(k.id)}
                      disabled={revokeMutation.isPending}
                      className="text-red-400 hover:text-red-300 disabled:opacity-50"
                      aria-label="Revoke key"
                    >
                      <Trash2 className="size-4" />
                    </button>
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
