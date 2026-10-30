# Comet Design Handoff

- Change: markdown-preview
- Phase: design
- Mode: compact
- Context hash: c2371a2d80c64df491d13d7a4ebe4761a47845b0401b78f1c4966fe00c16207c

Generated-by: comet-handoff.sh
Task hash policy: task-content-v1. Read tasks.md for live completion; excerpts are design-time context.

OpenSpec remains the canonical capability spec. This handoff is a deterministic, source-traceable context pack, not an agent-authored summary.

## docs/openspec/changes/markdown-preview/proposal.md

- Source: docs/openspec/changes/markdown-preview/proposal.md
- Lines: 1-43
- SHA256: 6ae3850992a3590804588f420cb98ddf9ac9b8186d56917e4374028e84a5b985

```md
# Proposal

## Why

Markdown 是开发者日常编写文档、README、笔记和接口说明的主要格式，但当前工具盒只有格式化、Diff、文本替换等单一文本工具，缺少一个可以边写边看、并且完全在本地运行的 Markdown 工作区。用户只能借助外部编辑器或在线服务，既打断工作流，也可能把内容上传到第三方。

本次新增 Markdown 预览工具，让用户在工具盒内完成编辑、预览、目录导航和内容导出，所有处理都在浏览器本地完成。

## What Changes

- 在「文本处理」分类新增 `markdown` 工具，路由为 `/tool/markdown`，名称为「Markdown 预览」，描述为「实时编辑与预览 Markdown」。
- 工具页采用全宽布局：左侧为 CodeMirror 6 编辑器，右侧为渲染预览；中间提供可拖拽分隔条，默认 50/50，双击恢复默认比例，并持久化用户比例。
- 编辑器支持行号、当前行高亮、括号匹配、搜索、自动换行、撤销/重做；不引入 Vim/Emacs 键位。
- 渲染支持完整 GFM、`highlight.js` 代码高亮、Mermaid 图表自动渲染（每张图可切换查看源码）、KaTeX 行内 `$...$` 与块级 `$$...$$` 公式；行内公式开关默认开启。
- 预览区右侧提供可折叠目录侧栏（约 240px，sticky），收录 h1–h4；标题数量 ≥ 2 时自动显示，支持点击滚动与当前标题高亮；窄屏下以浮层呈现。
- 支持粘贴/输入，以及拖拽或文件选择导入 `.md` / `.markdown` / `.txt`；当内容非空时先确认再覆盖。
- 工具栏支持复制干净的语义化 HTML（保留高亮 span、Mermaid SVG、KaTeX MathML，排除目录、复制按钮等 UI）；每个代码块另有原始代码复制按钮。
- 预览正文最大宽度约 860px 并居中；代码块和表格在内容区域内横向滚动。
- 远程图片直接加载，失败时显示包含 alt 与 URL 的占位提示，并附加 `no-referrer`。
- 安全策略：允许原始 HTML，但使用 DOMPurify 清洗；移除脚本、事件属性、`javascript:` URL、iframe/form/style 标签；Mermaid 使用 `securityLevel: 'strict'`；外部链接统一 `target="_blank" rel="noopener noreferrer"`。
- 持久化内容、分隔比例、滚动同步开关、行内公式开关、目录折叠状态到 `localStorage`；「清空」只清除内容与草稿，保留视图设置。
- 滚动同步默认开启，并提供开关。
- 不做（v1 明确排除）：脚注、标题永久链接复制、独立 HTML 导出、打印/PDF、Vim/Emacs 键位、多文件标签、图片上传、云同步、协作、Markdown lint。

## Capabilities

### New Capabilities

- `markdown-preview`: 在浏览器本地完成 Markdown 编辑、GFM 渲染、代码高亮、Mermaid/KaTeX 展示、目录导航、文件导入、安全 HTML 复制与视图设置持久化的完整能力。

### Modified Capabilities

无。本次只新增能力，不改变现有工具的行为规格。

## Impact

- 数据与路由：`src/data/toolbox.ts` 新增工具条目；`src/tools/registry.ts` 注册组件；现有 `/tool/:id` 路由直接复用。
- 页面与样式：`src/views/ToolView.vue` 增加全宽工具页布局分支；`src/styles/tokens.css` 与 `src/styles/tool.css` 增加编辑器、预览、目录、代码块和分隔条的设计令牌与样式。
- 新组件：`src/tools/MarkdownTool.vue`，以及按需拆分的编辑器、预览、目录、Mermaid 区块等子组件和 Markdown 渲染 composable。
- i18n：`src/i18n/en.ts` 为所有新增中文文案补充英文翻译。
- 依赖：新增 CodeMirror 6 相关包、`marked`、`dompurify`、`highlight.js`、`mermaid`、`katex`；全部随应用打包，不引入运行时外部资源。
- 测试：补充渲染、安全清洗、文件导入、目录生成、复制 HTML、持久化与响应式布局相关测试；更新既有功能与 i18n 测试基线。
- 文档：README 的工具清单与功能说明需要同步更新，保持中英双语，且不涉及设计稿背景或设计与实现的差异描述。

```

## docs/openspec/changes/markdown-preview/design.md

- Source: docs/openspec/changes/markdown-preview/design.md
- Lines: 1-224
- SHA256: f10242583225738c1b1db07df21fae0870c316ac5e99fd6f3b69cb8fcb7fdbd6

[TRUNCATED]

```md
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

```

Full source: docs/openspec/changes/markdown-preview/design.md

## docs/openspec/changes/markdown-preview/tasks.md

- Source: docs/openspec/changes/markdown-preview/tasks.md
- Lines: 1-60
- SHA256: 4bf8639ee200b187291d5dfc52c3cd911796dfa8cf7dfd5cbeb1588e1ace5553

```md
# Tasks

## 1. 依赖与测试基线

- [ ] 1.1 在 `package.json` 中加入 CodeMirror 6 相关包、`marked`、`dompurify`、`highlight.js`、`mermaid`、`katex`，并加入 `vitest`、`jsdom` 开发依赖；运行 `npm install`，确认 `package-lock.json` 更新且无安装错误。 <!-- comet-task:a568655a-b4cd-4e57-94d7-23ddc1094e9e -->
- [ ] 1.2 增加 `vitest.config.ts` 与 `npm test` 脚本，创建一个最小的 Markdown 工具测试文件；运行 `npm test`，确认测试框架可启动并通过。 <!-- comet-task:901674df-2369-4475-9694-84cdac6ef655 -->
- [ ] 1.3 在 `src/styles/tokens.css` 中补充 Markdown 工作区、编辑器、预览、目录、代码块和语法高亮令牌（含明暗主题）；运行 `npm run build`，确认令牌文件无语法错误，并在后续样式中只引用令牌。 <!-- comet-task:d3d2a49f-d10f-4717-b3cb-a7bbcd155149 -->

## 2. 工具入口与全宽布局

- [ ] 2.1 在 `src/data/toolbox.ts` 的 `text` 分类新增 `markdown` 工具条目，名称为「Markdown 预览」，描述为「实时编辑与预览 Markdown」，图标使用合适的 lucide 图标；在 `src/tools/registry.ts` 注册 `MarkdownTool.vue`；运行 `npm run build`，确认类型检查通过。 <!-- comet-task:63301a14-591c-41d0-878a-109c008db950 -->
- [ ] 2.2 为 `Tool` 增加可选 `fullWidth` 标记，并在 `src/views/ToolView.vue` 中为 Markdown 工具启用全宽容器；分别访问 `/tool/markdown` 和 `/tool/json`，确认前者全宽、后者仍保持 960px。 <!-- comet-task:e1b022ce-8b51-4628-8354-01f02226353a -->
- [ ] 2.3 在 `src/i18n/en.ts` 中补充工具名称、描述、分类和基础界面文案的英文翻译；切换到 English，确认 `/tool/markdown` 不出现中文回退或原始 key。 <!-- comet-task:d9e22044-67df-4ffa-9705-f90391d2143d -->

## 3. Markdown 渲染与安全核心

- [ ] 3.1 实现 `src/utils/markdown/render.ts`：使用 marked 开启 GFM，自定义 code renderer 处理 Mermaid 占位、highlight.js 高亮和未知语言转义；新增单元测试覆盖表格、任务列表、围栏代码、Mermaid 围栏和未知语言，运行 `npm test` 通过。 <!-- comet-task:4aa8ef85-e766-4b0a-8301-a030839fbb45 -->
- [ ] 3.2 实现 `src/utils/markdown/sanitize.ts`：配置 DOMPurify 禁止 script/iframe/form/style/object/embed、事件属性和 `style` 属性，保留 GFM 任务列表所需 input 与 Mermaid 占位索引；新增测试覆盖危险标签、事件属性、`javascript:` 链接和任务列表，运行 `npm test` 通过。 <!-- comet-task:2eef1504-318c-41b1-91ff-ea9795f3852b -->
- [ ] 3.3 实现 `src/utils/markdown/headings.ts`：为 h1–h4 生成唯一 id，提取层级和文本并构建目录树；新增测试覆盖重复标题、中文标题和层级关系，运行 `npm test` 通过。 <!-- comet-task:5a2ce9be-9519-4a4e-afe5-cfcf89224667 -->
- [ ] 3.4 实现 `src/utils/markdown/export.ts`：克隆预览 DOM，移除 `[data-md-ui]` 节点，保留代码高亮 span、Mermaid SVG 和 KaTeX MathML；新增测试覆盖 UI 剔除和关键内容保留，运行 `npm test` 通过。 <!-- comet-task:022caa3b-61bc-499f-81e5-6208383b20e6 -->
- [ ] 3.5 实现 `src/utils/markdown/storage.ts`：读写 `toolbox:markdown:content` 与 `toolbox:markdown:settings`，包含 settings 版本、比例范围校验和损坏 JSON 回退；新增测试覆盖默认值、越界比例和损坏数据，运行 `npm test` 通过。 <!-- comet-task:210a6486-1d10-446e-8f49-b34e1bdbee1d -->

## 4. CodeMirror 编辑器

- [ ] 4.1 实现 `src/components/tool/markdown/MarkdownEditor.vue`：组合行号、当前行高亮、括号匹配、搜索、自动换行、撤销/重做和 Markdown 语法扩展，使用 Compartment 处理主题切换，并与 `modelValue` 双向同步；在浏览器中确认输入、搜索、撤销、换行和明暗主题均正常，运行 `npm run build` 通过。 <!-- comet-task:2b33a976-06ea-4b19-9065-e47445fe9912 -->
- [ ] 4.2 为编辑器、gutter、当前行、选区、搜索面板和光标补充样式，只引用 `tokens.css` 中的令牌；用 `grep` 检查新增样式无裸色值和裸尺寸（布局令牌除外），并在明暗主题下人工检查对比度。 <!-- comet-task:4e9a9753-5726-4092-8ae0-848e06c73248 -->

## 5. 预览渲染与增强

- [ ] 5.1 实现 `src/components/tool/markdown/MarkdownPreview.vue`：使用清洗后的 HTML 渲染预览，保存/恢复预览滚动位置，为标题注入 id，为外链补 `target`/`rel`，为图片补 `referrerpolicy="no-referrer"`；用 GFM 样例确认结构、链接和滚动位置正常。 <!-- comet-task:8cd62c37-c0d9-4be9-ba11-fc850bddf76a -->
- [ ] 5.2 接入 highlight.js core 与常用语言注册，使用 `--md-syntax-*` 令牌编写高亮样式；用 JavaScript、JSON、Bash、Python 等代码块确认高亮生效，并确认未知语言以纯文本显示。 <!-- comet-task:f784a04c-53a7-4262-8abd-d6a346ebf007 -->
- [ ] 5.3 接入 KaTeX：检测到公式时动态加载 `katex/contrib/auto-render` 和 KaTeX CSS，块级公式始终渲染，行内公式受开关控制，跳过 `pre`/`code`；用行内、块级和代码块内 `$` 三类样例验证渲染范围。 <!-- comet-task:d99c4172-9e8c-4b7a-9610-8dbc4344ca28 -->
- [ ] 5.4 接入 Mermaid：仅在存在 mermaid 围栏时动态加载，使用 `securityLevel: 'strict'`、`startOnLoad: false` 和当前主题；为每张图提供图表/源码切换、渲染错误占位和过期 token 丢弃；用合法流程图、非法语法和快速输入切换验证。 <!-- comet-task:210bba7e-9235-4117-bba8-1fe7eb38908a -->
- [ ] 5.5 为代码块添加语言标签和原始代码复制按钮，为加载失败的图片添加包含 alt 与 URL 的占位；确认复制按钮可复制原始代码，图片失败时页面不出现破图。 <!-- comet-task:6a7f0ba9-f2fb-4bef-b8f6-f693d474b27e -->

## 6. 工作区布局与交互

- [ ] 6.1 实现可拖拽分隔条：默认 50/50，限制 20%–80%，支持 pointer 拖拽、双击复位和左右方向键调整，并通过 `toolbox:markdown:settings` 持久化；刷新页面确认比例保持，双击后恢复 50/50。 <!-- comet-task:307bfe1c-cc7b-4e12-963f-7a4fa172fd0e -->
- [ ] 6.2 实现窄屏降级：低于断点时显示「编辑器 / 预览」标签，一次只显示一个面板；目录变为带遮罩和关闭按钮的抽屉；用 375px、768px 和 1440px 三种宽度验证布局。 <!-- comet-task:8ef7e2bf-42a5-489f-a593-4e286ee4599f -->
- [ ] 6.3 实现目录侧栏：h1–h4 目录、标题数 ≥2 时自动显示、折叠状态持久化、点击滚动和当前标题高亮；用多级标题样例验证点击、滚动高亮和刷新后的折叠状态。 <!-- comet-task:9ea4ccf2-2ea7-4d38-94b5-5bfe93c4b15b -->
- [ ] 6.4 实现滚动同步：默认开启，编辑器和预览按比例联动，使用 `syncing` 标志和 rAF 防回环；关闭开关后确认两个面板独立滚动，刷新后开关状态保持。 <!-- comet-task:98737d28-cc73-4eeb-aa87-a26513f963b1 -->
- [ ] 6.5 实现工具栏：文件选择与拖拽导入 `.md`/`.markdown`/`.txt`，非空内容覆盖前显示工具内确认弹层，支持取消、清空和复制 HTML；分别验证导入、取消覆盖、清空保留设置和复制结果。 <!-- comet-task:89928f6d-1f6c-4d92-86c8-898eee20e2a4 -->
- [ ] 6.6 补齐 Markdown 工具全部新增中文文案的英文翻译，并增加一个 i18n 覆盖测试或校验脚本，检查新增 key 都存在于 `en.ts`；运行 `npm test` 通过，切换到 English 人工检查无中文回退。 <!-- comet-task:643b6e34-0cb8-4253-96c8-0128f72161d7 -->

## 7. 预览排版与文档

- [ ] 7.1 为 `.md-preview` 增加作用域样式：恢复列表、链接下划线、标题间距、引用块和表格边框，正文最大宽度 860px 居中，代码块与表格在内容区域内横向滚动；用宽表格、长代码行和嵌套列表验证页面无横向溢出。 <!-- comet-task:99c379b0-7feb-4dab-bc9e-cb8af0d83687 -->
- [ ] 7.2 更新 `README.md` 中英文两份内容：工具数量从 34 改为 35，文本处理分类加入 Markdown 预览，技术栈加入 CodeMirror/marked/DOMPurify/highlight.js/Mermaid/KaTeX，目录结构和隐私说明加入 `toolbox:markdown:*`；确认两份 README 一致且不涉及设计稿背景或设计与实现差异。 <!-- comet-task:ba0e3664-48d5-47ad-99d1-8e2da50f1aa7 -->

## 8. 集成验证

- [ ] 8.1 运行 `npm test` 和 `npm run build`，确认全部单元测试通过、TypeScript 类型检查和 Vite 生产构建无错误；记录构建产物体积变化。 <!-- comet-task:2f4923f9-fd5c-4636-8e0f-bd8145ec50e1 -->
- [ ] 8.2 手工验证完整场景：输入 GFM 文档、Mermaid 图表、KaTeX 公式、导入文件、拖拽分隔条、切换明暗主题、窄屏标签、目录跳转、滚动同步、复制 HTML 和刷新恢复；确认无控制台错误。 <!-- comet-task:1ebf077e-98f8-4dc6-a2c9-14f15690a4a4 -->
- [ ] 8.3 使用 `npm run preview` 加载生产构建，打开包含 Mermaid 和 KaTeX 的文档，检查网络面板：所有请求均为同源，无 CDN、远程字体或外部 API。 <!-- comet-task:afb61a47-6264-4e81-ad62-3f4d0718b7c1 -->
- [ ] 8.4 回归既有工具：随机打开 5 个非 Markdown 工具页，确认全宽修饰符未影响其布局，收藏、语言切换和主题切换仍正常。 <!-- comet-task:089015e0-3c27-475c-9539-5a09e732eb1b -->

## Workflow follow-up

- 实现完成并通过 Comet Verify 后，归档 `markdown-preview` change。
- 按项目约定将 `comet/markdown-preview` 分支合并回 `main`，并推送远端。

```

## docs/openspec/changes/markdown-preview/.openspec.yaml

- Source: docs/openspec/changes/markdown-preview/.openspec.yaml
- Lines: 1-2
- SHA256: 6803193cd4b83f73d2d65d3e3ce1f3b116fb4dba2543ef44a3ad6cc9791547ed

```md
schema: spec-driven
created: 2026-10-30

```

## docs/openspec/changes/markdown-preview/specs/markdown-preview/spec.md

- Source: docs/openspec/changes/markdown-preview/specs/markdown-preview/spec.md
- Lines: 1-223
- SHA256: acd4e5e64e02309a00cdb2ac6c0bc12e44ceffb25e3fa6e1de26c6e617779f25

[TRUNCATED]

```md
# Spec Delta

## Purpose

为工具盒提供完全在浏览器本地运行的 Markdown 编辑与预览能力，覆盖 GFM 渲染、代码高亮、Mermaid、KaTeX、目录导航、文件导入、安全清洗和内容导出，让用户无需上传文档即可完成日常 Markdown 阅读与写作。

## ADDED Requirements

### Requirement: 工具入口与路由

系统必须提供 id 为 `markdown` 的工具，归类为「文本处理」，名称为「Markdown 预览」，描述为「实时编辑与预览 Markdown」，并可通过 `/tool/markdown` 直接访问。进入工具页后，全局导航必须保持可见。

#### Scenario: 通过路由直接访问

- **WHEN** 用户在地址栏打开 `/tool/markdown`
- **THEN** 页面显示 Markdown 预览工具和全局导航

#### Scenario: 从首页进入工具

- **WHEN** 用户在首页「文本处理」分类中点击「Markdown 预览」
- **THEN** 路由跳转到 `/tool/markdown` 并显示该工具

### Requirement: 双栏编辑与预览布局

工具页必须使用全宽布局，左侧为 Markdown 编辑器，右侧为渲染预览，中间提供可拖拽分隔条。默认比例为 50/50，双击分隔条恢复默认比例，用户调整后的比例必须持久化。窄屏下必须切换为「编辑器 / 预览」标签，一次只显示一个面板。

#### Scenario: 拖拽调整比例

- **WHEN** 用户拖动分隔条改变两侧宽度
- **THEN** 编辑器和预览按新比例显示，刷新页面后比例保持

#### Scenario: 双击恢复默认比例

- **WHEN** 用户双击分隔条
- **THEN** 左右两侧恢复为 50/50

#### Scenario: 窄屏切换面板

- **WHEN** 视口宽度低于窄屏断点
- **THEN** 页面显示「编辑器 / 预览」标签，切换标签时只显示对应面板

### Requirement: Markdown 编辑器能力

编辑器必须提供行号、当前行高亮、括号匹配、搜索、自动换行和撤销/重做。编辑器不得提供 Vim 或 Emacs 键位模式。

#### Scenario: 基础编辑辅助

- **WHEN** 用户在编辑器中输入多行 Markdown
- **THEN** 编辑器显示行号、高亮当前行，并支持撤销和重做

#### Scenario: 搜索内容

- **WHEN** 用户按下搜索快捷键并输入关键词
- **THEN** 编辑器打开搜索面板并定位匹配内容

#### Scenario: 不启用模态键位

- **WHEN** 用户使用编辑器
- **THEN** 编辑器不进入 Vim 或 Emacs 键位模式

### Requirement: GFM 渲染与代码高亮

预览必须支持完整 GFM，包括标题、有序/无序列表、任务列表、表格、删除线、自动链接和围栏代码块。围栏代码块必须使用随应用本地打包的高亮库着色，预览内容必须随编辑实时更新。

#### Scenario: 渲染 GFM 结构

- **WHEN** 用户输入包含标题、任务列表、表格和删除线的 Markdown
- **THEN** 预览显示对应的语义化 HTML 结构

#### Scenario: 高亮围栏代码

- **WHEN** 用户输入标注了语言的围栏代码块
- **THEN** 预览显示带高亮标记的代码块，且不请求外部资源

### Requirement: Mermaid 图表与源码切换

标记为 `mermaid` 的围栏代码块必须自动渲染为 SVG，每张图必须提供图表与源码之间的切换。Mermaid 必须使用 `securityLevel: 'strict'`。

#### Scenario: 渲染 Mermaid 图表


```

Full source: docs/openspec/changes/markdown-preview/specs/markdown-preview/spec.md
