"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { ROUTES } from "@/lib/constants";
import { Briefcase, User, Mail } from "lucide-react";
import { cn } from "@/lib/utils";

type Role = "client" | "freelancer";

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<Role>("client");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [magicSent, setMagicSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInError) {
        setError(signInError.message);
        return;
      }
      router.push(ROUTES.dashboard);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const supabase = createClient();
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: typeof window !== "undefined" ? `${window.location.origin}${ROUTES.dashboard}` : undefined,
        },
      });
      if (otpError) {
        setError(otpError.message);
        return;
      }
      setMagicSent(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="rounded-[12px] border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/80">
      <CardHeader className="space-y-1 text-center">
        <Link
          href={ROUTES.home}
          className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 block mb-2"
        >
          Helderly
        </Link>
        <CardTitle className="text-xl text-zinc-900 dark:text-zinc-50">Sign in</CardTitle>
        <CardDescription className="text-zinc-500 dark:text-zinc-400">
          Choose your account type. Use a magic link for password-free sign-in.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex rounded-lg border border-zinc-200 dark:border-zinc-800 p-1 bg-zinc-50 dark:bg-zinc-900/50">
          <button
            type="button"
            onClick={() => setRole("client")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 rounded-md py-2 text-sm font-medium transition-colors",
              role === "client"
                ? "bg-[var(--primary-accent)] text-white"
                : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
            )}
          >
            <User className="h-4 w-4" />
            Client
          </button>
          <button
            type="button"
            onClick={() => setRole("freelancer")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 rounded-md py-2 text-sm font-medium transition-colors",
              role === "freelancer"
                ? "bg-[var(--primary-accent)] text-white"
                : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
            )}
          >
            <Briefcase className="h-4 w-4" />
            Freelancer
          </button>
        </div>

        {magicSent ? (
          <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-300">
            Check your email for the sign-in link. Click it to open the dashboard.
          </div>
        ) : (
          <>
            <form onSubmit={handleMagicLink} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="rounded-lg border-zinc-200 dark:border-zinc-800"
                />
              </div>
              <Button
                type="submit"
                variant="outline"
                className="w-full rounded-lg border-zinc-200 dark:border-zinc-700"
                disabled={loading}
              >
                <Mail className="h-4 w-4 mr-2" />
                {loading ? "Sending…" : "Send magic link"}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-zinc-200 dark:border-zinc-800" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white dark:bg-zinc-900 px-2 text-zinc-500">or sign in with password</span>
              </div>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="rounded-lg border-zinc-200 dark:border-zinc-800"
                />
              </div>
              {error && (
                <p className="text-sm text-red-500" role="alert">
                  {error}
                </p>
              )}
              <Button
                type="submit"
                className="w-full rounded-lg bg-[var(--primary-accent)] hover:opacity-90"
                disabled={loading}
              >
                {loading ? "Signing in…" : "Sign in"}
              </Button>
            </form>
          </>
        )}
      </CardContent>
      <CardFooter className="flex justify-center border-t border-zinc-200 dark:border-zinc-800 pt-6">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Don&apos;t have an account?{" "}
          <Link
            href={ROUTES.signUp}
            className="text-[var(--primary-accent)] hover:underline underline-offset-4"
          >
            Sign up
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
