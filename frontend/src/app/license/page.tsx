import type { Metadata } from "next";

import { PicfluxNav } from "../../components/picflux/PicfluxNav";

export const metadata: Metadata = {
  title: "License — Picflux",
  description: "License terms and conditions for using Picflux and its content.",
};

export default function LicensePage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <PicfluxNav />
      <div className="mx-auto max-w-5xl px-4 pb-24 pt-32 sm:px-6">
        <h1 className="font-display mb-2 text-4xl font-bold tracking-tight">License</h1>
        <p className="mb-10 text-sm text-muted-foreground">Last updated: May 3, 2026</p>

        <section className="space-y-8 text-sm leading-relaxed text-muted-foreground">
          <div>
            <h2 className="mb-3 text-base font-semibold text-foreground">1. Content License</h2>
            <p>
              All images uploaded to Picflux remain the intellectual property of their respective uploaders. By uploading
              content to Picflux, you grant Picflux a non-exclusive, worldwide, royalty-free license to host, display,
              and distribute your content solely for the purpose of operating the platform.
            </p>
          </div>

          <div>
            <h2 className="mb-3 text-base font-semibold text-foreground">2. API Usage</h2>
            <p>
              Access to the Picflux API is governed by your API key tier. You may use the API to retrieve and integrate
              publicly available images into your own applications, provided you comply with the attribution requirements
              and rate limits associated with your plan.
            </p>
          </div>

          <div>
            <h2 className="mb-3 text-base font-semibold text-foreground">3. Prohibited Use</h2>
            <p>
              You may not use Picflux content for training machine learning models, reselling images without explicit
              permission from the original uploader, or for any unlawful purpose.
            </p>
          </div>

          <div>
            <h2 className="mb-3 text-base font-semibold text-foreground">4. Platform Software</h2>
            <p>
              The Picflux platform software is proprietary. Unauthorised copying, modification, distribution, or reverse
              engineering of the platform is strictly prohibited.
            </p>
          </div>

          <div>
            <h2 className="mb-3 text-base font-semibold text-foreground">5. Disclaimer</h2>
            <p>
              Picflux is provided &quot;as is&quot; without warranty of any kind. We are not liable for any damages arising from
              the use or inability to use the platform.
            </p>
          </div>

          <div>
            <h2 className="mb-3 text-base font-semibold text-foreground">6. Contact</h2>
            <p>
              Questions regarding this license may be directed to{" "}
              <a href="mailto:legal@picflux.app" className="text-foreground underline underline-offset-4 hover:text-neon">
                legal@picflux.app
              </a>
              .
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
