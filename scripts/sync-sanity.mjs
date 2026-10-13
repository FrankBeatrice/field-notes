// Runs in GitHub Actions, not in the browser. No token is bundled into the site.
import {mkdir, readdir, readFile, writeFile, unlink} from 'node:fs/promises'
import {fileURLToPath} from 'node:url'
import path from 'node:path'
import {portableToMarkdown} from './portable-text.mjs'

const root = fileURLToPath(new URL('../', import.meta.url))
const postDir = path.join(root, '_posts')
const GENERATED = /^\d{4}-\d{2}-\d{2}-sanity-[a-z0-9-]+\.md$/

export function postToFile(post) {
  if (!post || typeof post._id !== 'string' || !post._id) throw new Error('Missing Sanity document ID')
  if (!post.title || typeof post.title !== 'string') throw new Error('Missing post title')
  if (typeof post.slug !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(post.slug)) {
    throw new Error('Invalid URL slug on post ' + post._id)
  }
  const publishedAt = new Date(post.publishedAt)
  if (!Number.isFinite(publishedAt.valueOf())) throw new Error('Invalid publishedAt on ' + post._id)
  const date = publishedAt.toISOString().slice(0, 10)
  const filename = date + '-sanity-' + post.slug + '.md'
  const content = [
    '---',
    'sanity_id: ' + JSON.stringify(post._id),
    'title: ' + JSON.stringify(post.title),
    'subtitle: ' + JSON.stringify(post.subtitle || ''),
    'category: ' + JSON.stringify(post.category || 'Notes'),
    'date: ' + JSON.stringify(publishedAt.toISOString()),
    'permalink: ' + JSON.stringify('/writing/' + post.slug + '/'),
    '---',
    '',
    portableToMarkdown(post.body),
  ].join('\n')
  return {filename, content}
}

export async function publishPosts(posts, directory = postDir) {
  if (!Array.isArray(posts)) throw new Error('Expected array of published posts')
  await mkdir(directory, {recursive: true})
  const wanted = new Map()
  const slugs = new Set()
  for (const post of posts) {
    const {filename, content} = postToFile(post)
    if (wanted.has(filename) || slugs.has(post.slug)) {
      throw new Error('Duplicate published Sanity slug: ' + post.slug)
    }
    wanted.set(filename, content)
    slugs.add(post.slug)
  }
  const existing = await readdir(directory)
  const generated = []
  for (const filename of existing.filter((name) => GENERATED.test(name))) {
    const content = await readFile(path.join(directory, filename), 'utf8')
    if (content.startsWith('---\nsanity_id: ')) generated.push(filename)
    else if (wanted.has(filename)) throw new Error('Refusing to overwrite a manually maintained post: ' + filename)
  }
  // Stage all content in memory and validate before making any changes.
  for (const [filename, content] of wanted) {
    const dest = path.join(directory, filename)
    let current
    try { current = await readFile(dest, 'utf8') } catch (error) {
      if (error.code !== 'ENOENT') throw error
    }
    if (current && !current.startsWith('---\nsanity_id: ')) {
      throw new Error('Refusing to overwrite an existing Markdown post: ' + filename)
    }
    if (current !== content) await writeFile(dest, content, 'utf8')
  }
  for (const filename of generated) {
    if (!wanted.has(filename)) await unlink(path.join(directory, filename))
  }
  return {published: wanted.size, removed: generated.filter((name) => !wanted.has(name)).length}
}

async function main() {
  // The project ID is public. A private dataset still needs a read-only token.
  const project = process.env.SANITY_PROJECT_ID || 'bu13olof'
  const dataset = process.env.SANITY_DATASET || 'production'
  if (!/^[a-z0-9-]+$/.test(project) || !/^[a-z0-9_-]+$/.test(dataset)) {
    throw new Error('Invalid SANITY_PROJECT_ID or SANITY_DATASET configuration')
  }
  const query = '*[_type == "post" && defined(title) && defined(slug.current) && defined(publishedAt)] | order(publishedAt asc) {_id,title,subtitle,category,publishedAt,"slug":slug.current,body[]{...,"assetUrl":asset->url}}'
  const url = new URL('https://' + project + '.api.sanity.io/v2025-02-19/data/query/' + dataset)
  url.searchParams.set('query', query)
  url.searchParams.set('perspective', 'published')
  const token = process.env.SANITY_API_READ_TOKEN
  const response = await fetch(url, {
    headers: token ? {Authorization: 'Bearer ' + token} : {},
  })
  if (!response.ok) throw new Error('Sanity query failed with HTTP ' + response.status)
  const payload = await response.json()
  if (payload.error || !Array.isArray(payload.result)) {
    throw new Error('Sanity query did not return published posts: ' + (payload.error?.description || 'invalid response'))
  }
  const result = await publishPosts(payload.result)
  console.log('Sanity sync complete:', result)
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error.message)
    process.exitCode = 1
  })
}
