# Jumbo

A concept landing page for a fictional large-file transfer SaaS, built with plain HTML, CSS and JavaScript. No frameworks, no build step, no dependencies.

> **Concept project.** Jumbo is not a real product. All copy, prices and statistics are placeholders.

**Live demo:** _add your link here_

<img width="1919" height="928" alt="screenshot" src="https://github.com/user-attachments/assets/fbd7db09-9264-4c23-aa38-299bdf3e0057" />

## Features

- **Animated hero:** headline words rise into place, and a canvas of orange dots drifts behind it and scatters away from the cursor.
- **Live transfer demo:** a simulated 48 GB upload with a progress bar, speed, time remaining and a replay button.
- **Count-up stats:** numbers animate when the section scrolls into view.
- **Scroll reveals:** sections fade up in a staggered sequence using `IntersectionObserver`.
- **Pricing:** monthly/yearly toggle with rolling number transitions, and plan cards that pop out and shake on hover.
- **FAQ:** native `<details>` elements, no JavaScript needed.
- **Scroll progress bar** fixed to the top of the page.

## Design

| Token | Value |
| --- | --- |
| Black | `#000000` |
| Orange | `#ff6a00` |
| Display font | Bricolage Grotesque |
| Body font | DM Sans |

All colors, fonts and widths are CSS variables in `:root` inside `style.css`, so retheming means editing one block.

## Quality notes

- Fully responsive, with a single-column layout below 56rem.
- Respects `prefers-reduced-motion`: animations are skipped and content shows in its final state.
- Semantic HTML with ARIA where needed (`role="progressbar"`, `aria-pressed` on toggles).
- Keyboard focus is visible on every interactive element.
- Safe-area insets handled for notched phones.

## Project structure

```
jumbo-site/
├── index.html   # markup
├── style.css    # tokens, layout, motion
└── script.js    # transfer demo, pricing toggle, animations
```

## Run it locally

Open `index.html` in a browser. To serve it instead:

```bash
npx serve .
```

## Customize

- **Rebrand:** change `--orange` and the font variables in `style.css`.
- **Copy and prices:** edit `index.html`. Pricing values live in `data-month` and `data-year` attributes.
- **Transfer demo:** adjust `TOTAL_GB` and `DURATION` at the top of the demo section in `script.js`.
- **Hover effect:** tweak `scale` and the `@keyframes shake` values in the "Plan hover" block of `style.css`.

## License

MIT. Use it, remix it, learn from it.
