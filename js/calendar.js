/* =========================================
   SUPABASE
========================================= */

const SUPABASE_URL =
    "https://khyauwjpffmoaaqpgqac.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_pj9MAWsA9oBry6sPge3vzw_uAW8YS7E";


const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );


/* =========================================
   CALENDAR ELEMENTS
========================================= */

const calendarMonth =
    document.getElementById("calendar-month");

const calendarGrid =
    document.getElementById("calendar-grid");

const previousMonthButton =
    document.getElementById("previous-month");

const nextMonthButton =
    document.getElementById("next-month");

const todayButton =
    document.getElementById("today-button");

const calendarAddEvent = 
    document.getElementById("calendar-add-event");

const eventAnnual = 
   document.getElementById("event-annual");


/* =========================================
   MODAL
========================================= */

const calendarModal =
    document.getElementById("calendar-modal");

const calendarModalTitle =
    document.getElementById(
        "calendar-modal-title"
    );

const calendarModalClose =
    document.getElementById(
        "calendar-modal-close"
    );

const calendarModalBackdrop =
    document.getElementById(
        "calendar-modal-backdrop"
    );

const calendarCancelButton =
    document.getElementById(
        "calendar-cancel-button"
    );


/* =========================================
   EVENT FORM
========================================= */

const calendarEventForm =
    document.getElementById(
        "calendar-event-form"
    );

const eventTitleInput =
    document.getElementById(
        "event-title"
    );

const eventDescriptionInput =
    document.getElementById(
        "event-description"
    );

const eventCategoryInput =
    document.getElementById(
        "event-category"
    );


const categoryOptions =
    document.querySelectorAll(
        ".calendar-category-option"
    );


/* =========================================
   CURRENT DATE
========================================= */

let currentDate =
    new Date();


/* =========================================
   SELECTED DATE
========================================= */

let selectedDate =
    null;


/* =========================================
   EVENTS
========================================= */

let calendarEvents = [];


/* =========================================
   MONTH NAMES
========================================= */

const monthNames = [

    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"

];


/* =========================================
   LOAD EVENTS
========================================= */

async function loadCalendarEvents() {

    const {
        data: events,
        error
    } = await supabaseClient
        .from("calendar_events")
        .select("*")
        .order(
            "event_date",
            {
                ascending: true
            }
        );


    if (error) {

        console.error(
            "Error loading calendar events:",
            error
        );

        calendarEvents = [];

        renderCalendar();

        return;

    }


    calendarEvents =
        events || [];


    renderCalendar();

}

async function checkCalendarLogin() {
    const {
        data: { session }
    } = await supabaseClient.auth.getSession();

    if (session) {
        calendarAddEvent.style.display = "";
    } else {
        calendarAddEvent.style.display = "none";
    }
}


/* =========================================
   RENDER CALENDAR
========================================= */

function renderCalendar() {

    if (
        !calendarGrid ||
        !calendarMonth
    ) {

        return;

    }


    const year =
        currentDate.getFullYear();

    const month =
        currentDate.getMonth();


    /* Update heading */

    calendarMonth.textContent =
        `${monthNames[month]} ${year}`;


    /* Clear calendar */

    calendarGrid.innerHTML = "";


    /* First day of month */

    const firstDay =
        new Date(
            year,
            month,
            1
        ).getDay();


    /* Days in month */

    const daysInMonth =
        new Date(
            year,
            month + 1,
            0
        ).getDate();


    /* Previous month days */

    const daysInPreviousMonth =
        new Date(
            year,
            month,
            0
        ).getDate();


    /* =====================================
       PREVIOUS MONTH
    ===================================== */

    for (
        let i = firstDay - 1;
        i >= 0;
        i--
    ) {

        const dayNumber =
            daysInPreviousMonth - i;


        const day =
            createDayCell(
                dayNumber,
                true
            );


        calendarGrid.appendChild(
            day
        );

    }


    /* =====================================
       CURRENT MONTH
    ===================================== */

    const today =
        new Date();


    for (
        let dayNumber = 1;
        dayNumber <= daysInMonth;
        dayNumber++
    ) {

        const isToday =
            dayNumber === today.getDate() &&
            month === today.getMonth() &&
            year === today.getFullYear();


        const day =
            createDayCell(
                dayNumber,
                false,
                isToday,
                year,
                month
            );


        calendarGrid.appendChild(
            day
        );

    }


    /* =====================================
       NEXT MONTH
    ===================================== */

    const totalCells =
        42;


    const cellsUsed =
        firstDay + daysInMonth;


    const remainingCells =
        totalCells - cellsUsed;


    for (
        let dayNumber = 1;
        dayNumber <= remainingCells;
        dayNumber++
    ) {

        const day =
            createDayCell(
                dayNumber,
                true
            );


        calendarGrid.appendChild(
            day
        );

    }

}


/* =========================================
   CREATE DAY CELL
========================================= */

function createDayCell(
    dayNumber,
    otherMonth = false,
    isToday = false,
    year = null,
    month = null
) {

    const day =
        document.createElement(
            "div"
        );


    day.className =
        "calendar-day";


    if (otherMonth) {

        day.classList.add(
            "other-month"
        );

    }


    if (isToday) {

        day.classList.add(
            "today"
        );

    }


    /* Day number */

    const number =
        document.createElement(
            "div"
        );


    number.className =
        "day-number";


    number.textContent =
        dayNumber;


    day.appendChild(
        number
    );


    /* Event container */

    const eventsContainer =
        document.createElement(
            "div"
        );


    eventsContainer.className =
        "calendar-events";


    day.appendChild(
        eventsContainer
    );


    /* =====================================
       DISPLAY EVENTS
    ===================================== */

    if (
        !otherMonth &&
        year !== null &&
        month !== null
    ) {

        const dateString =
            createDateString(
                year,
                month,
                dayNumber
            );


        const dayEvents =
            calendarEvents.filter(
                (event) =>
                    event.event_date ===
                    dateString
            );


        dayEvents.forEach(
            (event) => {

                const eventElement =
                    document.createElement(
                        "div"
                    );


                eventElement.className =
                    `calendar-event ${event.category}`;


                eventElement.textContent =
                    event.title;


                eventElement.title =
                    event.description ||
                    event.title;


                eventsContainer.appendChild(
                    eventElement
                );

            }
        );


        /* Make current month days clickable */

        day.style.cursor =
            "pointer";


        day.addEventListener(
            "click",
            () => {

                openCalendarModal(
                    year,
                    month,
                    dayNumber
                );

            }
        );

    }


    return day;

}


/* =========================================
   CREATE DATE STRING
========================================= */

function createDateString(
    year,
    month,
    day
) {

    const monthString =
        String(
            month + 1
        ).padStart(
            2,
            "0"
        );


    const dayString =
        String(
            day
        ).padStart(
            2,
            "0"
        );


    return `${year}-${monthString}-${dayString}`;

}


/* =========================================
   OPEN MODAL
========================================= */

function openCalendarModal(
    year,
    month,
    day
) {

    if (!calendarModal) {
        return;
    }


    selectedDate =
        createDateString(
            year,
            month,
            day
        );


    const selectedDateObject =
        new Date(
            year,
            month,
            day
        );


    const formattedDate =
        selectedDateObject.toLocaleDateString(
            undefined,
            {
                month: "long",
                day: "numeric",
                year: "numeric"
            }
        );


    if (calendarModalTitle) {

        calendarModalTitle.textContent =
            formattedDate;

    }


    /* Show events for this day */

    renderModalEvents();


    calendarModal.classList.add(
        "open"
    );


    calendarModal.setAttribute(
        "aria-hidden",
        "false"
    );


    document.body.style.overflow =
        "hidden";

}


/* =========================================
   RENDER MODAL EVENTS
========================================= */

function renderModalEvents() {

    const eventList =
        document.getElementById(
            "calendar-event-list"
        );


    if (!eventList) {
        return;
    }


    eventList.innerHTML = "";


    const dayEvents =
        calendarEvents.filter(
            (event) =>
                event.event_date ===
                selectedDate
        );


    if (dayEvents.length === 0) {

        const emptyState =
            document.createElement(
                "div"
            );


        emptyState.className =
            "calendar-empty-state";


        const symbol =
            document.createElement(
                "span"
            );


        symbol.textContent =
            "✦";


        const text =
            document.createElement(
                "p"
            );


        text.textContent =
            "Nothing planned for this day yet.";


        emptyState.appendChild(
            symbol
        );


        emptyState.appendChild(
            text
        );


        eventList.appendChild(
            emptyState
        );


        return;

    }


    dayEvents.forEach(
        (event) => {

            const eventCard =
                document.createElement(
                    "div"
                );


            eventCard.className =
                `calendar-modal-event ${event.category}`;


            const title =
                document.createElement(
                    "strong"
                );


            title.textContent =
                event.title;


            eventCard.appendChild(
                title
            );


            if (event.description) {

                const description =
                    document.createElement(
                        "p"
                    );


                description.textContent =
                    event.description;


                eventCard.appendChild(
                    description
                );

            }


            eventList.appendChild(
                eventCard
            );

        }
    );

}


/* =========================================
   CLOSE MODAL
========================================= */

function closeCalendarModal() {

    if (!calendarModal) {
        return;
    }


    calendarModal.classList.remove(
        "open"
    );


    calendarModal.setAttribute(
        "aria-hidden",
        "true"
    );


    document.body.style.overflow =
        "";

}


/* =========================================
   MODAL BUTTONS
========================================= */

if (calendarModalClose) {

    calendarModalClose.addEventListener(
        "click",
        closeCalendarModal
    );

}


if (calendarModalBackdrop) {

    calendarModalBackdrop.addEventListener(
        "click",
        closeCalendarModal
    );

}


if (calendarCancelButton) {

    calendarCancelButton.addEventListener(
        "click",
        closeCalendarModal
    );

}


/* =========================================
   ESCAPE KEY
========================================= */

document.addEventListener(
    "keydown",
    (event) => {

        if (
            event.key === "Escape" &&
            calendarModal &&
            calendarModal.classList.contains(
                "open"
            )
        ) {

            closeCalendarModal();

        }

    }
);


/* =========================================
   CATEGORY SELECTION
========================================= */

categoryOptions.forEach(
    (option) => {

        option.addEventListener(
            "click",
            () => {

                categoryOptions.forEach(
                    (item) => {

                        item.classList.remove(
                            "selected"
                        );

                    }
                );


                option.classList.add(
                    "selected"
                );


                if (eventCategoryInput) {

                    eventCategoryInput.value =
                        option.dataset.category;

                }

            }
        );

    }
);


/* =========================================
   ADD EVENT
========================================= */

if (calendarEventForm) {

    calendarEventForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            /* Make sure we have a date */

            if (!selectedDate) {

                alert(
                    "Please select a day first."
                );

                return;

            }


            /* Get login session */

            const {
                data: { session }
            } =
                await supabaseClient
                    .auth
                    .getSession();


            if (!session) {

                alert(
                    "You need to be logged in to add calendar events."
                );

                return;

            }


            /* Get form values */

            const title =
                eventTitleInput.value.trim();


            const description =
                eventDescriptionInput.value.trim();


            const category =
                eventCategoryInput.value;

           const isAnnual = 
              eventAnnual.checked;


            if (!title) {

                return;

            }


            /* Save event */

            const { error } = await supabaseClient
    .from("calendar_events")
    .insert([
        {
            title: title,
            description: description,
            event_date: selectedDate,
            category: category,
            is_annual: isAnnual
        }
    ]);


            if (error) {

                console.error(
                    "Error creating calendar event:",
                    error
                );


                alert(
                    "Something went wrong while adding the event."
                );


                return;

            }


            /* Reset form */

            calendarEventForm.reset();


            if (eventCategoryInput) {

                eventCategoryInput.value =
                    "personal";

            }


            categoryOptions.forEach(
                (item) => {

                    item.classList.remove(
                        "selected"
                    );

                }
            );


            const defaultCategory =
                document.querySelector(
                    '.calendar-category-option[data-category="personal"]'
                );


            if (defaultCategory) {

                defaultCategory.classList.add(
                    "selected"
                );

            }


            /* Reload events */

            await loadCalendarEvents();


            /* Keep modal open */

            renderModalEvents();

        }

    );

}


/* =========================================
   PREVIOUS MONTH
========================================= */

if (previousMonthButton) {

    previousMonthButton.addEventListener(
        "click",
        () => {

            currentDate.setMonth(
                currentDate.getMonth() - 1
            );

            renderCalendar();

        }
    );

}


/* =========================================
   NEXT MONTH
========================================= */

if (nextMonthButton) {

    nextMonthButton.addEventListener(
        "click",
        () => {

            currentDate.setMonth(
                currentDate.getMonth() + 1
            );

            renderCalendar();

        }
    );

}


/* =========================================
   TODAY
========================================= */

if (todayButton) {

    todayButton.addEventListener(
        "click",
        () => {

            currentDate =
                new Date();

            renderCalendar();

        }
    );

}


/* =========================================
   START
========================================= */

checkCalendarLogin();
loadCalendarEvents();
