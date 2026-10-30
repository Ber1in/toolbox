import { describe, expect, it } from 'vitest'
import { sanitizeMarkdownHtml } from './sanitize'

describe('sanitizeMarkdownHtml', () => {
  it('removes scripts, event handlers and javascript URLs', () => {
    const html = sanitizeMarkdownHtml(
      '<script>alert(1)</script><img src="x" onerror="alert(1)"><a href="javascript:alert(1)">x</a>',
    )

    expect(html).not.toContain('<script')
    expect(html).not.toContain('onerror')
    expect(html).not.toContain('javascript:')
  })

  it('removes iframe, form, style, object, form controls and inline styles', () => {
    const html = sanitizeMarkdownHtml(
      '<iframe src="https://example.com"></iframe><form action="/x"><button>go</button><select><option>x</option></select><textarea></textarea><dialog>modal</dialog></form><style>body{}</style><object data="x"></object><p style="color:red">text</p>',
    )

    expect(html).not.toContain('<iframe')
    expect(html).not.toContain('<form')
    expect(html).not.toContain('<button')
    expect(html).not.toContain('<select')
    expect(html).not.toContain('<option')
    expect(html).not.toContain('<textarea')
    expect(html).not.toContain('<dialog')
    expect(html).not.toContain('<style')
    expect(html).not.toContain('<object')
    expect(html).not.toContain('style=')
  })

  it('strips app-owned chrome attributes from user content', () => {
    const html = sanitizeMarkdownHtml(
      '<div data-md-chrome="confirm" class="md-confirm">spoof</div>',
    )

    expect(html).not.toContain('data-md-chrome')
    expect(html).toContain('md-confirm')
  })

  it('keeps GFM task-list inputs and the Mermaid index', () => {
    const html = sanitizeMarkdownHtml(
      '<input type="checkbox" checked disabled><div class="md-mermaid" data-mermaid-index="0"></div>',
    )

    expect(html).toContain('<input')
    expect(html).toContain('type="checkbox"')
    expect(html).toContain('checked')
    expect(html).toContain('data-mermaid-index="0"')
  })
})
