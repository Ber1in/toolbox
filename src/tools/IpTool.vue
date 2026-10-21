<script setup lang="ts">
import { computed, ref } from 'vue'
import CopyButton from '../components/tool/CopyButton.vue'

const input = ref('192.168.1.1')

function isPrivateV4(octets: number[]) {
  const [a, b] = octets
  return (
    a === 10 ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 127) ||
    (a === 169 && b === 254)
  )
}

function expandIpv6(address: string): string[] | null {
  const clean = address.split('%')[0].trim()
  if (!/^[0-9a-fA-F:]+$/.test(clean)) return null

  if (clean.includes('::')) {
    const [head, tail] = clean.split('::')
    const headParts = head ? head.split(':') : []
    const tailParts = tail ? tail.split(':') : []
    const missing = 8 - headParts.length - tailParts.length
    if (missing < 1) return null
    return [
      ...headParts,
      ...Array.from({ length: missing }, () => '0'),
      ...tailParts,
    ].map((part) => part.padStart(4, '0'))
  }

  const parts = clean.split(':')
  if (parts.length !== 8) return null
  return parts.map((part) => part.padStart(4, '0'))
}

function compressIpv6(groups: string[]) {
  const short = groups.map((group) => group.replace(/^0+(?=.)/, '').toLowerCase())

  let bestStart = -1
  let bestLength = 0
  let start = -1

  short.forEach((group, index) => {
    if (group === '0') {
      if (start === -1) start = index
      const length = index - start + 1
      if (length > bestLength) {
        bestLength = length
        bestStart = start
      }
    } else {
      start = -1
    }
  })

  if (bestLength < 2) return short.join(':')
  return `${short.slice(0, bestStart).join(':')}::${short.slice(bestStart + bestLength).join(':')}`
}

const parsed = computed(() => {
  const value = input.value.trim()
  if (!value) return null

  if (value.includes(':')) {
    const groups = expandIpv6(value)
    if (!groups) return { error: '不是合法的 IPv6 地址' }

    const lower = groups.join(':')
    let type = '全球单播'
    if (lower === '0000:0000:0000:0000:0000:0000:0000:0001') type = '回环地址'
    else if (/^fe[89ab]/.test(lower)) type = '链路本地'
    else if (/^f[cd]/.test(lower)) type = '唯一本地'
    else if (/^ff/.test(lower)) type = '组播'
    else if (lower === '0000:0000:0000:0000:0000:0000:0000:0000') type = '未指定地址'

    return {
      kind: 'IPv6' as const,
      expanded: groups.join(':'),
      compressed: compressIpv6(groups),
      type,
      extra: [
        { label: '组数', value: String(groups.length) },
        { label: '地址类型', value: type },
      ],
    }
  }

  const octets = value.split('.')
  if (octets.length !== 4 || octets.some((part) => !/^\d{1,3}$/.test(part) || Number(part) > 255)) {
    return { error: '不是合法的 IPv4 地址' }
  }

  const nums = octets.map(Number)
  const int = ((nums[0] << 24) | (nums[1] << 16) | (nums[2] << 8) | nums[3]) >>> 0
  const first = nums[0]
  const type =
    first === 0
      ? '保留地址'
      : first < 128
        ? 'A 类'
        : first < 192
          ? 'B 类'
          : first < 224
            ? 'C 类'
            : first < 240
              ? 'D 类（组播）'
              : 'E 类（保留）'

  return {
    kind: 'IPv4' as const,
    expanded: nums.join('.'),
    compressed: nums.join('.'),
    type: isPrivateV4(nums) ? '私有地址' : '公网地址',
    extra: [
      { label: '整数', value: String(int) },
      { label: '十六进制', value: `0x${int.toString(16).padStart(8, '0')}` },
      { label: '二进制', value: nums.map((n) => n.toString(2).padStart(8, '0')).join('.') },
      { label: '地址类别', value: type },
    ],
  }
})
</script>

<template>
  <div class="stack">
    <section class="panel">
      <label class="field">
        <span class="label">IPv4 / IPv6 地址</span>
        <input v-model="input" class="input mono" type="text" placeholder="192.168.1.1 或 2001:db8::1" spellcheck="false" />
      </label>
      <p class="hint">自动识别 IPv4 / IPv6：IPv4 显示整数与二进制，IPv6 显示完整形式与压缩形式。</p>
      <p v-if="parsed && 'error' in parsed" class="error">{{ parsed.error }}</p>
    </section>

    <section v-if="parsed && !('error' in parsed)" class="panel">
      <div class="row">
        <span class="badge-type">{{ parsed.kind }}</span>
        <span class="badge-type">{{ parsed.type }}</span>
      </div>

      <div class="stat-grid">
        <div class="stat">
          <span class="stat__label">{{ parsed.kind === 'IPv6' ? '完整形式' : '标准形式' }}</span>
          <span class="stat__value">{{ parsed.expanded }}</span>
        </div>
        <div class="stat">
          <span class="stat__label">{{ parsed.kind === 'IPv6' ? '压缩形式' : '整数' }}</span>
          <span class="stat__value">{{ parsed.kind === 'IPv6' ? parsed.compressed : parsed.extra[0].value }}</span>
        </div>
        <div v-for="item in parsed.extra" :key="item.label" class="stat">
          <span class="stat__label">{{ item.label }}</span>
          <span class="stat__value">{{ item.value }}</span>
        </div>
      </div>

      <div class="row">
        <CopyButton :text="parsed.expanded" label="复制完整形式" />
        <CopyButton v-if="parsed.kind === 'IPv6'" :text="parsed.compressed" label="复制压缩形式" />
      </div>
    </section>
  </div>
</template>

<style scoped>
.stack {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.badge-type {
  padding: 4px 10px;
  border-radius: 999px;
  background: var(--color-chip);
  font-size: 12px;
  font-weight: 600;
  color: var(--color-ink-muted);
}
</style>
