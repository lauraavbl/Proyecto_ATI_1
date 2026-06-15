import json
import os
import re
from beaker.middleware import SessionMiddleware

BASE_DIR = os.path.dirname(os.path.abspath(__file__))


def parse_js_json(filepath):
    """
    Los archivos JSON del proyecto tienen formato JS:
      const variable = { ... }
    Esta función elimina la declaracion y parsea el contenido como JSON puro.
    """
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read().strip()
    # Eliminar: const nombre =
    content = re.sub(r'^const\s+\w+\s*=\s*', '', content)
    # Eliminar punto y coma final si existe
    content = content.rstrip(';').strip()
    return json.loads(content)


def load_config(lang):
    """Carga el archivo de configuración según el idioma (lang param)."""
    lang = lang.lower()
    if lang == 'en':
        filename = 'configEN.json'
    elif lang == 'pt':
        filename = 'configPT.json'
    else:
        filename = 'configES.json'
    return parse_js_json(os.path.join(BASE_DIR, 'conf', filename))


def load_profiles():
    """Carga el listado de perfiles desde data/index.json."""
    return parse_js_json(os.path.join(BASE_DIR, 'data', 'index.json'))


def generate_html(profiles, config, lang, visit_count):
    """Genera el HTML completo de la página de índice."""
    site = config.get('site', ['ATI', '[UCV]', 'Log'])
    semester = config.get('semester', '')
    copyright_text = config.get('copyRight', '')
    search_placeholder = config.get('name', 'Nombre')
    search_btn = config.get('search', 'Buscar')
    profile_text = config.get('profile', 'Mi perfil')
    no_results_msg = config.get('noResults', 'No hay resultados para: [query]')

    # Generar tarjetas de perfiles
    cards_html = ''
    for p in profiles:
        ci = p['ci']
        name = p['name']
        ext = p['image_ext']
        cards_html += f'''
        <a class="student-card" href="profile.py?ci={ci}&lang={lang}" id="card-{ci}">
            <img class="img-index" src="{ci}/{ci}Small{ext}" alt="{name}" loading="lazy">
            <div class="card-info">
                <p class="card-info-text">{name}</p>
            </div>
            <div class="card-bar"></div>
        </a>'''

    profiles_json = json.dumps(profiles, ensure_ascii=False)
    no_results_json = json.dumps(no_results_msg, ensure_ascii=False)

    return f'''<!DOCTYPE html>
<html lang="{lang}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{site[0]}{site[1]}{site[2]} 2026-1</title>
    <link rel="icon" sizes="192x192" href="icon/cropped-logonuevo-192x192.png">
    <link rel="stylesheet" href="css/style.css">
</head>
<body>
    <header>
        <div class="logo-menu-row">
            <a class="logo" href="index.py?lang={lang}">
                {site[0]}<span>{site[1]}</span>{site[2]}
            </a>
            <div class="menu-icon">&#9776;</div>
        </div>
        <nav class="nav-search">
            <input id="search-input" class="buscador nav-search-input"
                   type="text" placeholder="{search_placeholder}...">
            <button id="search-btn" type="button">{search_btn}</button>
        </nav>
        <a href="profile.py?lang={lang}" class="profile-link">
            <span class="profile-text">{profile_text}</span>
            <div class="user-icon">
                <img src="icon/userIcon.svg" alt="{profile_text}" class="icono">
            </div>
        </a>
    </header>

    <section>
        <h2 class="semestre">{semester}</h2>
        <div id="student-grid" class="student-grid">
            {cards_html}
        </div>
    </section>

    <footer>
        <p class="footer">{copyright_text}</p>
    </footer>

    <script>
        // --- AJAX Fetch: filtrado SPA sin recargar la pagina ---
        const profiles = {profiles_json};
        const noResultsMsg = {no_results_json};
        const lang = '{lang}';

        function renderCards(filtered) {{
            const grid = document.getElementById('student-grid');
            if (filtered.length === 0) {{
                const query = document.getElementById('search-input').value;
                grid.innerHTML = '<div class="no-results" style="grid-column:1/-1;text-align:center;color:#1c4975;">' +
                    noResultsMsg.replace('[query]', '<strong>' + query + '</strong>') +
                    '</div>';
                return;
            }}
            grid.innerHTML = filtered.map(p => `
                <a class="student-card" href="profile.py?ci=${{p.ci}}&lang=${{lang}}" id="card-${{p.ci}}">
                    <img class="img-index" src="${{p.ci}}/${{p.ci}}Small${{p.image_ext}}" alt="${{p.name}}" loading="lazy">
                    <div class="card-info"><p class="card-info-text">${{p.name}}</p></div>
                    <div class="card-bar"></div>
                </a>`).join('');
        }}

        function filterProfiles(query) {{
            if (!query) {{ renderCards(profiles); return; }}
            const q = query.toLowerCase();
            renderCards(profiles.filter(p => p.name.toLowerCase().includes(q)));
        }}

        // Debounce para no llamar filterProfiles en cada tecla
        let timer;
        document.getElementById('search-input').addEventListener('input', function () {{
            clearTimeout(timer);
            const q = this.value.trim();
            timer = setTimeout(() => filterProfiles(q), 220);
        }});

        document.getElementById('search-btn').addEventListener('click', function () {{
            filterProfiles(document.getElementById('search-input').value.trim());
        }});

        // Menu hamburguesa
        const menuIcon = document.querySelector('.menu-icon');
        const header = document.querySelector('header');
        if (menuIcon && header) {{
            menuIcon.addEventListener('click', () => header.classList.toggle('menu-open'));
        }}

        // AJAX Fetch: registrar visita sin recargar
        fetch('index.py?action=ping&lang={lang}', {{ credentials: 'include' }})
            .then(r => r.json())
            .then(() => {{}})
            .catch(() => {{}});
    </script>
</body>
</html>'''


def _wsgi_app(environ, start_response):
    """Aplicación WSGI principal del índice de perfiles."""
    from urllib.parse import parse_qs

    params = parse_qs(environ.get('QUERY_STRING', ''))
    lang = params.get('lang', ['es'])[0]
    action = params.get('action', [''])[0]

    # Sesión con Beaker (cookie)
    session = environ.get('beaker.session', {})
    visit_count = session.get('visit_count', 0) + 1
    session['visit_count'] = visit_count
    if hasattr(session, 'save'):
        session.save()

    # Respuesta AJAX para ping (solo JSON, sin HTML)
    if action == 'ping':
        body = json.dumps({'visits': visit_count}).encode('utf-8')
        start_response('200 OK', [
            ('Content-Type', 'application/json'),
            ('Content-Length', str(len(body)))
        ])
        return [body]

    # Cargar datos y generar HTML
    config = load_config(lang)
    profiles = load_profiles()
    html = generate_html(profiles, config, lang, visit_count)
    body = html.encode('utf-8')

    start_response('200 OK', [
        ('Content-Type', 'text/html; charset=utf-8'),
        ('Content-Length', str(len(body)))
    ])
    return [body]


# Configuración de sesiones Beaker (del laboratorio)
_session_opts = {
    'session.type': 'file',
    'session.cookie_expires': True,
    'session.data_dir': '/tmp/sessions_ati',
    'session.auto': True
}

# Envolver la app WSGI con el middleware de sesiones
application = SessionMiddleware(_wsgi_app, _session_opts)
