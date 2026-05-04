"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { Download, Loader2, Search, SlidersHorizontal, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";

import { ImageCard } from "../../components/picflux/ImageCard";
import { PicfluxNav } from "../../components/picflux/PicfluxNav";
import { apiFetch } from "../../lib/api";
import type { ImagesListResponse } from "../../types/api";

const LIMIT = 20;

function ExploreContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") ?? "";
  const [search, setSearch] = useState(initialQuery);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [debouncedSearch, setDebouncedSearch] = useState(initialQuery);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  // reset page when filters change
  useEffect(() => { setPage(1); }, [debouncedSearch, activeTag]);

  const params = new URLSearchParams({ page: String(page), limit: String(LIMIT) });
  if (debouncedSearch) params.set("q", debouncedSearch);
  if (activeTag) params.set("tags", activeTag);

  const { data, isLoading, isError } = useQuery<ImagesListResponse>({
    queryKey: ["images", debouncedSearch, activeTag, page],
    queryFn: () => apiFetch<ImagesListResponse>(`/v1/images?${params.toString()}`),
  });

  const tags = data?.topTags ?? [];
  const images = data?.data ?? [];
  const pagination = data?.pagination;

  const clearFilters = useCallback(() => {
    setSearch("");
    setActiveTag(null);
    setPage(1);
  }, []);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <PicfluxNav />
      <section className="mx-auto max-w-7xl px-4 pb-12 pt-32 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl animate-soft-rise">
            <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-border bg-glass px-4 py-2 text-sm font-bold text-neon backdrop-blur-xl">
              <Download className="size-4" /> Public Feed
            </p>
            <h1 className="font-display text-4xl font-black tracking-normal sm:text-6xl">Explore animal images</h1>
            <p className="mt-4 text-lg leading-8 text-muted-foreground">Browse verified animal photography. Click to view details or download.</p>
          </div>
          <div className="glass-panel flex w-full items-center gap-3 rounded-full p-2 lg:max-w-md">
            <Search className="ml-4 size-5 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="min-w-0 flex-1 bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground"
              placeholder="Search approved images"
            />
            {(search || activeTag) && (
              <button onClick={clearFilters} className="mr-2 text-muted-foreground hover:text-foreground">
                <X className="size-4" />
              </button>
            )}
            {/* <SlidersHorizontal className="mr-4 size-5 text-neon" /> */}
          </div>
        </div>

        {tags.length > 0 && (
          <div className="mb-8 flex gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => setActiveTag(null)}
              className={`rounded-full border px-5 py-3 text-sm font-bold capitalize transition-all duration-300 hover:-translate-y-0.5 ${!activeTag ? "border-secondary bg-secondary text-secondary-foreground shadow-glow" : "border-border bg-glass text-muted-foreground hover:text-foreground"}`}
            >
              All
            </button>
            {tags.map((tag) => (
              <button
                key={tag}
                onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                className={`rounded-full border px-5 py-3 text-sm font-bold capitalize transition-all duration-300 hover:-translate-y-0.5 ${activeTag === tag ? "border-secondary bg-secondary text-secondary-foreground shadow-glow" : "border-border bg-glass text-muted-foreground hover:text-foreground"}`}
              >
                {tag}
              </button>
            ))}
          </div>
        )}

        {isLoading && (
          <div className="flex justify-center py-24">
            <Loader2 className="size-8 animate-spin text-neon" />
          </div>
        )}

        {isError && (
          <div className="py-24 text-center text-muted-foreground">
            Failed to load images. Make sure the backend is running.
          </div>
        )}

        {!isLoading && !isError && images.length === 0 && (
          <div className="py-24 text-center text-muted-foreground">
            No images found.{" "}
            {(search || activeTag) && (
              <button onClick={clearFilters} className="text-neon hover:underline">
                Clear filters
              </button>
            )}
          </div>
        )}

        {images.length > 0 && (
          <div className="columns-1 gap-5 sm:columns-2 lg:columns-3">
            {images.map((item, index) => (
              <ImageCard key={item.id} item={item} priority={index < 3} />
            ))}
          </div>
        )}

        {pagination && pagination.pages > 1 && (
          <div className="mt-10 flex items-center justify-center gap-3">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="glass-panel rounded-full px-5 py-3 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40"
            >
              Previous
            </button>
            <span className="text-sm text-muted-foreground">
              Page {pagination.page} of {pagination.pages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
              disabled={page === pagination.pages}
              className="glass-panel rounded-full px-5 py-3 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}
      </section>
    </main>
  );
}

export default function ExplorePage() {
  return (
    <Suspense>
      <ExploreContent />
    </Suspense>
  );
}
