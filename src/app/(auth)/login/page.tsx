"use client";

import { LoginForm } from "@/components/auth/login-form";
import Link from "next/link";
import { ROUTES } from "@/lib/constants";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      <header className="border-b border-zinc-800/80 px-6 h-14 flex items-center justify-between">
        <Link href={ROUTES.home} className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-[#6366f1] rounded-[7px] flex flex-col justify-center px-1.5 gap-1 shrink-0">
            <span className="block h-[2.5px] w-full bg-white rounded-full" />
            <span className="block h-[2.5px] bg-white rounded-full" style={{ width: "68%", opacity: 0.65 }} />
            <span className="block h-[2.5px] bg-white rounded-full" style={{ width: "83%", opacity: 0.35 }} />
          </div>
          <span className="text-sm font-semibold text-zinc-100">Helderly</span>
        </Link>
        <Link href={ROUTES.signUp} className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">
          Nog geen account? <span className="text-[#6366f1]">Aanmelden →</span>
        </Link>
      </header>
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
