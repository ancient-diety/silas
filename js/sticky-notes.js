const SUPABASE_URL =
    "https://khyauwjpffmoaaqpgqac.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_pj9MAWsA9oBry6sPge3vzw_uAW8YS7E";

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );


async function checkLogin() {

    const makeNoteButton =
        document.getElementById("make-note-button");

    if (!makeNoteButton) return;

    const {
        data: { session }
    } = await supabaseClient.auth.getSession();

    if (!session) {
        makeNoteButton.style.display = "none";
    }
}


checkLogin();
