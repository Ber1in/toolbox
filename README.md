# 开发者工具箱 · 工具盒 Toolbox

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

所有计算都在浏览器本地完成，不发送任何请求、不需要登录。收藏与主题偏好仅存于 `localStorage`（`toolbox:favorites`、`toolbox:theme`）。
