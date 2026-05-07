import Image from "next/image";
import Link from "next/link";
import { Download, MapPin, Sparkles } from "lucide-react";

import type { PublicImage } from "../../types/api";

export function ImageCard({ item, priority = false }: { item: PublicImage; priority?: boolean }) {
  const tag = item.tags[0];

  return (
    <article className="group relative mb-5 break-inside-avoid overflow-hidden rounded-3xl border border-border bg-card shadow-glass transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-glow">
      <Link href={`/images/${item.id}`} aria-label={`View ${item.title ?? "image"}`}>
        <div className="relative h-72 overflow-hidden">
          {item.thumbnailUrl ? (
            <Image
              src={item.thumbnailUrl}
              alt={item.title ?? "Animal photograph"}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              priority={priority}
              className="object-cover h-full opacity-95 transition duration-300 ease-in-out group-hover:scale-105 group-hover:opacity-100"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-card text-muted-foreground text-sm">
              No preview
            </div>
          )}
          <div className="absolute inset-0 bg-linear-to-t from-background via-background/15 to-transparent opacity-75 transition-opacity duration-300 group-hover:opacity-95" />
          <div className="absolute inset-x-0 bottom-0 z-10 translate-y-3 p-5 opacity-0 transition-all duration-300 ease-in-out group-hover:translate-y-0 group-hover:opacity-100">
            <div className="glass-panel flex items-center justify-between rounded-2xl p-4">
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-foreground">{item.title ?? "Untitled"}</p>
                {item.location && (
                  <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="size-3 shrink-0" /> {item.location}
                  </p>
                )}
              </div>
              <DownloadButton id={item.id} title={item.title} />
            </div>
          </div>
          {tag && (
            <span className="absolute left-4 top-4 z-10 inline-flex items-center gap-2 rounded-full border border-border bg-glass px-3 py-1 text-xs font-semibold uppercase text-foreground backdrop-blur-xl">
              <Sparkles className="size-3 text-neon" /> {tag}
            </span>
          )}
        </div>
      </Link>
    </article>
  );
}

function DownloadButton({ id, title }: { id: string; title: string | null }) {
  async function handleDownload(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"}/v1/images/${id}/download`,
        { credentials: "include" },
      );
      if (!res.ok) return;
      const { downloadUrl } = (await res.json()) as { downloadUrl: string };
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = title ?? id;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch {}
  }

  return (
    <button
      onClick={handleDownload}
      className="ml-3 flex size-11 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground shadow-glow transition-transform duration-300 hover:scale-105"
      aria-label={`Download ${title ?? "image"}`}
    >
      <Download className="size-5" />
    </button>
  );
}
