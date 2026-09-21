/* =========================================
   CALENDAR
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


/* =========================================
   MODAL
========================================= */

const calendarModal =
    document.getElementById("calendar-modal");

const calendarModalTitle =
    document.getElementById("calendar-modal-title");

const calendarModalClose =
    document.getElementById("calendar-modal-close");

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

let currentDate = new Date();


/* =========================================
   SELECTED DATE
========================================= */

let selectedDate = null;


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
   RENDER CALENDAR
========================================= */

function renderCalendar() {

    if (!calendarGrid || !calendarMonth) {
        return;
    }


    const year =
        currentDate.getFullYear();

    const month =
        currentDate.getMonth();


    /* Update heading */

    calendarMonth.textContent =
        `${monthNames[month]} ${year}`;


    /* Clear existing days */

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


    /* Days in previous month */

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


        calendarGrid.appendChild(day);

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


        calendarGrid.appendChild(day);

    }


    /* =====================================
       NEXT MONTH
    ===================================== */

    const totalCells = 42;

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


        calendarGrid.appendChild(day);

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
        document.createElement("div");


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


    const number =
        document.createElement("div");


    number.className =
        "day-number";


    number.textContent =
        dayNumber;


    day.appendChild(number);


    /* Event container */

    const events =
        document.createElement("div");


    events.className =
        "calendar-events";


    day.appendChild(events);


    /* =====================================
       CLICK CURRENT-MONTH DAYS
    ===================================== */

    if (!otherMonth && year !== null) {

        day.style.cursor = "pointer";


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
        new Date(
            year,
            month,
            day
        );


    const formattedDate =
        selectedDate.toLocaleDateString(
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
   CLOSE BUTTON
========================================= */

if (calendarModalClose) {

    calendarModalClose.addEventListener(
        "click",
        closeCalendarModal
    );

}


/* =========================================
   BACKDROP
========================================= */

if (calendarModalBackdrop) {

    calendarModalBackdrop.addEventListener(
        "click",
        closeCalendarModal
    );

}


/* =========================================
   CANCEL BUTTON
========================================= */

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
            calendarModal.classList.contains("open")
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
   FORM
========================================= */

if (calendarEventForm) {

    calendarEventForm.addEventListener(
        "submit",
        (event) => {

            event.preventDefault();


            /*
                Supabase comes later.

                For now, just close the
                modal after testing the UI.
            */

            closeCalendarModal();

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

renderCalendar();
