#!/usr/bin/env python3
"""
Aggiorna navbar e footer su tutte le pagine HTML del sito.

Uso:
    python3 update_layout.py

Legge i template da templates/navbar.html e templates/footer.html,
sostituisce i percorsi relativi e le classi active,
e aggiorna tutte le pagine HTML in root e blog/.
"""

import os
import re
import glob

# Directory del progetto (dove si trova questo script)
PROJECT_DIR = os.path.dirname(os.path.abspath(__file__))

# File da escludere
EXCLUDE = {
    "google46036c070b9d332d.html",
}

# Mapping: nome file → voce nav attiva
# Le pagine non in lista non avranno nessuna voce attiva
NAV_ACTIVE_MAP = {
    "index.html": "Home",
    "servizi.html": "Servizi",
    "work.html": "Work",
    "chi-sono.html": "Chi sono",
    "faq.html": "FAQ",
    "blog.html": "Blog",
    "contatti.html": "Contatti",
}

# Mapping: nome file → voce bottom-bar attiva
BOTTOM_BAR_ACTIVE_MAP = {
    "index.html": "Home",
    "servizi.html": "Servizi",
    "work.html": "Work",
    "contatti.html": "Contatti",
}


def read_template(name):
    """Legge un file template dalla cartella templates/."""
    path = os.path.join(PROJECT_DIR, "templates", name)
    with open(path, "r", encoding="utf-8") as f:
        return f.read()


def get_prefix(filepath):
    """Restituisce il prefisso per i percorsi relativi."""
    rel = os.path.relpath(filepath, PROJECT_DIR)
    depth = rel.count(os.sep)
    if depth == 0:
        return ""
    return "../" * depth


def add_nav_active(html, active_name):
    """Aggiunge overlay__link--active alla voce nav corretta."""
    if not active_name:
        return html
    # Cerca la riga con il nome della voce e aggiungi la classe active
    pattern = r'(class="overlay__link)(">.*?<span class="overlay__name">' + re.escape(active_name) + r"</span>)"
    replacement = r'\1 overlay__link--active\2'
    return re.sub(pattern, replacement, html)


def add_bottom_bar_active(html, active_name):
    """Aggiunge bottom-bar__item--active alla voce bottom-bar corretta."""
    if not active_name:
        return html
    # Cerca il link della bottom bar con il label corretto
    pattern = (
        r'(class="bottom-bar__item)(">.*?<span class="bottom-bar__label">'
        + re.escape(active_name)
        + r"</span>)"
    )
    replacement = r'\1 bottom-bar__item--active\2'
    return re.sub(pattern, replacement, html, flags=re.DOTALL)


def replace_navbar(content, new_navbar):
    """Sostituisce la sezione navbar (header + overlay nav)."""
    match = re.search(r"\n\s*<!-- Header -->.*?</nav>\n?", content, re.DOTALL)
    if match:
        return content[: match.start()] + "\n" + new_navbar.rstrip("\n") + "\n" + content[match.end() :]
    print("  ATTENZIONE: marcatore navbar non trovato")
    return content


def replace_footer(content, new_footer):
    """Sostituisce la sezione footer (footer + bottom-bar + cookie + whatsapp)."""
    match = re.search(
        r"\n\s*<!-- Footer \(desktop\) -->.*?<!-- WhatsApp Button -->.*?</svg></a>\n?",
        content,
        re.DOTALL,
    )
    if match:
        return content[: match.start()] + "\n" + new_footer.rstrip("\n") + "\n" + content[match.end() :]
    print("  ATTENZIONE: marcatore footer non trovato")
    return content


def get_active_name(filepath):
    """Determina quale voce nav deve essere attiva per questo file."""
    rel = os.path.relpath(filepath, PROJECT_DIR)
    filename = os.path.basename(rel)
    # Pagine blog → Blog attivo
    if rel.startswith("blog" + os.sep):
        return "Blog"
    return NAV_ACTIVE_MAP.get(filename, None)


def get_bottom_bar_active_name(filepath):
    """Determina quale voce bottom-bar deve essere attiva."""
    rel = os.path.relpath(filepath, PROJECT_DIR)
    filename = os.path.basename(rel)
    if rel.startswith("blog" + os.sep):
        return None
    return BOTTOM_BAR_ACTIVE_MAP.get(filename, None)


def process_file(filepath, navbar_template, footer_template):
    """Processa un singolo file HTML."""
    rel = os.path.relpath(filepath, PROJECT_DIR)

    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    # Verifica che il file abbia i marcatori
    if "<!-- Header -->" not in content:
        print(f"  SKIP {rel}: nessun marcatore <!-- Header -->")
        return False
    if "<!-- Footer (desktop) -->" not in content:
        print(f"  SKIP {rel}: nessun marcatore <!-- Footer -->")
        return False

    # Calcola prefisso e classi active
    prefix = get_prefix(filepath)
    nav_active = get_active_name(filepath)
    bar_active = get_bottom_bar_active_name(filepath)

    # Prepara navbar
    navbar = navbar_template.replace("{prefix}", prefix)
    navbar = add_nav_active(navbar, nav_active)

    # Prepara footer
    footer = footer_template.replace("{prefix}", prefix)
    footer = add_bottom_bar_active(footer, bar_active)

    # Sostituisci nel contenuto
    new_content = replace_navbar(content, navbar)
    new_content = replace_footer(new_content, footer)

    if new_content == content:
        print(f"  INVARIATO {rel}")
        return False

    with open(filepath, "w", encoding="utf-8") as f:
        f.write(new_content)

    print(f"  AGGIORNATO {rel}")
    return True


def main():
    print("=" * 50)
    print("Aggiornamento navbar e footer")
    print("=" * 50)

    # Leggi template
    navbar_template = read_template("navbar.html")
    footer_template = read_template("footer.html")
    print(f"\nTemplate caricati da templates/\n")

    # Trova tutti i file HTML
    html_files = []

    # File nella root
    for f in glob.glob(os.path.join(PROJECT_DIR, "*.html")):
        if os.path.basename(f) not in EXCLUDE:
            html_files.append(f)

    # File nella cartella blog
    for f in glob.glob(os.path.join(PROJECT_DIR, "blog", "*.html")):
        html_files.append(f)

    html_files.sort()

    print(f"Trovati {len(html_files)} file HTML\n")

    updated = 0
    skipped = 0

    for filepath in html_files:
        if process_file(filepath, navbar_template, footer_template):
            updated += 1
        else:
            skipped += 1

    print(f"\n{'=' * 50}")
    print(f"Completato: {updated} aggiornati, {skipped} invariati/saltati")
    print(f"{'=' * 50}")


if __name__ == "__main__":
    main()
