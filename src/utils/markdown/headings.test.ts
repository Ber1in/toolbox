import { describe, expect, it } from 'vitest'
import { extractHeadings, slugify } from './headings'

describe('extractHeadings', () => {
  it('generates unique ids and a nested outline', () => {
    const result = extractHeadings(
      '<h1>Hello</h1><h2>Hello</h2><h3>中文 标题</h3><h4>Details</h4>',
    )

    expect(result.headings.map((heading) => heading.id)).toEqual([
      'hello',
      'hello-2',
      '中文-标题',
      'details',
    ])
    expect(result.html).toContain('id="hello"')
    expect(result.html).toContain('id="hello-2"')
    expect(result.toc).toHaveLength(1)
    expect(result.toc[0].id).toBe('hello')
    expect(result.toc[0].children.map((node) => node.id)).toEqual(['hello-2'])
    expect(result.toc[0].children[0].children.map((node) => node.id)).toEqual([
      '中文-标题',
    ])
    expect(result.toc[0].children[0].children[0].children.map((node) => node.id)).toEqual([
      'details',
    ])
  })

  it('preserves a unique existing heading id', () => {
    const result = extractHeadings('<h2 id="intro">Introduction</h2>')

    expect(result.headings[0].id).toBe('intro')
  })

  it('adds safe external-link and image attributes', () => {
    const result = extractHeadings(
      '<a href="https://example.com">external</a><a href="#local">local</a><img src="https://example.com/a.png" alt="a">',
    )

    expect(result.html).toContain('target="_blank"')
    expect(result.html).toContain('rel="noopener noreferrer"')
    expect(result.html).toContain('referrerpolicy="no-referrer"')
    expect(result.html).toContain('loading="lazy"')
  })

  it('wraps tables for horizontal scrolling', () => {
    const result = extractHeadings('<table><tbody><tr><td>1</td></tr></tbody></table>')

    expect(result.html).toContain('class="md-table-wrap"')
  })
})

describe('slugify', () => {
  it('keeps letters and numbers while removing punctuation', () => {
    expect(slugify('Hello, World!')).toBe('hello-world')
  })
})
