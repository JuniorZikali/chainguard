import { createClient } from '@supabase/supabase-js';

// 1. Standard Client (For client-side components and public access)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 2. Admin Client (For server-side API routes ONLY)
// This uses the Service Role Key to bypass Row Level Security.
// NEVER export or use this inside your frontend /components!
export function getServerSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    console.error("Missing Supabase Admin credentials in .env.local");
    throw new Error("Server configuration error");
  }

  return createClient(url, serviceKey);
}