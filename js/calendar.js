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

const eventDateInput =
    document.getElementById(
        "event-date"
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

const eventAnnual =
    document.getElementById(
        "event-annual"
    );

const categoryOptions =
    document.querySelectorAll(
        ".calendar-category-option"
    );


/* =========================================
   FORM LABELS / BUTTON
========================================= */

const addEventLabel =
    document.querySelector(
        ".calendar-add-event-label"
    );

const saveEventButton =
    document.querySelector(
        ".calendar-save-button"
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
   EDITING EVENT
========================================= */

let editingEventId =
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


/* =========================================
   CHECK LOGIN
========================================= */

async function checkCalendarLogin() {

    const {
        data: { session }
    } =
        await supabaseClient
            .auth
            .getSession();


    if (calendarAddEvent) {

        if (session) {

            calendarAddEvent.style.display =
                "";

        } else {

            calendarAddEvent.style.display =
                "none";

        }

    }


    return session;

}


/* =========================================
   GET EVENTS FOR DATE
========================================= */

function getEventsForDate(
    dateString
) {

    const selectedDateObject =
        new Date(
            `${dateString}T00:00:00`
        );


    const selectedMonth =
        selectedDateObject.getMonth();


    const selectedDay =
        selectedDateObject.getDate();


    return calendarEvents.filter(
        (event) => {

            /* Annual event */

            if (
                event.is_annual === true
            ) {

                const parts =
                    event.event_date.split("-");


                const eventMonth =
                    Number(parts[1]) - 1;


                const eventDay =
                    Number(parts[2]);


                return (
                    eventMonth === selectedMonth &&
                    eventDay === selectedDay
                );

            }


            /* One-time event */

            return (
                event.event_date ===
                dateString
            );

        }
    );

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


    calendarMonth.textContent =
        `${monthNames[month]} ${year}`;


    calendarGrid.innerHTML = "";


    const firstDay =
        new Date(
            year,
            month,
            1
        ).getDay();


    const daysInMonth =
        new Date(
            year,
            month + 1,
            0
        ).getDate();


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
            getEventsForDate(
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


                /* =================================
                   CLICK INDIVIDUAL EVENT
                ================================= */

                eventElement.addEventListener(
                    "click",
                    (clickEvent) => {

                        clickEvent.stopPropagation();


                        openCalendarModal(
                            year,
                            month,
                            dayNumber,
                            event.id
                        );

                    }
                );


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
    day,
    eventId = null
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


    editingEventId =
        null;


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


    /* Set default date for adding */

    resetEventForm();


    if (eventDateInput) {

        eventDateInput.value =
            selectedDate;

    }


    /* Show events */

    renderModalEvents(
        eventId
    );


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

async function renderModalEvents(
    selectedEventId = null
) {

    const eventList =
        document.getElementById(
            "calendar-event-list"
        );


    if (!eventList) {

        return;

    }


    eventList.innerHTML = "";


    const dayEvents =
        getEventsForDate(
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


    const {
        data: { session }
    } =
        await supabaseClient
            .auth
            .getSession();


    dayEvents.forEach(
        (event) => {

            const eventCard =
                document.createElement(
                    "div"
                );


            eventCard.className =
                `calendar-modal-event ${event.category}`;


            if (
                String(event.id) ===
                String(selectedEventId)
            ) {

                eventCard.classList.add(
                    "selected-event"
                );

            }


            const title =
                document.createElement(
                    "strong"
                );


            title.textContent =
                event.title;


            eventCard.appendChild(
                title
            );


            if (event.is_annual === true) {

                const annualLabel =
                    document.createElement(
                        "span"
                    );


                annualLabel.className =
                    "calendar-annual-label";


                annualLabel.textContent =
                    "↻ Every year";


                eventCard.appendChild(
                    annualLabel
                );

            }


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


            /* =================================
               EVENT ACTIONS
            ================================= */

            if (session) {

                const actions =
                    document.createElement(
                        "div"
                    );


                actions.className =
                    "calendar-event-actions";


                const editButton =
                    document.createElement(
                        "button"
                    );


                editButton.type =
                    "button";


                editButton.className =
                    "calendar-edit-button";


                editButton.textContent =
                    "Edit";


                editButton.addEventListener(
                    "click",
                    (clickEvent) => {

                        clickEvent.stopPropagation();


                        startEditingEvent(
                            event
                        );

                    }
                );


                const deleteButton =
                    document.createElement(
                        "button"
                    );


                deleteButton.type =
                    "button";


                deleteButton.className =
                    "calendar-delete-button";


                deleteButton.textContent =
                    "Delete";


                deleteButton.addEventListener(
                    "click",
                    async (clickEvent) => {

                        clickEvent.stopPropagation();


                        await deleteCalendarEvent(
                            event.id
                        );

                    }
                );


                actions.appendChild(
                    editButton
                );


                actions.appendChild(
                    deleteButton
                );


                eventCard.appendChild(
                    actions
                );

            }


            eventList.appendChild(
                eventCard
            );

        }
    );

}


/* =========================================
   START EDITING EVENT
========================================= */

function startEditingEvent(
    event
) {

    editingEventId =
        event.id;


    if (eventDateInput) {

        eventDateInput.value =
            event.event_date;

    }


    if (eventTitleInput) {

        eventTitleInput.value =
            event.title;

    }


    if (eventDescriptionInput) {

        eventDescriptionInput.value =
            event.description ||
            "";

    }


    if (eventCategoryInput) {

        eventCategoryInput.value =
            event.category;

    }


    if (eventAnnual) {

        eventAnnual.checked =
            event.is_annual === true;

    }


    /* Update selected category */

    categoryOptions.forEach(
        (option) => {

            option.classList.toggle(
                "selected",
                option.dataset.category ===
                event.category
            );

        }
    );


    /* Change form appearance */

    if (addEventLabel) {

        addEventLabel.textContent =
            "EDIT EVENT";

    }


    if (saveEventButton) {

        saveEventButton.textContent =
            "Save changes";

    }


    if (calendarAddEvent) {

        calendarAddEvent.style.display =
            "";

    }


    /* Scroll form into view */

    if (calendarAddEvent) {

        calendarAddEvent.scrollIntoView({
            behavior: "smooth",
            block: "nearest"
        });

    }

}


/* =========================================
   RESET EVENT FORM
========================================= */

function resetEventForm() {

    editingEventId =
        null;


    if (calendarEventForm) {

        calendarEventForm.reset();

    }


    if (eventCategoryInput) {

        eventCategoryInput.value =
            "personal";

    }


    if (eventAnnual) {

        eventAnnual.checked =
            false;

    }


    categoryOptions.forEach(
        (option) => {

            option.classList.remove(
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


    if (addEventLabel) {

        addEventLabel.textContent =
            "ADD SOMETHING";

    }


    if (saveEventButton) {

        saveEventButton.textContent =
            "Add event";

    }

}


/* =========================================
   DELETE EVENT
========================================= */

async function deleteCalendarEvent(
    eventId
) {

    const {
        data: { session }
    } =
        await supabaseClient
            .auth
            .getSession();


    if (!session) {

        alert(
            "You need to be logged in to delete calendar events."
        );

        return;

    }


    const event =
        calendarEvents.find(
            (item) =>
                String(item.id) ===
                String(eventId)
        );


    if (!event) {

        return;

    }


    const confirmed =
        confirm(
            `Delete "${event.title}"?`
        );


    if (!confirmed) {

        return;

    }


    const { error } =
        await supabaseClient
            .from("calendar_events")
            .delete()
            .eq(
                "id",
                eventId
            );


    if (error) {

        console.error(
            "Error deleting calendar event:",
            error
        );


        alert(
            "Something went wrong while deleting the event."
        );


        return;

    }


    resetEventForm();


    await loadCalendarEvents();


    renderModalEvents();

}


/* =========================================
   CLOSE MODAL
========================================= */

function closeCalendarModal() {

    if (!calendarModal) {

        return;

    }


    resetEventForm();


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
   ADD / EDIT EVENT
========================================= */

if (calendarEventForm) {

    calendarEventForm.addEventListener(
        "submit",
        async (submitEvent) => {

            submitEvent.preventDefault();


            /* Get login session */

            const {
                data: { session }
            } =
                await supabaseClient
                    .auth
                    .getSession();


            if (!session) {

                alert(
                    "You need to be logged in to modify calendar events."
                );

                return;

            }


            /* Get form values */

            const eventDate =
                eventDateInput
                    ? eventDateInput.value
                    : selectedDate;


            const title =
                eventTitleInput.value.trim();


            const description =
                eventDescriptionInput.value.trim();


            const category =
                eventCategoryInput.value;


            const isAnnual =
                eventAnnual.checked;


            if (!eventDate) {

                alert(
                    "Please choose a date."
                );

                return;

            }


            if (!title) {

                return;

            }


            /* =================================
               EDIT EXISTING EVENT
            ================================= */

            if (editingEventId !== null) {

                const { error } =
                    await supabaseClient
                        .from("calendar_events")
                        .update({
                            title: title,
                            description: description,
                            event_date: eventDate,
                            category: category,
                            is_annual: isAnnual
                        })
                        .eq(
                            "id",
                            editingEventId
                        );


                if (error) {

                    console.error(
                        "Error updating calendar event:",
                        error
                    );


                    alert(
                        "Something went wrong while updating the event."
                    );


                    return;

                }


                selectedDate =
                    eventDate;


                const updatedDate =
                    new Date(
                        `${eventDate}T00:00:00`
                    );


                if (calendarModalTitle) {

                    calendarModalTitle.textContent =
                        updatedDate.toLocaleDateString(
                            undefined,
                            {
                                month: "long",
                                day: "numeric",
                                year: "numeric"
                            }
                        );

                }


                resetEventForm();


                await loadCalendarEvents();


                renderModalEvents();

                return;

            }


            /* =================================
               CREATE NEW EVENT
            ================================= */

            const { error } =
                await supabaseClient
                    .from("calendar_events")
                    .insert([
                        {
                            title: title,
                            description: description,
                            event_date: eventDate,
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

            resetEventForm();


            if (eventDateInput) {

                eventDateInput.value =
                    selectedDate;

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
