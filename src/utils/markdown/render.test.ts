import { describe, expect, it } from 'vitest'
import { renderMarkdown } from './render'

describe('renderMarkdown', () => {
  it('renders GFM tables and task lists', () => {
    const { html } = renderMarkdown(
      '| Name | Value |\n| --- | --- |\n| one | 1 |\n\n- [x] done\n- [ ] todo',
    )

    expect(html).toContain('<table>')
    expect(html).toContain('type="checkbox"')
    expect(html).toContain('checked')
  })

  it('highlights fenced code with the registered language', () => {
    const { html } = renderMarkdown('```js\nconst answer = 42\n```')

    expect(html).toContain('class="hljs language-js"')
    expect(html).toContain('hljs-keyword')
  })

  it('turns mermaid fences into placeholders and keeps the source', () => {
    const { html, mermaidSources } = renderMarkdown('```mermaid\ngraph TD; A-->B\n```')

    expect(html).toContain('data-mermaid-index="0"')
    expect(mermaidSources).toEqual(['graph TD; A-->B'])
  })

  it('escapes unknown languages instead of injecting raw HTML', () => {
    const { html } = renderMarkdown('```unknown\n<script>alert(1)</script>\n```')

    expect(html).not.toContain('<script>')
    expect(html).toContain('&lt;script&gt;')
  })
})
