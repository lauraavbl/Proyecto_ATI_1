function initConfig() {
    const logoLink = document.querySelector(".logo");
    if (logoLink && typeof config !== "undefined" && config.site) {
        logoLink.innerHTML = `${config.site[0]}<span>${config.site[1]}</span>${config.site[2]}`;
        const urlParams = new URLSearchParams(window.location.search);
        const lang = urlParams.get("lang");
        if (lang) {
            logoLink.href = `index.html?lang=${lang}`;
        }
    }

    const searchInput = document.querySelector(".buscador");
    if (searchInput && typeof config !== "undefined") {
        searchInput.placeholder = config.name;
    }

    const searchButton = document.querySelector(".nav-search button");
    if (searchButton && typeof config !== "undefined") {
        searchButton.textContent = config.search;
    }

    const icono = document.querySelector(".icono");
    if (icono && typeof config !== "undefined") {
        icono.alt = config.profile;
    }

    const footerText = document.querySelector(".footer");
    if (footerText && typeof config !== "undefined") {
        footerText.textContent = config.copyRight;
    }
}

function formatField(profileVal, configVal) {
    if (Array.isArray(profileVal)) {
        if (profileVal.length > 1) {
            return {
                label: Array.isArray(configVal) ? configVal[1] : configVal,
                value: profileVal.join(", ")
            };
        } else {
            return {
                label: Array.isArray(configVal) ? configVal[0] : configVal,
                value: profileVal[0] || ""
            };
        }
    } else {
        return {
            label: Array.isArray(configVal) ? configVal[0] : configVal,
            value: profileVal || ""
        };
    }
}

function initProfile() {
    if (typeof profile === "undefined" || typeof config === "undefined") return;

    document.title = `Perfil | ${profile.name}`;

    const imgProfile = document.querySelector(".img-profile");
    if (imgProfile) {
        imgProfile.src = `${profile.ci}/${profile.ci}Big${profile.image_ext}`;
        imgProfile.alt = profile.name;
    }

    const nombreEl = document.querySelector(".Nombre");
    if (nombreEl) {
        nombreEl.textContent = profile.name;
    }

    const coverLetter = document.querySelector(".cover-letter");
    if (coverLetter) {
        coverLetter.textContent = profile.description;
    }

    const colorData = formatField(profile.color, config.color);
    const colorLabel = document.getElementById("color favorito");
    const colorVal = document.getElementById("color_value");
    if (colorLabel && colorVal) {
        colorLabel.textContent = colorData.label + ":";
        colorVal.textContent = colorData.value;
    }

    const bookData = formatField(profile.book, config.book);
    const bookLabel = document.getElementById("libro favorito");
    const bookVal = document.getElementById("libro_value");
    if (bookLabel && bookVal) {
        bookLabel.textContent = bookData.label + ":";
        bookVal.textContent = bookData.value;
    }

    const musicData = formatField(profile.music, config.music);
    const musicLabel = document.getElementById("genero musical");
    const musicVal = document.getElementById("musica_value");
    if (musicLabel && musicVal) {
        musicLabel.textContent = musicData.label + ":";
        musicVal.textContent = musicData.value;
    }

    const gameData = formatField(profile.video_game, config.video_game);
    const gameLabel = document.getElementById("game fav");
    const gameVal = document.getElementById("game_fav");
    if (gameLabel && gameVal) {
        gameLabel.textContent = gameData.label + ":";
        gameVal.textContent = gameData.value;
    }

    const langData = formatField(profile.language, config.language);
    const langLabel = document.getElementById("lenguaje de prog");
    const langVal = document.getElementById("lenguaje_value");
    if (langLabel && langVal) {
        langLabel.textContent = langData.label + ":";
        langVal.textContent = langData.value;
    }

    const emailParagraph = document.querySelector(".content-info p.bullets:last-of-type");
    if (emailParagraph && config.email) {
        const formattedEmail = config.email.replace("[email]", `<br><a id="correo_value" class="link-correo" href="mailto:${profile.email}">${profile.email}</a>`);
        emailParagraph.innerHTML = formattedEmail;
    }
}


window.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const lang = urlParams.get("lang") || "es";

    let configSrc = "conf/configES.json";
    const normalizedLang = lang.toLowerCase();
    if (normalizedLang === "en") {
        configSrc = "conf/configEN.json";
    } else if (normalizedLang === "pt") {
        configSrc = "conf/configPT.json";
    }

    const configScript = document.createElement("script");
    configScript.type = "text/javascript";
    configScript.src = configSrc;
    configScript.defer = true;
    configScript.onload = () => {
        initConfig();

        const searchInput = document.querySelector(".buscador");
        const searchButton = document.querySelector(".nav-search button");

        function performSearchRedirect() {
            if (!searchInput) return;
            const query = searchInput.value.trim();
            let targetUrl = `index.html?search=${encodeURIComponent(query)}`;
            if (lang) {
                targetUrl += `&lang=${lang}`;
            }
            window.location.href = targetUrl;
        }

        if (searchButton) {
            searchButton.addEventListener("click", performSearchRedirect);
        }
        if (searchInput) {
            searchInput.addEventListener("keydown", (e) => {
                if (e.key === "Enter") {
                    performSearchRedirect();
                }
            });
        }

        let ci = urlParams.get("ci");
        if (!ci) {
            ci = "27279497";
        }

        const profileScript = document.createElement("script");
        profileScript.type = "text/javascript";
        profileScript.src = `${ci}/profile.json`;
        profileScript.defer = true;
        profileScript.onload = () => {
            initProfile();
        };
        document.head.appendChild(profileScript);
    };
    document.head.appendChild(configScript);
});
