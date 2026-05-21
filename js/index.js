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

    const semestre = document.querySelector(".semestre");
    if (semestre && typeof config !== "undefined") {
        semestre.textContent = config.semester;
    }

    const footerText = document.querySelector(".footer");
    if (footerText && typeof config !== "undefined") {
        footerText.textContent = config.copyRight;
    }
}

function renderProfiles() {
    const grid = document.querySelector(".student-grid");
    if (!grid || typeof profiles === "undefined") return;

    grid.innerHTML = "";

    const urlParams = new URLSearchParams(window.location.search);
    const lang = urlParams.get("lang");

    profiles.forEach(profile => {
        const card = document.createElement("a");
        card.className = "student-card";

        let cardHref = `profile.html?ci=${profile.ci}`;
        if (lang) {
            cardHref += `&lang=${lang}`;
        }
        card.href = cardHref;

        const img = document.createElement("img");
        img.className = "img-index";
        img.src = `${profile.ci}/${profile.ci}Small${profile.image_ext}`;
        img.alt = profile.name;

        const info = document.createElement("div");
        info.className = "card-info";

        const p = document.createElement("p");
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

        grid.appendChild(card);
    });
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
        renderProfiles();
    };
    document.head.appendChild(configScript);
});