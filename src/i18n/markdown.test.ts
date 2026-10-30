import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { en } from './en'

const markdownFiles = [
  '../tools/MarkdownTool.vue',
  '../components/tool/markdown/MarkdownEditor.vue',
  '../components/tool/markdown/MarkdownPreview.vue',
  '../components/tool/markdown/MarkdownToc.vue',
]

const cjkPattern = /[\u3400-\u9fff]/

function translationKeys(file: string): string[] {
  const source = readFileSync(new URL(file, import.meta.url), 'utf8')
  const keys = new Set<string>()

  for (const match of source.matchAll(/\bt\(\s*'([^']+)'/g)) {
    if (cjkPattern.test(match[1])) {
      keys.add(match[1])
    }
  }

  return [...keys]
}

describe('markdown i18n coverage', () => {
  it('has an English translation for every Chinese t() key in the Markdown UI', () => {
    const keys = markdownFiles.flatMap(translationKeys)
    const missing = keys.filter((key) => !(key in en))

    expect(keys.length).toBeGreaterThan(0)
    expect(missing).toEqual([])
  })
})
