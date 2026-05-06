"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckCircle2, ImageIcon, Loader2, Tag, Upload, X } from "lucide-react";

import { Button } from "../../../components/ui/button";
import { useAuth } from "../../../context/auth";
import { apiFetch, ApiError } from "../../../lib/api";
import type { MyImage } from "../../../types/api";

const schema = z.object({
  title: z.string().max(120).optional(),
  location: z.string().max(120).optional(),
  tags: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

export default function UploadPage() {
  const { user } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [uploaded, setUploaded] = useState<MyImage | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  function clearFile() {
    setFile(null);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function resetAll() {
    setUploaded(null);
    clearFile();
    reset();
    setServerError(null);
  }

  async function onSubmit(values: FormValues) {
    if (!file) { setServerError("Please select an image file."); return; }
    setServerError(null);
    const form = new FormData();
    form.append("image", file);
    if (values.title) form.append("title", values.title);
    if (values.location) form.append("location", values.location);
    if (values.tags) form.append("tags", values.tags);
    try {
      const result = await apiFetch<MyImage>("/images/upload", { method: "POST", body: form });
      setUploaded(result);
    } catch (err) {
      setServerError(err instanceof ApiError ? err.message : "Upload failed");
    }
  }

  if (!user) return null;

  if (uploaded) {
    return (
      <section className="flex flex-col items-center py-16 text-center">
        <CheckCircle2 className="size-14 text-neon" />
        <h2 className="mt-4 font-display text-2xl font-black text-foreground">Upload submitted!</h2>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          Your image is pending admin review. You can track its status in My Gallery.
        </p>
        <div className="mt-6 flex gap-3">
          <Button variant="hero" onClick={() => router.push("/dashboard")}>
            View My Gallery
          </Button>
          <Button variant="glass" onClick={resetAll}>
            Upload another
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl">
      <div className="mb-8">
        <p className="text-xs font-bold uppercase tracking-wider text-neon">Upload</p>
        <h1 className="mt-1 font-display text-3xl font-black">Submit an image</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Images are reviewed before they appear in the public gallery.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Drop zone */}
        <div>
          {!preview ? (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="glass-panel flex w-full flex-col items-center gap-4 rounded-3xl border-2 border-dashed border-border p-12 transition-colors hover:border-secondary"
            >
              <div className="flex size-16 items-center justify-center rounded-full bg-secondary/20 text-secondary">
                <ImageIcon className="size-8" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-foreground">Click to select image</p>
                <p className="mt-1 text-sm text-muted-foreground">JPEG, PNG, WebP supported</p>
              </div>
            </button>
          ) : (
            <div className="relative overflow-hidden rounded-3xl border border-border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview} alt="Preview" className="h-72 w-full object-cover" />
              <button
                type="button"
                onClick={clearFile}
                className="absolute right-3 top-3 flex size-8 items-center justify-center rounded-full bg-background/80 text-foreground backdrop-blur-sm hover:bg-background"
              >
                <X className="size-4" />
              </button>
              <div className="absolute bottom-3 left-3 rounded-full border border-border bg-glass px-3 py-1 text-xs font-semibold text-foreground backdrop-blur-sm">
                {file?.name}
              </div>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={onFileChange}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-foreground" htmlFor="up-title">
            Title <span className="font-normal text-muted-foreground">(optional)</span>
          </label>
          <input
            id="up-title"
            type="text"
            placeholder="Mountain Sunset"
            className="w-full rounded-2xl border border-border bg-glass px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary"
            {...register("title")}
          />
          {errors.title && <p className="text-xs text-red-400">{errors.title.message}</p>}
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-foreground" htmlFor="up-location">
            Location <span className="font-normal text-muted-foreground">(optional)</span>
          </label>
          <input
            id="up-location"
            type="text"
            placeholder="Alps, Switzerland"
            className="w-full rounded-2xl border border-border bg-glass px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary"
            {...register("location")}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-foreground" htmlFor="up-tags">
            <Tag className="mr-1 inline size-4" />
            Tags <span className="font-normal text-muted-foreground">(comma-separated)</span>
          </label>
          <input
            id="up-tags"
            type="text"
            placeholder="nature, sunset, wildlife"
            className="w-full rounded-2xl border border-border bg-glass px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary"
            {...register("tags")}
          />
        </div>

        {serverError && (
          <p className="rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-400">
            {serverError}
          </p>
        )}

        <Button
          type="submit"
          variant="hero"
          size="lg"
          className="w-full"
          disabled={isSubmitting || !file}
        >
          {isSubmitting ? <Loader2 className="animate-spin" /> : <Upload />}
          Submit for review
        </Button>
      </form>
    </section>
  );
}
