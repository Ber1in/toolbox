<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import CopyButton from '../components/tool/CopyButton.vue'

const now = ref(Date.now())
let timer = 0

onMounted(() => {
  timer = window.setInterval(() => (now.value = Date.now()), 1000)
})
onBeforeUnmount(() => window.clearInterval(timer))

function pad(value: number) {
  return String(value).padStart(2, '0')
}

function formatLocal(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

const relative = new Intl.RelativeTimeFormat('zh-CN', { numeric: 'auto' })

function formatRelative(date: Date) {
  const diff = date.getTime() - Date.now()
  const abs = Math.abs(diff)
  if (abs < 60_000) return relative.format(Math.round(diff / 1000), 'second')
  if (abs < 3_600_000) return relative.format(Math.round(diff / 60_000), 'minute')
  if (abs < 86_400_000) return relative.format(Math.round(diff / 3_600_000), 'hour')
  if (abs < 2_592_000_000) return relative.format(Math.round(diff / 86_400_000), 'day')
  return relative.format(Math.round(diff / 2_592_000_000), 'month')
}

const tsInput = ref(String(Math.floor(Date.now() / 1000)))

const tsResult = computed(() => {
  const raw = tsInput.value.trim()
  if (!raw) return null
  if (!/^-?\d+$/.test(raw)) return { error: '请输入整数时间戳' }

  const isMs = raw.replace('-', '').length >= 13
  const date = new Date(isMs ? Number(raw) : Number(raw) * 1000)
  if (Number.isNaN(date.getTime())) return { error: '时间戳超出可表示范围' }

  return {
    local: formatLocal(date),
    iso: date.toISOString(),
    utc: date.toUTCString(),
    relative: formatRelative(date),
    unit: isMs ? '毫秒' : '秒',
  }
})

function toLocalInput(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

const dateInput = ref(toLocalInput(new Date()))
const dateResult = computed(() => {
  if (!dateInput.value) return null
  const date = new Date(dateInput.value)
  if (Number.isNaN(date.getTime())) return null
  return {
    seconds: Math.floor(date.getTime() / 1000),
    millis: date.getTime(),
  }
})
</script>

<template>
  <div class="stack">
    <section class="panel">
      <p class="panel__title">当前时间</p>
      <div class="stat-grid">
        <div class="stat">
          <span class="stat__label">秒级时间戳</span>
          <span class="stat__value">{{ Math.floor(now / 1000) }}</span>
        </div>
        <div class="stat">
          <span class="stat__label">毫秒级时间戳</span>
          <span class="stat__value">{{ now }}</span>
        </div>
        <div class="stat stat--wide">
          <span class="stat__label">本地时间</span>
          <span class="stat__value">{{ formatLocal(new Date(now)) }}</span>
        </div>
        <div class="stat">
          <span class="stat__label">时区</span>
          <span class="stat__value">{{ Intl.DateTimeFormat().resolvedOptions().timeZone }}</span>
        </div>
      </div>
      <div class="row">
        <CopyButton :text="String(Math.floor(now / 1000))" label="复制秒级" />
        <CopyButton :text="String(now)" label="复制毫秒级" />
      </div>
    </section>

    <section class="panel">
      <p class="panel__title">时间戳 → 日期</p>

      <label class="field">
        <span class="label">时间戳（秒或毫秒，自动识别）</span>
        <input v-model="tsInput" class="input mono" type="text" inputmode="numeric" />
      </label>

      <div v-if="tsResult && 'error' in tsResult" class="error">{{ tsResult.error }}</div>

      <div v-else-if="tsResult" class="stat-grid">
        <div class="stat stat--wide">
          <span class="stat__label">本地时间</span>
          <span class="stat__value">{{ tsResult.local }}</span>
        </div>
        <div class="stat stat--wide">
          <span class="stat__label">ISO 8601</span>
          <span class="stat__value">{{ tsResult.iso }}</span>
        </div>
        <div class="stat stat--wide">
          <span class="stat__label">UTC</span>
          <span class="stat__value">{{ tsResult.utc }}</span>
        </div>
        <div class="stat">
          <span class="stat__label">相对现在</span>
          <span class="stat__value">{{ tsResult.relative }}</span>
        </div>
      </div>

      <p class="hint">识别为{{ tsResult && 'unit' in tsResult ? tsResult.unit : '秒' }}级时间戳</p>
    </section>

    <section class="panel">
      <p class="panel__title">日期 → 时间戳</p>

      <label class="field">
        <span class="label">本地日期时间</span>
        <input v-model="dateInput" class="input" type="datetime-local" />
      </label>

      <div v-if="dateResult" class="stat-grid">
        <div class="stat">
          <span class="stat__label">秒级</span>
          <span class="stat__value">{{ dateResult.seconds }}</span>
        </div>
        <div class="stat">
          <span class="stat__label">毫秒级</span>
          <span class="stat__value">{{ dateResult.millis }}</span>
        </div>
      </div>

      <div class="row">
        <CopyButton :text="dateResult ? String(dateResult.seconds) : ''" label="复制秒级" />
        <CopyButton :text="dateResult ? String(dateResult.millis) : ''" label="复制毫秒级" />
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
