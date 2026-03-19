import { LoginForm } from "@/components/auth/login-form";
import Link from "next/link";
import { ROUTES } from "@/lib/constants";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      {/* Header met logo */}
      <header className="border-b border-zinc-800/80 px-6 py-4">
        <Link href={ROUTES.home} className="flex items-center gap-2.5 w-fit">
          <div className="w-7 h-7 bg-[#6366f1] rounded-[7px] flex flex-col justify-center px-1.5 gap-1 shrink-0">
            <span className="block h-[2.5px] w-full bg-white rounded-full" />
            <span className="block h-[2.5px] bg-white rounded-full" style={{ width: "68%", opacity: 0.65 }} />
            <span className="block h-[2.5px] bg-white rounded-full" style={{ width: "83%", opacity: 0.35 }} />
          </div>
          <span className="text-sm font-semibold text-zinc-100">Helderly</span>
        </Link>
      </header>
      {/* Form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
