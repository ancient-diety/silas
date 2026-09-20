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
// CHECK LOGIN STATUS
// =================================

async function checkLogin() {

    const {
        data: { session }
    } = await supabaseClient.auth.getSession();

    const addLogSection =
        document.querySelector(".add-log-intro");

    const addLogCard =
        document.querySelector(".add-front-log-card");

    if (!addLogSection || !addLogCard) {
        return;
    }

    if (!session) {

        addLogSection.style.display = "none";
        addLogCard.style.display = "none";

        return;
    }

    addLogSection.style.display = "";
    addLogCard.style.display = "";
}


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

async function displayFrontLogs(logs) {

    const logList =
        document.querySelector(".front-log-list");

    if (!logList) {
        console.error("Could not find .front-log-list");
        return;
    }

    logList.innerHTML = "";


    // Check whether someone is logged in
    const {
        data: { session }
    } = await supabaseClient.auth.getSession();


    logs.forEach((log, index) => {

        const card =
            document.createElement("article");

        card.className = "front-log-card";


        card.innerHTML = `

            <div class="front-log-number">
                ${String(index + 1).padStart(2, "0")}
            </div>


            <div class="front-log-main">

                <div class="front-log-top">

    <div>

        <h3>${log.member}</h3>

        <p class="front-log-type">
            ${log.front_type || "Fronting"}
        </p>

    </div>

    <span class="front-log-date">
        ${formatDate(log.start_time)}
    </span>

</div>


                <p class="front-log-time">

                    ${formatTime(log.start_time)}

                    →

                    ${
                        log.end_time
                            ? formatTime(log.end_time)
                            : "Currently fronting"
                    }

                </p>


                <p
    class="front-log-duration"
    data-start="${log.start_time}"
    data-end="${log.end_time || ""}"
>
    ${calculateDuration(
        log.start_time,
        log.end_time
    )}
</p>

                ${
                    log.notes
                        ? `
                            <p class="front-log-notes">
                                ${log.notes}
                            </p>
                          `
                        : ""
                }


                ${
    session
        ? `
            <div class="front-log-actions">

                <button
                    type="button"
                    class="edit-front-button"
                    data-id="${log.id}"
                >
                    Edit front
                </button>

                <button
                    type="button"
                    class="remove-front-button"
                    data-id="${log.id}"
                >
                    Remove front
                </button>

            </div>
          `
        : ""
}

            </div>
        `;


        logList.appendChild(card);

    });


    // Add delete button listeners
    if (session) {

        const removeButtons =
            document.querySelectorAll(
                ".remove-front-button"
            );


        removeButtons.forEach((button) => {

            button.addEventListener("click", async () => {

                const logId =
                    button.dataset.id;


                const confirmed =
                    confirm(
                        "Remove this front log?"
                    );


                if (!confirmed) {
                    return;
                }


                button.disabled = true;
                button.textContent = "Removing...";


                const { error } =
    await supabaseClient
        .from("front_logs")
        .update({
            end_time: new Date().toISOString()
        })
        .eq("id", logId);


                if (error) {

                    console.error(
                        "Could not end front log:",
                        error
                    );

                    alert(
                        "Could not end this front log."
                    );

                    button.disabled = false;
                    button.textContent = "Remove front";

                    return;
                }


                // Reload the cards
                await loadFrontLogs();

            });

        });

    }

}


// =================================
// ADD FRONT LOG
// =================================

const frontLogForm =
    document.getElementById("front-log-form");


if (frontLogForm) {

    frontLogForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            const message =
                document.getElementById(
                    "front-log-message"
                );


            const member =
                document.getElementById(
                    "log-member"
                ).value.trim();

            const frontType =
               document.getElementById(
                    "log-type"
                ).value;


            const endTime =
                document.getElementById(
                    "log-end"
                ).value;


            const notes =
                document.getElementById(
                    "log-notes"
                ).value.trim();


            message.textContent = "Saving...";


            const {
                data: { session }
            } = await supabaseClient.auth.getSession();


            if (!session) {

                message.textContent =
                    "You must be logged in to add a front log.";

                return;
            }


            const { error } =
                await supabaseClient
                    .from("front_logs")
                    .insert({
    member: member,
    front_type: frontType,
start_time:
    new Date().toISOString(),

                        end_time:
                            endTime
                                ? new Date(
                                    endTime
                                  ).toISOString()
                                : null,

                        notes:
                            notes || null

                    });


            if (error) {

                console.error(
                    "Could not save front log:",
                    error
                );

                message.textContent =
                    "Could not save the front log.";

                return;
            }


            message.textContent =
                "Front log saved! ♡";


            frontLogForm.reset();


            await loadFrontLogs();

        }
    );

}


// =================================
// DATE FORMATTING
// =================================

function formatDate(dateString) {

    const date = new Date(dateString);

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

    const date = new Date(dateString);

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
        endString
            ? new Date(endString)
            : new Date();

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
        String(hours).padStart(2, "0");

    const paddedMinutes =
        String(minutes).padStart(2, "0");

    const paddedSeconds =
        String(seconds).padStart(2, "0");

    return `${paddedHours}:${paddedMinutes}:${paddedSeconds}`;

}

// =================================
// START
// =================================

checkLogin();
loadFrontLogs();


// =================================
// LIVE FRONTING STOPWATCH
// =================================

function updateLiveDurations() {

    const durationElements =
        document.querySelectorAll(
            ".front-log-duration"
        );

    durationElements.forEach((element) => {

        const start =
            element.dataset.start;

        const end =
            element.dataset.end;

        if (!start || end) {
            return;
        }

        element.textContent =
            calculateDuration(
                start,
                null
            );

    });

}


// Update immediately
updateLiveDurations();


// Update every second
setInterval(
    updateLiveDurations,
    1000
);
