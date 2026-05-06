"use client";

function DocBadge({ method }: { method: string }) {
  const colors: Record<string, string> = {
    GET: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    POST: "bg-green-500/15 text-green-400 border-green-500/30",
    DELETE: "bg-red-500/15 text-red-400 border-red-500/30",
  };
  return (
    <span
      className={`inline-block rounded-md border px-2 py-0.5 font-mono text-xs font-bold ${colors[method] ?? "bg-glass text-foreground"}`}
    >
      {method}
    </span>
  );
}

function DocEndpoint({
  method,
  path,
  description,
  auth,
  children,
}: {
  method: string;
  path: string;
  description: string;
  auth?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-glass/30 p-5">
      <div className="flex flex-wrap items-center gap-2">
        <DocBadge method={method} />
        <code className="font-mono text-sm font-semibold text-foreground">{path}</code>
        {auth && (
          <span className="ml-auto rounded-full border border-border bg-glass px-2.5 py-0.5 text-xs text-muted-foreground">
            {auth}
          </span>
        )}
      </div>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
}

function DocCode({ code }: { code: string }) {
  return (
    <pre className="overflow-x-auto rounded-xl border border-border bg-background/60 p-4 text-xs text-neon">
      <code>{code}</code>
    </pre>
  );
}

function DocTable({ rows }: { rows: [string, string, string][] }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border text-xs">
      <table className="w-full">
        <thead className="border-b border-border bg-glass">
          <tr>
            <th className="px-4 py-2 text-left font-semibold text-muted-foreground">Parameter</th>
            <th className="px-4 py-2 text-left font-semibold text-muted-foreground">Type</th>
            <th className="px-4 py-2 text-left font-semibold text-muted-foreground">
              Description
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([name, type, desc]) => (
            <tr key={name} className="border-b border-border last:border-0">
              <td className="px-4 py-2 font-mono text-neon">{name}</td>
              <td className="px-4 py-2 text-muted-foreground">{type}</td>
              <td className="px-4 py-2 text-foreground">{desc}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function ApiDocsPage() {
  return (
    <section className="space-y-10 pb-16 mx-auto max-w-7xl">
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-neon">API</p>
        <h1 className="mt-1 font-display text-3xl font-black">Documentation</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Base URL: <code className="text-neon">http://api.picflux.io</code>
        </p>
      </div>

      {/* Authentication */}
      <div className="space-y-3">
        <h2 className="font-display text-lg font-bold">Authentication</h2>
        <div className="rounded-2xl border border-border bg-glass/30 p-5 text-sm">
          <p className="text-muted-foreground">
            All API endpoints require an API key. Pass it as a Bearer token in the{" "}
            <code className="text-neon">Authorization</code> header:
          </p>
          <div className="mt-4">
            <DocCode code={`Authorization: Bearer pfx_xxxxxxxxxxxx`} />
          </div>
          <p className="mt-3 text-muted-foreground">
            Generate and manage your keys on the{" "}
            <span className="font-semibold text-foreground">API Keys</span> page.
          </p>
        </div>
      </div>

      {/* Upload */}
      <div className="space-y-3">
        <h2 className="font-display text-lg font-bold">Images</h2>

        <DocEndpoint
          method="POST"
          path="/api/v1/images"
          auth="API key"
          description="Upload an image programmatically. The image is stored with pending status until an admin approves it."
        >
          <DocTable
            rows={[
              ["image", "file", "Image file (JPEG, PNG, WebP, etc.) — required"],
              ["title", "string", "Optional title (max 120 chars)"],
              ["location", "string", "Optional location label"],
              ["tags", "string | string[]", "Comma-separated string or repeated field"],
            ]}
          />
          <div className="mt-4">
            <p className="mb-2 text-xs font-semibold text-muted-foreground">Example</p>
            <DocCode
              code={`curl -X POST http://api.picflux.io/api/v1/images \\
  -H "Authorization: Bearer pfx_xxxxxxxxxxxx" \\
  -F "image=@photo.jpg" \\
  -F "title=Mountain Sunset" \\
  -F "tags=nature,sunset"`}
            />
          </div>
        </DocEndpoint>

        <DocEndpoint
          method="GET"
          path="/api/v1/images/:id/download"
          auth="API key"
          description="Returns a presigned download URL for the specified image. Rate limits are applied for API key holders."
        />
      </div>
    </section>
  );
}
