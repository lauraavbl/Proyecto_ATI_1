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

    // Set footer text
    const footerText = document.querySelector(".footer");
    if (footerText && typeof config !== "undefined") {
        footerText.textContent = config.copyRight;
    }
}

function formatField(profileVal, configVal) {
    if (Array.isArray(profileVal)) {
        if (profileVal.length > 1) {
            // Plural case
            return {
                label: Array.isArray(configVal) ? configVal[1] : configVal,
                value: profileVal.join(", ")
            };
        } else {
            // Singular case
            return {
                label: Array.isArray(configVal) ? configVal[0] : configVal,
                value: profileVal[0] || ""
            };
        }
    } else {
        // Singular case (string or other type)
        return {
            label: Array.isArray(configVal) ? configVal[0] : configVal,
            value: profileVal || ""
        };
    }
}

function initProfile() {
    if (typeof profile === "undefined" || typeof config === "undefined") return;

    // Update document title
    document.title = `Perfil | ${profile.name}`;

    // Update image
    const imgProfile = document.querySelector(".img-profile");
    if (imgProfile) {
        imgProfile.src = `${profile.ci}/${profile.ci}Big${profile.image_ext}`;
        imgProfile.alt = profile.name;
    }

    // Update name
    const nombreEl = document.querySelector(".Nombre");
    if (nombreEl) {
        nombreEl.textContent = profile.name;
    }

    // Update description (cover letter)
    const coverLetter = document.querySelector(".cover-letter");
    if (coverLetter) {
        coverLetter.textContent = profile.description;
    }

    // Color favorito
    const colorData = formatField(profile.color, config.color);
    const colorLabel = document.getElementById("color favorito");
    const colorVal = document.getElementById("color_value");
    if (colorLabel && colorVal) {
        colorLabel.textContent = colorData.label + ":";
        colorVal.textContent = colorData.value;
    }

    // Libro favorito
    const bookData = formatField(profile.book, config.book);
    const bookLabel = document.getElementById("libro favorito");
    const bookVal = document.getElementById("libro_value");
    if (bookLabel && bookVal) {
        bookLabel.textContent = bookData.label + ":";
        bookVal.textContent = bookData.value;
    }

    // Género musical
    const musicData = formatField(profile.music, config.music);
    const musicLabel = document.getElementById("genero musical");
    const musicVal = document.getElementById("musica_value");
    if (musicLabel && musicVal) {
        musicLabel.textContent = musicData.label + ":";
        musicVal.textContent = musicData.value;
    }

    // Videojuego favorito
    const gameData = formatField(profile.video_game, config.video_game);
    const gameLabel = document.getElementById("game fav");
    const gameVal = document.getElementById("game_fav");
    if (gameLabel && gameVal) {
        gameLabel.textContent = gameData.label + ":";
        gameVal.textContent = gameData.value;
    }

    // Lenguajes de programación
    const langData = formatField(profile.language, config.language);
    const langLabel = document.getElementById("lenguaje de prog");
    const langVal = document.getElementById("lenguaje_value");
    if (langLabel && langVal) {
        langLabel.textContent = langData.label + ":";
        langVal.textContent = langData.value;
    }

    // Email section
    const emailParagraph = document.querySelector(".content-info p.bullets:last-of-type");
    if (emailParagraph && config.email) {
        const formattedEmail = config.email.replace("[email]", `<br><a id="correo_value" class="link-correo" href="mailto:${profile.email}">${profile.email}</a>`);
        emailParagraph.innerHTML = formattedEmail;
    }
}

// Load dynamic profile script depending on URL parameter
window.addEventListener("DOMContentLoaded", () => {
    // 1. Initialize static configuration
    initConfig();

    // 2. Parse CI from URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    let ci = urlParams.get("ci");
    if (!ci) {
        ci = "27279497"; // Default profile (Laura Barreto)
    }

    // 3. Dynamically inject profile JSON script to access profile global object
    const profileScript = document.createElement("script");
    profileScript.type = "text/javascript";
    profileScript.src = `${ci}/profile.json`;
    profileScript.defer = true;
    profileScript.onload = () => {
        // Render the profile data once loaded
        initProfile();
    };
    document.head.appendChild(profileScript);
});
