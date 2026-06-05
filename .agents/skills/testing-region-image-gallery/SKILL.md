---
name: testing-region-image-gallery
description: End-to-end test the region-image-gallery web app (slider gallery, region/project filters, region page, nav routing, image upload). Use when verifying UI or gallery/filter API changes.
---

# Testing region-image-gallery

React frontend + Express/Sequelize backend + MySQL. The gallery is a **public** gallery (shows all regions/users), filterable by region and project. The Home page renders a saisei-style slider (one large image, `current / total` counter, prev/next arrows, thumbnail strip).

## Environment

- Backend: Express on `http://localhost:5001`, API under `/api`, static uploads served at `/uploads/...`.
- Frontend (dev): React (CRA `npm start`) on `http://localhost:3000`.
- DB: MySQL `region_image_gallery` (user `academyuser` / `userpassword`).
- Start order: MySQL → `npm run dev` (backend) → `cd client && npm start` (frontend).

### Devin Secrets Needed
- None for local testing. App uses a local DB; the seeded test login is `anilvaja.007@gmail.com` / `123` (region South). If a fresh DB, register a user instead.

## Common gotchas

- **Stale image URLs:** image `<img src>` must resolve against the API origin (`http://localhost:5001/uploads/...`), NOT the page origin (`:3000`). If images 404, check `resolveAssetUrl()` in `client/src/api.js` and that `client/.env` has `REACT_APP_API_URL=http://localhost:5001/api`.
- **Stale prebuilt bundle:** `client/build/` is committed. If serving the build, rebuild (`cd client && npm run build`) after source changes, or test via the dev server (`npm start`) which always reflects source.
- **Upload path:** uploads must land in the served `uploads/<projectId>/` dir (project root), not `src/uploads/`. Both are unified via a shared `UPLOADS_DIR` constant.
- **No auto-refresh originally:** gallery/dropdowns refresh via version counters lifted into the parent; a new upload/project should appear without a manual reload.

## Seeding demo data for filter testing

Filters are only demonstrable with images spread across multiple regions/projects. Seed several projects in different regions, each with a few images (e.g. from picsum.photos), so region counts differ (this proves filtering is real, not cosmetic). A one-off Node script using the app's Sequelize models works well.

## Core test flow (all via UI on :3000)

1. **Slider gallery** (no filters): counter reads `1 / <total>`; clicking the right arrow advances the counter and changes the main image. Keyboard ArrowLeft/ArrowRight also navigate.
2. **Region filter:** selecting a region updates the image count, sets URL `?region=<id>`, shows the region name in the caption, and scopes the Project dropdown to only that region's projects. Pick two regions with different counts to prove the filter is real.
3. **Project filter:** with a region selected that has multiple projects, selecting a project further narrows the count and sets URL `?region=<id>&project=<id>`.
4. **Region page** (`/region`): cards show per-region image counts matching the filter counts; clicking a card navigates to `/home?region=<id>` with the filter applied.
5. **Nav routing:** Home / Region / Project links route correctly and highlight the active tab. Project page shows the Upload form + project management.

## Evidence to capture

- Counter values before/after Next.
- Two regions with different counts + scoped project dropdown.
- URL query params reflecting filter state.
- Region card counts matching gallery counts.

## Notes

- No CI is configured on the repo, so there are no automated checks to wait on.
- `npm test` fails on the repo (server starts on import with no test DB) — pre-existing and unrelated to UI changes.
- Console may log React Router v7 future-flag warnings — non-blocking and cosmetic.
