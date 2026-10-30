import { extractHeadings } from './headings'
import { renderMarkdown } from './render'
import { sanitizeMarkdownHtml } from './sanitize'
import type { PreparedMarkdown } from './types'

/**
 * The single rendering pipeline used by the tool and by unit tests:
 * marked -> DOMPurify -> DOM decoration (heading ids, links, tables).
 */
export function prepareMarkdown(source: string): PreparedMarkdown {
  const rendered = renderMarkdown(source)
  const sanitized = sanitizeMarkdownHtml(rendered.html)
  const decorated = extractHeadings(sanitized)

  return {
    html: decorated.html,
    headings: decorated.headings,
    toc: decorated.toc,
    mermaidSources: rendered.mermaidSources,
  }
}
