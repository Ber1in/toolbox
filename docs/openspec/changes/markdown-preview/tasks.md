# Tasks

## 1. 依赖与测试基线

- [x] 1.1 在 `package.json` 中加入 CodeMirror 6 相关包、`marked`、`dompurify`、`highlight.js`、`mermaid`、`katex`，并加入 `vitest`、`jsdom` 开发依赖；运行 `npm install`，确认 `package-lock.json` 更新且无安装错误。 <!-- comet-task:a568655a-b4cd-4e57-94d7-23ddc1094e9e -->
- [x] 1.2 增加 `vitest.config.ts` 与 `npm test` 脚本，创建一个最小的 Markdown 工具测试文件；运行 `npm test`，确认测试框架可启动并通过。 <!-- comet-task:901674df-2369-4475-9694-84cdac6ef655 -->
- [x] 1.3 在 `src/styles/tokens.css` 中补充 Markdown 工作区、编辑器、预览、目录、代码块和语法高亮令牌（含明暗主题）；运行 `npm run build`，确认令牌文件无语法错误，并在后续样式中只引用令牌。 <!-- comet-task:d3d2a49f-d10f-4717-b3cb-a7bbcd155149 -->

## 2. 工具入口与全宽布局

- [x] 2.1 在 `src/data/toolbox.ts` 的 `text` 分类新增 `markdown` 工具条目，名称为「Markdown 预览」，描述为「实时编辑与预览 Markdown」，图标使用合适的 lucide 图标；在 `src/tools/registry.ts` 注册 `MarkdownTool.vue`；运行 `npm run build`，确认类型检查通过。 <!-- comet-task:63301a14-591c-41d0-878a-109c008db950 -->
- [x] 2.2 为 `Tool` 增加可选 `fullWidth` 标记，并在 `src/views/ToolView.vue` 中为 Markdown 工具启用全宽容器；分别访问 `/tool/markdown` 和 `/tool/json`，确认前者全宽、后者仍保持 960px。 <!-- comet-task:e1b022ce-8b51-4628-8354-01f02226353a -->
- [x] 2.3 在 `src/i18n/en.ts` 中补充工具名称、描述、分类和基础界面文案的英文翻译；切换到 English，确认 `/tool/markdown` 不出现中文回退或原始 key。 <!-- comet-task:d9e22044-67df-4ffa-9705-f90391d2143d -->

## 3. Markdown 渲染与安全核心

- [x] 3.1 实现 `src/utils/markdown/render.ts`：使用 marked 开启 GFM，自定义 code renderer 处理 Mermaid 占位、highlight.js 高亮和未知语言转义；新增单元测试覆盖表格、任务列表、围栏代码、Mermaid 围栏和未知语言，运行 `npm test` 通过。 <!-- comet-task:4aa8ef85-e766-4b0a-8301-a030839fbb45 -->
- [x] 3.2 实现 `src/utils/markdown/sanitize.ts`：配置 DOMPurify 禁止 script/iframe/form/style/object/embed、事件属性和 `style` 属性，保留 GFM 任务列表所需 input 与 Mermaid 占位索引；新增测试覆盖危险标签、事件属性、`javascript:` 链接和任务列表，运行 `npm test` 通过。 <!-- comet-task:2eef1504-318c-41b1-91ff-ea9795f3852b -->
- [x] 3.3 实现 `src/utils/markdown/headings.ts`：为 h1–h4 生成唯一 id，提取层级和文本并构建目录树；新增测试覆盖重复标题、中文标题和层级关系，运行 `npm test` 通过。 <!-- comet-task:5a2ce9be-9519-4a4e-afe5-cfcf89224667 -->
- [x] 3.4 实现 `src/utils/markdown/export.ts`：克隆预览 DOM，移除 `[data-md-ui]` 节点，保留代码高亮 span、Mermaid SVG 和 KaTeX MathML；新增测试覆盖 UI 剔除和关键内容保留，运行 `npm test` 通过。 <!-- comet-task:022caa3b-61bc-499f-81e5-6208383b20e6 -->
- [x] 3.5 实现 `src/utils/markdown/storage.ts`：读写 `toolbox:markdown:content` 与 `toolbox:markdown:settings`，包含 settings 版本、比例范围校验和损坏 JSON 回退；新增测试覆盖默认值、越界比例和损坏数据，运行 `npm test` 通过。 <!-- comet-task:210a6486-1d10-446e-8f49-b34e1bdbee1d -->

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
