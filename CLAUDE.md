# Sibari Bonato - Sito Web Personale

## Panoramica
Sito web statico di **Sibari Bonato**, consulente di marketing strategico, fotografo professionista e designer con sede a **Gorizia, Friuli Venezia Giulia**. Il sito serve come vetrina professionale e punto di contatto per potenziali clienti.

## Stack Tecnologico
- **HTML5** semantico
- **CSS3** puro (no framework, no preprocessor)
- **JavaScript** vanilla (no librerie, no framework)
- Nessun build tool. I file vengono serviti direttamente.

## Struttura del Sito
```
/
├── index.html                          # Homepage
├── servizi.html                        # Pagina Servizi
├── chi-sono.html                       # Pagina Chi Sono
├── contatti.html                       # Pagina Contatti
├── logo-sibari-bonato.png       # Logo bianco per header (sfondo scuro)
├── Logo Sibari Bonato nero.png         # Logo nero (per uso su sfondo chiaro)
├── css/
│   └── style.css                       # Foglio di stile unico
├── js/
│   └── main.js                         # Script unico
├── foto-sito/                          # Portfolio fotografico (WebP)
├── img/                                # Immagini ottimizzate del sito
├── CLAUDE.md
└── robots.txt, sitemap.xml
```

## Design System

### Principi
- **Dark theme**: sfondo nero, testo chiaro, accent giallo neon
- **Glassmorphism**: navbar e alcune sezioni con background semitrasparente e backdrop-filter blur
- **Contrasto tipografico**: titoli weight 800, corpo weight 300 — parole chiave evidenziate in accent
- **Animazioni curate**: reveal on scroll, word-by-word titles, section lines animate

### Palette Colori
- **Sfondo** `#0A0A0A` — background principale
- **Superficie** `#141414` — card, feature boxes
- **Testo** `#F5F5F5` — testo principale
- **Testo muted** `rgba(245,245,245,0.5)` — testo secondario
- **Accent** `#E8FF00` — giallo neon, usato per CTA, parole chiave, bordi hover, cursore
- **Bordi** `rgba(255,255,255,0.08)` — bordi card e divisori sottili
- **Glass** `rgba(255,255,255,0.03)` — sfondo sezioni glassmorphism

### Tipografia
- **Font**: Plus Jakarta Sans (Google Fonts)
- **Pesi**: 300 (corpo), 600 (sottotitoli), 800 (titoli e parole accent)
- **Evidenziazione**: parole strategiche con `<strong class="accent">` → weight 800 + colore #E8FF00
- **Dimensioni**: base 17px, titoli fino a 56px
- **Line-height**: 1.6 corpo, 1.15 titoli
- **Letter-spacing**: -0.02em sui titoli

### Border Radius
- `8px` su tutti i riquadri: card, bottoni, gallery items, feature boxes, mappa

### Responsive
- Mobile-first
- Breakpoint principali: 768px (tablet), 1024px (desktop)

## Effetti & Animazioni

### CSS
- **Navbar**: `position: fixed`, `backdrop-filter: blur(20px)`, bordo inferiore appare allo scroll (classe `header--scrolled`)
- **Cards**: `background #141414`, `border 1px solid rgba(255,255,255,0.08)`, hover → `border-color: accent` + `translateY(-4px)`
- **Bottoni**: bordo accent, testo accent, hover fill dal basso con `::before` pseudo-element
- **Glassmorphism**: sezioni alternate con `background rgba(255,255,255,0.03)` e `backdrop-filter blur`

### JavaScript (Intersection Observer)
- **Section lines**: linea gialla `width: 0 → 60px`, animata 0.6s prima dei titoli di sezione
- **Word-by-word titles**: attributo `data-animate-words` → ogni parola entra dal basso con delay 0.1s staggered
- **Reveal elements**: classe `.reveal` → `opacity 0 + translateY(30px)` → `opacity 1 + translateY(0)` al viewport
- **Navbar scroll**: aggiunge `header--scrolled` quando `scrollY > 50`

### Cursore Personalizzato
- Cerchio giallo 12px, `mix-blend-mode: difference`, segue il mouse con lag (lerp 0.15)
- Si ingrandisce a 24px su elementi cliccabili (`a`, `button`)
- Nascosto su dispositivi touch (`@media pointer: coarse`)

## SEO

### Priorità: Ricerche Locali
- Title tag ottimizzati con keyword locali (Gorizia, Friuli Venezia Giulia)
- Meta description uniche per ogni pagina
- Schema.org markup (ProfessionalService, Service)
- Open Graph e Twitter Card meta tag

### Keyword Target
- "consulente marketing Gorizia"
- "marketing strategico Friuli Venezia Giulia"
- "designer Gorizia"
- "consulenza marketing Gorizia"
- "fotografo professionista Gorizia"
- "fotografia di prodotto Friuli Venezia Giulia"
- "fotografo aziendale Gorizia"

### Performance
- Immagini ottimizzate e lazy-loaded
- CSS e JS minimali (nessun file inutile)
- Core Web Vitals: LCP < 2.5s, CLS < 0.1

## Convenzioni di Codice

### HTML
- Markup semantico: `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<footer>`
- Attributi `alt` su tutte le immagini
- `lang="it"` sul tag `<html>`
- `<div class="cursor"></div>` nel body per cursore custom
- `data-animate-words` su H1/H2 per animazione parole
- `.reveal` su elementi che devono animare in entrata
- `.section-line` prima dei titoli di sezione

### CSS
- Classi in inglese (BEM-like: `block__element--modifier`)
- Custom properties per colori, spacing, font weights, radius
- No `!important`
- Ordine: posizionamento, box model, tipografia, visuale, transizioni

### JavaScript
- Vanilla JS, nessuna dipendenza
- `defer` sugli script
- Intersection Observer per tutte le animazioni scroll
- `requestAnimationFrame` per cursore custom
- Event delegation dove possibile

## Contatti
- **Email**: info@sibaribonato.com
- **Telefono**: +39 347 711 0097
- **Indirizzo**: Via Brass, 40 — Gorizia (GO)

## Contenuti
- Lingua: **italiano**
- Tono: professionale, diretto, senza fronzoli
- CTA chiare su ogni pagina
