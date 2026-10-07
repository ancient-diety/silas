document.addEventListener("DOMContentLoaded", () => {

    const sections = document.querySelectorAll(".seth-collapsible");

    sections.forEach(section => {

        let clicks = 0;

        section.addEventListener("click", () => {

            if (section.classList.contains("seth-fallen")) {
                return;
            }

            clicks++;

            section.classList.remove(
                "seth-damage-1",
                "seth-damage-2",
                "seth-damage-3",
                "seth-damage-4"
            );

            if (clicks === 1) {
                section.classList.add("seth-damage-1");
            }

            if (clicks === 2) {
                section.classList.add("seth-damage-2");
            }

            if (clicks === 3) {
                section.classList.add("seth-damage-3");
            }

            if (clicks === 4) {
                section.classList.add("seth-damage-4");
            }

            if (clicks >= 5) {
                section.classList.add("seth-fallen");
            }

        });

    });

});
