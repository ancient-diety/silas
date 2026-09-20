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

    const addFrontSection =
        document.querySelector(".add-front-section");

    if (!addFrontSection) {
        return;
    }

    if (!session) {
        addFrontSection.style.display = "none";
        return;
    }

    addFrontSection.style.display = "";
}


// =================================
// LOAD FRONT LOGS
// =================================

async function loadFrontLogs() {

    const { data, error } = await supabaseClient
        .from("front_logs")
        .select("*")
        .is("end_time", null)
        .order("start_time", { ascending: false });

    if (error) {
        console.error(
            "Could not load front logs:",
            error
        );
        return;
    }

    displayFrontLogs(data);
}


// =================================
// DISPLAY FRONT LOGS
// =================================

async function displayFrontLogs(logs) {

    const logList =
        document.querySelector(".front-log-list");

    if (!logList) {
        console.error(
            "Could not find .front-log-list"
        );
        return;
    }

    logList.innerHTML = "";

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
                                    End front
                                </button>

                            </div>
                          `
                        : ""
                }

            </div>
        `;

        logList.appendChild(card);
    });


    // =================================
    // END FRONT BUTTONS
    // =================================

    if (session) {

        const removeButtons =
            document.querySelectorAll(
                ".remove-front-button"
            );

        removeButtons.forEach((button) => {

            button.addEventListener(
                "click",
                async () => {

                    const logId =
                        button.dataset.id;

                    const confirmed =
                        confirm(
                            "End this front?"
                        );

                    if (!confirmed) {
                        return;
                    }

                    button.disabled = true;
                    button.textContent =
                        "Ending...";

                    const { error } =
                        await supabaseClient
                            .from("front_logs")
                            .update({
                                end_time:
                                    new Date().toISOString()
                            })
                            .eq("id", logId);

                    if (error) {

                        console.error(
                            "Could not end front log:",
                            error
                        );

                        alert(
                            "Could not end this front."
                        );

                        button.disabled = false;
                        button.textContent =
                            "End front";

                        return;
                    }

                    await loadFrontLogs();
                    await loadCurrentFront();
                    await loadFrontingStatistics();

                }
            );

        });


        // =================================
        // EDIT FRONT BUTTONS
        // =================================

        const editButtons =
            document.querySelectorAll(
                ".edit-front-button"
            );

        editButtons.forEach((button) => {

            button.addEventListener(
                "click",
                async () => {

                    const logId =
                        button.dataset.id;

                    const card =
                        button.closest(
                            ".front-log-card"
                        );

                    if (!card) {
                        return;
                    }

                    const logType =
                        card.querySelector(
                            ".front-log-type"
                        );

                    const logNotes =
                        card.querySelector(
                            ".front-log-notes"
                        );

                    const currentType =
                        logType
                            ? logType.textContent.trim()
                            : "Fronting";

                    const currentNotes =
                        logNotes
                            ? logNotes.textContent.trim()
                            : "";

                    const newType =
                        prompt(
                            "Fronting type:",
                            currentType
                        );

                    if (newType === null) {
                        return;
                    }

                    const newNotes =
                        prompt(
                            "Notes:",
                            currentNotes
                        );

                    if (newNotes === null) {
                        return;
                    }

                    button.disabled = true;
                    button.textContent =
                        "Saving...";

                    const { error } =
                        await supabaseClient
                            .from("front_logs")
                            .update({
                                front_type:
                                    newType.trim(),

                                notes:
                                    newNotes.trim()
                                        || null
                            })
                            .eq("id", logId);

                    if (error) {

                        console.error(
                            "Could not edit front log:",
                            error
                        );

                        alert(
                            "Could not edit this front log."
                        );

                        button.disabled = false;
                        button.textContent =
                            "Edit front";

                        return;
                    }

                    await loadFrontLogs();
                    await loadCurrentFront();
                    await loadFrontingStatistics();

                }
            );

        });

    }

}


// =================================
// ADD FRONT UI
// =================================

const frontTypeButtons =
    document.querySelectorAll(
        ".front-type-option"
    );

const frontTypeInput =
    document.getElementById(
        "log-front-type"
    );

frontTypeButtons.forEach((button) => {

    button.addEventListener(
        "click",
        () => {

            frontTypeButtons.forEach(
                (option) => {
                    option.classList.remove(
                        "selected"
                    );
                }
            );

            button.classList.add(
                "selected"
            );

            if (frontTypeInput) {
                frontTypeInput.value =
                    button.dataset.value;
            }

        }
    );

});


// Default to Fronting

const defaultFrontType =
    document.querySelector(
        '.front-type-option[data-value="Fronting"]'
    );

if (defaultFrontType) {

    defaultFrontType.classList.add(
        "selected"
    );

    if (frontTypeInput) {
        frontTypeInput.value =
            "Fronting";
    }

}


// =================================
// ADD FRONT LOG
// =================================

const frontLogForm =
    document.getElementById(
        "front-log-form"
    );

if (frontLogForm) {

    frontLogForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();

            const member =
                document.getElementById(
                    "log-member"
                ).value.trim();

            const frontType =
                document.getElementById(
                    "log-front-type"
                ).value;

            const endTime =
                document.getElementById(
                    "log-end"
                ).value;

            const notes =
                document.getElementById(
                    "log-notes"
                ).value.trim();


            const {
                data: { session }
            } = await supabaseClient.auth.getSession();


            // Do not allow logged-out users
            // to submit a front

            if (!session) {
                return;
            }


            const { error } =
                await supabaseClient
                    .from("front_logs")
                    .insert({

                        member:
                            member,

                        front_type:
                            frontType,

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
                    "Could not add front:",
                    error
                );

                alert(
                    "Could not add this front."
                );

                return;
            }


            // Reset form

            frontLogForm.reset();


            // Restore Fronting as default

            frontTypeButtons.forEach(
                (option) => {
                    option.classList.remove(
                        "selected"
                    );
                }
            );


            if (defaultFrontType) {
                defaultFrontType.classList.add(
                    "selected"
                );
            }


            if (frontTypeInput) {
                frontTypeInput.value =
                    "Fronting";
            }


            // Refresh everything

            await loadFrontLogs();
            await loadCurrentFront();
            await loadFrontingStatistics();

        }
    );

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
// CURRENTLY FRONTING
// =================================

async function loadCurrentFront() {

    const nameElement =
        document.getElementById(
            "current-front-name"
        );

    const timeElement =
        document.getElementById(
            "current-front-time"
        );

    if (!nameElement || !timeElement) {
        return;
    }

    const {
        data,
        error
    } = await supabaseClient
        .from("front_logs")
        .select("*")
        .eq("front_type", "Fronting")
        .is("end_time", null)
        .order("start_time", {
            ascending: false
        });

    if (error) {

        console.error(
            "Could not load current front:",
            error
        );

        nameElement.textContent =
            "Unable to load";

        timeElement.textContent =
            "Could not check current front.";

        return;
    }

    if (!data || data.length === 0) {

        nameElement.textContent =
            "No one";

        timeElement.textContent =
            "No active fronting log.";

        return;
    }

    const names =
        data.map(
            (log) => log.member
        );

    nameElement.textContent =
        names.join(" + ");

    const latestFront =
        data[0];

    timeElement.textContent =
        `Front started ${formatCurrentFrontTime(
            latestFront.start_time
        )}`;

}


// =================================
// CURRENT FRONT TIME
// =================================

function formatCurrentFrontTime(
    dateString
) {

    const date =
        new Date(dateString);

    const today =
        new Date();

    const sameDay =
        date.toDateString() ===
        today.toDateString();

    const time =
        date.toLocaleTimeString(
            "en-GB",
            {
                hour: "2-digit",
                minute: "2-digit"
            }
        );

    if (sameDay) {
        return `today at ${time}`;
    }

    const dateText =
        date.toLocaleDateString(
            "en-GB",
            {
                day: "numeric",
                month: "long",
                year: "numeric"
            }
        );

    return `${dateText} at ${time}`;

}


// =================================
// FRONTING STATISTICS
// =================================

async function loadFrontingStatistics() {

    const totalLogsElement =
        document.getElementById(
            "stat-total-logs"
        );

    const monthlySwitchesElement =
        document.getElementById(
            "stat-monthly-switches"
        );

    const mostActiveElement =
        document.getElementById(
            "stat-most-active"
        );

    if (
        !totalLogsElement ||
        !monthlySwitchesElement ||
        !mostActiveElement
    ) {
        return;
    }

    const now =
        new Date();

    const year =
        now.getFullYear();

    const startOfYear =
        new Date(
            year,
            0,
            1
        ).toISOString();

    const startOfNextYear =
        new Date(
            year + 1,
            0,
            1
        ).toISOString();

    const startOfMonth =
        new Date(
            year,
            now.getMonth(),
            1
        ).toISOString();

    const startOfNextMonth =
        new Date(
            year,
            now.getMonth() + 1,
            1
        ).toISOString();

    const qualifyingTypes = [
        "Fronting",
        "Co-Fronting",
        "Co-Hosting",
        "Blended Fronting"
    ];

    const {
        data,
        error
    } = await supabaseClient
        .from("front_logs")
        .select(
            "member, front_type, start_time"
        )
        .gte(
            "start_time",
            startOfYear
        )
        .lt(
            "start_time",
            startOfNextYear
        )
        .in(
            "front_type",
            qualifyingTypes
        );

    if (error) {

        console.error(
            "Could not load fronting statistics:",
            error
        );

        totalLogsElement.textContent =
            "—";

        monthlySwitchesElement.textContent =
            "—";

        mostActiveElement.textContent =
            "—";

        return;
    }

    totalLogsElement.textContent =
        data.length;

    const monthlyLogs =
        data.filter((log) => {

            const start =
                new Date(
                    log.start_time
                );

            return (
                start >=
                    new Date(startOfMonth)
                &&
                start <
                    new Date(startOfNextMonth)
            );

        });

    monthlySwitchesElement.textContent =
        monthlyLogs.length;

    if (data.length === 0) {

        mostActiveElement.textContent =
            "None yet";

        return;
    }

    const memberCounts = {};

    data.forEach((log) => {

        const member =
            log.member;

        if (!memberCounts[member]) {
            memberCounts[member] = 0;
        }

        memberCounts[member]++;

    });

    let mostActiveMember =
        null;

    let highestCount =
        0;

    Object.entries(
        memberCounts
    ).forEach(
        ([member, count]) => {

            if (count > highestCount) {

                highestCount =
                    count;

                mostActiveMember =
                    member;

            }

        }
    );

    mostActiveElement.textContent =
        mostActiveMember;

}


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


// =================================
// START
// =================================

checkLogin();
loadFrontLogs();
loadCurrentFront();
loadFrontingStatistics();


// Update statistics

setInterval(
    loadFrontingStatistics,
    5000
);


// Update current front

setInterval(
    loadCurrentFront,
    5000
);


// Update stopwatch immediately

updateLiveDurations();


// Update stopwatch every second

setInterval(
    updateLiveDurations,
    1000
);
