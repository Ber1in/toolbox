export const CONTENT_KEY = 'toolbox:markdown:content'
export const SETTINGS_KEY = 'toolbox:markdown:settings'

export interface MarkdownSettings {
  version: 1
  splitRatio: number
  scrollSync: boolean
  inlineMath: boolean
  tocCollapsed: boolean
}

export const DEFAULT_SETTINGS: MarkdownSettings = {
  version: 1,
  splitRatio: 0.5,
  scrollSync: true,
  inlineMath: true,
  tocCollapsed: false,
}

const MIN_RATIO = 0.2
const MAX_RATIO = 0.8

function getStorage(): Storage | null {
  try {
    return typeof window !== 'undefined' ? window.localStorage : null
  } catch {
    return null
  }
}

function clampRatio(value: unknown): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return DEFAULT_SETTINGS.splitRatio
  }

  return Math.min(MAX_RATIO, Math.max(MIN_RATIO, value))
}

function asBoolean(value: unknown, fallback: boolean): boolean {
  return typeof value === 'boolean' ? value : fallback
}

export function loadSettings(storage: Storage | null = getStorage()): MarkdownSettings {
  if (!storage) {
    return { ...DEFAULT_SETTINGS }
  }

  try {
    const raw = storage.getItem(SETTINGS_KEY)
    if (!raw) {
      return { ...DEFAULT_SETTINGS }
    }

    const parsed = JSON.parse(raw) as Partial<MarkdownSettings>
    return {
      version: 1,
      splitRatio: clampRatio(parsed.splitRatio),
      scrollSync: asBoolean(parsed.scrollSync, DEFAULT_SETTINGS.scrollSync),
      inlineMath: asBoolean(parsed.inlineMath, DEFAULT_SETTINGS.inlineMath),
      tocCollapsed: asBoolean(parsed.tocCollapsed, DEFAULT_SETTINGS.tocCollapsed),
    }
  } catch {
    return { ...DEFAULT_SETTINGS }
  }
}

export function saveSettings(
  settings: MarkdownSettings,
  storage: Storage | null = getStorage(),
): void {
  if (!storage) {
    return
  }

  try {
    storage.setItem(SETTINGS_KEY, JSON.stringify({ ...settings, version: 1 }))
  } catch {
    // Private mode or a full quota should never break editing.
  }
}

export function loadContent(storage: Storage | null = getStorage()): string {
  if (!storage) {
    return ''
  }

  try {
    return storage.getItem(CONTENT_KEY) ?? ''
  } catch {
    return ''
  }
}

export function saveContent(content: string, storage: Storage | null = getStorage()): void {
  if (!storage) {
    return
  }

  try {
    storage.setItem(CONTENT_KEY, content)
  } catch {
    // Ignore storage failures; the in-memory editor remains authoritative.
  }
}

export function clearContent(storage: Storage | null = getStorage()): void {
  if (!storage) {
    return
  }

  try {
    storage.removeItem(CONTENT_KEY)
  } catch {
    // Ignore storage failures.
  }
}
