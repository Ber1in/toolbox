import DOMPurify from 'dompurify'

const config = {
  FORBID_TAGS: ['script', 'iframe', 'form', 'style', 'object', 'embed'],
  FORBID_ATTR: ['style'],
  ADD_TAGS: ['input'],
  ADD_ATTR: ['type', 'checked', 'disabled', 'data-mermaid-index'],
  ALLOW_DATA_ATTR: false,
  ALLOW_ARIA_ATTR: true,
}

/**
 * Sanitize untrusted Markdown output before it reaches Vue's v-html.
 *
 * KaTeX, Mermaid and the preview chrome are added after this step, so their
 * trusted generated markup is not stripped by the sanitizer.
 */
export function sanitizeMarkdownHtml(html: string): string {
  return DOMPurify.sanitize(html, config)
}
