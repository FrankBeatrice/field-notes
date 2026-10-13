import test from 'node:test'
import assert from 'node:assert/strict'
import {mkdtemp, readFile, readdir, rm, writeFile} from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import {portableToMarkdown} from './portable-text.mjs'
import {postToFile, publishPosts} from './sync-sanity.mjs'

const block = (text, extra = {}) => ({
  _type: 'block',
  style: 'normal',
  children: [{_type: 'span', text, marks: []}],
  ...extra,
})
const post = (slug = 'hello-world') => ({
  _id: 'field-notes-1',
  title: 'Hello: "world"',
  slug,
  subtitle: 'An essay',
  category: 'Essays',
  publishedAt: '2026-10-13T11:00:00Z',
  body: [block('A new note.')],
})

test('renders Portable Text paragraphs, headings, lists and safe hyperlinks', () => {
  const markdown = portableToMarkdown([
    block('Heading', {style: 'h2'}),
    block('An idea'),
    block('First', {listItem: 'bullet'}),
    block('Second', {listItem: 'bullet'}),
    {
      _type: 'block', style: 'normal',
      children: [{_type: 'span', text: 'Sanity', marks: ['link1']}],
      markDefs: [{_key: 'link1', _type: 'link', href: 'https://www.sanity.io/'}],
    },
  ])
  assert.match(markdown, /^## Heading/)
  assert.match(markdown, /- First\n- Second/)
  assert.match(markdown, /\[Sanity\]\(https:\/\/www.sanity.io\/\)/)
})

test('rejects unsupported blocks, never silently loses writing', () => {
  assert.throws(() => portableToMarkdown([{_type: 'unsupported'}]), /Unsupported/)
})

test('generates safe front matter and human URLs', () => {
  const {filename, content} = postToFile(post())
  assert.equal(filename, '2026-10-13-sanity-hello-world.md')
  assert.match(content, /title: "Hello: \\"world\\""/)
  assert.match(content, /permalink: "\/writing\/hello-world\/"/)
  assert.throws(() => postToFile(post('../escape')), /Invalid URL slug/)
})

test('retains manual posts and removes only stale Sanity posts', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'field-notes-sanity-'))
  try {
    await writeFile(path.join(dir, '2026-10-12-manual.md'), 'My writing')
    await publishPosts([post()], dir)
    assert.match(await readFile(path.join(dir, '2026-10-13-sanity-hello-world.md'), 'utf8'), /A new note/)
    await publishPosts([], dir)
    assert.deepEqual(await readdir(dir), ['2026-10-12-manual.md'])
  } finally {
    await rm(dir, {recursive: true, force: true})
  }
})
