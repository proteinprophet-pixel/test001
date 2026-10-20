import { createBrowserClient } from "@supabase/ssr";

const FALLBACK_URL = "https://bzgtchffxmkkdsctrdtq.supabase.co";
const FALLBACK_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ6Z3RjaGZmeG1ra2RzY3RyZHRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE4ODI3NjAsImV4cCI6MjEwNzQ1ODc2MH0.4CrkdfhIPg4dGBz2vnPRu0lyot6J9GjpfuPRRHcLQ_c";

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || FALLBACK_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || FALLBACK_ANON_KEY;

  return createBrowserClient(url, anonKey);
}
