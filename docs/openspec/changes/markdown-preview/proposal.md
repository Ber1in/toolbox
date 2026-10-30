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
