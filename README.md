# doppelcheck/website

The public landing page for [Doppelcheck](https://github.com/doppelcheck/main) —
a browser extension that helps the user critically evaluate the article they're
reading: extract factual claims, look for existing fact-checks, search
independent sources, and surface contradictions inline.

This repo is a **static site** — plain HTML, CSS and a tiny bit of JavaScript.
No frameworks, no build step.

## What's in here

```
website/
├── index.html              one page, bilingual (DE / EN switch in the header)
├── assets/
│   ├── css/style.css       the stylesheet — IBM Plex, light/dark via light-dark()
│   ├── js/script.js        language toggle + theme toggle + scroll-reveal
│   ├── fonts/              IBM Plex Sans + Mono (SIL OFL 1.1)
│   ├── images/             logo, social icons
│   └── videos/             legacy explainer clips (kept for reference)
├── robots.txt              crawler policy, points at the sitemap
├── sitemap.xml             one entry — the site is a single page
├── LICENSE
└── README.md
```

`index.html` is the entire site. Every translatable element carries
`data-de` and `data-en` attributes; `script.js` swaps `textContent` based on the
`.lang-switch` button at the top right and persists the choice in
`localStorage`.

Type is **IBM Plex Mono** (display and accents) and **IBM Plex Sans** (body),
both bundled locally under `assets/fonts/` — the page loads no remote fonts and
makes no third-party requests.

The page follows the operating system's light/dark setting by default, via
`color-scheme: light dark` and `light-dark()` in the CSS. The ☀ · ☾ control in
the header pins one side explicitly and persists that choice in `localStorage`;
clicking the already-active side releases the pin and returns to following the
OS. While nothing is pinned, the marker tracks live OS changes.

## Run locally

Any static-file server works.

```bash
python -m http.server 8000
# → http://localhost:8000
```

Or just open `index.html` directly in a browser.

## Where the content comes from

The page describes the current Doppelcheck stack — a browser extension with an
optional companion local model server. The two source-of-truth repositories
are:

- [`doppelcheck/main`](https://github.com/doppelcheck/main) — the extension
  itself (WXT · React · TypeScript). The previous Python + FastAPI + Ollama +
  bookmarklet implementation is preserved unchanged in `legacy/`.
- [`doppelcheck/gemma-server`](https://github.com/doppelcheck/gemma-server) —
  zero-config local Gemma server, the recommended fully-local LLM tier.

If you change architecture in either of those repos, this site is the third
place that needs an update.

## Deploy

Upload the directory contents to any static host (GitHub Pages, Netlify,
Cloudflare Pages, S3+CloudFront, plain Nginx, …). There is no build step.

## License

MIT. See [LICENSE](LICENSE). IBM Plex fonts are licensed under SIL OFL 1.1.

## Contact

- Email: info@doppelcheck.com
- GitHub: <https://github.com/doppelcheck>
