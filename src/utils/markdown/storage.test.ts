import { beforeEach, describe, expect, it } from 'vitest'
import {
  clearContent,
  CONTENT_KEY,
  DEFAULT_SETTINGS,
  loadContent,
  loadSettings,
  saveContent,
  saveSettings,
  SETTINGS_KEY,
} from './storage'

describe('markdown storage', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('returns defaults when no settings are stored', () => {
    expect(loadSettings()).toEqual(DEFAULT_SETTINGS)
  })

  it('persists content and settings', () => {
    saveContent('# hello')
    saveSettings({ ...DEFAULT_SETTINGS, splitRatio: 0.65, scrollSync: false })

    expect(loadContent()).toBe('# hello')
    expect(loadSettings()).toMatchObject({
      splitRatio: 0.65,
      scrollSync: false,
    })
  })

  it('clamps an out-of-range split ratio', () => {
    window.localStorage.setItem(SETTINGS_KEY, JSON.stringify({ splitRatio: 0.95 }))

    expect(loadSettings().splitRatio).toBe(0.8)
  })

  it('falls back to defaults for corrupt settings JSON', () => {
    window.localStorage.setItem(SETTINGS_KEY, '{not json')

    expect(loadSettings()).toEqual(DEFAULT_SETTINGS)
  })

  it('falls back to memory when storage access throws', () => {
    const throwingStorage = {
      get length(): number {
        throw new Error('blocked')
      },
      clear: () => {
        throw new Error('blocked')
      },
      getItem: () => {
        throw new Error('blocked')
      },
      key: () => {
        throw new Error('blocked')
      },
      removeItem: () => {
        throw new Error('blocked')
      },
      setItem: () => {
        throw new Error('blocked')
      },
    } as Storage

    expect(loadSettings(throwingStorage)).toEqual(DEFAULT_SETTINGS)
    expect(loadContent(throwingStorage)).toBe('')
    expect(() => saveSettings(DEFAULT_SETTINGS, throwingStorage)).not.toThrow()
    expect(() => saveContent('# x', throwingStorage)).not.toThrow()
    expect(() => clearContent(throwingStorage)).not.toThrow()
  })

  it('clears content without removing settings', () => {
    saveContent('# hello')
    saveSettings({ ...DEFAULT_SETTINGS, inlineMath: false })
    clearContent()

    expect(loadContent()).toBe('')
    expect(loadSettings().inlineMath).toBe(false)
    expect(window.localStorage.getItem(CONTENT_KEY)).toBeNull()
  })
})
