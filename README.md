# Your Favorite Plumbing — demo template

A one-page marketing site for a **fictional** plumbing company. Static HTML, CSS
and two JavaScript files: no framework, no build step, no dependencies. Every
image is drawn in SVG, so it ships with no photography at all.

It shares its bones with [the roofing template](../yourfavoriteroofing/README.md)
but not its skin: cool water palette, a different arrangement of every section,
and a different scroll centrepiece. Read *Placeholders* before it goes in front
of anyone.

## Run it

From this folder:

```sh
python -m http.server 4392 --bind 127.0.0.1
```

Then open <http://127.0.0.1:4392/>. Every asset and page link is relative, so the
same files work at a domain root, in a subfolder (a GitHub Pages project site,
for example) and on any static host. Opening `index.html` straight off disk is
the one case that still wants a server: browsers block the external `<use>`
reference to the icon sprite over `file://`, so the icons disappear.

No Python? Any static file server will do — `npx serve .`, `npx http-server`,
or the small one used for the preview, which lives in the workspace tooling
folder:

```sh
node ../.tmp/serve-folder.mjs "$PWD" 4392
```

## Deploy

Live now at <https://jasonmbrandon.github.io/plumbers/>, served by GitHub Pages
from `main` / `/ (root)`. The relative links are what make that subpath work.

Static, no build step, so any host will do. On another GitHub repo:
**Settings → Pages → Deploy from a branch → `main` / `/ (root)`**. On Netlify,
Vercel or Cloudflare Pages: take the folder (or the repo) with an empty build
command and `/` as the output directory. The only thing a host needs to leave
alone is the file names: `index.html` at the root, everything else under
`assets/`.

## The page, top to bottom

| Section | What it does |
| --- | --- |
| Hero (`#top`) | Copper pipe run, gate valve and a weeping joint at dusk. Headline, two calls to action, and the visit details as a full-width strip underneath |
| Behind the wall (`#anatomy`) | Cut-away of a bathroom wall with eight numbered parts. Click a chip *or* a chip on the diagram: the part lights, the rest dim, the copy changes |
| Follow the water (`#run`) | Pinned 340vh scene. Water leaves the street main, passes the meter, fills the tank, runs hot to the fixtures and leaves through the drain as you scroll |
| Services (`#services`) | Six job types as ruled rows with a circular icon and three deliverables each |
| Process (`#process`) | Five steps on the left with a rail that fills as you scroll; the heading follows them |
| Promises | Four commitments in a light band, two by two |
| Questions (`#faq`) | Seven native `<details>` answers, one open by default |
| Free leak check (`#quote`) | Form first, contact details second: name, phone, optional email, address/ZIP, job type, message |
| Footer | Brand, section links, contact, and the demo notice |

## The motion layer

Two files, both optional: drop the `<link>` and `<script>` pair and the page is
a still, complete site — every state that the scripts paint is also the state
the page loads in.

- **`assets/motion.js`** — one `requestAnimationFrame` loop for everything
  scroll-driven: a reading-progress hairline, hero parallax, the water run, the
  process rail, staggered reveals, and the pointer-tracking tilt on the four
  promise tiles.
- **`assets/motion.css`** — the pre-paint states for all of it, every rule gated
  on `html.js` so nothing can be left invisible if the script never runs.

**The water run.** Each pipe is three stacked strokes in one `<g class="seg">`:
a copper casing, a dark bore, and a water core. The core carries
`pathLength="1"`, so filling it is a single `stroke-dashoffset` per segment and
the script never has to measure a path. Segments are grouped by `data-w`, and
the groups fill in the order water travels:

| Scroll | Stage | What happens |
| --- | --- | --- |
| 0.00 – 0.06 | 01 Find the main | The curb stop turns and the street main fills |
| 0.06 – 0.22 | 01 Find the main | Water climbs the service line through the foundation |
| 0.20 – 0.46 | 02 Pressure | The meter passes it on, the gauge needle climbs, the cold rail fills to the fixtures |
| 0.44 – 0.72 | 03 Hot & cold | The tank fills, warms and turns copper; hot leaves the top and runs back along the wall |
| 0.72 – 0.97 | 04 Drain | Fixture drops, branch drain, stack and sewer fill |

Below 980px the section stops being pinned: the art sits above the steps and
the stage follows whichever step is on screen, because a 340vh scroll scene on
a phone is a trap.

**Reduced motion.** `prefers-reduced-motion: reduce` skips every effect. The
water run paints its finished state (everything filled, tank hot), reveals are
shown, the drip and wheel stop, and the progress hairline is removed.

## Interactions

- **Anatomy:** the list is a real tablist (arrow keys work); the numbered chips
  on the drawing are a second, pointer-style way in. Both drive the same state.
- **Navigation:** anchors, an active-section highlight, and a full-screen menu
  under 980px that closes on Escape, on a link, or on resize.
- **Form:** browser-side validation with a specific message per problem, a
  honeypot that quietly accepts bots, and an inline status line.
- **Cards:** the four promise tiles lift and lean toward a fine pointer, with a
  light that follows it. Touch and reduced motion get the plain lift.

## The form

Out of the box it **sends nothing**. It validates, then composes an email to
`hello@yourfavoriteplumbing.example` in the visitor's mail app and shows an
inline confirmation. That is honest for a demo and needs no account.

To collect submissions server-side, add one attribute to the form in
`index.html`:

```html
<form class="quote-form" data-quote-form data-endpoint="https://…">
```

With `data-endpoint` set, the script POSTs the fields as JSON, expects a 2xx,
and reports success or a call-us fallback. Anything that accepts JSON works:
Formspree, Basin, a Cloudflare Worker. Nothing is wired yet — that is a
decision for whoever buys the template, and it should get an approval before
anything is sent.

## Brand

| Token | Value | Used for |
| --- | --- | --- |
| `--ink` | `#061A24` | Hero, water run, before/after, quote, footer |
| `--ink-2` | `#0A2430` | Nav panel, secondary dark surfaces |
| `--paper` | `#F3F7F7` | Anatomy, services, process, FAQ |
| `--paper-2` | `#E4ECEC` | Promises band, icon discs |
| `--accent` | `#0F7D94` | Buttons, the second line of every heading, diagram chips |
| `--accent-light` | `#6FC6D6` | Headings and marks on dark |
| `--water` | `#2B93A8` | Water in the scene, progress hairline |

The one deliberate warm element is the pipework itself: the artwork in the hero,
the anatomy cut-away and the water run use copper (`#B87A3E` and its shadows),
because that is what the pipes are. Nothing in the interface is copper, so the
metal reads as the subject rather than the brand.

Headings are **Roboto Slab**, body and UI are **Montserrat** — both
self-hosted, variable, and copied from `../yourfavoriteroofing/assets/fonts/`.
Emphasis inside a heading is a weight change and a colour, never italics: the
Roboto Slab variable file has no italic axis, and a synthesised slant is not
the look.

## Placeholders — read before showing this to anyone

Nothing on the page is a fabricated statistic. There are no project counts,
years in business, star ratings, response times, review quotes or prices
anywhere, because none of those exist for a company that does not exist.
Everything else is a placeholder that must be replaced:

| Where | Placeholder | Replace with |
| --- | --- | --- |
| Header, hero, quote, footer, sticky bar | `(555) 010-0211` and `tel:+15550100211` | The real number — it appears in five `tel:` links |
| Quote section, footer | `hello@yourfavoriteplumbing.example` | The real inbox, and in `assets/site.js` (`EMAIL`) for the mailto fallback |
| Hero strip, quote, footer | "Your city and the towns around it" | The real service towns, ideally as a list (and in the schema, if you add one) |
| Footer | The demo notice | Delete it once the real business is behind the page |
| `<head>` | No canonical, no `og:url`, no `og:image`, no JSON-LD | Add them with the real domain, a 1200×630 card, and a `Plumber` schema — but only real details (no `aggregateRating` until there are real reviews) |

Claims written as service promises rather than facts — free leak check,
itemised estimate, workmanship warranty, dry when we leave, licensed and
insured — are deliberately unquantified. The page never states a licence number
or an insurance policy. If the real business cannot honour one of those, delete
the claim rather than soften it, and get the licence and certificate before
anything is mentioned on the page.

## If a real client takes this over

1. Swap the phone, email, service area and demo notice (table above).
2. Add their real photos. The hero and the anatomy drawing both assume a cool,
   dark palette and a front elevation, so warm daylight interior photos need
   their own section rather than these slots.
3. Point the form at an endpoint and test one submission end to end.
4. Add GA4 and mark the form submission as a conversion (`site.js` already
   composes the mailto, so hook the click, or add the event where the fetch
   succeeds).
5. Confirm what "emergency" actually means for them before adding the word —
   the page currently promises a phone call, not an arrival time.

## Files

```text
index.html              the whole page
assets/styles.css       base styles, layout overrides, components, responsive rules
assets/motion.css       pre-paint states for the scroll effects
assets/motion.js        scroll effects + the water run
assets/site.js          nav, anatomy, slider, form, scrollspy
assets/sprite.svg       UI icons (phone, arrow, check, drop, mail, pin, clock)
assets/favicon.svg      water-drop mark
assets/fonts/           Roboto Slab + Montserrat, variable woff2
```

## Photos (placeholders)

The six service rows and the quote band use Unsplash photos, hotlinked from
`images.unsplash.com` (free to use under the Unsplash License). They stand in
for the client's own job photos: swap each `src`/`srcset` in the services
section and the `quote-bg` style in `index.html` for real photos before launch.

| Where | Photo | By |
| --- | --- | --- |
| Leaks & bursts | unsplash.com/photos/wzIjLL4KB-4 | Timur Shakerzianov |
| Repipes | unsplash.com/photos/c5aW5Xy-O7c | Kelsey Todd |
| Water heaters | unsplash.com/photos/kxuz4YrLxSc | Timur Shakerzianov |
| Drains & blockages | unsplash.com/photos/ZLLm1ej0q-M | Yezhang Wang |
| Fixtures & bathrooms | unsplash.com/photos/6YEMkA-2ji8 | Peter Muniz |
| Leak detection | unsplash.com/photos/c314Gh8dXAo | Timur Shakerzianov |
| Quote band texture | unsplash.com/photos/4mAcustUNPs | Matt Artz |
