# Flex & Flow — Pilates & Yoga Studio

A modern, responsive single-page website for **Flex & Flow**, a Pilates and yoga
studio. Built as a fast, lightweight static site (plain HTML, CSS and
JavaScript — no build step, no dependencies).

## Sections
- **Hero** — headline, intro and clear calls to action
- **Classes** — Pilates, Yoga and Beginner-friendly cards
- **About** — "a studio for every body", all abilities, feel good & grow
- **Pricing** — Pay as you go (£25), Gold membership (£200/mo unlimited), new client rate (£20)
- **Offers** — first session £20, 3 for £50, bring a friend free
- **Contact** — Name / Email / Message form
- **Footer**

## Preview locally
Just open `index.html` in a browser, or run a tiny local server:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Customising
- **Text & prices** — edit `index.html` directly.
- **Colours & fonts** — change the variables at the top of `styles.css`
  (`:root { --cream, --sage, --terracotta, --gold ... }`).
- **Photos** — the images currently use Unsplash URLs. Replace the URLs in
  `index.html` (and the hero/card `background-image` rules) with Kenna's own
  studio photos for a fully bespoke look. Self-hosting the images in an
  `/images` folder is recommended before going live.

## Contact form
The form currently validates input and shows a confirmation message on the
front end only — it does **not** send email yet. To receive real enquiries,
wire the form up to a service such as:
- [Formspree](https://formspree.io)
- [Netlify Forms](https://docs.netlify.com/forms/setup/) (if hosted on Netlify)
- or a custom backend endpoint.

See the note in `script.js` for where to connect it.

## Deploying
Because it's a static site, you can host it free on:
- **GitHub Pages**, **Netlify**, **Vercel**, or **Cloudflare Pages** — just
  point them at this repository.
