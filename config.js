// Education at Glance — Supabase configuration

// Put your Supabase Project URL here.
const SUPABASE_URL = "YOUR_SUPABASE_URL";

// Put your Supabase publishable/anon key here.
// NEVER put a service_role/secret key here.
const SUPABASE_KEY =
    "YOUR_SUPABASE_PUBLISHABLE_OR_ANON_KEY";


const supabaseClient =
    supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );
