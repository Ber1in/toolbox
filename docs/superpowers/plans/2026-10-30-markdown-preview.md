---
change: markdown-preview
design-doc: docs/openspec/changes/markdown-preview/design.md
base-ref: 2a56e4719c196226e1bb00197dc540e0b185d27f
---

# Markdown Preview Implementation Plan

<!-- comet-task-authority: docs/openspec/changes/markdown-preview/tasks.md -->

## Execution strategy

- Build mode: `autonomous`
- TDD mode: `direct` (focused tests for pure logic, build + manual matrix for UI integration)
- Review mode: `standard` (independent review for security/rendering core and the final integration review in Verify)
- Work is organized by independently acceptable outcomes. Commit after each coherent package with an English conventional message.
- No second checkbox list: task completion is recorded through `tasks.md` and `comet state task-complete`.

## Work package 1: Foundation

<!-- comet-task-ref:a568655a-b4cd-4e57-94d7-23ddc1094e9e -->
### 1.1 Dependencies

Scope: add CodeMirror 6 packages, `marked`, `dompurify`, `highlight.js`, `mermaid`, `katex`; add `vitest` and `jsdom` as dev dependencies. Update `package-lock.json`.

Acceptance: `npm install` completes without errors; `npm ls` shows the new direct dependencies; no runtime dependency is loaded from a CDN.

Depends: none.

<!-- comet-task-ref:901674df-2369-4475-9694-84cdac6ef655 -->
### 1.2 Test baseline

Scope: add `vitest.config.ts`, `npm test`, and a minimal test file under `src/utils/markdown/`. Use the `jsdom` environment for DOM-dependent tests.

Acceptance: `npm test` starts and passes the minimal test; the config is reusable by later suites.

Depends: 1.1.

<!-- comet-task-ref:d3d2a49f-d10f-4717-b3cb-a7bbcd155149 -->
### 1.3 Design tokens

Scope: add Markdown workspace, editor, preview, TOC, splitter, code block, image-error, search, and syntax-highlighting tokens to `src/styles/tokens.css`, including dark-theme overrides. Add `--font-mono` if absent.

Acceptance: `npm run build` accepts the token file; every new Markdown style will reference these tokens; no raw color or fixed dimension is introduced in feature CSS except documented layout tokens.

Depends: none.

## Work package 2: Tool entry and page shell

<!-- comet-task-ref:63301a14-591c-41d0-878a-109c008db950 -->
### 2.1 Tool data and registry

Scope: add `markdown` to the `text` category in `src/data/toolbox.ts` with name `Markdown 预览`, description `实时编辑与预览 Markdown`, and a suitable lucide icon. Register `MarkdownTool.vue` in `src/tools/registry.ts`.

Acceptance: `/tool/markdown` resolves; `npm run build` type-checks; the homepage text category shows the new card.

Depends: 1.3.

<!-- comet-task-ref:e1b022ce-8b51-4628-8354-01f02226353a -->
### 2.2 Full-width layout modifier

Scope: add optional `fullWidth?: boolean` to `Tool`; make `ToolView.vue` apply a wide modifier only when set. The Markdown entry sets it.

Acceptance: `/tool/markdown` uses the full available width; a non-Markdown tool such as `/tool/json` keeps its 960px container.

Depends: 2.1.

<!-- comet-task-ref:d9e22044-67df-4ffa-9705-f90391d2143d -->
### 2.3 Basic i18n

Scope: add English translations for the tool name, description, category, and the basic editor/preview/import/copy labels. All Chinese UI strings remain the dictionary keys.

Acceptance: switching to English on `/tool/markdown` shows no raw key or unintended Chinese fallback for the basic shell.

Depends: 2.1.

## Work package 3: Markdown rendering and security core

<!-- comet-task-ref:4aa8ef85-e766-4b0a-8301-a030839fbb45 -->
### 3.1 Renderer

Scope: implement `src/utils/markdown/render.ts` with marked GFM, a custom code renderer for Mermaid placeholders, highlight.js highlighting, and safe unknown-language escaping. Add `pipeline.ts` if needed to compose render -> sanitize -> heading decoration.

Acceptance: tests cover tables, task lists, fenced code, Mermaid fences, and unknown languages; `npm test` passes.

Depends: 1.1, 1.2.

<!-- comet-task-ref:2eef1504-318c-41b1-91ff-ea9795f3852b -->
### 3.2 Sanitizer

Scope: implement `src/utils/markdown/sanitize.ts` with DOMPurify. Forbid `script`, `iframe`, `form`, `style`, `object`, `embed`, event attributes, and user inline `style`. Allow the GFM task-list `input` and the Mermaid placeholder index.

Acceptance: tests assert dangerous tags, event attributes, and `javascript:` links are removed; task-list checkboxes survive.

Depends: 3.1.

<!-- comet-task-ref:5a2ce9be-9519-4a4e-afe5-cfcf89224667 -->
### 3.3 Headings and DOM decoration

Scope: implement `src/utils/markdown/headings.ts`: slugify h1-h4 text, deduplicate ids, return a heading list/tree, assign ids, add external-link attributes, image `referrerpolicy`/`loading`, and table wrappers.

Acceptance: tests cover duplicate headings, Chinese headings, level nesting, external links, and image attributes.

Depends: 3.2.

<!-- comet-task-ref:022caa3b-61bc-499f-81e5-6208383b20e6 -->
### 3.4 HTML export

Scope: implement `src/utils/markdown/export.ts`: clone the preview body, remove `[data-md-ui]` nodes, preserve highlight spans, Mermaid SVG, and KaTeX MathML; add rich clipboard write with plain-text fallback.

Acceptance: tests cover UI removal, content retention, and the fallback path.

Depends: 3.3.

<!-- comet-task-ref:210a6486-1d10-446e-8f49-b34e1bdbee1d -->
### 3.5 Persistence

Scope: implement `src/utils/markdown/storage.ts` for `toolbox:markdown:content` and versioned `toolbox:markdown:settings`; validate ratio range and recover from corrupt JSON.

Acceptance: tests cover defaults, save/load, out-of-range ratio, and corrupt data; storage failures degrade to memory.

Depends: 1.2.

## Work package 4: CodeMirror editor

<!-- comet-task-ref:2b33a976-06ea-4b19-9065-e47445fe9912 -->
### 4.1 Editor component

Scope: implement `src/components/tool/markdown/MarkdownEditor.vue` with line numbers, active-line highlight, bracket matching, search, wrapping, history, Markdown syntax, theme Compartment, model sync, and scroll/scroll-to-ratio API. No Vim/Emacs keymaps.

Acceptance: manual checks for typing, search, undo/redo, wrapping, and light/dark switching; `npm run build` passes.

Depends: 1.1, 1.3.

<!-- comet-task-ref:4e9a9753-5726-4092-8ae0-848e06c73248 -->
### 4.2 Editor styles

Scope: style the editor, gutter, active line, selection, cursor, search panel, and tooltip using tokens only.

Acceptance: grep finds no raw color value in the new feature CSS; light/dark contrast is readable; search panel does not overflow.

Depends: 4.1, 1.3.

## Work package 5: Preview and enhancements

<!-- comet-task-ref:8cd62c37-c0d9-4be9-ba11-fc850bddf76a -->
### 5.1 Preview shell

Scope: implement `src/components/tool/markdown/MarkdownPreview.vue`: sanitized `v-html`, scroll preservation across renders, heading id consumption, external link and image attributes, scroll-to-heading, active-heading emission, and scroll ratio API.

Acceptance: GFM sample renders; links open safely; image error placeholder appears; scroll position survives typing.

Depends: 3.3, 3.4.

<!-- comet-task-ref:f784a04c-53a7-4262-8abd-d6a346ebf007 -->
### 5.2 Highlight.js

Scope: register core plus common languages, render fenced code with `hljs` classes, and style `.hljs-*` with `--md-syntax-*` tokens.

Acceptance: JavaScript, JSON, Bash, and Python blocks highlight; unknown languages remain escaped plain text; themes switch cleanly.

Depends: 3.1, 1.3.

<!-- comet-task-ref:d99c4172-9e8c-4b7a-9610-8dbc4344ca28 -->
### 5.3 KaTeX

Scope: lazily import KaTeX auto-render and CSS when formulas exist; render block math always and inline math only when the toggle is on; skip `pre`, `code`, `script`, `style`, and `textarea`.

Acceptance: inline, block, and code-block `$` samples behave correctly; math survives HTML export as MathML.

Depends: 5.1, 3.4.

<!-- comet-task-ref:210bba7e-9235-4117-bba8-1fe7eb38908a -->
### 5.4 Mermaid

Scope: lazily import Mermaid when mermaid fences exist; initialize with `startOnLoad: false`, `securityLevel: 'strict'`, and the current theme; add per-diagram diagram/source switching and error fallback; discard stale async results.

Acceptance: valid flowchart renders; source toggle works; invalid syntax shows an error without breaking other blocks; theme changes re-render.

Depends: 3.1, 5.1.

<!-- comet-task-ref:6a7f0ba9-f2fb-4bef-b8f6-f693d474b27e -->
### 5.5 Code copy and image errors

Scope: wrap code blocks with a language label and raw-code copy button; attach image error listeners that replace failed images with an alt + URL placeholder.

Acceptance: each code block copies its raw source; a broken image shows a placeholder and no broken-image icon; UI nodes are marked `data-md-ui` for export removal.

Depends: 5.1, 5.2.

## Work package 6: Workspace interactions

<!-- comet-task-ref:307bfe1c-cc7b-4e12-963f-7a4fa172fd0e -->
### 6.1 Splitter

Scope: implement pointer drag, double-click reset, keyboard adjustment, 20%-80% clamping, ARIA separator attributes, and settings persistence.

Acceptance: default 50/50; double-click resets; ratio survives reload; keyboard arrows move the splitter.

Depends: 3.5, 4.1, 5.1.

<!-- comet-task-ref:8ef7e2bf-42a5-489f-a593-4e286ee4599f -->
### 6.2 Responsive layout

Scope: add a 900px breakpoint with editor/preview tabs and a TOC drawer with backdrop and close control.

Acceptance: 375px, 768px, and 1440px layouts are usable; no horizontal page overflow; only one main pane is visible on narrow screens.

Depends: 6.1.

<!-- comet-task-ref:9ea4ccf2-2ea7-4d38-94b5-5bfe93c4b15b -->
### 6.3 TOC

Scope: implement `MarkdownToc.vue`: h1-h4 items, auto-show at two or more headings, collapse persistence, click-to-scroll, active item highlight, and mobile drawer behavior.

Acceptance: multi-level TOC renders; clicking scrolls the preview; active item updates on scroll; collapsed state survives reload.

Depends: 3.3, 5.1, 6.2.

<!-- comet-task-ref:98737d28-cc73-4eeb-aa87-a26513f963b1 -->
### 6.4 Scroll sync

Scope: map editor and preview scroll ratios, default on, toggleable, with a `syncing` guard and requestAnimationFrame throttling.

Acceptance: scrolling either pane moves the other proportionally; disabling sync makes them independent; toggle state survives reload.

Depends: 4.1, 5.1, 3.5.

<!-- comet-task-ref:89928f6d-1f6c-4d92-86c8-898eee20e2a4 -->
### 6.5 Toolbar, import, clear, copy HTML

Scope: implement file picker and drag/drop for `.md`, `.markdown`, `.txt`; in-app overwrite confirmation; clear content while keeping settings; copy exported HTML with rich clipboard and text fallback.

Acceptance: import loads content; cancel leaves content unchanged; unsupported files show an error; clear keeps toggles; copy HTML excludes UI and retains highlighted code.

Depends: 3.4, 3.5, 5.5.

<!-- comet-task-ref:643b6e34-0cb8-4253-96c8-0128f72161d7 -->
### 6.6 Complete i18n

Scope: add every remaining Markdown UI string to `en.ts`; add a focused i18n test that scans the Markdown components for `t('中文…')` keys and asserts they exist in `en`.

Acceptance: `npm test` passes; English mode shows no unintended Chinese fallback; Chinese and English labels remain consistent.

Depends: 2.3, 6.5.

## Work package 7: Preview styling and documentation

<!-- comet-task-ref:99c379b0-7feb-4dab-bc9e-cb8af0d83687 -->
### 7.1 Preview typography

Scope: scope-reset lists, links, headings, blockquotes, tables, and code; center the 860px body; make code and tables scroll inside the preview; style images, Mermaid blocks, KaTeX display, and error placeholders.

Acceptance: wide tables and long code lines scroll inside the preview; the page itself does not overflow; light/dark typography is readable.

Depends: 5.2, 5.3, 5.4, 5.5.

<!-- comet-task-ref:ba0e3664-48d5-47ad-99d1-8e2da50f1aa7 -->
### 7.2 README

Scope: update both README languages: tool count 34 -> 35, text category list, stack, project structure, and localStorage privacy notes for `toolbox:markdown:*`. Do not mention design-source background or design-vs-implementation differences.

Acceptance: both languages agree; no stale count; no forbidden design-source references.

Depends: 6.6, 7.1.

## Work package 8: Integration verification

<!-- comet-task-ref:2f4923f9-fd5c-4636-8e0f-bd8145ec50e1 -->
### 8.1 Tests and build

Scope: run `npm test` and `npm run build`; record bundle-size change.

Acceptance: all tests pass; TypeScript and Vite build pass; no unexpected type errors.

Depends: all implementation tasks.

<!-- comet-task-ref:1ebf077e-98f8-4dc6-a2c9-14f15690a4a4 -->
### 8.2 Manual scenario matrix

Scope: verify GFM, Mermaid, KaTeX, import, splitter, themes, narrow tabs, TOC, scroll sync, copy HTML, and reload persistence.

Acceptance: no console errors; each scenario behaves as specified.

Depends: 8.1.

<!-- comet-task-ref:afb61a47-6264-4e81-ad62-3f4d0718b7c1 -->
### 8.3 Offline request audit

Scope: serve `dist/` with `npm run preview`; open a document with Mermaid and KaTeX; inspect the network panel.

Acceptance: all requests are same-origin; no CDN, remote font, or external API requests.

Depends: 8.1.

<!-- comet-task-ref:089015e0-3c27-475c-9539-5a09e732eb1b -->
### 8.4 Regression check

Scope: open five non-Markdown tools; check layout, favorites, language, and theme switching.

Acceptance: full-width modifier does not affect other tools; global nav and settings still work.

Depends: 8.1.

## Risk-based review plan

- Independent review before completion: `render.ts`, `sanitize.ts`, `headings.ts`, `export.ts`, and the clipboard path. These carry the security and data-integrity risk.
- Standard review for the editor/preview integration and responsive layout diff.
- Final integration review happens once in Verify, not in Build.
- Accepted deviations, if any, must be recorded with rationale and scope before the task is marked complete.

## Commit plan

- `feat(markdown): add renderer, sanitizer, and persistence core`
- `feat(markdown): add CodeMirror editor and preview shell`
- `feat(markdown): add workspace layout, TOC, and import/export`
- `docs(markdown): document the Markdown preview tool`
- Test and build fixes are folded into the relevant commit or a focused `test(markdown)`/`fix(markdown)` commit.
