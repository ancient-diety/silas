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

    displayFrontLogs(data);
}


// =================================
// DISPLAY FRONT LOGS
// =================================

function displayFrontLogs(logs) {

    const logList = document.querySelector(".front-log-list");

    if (!logList) {
        console.error("Could not find .front-log-list");
        return;
    }

    logList.innerHTML = "";

    logs.forEach((log, index) => {

        const card = document.createElement("article");
        card.className = "front-log-card";

        card.innerHTML = `
            <div class="front-log-number">
                ${String(index + 1).padStart(2, "0")}
            </div>

            <div class="front-log-main">

                <div class="front-log-top">
                    <h3>${log.member}</h3>
                    <span class="front-log-date">
                        ${formatDate(log.start_time)}
                    </span>
                </div>

                <p class="front-log-time">
                    ${formatTime(log.start_time)}
                    →
                    ${log.end_time ? formatTime(log.end_time) : "Currently fronting"}
                </p>

                <p class="front-log-duration">
                    ${calculateDuration(log.start_time, log.end_time)}
                </p>

            </div>
        `;

        logList.appendChild(card);
    });
}


// =================================
// DATE FORMATTING
// =================================

function formatDate(dateString) {

    const date = new Date(dateString);

    return date.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric"
    });
}


// =================================
// TIME FORMATTING
// =================================

function formatTime(dateString) {

    const date = new Date(dateString);

    return date.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit"
    });
}


// =================================
// DURATION
// =================================

function calculateDuration(startString, endString) {

    if (!endString) {
        return "Still fronting";
    }

    const start = new Date(startString);
    const end = new Date(endString);

    const difference = end - start;

    const totalMinutes = Math.floor(difference / 60000);

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours === 0) {
        return `Duration: ${minutes}m`;
    }

    if (minutes === 0) {
        return `Duration: ${hours}h`;
    }

    return `Duration: ${hours}h ${minutes}m`;
}


// =================================
// START
// =================================

loadFrontLogs();
