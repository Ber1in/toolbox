---
change: markdown-preview
design-doc: docs/openspec/changes/markdown-preview/design.md
base-ref: 2a56e4719c196226e1bb00197dc540e0b185d27f
archived-with: 2026-10-30-markdown-preview
---

# Markdown 预览工具实施计划

<!-- comet-task-authority: docs/openspec/changes/markdown-preview/tasks.md -->

## 执行策略

- 构建方式：`autonomous`
- TDD 方式：`direct`（纯逻辑模块保持聚焦单测，UI 集成以构建、浏览器矩阵和手工场景验收）
- 审查方式：`standard`（安全 / 渲染核心做独立审查，最终集成审查留到 Verify）
- 按可独立验收的成果组织工作包；每个工作包完成后使用英文 conventional commit 提交。
- 不维护第二套 checkbox 清单：完成状态以 `tasks.md` 和 `comet state task-complete` 为准。

## 工作包 1：基础设施

<!-- comet-task-ref:a568655a-b4cd-4e57-94d7-23ddc1094e9e -->
### 1.1 依赖安装

范围：在 `package.json` 中加入 CodeMirror 6 相关包、`marked`、`dompurify`、`highlight.js`、`mermaid`、`katex`；加入 `vitest`、`jsdom` 开发依赖；更新 `package-lock.json`。

验收：`npm install` 无错误；`npm ls` 能列出新增直接依赖；所有运行时依赖都从本地打包，不请求 CDN。

依赖：无。

<!-- comet-task-ref:901674df-2369-4475-9694-84cdac6ef655 -->
### 1.2 测试基线

范围：新增 `vitest.config.ts`、`npm test` 脚本和最小 Markdown 测试文件；DOM 相关测试使用 `jsdom` 环境。

验收：`npm test` 能启动并通过最小测试；后续测试可复用该配置。

依赖：1.1。

<!-- comet-task-ref:d3d2a49f-d10f-4717-b3cb-a7bbcd155149 -->
### 1.3 设计令牌

范围：在 `src/styles/tokens.css` 中补充 Markdown 工作区、编辑器、预览、目录、分隔条、代码块、图片错误、搜索和语法高亮令牌，并覆盖明暗主题；如缺失则补充 `--font-mono`。

验收：`npm run build` 接受令牌文件；新增 Markdown 样式只引用这些令牌；功能 CSS 中不出现硬编码色值。

依赖：无。

## 工作包 2：工具入口与页面外壳

<!-- comet-task-ref:63301a14-591c-41d0-878a-109c008db950 -->
### 2.1 工具数据与注册表

范围：在 `src/data/toolbox.ts` 的 `text` 分类新增 `markdown` 条目，名称为「Markdown 预览」，描述为「实时编辑与预览 Markdown」，使用合适的 lucide 图标；在 `src/tools/registry.ts` 注册 `MarkdownTool.vue`。

验收：`/tool/markdown` 可解析；`npm run build` 类型检查通过；首页文本分类出现新卡片。

依赖：1.3。

<!-- comet-task-ref:e1b022ce-8b51-4628-8354-01f02226353a -->
### 2.2 全宽布局修饰

范围：为 `Tool` 增加可选 `fullWidth?: boolean`；`ToolView.vue` 仅在设置时应用全宽修饰；Markdown 条目启用。

验收：`/tool/markdown` 使用全部可用宽度；`/tool/json` 等非 Markdown 工具仍保持 960px 容器。

依赖：2.1。

<!-- comet-task-ref:d9e22044-67df-4ffa-9705-f90391d2143d -->
### 2.3 基础 i18n

范围：补充工具名称、描述、分类以及编辑器、预览、导入、复制等基础界面的英文翻译；中文原文继续作为字典 key。

验收：在 `/tool/markdown` 切换到 English 后，基础外壳不出现原始 key 或意外的中文回退。

依赖：2.1。

## 工作包 3：Markdown 渲染与安全核心

<!-- comet-task-ref:4aa8ef85-e766-4b0a-8301-a030839fbb45 -->
### 3.1 渲染器

范围：实现 `src/utils/markdown/render.ts`，使用 marked GFM、自定义 code renderer 处理 Mermaid 占位符、highlight.js 高亮和安全转义未知语言；如需增加 `pipeline.ts`，组合 render → sanitize → 标题装饰。

验收：测试覆盖表格、任务列表、围栏代码、Mermaid 围栏和未知语言；`npm test` 通过。

依赖：1.1、1.2。

<!-- comet-task-ref:2eef1504-318c-41b1-91ff-ea9795f3852b -->
### 3.2 清洗器

范围：实现 `src/utils/markdown/sanitize.ts`，配置 DOMPurify 禁止 `script`、`iframe`、`form`、`style`、`object`、`embed`、事件属性和用户内联 `style`；保留 GFM 任务列表 `input` 和 Mermaid 占位索引；只允许复选框类输入。

验收：测试确认危险标签、事件属性、`javascript:` 链接和非复选框表单控件被移除；任务列表复选框保留。

依赖：3.1。

<!-- comet-task-ref:5a2ce9be-9519-4a4e-afe5-cfcf89224667 -->
### 3.3 标题与 DOM 装饰

范围：实现 `src/utils/markdown/headings.ts`：为 h1–h4 生成 slug、去重 id、返回标题列表和目录树；写入 id；为外链补充 `target` / `rel`，为图片补充 `referrerpolicy` / `loading`，为表格添加横向滚动包裹，并限制表单控件。

验收：测试覆盖重复标题、中文标题、层级嵌套、既有 id / 保留 id 冲突、外链、图片属性和非复选框输入移除。

依赖：3.2。

<!-- comet-task-ref:022caa3b-61bc-499f-81e5-6208383b20e6 -->
### 3.4 HTML 导出

范围：实现 `src/utils/markdown/export.ts`：克隆预览正文，移除 `[data-md-ui]` 节点，保留 highlight 高亮 span、Mermaid SVG 和 KaTeX MathML；写入富 HTML 剪贴板，并提供纯文本回退。

验收：测试覆盖 UI 移除、内容保留和回退路径；Mermaid 源码视图状态下导出仍包含图表。

依赖：3.3。

<!-- comet-task-ref:210a6486-1d10-446e-8f49-b34e1bdbee1d -->
### 3.5 持久化

范围：实现 `src/utils/markdown/storage.ts`，使用 `toolbox:markdown:content` 和带版本的 `toolbox:markdown:settings`；校验比例范围，损坏 JSON 回退默认值，拒绝未知版本。

验收：测试覆盖默认值、保存 / 读取、比例越界、损坏 JSON、未知版本和存储异常降级。

依赖：1.2。

## 工作包 4：CodeMirror 编辑器

<!-- comet-task-ref:2b33a976-06ea-4b19-9065-e47445fe9912 -->
### 4.1 编辑器组件

范围：实现 `src/components/tool/markdown/MarkdownEditor.vue`，包含行号、活动行、括号匹配、搜索、自动换行、历史记录、Markdown 语法、主题 Compartment、model 同步和滚动 / 比例 API；不引入 Vim / Emacs 键位。

验收：手工或浏览器矩阵验证输入、搜索、撤销 / 重做、换行和明暗主题切换；`npm run build` 通过。

依赖：1.1、1.3。

<!-- comet-task-ref:4e9a9753-5726-4092-8ae0-848e06c73248 -->
### 4.2 编辑器样式

范围：使用令牌设置编辑器、行号槽、活动行、选区、光标、搜索面板和提示框样式。

验收：新增样式无硬编码色值；明暗主题对比度可读；搜索面板不溢出。

依赖：4.1、1.3。

## 工作包 5：预览与增强

<!-- comet-task-ref:8cd62c37-c0d9-4be9-ba11-fc850bddf76a -->
### 5.1 预览外壳

范围：实现 `src/components/tool/markdown/MarkdownPreview.vue`：安全 `v-html`、重渲染时保持滚动位置、消费标题 id、外链 / 图片属性、标题滚动、活动标题事件和滚动比例 API。

验收：GFM 示例正常渲染；外链安全打开；图片失败显示占位；输入时滚动位置保持。

依赖：3.3、3.4。

<!-- comet-task-ref:f784a04c-53a7-4262-8abd-d6a346ebf007 -->
### 5.2 Highlight.js

范围：注册核心与常用语言，围栏代码输出 `hljs` class，并用 `--md-syntax-*` 令牌设置 `.hljs-*` 颜色。

验收：JavaScript、JSON、Bash、Python 代码高亮；未知语言保持转义纯文本；明暗主题切换正常。

依赖：3.1、1.3。

<!-- comet-task-ref:d99c4172-9e8c-4b7a-9610-8dbc4344ca28 -->
### 5.3 KaTeX

范围：文档存在公式时按需加载 KaTeX auto-render 和 CSS；块级公式始终渲染，行内公式仅在开关开启时渲染；跳过 `pre`、`code`、`script`、`style`、`textarea`。

验收：行内、块级和代码块中的 `$` 示例行为正确；HTML 导出保留 MathML；关闭行内公式时 `$...$` 与 `\(...\)` 均不渲染。

依赖：5.1、3.4。

<!-- comet-task-ref:210bba7e-9235-4117-bba8-1fe7eb38908a -->
### 5.4 Mermaid

范围：存在 Mermaid 围栏时按需加载 Mermaid；使用 `startOnLoad: false`、`securityLevel: 'strict'` 和当前主题初始化；为每个图表提供图表 / 源码切换、源码复制和错误回退；丢弃过期的异步结果。

验收：有效流程图可渲染；源码切换可用；语法错误不破坏其他块；主题切换后重新渲染。

依赖：3.1、5.1。

<!-- comet-task-ref:6a7f0ba9-f2fb-4bef-b8f6-f693d474b27e -->
### 5.5 代码复制与图片错误

范围：为代码块添加语言标签和原始代码复制按钮；为 Mermaid 围栏添加原始源码复制；图片加载失败时替换为包含 alt 与 URL 的占位；所有运行时 UI 节点标记 `data-md-ui` 以便导出时移除。

验收：每个代码块和 Mermaid 围栏都能复制原始源码；破图显示 alt + URL 占位且不出现破图图标。

依赖：5.1、5.2。

## 工作包 6：工作区交互

<!-- comet-task-ref:307bfe1c-cc7b-4e12-963f-7a4fa172fd0e -->
### 6.1 分隔条

范围：实现指针拖拽、双击重置、键盘调整、20%–80% 限制、ARIA separator 属性和设置持久化。

验收：默认 50/50；双击回到 50%；刷新后比例保持；方向键可调整。

依赖：3.5、4.1、5.1。

<!-- comet-task-ref:8ef7e2bf-42a5-489f-a593-4e286ee4599f -->
### 6.2 响应式布局

范围：增加 900px 断点，窄屏使用编辑器 / 预览标签页和带遮罩的目录抽屉。

验收：375px、768px、1440px 布局可用；页面无横向溢出；窄屏只显示一个主面板。

依赖：6.1。

<!-- comet-task-ref:9ea4ccf2-2ea7-4d38-94b5-5bfe93c4b15b -->
### 6.3 目录

范围：实现 `MarkdownToc.vue`：h1–h4 条目、两个以上标题时自动显示、折叠状态持久化、点击滚动、活动条目高亮和移动端抽屉行为。

验收：多级目录正常渲染；点击目录滚动预览；滚动时活动条目更新；折叠状态刷新后保持；移动端从编辑器标签打开目录并选择条目后自动切到预览。

依赖：3.3、5.1、6.2。

<!-- comet-task-ref:98737d28-cc73-4eeb-aa87-a26513f963b1 -->
### 6.4 滚动同步

范围：映射编辑器和预览的滚动比例，默认开启、可切换，使用 `syncing` 守卫和 requestAnimationFrame 节流。

验收：滚动任一窗格时另一窗格按比例移动；关闭同步后互不影响；开关状态刷新后保持。

依赖：4.1、5.1、3.5。

<!-- comet-task-ref:89928f6d-1f6c-4d92-86c8-898eee20e2a4 -->
### 6.5 工具栏、导入、清空、复制 HTML

范围：实现 `.md`、`.markdown`、`.txt` 的文件选择和拖拽导入；应用内覆盖确认；清空当前内容但保留视图设置；使用富剪贴板复制导出 HTML，失败时回退并提示。

验收：导入加载内容；取消不改变内容；不支持的文件显示错误；清空保留开关；复制 HTML 排除 UI 并保留高亮代码。

依赖：3.4、3.5、5.5。

<!-- comet-task-ref:643b6e34-0cb8-4253-96c8-0128f72161d7 -->
### 6.6 完整 i18n

范围：把 Markdown 界面剩余文案加入 `en.ts`；增加聚焦测试，扫描 Markdown 组件中的 `t('中文…')` key 并断言存在于 `en`；CodeMirror 搜索面板也使用同一套文案。

验收：`npm test` 通过；English 模式无意外中文回退；中英文标签一致。

依赖：2.3、6.5。

## 工作包 7：预览样式与文档

<!-- comet-task-ref:99c379b0-7feb-4dab-bc9e-cb8af0d83687 -->
### 7.1 预览排版

范围：作用域内重置列表、链接、标题、引用、表格和代码；正文最大宽度 860px 并居中；代码和表格在预览内滚动；设置图片、Mermaid 块、KaTeX 展示和错误占位样式。

验收：宽表格和长代码只在预览内滚动；页面本身不横向溢出；明暗主题排版可读。

依赖：5.2、5.3、5.4、5.5。

<!-- comet-task-ref:ba0e3664-48d5-47ad-99d1-8e2da50f1aa7 -->
### 7.2 README

范围：更新中英文 README：工具数 34 → 35、文本分类清单、技术栈、项目结构和 `toolbox:markdown:*` 的本地存储与隐私说明；不提及设计来源或设计与实现的差异。

验收：中英文内容一致；无过期数量；无禁止的设计背景表述。

依赖：6.6、7.1。

## 工作包 8：集成验证

<!-- comet-task-ref:2f4923f9-fd5c-4636-8e0f-bd8145ec50e1 -->
### 8.1 测试与构建

范围：运行 `npm test` 和 `npm run build`；记录 bundle 体积变化。

验收：全部测试通过；TypeScript 和 Vite 构建通过；无意外类型错误。

依赖：全部实现任务。

<!-- comet-task-ref:1ebf077e-98f8-4dc6-a2c9-14f15690a4a4 -->
### 8.2 浏览器场景矩阵

范围：验证 GFM、Mermaid、KaTeX、导入、分隔条、明暗主题、窄屏标签、目录、滚动同步、复制 HTML 和刷新持久化；同时检查安全注入、焦点管理和移动端目录切换。

验收：无 console 错误；每个场景符合规格。

依赖：8.1。

<!-- comet-task-ref:afb61a47-6264-4e81-ad62-3f4d0718b7c1 -->
### 8.3 离线请求审计

范围：用 `npm run preview` 托管 `dist/`；打开包含 Mermaid 和 KaTeX 的文档并检查网络面板。

验收：所有请求同源；无 CDN、远程字体或外部 API 请求。

依赖：8.1。

<!-- comet-task-ref:089015e0-3c27-475c-9539-5a09e732eb1b -->
### 8.4 回归检查

范围：打开五个非 Markdown 工具，检查布局、收藏、语言和主题切换。

验收：全宽修饰不影响其他工具；全局导航和设置仍正常。

依赖：8.1。

## 风险审查计划

- 完成前独立审查：`render.ts`、`sanitize.ts`、`headings.ts`、`export.ts` 和剪贴板路径。这些模块承担安全与数据完整性风险。
- 对编辑器 / 预览集成和响应式布局 diff 做标准审查。
- 最终集成审查只在 Verify 阶段执行一次，不在 Build 重复。
- 任何接受的偏差都必须记录理由和影响范围，然后才能勾选任务。

## 提交计划

- `feat(markdown): add renderer, sanitizer, and persistence core`
- `feat(markdown): add CodeMirror editor and preview shell`
- `feat(markdown): add workspace layout, TOC, and import/export`
- `docs(markdown): document the Markdown preview tool`
- 测试与构建修复并入相关提交，或使用聚焦的 `test(markdown)` / `fix(markdown)` 提交。
