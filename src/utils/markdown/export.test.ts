import { afterEach, describe, expect, it, vi } from 'vitest'
import { copyHtmlToClipboard, exportPreviewHtml } from './export'

describe('exportPreviewHtml', () => {
  it('removes UI chrome while keeping highlighted content and generated graphics', () => {
    document.body.innerHTML = `
      <div class="preview">
        <h1>Title</h1>
        <pre><code><span class="hljs-keyword">const</span></code></pre>
        <div class="md-mermaid-block" data-mermaid-index="0">
          <svg><text>diagram</text></svg>
          <div class="md-mermaid-block__toolbar" data-md-ui><button>source</button></div>
          <pre class="md-mermaid-block__source" data-md-ui>graph TD</pre>
        </div>
        <span class="katex"><math><mi>x</mi></math></span>
        <button data-md-ui>copy</button>
      </div>
    `

    const root = document.querySelector('.preview') as HTMLElement
    const html = exportPreviewHtml(root)

    expect(html).toContain('<h1>Title</h1>')
    expect(html).toContain('hljs-keyword')
    expect(html).toContain('<svg>')
    expect(html).toContain('<math>')
    expect(html).not.toContain('data-md-ui')
    expect(html).not.toContain('data-mermaid-index')
    expect(html).not.toContain('graph TD')
  })

  it('unhides a Mermaid diagram when the source view was active', () => {
    document.body.innerHTML = `
      <div class="preview">
        <div class="md-mermaid-block">
          <div class="md-mermaid-block__diagram" hidden><svg><text>diagram</text></svg></div>
          <pre class="md-mermaid-block__source" data-md-ui>graph TD</pre>
        </div>
      </div>
    `

    const root = document.querySelector('.preview') as HTMLElement
    const html = exportPreviewHtml(root)

    expect(html).toContain('<svg>')
    expect(html).not.toContain('hidden')
    expect(html).not.toContain('graph TD')
  })
})

describe('copyHtmlToClipboard', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('falls back to writeText when rich clipboard support is unavailable', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    vi.stubGlobal('navigator', { clipboard: { writeText } })
    vi.stubGlobal('ClipboardItem', undefined)

    await expect(copyHtmlToClipboard('<p>hello</p>')).resolves.toBe(true)
    expect(writeText).toHaveBeenCalledWith('<p>hello</p>')
  })

  it('returns false when the clipboard write rejects', async () => {
    vi.stubGlobal('navigator', {
      clipboard: { writeText: vi.fn().mockRejectedValue(new Error('blocked')) },
    })
    vi.stubGlobal('ClipboardItem', undefined)

    await expect(copyHtmlToClipboard('<p>hello</p>')).resolves.toBe(false)
  })
})
