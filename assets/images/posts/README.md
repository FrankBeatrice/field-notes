# Post images

Upload images for essays and notes into this folder.

Recommended filenames:

- `night-of-july-13-cover.jpg`
- `florence-notebook-01.jpg`
- `one-second-late-frame.jpg`

Then use in Markdown:

```liquid
![Description]({{ '/assets/images/posts/file-name.jpg' | relative_url }})
```
