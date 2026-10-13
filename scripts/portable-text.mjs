// Render the Portable Text features offered by Field Notes Studio into Jekyll Markdown.
// Unknown block types are rejected rather than silently dropping a writer's work.

function escapeMarkdown(value) {
  return String(value ?? '').replace(/([\\*`_{}\[\]<>])/g, '\\$1')
}

function safeLink(href) {
  if (typeof href !== 'string') return null
  try {
    const url = new URL(href)
    return ['https:', 'http:', 'mailto:'].includes(url.protocol) ? url.toString().replace(/\)/g, '%29') : null
  } catch {
    return null
  }
}

export function inlineMarkdown(block) {
  const definitions = new Map((block.markDefs || []).map((item) => [item._key, item]))
  return (block.children || []).map((span) => {
    if (span._type !== 'span') throw new Error('Unsupported Portable Text inline node')
    let text = escapeMarkdown(span.text)
    for (const mark of span.marks || []) {
      const annotation = definitions.get(mark)
      if (annotation) {
        if (annotation._type !== 'link') throw new Error('Unsupported inline annotation: ' + annotation._type)
        const href = safeLink(annotation.href)
        if (href) text = '[' + text + '](' + href + ')'
      } else if (mark === 'strong') text = '**' + text + '**'
      else if (mark === 'em') text = '*' + text + '*'
      else if (mark === 'code') text = '`' + text.replace(/`/g, '\\`') + '`'
      else if (mark === 'strike-through') text = '~~' + text + '~~'
      else throw new Error('Unsupported Portable Text mark: ' + mark)
    }
    return text
  }).join('')
}

function imageMarkdown(block) {
  const assetUrl = safeLink(block.assetUrl)
  if (!assetUrl || new URL(assetUrl).hostname !== 'cdn.sanity.io') {
    throw new Error('An image must have a published Sanity CDN asset')
  }
  const alt = escapeMarkdown(block.alt || block.caption || '')
  const caption = block.caption ? '\n\n*' + escapeMarkdown(block.caption) + '*' : ''
  return '![' + alt + '](' + assetUrl + ')' + caption
}

export function portableToMarkdown(body) {
  if (!Array.isArray(body)) throw new Error('Post body must be an array of Portable Text blocks')
  const parts = []
  let list = []
  const flushList = () => {
    if (list.length) parts.push(list.join('\n'))
    list = []
  }
  for (const block of body) {
    if (block._type === 'image') {
      flushList()
      parts.push(imageMarkdown(block))
    } else if (block._type === 'block') {
      const content = inlineMarkdown(block)
      if (block.listItem) {
        if (!['bullet', 'number'].includes(block.listItem)) throw new Error('Unsupported list type')
        const level = Math.max(1, Math.min(6, Number(block.level) || 1))
        list.push('  '.repeat(level - 1) + (block.listItem === 'number' ? '1. ' : '- ') + content)
      } else {
        flushList()
        const style = block.style || 'normal'
        if (style === 'normal') parts.push(content)
        else if (['h2', 'h3'].includes(style)) parts.push('#'.repeat(Number(style[1])) + ' ' + content)
        else if (style === 'blockquote') parts.push(content.split('\n').map((line) => '> ' + line).join('\n'))
        else throw new Error('Unsupported block style: ' + style)
      }
    } else {
      throw new Error('Unsupported Portable Text block: ' + block._type)
    }
  }
  flushList()
  return parts.join('\n\n').trim() + '\n'
}
