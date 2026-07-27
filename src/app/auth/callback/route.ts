import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Resolve the production-safe base URL for redirect responses after the
 * OAuth callback.  Precedence:
 *   1. x-forwarded-host header (Vercel / reverse proxy)
 *   2. x-forwarded-proto + x-forwarded-host
 *   3. NEXT_PUBLIC_SITE_URL env var
 *   4. origin from the incoming request URL
 */
function getRedirectOrigin(request: Request): string {
  const forwardedProto = request.headers.get("x-forwarded-proto");
  const forwardedHost = request.headers.get("x-forwarded-host");

  if (forwardedProto && forwardedHost) {
    return `${forwardedProto}://${forwardedHost}`;
  }

  if (forwardedHost) {
    return `https://${forwardedHost}`;
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (siteUrl) {
    return siteUrl.replace(/\/+$/, "");
  }

  return new URL(request.url).origin;
}

/**
 * Supabase SSR Auth Callback Route Handler for Next.js App Router.
 * Exchanges the PKCE auth code for session tokens and redirects the user
 * to the intended destination.  Works in development, production, and
 * behind Vercel / custom reverse proxies.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const origin = getRedirectOrigin(request);
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  const origin = getRedirectOrigin(request);
  return NextResponse.redirect(`${origin}/login?error=oauth_callback_failed`);
}
