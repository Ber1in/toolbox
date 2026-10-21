<script setup lang="ts">
import { ref } from 'vue'
import CopyButton from '../components/tool/CopyButton.vue'

const version = ref<'v4' | 'v7'>('v4')
const count = ref(5)
const uppercase = ref(false)
const withHyphens = ref(true)
const withBraces = ref(false)
const values = ref<string[]>([])

function uuidv4() {
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID()

  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)
  bytes[6] = (bytes[6] & 0x0f) | 0x40
  bytes[8] = (bytes[8] & 0x3f) | 0x80
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
}

function uuidv7() {
  const timestamp = Date.now()
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)

  // 48 位毫秒时间戳（大端）
  bytes[0] = Math.floor(timestamp / 2 ** 40) & 0xff
  bytes[1] = Math.floor(timestamp / 2 ** 32) & 0xff
  bytes[2] = Math.floor(timestamp / 2 ** 24) & 0xff
  bytes[3] = Math.floor(timestamp / 2 ** 16) & 0xff
  bytes[4] = Math.floor(timestamp / 2 ** 8) & 0xff
  bytes[5] = timestamp & 0xff

  bytes[6] = (bytes[6] & 0x0f) | 0x70
  bytes[8] = (bytes[8] & 0x3f) | 0x80

  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
}

function format(uuid: string) {
  let value = withHyphens.value ? uuid : uuid.replace(/-/g, '')
  if (uppercase.value) value = value.toUpperCase()
  return withBraces.value ? `{${value}}` : value
}

function generate() {
  values.value = Array.from({ length: Math.max(1, Math.min(100, count.value)) }, () =>
    format(version.value === 'v4' ? uuidv4() : uuidv7()),
  )
}

generate()
</script>

<template>
  <div class="stack">
    <section class="panel">
      <div class="row">
        <div class="segmented">
          <button :class="{ 'is-active': version === 'v4' }" type="button" @click="version = 'v4'">
            v4（随机）
          </button>
          <button :class="{ 'is-active': version === 'v7' }" type="button" @click="version = 'v7'">
            v7（按时间排序）
          </button>
        </div>

        <label class="field" style="width: 120px">
          <span class="label">数量</span>
          <input v-model.number="count" class="input" type="number" min="1" max="100" />
        </label>
      </div>

      <div class="row">
        <label class="checkbox">
          <input v-model="uppercase" type="checkbox" />
          大写
        </label>
        <label class="checkbox">
          <input v-model="withHyphens" type="checkbox" />
          保留连字符
        </label>
        <label class="checkbox">
          <input v-model="withBraces" type="checkbox" />
          加大括号
        </label>
      </div>

      <div class="row">
        <button class="btn btn--primary" type="button" @click="generate">重新生成</button>
        <CopyButton :text="values.join('\n')" label="复制全部" />
      </div>

      <p class="hint">
        v4 完全随机；v7 前 48 位是毫秒时间戳，按字典序排列即按生成时间排序。
      </p>
    </section>

    <section class="panel">
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
