function initConfig() {
    // Correctly construct the logo using all parts from config.site
    const logoLink = document.querySelector(".logo");
    if (logoLink && typeof config !== "undefined" && config.site) {
        logoLink.innerHTML = `${config.site[0]}<span>${config.site[1]}</span>${config.site[2]}`;
    }

    // Set search placeholder
    const searchInput = document.querySelector(".buscador");
    if (searchInput && typeof config !== "undefined") {
        searchInput.placeholder = config.name;
    }

    // Set search button text
    const searchButton = document.querySelector(".nav-search button");
    if (searchButton && typeof config !== "undefined") {
        searchButton.textContent = config.search;
    }

    // Set profile icon alt text
    const icono = document.querySelector(".icono");
    if (icono && typeof config !== "undefined") {
        icono.alt = config.profile;
    }

    // Set semester title
    const semestre = document.querySelector(".semestre");
    if (semestre && typeof config !== "undefined") {
        semestre.textContent = config.semester;
    }

    // Set footer text
    const footerText = document.querySelector(".footer");
    if (footerText && typeof config !== "undefined") {
        footerText.textContent = config.copyRight;
    }
}

function renderProfiles() {
    const grid = document.querySelector(".student-grid");
    if (!grid || typeof profiles === "undefined") return;

    // Clear existing content
    grid.innerHTML = "";

    profiles.forEach(profile => {
        // Create the card element
        const card = document.createElement("a");
        card.className = "student-card";
        card.href = `profile.html?ci=${profile.ci}`;

        // Create the image element
        const img = document.createElement("img");
        img.className = "img-index";
        img.src = `${profile.ci}/${profile.ci}Small${profile.image_ext}`;
        img.alt = profile.name;

        // Create the info container
        const info = document.createElement("div");
        info.className = "card-info";

        // Create the paragraph for the name
        const p = document.createElement("p");
        p.textContent = profile.name;

        info.appendChild(p);

        // Create the bottom bar
        const bar = document.createElement("div");
        bar.className = "card-bar";

        // Assemble the card
        card.appendChild(img);
        card.appendChild(info);
        card.appendChild(bar);

        // Add event listener to redirect with URL parameter as requested
        card.addEventListener("click", (e) => {
            e.preventDefault();
            window.location.href = `profile.html?ci=${profile.ci}`;
        });

        grid.appendChild(card);
    });
}

// Initialize config and render profiles when the DOM is fully loaded
window.addEventListener("DOMContentLoaded", () => {
    initConfig();
    renderProfiles();
});