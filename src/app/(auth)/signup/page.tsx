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
      const params = new URLSearchParams(window.location.search);
      const next = params.get("next");
      if (next === "pricing") {
        router.push("/pricing");
      }
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
        <header className="border-b border-zinc-800/80 px-6 py-4">
          <Link href={ROUTES.home} className="flex items-center gap-2.5 w-fit">
            <div className="w-7 h-7 bg-[#6366f1] rounded-[7px] flex flex-col justify-center px-1.5 gap-1 shrink-0">
              <span className="block h-[2.5px] w-full bg-white rounded-full" />
              <span
                className="block h-[2.5px] bg-white rounded-full"
                style={{ width: "68%", opacity: 0.65 }}
              />
              <span
                className="block h-[2.5px] bg-white rounded-full"
                style={{ width: "83%", opacity: 0.35 }}
              />
            </div>
            <span className="text-sm font-semibold text-zinc-100">Helderly</span>
          </Link>
        </header>
        <div className="flex-1 flex items-center justify-center p-6">
          <Card className="w-full max-w-md rounded-[14px] border-zinc-800 bg-zinc-900/50">
            <CardHeader>
              <CardTitle className="text-xl text-zinc-50">Check your email</CardTitle>
              <CardDescription className="text-zinc-400">
                We sent a confirmation link to{" "}
                <strong className="text-zinc-300">{email}</strong>. Click the link
                to activate your account, then sign in.
              </CardDescription>
            </CardHeader>
            <CardFooter className="border-t border-zinc-800 pt-6">
              <Button asChild className="w-full">
                <Link href={ROUTES.login}>Back to sign in</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      <header className="border-b border-zinc-800/80 px-6 h-14 flex items-center justify-between">
        <Link href={ROUTES.home} className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-[#6366f1] rounded-[7px] flex flex-col justify-center px-1.5 gap-1 shrink-0">
            <span className="block h-[2.5px] w-full bg-white rounded-full" />
            <span
              className="block h-[2.5px] bg-white rounded-full"
              style={{ width: "68%", opacity: 0.65 }}
            />
            <span
              className="block h-[2.5px] bg-white rounded-full"
              style={{ width: "83%", opacity: 0.35 }}
            />
          </div>
          <span className="text-sm font-semibold text-zinc-100">Helderly</span>
        </Link>
      </header>

      <div className="flex-1 flex items-center justify-center p-6">
        <Card className="w-full max-w-md rounded-[14px] border-zinc-800 bg-zinc-900/50">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-xl text-zinc-50">Create account</CardTitle>
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
                  "flex-1 flex flex-col items-center gap-2 rounded-[12px] border p-4 text-sm font-medium transition-all",
                  role === "client"
                    ? "border-[#6366f1]/50 bg-[#6366f1]/10 text-[#818cf8]"
                    : "border-zinc-700 bg-transparent text-zinc-400 hover:border-zinc-600 hover:text-zinc-200"
                )}
              >
                <User className="h-4 w-4" />
                Klant
              </button>
              <button
                type="button"
                onClick={() => setRole("freelancer")}
                className={cn(
                  "flex-1 flex flex-col items-center gap-2 rounded-[12px] border p-4 text-sm font-medium transition-all",
                  role === "freelancer"
                    ? "border-[#6366f1]/50 bg-[#6366f1]/10 text-[#818cf8]"
                    : "border-zinc-700 bg-transparent text-zinc-400 hover:border-zinc-600 hover:text-zinc-200"
                )}
              >
                <Briefcase className="h-4 w-4" />
                Freelancer
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mailadres</Label>
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
                <Label htmlFor="password">Wachtwoord</Label>
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
                <Link
                  href={ROUTES.privacy}
                  className="text-zinc-400 hover:underline underline-offset-4"
                >
                  Privacyverklaring
                </Link>{" "}
                en{" "}
                <Link
                  href={ROUTES.cookies}
                  className="text-zinc-400 hover:underline underline-offset-4"
                >
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
              Al een account?{" "}
              <Link
                href={ROUTES.login}
                className="text-zinc-100 hover:underline underline-offset-4"
              >
                Inloggen
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
