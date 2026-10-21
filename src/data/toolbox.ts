import type { Component } from 'vue'
import {
  ArrowDownNarrowWide,
  ArrowLeftRight,
  ArrowUpDown,
  Barcode,
  Binary,
  Braces,
  Briefcase,
  CaseSensitive,
  ChartNoAxesColumnIncreasing,
  CircleAlert,
  Clock,
  Code,
  CodeXml,
  Crop,
  Dices,
  FileDiff,
  FoldVertical,
  Globe,
  Hash,
  Hourglass,
  Image,
  Link,
  LockKeyhole,
  Network,
  PanelTop,
  Pipette,
  QrCode,
  Radar,
  Radio,
  Regex,
  Replace,
  Rows3,
  Shrink,
  SlidersHorizontal,
} from 'lucide-vue-next'

export type CategoryKey =
  | 'encoding'
  | 'format'
  | 'time'
  | 'network'
  | 'text'
  | 'image'
  | 'generate'

export interface Tool {
  /** Stable business id used for favorites, analytics, etc. */
  id: string
  name: string
  description: string
  icon: Component
}

export interface ToolCategory {
  key: CategoryKey
  /** Tabs and section headings share the same label (identical in the design). */
  label: string
  tools: Tool[]
}

/**
 * Copy, grouping and order follow the design file.
 *
 * Icons: Ardot does not expose vector path data for these nodes, so semantically
 * equivalent lucide outline icons are used instead (2px stroke, rounded caps,
 * matching the original visual language). For a 1:1 match, export SVGs from the
 * design and replace the icon field.
 */
export const toolCategories: ToolCategory[] = [
  {
    key: 'encoding',
    label: '编码转换',
    tools: [
      {
        id: 'base64',
        name: 'Base64 编解码',
        description: '文本与 Base64 互转，支持 UTF-8',
        icon: Code,
      },
      {
        id: 'hex',
        name: 'Hex 十六进制',
        description: '字符串与 Hex 字节互转',
        icon: Binary,
      },
      {
        id: 'radix',
        name: '进制转换',
        description: '2 / 8 / 10 / 16 进制互转',
        icon: Hash,
      },
      {
        id: 'url',
        name: 'URL 编码',
        description: 'encodeURIComponent / decode',
        icon: Link,
      },
      {
        id: 'unicode',
        name: 'Unicode 转换',
        description: '字符与 \\uXXXX 转义互转',
        icon: ArrowLeftRight,
      },
      {
        id: 'morse',
        name: '摩尔斯码',
        description: '文本与摩尔斯电码互转',
        icon: Radio,
      },
    ],
  },
  {
    key: 'format',
    label: '格式化 & Diff',
    tools: [
      {
        id: 'json',
        name: 'JSON 格式化',
        description: '美化、压缩、校验 JSON',
        icon: Braces,
      },
      {
        id: 'yaml',
        name: 'YAML 格式化',
        description: '美化、校验、转 JSON',
        icon: ArrowUpDown,
      },
      {
        id: 'toml',
        name: 'TOML 格式化',
        description: '配置文件美化与解析',
        icon: PanelTop,
      },
      {
        id: 'diff',
        name: '文本对比 Diff',
        description: '逐行对比两段文本差异',
        icon: FileDiff,
      },
      {
        id: 'xml',
        name: 'XML 美化',
        description: '格式化与压缩 XML',
        icon: CodeXml,
      },
    ],
  },
  {
    key: 'time',
    label: '时间类',
    tools: [
      {
        id: 'timestamp',
        name: '时间戳转换',
        description: 'Unix 时间戳与日期互转',
        icon: Clock,
      },
      {
        id: 'timezone',
        name: '时区换算',
        description: '跨时区时间快速换算',
        icon: Globe,
      },
      {
        id: 'cron',
        name: 'Cron 表达式',
        description: '解析与生成定时表达式',
        icon: ArrowDownNarrowWide,
      },
      {
        id: 'countdown',
        name: '倒计时',
        description: '自定义目标时间的倒计时',
        icon: Hourglass,
      },
    ],
  },
  {
    key: 'network',
    label: '网络 / 运维',
    tools: [
      {
        id: 'cidr',
        name: 'CIDR 子网计算',
        description: '网段、主机数、范围计算',
        icon: Radar,
      },
      {
        id: 'ip',
        name: 'IPv4 / IPv6 计算',
        description: '地址合法性校验与转换',
        icon: Network,
      },
      {
        id: 'netmask',
        name: '掩码转换',
        description: '子网掩码与 CIDR 前缀互转',
        icon: SlidersHorizontal,
      },
      {
        id: 'port',
        name: '端口参考',
        description: '常用端口号速查表',
        icon: Briefcase,
      },
      {
        id: 'http',
        name: 'HTTP 状态码',
        description: '状态码含义快速查询',
        icon: CircleAlert,
      },
    ],
  },
  {
    key: 'text',
    label: '文本处理',
    tools: [
      {
        id: 'case',
        name: '大小写转换',
        description: '大写、小写、驼峰等转换',
        icon: CaseSensitive,
      },
      {
        id: 'whitespace',
        name: '去空格 / 换行',
        description: '清理多余空白与换行符',
        icon: FoldVertical,
      },
      {
        id: 'count',
        name: '字数 / 行数统计',
        description: '字符、单词、行数统计',
        icon: ChartNoAxesColumnIncreasing,
      },
      {
        id: 'regex',
        name: '正则测试',
        description: '实时匹配高亮与测试',
        icon: Regex,
      },
      {
        id: 'replace',
        name: '文本替换',
        description: '批量查找替换文本',
        icon: Replace,
      },
    ],
  },
  {
    key: 'image',
    label: '图像处理',
    tools: [
      {
        id: 'compress',
        name: '图片压缩',
        description: '本地压缩，不传服务器',
        icon: Shrink,
      },
      {
        id: 'convert',
        name: '格式转换',
        description: 'PNG / JPEG / WebP 互转',
        icon: Image,
      },
      {
        id: 'crop',
        name: '尺寸裁剪',
        description: '裁剪与调整图片尺寸',
        icon: Crop,
      },
      {
        id: 'color',
        name: '色值拾取',
        description: 'RGB / HEX 颜色互转',
        icon: Pipette,
      },
    ],
  },
  {
    key: 'generate',
    label: '离线生成',
    tools: [
      {
        id: 'qrcode',
        name: '二维码生成',
        description: '文本 / 链接生成二维码',
        icon: QrCode,
      },
      {
        id: 'barcode',
        name: '条形码生成',
        description: 'Code128 / EAN 条形码',
        icon: Barcode,
      },
      {
        id: 'password',
        name: '密码生成器',
        description: '强密码自定义规则生成',
        icon: LockKeyhole,
      },
      {
        id: 'random',
        name: '随机字符串',
        description: '自定义长度随机字符串',
        icon: Dices,
      },
      {
        id: 'uuid',
        name: 'UUID 生成',
        description: 'v4 / v7 UUID 批量生成',
        icon: Rows3,
      },
    ],
  },
]

export const allTools = toolCategories.flatMap((category) =>
  category.tools.map((tool) => ({ ...tool, category: category.key })),
)
