import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Official Supabase SSR Auth Callback Route Handler for Next.js App Router.
 * Reads PKCE code verifier cookies sent by browser, exchanges auth code for session tokens,
 * sets auth cookies on the response, and redirects to destination.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const forwardedHost = request.headers.get("x-forwarded-host");
      const isLocalEnv = process.env.NODE_ENV === "development";

      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`);
      }

      if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Return user to login with error feedback if callback fails
  return NextResponse.redirect(`${origin}/login?error=oauth_callback_failed`);
}
