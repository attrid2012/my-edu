// Education at Glance — Supabase configuration

// Put your Supabase Project URL here.
const SUPABASE_URL =https://jhnwoaldzupnhnvpvuss.supabase.co;

// Put your Supabase publishable/anon key here.
// NEVER put a service_role/secret key here.
const SUPABASE_KEY =
   sb_publishable_MS9rifk9rRBPx9yJ3JrD2g_JpDYs6Go;


const supabaseClient =
    supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );
