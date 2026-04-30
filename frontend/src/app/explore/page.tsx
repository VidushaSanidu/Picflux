import type { Metadata } from "next";
import { Download, Loader2, Search, SlidersHorizontal } from "lucide-react";

import { AnimalCard } from "../../components/picflux/AnimalCard";
import { animalImages, categories } from "../../components/picflux/animalData";
import { PicfluxNav } from "../../components/picflux/PicfluxNav";

export const metadata: Metadata = {
  title: "Explore Animal Images — picflux",
  description: "Browse a responsive masonry grid of verified animal photography across birds, wild, pets, and marine categories.",
  openGraph: {
    title: "Explore Animal Images — picflux",
    description: "Search and download verified animal images from the picflux public gallery.",
  },
};

export default function ExplorePage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <PicfluxNav />
      <section className="mx-auto max-w-7xl px-4 pb-12 pt-32 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl animate-soft-rise">
            <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-border bg-glass px-4 py-2 text-sm font-bold text-neon backdrop-blur-xl">
              <Download className="size-4" /> Public verified feed
            </p>
            <h1 className="font-display text-4xl font-black tracking-normal sm:text-6xl">Explore animal images</h1>
            <p className="mt-4 text-lg leading-8 text-muted-foreground">A fast masonry gallery with hover downloads, photographer attribution, category filters, and infinite-scroll style loading states.</p>
          </div>
          <div className="glass-panel flex w-full items-center gap-3 rounded-full p-2 lg:max-w-md">
            <Search className="ml-4 size-5 text-muted-foreground" />
            <input className="min-w-0 flex-1 bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground" placeholder="Search approved images" />
            <SlidersHorizontal className="mr-4 size-5 text-neon" />
          </div>
        </div>
        <div className="mb-8 flex gap-2 overflow-x-auto pb-2">
          {categories.map((category, index) => (
            <button key={category} className={`rounded-full border px-5 py-3 text-sm font-bold capitalize transition-all duration-300 hover:-translate-y-0.5 ${index === 0 ? "border-secondary bg-secondary text-secondary-foreground shadow-glow" : "border-border bg-glass text-muted-foreground hover:text-foreground"}`}>
              {category}
            </button>
          ))}
        </div>
        <div className="columns-1 gap-5 sm:columns-2 lg:columns-3">
          {animalImages.map((item, index) => (
            <AnimalCard key={`${item.id}-${index}`} item={item} priority={index < 2} />
          ))}
        </div>
        <div className="mt-10 flex justify-center">
          <div className="glass-panel flex items-center gap-3 rounded-full px-5 py-3 text-sm font-semibold text-muted-foreground">
            <Loader2 className="size-4 animate-spin text-neon" /> Loading more verified images
          </div>
        </div>
      </section>
    </main>
  );
}
