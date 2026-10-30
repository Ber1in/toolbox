import type { Heading, TocNode } from './types'

const HEADING_SELECTOR = 'h1,h2,h3,h4'

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\p{L}\p{N}_-]+/gu, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

function buildToc(headings: Heading[]): TocNode[] {
  const roots: TocNode[] = []
  const stack: TocNode[] = []

  for (const heading of headings) {
    const node: TocNode = { ...heading, children: [] }

    while (stack.length > 0 && stack[stack.length - 1].level >= node.level) {
      stack.pop()
    }

    const parent = stack[stack.length - 1]
    if (parent) {
      parent.children.push(node)
    } else {
      roots.push(node)
    }

    stack.push(node)
  }

  return roots
}

function decorateLinks(doc: Document): void {
  doc.body.querySelectorAll('a[href]').forEach((anchor) => {
    const href = anchor.getAttribute('href') ?? ''

    if (/^\s*javascript:/i.test(href)) {
      anchor.removeAttribute('href')
      return
    }

    if (/^(?:https?:|ftp:)?\/\//i.test(href)) {
      anchor.setAttribute('target', '_blank')
      anchor.setAttribute('rel', 'noopener noreferrer')
    }
  })
}

function decorateImages(doc: Document): void {
  doc.body.querySelectorAll('img').forEach((image) => {
    image.setAttribute('referrerpolicy', 'no-referrer')
    image.setAttribute('loading', 'lazy')
    image.setAttribute('decoding', 'async')
  })
}

function restrictInputs(doc: Document): void {
  doc.body.querySelectorAll('input').forEach((input) => {
    if (input.type !== 'checkbox') {
      input.remove()
      return
    }

    // Task-list checkboxes are display-only; never allow a Markdown document
    // to create interactive form controls.
    input.disabled = true
  })
}

function decorateTaskLists(doc: Document): void {
  doc.body.querySelectorAll('li').forEach((item) => {
    const checkbox = item.querySelector(':scope > input[type="checkbox"]')
    if (!checkbox) return

    item.classList.add('task-list-item')
    item.parentElement?.classList.add('contains-task-list')
  })
}

function wrapTables(doc: Document): void {
  doc.body.querySelectorAll('table').forEach((table) => {
    if (table.parentElement?.classList.contains('md-table-wrap')) {
      return
    }

    const wrapper = doc.createElement('div')
    wrapper.className = 'md-table-wrap'
    table.parentNode?.insertBefore(wrapper, table)
    wrapper.appendChild(table)
  })
}

export interface HeadingExtraction {
  html: string
  headings: Heading[]
  toc: TocNode[]
}

/**
 * Decorate sanitized HTML with stable heading ids, safe external-link and image
 * attributes, and scrollable table wrappers. The returned HTML is safe to feed
 * into v-html because it comes from DOM nodes, not string concatenation.
 */
export function extractHeadings(html: string): HeadingExtraction {
  const doc = new DOMParser().parseFromString(`<body>${html}</body>`, 'text/html')
  const reservedIds = new Set<string>()

  doc.body.querySelectorAll('[id]').forEach((element) => {
    if (!element.matches(HEADING_SELECTOR)) {
      reservedIds.add(element.id)
    }
  })

  const usedIds = new Set<string>()
  const headings: Heading[] = []

  doc.body.querySelectorAll(HEADING_SELECTOR).forEach((element, index) => {
    const text = (element.textContent ?? '').trim()
    if (!text) {
      return
    }

    const level = Number(element.tagName.slice(1))
    const existingId = element.id.trim()
    const base = slugify(text) || `section-${index + 1}`
    let id = existingId && !usedIds.has(existingId) && !reservedIds.has(existingId) ? existingId : base
    let suffix = 2

    while (usedIds.has(id) || reservedIds.has(id)) {
      id = `${base}-${suffix}`
      suffix += 1
    }

    element.id = id
    usedIds.add(id)
    headings.push({ id, level, text })
  })

  decorateLinks(doc)
  decorateImages(doc)
  restrictInputs(doc)
  decorateTaskLists(doc)
  wrapTables(doc)

  return {
    html: doc.body.innerHTML,
    headings,
    toc: buildToc(headings),
  }
}

export { buildToc, slugify }
