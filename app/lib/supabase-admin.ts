import { createClient } from "@supabase/supabase-js";

// Server-side Supabase client with service role key for admin operations
// This file should only be imported in server-side code (API routes, server components)
// Service role key bypasses RLS policies
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

