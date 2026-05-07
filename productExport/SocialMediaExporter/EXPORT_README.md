# Social Post Helper export package

## What the product appears to be
This repo reads as a `web app`.

The evidence is direct:
- `README.md` describes a lightweight Next.js app for uploading media, extracting metadata, and generating deterministic social drafts.
- `package.json` contains a standard web app stack (`next`, `react`, `react-dom`, `typescript`).
- `next.config.ts` is configured for static export.
- `.github/workflows/deploy-pages.yml` shows a GitHub Pages deployment path for the exported site.

## Chosen framing
Chosen page framing: `field manual`

Reason:
- The product is practical, narrow, and workflow-heavy.
- The repo emphasizes constraints, clarity, and documented limits more than brand theater.
- A field-manual treatment fits the product better than a startup launch page or a generic portfolio card grid.

## Source material used
Public-safe repo sources used:
- `README.md`
- `package.json`
- `app/layout.tsx`
- `app/globals.css`
- `next.config.ts`
- `.github/workflows/deploy-pages.yml`
- `git log`

No secrets, tokens, private environment files, or hidden config were used.

## Assumptions made
- `supportUrl` and `privacyUrl` in `content.json` are placeholders for later central-site hookup.
- No repo screenshots, logos, or public-facing product art were available, so this package includes original SVG artwork in `productExport/assets/`.
- The wording avoids using the current uncommitted workspace changes as public claims. The export stays anchored to documented repo behavior and safe git history.

## URLs and fields that still need manual hookup later
- `supportUrl`: currently `/support/social-post-helper/` placeholder
- `privacyUrl`: currently `/privacy/social-post-helper/` placeholder
- Primary external product or repository URL: not set in this package
- Back-to-site link in `index.html`: currently `../../` placeholder for central import

## Main catalog / product card preview
- Suggested main preview asset: `./assets/social-post-helper-sheet.svg`
- Reason: it is the strongest self-contained visual in the export and reflects the product's contact-sheet / metadata-first character without faking a screenshot.

## Screenshot availability
- Real screenshots available in repo: `No`
- Export-generated diagrams included instead: `Yes`

## Support / privacy URL status
- Support URL final: `No`
- Privacy URL final: `No`
- Both are placeholders intended for the future central site.

## Integration summary
- Suggested destination path: `/products/social-post-helper/`
- Suggested support path if needed: `/support/social-post-helper/`
- Suggested privacy path if needed: `/privacy/social-post-helper/`
- Suggested catalog title: `Social Post Helper`
- Suggested catalog blurb: `A local-first web app that turns media metadata and manual context into editable social drafts without AI.`
- Suggested catalog image: `./assets/social-post-helper-sheet.svg`
- Suggested platform text: `Web`

## Future central-site import notes
- The export is self-contained and does not depend on npm, a framework runtime, or external libraries.
- `index.html` includes the required social and product meta tags.
- `content.json` is ready for catalog ingestion and records the repo reasoning, safe sources, and assumptions.
- The page is readable without JavaScript. No JS bundle is required.
- If the central site wants a raster social image later, replace `./assets/social-post-helper-sheet.svg` with a generated PNG and update the metadata tags plus `content.json`.

## Export checklist
- `productExport/index.html` present
- `productExport/styles.css` present
- `productExport/content.json` present
- `productExport/EXPORT_README.md` present
- `productExport/assets/` used for self-contained visual assets
- No obvious placeholder lorem text
- No unsupported product claims
- No secrets or private data exposed
