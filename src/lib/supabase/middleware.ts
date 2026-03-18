import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { ROUTES, TRIAL_DAYS } from "@/lib/constants";
import { isOwnerEmail } from "@/lib/owner";

function isTrialExpired(profile: { trial_starts_at: string | null; subscription_status: string } | null): boolean {
  if (!profile) return true;
  if (profile.subscription_status === "active") return false;
  const startsAt = profile.trial_starts_at ? new Date(profile.trial_starts_at).getTime() : null;
  if (!startsAt) return false;
  const elapsedDays = (Date.now() - startsAt) / (1000 * 60 * 60 * 24);
  return elapsedDays > TRIAL_DAYS;
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isDashboardRoute = request.nextUrl.pathname.startsWith(ROUTES.dashboard);
  const isAuthRoute =
    request.nextUrl.pathname === ROUTES.login ||
    request.nextUrl.pathname === ROUTES.signUp;
  const isBillingRoute = request.nextUrl.pathname === ROUTES.billing;
  const isOwnerRoute = request.nextUrl.pathname.startsWith(ROUTES.owner);

  if (isOwnerRoute) {
    if (!user) {
      const loginUrl = new URL(ROUTES.login, request.url);
      loginUrl.searchParams.set("next", request.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (!isOwnerEmail(user.email)) {
      return NextResponse.redirect(new URL(ROUTES.dashboard, request.url));
    }
  }

  if (isDashboardRoute && !user) {
    const loginUrl = new URL(ROUTES.login, request.url);
    loginUrl.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isDashboardRoute && user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("trial_starts_at, subscription_status, role")
      .eq("user_id", user.id)
      .single();

    const isFreelancer = profile?.role === "admin";
    if (isFreelancer && isTrialExpired(profile)) {
      const billingUrl = new URL(ROUTES.billing, request.url);
      billingUrl.searchParams.set("next", request.nextUrl.pathname);
      return NextResponse.redirect(billingUrl);
    }
  }

  if (isBillingRoute && !user) {
    return NextResponse.redirect(new URL(ROUTES.login, request.url));
  }

  if (isAuthRoute && user) {
    const dashboardUrl = new URL(ROUTES.dashboard, request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return supabaseResponse;
}
