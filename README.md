# FIELD NOTES — writing and publishing

**Public blog:** https://frankbeatrice.github.io/field-notes/  
**Repository:** https://github.com/FrankBeatrice/field-notes

Field Notes is a Jekyll blog published with GitHub Pages. Its typography, layouts, original Markdown posts, and URLs are preserved.

## Publish with Sanity Studio

A Sanity Studio now lives in `studio/`. It provides an editor for titles, subtitles, sections, publication dates, rich text, hyperlinks, lists, and inline images. **Nothing connects until you set your own Sanity project ID.** The integration does not create a Sanity account or project for you.

### 1. Create a project and deploy the editing studio

1. Create or select a project at https://www.sanity.io/manage (default dataset: `production`).
2. Install **Node.js 22.12+**, then in a local checkout of this repository:
   ```bash
   cd studio
   cp .env.example .env
   ```
3. Edit `studio/.env`, replacing `replace-with-your-project-id` with the **project ID** from Sanity Manage; change dataset if needed.
4. Run:
   ```bash
   npm install
   npx sanity login
   npm run dev
   ```
5. To host the editor on Sanity, run `npm run deploy` and select a `*.sanity.studio` hostname. Log in to that URL to write and publish.

The Studio is hosted by Sanity; **the reader-facing website remains on GitHub Pages.** Do not put access tokens in the repository or the public Studio config.

### 2. Connect publishing in GitHub

In the GitHub repository, open **Settings → Secrets and variables → Actions**.

Add these **repository variables** (not secrets):

| Variable | Value |
| --- | --- |
| `SANITY_PROJECT_ID` | Your Sanity project ID |
| `SANITY_DATASET` | `production` (or your dataset name) |

Public Sanity datasets need no token for reading published content. For a **private dataset**, additionally set `SANITY_API_READ_TOKEN` as an **Actions repository secret** with read-only privileges.

Go to **Actions → Publish Sanity posts → Run workflow** to publish immediately. The workflow also checks for new published posts approximately every 15 minutes; scheduled GitHub Actions runs can be delayed. Changes committed by this workflow trigger the existing GitHub Pages branch-based publishing process.

**Important:** In the repository's **Settings → Pages**, use **Deploy from a branch**, `main`, root `/` (native Jekyll). This project does not have a custom Pages deploy action.

### 3. Write and publish

In Studio, create a **Field Note**, fill the title, generate a URL slug, write the piece, and click **Publish**. Drafts never appear in the public export. Once the sync workflow runs, posts appear on the home page, Writing, Archive, and Jekyll RSS feed; Sanity images are served from Sanity's CDN.

The script writes new files to `_posts/YYYY-MM-DD-sanity-title.md` with a clean `/writing/title/` permalink. It updates Sanity-origin files as you edit and removes them if they are no longer published. **It never alters manually maintained Markdown posts.** Do not edit `sanity-*.md` files manually; Studio owns those files.

Existing Markdown articles remain on the site, but **are not automatically imported into Sanity**. They can continue to be edited using GitHub. Avoid giving a Sanity post the same slug as an existing Markdown post, or their Jekyll URLs would collide.

### Troubleshooting and testing

- `node --test scripts/sync-sanity.test.mjs` tests the sync and Markdown conversion (Node.js 22+).
- If the GitHub Action doesn't run, confirm repository variables and Actions permissions; the job is skipped until `SANITY_PROJECT_ID` is configured.
- A failed conversion (for example, an unsupported rich-text block) stops publishing rather than silently deleting part of a post.
- For private Sanity datasets, supply the read token in GitHub Actions **Secrets**, never `studio/.env` or a site page.
- The sync uses the published perspective of Sanity's Content Lake API. Unpublished changes remain private.

## Write directly in Markdown (still supported)

Create `_posts/YYYY-MM-DD-your-title.md`, with this header:

```yaml
---
title: "Your title"
subtitle: "Optional description"
category: Essay
---
```

Write in Markdown beneath it and commit the file. Drafts can be stored in `_drafts/` and post images in `assets/images/posts/`. A blank example is in `templates/post.md`.

Preview the Jekyll site locally:

```bash
bundle install
bundle exec jekyll serve
```

## Structure

- `studio/` — Sanity writing/editor workspace
- `scripts/sync-sanity.mjs` — Sanity published documents to Jekyll posts
- `.github/workflows/sanity-sync.yml` — scheduled/manual publishing
- `_posts/` — existing Markdown plus generated Sanity posts
- `_layouts/`, `assets/css/style.css` — unchanged site look
