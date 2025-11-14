# Assets & Licensing (MVP)

This file documents recommended asset sources, licensing guidance, and where to place visuals for the Typing Racer MVP.

## Recommended Sources

- UnDraw (https://undraw.co) — CC0 / free to use without attribution (great for illustrations).
- OpenMoji (https://openmoji.org) — open license; check source file for license details.
- Open-source icon sets: Heroicons, Feather, FontAwesome (verify license for distribution).

Prefer CC0 / public-domain or permissively-licensed assets for the MVP. If you use non-CC0 assets, include attribution in this file.

## Asset types & where to store

- Use simple, flat SVGs for cars/animals and UI icons (small file size, easy animation).
- Place frontend assets in `public/assets/` (Next.js) or `src/assets/` (Vite).
- Keep a small sprite or inline SVGs for avatars to reduce HTTP requests.

## Suggested files to include (example)

- `public/assets/avatars/car-blue.svg`
- `public/assets/avatars/animal-cat.svg`
- `public/assets/track/track-bg.svg`

## Attribution template

If an asset requires attribution, add a short entry here with the source and license. Example:

```
animal-cat.svg — OpenMoji (https://openmoji.org), license: OpenMoji License (see source file)
```

## Optimization suggestions

- Keep SVGs simple (no embedded raster images).
- Run SVGs through an optimizer (SVGO) before committing.
- Prefer inline SVG for animated icons to control colors with CSS.

## When adding assets

1. Add the file under `public/assets/`.
2. Add a line in this file with the asset path, source URL, and license.
3. If the asset has non-CC0 terms, include any required attribution or usage notes.

---

Update this document whenever new assets are added or licensing changes.
