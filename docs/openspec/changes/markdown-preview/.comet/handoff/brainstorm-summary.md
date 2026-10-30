# Design Brainstorm Summary

- Change: `markdown-preview`
- Phase: design
- Confirmed by user: yes
- Canonical spec: OpenSpec (`specs/markdown-preview/spec.md`)
- Spec patch: none

## Confirmed architecture

- `MarkdownTool.vue` owns state, layout, toolbar, and file import; `MarkdownEditor.vue` wraps CodeMirror 6; `MarkdownPreview.vue` renders and enhances preview content; `MarkdownToc.vue` owns the TOC.
- Pure logic lives in `src/utils/markdown/`: `render.ts`, `sanitize.ts`, `headings.ts`, `export.ts`, `storage.ts`.
- `Tool` gains an optional `fullWidth` flag. Only the Markdown tool opts into the full-width layout; other tools keep the 960px container.

## Confirmed rendering pipeline

`marked` (GFM + custom code renderer) -> `DOMPurify` -> `DOMParser` post-processing (heading ids, external links, image attributes) -> `v-html` -> async enhancements (KaTeX, Mermaid, code copy buttons, image error placeholders).

## Confirmed technical decisions

- CodeMirror 6 uses composed extensions rather than `basicSetup`; theme changes use a `Compartment`; no Vim/Emacs keymaps.
- KaTeX runs on the final DOM via auto-render, skipping `pre/code`; block math always renders, inline math follows its toggle; KaTeX JS/CSS load on first detected formula.
- Mermaid lazy-loads only when a mermaid fence exists, uses `securityLevel: 'strict'`, supports per-diagram source toggling, and discards stale async results with a render token.
- Desktop uses three columns: editor, preview, and a 240px TOC. Narrow screens switch to editor/preview tabs and render the TOC as a drawer.
- Preview body is centered with an 860px max width; code blocks and tables scroll horizontally inside the content area.
- Persistence uses `toolbox:markdown:content` (300ms debounce) and versioned `toolbox:markdown:settings` JSON. Clear removes content only and keeps view settings.
- Scroll sync maps scroll ratios with a `syncing` flag and `requestAnimationFrame` to avoid feedback loops.
- Copy HTML prefers `text/html` + `text/plain` clipboard payloads, removes every `data-md-ui` node, and keeps highlight spans, Mermaid SVG, and KaTeX MathML.

## Confirmed security decisions

- DOMPurify forbids `script`, `iframe`, `form`, `style`, `object`, `embed`, event attributes, and user inline `style`; GFM task-list inputs are explicitly preserved.
- External links get `target="_blank"` and `rel="noopener noreferrer"`; images get `referrerpolicy="no-referrer"` and a failure placeholder.
- Code block content is escaped by highlight.js and never concatenated as raw HTML.

## Risks and mitigations

- Mermaid/KaTeX bundle size -> load on demand.
- Preview replacement jumping scroll position -> save and restore `scrollTop`.
- Async enhancement races -> increment a render token and discard stale results.
- Global `base.css` resets lists and links -> restore Markdown semantics inside `.md-preview`.
- UI leaking into copied HTML -> mark every UI node with `data-md-ui` and strip it during export.

## Test strategy

Add Vitest + jsdom for pure logic and DOM post-processing: GFM/highlighting/Mermaid placeholders, DOMPurify dangerous content, heading slugs and TOC, HTML export, and persistence schema. Verify UI behavior with `npm run build` plus a manual matrix covering desktop/narrow screens, light/dark themes, splitter, import, copy, and async Mermaid/KaTeX.

## Environment note

Comet's Git worktree probe is incompatible with the system Git 2.34.1. Subsequent Comet commands run through the local compatibility shim at `/tmp/opencode/comet-git-shim`; the shim does not modify repository content.
