---
name: testing-upload-flow
description: Set up region-image-gallery locally and test the image upload -> gallery render flow end-to-end. Use when verifying upload, static-serving, or gallery changes.
---

# Testing the region-image-gallery upload flow

Full-stack app: Express API (port 5001) + React CRA dev server (port 3000) + MySQL.

## Local setup

1. **MySQL** (Docker). DB `region_image_gallery`, user `academyuser` / `userpassword` on `127.0.0.1:3306`. If a `rig-mysql` container already exists but is stopped, just `docker start rig-mysql` (data persists). Then run the project's migrate + seed scripts (see `package.json`).
2. **Backend:** `npm run dev` (serves on :5001). Health check: `GET http://localhost:5001/api/health` -> 200.
3. **Frontend:** `cd client && BROWSER=none PORT=3000 npm start`. Needs `client/.env` with `REACT_APP_API_URL=http://localhost:5001/api`. First compile takes ~20-30s; wait for `webpack compiled successfully`.

## Seeded login

`anilvaja.007@gmail.com` / `123` (region_id = 1). Verify with `SELECT id,email,region_id FROM users;`.

## End-to-end upload test (the golden path)

1. Log in at `/login` -> redirected to `/dashboard`, nav shows the user + region.
2. Create a project in "Create New Project".
3. **Reload the page** so the Upload form's "Select Project" dropdown picks up the new project (it only fetches projects on mount — it does NOT auto-refresh after create).
4. Choose an image file, click **Upload Image** -> "Image uploaded successfully!".
5. **Reload again** — the gallery ("Image Gallery - All Regions") also only fetches on mount and does not auto-refresh after upload.
6. Confirm the thumbnail renders (not a broken-image icon). The `<img src>` must be `http://localhost:5001/uploads/<projectId>/..._optimized.jpg` (API origin :5001, NOT the :3000 dev origin).

## Verifying the fix on disk / HTTP

```bash
find uploads -type f                 # uploaded file must be under uploads/<projectId>/
find src/uploads -type f             # must be EMPTY — files here = the path-mismatch bug regressed
curl -I http://localhost:5001/uploads/<projectId>/<name>_optimized.jpg   # expect 200 image/jpeg
```
The historical bug: multer wrote to `src/uploads/<projectId>` while Express served `<root>/uploads`. Both should now resolve via `src/config/paths.js` `UPLOADS_DIR`.

## Gotchas

- **Do NOT put test images in `/tmp`** — the VM `/tmp` can be wiped on restart, leaving a 0-byte/0.00 KB file that makes the UI upload fail with "Upload failed: Network Error". Create test assets in a persistent path like `~/test-assets/`. You can generate a valid PNG with the app's own `sharp` dep:
  ```bash
  node -e "require('sharp')({create:{width:600,height:400,channels:3,background:{r:30,g:120,b:220}}}).png().toFile(process.env.HOME+'/test-assets/test-upload.png')"
  ```
- To pick the file in the native GTK file chooser: click "Choose File", then `Ctrl+L` and type the absolute path, Enter.
- After upload, the UI confirms success but the gallery/dropdown need a page reload to reflect changes (see steps above).

## Devin Secrets Needed

None — all credentials are local-dev only (MySQL `academyuser`/`userpassword`, seeded login `123`). No external services required.
