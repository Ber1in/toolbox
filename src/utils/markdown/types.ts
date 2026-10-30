/** A heading extracted from the rendered preview, used by the outline sidebar. */
export interface Heading {
  id: string
  level: number
  text: string
}

/** Nested outline node. */
export interface TocNode extends Heading {
  children: TocNode[]
}

/** Result of the marked render step. */
export interface RenderResult {
  html: string
  mermaidSources: string[]
}

/** Fully prepared preview data after sanitizing and DOM decoration. */
export interface PreparedMarkdown extends RenderResult {
  headings: Heading[]
  toc: TocNode[]
}
