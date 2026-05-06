"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Camera, Eye, EyeOff, Loader2 } from "lucide-react";

import { useAuth } from "../../context/auth";
import { ApiError } from "../../lib/api";
import { Button } from "../../components/ui/button";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

const schema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    setServerError(null);
    try {
      await login(values.email, values.password);
      router.push("/dashboard");
    } catch (err) {
      setServerError(err instanceof ApiError ? err.message : "Login failed");
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="glass-panel rounded-3xl p-8">
          <div className="mb-8 flex flex-col items-center gap-3">
            <Link href="/" className="flex size-14 items-center justify-center rounded-full bg-secondary text-secondary-foreground shadow-glow">
              <Camera className="size-7" />
            </Link>
            <h1 className="hero-gradient-text font-display text-2xl font-black tracking-normal">Picflux</h1>
            <h1 className="font-display text-3xl font-black text-foreground">Welcome back!</h1>
            <p className="text-sm text-muted-foreground">Sign in to your Picflux account</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-foreground" htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                className="w-full rounded-2xl border border-border bg-glass px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary"
                {...register("email")}
              />
              {errors.email && <p className="text-xs text-red-400">{errors.email.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-foreground" htmlFor="password">Password</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full rounded-2xl border border-border bg-glass px-4 py-3 pr-12 text-sm text-foreground placeholder:text-muted-foreground focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary"
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-400">{errors.password.message}</p>}
            </div>

            {serverError && (
              <p className="rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-400">
                {serverError}
              </p>
            )}

            <Button type="submit" variant="hero" className="w-full" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="animate-spin" />}
              Sign in
            </Button>
          </form>

          <div className="mt-5 flex items-center gap-3">
            <span className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">or</span>
            <span className="h-px flex-1 bg-border" />
          </div>

          <a
            href={`${API_BASE}/auth/google`}
            className="mt-4 flex w-full items-center justify-center gap-3 rounded-2xl border border-border bg-glass px-4 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-border/40"
          >
            <svg className="size-5" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </a>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            New to Picflux?{" "}
            <Link href="/register" className="font-semibold text-neon hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
