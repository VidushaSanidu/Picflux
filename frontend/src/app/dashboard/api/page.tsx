"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Key, Loader2, Plus, Trash2 } from "lucide-react";

import { Button } from "../../../components/ui/button";
import { useAuth } from "../../../context/auth";
import { apiFetch, ApiError } from "../../../lib/api";
import type { ApiKey, NewApiKey } from "../../../types/api";

export default function ApiKeysPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [newKey, setNewKey] = useState<NewApiKey | null>(null);
  const [copied, setCopied] = useState(false);

  const { data: keys = [], isLoading } = useQuery<ApiKey[]>({
    queryKey: ["api-keys"],
    queryFn: () => apiFetch<ApiKey[]>("/api-keys/"),
    enabled: !!user,
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

  if (!user) return null;

  return (
    <section>
      <div className="mb-8">
        <p className="text-xs font-bold uppercase tracking-wider text-neon">API</p>
        <h1 className="mt-1 font-display text-3xl font-black">API Keys</h1>
        <p className="mt-2 text-sm text-muted-foreground">
         Read the Documentation to get started with the API:{" "}
          <a
            href="https://docs.picflux.io/api"
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground underline underline-offset-4 hover:text-neon"
          >
            Documentation
          </a>
          .
        </p>
      </div>

      <div className="mb-5 flex items-center justify-end">
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
          {createMutation.error instanceof ApiError
            ? createMutation.error.message
            : "Failed to create key"}
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
          <button
            onClick={() => setNewKey(null)}
            className="mt-3 text-xs text-muted-foreground hover:text-foreground"
          >
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
                <th className="px-5 py-3 text-left font-semibold text-muted-foreground">
                  Key prefix
                </th>
                <th className="px-5 py-3 text-left font-semibold text-muted-foreground">
                  Created
                </th>
                <th className="px-5 py-3 text-right font-semibold text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {keys.map((k) => (
                <tr
                  key={k.id}
                  className="border-b border-border last:border-0 hover:bg-glass/50"
                >
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
