<a id="english"></a>

# Toolbox · Developer Utilities

[中文](#中文) | **English**

A **Vite + Vue 3 + TypeScript** developer toolbox with **35 fully working tools** across 7 categories. Every tool has its own shareable route and supports browser back / forward.

## Run

```bash
npm install
npm run dev      # local dev server, http://localhost:5173 by default
npm run build    # type-check (vue-tsc) + production build
npm run preview  # preview the production build
```

## Offline / intranet deployment

**Zero external requests at runtime.** `dist/` can be copied to any static intranet server:

- **Fonts**: Inter is bundled into `dist/assets` via `@fontsource/inter`; no Google Fonts or CDN links
- **Icons**: lucide components compile to inline SVG; no icon fonts or remote assets
- **Third-party libraries**: qrcode, jsbarcode, yaml, smol-toml and diff are bundled. The Markdown tool's CodeMirror, marked, DOMPurify, highlight.js, KaTeX and Mermaid code is bundled locally too; the heavy editor, math and diagram chunks are loaded on demand from the same origin
- **No remote APIs, analytics scripts or app-supplied external images**; images you embed in a Markdown document are loaded by the browser from the URL you provide, and remote images can be blocked with the browser's normal privacy settings
- **GitHub button** opens https://github.com/Ber1in/toolbox in a new tab; no request is made until you click it. Set `VITE_REPO_URL` to point at an intranet mirror instead (see `.env.example`)
- **Request audit**: loading the built home page, five regular tools and the Markdown tool (including Mermaid and KaTeX chunks) produced 85 requests, all same-origin, with 0 external domains

To deploy under a sub-path (e.g. `http://intranet/toolbox/`), set `base: '/toolbox/'` in `vite.config.ts` and rebuild.

## Stack

| Purpose | Choice |
| --- | --- |
| Framework | Vue 3 (`<script setup>`) + TypeScript |
| Routing | vue-router 5 (History mode) |
| Styling | Plain CSS + CSS variable design tokens (`src/styles/tokens.css`) |
| Icons | lucide-vue-next |
| QR / barcode | `qrcode`, `jsbarcode` |
| Config formats | `yaml`, `smol-toml` |
| Text diff | `diff` |
| Markdown | `marked`, DOMPurify, CodeMirror 6, highlight.js, KaTeX, Mermaid |

Apart from the fonts and parsers above there is no UI framework. Every spacing, radius, font size and color comes from design tokens; there are no scattered hard-coded values.

## Languages (Chinese / English)

The language selector on the right side of the nav switches the UI instantly, with no reload:

- **Default**: reads `toolbox:locale` from `localStorage`; when absent, uses the browser language (`zh*` → Chinese, otherwise English)
- **Persistence**: the choice is written to `localStorage` (`toolbox:locale`) and updates `<html lang>`, the page title and the meta description
- **Coverage**: nav, hero, categories, tool cards, footer, and every label / hint / error / table cell on all 35 tool pages, plus locale-aware `Intl` relative-time and time-zone formatting
- **Implementation**: a small in-house i18n layer (no `vue-i18n` dependency). The Chinese source string is the dictionary key and English lives in `src/i18n/en.ts`; missing translations fall back to Chinese rather than showing a raw key or blank text
- **Adding translations**: add a line such as `'中文原文': 'English text'` to `src/i18n/en.ts`. Use `{name}` placeholders for variables (e.g. `'共 {n} 个工具': '{n} tools'`) and call `t('共 {n} 个工具', { n })` from components
- **Offline**: language data ships in the bundle; no translation API or remote resource is requested
- Longer English copy lets cards and the hero grow naturally so nothing is clipped

## Routes

| Path | Description |
| --- | --- |
| `/` | Home page (all tools) |
| `/?view=favorites` | Favorites view (shareable and survives refresh) |
| `/tool/:id` | Tool page, e.g. `/tool/base64`, `/tool/cidr` |

Unknown paths redirect to the home page; unknown tool ids show a “Tool not found” message.

## Tools (7 categories / 35 tools)

| Category | Tools |
| --- | --- |
| Encoding | Base64 Encode / Decode, Hex Encoder, Number Base Converter, URL Encoder, Unicode Converter, Morse Code |
| Format & Diff | JSON Formatter, YAML Formatter, TOML Formatter, Text Diff, XML Formatter |
| Time | Timestamp Converter, Time Zone Converter, Cron Expression, Countdown |
| Network / Ops | CIDR Subnet Calculator, IPv4 / IPv6 Calculator, Netmask Converter, Port Reference, HTTP Status Codes |
| Text | Case Converter, Whitespace Cleaner, Word & Line Counter, Regex Tester, Text Replace, Markdown Preview |
| Images | Image Compressor, Image Converter, Image Cropper, Color Picker |
| Generators | QR Code Generator, Barcode Generator, Password Generator, Random String, UUID Generator |

Feature notes:

- **Encoding**: UTF-8 safe (Chinese and emoji are not corrupted); clear errors when decoding fails.
- **Base conversion**: any source base from 2–36, live binary / octal / decimal / hex output, plus a full 2–36 table. Switching the source base converts the current value; BigInt keeps full precision.
- **Formatting**: live validation with error details; YAML / TOML convert both ways.
- **Time**: timestamps auto-detect seconds vs milliseconds; time zones use `Intl` and account for DST; Cron supports `*`, `*/n`, `a-b`, `a-b/n`, `a,b` and `JAN` / `MON` abbreviations and shows the next 5 runs.
- **Network**: CIDR computes the network address, broadcast address and usable host range; IPv6 expands / compresses automatically; ports and status codes are searchable.
- **Images**: everything runs locally in the browser with Canvas; adjust quality / size / format and download — images are never uploaded.
- **Generators**: passwords and random strings use `crypto.getRandomValues` with rejection sampling to avoid modulo bias; UUID supports v4 and time-ordered v7.
- **Markdown**: CodeMirror 6 editing with GFM preview, sanitized HTML, a heading outline, synchronized scrolling, inline and block KaTeX, Mermaid diagrams with a source toggle, raw code copy, HTML export and a locally persisted draft.

## Project structure

```
src/
├── components/        Home page sections (nav, hero, category tabs, cards, footer)
│   └── tool/          Shared tool page components (copy button, markdown editor/preview/outline)
├── composables/       useTheme / useFavorites / useCopy
├── data/toolbox.ts    Single source of truth for 7 categories / 35 tools (name, description, icon)
├── i18n/              index.ts (locale state / t() / detection & persistence), en.ts (English dictionary)
├── router/            Routes and scroll behavior
├── styles/            tokens.css (design tokens + dark theme), base.css, tool.css, markdown.css
├── tools/             35 tool components + registry.ts (id → component map)
├── utils/markdown/    Renderer, sanitizer, heading/outline, export, storage and pipeline
└── views/             HomeView (home page), ToolView (tool page shell)
```

To add a tool: add an entry to the right category in `src/data/toolbox.ts`, create a tool component, and register it in `src/tools/registry.ts`.

## Privacy

All computation happens locally in the browser. The app sends no requests and requires no login; remote images embedded in a Markdown document are loaded by the browser from the URL you provide. Favorites, theme preference, language choice and the Markdown draft / view settings are stored only in `localStorage` (`toolbox:favorites`, `toolbox:theme`, `toolbox:locale`, `toolbox:markdown:content`, `toolbox:markdown:settings`).

---

<a id="中文"></a>

# 开发者工具箱 · 工具盒 Toolbox

**中文** | [English](#english)

基于 **Vite + Vue 3 + TypeScript** 的开发者工具箱，7 大类共 **35 个工具全部可用**：每个工具都有独立的可分享路由页面，支持浏览器前进 / 后退。

## 运行

```bash
npm install
npm run dev      # 本地开发，默认 http://localhost:5173
npm run build    # 类型检查（vue-tsc）+ 生产构建
npm run preview  # 预览构建产物
```

## 离线 / 内网部署

**运行时零外部请求**，`dist/` 可以直接拷到内网静态服务器使用：

- **字体**：Inter 通过 `@fontsource/inter` 打包进 `dist/assets`，没有 Google Fonts / CDN 链接
- **图标**：lucide 组件编译为内联 SVG，不加载图标字体或远程资源
- **第三方库**：qrcode、jsbarcode、yaml、smol-toml、diff 全部打进 bundle；Markdown 工具的 CodeMirror、marked、DOMPurify、highlight.js、KaTeX、Mermaid 也全部本地打包，编辑器、公式与图表的大体积 chunk 按需从本站加载
- **无远程接口、无统计脚本、无应用自带的外部图片**；Markdown 文档中自行嵌入的图片会由浏览器按你填写的 URL 加载，可按浏览器常规隐私设置拦截远程图片
- **GitHub 按钮**直接打开项目仓库 https://github.com/Ber1in/toolbox（新标签页），点击前不发起任何请求；内网镜像可通过环境变量 `VITE_REPO_URL` 覆盖（参考 `.env.example`）
- **请求审计**：用构建产物打开首页、5 个普通工具页和 Markdown 工具（含 Mermaid、KaTeX 按需 chunk），共 85 个网络请求全部指向本站，外部域名 0 个

部署到子路径（如 `http://intranet/toolbox/`）时，在 `vite.config.ts` 中设置 `base: '/toolbox/'` 后重新构建即可。

## 技术栈

| 用途 | 选型 |
| --- | --- |
| 框架 | Vue 3（`<script setup>`）+ TypeScript |
| 路由 | vue-router 5（History 模式） |
| 样式 | 纯 CSS + CSS 变量设计令牌（`src/styles/tokens.css`） |
| 图标 | lucide-vue-next |
| 二维码 / 条形码 | `qrcode`、`jsbarcode` |
| 配置格式 | `yaml`、`smol-toml` |
| 文本对比 | `diff` |
| Markdown | `marked`、DOMPurify、CodeMirror 6、highlight.js、KaTeX、Mermaid |

除字体与上述解析库外没有 UI 框架，所有间距、圆角、字号、颜色均来自设计令牌，没有散落的硬编码值。

## 多语言（中文 / English）

导航栏右侧的语言选择器可以随时切换界面语言，切换即时生效、无需刷新：

- **默认语言**：优先读取 `localStorage` 中的 `toolbox:locale`；没有记录时按浏览器语言判断（`zh*` → 中文，其它 → English）
- **持久化**：选择结果写入 `localStorage`（`toolbox:locale`），同时更新 `<html lang>` 与页面标题 / 描述
- **覆盖范围**：导航、Hero、分类、工具卡、页脚、35 个工具页的标签 / 提示 / 错误信息 / 表格内容，以及 `Intl` 的相对时间与时区格式
- **实现**：轻量自研 i18n（无 `vue-i18n` 依赖），中文原文即字典 key，英文查 `src/i18n/en.ts`；缺失译文时英文界面回退显示中文原文，不会出现 key 或空白
- **新增译文**：在 `src/i18n/en.ts` 中加一行 `'中文原文': 'English text'`；带变量的文案用 `{name}` 占位符（例如 `'共 {n} 个工具': '{n} tools'`），组件里调用 `t('共 {n} 个工具', { n })`
- **离线**：语言包随 bundle 打包，不请求任何翻译接口或远程资源
- 英文文案较长时卡片与 Hero 会自然增高，避免文字被截断

## 路由

| 路径 | 说明 |
| --- | --- |
| `/` | 首页（全部工具） |
| `/?view=favorites` | 收藏视图（可直接分享 / 刷新保持） |
| `/tool/:id` | 工具页，例如 `/tool/base64`、`/tool/cidr` |

未知路径会重定向回首页；未知工具 id 会显示「工具不存在」提示。

## 工具清单（7 类 / 35 个）

| 分类 | 工具 |
| --- | --- |
| 编码转换 | Base64 编解码、Hex 十六进制、进制转换、URL 编码、Unicode 转换、摩尔斯码 |
| 格式化 | JSON 格式化、YAML 格式化、TOML 格式化、文本对比 Diff、XML 美化 |
| 时间日期 | 时间戳转换、时区换算、Cron 表达式、倒计时 |
| 网络工具 | CIDR 子网计算、IPv4 / IPv6 计算、掩码转换、端口参考、HTTP 状态码 |
| 文本处理 | 大小写转换、空白清理、字数统计、正则测试、查找替换、Markdown 预览 |
| 图片工具 | 图片压缩、格式转换、图片裁剪、颜色转换 |
| 离线生成 | 二维码生成、条形码生成、密码生成、随机字符串、UUID 生成 |

功能要点：

- **编码类**：UTF-8 安全（中文、Emoji 不会乱码），解码失败有明确错误提示。
- **进制转换**：可选 2–36 任意源进制，实时列出二进制 / 八进制 / 十进制 / 十六进制，并附 2–36 全进制对照表；切换源进制时自动把当前数值换算过去，基于 BigInt 计算不丢精度。
- **格式化类**：实时校验并显示错误行信息；YAML / TOML 支持双向转换。
- **时间类**：时间戳自动识别秒 / 毫秒；时区换算基于 `Intl`，覆盖夏令时；Cron 支持 `*`、`*/n`、`a-b`、`a-b/n`、`a,b` 与 `JAN` / `MON` 缩写，并给出未来 5 次执行时间。
- **网络类**：CIDR 计算网络地址、广播地址、可用主机范围；IPv6 自动展开 / 压缩；端口与状态码支持搜索。
- **图片类**：全部在浏览器本地用 Canvas 处理，可调质量 / 尺寸 / 格式并下载，图片不会上传。
- **生成类**：密码与随机字符串使用 `crypto.getRandomValues`（拒绝采样避免取模偏差）；UUID 支持 v4 与按时间排序的 v7。
- **Markdown**：CodeMirror 6 实时编辑 + GFM 预览，HTML 清洗、标题目录、滚动同步、KaTeX 行内 / 块级公式、Mermaid 图表及源码切换、代码复制、导出 HTML，并在本地保存草稿。

## 目录结构

```
src/
├── components/        首页区块（导航、Hero、分类 Tab、卡片、页脚）
│   └── tool/          工具页通用组件（复制按钮、Markdown 编辑器 / 预览 / 目录）
├── composables/       useTheme / useFavorites / useCopy
├── data/toolbox.ts    7 大类 35 个工具的唯一数据源（名称、描述、图标）
├── i18n/              index.ts（语言状态 / t() / 检测与持久化）、en.ts（英文词典）
├── router/            路由与滚动行为
├── styles/            tokens.css（设计令牌 + 深色主题）、base.css、tool.css、markdown.css
├── tools/             35 个工具组件 + registry.ts（id → 组件映射）
├── utils/markdown/    渲染、HTML 清洗、标题 / 目录、导出、持久化与渲染管线
└── views/             HomeView（首页）、ToolView（工具页外壳）
```

新增工具：在 `src/data/toolbox.ts` 对应分类里加一条记录，写一个工具组件，再到 `src/tools/registry.ts` 注册即可。

## 隐私

所有计算都在浏览器本地完成。应用本身不发送请求、不需要登录；Markdown 文档中自行嵌入的远程图片会由浏览器按你填写的 URL 加载。收藏、主题偏好、语言选择以及 Markdown 草稿 / 视图设置仅存于 `localStorage`（`toolbox:favorites`、`toolbox:theme`、`toolbox:locale`、`toolbox:markdown:content`、`toolbox:markdown:settings`）。
