# Social Post Helper (MVP)

Social Post Helper is a lightweight, local-first Next.js app that turns uploaded media metadata + manual context into editable social media draft text.

This MVP intentionally uses **no LLMs, no cloud AI, no OCR, and no paid AI APIs**.

## Purpose

Reduce manual effort when preparing posts for Instagram, Facebook, and YouTube by:

1. Uploading photos/videos.
2. Extracting available metadata.
3. Building a structured summary.
4. Generating rule-based drafts from templates.
5. Letting users edit/copy/export those drafts.

## Tech Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS
- `exifr` for metadata parsing
- Browser APIs (`Image`, `video`, `localStorage`, `clipboard`)

## Key MVP Features

- Drag/drop + picker upload flow.
- Multi-photo support plus one video per session.
- Metadata extraction:
  - created date
  - GPS
  - camera/device fields
  - image/video dimensions
  - video duration
- Optional reverse geocoding (OpenStreetMap/Nominatim) with coordinate fallback.
- Rule-based media classification (no AI).
- Manual context fields:
  - category
  - what happened
  - who it is for
  - extra notes
- Deterministic template generation:
  - Instagram caption
  - Facebook post
  - YouTube title variants (3)
  - YouTube description
  - YouTube upload summary
  - hashtag suggestions
  - alt text draft
  - generic short caption
- Editable output cards with:
  - in-place editing
  - copy button
  - reset-to-generated button
  - character count
  - short/medium/long template mode
- Preferences persisted in localStorage.
- Last session snapshot persisted in localStorage.
- Export drafts as JSON or plain text.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Start development server:

```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000).

### Optional validation

```bash
npm run test
npm run typecheck
npm run lint
npm run build
```

## Scripts

- `npm run dev` - start local dev server
- `npm run build` - production build
- `npm run start` - run production server
- `npm run test` - run unit tests (Vitest)
- `npm run test:watch` - run tests in watch mode
- `npm run typecheck` - TypeScript checks
- `npm run lint` - ESLint checks

## GitHub Pages Deployment

This project is configured for static export + GitHub Pages.

1. Push to the `main` branch.
2. In GitHub repo settings, enable Pages with:
   - Source: **GitHub Actions**
3. The workflow at [`.github/workflows/deploy-pages.yml`](/Users/azuredreams/Development/SocialMediaAutomated/.github/workflows/deploy-pages.yml) builds and deploys `out/`.

Notes:

- `next.config.ts` uses `output: \"export\"` for static output.
- The workflow sets `NEXT_PUBLIC_BASE_PATH=/<repo-name>` automatically so assets resolve correctly on Pages project URLs.
- For local simulation of a Pages build:

```bash
NEXT_PUBLIC_BASE_PATH=/your-repo-name npm run build
```

## Dependency List

Runtime dependencies:

- `next`
- `react`
- `react-dom`
- `exifr`

Dev dependencies:

- `typescript`
- `tailwindcss`
- `postcss`
- `autoprefixer`
- `eslint`
- `eslint-config-next`
- `@types/node`
- `@types/react`
- `@types/react-dom`

## Project Structure

```text
app/
  globals.css
  layout.tsx
  page.tsx
components/
  app-header.tsx
  detected-info-panel.tsx
  draft-card.tsx
  drafts-panel.tsx
  manual-context-form.tsx
  settings-drawer.tsx
  upload-dropzone.tsx
lib/
  constants.ts
  content-context.ts
  draft-generator.ts
  future-caption-generator.ts
  geocoding.ts
  media-classifier.ts
  metadata-extractor.ts
  mock-seed.ts
  output-formatter.ts
  storage.ts
  template-registry.ts
  types.ts
  utils.ts
```

## Architecture Notes

The code is intentionally modular so future AI integration is clean:

- `metadata-extractor` handles deterministic file parsing.
- `media-classifier` handles rule-based tags.
- `template-registry` + `draft-generator` handle platform/tone templates.
- `output-formatter` builds reusable template tokens.
- `storage` isolates localStorage concerns.
- `future-caption-generator` defines a plug-in interface for future LLM upgrades.

A TODO hook exists in `app/page.tsx` where enhanced caption generation can be integrated later.

## Test Coverage (MVP)

The current unit suite validates deterministic logic for:

- `media-classifier` aggregate tags and unsupported-file handling
- `content-context` summary/date/location composition
- `draft-generator` template behavior, platform toggles, hashtag constraints, and metadata-honest alt text

## MVP Limitations

- No transcript extraction or speech analysis.
- No OCR or visual scene understanding.
- No social API posting, scheduling, or OAuth.
- No user accounts or cloud database.
- HEIC preview display depends on browser support.
- Reverse geocoding depends on network availability and third-party uptime.
- Session restore restores metadata context and drafts, not original file blobs.

## Future LLM Integration Roadmap

Planned upgrades after MVP:

1. Rich media understanding (image/video-aware captioning).
2. Caption rewrite modes with stronger tone personalization.
3. Smarter SEO suggestions for YouTube title/description.
4. Better alt text quality with verified scene understanding.
5. Feedback loop for learning preferred writing style over time.

These should be implemented behind the `FutureCaptionGenerator` interface to avoid rewriting core deterministic modules.
