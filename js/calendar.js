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
   CURRENT DATE
========================================= */

let currentDate = new Date();


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


    /*
        First day of the month.
        0 = Sunday
        1 = Monday
        etc.
    */

    const firstDay =
        new Date(
            year,
            month,
            1
        ).getDay();


    /*
        Number of days in current month
    */

    const daysInMonth =
        new Date(
            year,
            month + 1,
            0
        ).getDate();


    /*
        Number of days in previous month
    */

    const daysInPreviousMonth =
        new Date(
            year,
            month,
            0
        ).getDate();


    /* =====================================
       PREVIOUS MONTH DAYS
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
       CURRENT MONTH DAYS
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
                isToday
            );


        calendarGrid.appendChild(day);

    }


    /* =====================================
       NEXT MONTH DAYS
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


        calendarGrid.appendChild(day);

    }

}


/* =========================================
   CREATE DAY CELL
========================================= */

function createDayCell(
    dayNumber,
    otherMonth = false,
    isToday = false
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


    /*
        Events will eventually
        be inserted here.
    */

    const events =
        document.createElement("div");


    events.className =
        "calendar-events";


    day.appendChild(events);


    return day;

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
