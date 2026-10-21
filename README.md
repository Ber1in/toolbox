<a id="english"></a>

# Toolbox · Developer Utilities

[中文](#中文) | **English**

A **Vite + Vue 3 + TypeScript** implementation of the Ardot design “Developer Toolbox / 工具盒 Toolbox”.

The home page reproduces the design (7 tool categories) and adds a “Number Base Converter” to the original 33 tools, for **34 fully working tools**. Every tool has its own shareable route and supports browser back / forward.

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
- **Third-party libraries**: qrcode, jsbarcode, yaml, smol-toml and diff are all bundled
- **No remote APIs, analytics scripts or external images**
- **GitHub button** defaults to `href="#"` and performs no navigation or request; set `VITE_REPO_URL` to point at an intranet repository (see `.env.example`)
- **Request audit**: loading the built home page and several tool pages produced 56 requests, all same-origin, with 0 external domains

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

Apart from the fonts and parsers above there is no UI framework. Every spacing, radius, font size and color comes from design tokens; there are no scattered hard-coded values.

## Languages (Chinese / English)

The language selector on the right side of the nav switches the UI instantly, with no reload:

- **Default**: reads `toolbox:locale` from `localStorage`; when absent, uses the browser language (`zh*` → Chinese, otherwise English)
- **Persistence**: the choice is written to `localStorage` (`toolbox:locale`) and updates `<html lang>`, the page title and the meta description
- **Coverage**: nav, hero, categories, tool cards, footer, and every label / hint / error / table cell on all 34 tool pages, plus locale-aware `Intl` relative-time and time-zone formatting
- **Implementation**: a small in-house i18n layer (no `vue-i18n` dependency). The Chinese source string is the dictionary key and English lives in `src/i18n/en.ts`; missing translations fall back to Chinese rather than showing a raw key or blank text
- **Adding translations**: add a line such as `'中文原文': 'English text'` to `src/i18n/en.ts`. Use `{name}` placeholders for variables (e.g. `'共 {n} 个工具': '{n} tools'`) and call `t('共 {n} 个工具', { n })` from components
- **Offline**: language data ships in the bundle; no translation API or remote resource is requested
- The Chinese UI keeps the exact design dimensions (home page 3551px tall, cards 310×150). Longer English copy lets cards and the hero grow naturally so nothing is clipped

## Routes

| Path | Description |
| --- | --- |
| `/` | Home page (all tools) |
| `/?view=favorites` | Favorites view (shareable and survives refresh) |
| `/tool/:id` | Tool page, e.g. `/tool/base64`, `/tool/cidr` |

Unknown paths redirect to the home page; unknown tool ids show a “Tool not found” message.

## Tools (7 categories / 34 tools)

| Category | Tools |
| --- | --- |
| Encoding | Base64 Encode / Decode, Hex Encoder, Number Base Converter, URL Encoder, Unicode Converter, Morse Code |
| Format & Diff | JSON Formatter, YAML Formatter, TOML Formatter, Text Diff, XML Formatter |
| Time | Timestamp Converter, Time Zone Converter, Cron Expression, Countdown |
| Network / Ops | CIDR Subnet Calculator, IPv4 / IPv6 Calculator, Netmask Converter, Port Reference, HTTP Status Codes |
| Text | Case Converter, Whitespace Cleaner, Word & Line Counter, Regex Tester, Text Replace |
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

## Project structure

```
src/
├── components/        Home page sections (nav, hero, category tabs, cards, footer)
│   └── tool/          Shared tool page components (copy button)
├── composables/       useTheme / useFavorites / useCopy
├── data/toolbox.ts    Single source of truth for 7 categories / 34 tools (name, description, icon)
├── i18n/              index.ts (locale state / t() / detection & persistence), en.ts (English dictionary)
├── router/            Routes and scroll behavior
├── styles/            tokens.css (design tokens + dark theme), base.css, tool.css
├── tools/             34 tool components + registry.ts (id → component map)
└── views/             HomeView (home page), ToolView (tool page shell)
```

To add a tool: add an entry to the right category in `src/data/toolbox.ts`, create a tool component, and register it in `src/tools/registry.ts`.

## Differences from the design

The design only covers the home page. The following parts are reasonable extensions and are noted in the implementation:

1. **Icons**: Ardot MCP does not expose VECTOR geometry, so icons approximate the originals with the closest lucide shapes (see the comment above `toolCategories` in `src/data/toolbox.ts`).
2. **Dark theme**: the design only has a light theme; dark values are derived from the existing tokens (`[data-theme='dark']` in `tokens.css`) while preserving contrast.
3. **Favorites**: the design has no star. The star in the top-right corner of each card is hidden by default and appears on hover / keyboard focus; favorites are stored in `localStorage` and do not affect the original card size or visuals.
4. **Tool pages**: the design has no detail pages. Their visual language (`.panel`, `.field`, `.btn`, `.stat`, `.table`) is derived entirely from the home page tokens.
5. **1px strokes**: Ardot strokes do not consume layout, so card / tab strokes use `inset box-shadow`, keeping cards at 310×150 and tabs at 96px tall.
6. **Inconsistencies in the design itself**: the home page subtitle says “40+” but the original has only 33 cards; the last card uses `hug_contents`; “Format” and “Generators” reuse the same green. All of these are preserved as-is.
7. **The added “Number Base Converter”**: this tool is not in the original design. Its card follows the same spec (310×150, same icon background) and is inserted into the Encoding category, keeping the home page at 3551px tall.

## Privacy

All computation happens locally in the browser. No requests are sent and no login is required. Favorites, theme preference and language choice are stored only in `localStorage` (`toolbox:favorites`, `toolbox:theme`, `toolbox:locale`).

---

<a id="中文"></a>

# 开发者工具箱 · 工具盒 Toolbox

**中文** | [English](#english)

Ardot 设计稿「开发者工具箱 / 工具盒 Toolbox」的 **Vite + Vue 3 + TypeScript** 实现。

首页按设计稿还原（7 大类工具卡），并在原稿 33 个工具的基础上新增了「进制转换」，共 **34 个工具全部可用**：每个工具都有独立的可分享路由页面，支持浏览器前进 / 后退。

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
- **第三方库**：qrcode、jsbarcode、yaml、smol-toml、diff 全部打进 bundle
- **无远程接口、无统计脚本、无外部图片**
- **GitHub 按钮**默认 `href="#"`，点击不跳转也不发请求；需要指向内网仓库时设置环境变量 `VITE_REPO_URL`（参考 `.env.example`）
- **请求审计**：用构建产物打开首页和多个工具页，共 56 个网络请求全部指向本站，外部域名 0 个

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

除字体与上述解析库外没有 UI 框架，所有间距、圆角、字号、颜色均来自设计令牌，没有散落的硬编码值。

## 多语言（中文 / English）

导航栏右侧的语言选择器可以随时切换界面语言，切换即时生效、无需刷新：

- **默认语言**：优先读取 `localStorage` 中的 `toolbox:locale`；没有记录时按浏览器语言判断（`zh*` → 中文，其它 → English）
- **持久化**：选择结果写入 `localStorage`（`toolbox:locale`），同时更新 `<html lang>` 与页面标题 / 描述
- **覆盖范围**：导航、Hero、分类、工具卡、页脚、34 个工具页的标签 / 提示 / 错误信息 / 表格内容，以及 `Intl` 的相对时间与时区格式
- **实现**：轻量自研 i18n（无 `vue-i18n` 依赖），中文原文即字典 key，英文查 `src/i18n/en.ts`；缺失译文时英文界面回退显示中文原文，不会出现 key 或空白
- **新增译文**：在 `src/i18n/en.ts` 中加一行 `'中文原文': 'English text'`；带变量的文案用 `{name}` 占位符（例如 `'共 {n} 个工具': '{n} tools'`），组件里调用 `t('共 {n} 个工具', { n })`
- **离线**：语言包随 bundle 打包，不请求任何翻译接口或远程资源
- 中文界面仍严格保持设计稿尺寸（首页总高 3551px、卡片 310×150）；英文文案较长时卡片与 Hero 会自然增高，避免文字被截断

## 路由

| 路径 | 说明 |
| --- | --- |
| `/` | 首页（全部工具） |
| `/?view=favorites` | 收藏视图（可直接分享 / 刷新保持） |
| `/tool/:id` | 工具页，例如 `/tool/base64`、`/tool/cidr` |

未知路径会重定向回首页；未知工具 id 会显示「工具不存在」提示。

## 工具清单（7 类 / 34 个）

| 分类 | 工具 |
| --- | --- |
| 编码转换 | Base64 编解码、Hex 十六进制、进制转换、URL 编码、Unicode 转换、摩尔斯码 |
| 格式化 | JSON 格式化、YAML 格式化、TOML 格式化、文本对比 Diff、XML 美化 |
| 时间日期 | 时间戳转换、时区换算、Cron 表达式、倒计时 |
| 网络工具 | CIDR 子网计算、IPv4 / IPv6 计算、掩码转换、端口参考、HTTP 状态码 |
| 文本处理 | 大小写转换、空白清理、字数统计、正则测试、查找替换 |
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

## 目录结构

```
src/
├── components/        首页区块（导航、Hero、分类 Tab、卡片、页脚）
│   └── tool/          工具页通用组件（复制按钮）
├── composables/       useTheme / useFavorites / useCopy
├── data/toolbox.ts    7 大类 34 个工具的唯一数据源（名称、描述、图标）
├── i18n/              index.ts（语言状态 / t() / 检测与持久化）、en.ts（英文词典）
├── router/            路由与滚动行为
├── styles/            tokens.css（设计令牌 + 深色主题）、base.css、tool.css
├── tools/             34 个工具组件 + registry.ts（id → 组件映射）
└── views/             HomeView（首页）、ToolView（工具页外壳）
```

新增工具：在 `src/data/toolbox.ts` 对应分类里加一条记录，写一个工具组件，再到 `src/tools/registry.ts` 注册即可。

## 与设计稿的差异

设计稿只覆盖首页，以下部分为合理延伸，已在实现中标注：

1. **图标**：Ardot MCP 不暴露 VECTOR 的几何数据，图标用 lucide 中语义最接近的图形近似（说明见 `src/data/toolbox.ts` 中 `toolCategories` 上方的注释）。
2. **深色主题**：设计稿只有浅色，深色由现有令牌推导（`tokens.css` 中 `[data-theme='dark']`），并保持对比度。
3. **收藏功能**：设计稿没有星标。卡片右上角的星标默认隐藏，悬停 / 键盘聚焦才出现，收藏写入 `localStorage`，不影响卡片原始尺寸与视觉。
4. **工具详情页**：设计稿没有详情页，视觉语言（`.panel`、`.field`、`.btn`、`.stat`、`.table`）全部复用首页令牌推导。
5. **1px 描边**：Ardot 的 stroke 不占布局，因此卡片 / Tab 的描边用 `inset box-shadow` 实现，保证卡片仍是 310×150、Tab 高度仍是 96px。
6. **设计稿自身的不一致**：首页副标题写「40+」但原稿只有 33 张卡片；最后一张卡片使用 `hug_contents`；「格式化」与「离线生成」复用了同一个绿色。这些均按原稿保留，未擅自改动。
7. **新增的「进制转换」**：原稿没有这个工具，卡片按同一套规格（310×150、同款图标底色）插入「编码转换」分类，首页总高仍为 3551px。

## 隐私

所有计算都在浏览器本地完成，不发送任何请求、不需要登录。收藏、主题偏好与语言选择仅存于 `localStorage`（`toolbox:favorites`、`toolbox:theme`、`toolbox:locale`）。
