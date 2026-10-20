import { createClient } from "@supabase/supabase-js";

const FALLBACK_URL = "https://bzgtchffxmkkdsctrdtq.supabase.co";
const FALLBACK_SERVICE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ6Z3RjaGZmeG1ra2RzY3RyZHRxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MTg4Mjc2MCwiZXhwIjoyMTA3NDU4NzYwfQ.jZqTlu0O4ZAl5DEtL5JGiKOi4ENzzqYW8hg-m5onrF4";

export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || FALLBACK_URL;
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    FALLBACK_SERVICE_KEY;

  return createClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
