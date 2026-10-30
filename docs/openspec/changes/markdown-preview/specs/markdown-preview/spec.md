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

- **WHEN** 用户输入合法的 Mermaid 流程图代码块
- **THEN** 预览显示渲染后的 SVG 图表

#### Scenario: 查看图表源码

- **WHEN** 用户点击某张 Mermaid 图的源码切换按钮
- **THEN** 该图切换为原始 Mermaid 代码，再次点击恢复图表

### Requirement: KaTeX 数学公式

预览必须将块级 `$$...$$` 渲染为 KaTeX 公式。行内 `$...$` 的渲染由开关控制，默认开启；关闭开关后，行内公式必须按原文显示。

#### Scenario: 渲染块级公式

- **WHEN** 用户输入 `$$E = mc^2$$`
- **THEN** 预览显示对应的 KaTeX 块级公式

#### Scenario: 关闭行内公式

- **WHEN** 用户关闭行内公式开关并输入 `$a+b$`
- **THEN** 预览按原文显示 `$a+b$`，不渲染为公式

### Requirement: 目录侧栏

预览右侧必须提供可折叠目录侧栏，收录 h1 至 h4 标题。标题数量大于等于 2 时目录必须自动显示；点击目录项必须滚动到对应标题；预览滚动时必须高亮当前标题。窄屏下目录必须以浮层呈现。

#### Scenario: 自动生成目录

- **WHEN** 文档包含两个或更多 h1 至 h4 标题
- **THEN** 预览右侧显示包含这些标题的目录

#### Scenario: 点击目录跳转

- **WHEN** 用户点击目录中的某个标题
- **THEN** 预览滚动到对应标题并高亮该目录项

#### Scenario: 目录折叠

- **WHEN** 用户折叠目录侧栏
- **THEN** 目录收起且折叠状态在刷新后保持

### Requirement: 文件导入与覆盖确认

工具必须支持拖拽或文件选择导入 `.md`、`.markdown` 和 `.txt` 文件。导入内容必须替换编辑器内容；当编辑器已有非空内容时，必须先向用户确认是否覆盖。

#### Scenario: 导入 Markdown 文件

- **WHEN** 用户拖入一个 `.md` 文件
- **THEN** 文件内容加载到编辑器并显示在预览中

#### Scenario: 覆盖非空内容前确认

- **WHEN** 编辑器已有内容且用户导入新文件
- **THEN** 页面先显示覆盖确认，用户取消时原内容保持不变

#### Scenario: 拒绝不支持的文件

- **WHEN** 用户选择不支持的扩展名
- **THEN** 页面不导入文件并显示错误提示

### Requirement: 复制 HTML 与代码

工具栏必须支持复制干净的语义化 HTML，内容包含代码高亮 span、Mermaid SVG 和 KaTeX MathML，但必须排除目录、复制按钮和其他界面元素。每个代码块必须提供独立的原始代码复制按钮。

#### Scenario: 复制完整 HTML

- **WHEN** 用户点击复制 HTML
- **THEN** 剪贴板包含预览正文的语义化 HTML，且不含目录或工具栏

#### Scenario: 复制代码块原文

- **WHEN** 用户点击某个代码块的复制按钮
- **THEN** 剪贴板包含该代码块的原始代码

### Requirement: 远程图片与失败占位

远程图片必须直接加载并附加 `no-referrer`。图片加载失败时，必须显示包含 alt 文本和图片 URL 的占位提示。

#### Scenario: 加载远程图片

- **WHEN** Markdown 中包含可访问的远程图片地址
- **THEN** 预览直接加载该图片且不发送 Referer

#### Scenario: 图片加载失败

- **WHEN** Markdown 中的远程图片无法加载
- **THEN** 预览显示包含 alt 和 URL 的占位提示

### Requirement: HTML 安全清洗

预览必须允许原始 HTML，但必须使用 DOMPurify 清洗。系统必须移除脚本、事件属性、`javascript:` URL、iframe、form 和 style 标签。外部链接必须添加 `target="_blank"` 和 `rel="noopener noreferrer"`。

#### Scenario: 移除危险脚本

- **WHEN** Markdown 中包含 `<script>` 或事件属性
- **THEN** 预览和复制出的 HTML 中都不包含这些内容

#### Scenario: 处理危险链接

- **WHEN** Markdown 中包含 `javascript:` 链接或外部链接
- **THEN** 危险链接被移除或中和，外部链接带有安全打开属性

#### Scenario: 移除危险嵌入

- **WHEN** Markdown 中包含 iframe、form 或 style 标签
- **THEN** 预览中不渲染这些标签

### Requirement: 状态持久化与清空

系统必须持久化编辑器内容、分隔比例、滚动同步开关、行内公式开关和目录折叠状态。「清空」操作只能清除内容与草稿，必须保留视图设置。

#### Scenario: 刷新后恢复状态

- **WHEN** 用户编辑内容并调整视图设置后刷新页面
- **THEN** 内容、比例和视图设置恢复为刷新前的状态

#### Scenario: 清空内容

- **WHEN** 用户点击「清空」
- **THEN** 编辑器和预览变为空，滚动同步、行内公式和目录设置保持不变

### Requirement: 滚动同步

滚动同步必须默认开启并提供开关。开启时编辑器与预览必须联动滚动；关闭时两个面板必须独立滚动。

#### Scenario: 开启联动滚动

- **WHEN** 滚动同步开启且用户滚动编辑器
- **THEN** 预览按对应位置联动滚动

#### Scenario: 关闭联动滚动

- **WHEN** 用户关闭滚动同步并滚动其中一个面板
- **THEN** 另一个面板不滚动

### Requirement: 预览排版

预览正文必须最大宽度约 860px 并居中。代码块和表格必须在内容区域内横向滚动，不得撑破页面布局。

#### Scenario: 宽内容横向滚动

- **WHEN** 预览中包含超宽代码块或表格
- **THEN** 该内容在预览区域内横向滚动，页面整体不出现横向溢出
