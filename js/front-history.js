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
// LOAD FRONT HISTORY
// =================================

async function loadFrontHistory() {

    const historyList =
        document.getElementById(
            "front-history-list"
        );

    if (!historyList) {
        return;
    }


    const {
        data,
        error
    } = await supabaseClient
        .from("front_logs")
        .select("*")
        .not("end_time", "is", null)
        .order("start_time", {
            ascending: false
        });


    if (error) {

        console.error(
            "Could not load front history:",
            error
        );

        historyList.innerHTML = `
            <p class="history-loading">
                Could not load front history.
            </p>
        `;

        return;
    }


    console.log(
        "Front history:",
        data
    );


    displayFrontHistory(data);

}


// =================================
// DISPLAY FRONT HISTORY
// =================================

function displayFrontHistory(logs) {

    const historyList =
        document.getElementById(
            "front-history-list"
        );


    if (!historyList) {
        return;
    }


    // No ended fronts yet
    if (!logs.length) {

        historyList.innerHTML = `
            <p class="history-loading">
                No ended fronts yet.
            </p>
        `;

        return;
    }


    historyList.innerHTML = "";


    logs.forEach((log, index) => {

        const card =
            document.createElement(
                "article"
            );


        card.className =
            "history-card";


        card.innerHTML = `

            <div class="history-number">
                ${String(index + 1).padStart(2, "0")}
            </div>


            <div class="history-card-main">

                <div class="history-card-top">

                    <div>

                        <h3>
                            ${log.member}
                        </h3>

                        <p class="history-card-type">
                            ${log.front_type || "Fronting"}
                        </p>

                    </div>


                    <span class="history-card-date">
                        ${formatDate(log.start_time)}
                    </span>

                </div>


                <p class="history-card-time">

                    ${formatTime(log.start_time)}

                    →

                    ${formatTime(log.end_time)}

                </p>


                <p class="history-card-duration">

                    ${calculateDuration(
                        log.start_time,
                        log.end_time
                    )}

                </p>


                ${
                    log.notes
                        ? `
                            <p class="history-card-notes">
                                ${log.notes}
                            </p>
                          `
                        : ""
                }

            </div>

        `;


        historyList.appendChild(card);

    });

}


// =================================
// DATE FORMATTING
// =================================

function formatDate(dateString) {

    const date =
        new Date(dateString);


    return date.toLocaleDateString(
        "en-GB",
        {
            day: "numeric",
            month: "long",
            year: "numeric"
        }
    );

}


// =================================
// TIME FORMATTING
// =================================

function formatTime(dateString) {

    const date =
        new Date(dateString);


    return date.toLocaleTimeString(
        "en-GB",
        {
            hour: "2-digit",
            minute: "2-digit"
        }
    );

}


// =================================
// DURATION
// =================================

function calculateDuration(
    startString,
    endString
) {

    const start =
        new Date(startString);


    const end =
        new Date(endString);


    const difference =
        Math.max(
            0,
            end - start
        );


    const totalSeconds =
        Math.floor(
            difference / 1000
        );


    const hours =
        Math.floor(
            totalSeconds / 3600
        );


    const minutes =
        Math.floor(
            (totalSeconds % 3600) / 60
        );


    const seconds =
        totalSeconds % 60;


    const paddedHours =
        String(hours).padStart(
            2,
            "0"
        );


    const paddedMinutes =
        String(minutes).padStart(
            2,
            "0"
        );


    const paddedSeconds =
        String(seconds).padStart(
            2,
            "0"
        );


    return `${paddedHours}:${paddedMinutes}:${paddedSeconds}`;

}


// =================================
// START
// =================================

loadFrontHistory();
