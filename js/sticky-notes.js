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
   LOGIN CHECK
========================================= */

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


/* =========================================
   MODAL
========================================= */

const noteModal =
    document.getElementById("note-modal");

const makeNoteButton =
    document.getElementById("make-note-button");

const noteModalClose =
    document.getElementById("note-modal-close");

const noteModalBackdrop =
    document.getElementById("note-modal-backdrop");

const noteCancelButton =
    document.getElementById("note-cancel-button");


function openNoteModal() {

    if (!noteModal) return;

    noteModal.classList.add("open");

    noteModal.setAttribute(
        "aria-hidden",
        "false"
    );

    document.body.style.overflow = "hidden";
}


function closeNoteModal() {

    if (!noteModal) return;

    noteModal.classList.remove("open");

    noteModal.setAttribute(
        "aria-hidden",
        "true"
    );

    document.body.style.overflow = "";
}


if (makeNoteButton) {
    makeNoteButton.addEventListener(
        "click",
        openNoteModal
    );
}


if (noteModalClose) {
    noteModalClose.addEventListener(
        "click",
        closeNoteModal
    );
}


if (noteModalBackdrop) {
    noteModalBackdrop.addEventListener(
        "click",
        closeNoteModal
    );
}


if (noteCancelButton) {
    noteCancelButton.addEventListener(
        "click",
        closeNoteModal
    );
}


/* =========================================
   COLOUR SELECTION
========================================= */

const colourOptions =
    document.querySelectorAll(
        ".note-colour-option"
    );

const colourInput =
    document.getElementById("note-colour");


colourOptions.forEach((option) => {

    option.addEventListener("click", () => {

        colourOptions.forEach((item) => {
            item.classList.remove("selected");
        });

        option.classList.add("selected");

        if (colourInput) {
            colourInput.value =
                option.dataset.colour;
        }

    });

});


/* Select yellow by default */

const defaultColour =
    document.querySelector(
        '.note-colour-option[data-colour="yellow"]'
    );

if (defaultColour) {
    defaultColour.classList.add("selected");
}


/* =========================================
   SIZE SELECTION
========================================= */

const sizeOptions =
    document.querySelectorAll(
        ".note-size-option"
    );

const sizeInput =
    document.getElementById("note-size");


sizeOptions.forEach((option) => {

    option.addEventListener("click", () => {

        sizeOptions.forEach((item) => {
            item.classList.remove("selected");
        });

        option.classList.add("selected");

        if (sizeInput) {
            sizeInput.value =
                option.dataset.size;
        }

    });

});


/* =========================================
   FORM
========================================= */

const noteForm =
    document.getElementById("note-form");


if (noteForm) {

    noteForm.addEventListener(
        "submit",
        (event) => {

            event.preventDefault();

            const title =
                document.getElementById(
                    "note-title"
                ).value.trim();

            const content =
                document.getElementById(
                    "note-content"
                ).value.trim();

            const colour =
                document.getElementById(
                    "note-colour"
                ).value;

            const size =
                document.getElementById(
                    "note-size"
                ).value;


            console.log({
                title,
                content,
                colour,
                size
            });

            closeNoteModal();

        }
    );

}


/* =========================================
   START
========================================= */

checkLogin();
