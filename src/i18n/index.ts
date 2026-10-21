import { ref, watchEffect } from 'vue'
import { en } from './en'

export type Locale = 'zh' | 'en'

const STORAGE_KEY = 'toolbox:locale'

/** UI copy uses the Chinese source as its key; English is looked up in the dictionary, and missing entries fall back to Chinese. */
function detectLocale(): Locale {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === 'zh' || stored === 'en') return stored

  const language = navigator.language?.toLowerCase() ?? ''
  return language.startsWith('zh') ? 'zh' : 'en'
}

// Module-level singleton: switching in the nav updates every component.
export const locale = ref<Locale>(detectLocale())

watchEffect(() => {
  document.documentElement.lang = locale.value === 'zh' ? 'zh-CN' : 'en'
  localStorage.setItem(STORAGE_KEY, locale.value)
})

export type TranslateParams = Record<string, string | number>

/** Interpolation format: {name}. Missing params keep the placeholder for easier debugging. */
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
