# Markdown 预览工具验证报告

- Change：`markdown-preview`
- 验证模式：`full`
- 验证日期：2026-10-30
- 代码基线：`2a56e4719c196226e1bb00197dc540e0b185d27f`
- 最终 HEAD：`a72c509`（验证检查在提交后运行）
- 验证范围：30 个任务、14 条新增需求、32 个场景、41 个变更文件

## 总结

| 维度 | 结果 |
| --- | --- |
| 完整性 | 30/30 任务完成，14/14 需求有实现 |
| 正确性 | 14/14 需求覆盖，32/32 场景通过；最终集成审查 0 个 CRITICAL / IMPORTANT |
| 一致性 | 遵循 OpenSpec design.md 的组件拆分、渲染管线、懒加载和持久化决策；存在非阻塞的 SUGGESTION |

## 验证证据

### Runtime 检查

| 检查 | 命令 | 结果 |
| --- | --- | --- |
| 单元测试 | `npm test` | PASS，6 个测试文件、28 个测试 |
| 生产构建 | `npm run build` | PASS，`vue-tsc` + Vite 构建成功 |

对应 Runtime 证据日志位于 `docs/openspec/changes/markdown-preview/.comet/checks/`，verify scope 记录为 `229fb36d-...`（测试）和 `c4dc9062-...`（构建）。

### 浏览器场景矩阵

使用 Chromium 140 + Playwright，对开发服务器和 production preview 执行：

- 编辑器：输入、GFM 实时预览、搜索面板、撤销 / 重做、自动换行、明暗主题。
- 布局：分隔条拖拽、双击复位、方向键 / Home / End、20%–80% 限制、刷新后比例保持。
- 滚动：编辑器 ↔ 预览双向同步、关闭同步后的独立性、活动目录项。
- 目录：多级标题、自动显示、折叠持久化、点击滚动、移动端抽屉、焦点转移 / Tab 陷阱 / Escape / 焦点恢复、从编辑器标签选择目录后自动切到预览。
- 渲染：highlight.js 语法色、KaTeX 行内 / 块级 / 关闭行内后的 `$...$` 与 `\(...\)`、Mermaid SVG / 源码切换 / 源码复制 / 主题重渲染。
- 文件：文件选择、拖拽导入、覆盖确认、取消、Escape 取消、不支持扩展名错误、清空后保留设置。
- 复制：富 HTML 剪贴板（保留 highlight span、Mermaid SVG、KaTeX MathML，排除 `data-md-ui`）、代码块原文复制、Mermaid 原文复制。
- 安全：脚本 / 事件属性 / `javascript:` / iframe / form / style / 非复选框 input / 非 HTTP 外链处理；用户伪造 `.md-confirm` 和 `data-md-chrome` 不会生成固定遮罩。
- 持久化：刷新恢复内容、比例、滚动同步、行内公式、目录折叠状态。
- 结果：全部 PASS，无 console error、无 page error、无外部运行时请求。

### 请求审计与回归

- production preview 打开首页 + 5 个普通工具 + Markdown（含 Mermaid / KaTeX 懒加载 chunk）：85 个请求，49 个唯一同源 URL，外部域名 0。
- 回归：首页 35 张卡片、收藏、语言切换、主题持久化；5 个非 Markdown 工具保持 960px 容器；Markdown 使用全宽容器并保留全局导航；无 console / page error。

### 最终集成审查

- 独立审查者：`general` 子代理会话 `ses_e744d5c0fffeKgsEP0zc9ZQ71k`，与实现会话独立。
- 审查输入：完整 diff（base-ref 到 HEAD）、proposal、delta spec、design、tasks、测试和浏览器证据。
- 结论：**APPROVE**。0 个 CRITICAL，0 个 IMPORTANT。
- 审查后追加修复：分隔条 `pointercancel` / 窗口失焦清理、`ftp://` 外链安全属性、移除未使用的 `tool-page--wide` 根类；修复后重新运行 `npm test`、`npm run build`、浏览器矩阵、production audit 和回归，全部通过。
- 剩余非阻塞建议见下文。

## 需求覆盖

| 需求 | 结果 | 主要证据 |
| --- | --- | --- |
| 工具入口与路由 | PASS | `/tool/markdown`、首页卡片、全局导航；回归检查 |
| 双栏编辑与预览布局 | PASS | 全宽容器、分隔条拖拽 / 双击 / 键盘 / 持久化；375/768/1440 视口 |
| Markdown 编辑器能力 | PASS | CodeMirror 行号、活动行、括号匹配、搜索、换行、撤销 / 重做；无 Vim/Emacs |
| GFM 渲染与代码高亮 | PASS | marked GFM、`.hljs-*` 语法色、浏览器矩阵 |
| Mermaid 图表与源码切换 | PASS | SVG 渲染、strict、源码切换 / 复制、主题重渲染、错误回退 |
| KaTeX 数学公式 | PASS | 块级 / 行内 / 关闭行内 / `\(...\)` / 代码块跳过 / MathML 导出 |
| 目录侧栏 | PASS | h1–h4、≥2 自动显示、点击滚动、活动高亮、折叠持久化、移动端抽屉 |
| 文件导入与覆盖确认 | PASS | 选择 / 拖拽、覆盖确认、取消 / Escape、不支持类型、in-flight token |
| 复制 HTML 与代码 | PASS | 富剪贴板、`data-md-ui` 排除、代码块 / Mermaid 原文复制 |
| 远程图片与失败占位 | PASS | `no-referrer`、lazy、alt + URL 占位 |
| HTML 安全清洗 | PASS | DOMPurify、危险标签 / 属性 / URL 移除、表单控件限制、外链安全属性 |
| 状态持久化与清空 | PASS | 内容 / 比例 / 开关 / 目录状态；清空保留设置 |
| 滚动同步 | PASS | 默认开启、双向比例映射、关闭后独立、刷新保持 |
| 预览排版 | PASS | 860px 居中、代码 / 表格区域滚动、页面无横向溢出 |

## 优先级问题

### CRITICAL

无。

### WARNING

无。

### SUGGESTION

1. **Markdown CSS 仍有字面尺寸值**：`src/styles/markdown.css` 中部分字号、间距使用字面量，颜色、圆角和关键布局尺寸已使用令牌。这是项目既有 CSS 风格；后续可把高频排版值继续收敛到 `tokens.css`。
2. **编辑器语法色使用 CodeMirror 默认高亮**：预览侧已使用 `--md-syntax-*`，编辑器侧目前使用 `defaultHighlightStyle`；如需要编辑器与预览完全一致的语法色，可追加 `HighlightStyle`。
3. **清空语义与设计措辞略有差异**：`clearContent` 移除 `toolbox:markdown:content` key，design 决策 8 描述为写入空字符串。两者对用户行为等价，当前实现更干净；已在 `.comet/rulings.md` 记录。
4. **浏览器矩阵未作为仓库内 E2E 依赖提交**：Playwright 矩阵在外部 runner 执行，仓库内回归门禁为 Vitest 28 个测试；报告和 rulings 记录了命令与结果。

## 设计一致性

- 遵循 design.md 的组件拆分：`MarkdownTool` 状态容器 + Editor / Preview / TOC + `src/utils/markdown/` 纯逻辑。
- 遵循 marked → DOMPurify → DOM 装饰 → `v-html` → 异步增强管线。
- 遵循 CodeMirror Compartment 主题切换、Mermaid / KaTeX 懒加载、render token 竞态处理、两个 localStorage key、20%–80% 分隔比例和窄屏标签 / 抽屉降级。
- 安全实现比 design 更严格：额外禁止 `button` / `select` / `option` / `textarea` / `dialog`，并限制非复选框 input；已在 rulings 记录。
- 项目没有 `docs/superpowers/specs/` 独立设计文档；本次以 `docs/openspec/changes/markdown-preview/design.md`（frontmatter `role: technical-design`）作为 canonical technical design。该项按“不适用”处理，未计为缺失。

## 最终结论

所有适用检查通过，无 CRITICAL / WARNING；仅保留 4 条 SUGGESTION。实现满足 proposal、delta spec、design 和 tasks，具备归档条件。`branch_status` 仍为 `pending`，归档需要用户明确授权；归档后再处理 `comet/markdown-preview` 分支合并与推送。
