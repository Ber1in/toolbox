<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

function pad(value: number) {
  return String(value).padStart(2, '0')
}

function toLocalInput(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

const target = ref(toLocalInput(new Date(Date.now() + 60 * 60 * 1000)))
const now = ref(Date.now())
let timer = 0

onMounted(() => {
  timer = window.setInterval(() => (now.value = Date.now()), 200)
})
onBeforeUnmount(() => window.clearInterval(timer))

const targetTime = computed(() => {
  const date = new Date(target.value)
  return Number.isNaN(date.getTime()) ? null : date.getTime()
})

const remaining = computed(() => {
  if (!targetTime.value) return 0
  return Math.max(targetTime.value - now.value, 0)
})

const parts = computed(() => {
  const total = Math.floor(remaining.value / 1000)
  return {
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
  }
})

const finished = computed(() => targetTime.value !== null && remaining.value === 0)

function setPreset(minutes: number) {
  target.value = toLocalInput(new Date(Date.now() + minutes * 60 * 1000))
}

function setTomorrowNine() {
  const date = new Date()
  date.setDate(date.getDate() + 1)
  date.setHours(9, 0, 0, 0)
  target.value = toLocalInput(date)
}
</script>

<template>
  <div class="stack">
    <section class="panel">
      <label class="field">
        <span class="label">目标时间</span>
        <input v-model="target" class="input" type="datetime-local" />
      </label>

      <div class="row">
        <button class="btn btn--sm btn--ghost" type="button" @click="setPreset(5)">5 分钟后</button>
        <button class="btn btn--sm btn--ghost" type="button" @click="setPreset(30)">30 分钟后</button>
        <button class="btn btn--sm btn--ghost" type="button" @click="setPreset(60)">1 小时后</button>
        <button class="btn btn--sm btn--ghost" type="button" @click="setTomorrowNine">
          明天 9:00
        </button>
      </div>
    </section>

    <section class="panel">
      <div class="countdown" :class="{ 'is-finished': finished }">
        <div class="countdown__item">
          <span class="countdown__value">{{ parts.days }}</span>
          <span class="countdown__label">天</span>
        </div>
        <div class="countdown__item">
          <span class="countdown__value">{{ pad(parts.hours) }}</span>
          <span class="countdown__label">时</span>
        </div>
        <div class="countdown__item">
          <span class="countdown__value">{{ pad(parts.minutes) }}</span>
          <span class="countdown__label">分</span>
        </div>
        <div class="countdown__item">
          <span class="countdown__value">{{ pad(parts.seconds) }}</span>
          <span class="countdown__label">秒</span>
        </div>
      </div>

      <p v-if="finished" class="hint">目标时间已到。</p>
      <p v-else-if="!targetTime" class="error">目标时间格式不正确。</p>
    </section>
  </div>
</template>

<style scoped>
.stack {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.countdown {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.countdown__item {
  padding: 20px 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  border-radius: 12px;
  background: var(--color-chip);
}

.countdown__value {
  font-family: var(--font-mono);
  font-size: 40px;
  line-height: 1;
  font-weight: var(--fw-bold);
  font-variant-numeric: tabular-nums;
}

.countdown__label {
  font-size: 12px;
  color: var(--color-ink-subtle);
}

.countdown.is-finished .countdown__value {
  color: var(--color-ink-subtle);
}

@media (max-width: 560px) {
  .countdown__value {
    font-size: 28px;
  }
}
</style>
