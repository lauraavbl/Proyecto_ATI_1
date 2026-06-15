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
    content = re.sub(r'^const\s+\w+\s*=\s*', '', content)
    content = content.rstrip(';').strip()
    return json.loads(content)


def load_config(lang):
    """Carga el archivo de configuración según el idioma."""
    lang = lang.lower()
    if lang == 'en':
        filename = 'configEN.json'
    elif lang == 'pt':
        filename = 'configPT.json'
    else:
        filename = 'configES.json'
    return parse_js_json(os.path.join(BASE_DIR, 'conf', filename))


def load_profile(ci):
    """Carga el JSON de perfil del estudiante con la cedula indicada."""
    profile_path = os.path.join(BASE_DIR, ci, 'profile.json')
    return parse_js_json(profile_path)


def format_field(profile_val, config_val):
    """
    Formatea un campo del perfil según si es singular o plural.
    Replica la lógica de formatField() del profile.js original.
    """
    if isinstance(profile_val, list):
        label = config_val[1] if len(profile_val) > 1 and isinstance(config_val, list) else (
            config_val[0] if isinstance(config_val, list) else config_val
        )
        value = ', '.join(profile_val)
    else:
        label = config_val[0] if isinstance(config_val, list) else config_val
        value = profile_val or ''
    return label, value


def generate_html(profile, config, lang):
    """Genera el HTML completo de la página de perfil de un estudiante."""
    site = config.get('site', ['ATI', '[UCV]', 'Log'])
    copyright_text = config.get('copyRight', '')
    search_placeholder = config.get('name', 'Nombre')
    search_btn = config.get('search', 'Buscar')
    profile_text = config.get('profile', 'Mi perfil')

    ci = profile.get('ci', '')
    name = profile.get('name', '')
    description = profile.get('description', '')
    image_ext = profile.get('image_ext', '.jpg')
    email = profile.get('email', '')

    # Campos con label singular/plural desde config
    color_label, color_val = format_field(profile.get('color', ''), config.get('color', ''))
    book_label, book_val = format_field(profile.get('book', []), config.get('book', ['', '']))
    music_label, music_val = format_field(profile.get('music', []), config.get('music', ['', '']))
    game_label, game_val = format_field(profile.get('video_game', []), config.get('video_game', ['', '']))
    lang_label = config.get('language', 'Lenguajes')
    lang_val = ', '.join(profile.get('language', [])) if isinstance(profile.get('language'), list) else profile.get('language', '')

    email_template = config.get('email', '[email]')
    email_html = email_template.replace('[email]', f'<a class="link-correo" href="mailto:{email}">{email}</a>')

    return f'''<!DOCTYPE html>
<html lang="{lang}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Perfil | {name}</title>
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
        <a href="profile.py?ci={ci}&lang={lang}" class="profile-link">
            <span class="profile-text">{profile_text}</span>
            <div class="user-icon">
                <img src="icon/userIcon.svg" alt="{profile_text}" class="icono">
            </div>
        </a>
    </header>

    <section class="main-content">
        <div class="content-img">
            <img class="img-profile" src="{ci}/{ci}Big{image_ext}" alt="{name}">
        </div>
        <div class="content-info">
            <h1 class="Nombre">{name}</h1>
            <p class="cover-letter">{description}</p>
            <table class="bullets">
                <tr>
                    <td class="td-label">{color_label}:</td>
                    <td>{color_val}</td>
                </tr>
                <tr>
                    <td class="td-label">{book_label}:</td>
                    <td>{book_val}</td>
                </tr>
                <tr>
                    <td class="td-label">{music_label}:</td>
                    <td>{music_val}</td>
                </tr>
                <tr>
                    <td class="td-label">{game_label}:</td>
                    <td>{game_val}</td>
                </tr>
                <tr style="font-weight:bold;">
                    <td class="td-label td-highlight">{lang_label}:</td>
                    <td class="td-highlight">{lang_val}</td>
                </tr>
            </table>
            <p class="bullets" style="margin-top:15px;">{email_html}</p>
        </div>
    </section>

    <footer>
        <p class="footer">{copyright_text}</p>
    </footer>

    <script>
        // AJAX Fetch: redirigir busqueda al index sin recargar el perfil
        const lang = '{lang}';

        function searchRedirect() {{
            const query = document.getElementById('search-input').value.trim();
            window.location.href = 'index.py?search=' + encodeURIComponent(query) + '&lang=' + lang;
        }}

        document.getElementById('search-btn').addEventListener('click', searchRedirect);
        document.getElementById('search-input').addEventListener('keydown', function (e) {{
            if (e.key === 'Enter') searchRedirect();
        }});

        // Menu hamburguesa
        const menuIcon = document.querySelector('.menu-icon');
        const header = document.querySelector('header');
        if (menuIcon && header) {{
            menuIcon.addEventListener('click', () => header.classList.toggle('menu-open'));
        }}

        // AJAX Fetch: registrar visita al perfil usando cookie de sesion
        fetch('profile.py?action=ping&ci={ci}&lang={lang}', {{ credentials: 'include' }})
            .then(r => r.json())
            .then(() => {{}})
            .catch(() => {{}});
    </script>
</body>
</html>'''


def _wsgi_app(environ, start_response):
    """Aplicación WSGI para la página de perfil individual."""
    from urllib.parse import parse_qs

    params = parse_qs(environ.get('QUERY_STRING', ''))
    lang = params.get('lang', ['es'])[0]
    ci_list = params.get('ci', [])
    action = params.get('action', [''])[0]

    # Sesión Beaker (cookie)
    session = environ.get('beaker.session', {})

    # Guardar último perfil visto en la sesión
    if ci_list:
        ci = ci_list[0]
        session['last_profile'] = ci
    else:
        ci = session.get('last_profile', '27279497')  # perfil por defecto

    if hasattr(session, 'save'):
        session.save()

    # Respuesta AJAX (solo JSON)
    if action == 'ping':
        body = json.dumps({'ok': True, 'last': ci}).encode('utf-8')
        start_response('200 OK', [
            ('Content-Type', 'application/json'),
            ('Content-Length', str(len(body)))
        ])
        return [body]

    # Cargar datos y generar HTML
    try:
        profile = load_profile(ci)
    except FileNotFoundError:
        body = b'<h1>Perfil no encontrado</h1>'
        start_response('404 Not Found', [('Content-Type', 'text/html')])
        return [body]

    config = load_config(lang)
    html = generate_html(profile, config, lang)
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
