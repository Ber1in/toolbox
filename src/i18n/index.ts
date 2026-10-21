import { ref, watchEffect } from 'vue'
import { en } from './en'

export type Locale = 'zh' | 'en'

const STORAGE_KEY = 'toolbox:locale'

/** 界面文案以中文原文为 key，英文查表；未翻译的条目在英文下回退为中文原文。 */
function detectLocale(): Locale {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === 'zh' || stored === 'en') return stored

  const language = navigator.language?.toLowerCase() ?? ''
  return language.startsWith('zh') ? 'zh' : 'en'
}

// 模块级单例：导航栏切换后所有组件共享同一份语言状态
export const locale = ref<Locale>(detectLocale())

watchEffect(() => {
  document.documentElement.lang = locale.value === 'zh' ? 'zh-CN' : 'en'
  localStorage.setItem(STORAGE_KEY, locale.value)
})

export type TranslateParams = Record<string, string | number>

/** 插值格式：{name}；参数缺失时保留原占位符，便于排查。 */
export function translate(key: string, params?: TranslateParams): string {
  const template = locale.value === 'en' ? (en[key] ?? key) : key
  if (!params) return template

  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in params ? String(params[name]) : match,
  )
}

export function setLocale(next: Locale) {
  locale.value = next
}

export function useI18n() {
  return { t: translate, locale, setLocale }
}

export const localeOptions: { value: Locale; label: string }[] = [
  { value: 'zh', label: '中文' },
  { value: 'en', label: 'English' },
]
