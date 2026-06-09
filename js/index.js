

function debounce(fn, delay) {
    let timer;
    return function (...args) {
        clearTimeout(timer);
        timer = setTimeout(() => fn.apply(this, args), delay);
    };
}

const profileFormatter = {
    cardClass: "student-card",
    formatCard: function (profile, lang) {
        console.log(`[Enlace Implícito] Formateando tarjeta para: ${profile.name} con clase: ${this.cardClass}`);
        const card = document.createElement("a");
        card.className = this.cardClass;

        let cardHref = `profile.html?ci=${profile.ci}`;
        if (lang) {
            cardHref += `&lang=${lang}`;
        }
        card.href = cardHref;
        return card;
    }
};

const searchTracker = {
    logLabel: "[Buscador ATI]",
    track: function (inputElement) {
        if (inputElement) {

            const debouncedRender = debounce((query) => renderProfiles(query), 220);
            inputElement.addEventListener("input", (e) => {
                const query = e.target.value.trim();
                console.log(`${this.logLabel} Entrada de búsqueda: "${query}"`);
                debouncedRender(query);
            });
        }
    }
};

function initConfig() {
    const logoLink = document.querySelector(".logo");
    if (logoLink && typeof config !== "undefined" && config.site) {
        logoLink.innerHTML = `${config.site[0]}<span>${config.site[1]}</span>${config.site[2]}`;
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

    const profileText = document.querySelector(".profile-text");
    if (profileText && typeof config !== "undefined") {
        profileText.textContent = config.profile;
    }

    const profileLink = document.querySelector(".profile-link");
    if (profileLink) {
        const urlParams = new URLSearchParams(window.location.search);
        const lang = urlParams.get("lang");
        let profileHref = "profile.html";
        if (lang) {
            profileHref += `?lang=${lang}`;
        }
        profileLink.href = profileHref;
    }

    const semestre = document.querySelector(".semestre");
    if (semestre && typeof config !== "undefined") {
        semestre.textContent = config.semester;
    }

    const footerText = document.querySelector(".footer");
    if (footerText && typeof config !== "undefined") {
        footerText.textContent = config.copyRight;
    }
}

function renderProfiles(filterQuery = "") {
    const grid = document.querySelector(".student-grid");
    if (!grid || typeof profiles === "undefined") return;

    grid.innerHTML = "";

    const urlParams = new URLSearchParams(window.location.search);
    const lang = urlParams.get("lang");

    const filteredProfiles = profiles.filter(profile =>
        profile.name.toLowerCase().includes(filterQuery.toLowerCase())
    );

    if (filteredProfiles.length === 0) {
        const noResultsDiv = document.createElement("div");
        noResultsDiv.className = "no-results";
        noResultsDiv.style.cssText = "grid-column:1/-1;text-align:center;color:#1c4975;font-family:var(--flex-font);font-size:16px;font-weight:normal;margin-top:30px";
        const msg = config.noResults ? config.noResults.replace("[query]", `<strong>${filterQuery}</strong>`) : `No hay perfiles que tengan en su nombre: <strong>${filterQuery}</strong>`;
        noResultsDiv.innerHTML = msg;
        grid.appendChild(noResultsDiv);
        return;
    }

    const fragment = document.createDocumentFragment();

    filteredProfiles.forEach(profile => {

        const card = profileFormatter.formatCard(profile, lang);

        const img = document.createElement("img");
        img.className = "img-index";
        img.src = `${profile.ci}/${profile.ci}Small${profile.image_ext}`;
        img.alt = profile.name;
        img.loading = "lazy";
        img.decoding = "async";

        const info = document.createElement("div");
        info.className = "card-info";

        const p = document.createElement("p");
        p.className = "card-info-text";
        p.textContent = profile.name;

        info.appendChild(p);

        const bar = document.createElement("div");
        bar.className = "card-bar";

        card.appendChild(img);
        card.appendChild(info);
        card.appendChild(bar);

        card.addEventListener("click", (e) => {
            e.preventDefault();
            let targetUrl = `profile.html?ci=${profile.ci}`;
            if (lang) {
                targetUrl += `&lang=${lang}`;
            }
            window.location.href = targetUrl;
        });

        fragment.appendChild(card);
    });

    grid.appendChild(fragment);
}

window.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const lang = urlParams.get("lang") || "es";
    const initialSearch = urlParams.get("search") || "";

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
        if (searchInput && initialSearch) {
            searchInput.value = initialSearch;
        }

        renderProfiles(initialSearch.trim());

        if (searchInput) {
            searchTracker.track(searchInput);

            searchInput.addEventListener("keydown", (e) => {
                if (e.key === "Enter") {
                    const query = e.target.value.trim();
                    renderProfiles(query);
                }
            });
        }
        const searchButton = document.querySelector(".nav-search button");
        if (searchButton && searchInput) {
            searchButton.addEventListener("click", function () {
                const query = searchInput.value.trim();
                console.log(`[DOM Event] Se presionó el botón: "${this.textContent}"`);
                renderProfiles(query);
            });
        }

        const menuIcon = document.querySelector(".menu-icon");
        const header = document.querySelector("header");
        if (menuIcon && header) {
            menuIcon.addEventListener("click", () => {
                header.classList.toggle("menu-open");
            });
        }
    };
    document.head.appendChild(configScript);
});