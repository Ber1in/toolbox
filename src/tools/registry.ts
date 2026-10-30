import type { Component } from 'vue'
import { allTools, type Tool } from '../data/toolbox'

import Base64Tool from './Base64Tool.vue'
import BarcodeTool from './BarcodeTool.vue'
import CaseTool from './CaseTool.vue'
import CidrTool from './CidrTool.vue'
import ColorTool from './ColorTool.vue'
import CompressTool from './CompressTool.vue'
import ConvertTool from './ConvertTool.vue'
import CountTool from './CountTool.vue'
import CountdownTool from './CountdownTool.vue'
import CronTool from './CronTool.vue'
import CropTool from './CropTool.vue'
import DiffTool from './DiffTool.vue'
import HexTool from './HexTool.vue'
import HttpTool from './HttpTool.vue'
import IpTool from './IpTool.vue'
import JsonTool from './JsonTool.vue'
import MarkdownTool from './MarkdownTool.vue'
import MorseTool from './MorseTool.vue'
import NetmaskTool from './NetmaskTool.vue'
import PasswordTool from './PasswordTool.vue'
import PortTool from './PortTool.vue'
import QrcodeTool from './QrcodeTool.vue'
import RadixTool from './RadixTool.vue'
import RandomTool from './RandomTool.vue'
import RegexTool from './RegexTool.vue'
import ReplaceTool from './ReplaceTool.vue'
import TimestampTool from './TimestampTool.vue'
import TimezoneTool from './TimezoneTool.vue'
import TomlTool from './TomlTool.vue'
import UnicodeTool from './UnicodeTool.vue'
import UrlTool from './UrlTool.vue'
import UuidTool from './UuidTool.vue'
import WhitespaceTool from './WhitespaceTool.vue'
import XmlTool from './XmlTool.vue'
import YamlTool from './YamlTool.vue'

const components: Record<string, Component> = {
  base64: Base64Tool,
  hex: HexTool,
  radix: RadixTool,
  url: UrlTool,
  unicode: UnicodeTool,
  morse: MorseTool,
  json: JsonTool,
  yaml: YamlTool,
  toml: TomlTool,
  diff: DiffTool,
  xml: XmlTool,
  timestamp: TimestampTool,
  timezone: TimezoneTool,
  cron: CronTool,
  countdown: CountdownTool,
  cidr: CidrTool,
  ip: IpTool,
  netmask: NetmaskTool,
  port: PortTool,
  http: HttpTool,
  case: CaseTool,
  whitespace: WhitespaceTool,
  count: CountTool,
  regex: RegexTool,
  replace: ReplaceTool,
  markdown: MarkdownTool,
  compress: CompressTool,
  convert: ConvertTool,
  crop: CropTool,
  color: ColorTool,
  qrcode: QrcodeTool,
  barcode: BarcodeTool,
  password: PasswordTool,
  random: RandomTool,
  uuid: UuidTool,
}

export interface ToolEntry extends Tool {
  category: string
  component: Component
}

export function findTool(id: string): ToolEntry | null {
  const tool = allTools.find((item) => item.id === id)
  const component = components[id]

  if (!tool || !component) return null
  return { ...tool, component }
}
