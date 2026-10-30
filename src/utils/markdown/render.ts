import hljs from 'highlight.js/lib/core'
import bash from 'highlight.js/lib/languages/bash'
import c from 'highlight.js/lib/languages/c'
import cpp from 'highlight.js/lib/languages/cpp'
import csharp from 'highlight.js/lib/languages/csharp'
import css from 'highlight.js/lib/languages/css'
import go from 'highlight.js/lib/languages/go'
import java from 'highlight.js/lib/languages/java'
import javascript from 'highlight.js/lib/languages/javascript'
import json from 'highlight.js/lib/languages/json'
import markdown from 'highlight.js/lib/languages/markdown'
import php from 'highlight.js/lib/languages/php'
import python from 'highlight.js/lib/languages/python'
import ruby from 'highlight.js/lib/languages/ruby'
import rust from 'highlight.js/lib/languages/rust'
import sql from 'highlight.js/lib/languages/sql'
import typescript from 'highlight.js/lib/languages/typescript'
import xml from 'highlight.js/lib/languages/xml'
import yaml from 'highlight.js/lib/languages/yaml'
import { Marked, Renderer } from 'marked'
import type { RenderResult } from './types'

const languages = {
  bash,
  c,
  cpp,
  csharp,
  css,
  go,
  java,
  javascript,
  json,
  markdown,
  php,
  python,
  ruby,
  rust,
  sql,
  typescript,
  xml,
  yaml,
}

for (const [name, definition] of Object.entries(languages)) {
  hljs.registerLanguage(name, definition)
}

hljs.registerAliases(['js', 'jsx', 'mjs', 'cjs'], { languageName: 'javascript' })
hljs.registerAliases(['ts', 'tsx'], { languageName: 'typescript' })
hljs.registerAliases(['sh', 'shell', 'zsh'], { languageName: 'bash' })
hljs.registerAliases(['html', 'svg'], { languageName: 'xml' })
hljs.registerAliases(['yml'], { languageName: 'yaml' })
hljs.registerAliases(['md'], { languageName: 'markdown' })

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function firstLanguage(lang: string | undefined): string {
  return (lang ?? '').trim().split(/\s+/)[0]?.toLowerCase() ?? ''
}

function renderCodeBlock(text: string, lang: string | undefined, mermaidSources: string[]): string {
  const language = firstLanguage(lang)

  if (language === 'mermaid') {
    const index = mermaidSources.length
    mermaidSources.push(text)
    return `<div class="md-mermaid" data-mermaid-index="${index}"></div>`
  }

  if (language && hljs.getLanguage(language)) {
    const highlighted = hljs.highlight(text, { language, ignoreIllegals: true }).value
    return `<pre><code class="hljs language-${escapeHtml(language)}">${highlighted}</code></pre>`
  }

  return `<pre><code class="hljs">${escapeHtml(text)}</code></pre>`
}

/**
 * Render Markdown to HTML. Security is handled by the sanitize step, so this
 * function intentionally returns raw rendered HTML and Mermaid sources.
 */
export function renderMarkdown(source: string): RenderResult {
  const mermaidSources: string[] = []
  const renderer = new Renderer()

  renderer.code = ({ text, lang }) => renderCodeBlock(text, lang, mermaidSources)

  const marked = new Marked({
    gfm: true,
    breaks: false,
    renderer,
  })

  const html = marked.parse(source) as string
  return { html, mermaidSources }
}
