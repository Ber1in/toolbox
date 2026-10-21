<script setup lang="ts">
import { computed, ref } from 'vue'
import CopyButton from '../components/tool/CopyButton.vue'

const length = ref(24)
const count = ref(5)
const charset = ref<'alnum' | 'lower' | 'upper' | 'digits' | 'hex' | 'base64' | 'custom'>('alnum')
const custom = ref('')
const values = ref<string[]>([])

const charsets = [
  { value: 'alnum', label: '字母 + 数字' },
  { value: 'lower', label: '小写字母' },
  { value: 'upper', label: '大写字母' },
  { value: 'digits', label: '纯数字' },
  { value: 'hex', label: '十六进制' },
  { value: 'base64', label: 'Base64 字符集' },
  { value: 'custom', label: '自定义字符集' },
] as const

const alphabet = computed(() => {
  switch (charset.value) {
    case 'lower':
      return 'abcdefghijklmnopqrstuvwxyz'
    case 'upper':
      return 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    case 'digits':
      return '0123456789'
    case 'hex':
      return '0123456789abcdef'
    case 'base64':
      return 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
    case 'custom':
      return custom.value
    default:
      return 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  }
})

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

function generate() {
  const chars = alphabet.value
  if (!chars.length) {
    values.value = []
    return
  }

  values.value = Array.from({ length: Math.max(1, Math.min(50, count.value)) }, () =>
    Array.from({ length: Math.max(1, Math.min(512, length.value)) }, () =>
      chars[randomInt(chars.length)],
    ).join(''),
  )
}

generate()
</script>

<template>
  <div class="stack">
    <section class="panel">
      <div class="cols">
        <label class="field">
          <span class="label">长度：{{ length }}</span>
          <input v-model.number="length" type="range" min="1" max="128" step="1" />
        </label>

        <label class="field">
          <span class="label">生成数量</span>
          <input v-model.number="count" class="input" type="number" min="1" max="50" />
        </label>
      </div>

      <label class="field">
        <span class="label">字符集</span>
        <select v-model="charset" class="select">
          <option v-for="item in charsets" :key="item.value" :value="item.value">
            {{ item.label }}
          </option>
        </select>
      </label>

      <label v-if="charset === 'custom'" class="field">
        <span class="label">自定义字符</span>
        <input v-model="custom" class="input mono" type="text" placeholder="例如 abc123!@#" />
      </label>

      <div class="row">
        <button class="btn btn--primary" type="button" :disabled="!alphabet" @click="generate">
          重新生成
        </button>
        <CopyButton :text="values.join('\n')" label="复制全部" />
      </div>

      <p v-if="!alphabet" class="error">字符集不能为空。</p>
    </section>

    <section v-if="values.length" class="panel">
      <div v-for="(value, index) in values" :key="index" class="value-row">
        <code class="value">{{ value }}</code>
        <CopyButton :text="value" label="复制" />
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

.value-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 14px;
  border-radius: 10px;
  background: var(--color-chip);
}

.value {
  font-family: var(--font-mono);
  font-size: 14px;
  word-break: break-all;
}
</style>
