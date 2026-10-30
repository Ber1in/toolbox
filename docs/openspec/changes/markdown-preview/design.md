---
comet_change: markdown-preview
role: technical-design
canonical_spec: openspec
---

# Design

## Context

见 `proposal.md` 的 Why。当前项目是 Vite + Vue 3 + TypeScript 的单页应用，工具页由 `src/views/ToolView.vue` 统一承载，内容宽度受 `--tool-max: 960px` 限制；数据源是 `src/data/toolbox.ts`，组件通过 `src/tools/registry.ts` 注册；样式全部使用 `src/styles/tokens.css` 中的 CSS 变量，并已有明暗两套主题。

本次需要在不影响既有 34 个工具的前提下，新增一个高交互、全宽、纯浏览器本地的 Markdown 工作区。主要约束：

- 所有第三方库随应用打包，运行时不得请求 CDN、字体或远程 API。
- 中文原文是 i18n 字典 key，新增文案必须同步英文。
- 不能散落硬编码颜色、间距、圆角；新增视觉值必须进入设计令牌。
- Markdown 可包含不可信 HTML，必须经过清洗后才能进入 DOM。
- 工具页需要保持现有导航、收藏、返回和页脚结构。

## Goals / Non-Goals

**Goals:**

- 提供可长期使用的双栏 Markdown 编辑/预览工作区，编辑和预览滚动独立且可联动。
- 将渲染、清洗、目录、公式、图表、文件导入和 HTML 导出拆成可测试的纯逻辑与可复用的视图层。
- 在明暗主题、桌面/窄屏、大文档和异步图表渲染下保持稳定。
- 新增依赖按需加载，避免首屏无条件加载 Mermaid 和 KaTeX 资源。

**Non-Goals:**

- 不实现多人协作、云同步、账号体系或服务端渲染。
- 不实现 Markdown lint、脚注、标题永久链接、独立 HTML 文件导出、打印/PDF。
- 不引入 Vim/Emacs 键位、可配置快捷键系统或多文件标签。
- 不替换现有 i18n、主题或收藏机制，也不引入 Pinia 等全局状态库。

## Decisions

### 1. 工具集成：独立组件 + 全宽页面修饰符

在 `src/data/toolbox.ts` 的 `text` 分类新增 `markdown` 条目，并给 `Tool` 增加可选的 `fullWidth?: boolean`。`ToolView.vue` 根据该标记给页面根节点和内容容器添加 `tool-page--wide` / `tool-page__inner--wide`，仅对 Markdown 工具取消 960px 限制；其余工具保持现状。

`MarkdownTool.vue` 作为状态与布局容器，拆出：

- `MarkdownEditor.vue`：CodeMirror 6 封装，只负责编辑、主题和滚动事件。
- `MarkdownPreview.vue`：渲染结果、目录、代码复制按钮、图片错误占位和异步增强。
- `MarkdownToc.vue`：目录树、折叠和当前标题高亮。
- `src/utils/markdown/`：`render.ts`（marked 渲染）、`sanitize.ts`（DOMPurify 配置）、`headings.ts`（目录提取）、`export.ts`（HTML 导出）、`storage.ts`（持久化 schema）。

不引入全局 store。工具内部状态由 `MarkdownTool.vue` 持有，子组件通过 props/emits 通信，便于单工具卸载时释放 CodeMirror、Mermaid 和滚动监听。

**替代方案：** 继续把所有逻辑塞进单个 `MarkdownTool.vue`。文件会超过千行，渲染、清洗和 DOM 增强难以测试，故不采用。

### 2. 编辑器：CodeMirror 6，按需组合扩展

使用 CodeMirror 6 的独立包，按需组合扩展，不使用包含自动补全和 lint 的 `basicSetup`：

- 行号、当前行与 gutter 高亮、括号匹配、搜索、历史记录、自动换行、选区高亮。
- `@codemirror/lang-markdown` 提供 Markdown 语法；不引入 `@codemirror/language-data`，避免为围栏代码块加载大量语言包。预览侧的高亮由 highlight.js 负责，编辑器侧只需要 Markdown 结构高亮。
- 通过 `EditorView.theme` 使用 CSS 变量定义编辑器外观；主题切换用 `Compartment` 重新配置，避免销毁并重建编辑器。
- `modelValue` 变化时比较文档内容再 dispatch，文件导入和清空也走同一条更新路径；编辑器内部变化通过 `update:modelValue` 回传。
- 滚动同步监听 `EditorView.scrollDOM`，不监听整个页面。

**替代方案：** 原生 `textarea` + 透明高亮层。实现简单，但行号、搜索、括号匹配和撤销体验不足，不采用。Monaco 体积和主题适配成本更高，也不采用。

### 3. 渲染管线：marked -> DOMPurify -> DOM 增强

统一管线：

```text
Markdown source
  -> marked.parse（GFM + 自定义 code renderer）
  -> DOMPurify.sanitize（不可信 HTML 在此终止）
  -> DOMParser 后处理（标题 id、外链、图片属性）
  -> v-html 写入预览容器
  -> 异步增强（KaTeX、Mermaid、代码复制按钮、图片错误监听）
```

- `marked` 开启 `gfm: true`，使用自定义 `code` renderer：`mermaid` 语言输出带索引的占位节点；其他语言调用 highlight.js；未知语言按纯文本转义。
- DOMPurify 在增强之前执行，确保用户 HTML 不会进入后续 DOM 操作。KaTeX 和 Mermaid 生成的内容来自受信任库，在清洗后写入。
- 标题 id 由后处理生成：对 h1–h4 文本做 slug，重复时追加序号；同时产出目录树，供 `MarkdownToc` 使用。
- 外链统一补 `target="_blank"` 和 `rel="noopener noreferrer"`；图片补 `referrerpolicy="no-referrer"` 和 `loading="lazy"`。
- 预览内容每次整体替换，但替换前后保存/恢复预览容器的 `scrollTop`，避免输入时跳回顶部。

**替代方案：** 直接用 marked 输出 `v-html`。无法保证安全，也无法稳定注入标题 id 和代码复制按钮，不采用。使用 markdown-it 也可行，但 marked 更轻且 GFM 支持直接，团队已选定 marked。

### 4. 数学公式：在已渲染 DOM 上使用 KaTeX auto-render

使用 `katex/contrib/auto-render` 对预览容器做后处理，而不是在 marked 中解析公式：

- 块级 `$$...$$` 始终渲染；行内 `$...$` 受开关控制。关闭时只注册块级分隔符。
- `ignoredTags` 包含 `pre`、`code`、`script`、`style`、`textarea`，避免代码块中的 `$` 被误渲染。
- KaTeX 输出包含 MathML，复制 HTML 时直接从实时 DOM 克隆即可保留。
- KaTeX 的 JS 和 CSS 在首次检测到公式分隔符时动态 import；没有公式的文档不加载字体资源。

**替代方案：** 使用 marked 的 KaTeX 扩展。控制力更强，但需要额外插件并处理 marked token 兼容性；auto-render 直接在最终 DOM 上工作，和复制、滚动、代码块跳过逻辑更一致。

### 5. Mermaid：懒加载、strict、逐图源码切换

- 只有文档中存在 `mermaid` 围栏代码块时才 `import('mermaid')`，避免首屏加载大体积图表库。
- 初始化参数包含 `startOnLoad: false`、`securityLevel: 'strict'`，主题随当前明暗主题切换；主题变化时重新初始化并重渲染。
- 每个图表块包含：图表容器、源码容器、图表/源码切换按钮。源码通过 `textContent` 写入，不拼接到 HTML 字符串。
- 每轮异步渲染带递增 token；await 返回后若 token 已过期则丢弃结果，避免快速输入时旧图表覆盖新内容。
- 渲染失败时保留源码并显示错误占位，不影响其他代码块。
- 复制 HTML 时保留图表 SVG，移除切换按钮和源码容器。

**替代方案：** 同步静态引入 Mermaid。实现简单，但会显著增加首屏体积，不采用。用 iframe 隔离图表会带来尺寸和主题同步问题，也不采用。

### 6. 安全：DOMPurify 白名单 + 后处理属性

DOMPurify 配置要点：

- 禁止 `script`、`iframe`、`form`、`style`、`object`、`embed`。
- 禁止事件属性（DOMPurify 默认处理），并显式禁止 `style` 属性；用户 HTML 不允许内联样式。
- 允许 GFM 任务列表所需的 `input`，但只允许 `type`、`checked`、`disabled` 等必要属性；`form` 已禁止，输入框不会提交。
- 允许自定义 Mermaid 占位索引属性，其他 `data-*` 默认关闭。
- 链接在清洗后统一处理：`javascript:` 等危险协议移除；外部链接补安全属性；相对链接保持原样。
- 图片在清洗后补 `referrerpolicy` 和 `loading`，并挂载错误监听；失败时替换为包含 alt 与 URL 的占位节点。

代码块内容始终由 highlight.js 转义后输出，不把原始代码当 HTML 拼接。

### 7. 布局：编辑器 / 预览 / 目录三栏，窄屏降级

桌面宽度下，Markdown 工具使用：

```text
+----------------------+---+------------------------+----------+
| CodeMirror editor    | | | Preview (max-width     | TOC      |
|                      | | | 860px, centered)       | 240px    |
+----------------------+---+------------------------+----------+
                         ^ splitter
```

- 外层 `md-workspace` 是两列：主工作区（编辑器 + 分隔条 + 预览）和目录。目录折叠时第二列宽度变为 0。
- 主工作区内部用编辑器比例、固定宽度分隔条和剩余预览区域组成；比例限制在 20%–80%，默认 50%。
- 分隔条支持 pointer 拖拽、双击复位和键盘左右方向键调整，带 `role="separator"` 与 `aria-valuenow`。
- 预览正文使用 `--md-content-max: 860px` 居中；代码块和表格设置 `overflow-x: auto`，不撑破页面。
- 工作区高度使用 `clamp()` 令牌，保证编辑器有足够高度，同时页脚仍可滚动到。
- 窄屏断点下，主工作区切换为「编辑器 / 预览」标签；目录变成覆盖预览的抽屉，带遮罩和关闭按钮，避免三栏挤压。

**替代方案：** 把目录放进预览列内部。预览正文和 240px 目录会争抢宽度，桌面 1440px 下正文过窄，不采用。窄屏保留双栏也会导致编辑区不可用，因此降级为标签。

### 8. 状态与持久化

使用两个 localStorage key：

- `toolbox:markdown:content`：Markdown 原文，写入防抖 300ms。
- `toolbox:markdown:settings`：JSON，包含 `version`、`splitRatio`、`scrollSync`、`inlineMath`、`tocCollapsed`。

读取时做 schema 校验和范围限制；解析失败回退默认值。内容写入失败（隐私模式/配额）时静默降级为仅内存状态，不影响编辑。「清空」写入空字符串并清空编辑器，但保留 settings。

**替代方案：** 把内容和设置放在同一个 JSON。每次输入都要序列化整份内容，且设置变更会放大写入量，不采用。IndexedDB 对当前数据规模过重，也不采用。

### 9. 滚动同步与目录联动

- 编辑器和预览都暴露滚动容器；同步时用 `scrollTop / (scrollHeight - clientHeight)` 的比例互相映射。
- 用一个 `syncing` 标志和 `requestAnimationFrame` 防止双向监听形成回环；关闭开关后移除监听。
- 目录点击调用预览容器的 `scrollTo`，不改变页面整体滚动。
- 当前标题通过预览滚动位置计算：取最后一个顶部不超过阈值的高亮标题，更新 `aria-current` 和目录项样式。
- 预览重渲染后重新计算当前标题；如果用户正在输入，避免目录自动滚动抢焦点。

**替代方案：** 按源码行号映射预览元素。需要维护 marked token 与行号映射，复杂且对 GFM 不稳定，不采用。

### 10. 文件导入与 HTML 复制

- 文件导入支持隐藏的 `<input type="file">` 和拖拽区域；扩展名限制为 `.md`、`.markdown`、`.txt`，读取使用 `File.text()`。
- 当前内容非空时，显示工具内确认弹层（覆盖 / 取消），而不是原生 `window.confirm`，以保持主题、键盘和 i18n 一致。
- 不支持的类型或读取失败显示内联错误，不修改现有内容。
- 复制 HTML 时克隆预览正文，移除所有 `[data-md-ui]` 节点（代码复制按钮、Mermaid 切换按钮、目录等），保留代码高亮 span、Mermaid SVG 和 KaTeX MathML。
- 优先使用 `navigator.clipboard.write` 同时写入 `text/html` 和 `text/plain`；不支持 `ClipboardItem` 时回退到现有 `useCopy` 的纯文本复制。

**替代方案：** `window.confirm` 实现最快，但和现有视觉语言不一致，不采用。只写 `text/plain` 会让粘贴到富文本编辑器时丢失结构，也不采用。

### 11. 样式、主题与代码高亮

- 所有新增尺寸、颜色、层级和语法色进入 `tokens.css`，包括编辑器背景、gutter、当前行、选区、分隔条、代码块、目录、图片错误占位和 `--md-syntax-*`。
- 明暗主题各提供一套语法色；highlight.js 只输出 class，由项目 CSS 着色，不引入第三方固定主题。
- CodeMirror 主题和搜索面板使用同一套令牌；主题切换通过 Compartment 重新配置。
- Mermaid 使用 `default` / `dark` 主题；KaTeX 继承 `currentColor`，不额外覆盖公式字体。
- 预览区需要覆盖全局 `base.css` 对 `ul`、`a` 的重置：在 `.md-preview` 作用域内恢复列表符号、链接下划线、标题间距、引用块和表格边框。

**替代方案：** 直接引入 highlight.js 和 CodeMirror 的现成主题。会引入大量硬编码颜色，且与现有设计令牌和暗色主题不一致，不采用。

### 12. 性能与异步竞态

- Markdown 渲染防抖 120ms；编辑器输入本身不等待渲染。
- Mermaid 和 KaTeX 按需动态加载；highlight.js 使用 core + 常用语言注册，未知语言走纯文本。
- 异步增强使用 render token；组件卸载时清理 CodeMirror、滚动监听、图片错误监听和未完成的 Mermaid 渲染。
- 目录和滚动同步使用 `requestAnimationFrame` 节流，避免滚动时频繁触发布局计算。
- 大文档下仍可能出现渲染延迟；通过防抖和按需加载控制，不引入 Web Worker（会显著增加实现复杂度）。

### 13. 测试与验证

项目当前没有自动化测试脚本。本次增加轻量的 Vitest + jsdom，只覆盖纯逻辑和 DOM 后处理：

- marked 渲染：GFM 表格、任务列表、代码高亮、Mermaid 占位、未知语言转义。
- DOMPurify：脚本、事件属性、`javascript:`、iframe/form/style 被移除；任务列表 input 保留。
- 标题提取：层级、重复 slug、目录树。
- HTML 导出：移除 UI 节点，保留高亮 span、Mermaid SVG、KaTeX MathML。
- 持久化：settings schema 校验、越界比例回退、损坏 JSON 回退。

UI 行为通过 `npm run build`、开发服务器和手工矩阵验证：桌面/窄屏、明暗主题、拖拽/双击、滚动同步、文件导入、复制 HTML、Mermaid 错误、图片失败。这样既得到可回归的安全/渲染测试，又避免为一次性工具引入重量级 E2E 框架。

**替代方案：** 只做手工验证。安全清洗和 HTML 导出容易回归，故至少保留纯逻辑测试。Playwright 覆盖成本高，暂不引入。

## Risks / Trade-offs

- [Mermaid 体积大且渲染慢] → 仅在存在 mermaid 代码块时动态加载，并用 render token 丢弃过期结果。
- [KaTeX 字体资源增加构建体积] → 首次检测到公式时才动态加载 JS/CSS；无公式文档不加载。
- [DOMPurify 清洗后任务列表 checkbox 或自定义占位属性被移除] → 显式允许必要的 `input` 属性和 Mermaid 索引属性，并用单元测试锁定。
- [预览整体替换导致滚动位置丢失] → 渲染前后保存/恢复 `scrollTop`，目录高亮在恢复后重新计算。
- [异步 Mermaid/KaTeX 与快速输入竞态] → 每次渲染递增 token，过期结果直接丢弃。
- [全局 `base.css` 重置列表和链接，导致预览排版异常] → 在 `.md-preview` 作用域内显式恢复 Markdown 语义样式。
- [复制 HTML 时把工具栏或源码容器带出] → 所有 UI 节点标记 `data-md-ui`，导出时统一移除，并用测试覆盖。
- [CodeMirror 主题切换造成闪烁或重建] → 使用 Compartment 只重配置主题扩展。
- [第三方库升级导致 marked renderer 或 Mermaid API 变化] → 锁定主版本，渲染/导出测试覆盖关键输出；升级时单独验证。
- [浏览器不支持富文本剪贴板] → 回退到纯文本 HTML 复制，并保留提示。
- [大文档渲染卡顿] → 120ms 防抖、按需加载、rAF 节流；暂不引入 Worker。

## Migration Plan

- 无数据迁移。新增 localStorage key 首次读取时使用默认值，旧版本数据不受影响。
- 部署方式不变：`npm run build` 产出静态 `dist/`，所有依赖和字体随包发布。
- 回滚：移除 `markdown` 工具条目和注册即可下线入口；既有工具、主题、i18n 和收藏数据不受影响。残留的 `toolbox:markdown:*` 数据可保留，不影响其他功能。
