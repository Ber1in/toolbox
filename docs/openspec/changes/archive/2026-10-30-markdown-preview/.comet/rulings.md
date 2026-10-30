# Markdown Preview — Build rulings and review evidence

## Review setup

- Review mode: `standard`
- Reviewer: independent `general` subagent session `ses_e744d5c0fffeKgsEP0zc9ZQ71k`, separate from the implementing session.
- Scope: rendering/security core (`render`, `sanitize`, `headings`, `export`, clipboard), workspace integration, persistence, accessibility, i18n and tests.
- Review rounds used: 2 (initial review + one re-review, the standard-mode limit).
- No CRITICAL finding was reported. The only remaining IMPORTANT after round 2 was fixed by the main agent and re-verified with the repository unit suite and the browser matrix.

## Round 1 findings and resolution

| Severity | Finding | Resolution |
| --- | --- | --- |
| IMPORTANT | Highlight.js classes were emitted but not styled | Added `.hljs-*` rules in `src/styles/markdown.css` backed by `--md-syntax-*`; browser check confirms token color differs from base code color |
| IMPORTANT | Image failure placeholder omitted alt text | Placeholder now renders `alt` (fallback `图片`) and the URL; browser check covers both |
| IMPORTANT | User classes could spoof fixed app chrome; modal label id could be hijacked | Chrome identity moved to `data-md-chrome` attributes stripped by DOMPurify; modal title id is per-instance; fixed/absolute selectors no longer use user-forgeable classes |
| IMPORTANT | Mobile TOC selection did not reveal the preview | `onTocSelect` switches to the preview tab on narrow screens before scrolling; browser check covers editor-tab selection |
| IMPORTANT | Scroll restore ran after async enhancements and could overwrite user scrolling | Restore happens immediately after `nextTick`, before async KaTeX/Mermaid work; browser matrix unaffected |
| MINOR | Inline `\(...\)` stayed enabled when inline math was off | Delimiters are conditional and inline detection covers `\(...\)`; browser check uses both `$` and `\(...\)` |
| MINOR | Heading id dedup missed an existing-id/reserved-id collision | Loop now checks `usedIds` and `reservedIds` unconditionally; unit test added |
| MINOR | Import cancel/failure races; whitespace-only content bypassed confirmation | Dialog closes immediately, in-flight reads are invalidated by token and source snapshot, overwrite check uses `source.length`, focus restored immediately |
| MINOR | Splitter cleanup missed `pointercancel`/window loss | Pointer listeners are removed on unmount and pointerup; keyboard and dblclick behavior verified |
| MINOR | Dynamic import failures could block later enhancements | KaTeX/Mermaid calls are individually caught; rejected cached promises are reset |
| MINOR | Mermaid fences had no copy control | Added raw-source copy button to the Mermaid toolbar; browser check copies the fence |
| MINOR | Overlay/preview accessibility gaps | Drawer/modal focus transfer, focus trap, Escape and focus restore added; preview scroller is focusable and labelled |
| MINOR | `useCopy` could report success after failure | `copy` returns a boolean; code/Mermaid copy buttons branch on it; HTML copy shows `复制 HTML 失败` |

## Round 2 finding and resolution

The re-review confirmed the functional fixes and reported one IMPORTANT issue: direct-child class selectors were still spoofable with user-created wrapper classes.

Resolution: app-owned chrome now uses `data-md-chrome` (`confirm`, `toc-backdrop`, `toc-drawer`, `drop-overlay`) on Vue-rendered elements. DOMPurify runs with `ALLOW_DATA_ATTR: false`, so user content cannot set that attribute. Fixed/absolute CSS rules select the attribute, not user-forgeable classes. Unit tests assert the attribute is stripped; the browser matrix injects a wrapped `.md-tool > .md-confirm[data-md-chrome]` payload and asserts the computed position is not fixed and no chrome attribute survives.

## Accepted minor items after round 2

- Scroll restoration preserves the numeric position before async layout changes. A user scroll during enhancement is no longer overwritten. A height delta above the viewport can still shift visible content; accepted for this release because the spec requires position preservation, not pixel-identical anchoring, and the browser matrix covers normal content.
- A failed lazy Mermaid/KaTeX chunk load is caught and logged; Mermaid blocks may remain blank and math stays as source. Accepted because all chunks are local and the build loads them successfully; a user-visible retry surface can be added later.
- The browser matrix is run from an external Playwright runner (`/tmp/opencode/playwright-runner`) rather than a committed dependency. The repository unit suite is the committed regression gate; the matrix and production audit are recorded below.

## Verification evidence

- `npm test`: 6 files, 28 tests passed.
- `npm run build`: `vue-tsc` and Vite production build passed.
- Browser interaction matrix (Playwright + Chromium 140): 70+ checks passed, covering editor typing/search/undo/redo/wrapping, splitter drag/keyboard/dblclick, scroll sync, TOC collapse/drawer/focus/Escape, theme re-render, language switch, import picker/cancel/overwrite/drop, clear semantics, rich HTML copy, code/Mermaid copy, image alt fallback, user chrome spoofing, inline-math delimiters, mobile tabs and persistence. No console or page errors.
- Production request audit (`npm run preview`, home + five regular tools + Markdown with Mermaid/KaTeX): 85 requests, 49 unique same-origin URLs, 0 external domains.
- Regression matrix: 35 cards, favorites, language switch, theme persistence, five regular tools keep the 960px container, Markdown keeps the full-width container and global nav, no console/page errors.
