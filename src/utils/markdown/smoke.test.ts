import { describe, expect, it } from 'vitest'

describe('markdown tool test harness', () => {
  it('runs in a jsdom environment', () => {
    expect(typeof window).toBe('object')
    expect(typeof document.createElement).toBe('function')
  })
})
