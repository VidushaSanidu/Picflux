import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CheckCircle2, Download, Mail, MapPin, Search, ShieldCheck, Upload, Users, Zap } from "lucide-react";

import { animalImages } from "../components/picflux/animalData";
import { PicfluxNav } from "../components/picflux/PicfluxNav";
import { Button } from "../components/ui/button";

export const metadata: Metadata = {
  title: "Picflux — Animal Image Hosting",
  description: "Explore verified animal photography, upload freely, and integrate downloads with API keys.",
  openGraph: {
    title: "Picflux — Animal Image Hosting",
    description: "A futuristic image hosting platform for verified animal photography and developer APIs.",
  },
};

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-background text-foreground">
      <PicfluxNav />
      <section className="relative flex min-h-[92vh] items-center px-4 pb-16 pt-32 sm:px-6 lg:px-8">
        <div className="noise-overlay pointer-events-none absolute inset-0" />
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="animate-float-field absolute -right-10 top-24 hidden w-[44rem] columns-2 gap-4 opacity-70 blur-[0.2px] lg:block">
            {animalImages.slice(0, 4).map((item, index) => (
              <Image
                key={item.id}
                src={item.image}
                alt=""
                width={1024}
                height={1280}
                className={`mb-4 rounded-[2rem] border border-border object-cover shadow-glass ${index % 2 ? "h-72" : "h-96"}`}
              />
            ))}
          </div>
        </div>
        <div className="relative z-10 mx-auto grid w-full max-w-7xl items-center gap-12 lg:grid-cols-[1.02fr_0.98fr]">
          <div className="animate-soft-rise max-w-4xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-glass px-4 py-2 text-sm font-semibold text-muted-foreground backdrop-blur-xl">
              <ShieldCheck className="size-4 text-neon" /> Verified public animal photography
            </div>
            <h1 className="font-display text-5xl font-black leading-[0.95] tracking-normal text-foreground sm:text-7xl lg:text-8xl">
              Discover <span className="hero-gradient-text">Stunning Animal Photography</span>
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl">
              Upload freely, browse verified animal images, and plug into a clean API for programmatic uploads, downloads, and curated discovery.
            </p>
            <div className="glass-panel mt-8 flex max-w-2xl items-center gap-3 rounded-full p-2">
              <Search className="ml-4 size-5 text-muted-foreground" />
              <input className="min-w-0 flex-1 bg-transparent py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground" placeholder="Search birds, wild cats, pets, marine life..." />
              <Button variant="hero">Search</Button>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button variant="hero" size="lg" asChild>
                <Link href="/explore">Explore <ArrowRight /></Link>
              </Button>
              <Button variant="glass" size="lg" asChild>
                <Link href="/upload">
                  <Upload /> Upload
                </Link>
              </Button>
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-lg lg:hidden">
            <Image src={animalImages[2].image} alt="Featured bengal cat animal photograph" width={1024} height={1280} className="h-[30rem] w-full rounded-[2rem] object-cover shadow-glass" />
          </div>
        </div>
      </section>
      <section className="px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mx-auto mb-8 flex max-w-7xl flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-bold uppercase text-neon">Featured gallery</p>
            <h2 className="mt-2 text-3xl font-black text-foreground sm:text-4xl">Verified animal images ready to explore.</h2>
          </div>
          <Button variant="glass" asChild>
            <Link href="/explore">View all <ArrowRight /></Link>
          </Button>
        </div>
        <div className="mx-auto grid max-w-7xl gap-5 md:grid-cols-3">
          {animalImages.slice(0, 3).map((item) => (
            <article key={item.id} className="group overflow-hidden rounded-3xl border border-border bg-card shadow-glass transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-glow">
              <div className="relative h-80 overflow-hidden">
                <Image src={item.image} alt={`${item.title} animal photograph by ${item.photographer}`} width={1024} height={1280} loading="lazy" className="h-full w-full object-cover opacity-95 transition duration-300 ease-in-out group-hover:scale-105 group-hover:opacity-100" />
                <div className="absolute inset-0 bg-linear-to-t from-background via-background/10 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-5">
                  <div>
                    <p className="text-lg font-bold text-foreground">{item.title}</p>
                    <p className="text-sm text-muted-foreground">by {item.photographer}</p>
                  </div>
                  <span className="rounded-full border border-border bg-glass px-3 py-1 text-xs font-bold uppercase text-neon backdrop-blur-xl">{item.category}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
      <section className="px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mx-auto mb-8 max-w-7xl">
          <p className="text-sm font-bold uppercase text-neon">Team</p>
          <h2 className="mt-2 text-3xl font-black text-foreground sm:text-4xl">Built by image, moderation, and API specialists.</h2>
        </div>
        <div className="mx-auto grid max-w-7xl gap-5 md:grid-cols-3">
          {[
            ["Mira Chen", "Curation Lead", "Guides animal image standards and public gallery quality."],
            ["Jon Bell", "Platform Engineer", "Builds secure API key workflows for uploads and downloads."],
            ["Aya Morgan", "Trust Reviewer", "Reviews new submissions before they reach Explore."],
          ].map(([name, role, bio]) => (
            <article key={name} className="glass-panel rounded-3xl p-6 transition-transform duration-300 hover:-translate-y-1">
              <div className="mb-6 flex size-14 items-center justify-center rounded-2xl bg-muted text-neon">
                <Users className="size-7" />
              </div>
              <h3 className="text-xl font-bold text-foreground">{name}</h3>
              <p className="mt-1 text-sm font-semibold uppercase text-neon">{role}</p>
              <p className="mt-4 leading-7 text-muted-foreground">{bio}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-5 rounded-[2rem] border border-border bg-card p-6 shadow-glass md:grid-cols-[1fr_1.2fr] md:p-8">
          <div>
            <p className="text-sm font-bold uppercase text-neon">Contact</p>
            <h2 className="mt-2 text-3xl font-black text-foreground">Partner with picflux.</h2>
            <p className="mt-4 leading-7 text-muted-foreground">Reach out for API access, moderation questions, or image hosting support.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <a href="mailto:hello@picflux.io" className="glass-panel rounded-2xl p-5 transition-transform duration-300 hover:-translate-y-1">
              <Mail className="mb-4 size-6 text-neon" />
              <p className="font-bold text-foreground">hello@picflux.io</p>
              <p className="mt-1 text-sm text-muted-foreground">General and API inquiries</p>
            </a>
            <div className="glass-panel rounded-2xl p-5">
              <MapPin className="mb-4 size-6 text-neon" />
              <p className="font-bold text-foreground">Remote-first team</p>
              <p className="mt-1 text-sm text-muted-foreground">Supporting creators worldwide</p>
            </div>
          </div>
        </div>
      </section>
      <section className="px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-5 md:grid-cols-3">
          {[
            [ShieldCheck, "Verification queue", "New uploads stay private until admins approve them for the public feed."],
            [Zap, "Developer API", "API keys unlock automated upload and download flows for teams and apps."],
            [Download, "Free discovery", "Browse, search, and download community animal photography with attribution."],
          ].map(([Icon, title, body]) => (
            <article key={title as string} className="glass-panel rounded-3xl p-6 transition-transform duration-300 hover:-translate-y-1">
              <Icon className="mb-6 size-7 text-neon" />
              <h2 className="text-xl font-bold text-foreground">{title as string}</h2>
              <p className="mt-3 leading-7 text-muted-foreground">{body as string}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="px-4 pb-24 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 rounded-[2rem] border border-border bg-card p-6 shadow-glass md:flex-row md:items-center md:justify-between md:p-8">
          <div>
            <p className="text-sm font-bold uppercase text-neon">Moderated by design</p>
            <h2 className="mt-2 text-3xl font-black text-foreground">Only approved uploads reach Explore.</h2>
          </div>
          <div className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-3">
            {"Upload Review Publish".split(" ").map((step) => (
              <span key={step} className="inline-flex items-center gap-2 rounded-full bg-muted px-4 py-3"><CheckCircle2 className="size-4 text-neon" />{step}</span>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
