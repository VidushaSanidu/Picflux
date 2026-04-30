import Image from "next/image";
import { Download, Sparkles } from "lucide-react";

import type { AnimalImage } from "./animalData";

export function AnimalCard({ item, priority = false }: { item: AnimalImage; priority?: boolean }) {
  return (
    <article className="group relative mb-5 break-inside-avoid overflow-hidden rounded-3xl border border-border bg-card shadow-glass transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-glow">
      <div className={`relative ${item.height} overflow-hidden`}>
        <div className="absolute inset-0 animate-shimmer" />
        <Image
          src={item.image}
          alt={`${item.title} animal photograph by ${item.photographer}`}
          width={1024}
          height={1280}
          priority={priority}
          className="relative z-10 h-full w-full object-cover opacity-95 transition duration-300 ease-in-out group-hover:scale-105 group-hover:opacity-100"
        />
        <div className="absolute inset-0 z-20 bg-linear-to-t from-background via-background/15 to-transparent opacity-75 transition-opacity duration-300 group-hover:opacity-95" />
        <div className="absolute inset-x-0 bottom-0 z-30 translate-y-3 p-5 opacity-0 transition-all duration-300 ease-in-out group-hover:translate-y-0 group-hover:opacity-100">
          <div className="glass-panel flex items-center justify-between rounded-2xl p-4">
            <div>
              <p className="text-sm font-bold text-foreground">{item.title}</p>
              <p className="text-xs text-muted-foreground">by {item.photographer}</p>
            </div>
            <button className="flex size-11 items-center justify-center rounded-full bg-secondary text-secondary-foreground shadow-glow transition-transform duration-300 hover:scale-105" aria-label={`Download ${item.title}`}>
              <Download className="size-5" />
            </button>
          </div>
        </div>
        <span className="absolute left-4 top-4 z-30 inline-flex items-center gap-2 rounded-full border border-border bg-glass px-3 py-1 text-xs font-semibold uppercase text-foreground backdrop-blur-xl">
          <Sparkles className="size-3 text-neon" /> {item.category}
        </span>
      </div>
    </article>
  );
}
