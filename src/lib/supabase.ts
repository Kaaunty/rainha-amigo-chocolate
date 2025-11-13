import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl: string =
  import.meta.env.VITE_SUPABASE_URL ||
  "https://ebwsbboixpyafrritktv.supabase.co";
const supabaseAnonKey: string =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVid3NiYm9peHB5YWZycml0a3R2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMwNTYzOTgsImV4cCI6MjA3ODYzMjM5OH0.8y819EAMBPQju2cqhq6Gh6tvFlRbZ0zEqMJAkEL9flo";

export const supabase: SupabaseClient = createClient(
  supabaseUrl,
  supabaseAnonKey
);
