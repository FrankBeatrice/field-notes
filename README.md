# FIELD NOTES — writer's blog

A Markdown-first writers' site for GitHub Pages. GitHub is the CMS: write a `.md` file, commit it, and the site publishes automatically.

## Publish a post in about one minute

### 1. In GitHub, open `_posts`
Click **Add file → Create new file**.

### 2. Name it
Use this exact pattern:

`YYYY-MM-DD-short-title.md`

Example:

`2026-10-01-night-of-july-13th.md`

### 3. Paste this at the top

```yaml
---
title: "Night of July 13th, 1972"
subtitle: "A story about memory, consequence, and what survives."
category: Fiction
---
```

Then write normally in Markdown underneath it.

### 4. Click **Commit changes**
That's it. GitHub Pages rebuilds the site automatically.

---

## Draft without publishing

Write unfinished pieces inside `_drafts/`. They stay private to the repository and do not appear on the live site.

When ready, move the file into `_posts/` and give it the dated filename above.

## Add an image

Upload the image to:

`assets/images/posts/`

Then place this in your Markdown:

```liquid
![Image description]({{ '/assets/images/posts/photo.jpg' | relative_url }})
```

## Copyable template

A clean starter post lives at:

`templates/post.md`

Copy its contents whenever you start a new piece.

## What Markdown can do

```markdown
## Heading

Normal paragraph.

**Bold text** and *italic text*.

> A pull quote.

- A list item
- Another item

[Link text](https://example.com)
```

## Where things live

- `_posts/` — published writing
- `_drafts/` — unpublished drafts
- `assets/images/posts/` — post images
- `templates/post.md` — blank post template
- `about.md` — About page
- `_config.yml` — site title, description, author
- `assets/css/style.css` — visual design

You should almost never need to touch the layout or CSS files after setup.

## First-time GitHub Pages setup

In the repository go to **Settings → Pages → Source → GitHub Actions**.

The included `.github/workflows/pages.yml` deploys every commit to `main` automatically.

## Local preview, if you ever want it

```bash
bundle install
bundle exec jekyll serve
```

Then open `http://localhost:4000`.
