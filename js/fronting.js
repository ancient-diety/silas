// =================================
// SUPABASE CONNECTION
// =================================

const SUPABASE_URL = "https://khyauwjpffmoaaqpgqac.supabase.co";
const SUPABASE_KEY = "sb_publishable_pj9MAWsA9oBry6sPge3vzw_uAW8YS7E";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);


// =================================
// LOAD FRONT LOGS
// =================================

async function loadFrontLogs() {

    const { data, error } = await supabaseClient
        .from("front_logs")
        .select("*")
        .order("start_time", { ascending: false });

    if (error) {
        console.error("Could not load front logs:", error);
        return;
    }

    console.log("Front logs:", data);
}


// =================================
// START
// =================================

loadFrontLogs();
