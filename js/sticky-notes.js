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
   STICKY NOTE REACTIONS
   Uses a separate, public-only Supabase project.
========================================= */

const REACTION_SUPABASE_URL =
    "https://tienscruhkwlsmutlaft.supabase.co";

const REACTION_SUPABASE_KEY =
    "sb_publishable_-TbzO-_Ef_1vx3_TvEcHUw_ejvMuov-";

const reactionSupabaseClient =
    window.supabase.createClient(
        REACTION_SUPABASE_URL,
        REACTION_SUPABASE_KEY
    );

const REACTION_CLIENT_ID_KEY = "silas-sticky-reaction-client-id";
const REACTION_SELECTIONS_KEY = "silas-sticky-reaction-selections";
const REACTION_EMOJI_OPTIONS = ["❤️", "😂", "🥺", "👍", "✨", "👀"];
const REACTION_LABELS = {
    "❤️": "Love",
    "😂": "Funny",
    "🥺": "Touched",
    "👍": "Like",
    "✨": "Sparkles",
    "👀": "Eyes"
};

let stickyReactionClientId = null;
let stickyReactionChannel = null;
let stickyReactionNoteIds = [];
let savedStickyReactionSelections = loadStickyReactionSelections();

function loadStickyReactionSelections() {
    try {
        const saved = localStorage.getItem(REACTION_SELECTIONS_KEY);
        const parsed = saved ? JSON.parse(saved) : {};
        return parsed && typeof parsed === "object" ? parsed : {};
    } catch (error) {
        return {};
    }
}

function saveStickyReactionSelections() {
    try {
        localStorage.setItem(
            REACTION_SELECTIONS_KEY,
            JSON.stringify(savedStickyReactionSelections)
        );
    } catch (error) {
        /* Reactions still save on the server if local storage is unavailable. */
    }
}

function createReactionUuid() {
    if (window.crypto && typeof window.crypto.randomUUID === "function") {
        return window.crypto.randomUUID();
    }

    if (window.crypto && typeof window.crypto.getRandomValues === "function") {
        const bytes = new Uint8Array(16);
        window.crypto.getRandomValues(bytes);
        bytes[6] = (bytes[6] & 15) | 64;
        bytes[8] = (bytes[8] & 63) | 128;
        const hex = Array.from(bytes, (value) =>
            value.toString(16).padStart(2, "0")
        ).join("");
        return [
            hex.slice(0, 8),
            hex.slice(8, 12),
            hex.slice(12, 16),
            hex.slice(16, 20),
            hex.slice(20)
        ].join("-");
    }

    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (char) => {
        const value = Math.floor(Math.random() * 16);
        return (char === "x" ? value : (value & 3) | 8).toString(16);
    });
}

function getStickyReactionClientId() {
    if (stickyReactionClientId) return stickyReactionClientId;

    try {
        const saved = localStorage.getItem(REACTION_CLIENT_ID_KEY);
        if (saved && /^[0-9a-f-]{36}$/i.test(saved)) {
            stickyReactionClientId = saved;
            return stickyReactionClientId;
        }
    } catch (error) {
        /* Use a page-session ID when local storage is unavailable. */
    }

    stickyReactionClientId = createReactionUuid();

    try {
        localStorage.setItem(
            REACTION_CLIENT_ID_KEY,
            stickyReactionClientId
        );
    } catch (error) {
        /* The current page session can still react. */
    }

    return stickyReactionClientId;
}

function setStickyReactionStatus(message, state = "info") {
    const status = document.getElementById("sticky-reaction-status");
    if (!status) return;

    status.textContent = message;
    status.dataset.state = state;
}

function applyStickyReactionSelection(noteId) {
    const selectedEmoji =
        savedStickyReactionSelections[String(noteId)] || "";

    document
        .querySelectorAll(
            '.sticky-note-reaction[data-note-id="' + String(noteId) + '"]'
        )
        .forEach((button) => {
            button.setAttribute(
                "aria-pressed",
                button.dataset.emoji === selectedEmoji ? "true" : "false"
            );
        });
}

function createStickyNoteReactionControls(note) {
    const group = document.createElement("div");
    group.className = "sticky-note-reactions";
    group.setAttribute("role", "group");
    group.setAttribute(
        "aria-label",
        "Reactions for " + (note.title || "untitled sticky note")
    );

    REACTION_EMOJI_OPTIONS.forEach((emoji) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "sticky-note-reaction";
        button.dataset.noteId = String(note.id);
        button.dataset.emoji = emoji;
        button.setAttribute(
            "aria-label",
            "React with " + REACTION_LABELS[emoji] + ". 0 reactions."
        );
        button.setAttribute(
            "aria-pressed",
            savedStickyReactionSelections[String(note.id)] === emoji
                ? "true"
                : "false"
        );

        const emojiLabel = document.createElement("span");
        emojiLabel.className = "sticky-note-reaction-emoji";
        emojiLabel.setAttribute("aria-hidden", "true");
        emojiLabel.textContent = emoji;

        const count = document.createElement("span");
        count.className = "sticky-note-reaction-count";
        count.setAttribute("aria-hidden", "true");
        count.hidden = true;

        button.appendChild(emojiLabel);
        button.appendChild(count);
        button.addEventListener("click", () =>
            toggleStickyNoteReaction(note.id, emoji, button)
        );

        group.appendChild(button);
    });

    return group;
}

async function loadStickyNoteReactionCounts(noteIds) {
    if (!Array.isArray(noteIds) || noteIds.length === 0) return;

    const { data, error } = await reactionSupabaseClient
        .from("sticky_note_reaction_counts")
        .select("note_id, emoji, reaction_count")
        .in("note_id", noteIds);

    if (error) {
        console.error("Error loading sticky note reactions:", error);
        setStickyReactionStatus(
            "Reaction counts could not load. Please refresh to try again.",
            "error"
        );
        return;
    }

    const countByReaction = new Map();

    (data || []).forEach((row) => {
        countByReaction.set(
            String(row.note_id) + "|" + row.emoji,
            Number(row.reaction_count)
        );
    });

    document.querySelectorAll(".sticky-note-reaction").forEach((button) => {
        const count =
            countByReaction.get(
                button.dataset.noteId + "|" + button.dataset.emoji
            ) || 0;
        const countElement =
            button.querySelector(".sticky-note-reaction-count");

        if (!countElement) return;

        countElement.textContent = count > 0 ? String(count) : "";
        countElement.hidden = count === 0;
        button.setAttribute(
            "aria-label",
            "React with " + REACTION_LABELS[button.dataset.emoji] +
                ". " + count + (count === 1 ? " reaction." : " reactions.")
        );
    });
}

function subscribeToStickyNoteReactionUpdates(noteIds) {
    if (stickyReactionChannel) {
        reactionSupabaseClient.removeChannel(stickyReactionChannel);
        stickyReactionChannel = null;
    }

    stickyReactionNoteIds = noteIds.map(String);
    if (stickyReactionNoteIds.length === 0) return;

    stickyReactionChannel = reactionSupabaseClient
        .channel("sticky-note-reactions-" + Date.now())
        .on(
            "postgres_changes",
            {
                event: "*",
                schema: "public",
                table: "sticky_note_reaction_counts"
            },
            () => loadStickyNoteReactionCounts(stickyReactionNoteIds.map(Number))
        )
        .subscribe((status) => {
            if (status === "SUBSCRIBED") {
                setStickyReactionStatus(
                    "Reactions save automatically and update live.",
                    "connected"
                );
                loadStickyNoteReactionCounts(
                    stickyReactionNoteIds.map(Number)
                );
            } else if (
                status === "CHANNEL_ERROR" ||
                status === "TIMED_OUT"
            ) {
                setStickyReactionStatus(
                    "Live updates are reconnecting. Saved reactions remain on the board.",
                    "error"
                );
            }
        });
}

async function toggleStickyNoteReaction(noteId, emoji, button) {
    const noteIdString = String(noteId);
    const buttons = document.querySelectorAll(
        '.sticky-note-reaction[data-note-id="' + noteIdString + '"]'
    );

    buttons.forEach((item) => {
        item.disabled = true;
    });

    setStickyReactionStatus("Saving reaction…", "saving");

    try {
        const { data, error } = await reactionSupabaseClient.rpc(
            "toggle_sticky_note_reaction",
            {
                p_note_id: Number(noteId),
                p_emoji: emoji,
                p_client_id: getStickyReactionClientId()
            }
        );

        if (error) throw error;

        if (data === true) {
            savedStickyReactionSelections[noteIdString] = emoji;
        } else {
            delete savedStickyReactionSelections[noteIdString];
        }

        saveStickyReactionSelections();
        applyStickyReactionSelection(noteId);
        await loadStickyNoteReactionCounts(
            stickyReactionNoteIds.map(Number)
        );
    } catch (error) {
        console.error("Error saving sticky note reaction:", error);
        setStickyReactionStatus(
            "Your reaction could not be saved. Please try again.",
            "error"
        );
    } finally {
        buttons.forEach((item) => {
            item.disabled = false;
        });
        if (button && button.isConnected) button.focus();
    }
}

window.addEventListener("storage", (event) => {
    if (event.key !== REACTION_SELECTIONS_KEY) return;

    savedStickyReactionSelections = loadStickyReactionSelections();
    stickyReactionNoteIds.forEach(applyStickyReactionSelection);
});


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

            item.classList.remove(
                "selected"
            );

        });


        option.classList.add(
            "selected"
        );


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

    defaultColour.classList.add(
        "selected"
    );

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

            item.classList.remove(
                "selected"
            );

        });


        option.classList.add(
            "selected"
        );


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

                colourInput.value =
                    "yellow";

            }


            if (sizeInput) {

                sizeInput.value =
                    "medium";

            }


            /* Reset colour selection */

            colourOptions.forEach((item) => {

                item.classList.remove(
                    "selected"
                );

            });


            if (defaultColour) {

                defaultColour.classList.add(
                    "selected"
                );

            }


            /* Reset size selection */

            sizeOptions.forEach((item) => {

                item.classList.remove(
                    "selected"
                );

            });


            const defaultSize =
                document.querySelector(
                    '.note-size-option[data-size="medium"]'
                );


            if (defaultSize) {

                defaultSize.classList.add(
                    "selected"
                );

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
        document.getElementById(
            "sticky-board"
        );


    if (!stickyBoard) return;


    /* Get login status ONCE */

    const {
        data: { session }
    } = await supabaseClient.auth.getSession();


    /* Get notes */

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

        stickyBoard.classList.add(
            "loaded"
        );

        return;

    }


    /* Clear board */

    stickyBoard.innerHTML = "";


    /* Create notes */

    notes.forEach((note) => {

        const article =
            document.createElement(
                "article"
            );


        article.className =
            `sticky-note note-${note.color} note-${note.size}`;


        const pin =
            document.createElement(
                "div"
            );


        pin.className =
            "sticky-pin";


        const content =
            document.createElement(
                "div"
            );


        content.className =
            "sticky-note-content";


        const heading =
            document.createElement(
                "h3"
            );


        heading.textContent =
            note.title || "Untitled";


        const paragraph =
            document.createElement(
                "p"
            );


        paragraph.textContent =
            note.content;


        content.appendChild(
            heading
        );


        content.appendChild(
            paragraph
        );


        const reactionControls =
            createStickyNoteReactionControls(note);


        /* Footer */

        const footer =
            document.createElement(
                "div"
            );


        footer.className =
            "sticky-note-footer";


        const authorDate =
            document.createElement(
                "span"
            );


        authorDate.textContent =
            `${note.author} · ${formatNoteDate(note.created_at)}`;


        footer.appendChild(
            authorDate
        );


        /* Delete button */

        if (session) {

            const deleteButton =
                document.createElement(
                    "button"
                );


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


            footer.appendChild(
                deleteButton
            );

        }


        /* Build note */

        article.appendChild(
            pin
        );


        article.appendChild(
            content
        );

        article.appendChild(
            reactionControls
        );


        article.appendChild(
            footer
        );


        stickyBoard.appendChild(
            article
        );

    });


    /* Reveal board */

    stickyBoard.classList.add(
        "loaded"
    );

    const noteIds = notes.map((note) => Number(note.id));
    await loadStickyNoteReactionCounts(noteIds);
    subscribeToStickyNoteReactionUpdates(noteIds);

}


/* =========================================
   DELETE STICKY NOTE
========================================= */

async function deleteStickyNote(noteId) {

    const confirmed =
        confirm(
            "Are you sure you want to delete this note?"
        );


    if (!confirmed) return;


    /* Make sure user is still logged in */

    const {
        data: { session }
    } = await supabaseClient.auth.getSession();


    if (!session) {

        alert(
            "You need to be logged in to delete notes."
        );

        return;

    }


    /* Delete note */

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


    /* Reload board */

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
