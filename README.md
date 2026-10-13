# FIELD NOTES — writing and publishing

**Public blog:** https://frankbeatrice.github.io/field-notes/  
**Source:** https://github.com/FrankBeatrice/field-notes

Field Notes keeps its original Jekyll layouts, typographic design, site URL, archive, and Markdown posts.

## Sanity project: `bu13olof`

The Studio in `studio/` and the publishing workflow both target Sanity project **bu13olof**, dataset **production** by default. A project ID is public and does not require a secret.

### 1. Start and deploy the writing Studio

The Studio is a separate admin app, deployed to Sanity's hosting; it does not replace the reader-facing Jekyll site.

1. Confirm the `production` dataset exists for project `bu13olof` at https://www.sanity.io/manage.
2. With **Node.js >=22.12**, clone this repo locally:
   ```bash
   cd studio
   npm install
   npx sanity login
   npm run dev
   ```
3. From `studio/`, run `npm run deploy`; select a unique `*.sanity.studio` hostname. The browser will require Sanity authentication to edit documents. No token belongs in the repository.

If your dataset is not named `production`, make `studio/.env` by copying `studio/.env.example` and changing `SANITY_STUDIO_DATASET` to the correct name. Set the GitHub Actions variable `SANITY_DATASET` to the same name.

### 2. Enable automated publishing

**GitHub Pages must publish from GitHub Actions.** In https://github.com/FrankBeatrice/field-notes/settings/pages, select **Build and deployment → Source → GitHub Actions**. This is required because GitHub's branch-based Pages system **does not rebuild on commits pushed with the default GitHub Actions token**.

Once the pull request containing this integration is merged into `main`, the `Publish Field Notes` workflow:

- builds and publishes the site after ordinary pushes to `main`;
- synchronizes published Sanity articles on a manual run or approximately every 15 minutes;
- commits Sanity-managed Markdown into `_posts/` and deploys the rebuilt site directly through Pages;
- skips scheduled deployments when content has not changed.

Start a manual sync at **Actions → Publish Field Notes → Run workflow**. Scheduled Actions can run later than the exact cron time.

For a **public** Sanity dataset, no API token is needed. For a **private** dataset, add a Sanity **read-only** token as the GitHub Actions repository secret `SANITY_API_READ_TOKEN`. Never put tokens in Studio code, public pages, or GitHub variables.

### 3. Write in Sanity

In Studio, create a **Field Note**, enter title/subtitle/category, generate a slug, choose a publication date, enter rich text/images and click **Publish**. Save as draft to avoid publication.

The sync generates `_posts/YYYY-MM-DD-sanity-title.md` files with `/writing/title/` permalinks. It updates/removes only its own generated posts. Existing manually written files are never overwritten and remain editable via GitHub. Do not hand-edit generated Sanity Markdown.

**Existing articles are preserved, not automatically imported** into Sanity. Avoid reusing a slug already used by an existing post, which would create a Jekyll URL conflict.

### Troubleshooting

- Test synchronizer: `node --test scripts/sync-sanity.test.mjs`.
- On an HTTP 401/403 sync failure, confirm dataset visibility or the read-only token.
- On an HTTP 404, confirm the dataset name and project ID in Sanity Manage.
- On a Pages deploy failure, confirm Pages source is **GitHub Actions**, not **Deploy from a branch**.
- Unknown rich text types fail explicitly instead of silently dropping writing.
- Published Sanity documents are queried using the published perspective; unpublished drafts are not exported.

## Markdown publishing still works

Create `_posts/YYYY-MM-DD-your-title.md` and add YAML front matter:

```yaml
---
title: "Your title"
subtitle: "Optional one-line description"
category: Essays
---
```

Write beneath the header. `_drafts/` holds unpublished notes, `assets/images/posts/` holds local images, and `templates/post.md` is a copyable template.

Run a local Jekyll preview:

```bash
bundle install
bundle exec jekyll serve
```

## Project structure

- `studio/` — Sanity content editor
- `scripts/sync-sanity.mjs` — Sanity to Jekyll converter
- `.github/workflows/sanity-sync.yml` — automated sync **and** GitHub Pages deployment
- `_posts/` — handwritten posts and Sanity-generated articles
- `_layouts/`, `assets/css/style.css` — original design, unchanged
