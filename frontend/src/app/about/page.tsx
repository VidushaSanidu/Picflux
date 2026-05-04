import type { Metadata } from "next";
import { Camera, Globe, ShieldCheck, Users, Zap } from "lucide-react";

import { PicfluxNav } from "../../components/picflux/PicfluxNav";

export const metadata: Metadata = {
  title: "About Us — Picflux",
  description: "Learn about Picflux — the platform built for animal photography enthusiasts and developers.",
};

const values = [
  {
    icon: Camera,
    title: "Photography First",
    description:
      "We built Picflux for people who love capturing the natural world. Every feature is designed to showcase animal imagery at its best.",
  },
  {
    icon: ShieldCheck,
    title: "Verified & Trusted",
    description:
      "Our moderation layer ensures every image on the platform meets quality and authenticity standards before it reaches the community.",
  },
  {
    icon: Zap,
    title: "Developer Ready",
    description:
      "A clean REST API with API key management lets developers integrate Picflux content into their own apps with minimal friction.",
  },
  {
    icon: Globe,
    title: "Open Exploration",
    description:
      "Browsing and downloading images is free and open to everyone. No paywall between people and great wildlife photography.",
  },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <PicfluxNav />
      <div className="mx-auto max-w-4xl px-4 pb-24 pt-32 sm:px-6">
        {/* Hero */}
        <div className="mb-16 text-center">
          <div className="mb-6 inline-flex size-16 items-center justify-center rounded-full bg-secondary text-secondary-foreground shadow-glow">
            <Camera className="size-8" />
          </div>
          <h1 className="font-display mb-4 text-5xl font-bold tracking-tight">About Picflux</h1>
          <p className="mx-auto max-w-xl text-base text-muted-foreground">
            A platform for animal photography enthusiasts and the developers who want to build with that content.
          </p>
        </div>

        {/* Mission */}
        <section className="glass-panel mb-12 rounded-2xl p-8">
          <h2 className="font-display mb-4 text-2xl font-bold">Our Mission</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Wildlife photography deserves a dedicated home. Picflux exists to give photographers a purpose-built space to
            share verified animal images, and to give developers a reliable API to power nature-focused applications.
            We&apos;re building the infrastructure layer for animal photography on the internet.
          </p>
        </section>

        {/* Values */}
        <section className="mb-16">
          <h2 className="font-display mb-8 text-2xl font-bold">What We Stand For</h2>
          <div className="grid gap-6 sm:grid-cols-2">
            {values.map(({ icon: Icon, title, description }) => (
              <div key={title} className="glass-panel rounded-2xl p-6">
                <div className="mb-4 inline-flex size-10 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                  <Icon className="size-5" />
                </div>
                <h3 className="mb-2 font-semibold">{title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Team */}
        <section className="glass-panel rounded-2xl p-8">
          <div className="mb-4 inline-flex size-10 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
            <Users className="size-5" />
          </div>
          <h2 className="font-display mb-4 text-2xl font-bold">The Team</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Picflux is built by a small, passionate team of developers and photographers. We care deeply about performance,
            simplicity, and the images themselves. If you have questions, ideas, or just want to say hi, reach out at{" "}
            <a href="mailto:hello@picflux.app" className="text-foreground underline underline-offset-4 hover:text-neon">
              hello@picflux.app
            </a>
            .
          </p>
        </section>
      </div>
    </main>
  );
}
