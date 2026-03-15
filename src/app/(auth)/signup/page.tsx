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
import { Briefcase, User } from "lucide-react";
import { cn } from "@/lib/utils";

type Role = "client" | "freelancer";

export default function SignUpPage() {
  const router = useRouter();
  const [role, setRole] = useState<Role>("client");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const supabase = createClient();
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { role: role === "freelancer" ? "admin" : "client" },
        },
      });
      if (signUpError) {
        setError(signUpError.message);
        return;
      }
      setSuccess(true);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <Card className="border-zinc-800 bg-zinc-900/30">
        <CardHeader>
          <CardTitle className="text-xl">Check your email</CardTitle>
          <CardDescription className="text-zinc-400">
            We sent a confirmation link to <strong className="text-zinc-300">{email}</strong>.
            Click the link to activate your account, then sign in.
          </CardDescription>
        </CardHeader>
        <CardFooter className="border-t border-zinc-800 pt-6">
          <Button asChild className="w-full">
            <Link href={ROUTES.login}>Back to sign in</Link>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="border-zinc-800 bg-zinc-900/30">
      <CardHeader className="space-y-1 text-center">
        <Link
          href={ROUTES.home}
          className="text-2xl font-semibold text-zinc-50 block mb-2"
        >
          Helderly
        </Link>
        <CardTitle className="text-xl">Create account</CardTitle>
        <CardDescription className="text-zinc-400">
          Choose your account type and set your credentials.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex rounded-lg border border-zinc-800 p-1 bg-zinc-900/50">
          <button
            type="button"
            onClick={() => setRole("client")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 rounded-md py-2 text-sm font-medium transition-colors",
              role === "client"
                ? "bg-zinc-700 text-zinc-50"
                : "text-zinc-400 hover:text-zinc-100"
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
                ? "bg-zinc-700 text-zinc-50"
                : "text-zinc-400 hover:text-zinc-100"
            )}
          >
            <Briefcase className="h-4 w-4" />
            Freelancer
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
              minLength={6}
            />
            <p className="text-xs text-zinc-500">At least 6 characters.</p>
          </div>
          {error && (
            <p className="text-sm text-red-400" role="alert">
              {error}
            </p>
          )}
          <p className="text-xs text-zinc-500">
            Door een account aan te maken ga je akkoord met onze{" "}
            <Link href={ROUTES.privacy} className="text-zinc-400 hover:underline underline-offset-4">
              Privacyverklaring
            </Link>{" "}
            en{" "}
            <Link href={ROUTES.cookies} className="text-zinc-400 hover:underline underline-offset-4">
              Cookiebeleid
            </Link>
            .
          </p>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating account…" : "Create account"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center border-t border-zinc-800 pt-6">
        <p className="text-sm text-zinc-400">
          Already have an account?{" "}
          <Link
            href={ROUTES.login}
            className="text-zinc-100 hover:underline underline-offset-4"
          >
            Sign in
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
