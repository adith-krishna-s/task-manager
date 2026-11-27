
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

// Supabase project credentials
const SUPABASE_URL = "https://nbncyruvqdwhlzpzizoi.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_1SYovFiwZa7n1nNKFvBCLA_5ZPL1qgi";

// Create Supabase connection
export const supabase = createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);
