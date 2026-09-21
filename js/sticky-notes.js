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


    if (session) {

        makeNoteButton.classList.add(
            "authenticated"
        );

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
        async (event) => {

            event.preventDefault();

            const author =
               document.getElementById(
                   "note-author"
               ).value.trim();

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


            /* Check that someone is logged in */

            const {
                data: { session }
            } = await supabaseClient.auth.getSession();


            if (!session) {

                alert(
                    "You need to be logged in to post a note."
                );

                return;

            }


            /* Save the note */

            const {
                error
            } = await supabaseClient
                .from("sticky_notes")
                .insert([
                    {
                        title: title || null,
                        content: content,
                        color: colour,
                        size: size,
                        author: author
                    }
                ]);


            if (error) {

                console.error(
                    "Error creating sticky note:",
                    error
                );

                alert(
                    "Something went wrong while posting the note."
                );

                return;

            }


            /* Reset the form */

            noteForm.reset();

            if (colourInput) {
                colourInput.value = "yellow";
            }

            if (sizeInput) {
                sizeInput.value = "medium";
            }


            /* Reset colour selection */

            colourOptions.forEach((item) => {
                item.classList.remove("selected");
            });

            if (defaultColour) {
                defaultColour.classList.add("selected");
            }


            /* Reset size selection */

            sizeOptions.forEach((item) => {
                item.classList.remove("selected");
            });

            const defaultSize =
                document.querySelector(
                    '.note-size-option[data-size="medium"]'
                );

            if (defaultSize) {
                defaultSize.classList.add("selected");
            }


            closeNoteModal();


            /* Reload notes */

            loadStickyNotes();

        }

    );

}


/* =========================================
   LOAD STICKY NOTES
========================================= */

async function loadStickyNotes() {

    const stickyBoard =
        document.getElementById("sticky-board");

    if (!stickyBoard) return;


    const {
        data: notes,
        error
    } = await supabaseClient
        .from("sticky_notes")
        .select("*")
        .order("created_at", {
            ascending: false
        });


    if (error) {

        console.error(
            "Error loading sticky notes:",
            error
        );

        return;

    }

    

    /* Remove example notes */

    stickyBoard.innerHTML = "";


    notes.forEach((note) => {

        const article =
            document.createElement("article");

        article.className =
            `sticky-note note-${note.color} note-${note.size}`;


        const pin =
            document.createElement("div");

        pin.className =
            "sticky-pin";


        const content =
            document.createElement("div");

        content.className =
            "sticky-note-content";


        const heading =
            document.createElement("h3");

        heading.textContent =
            note.title || "Untitled";


        const paragraph =
            document.createElement("p");

        paragraph.textContent =
            note.content;


        content.appendChild(heading);
        content.appendChild(paragraph);


        const footer =
    document.createElement("div");

footer.className =
    "sticky-note-footer";


const authorDate =
    document.createElement("span");

authorDate.textContent =
    `${note.author} · ${formatNoteDate(note.created_at)}`;


footer.appendChild(authorDate);


/* Delete button for authenticated users */

const {
    data: { session }
} = await supabaseClient.auth.getSession();


if (session) {

    const deleteButton =
        document.createElement("button");

    deleteButton.type =
        "button";

    deleteButton.className =
        "sticky-delete-button";

    deleteButton.textContent =
        "Delete note";


    deleteButton.addEventListener(
        "click",
        () => deleteStickyNote(note.id)
    );


    footer.appendChild(deleteButton);

}


        article.appendChild(pin);
        article.appendChild(content);
        article.appendChild(footer);


        stickyBoard.appendChild(article);

    });

}

async function deleteStickyNote(noteId) {

    const confirmed =
        confirm(
            "Are you sure you want to delete this note?"
        );


    if (!confirmed) return;


    const {
        error
    } = await supabaseClient
        .from("sticky_notes")
        .delete()
        .eq("id", noteId);


    if (error) {

        console.error(
            "Error deleting sticky note:",
            error
        );

        alert(
            "Something went wrong while deleting the note."
        );

        return;

    }


    loadStickyNotes();

}

/* =========================================
   NOTE DATE
========================================= */

function formatNoteDate(dateString) {

    const date =
        new Date(dateString);

    return date.toLocaleDateString(
        undefined,
        {
            day: "numeric",
            month: "short"
        }
    );

}


/* =========================================
   START
========================================= */

checkLogin();
loadStickyNotes();
