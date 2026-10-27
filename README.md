# SL Secure — website

Static marketing site (plain HTML/CSS/JS, no build step, no frameworks, no tracking).

## Fill in your details (2 minutes)

Open **`site.config.js`** — it's the only file you need to edit. Replace every value that starts with `TODO:`
(phone, text number, email, service area, license #, hours, address, site URL). Anything still marked `TODO` is
hidden on the site automatically, so nothing fake ever shows.

- **Logo:** put your logo file in `assets/img/` and set `logo: "assets/img/your-logo.png"`. Leave `""` to keep the built-in SL Secure text logo.
- **Job photos:** put photos in `assets/img/` and list them under `photos` in the config. Until then the Gallery shows "Project photos coming soon."
- **Hero/section images** (`assets/img/hero.*`, `rack.*`, `intercom.*`) are generated illustrations, not photos of SL Secure jobs. Swap in real job photos (same file names) whenever you have them.

## Run locally

    python3 -m http.server 8000   # then open http://localhost:8000

## Publish on GitHub Pages

Push this folder to a GitHub repo, then Settings → Pages → Deploy from branch → `main` / root.
All paths are relative, so it works at `username.github.io/repo/` or on a custom domain.

## Files

- `index.html` — the page (hero, services, how it works, who we serve, gallery, FAQ, contact/quote)
- `styles.css` — design (dark navy + electric blue)
- `script.js` — fills in your details from the config, builds the quote message, adds Google business data (LocalBusiness JSON-LD)
- `site.config.js` — **your details**
- `favicon.svg`, `assets/img/` — logo, icons, images, link-preview image (`og-image.jpg`)
