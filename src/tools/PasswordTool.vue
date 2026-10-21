<script setup lang="ts">
import { computed, ref } from 'vue'
import CopyButton from '../components/tool/CopyButton.vue'
import { useI18n } from '../i18n'

const { t } = useI18n()

const length = ref(16)
const useUpper = ref(true)
const useLower = ref(true)
const useDigits = ref(true)
const useSymbols = ref(true)
const excludeAmbiguous = ref(false)
const count = ref(5)
const passwords = ref<string[]>([])

const AMBIGUOUS = 'Il1O0o'

function randomInt(max: number) {
  const limit = Math.floor(0xffffffff / max) * max
  const buffer = new Uint32Array(1)
  let value = 0
  do {
    crypto.getRandomValues(buffer)
    value = buffer[0]
  } while (value >= limit)
  return value % max
}

const pools = computed(() => {
  const result: string[] = []
  if (useUpper.value) result.push('ABCDEFGHIJKLMNOPQRSTUVWXYZ')
  if (useLower.value) result.push('abcdefghijklmnopqrstuvwxyz')
  if (useDigits.value) result.push('0123456789')
  if (useSymbols.value) result.push('!@#$%^&*()-_=+[]{};:,.?/')
  return result.map((pool) =>
    excludeAmbiguous.value
      ? pool.split('').filter((char) => !AMBIGUOUS.includes(char)).join('')
      : pool,
  )
})

const alphabet = computed(() => pools.value.join(''))

const entropy = computed(() => {
  if (!alphabet.value.length) return 0
  return Math.round(length.value * Math.log2(alphabet.value.length))
})

const strength = computed(() => {
  if (entropy.value >= 100) return { label: '极强', percent: 100 }
  if (entropy.value >= 70) return { label: '强', percent: 80 }
  if (entropy.value >= 45) return { label: '中等', percent: 55 }
  return { label: '偏弱', percent: 30 }
})

function generate() {
  const chars = alphabet.value
  if (!chars.length) {
    passwords.value = []
    return
  }

  passwords.value = Array.from({ length: Math.max(1, Math.min(20, count.value)) }, () => {
    // 保证每类字符至少出现一次
    const required = pools.value.filter((pool) => pool.length).map((pool) => pool[randomInt(pool.length)])
    const rest = Array.from(
      { length: Math.max(0, length.value - required.length) },
      () => chars[randomInt(chars.length)],
    )
    const all = [...required, ...rest]

    // Fisher–Yates 洗牌
    for (let index = all.length - 1; index > 0; index -= 1) {
      const target = randomInt(index + 1)
      ;[all[index], all[target]] = [all[target], all[index]]
    }

    return all.join('')
  })
}

generate()
</script>

<template>
  <div class="stack">
    <section class="panel">
      <div class="cols">
        <label class="field">
          <span class="label">{{ t('密码长度：{n}', { n: length }) }}</span>
          <input v-model.number="length" type="range" min="4" max="64" step="1" />
        </label>

        <label class="field">
          <span class="label">{{ t('生成数量') }}</span>
          <input v-model.number="count" class="input" type="number" min="1" max="20" />
        </label>
      </div>

      <div class="row">
        <label class="checkbox">
          <input v-model="useUpper" type="checkbox" />
          {{ t('大写字母') }}
        </label>
        <label class="checkbox">
          <input v-model="useLower" type="checkbox" />
          {{ t('小写字母') }}
        </label>
        <label class="checkbox">
          <input v-model="useDigits" type="checkbox" />
          {{ t('数字') }}
        </label>
        <label class="checkbox">
          <input v-model="useSymbols" type="checkbox" />
          {{ t('符号') }}
        </label>
        <label class="checkbox">
          <input v-model="excludeAmbiguous" type="checkbox" />
          {{ t('排除易混淆字符') }}
        </label>
      </div>

      <div class="strength">
        <div class="strength__bar">
          <span class="strength__fill" :style="{ width: `${strength.percent}%` }" />
        </div>
        <span class="hint">{{ t('强度：{label}（约 {n} bit 熵）', { label: t(strength.label), n: entropy }) }}</span>
      </div>

      <div class="row">
        <button class="btn btn--primary" type="button" :disabled="!alphabet" @click="generate">
          {{ t('重新生成') }}
        </button>
        <CopyButton :text="passwords.join('\n')" :label="t('复制全部')" />
      </div>

      <p v-if="!alphabet" class="error">{{ t('至少选择一类字符。') }}</p>
      <p class="hint">{{ t('使用浏览器 crypto 随机数生成，不会上传。') }}</p>
    </section>

    <section v-if="passwords.length" class="panel">
      <div v-for="(password, index) in passwords" :key="index" class="password-row">
        <code class="password">{{ password }}</code>
        <CopyButton :text="password" :label="t('复制')" />
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

.strength {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.strength__bar {
  height: 8px;
  border-radius: 999px;
  background: var(--color-chip);
  overflow: hidden;
}

.strength__fill {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: var(--color-accent);
  transition: width 0.2s ease;
}

.password-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 14px;
  border-radius: 10px;
  background: var(--color-chip);
}

.password {
  font-family: var(--font-mono);
  font-size: 14px;
  word-break: break-all;
}
</style>
