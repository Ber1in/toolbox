/**
 * Clone the preview content and strip interactive-only chrome before it is
 * written to the clipboard. Highlight spans, Mermaid SVGs and KaTeX MathML are
 * content and must survive; data-md-ui nodes are buttons, headers and toggles.
 */
export function exportPreviewHtml(root: HTMLElement): string {
  const clone = root.cloneNode(true) as HTMLElement

  clone.querySelectorAll('[data-md-ui]').forEach((node) => node.remove())
  clone.querySelectorAll('.md-mermaid__source').forEach((node) => node.remove())

  return clone.innerHTML
}

/**
 * Write a rich HTML clipboard payload with a plain-text fallback. The plain
 * text intentionally uses the serialized HTML so pasting into a plain editor
 * still carries readable structure rather than an empty string.
 */
export async function copyHtmlToClipboard(html: string): Promise<boolean> {
  if (typeof navigator === 'undefined') {
    return false
  }

  if (navigator.clipboard?.write && typeof ClipboardItem !== 'undefined') {
    try {
      const item = new ClipboardItem({
        'text/html': new Blob([html], { type: 'text/html' }),
        'text/plain': new Blob([html], { type: 'text/plain' }),
      })
      await navigator.clipboard.write([item])
      return true
    } catch {
      // Fall through to the plain-text path below.
    }
  }

  try {
    await navigator.clipboard?.writeText(html)
    return typeof navigator.clipboard?.writeText === 'function'
  } catch {
    return false
  }
}
