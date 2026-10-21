<script setup lang="ts">
import { computed, ref } from 'vue'
import CopyButton from '../components/tool/CopyButton.vue'
import { useI18n } from '../i18n'

const { t } = useI18n()

const input = ref('255.255.255.0')

function toIp(value: number) {
  return [24, 16, 8, 0].map((shift) => (value >>> shift) & 255).join('.')
}

function popcount(value: number) {
  let count = 0
  let n = value >>> 0
  while (n) {
    count += n & 1
    n >>>= 1
  }
  return count
}

const parsed = computed(() => {
  const value = input.value.trim().replace(/^\//, '')
  if (!value) return null

  if (/^\d{1,2}$/.test(value)) {
    const prefix = Number(value)
    if (prefix < 0 || prefix > 32) return { error: t('前缀长度必须在 0-32 之间') }
    const mask = prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0
    return { prefix, mask: toIp(mask), wildcard: toIp(~mask >>> 0) }
  }

  const octets = value.split('.')
  if (octets.length !== 4 || octets.some((part) => !/^\d{1,3}$/.test(part) || Number(part) > 255)) {
    return { error: t('请输入子网掩码（如 255.255.255.0）或前缀（如 24 / /24）') }
  }

  const nums = octets.map(Number)
  const mask = ((nums[0] << 24) | (nums[1] << 16) | (nums[2] << 8) | nums[3]) >>> 0
  const inverted = ~mask >>> 0

  // Valid mask: the inverted value must be 2^n - 1 (contiguous low bits set).
  if (((inverted + 1) & inverted) !== 0) {
    return { error: t('这不是合法的子网掩码：二进制必须是连续的 1 后接连续的 0') }
  }

  const prefix = popcount(mask)
  return { prefix, mask: toIp(mask), wildcard: toIp(inverted) }
})
</script>

<template>
  <div class="stack">
    <section class="panel">
      <label class="field">
        <span class="label">{{ t('子网掩码 / 前缀') }}</span>
        <input v-model="input" class="input mono" type="text" :placeholder="t('255.255.255.0 或 24')" spellcheck="false" />
      </label>
      <p class="hint">{{ t('支持两种写法：点分十进制掩码，或纯数字 / 带斜杠的前缀长度。') }}</p>
      <p v-if="parsed && 'error' in parsed" class="error">{{ parsed.error }}</p>
    </section>

    <section v-if="parsed && !('error' in parsed)" class="panel">
      <div class="stat-grid">
        <div class="stat">
          <span class="stat__label">{{ t('前缀长度') }}</span>
          <span class="stat__value">/{{ parsed.prefix }}</span>
        </div>
        <div class="stat">
          <span class="stat__label">{{ t('子网掩码') }}</span>
          <span class="stat__value">{{ parsed.mask }}</span>
        </div>
        <div class="stat">
          <span class="stat__label">{{ t('通配符掩码') }}</span>
          <span class="stat__value">{{ parsed.wildcard }}</span>
        </div>
        <div class="stat">
          <span class="stat__label">{{ t('可用主机数') }}</span>
          <span class="stat__value">
            {{ (parsed.prefix >= 31 ? 2 ** (32 - parsed.prefix) : 2 ** (32 - parsed.prefix) - 2).toLocaleString() }}
          </span>
        </div>
        <div class="stat">
          <span class="stat__label">{{ t('掩码二进制') }}</span>
          <span class="stat__value">
            {{ parsed.mask.split('.').map((part) => Number(part).toString(2).padStart(8, '0')).join('.') }}
          </span>
        </div>
        <div class="stat">
          <span class="stat__label">{{ t('通配符二进制') }}</span>
          <span class="stat__value">
            {{ parsed.wildcard.split('.').map((part) => Number(part).toString(2).padStart(8, '0')).join('.') }}
          </span>
        </div>
      </div>

      <div class="row">
        <CopyButton :text="`/${parsed.prefix}`" :label="t('复制前缀')" />
        <CopyButton :text="parsed.mask" :label="t('复制掩码')" />
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
</style>
