<script setup lang="ts">
import { computed, ref } from 'vue'
import CopyButton from '../components/tool/CopyButton.vue'
import { useI18n } from '../i18n'

const { t, locale } = useI18n()

const localZone = Intl.DateTimeFormat().resolvedOptions().timeZone

const zones = [
  { value: 'UTC', label: 'UTC 协调世界时' },
  { value: 'Asia/Shanghai', label: 'Asia/Shanghai 北京 / 上海' },
  { value: 'Asia/Hong_Kong', label: 'Asia/Hong_Kong 香港' },
  { value: 'Asia/Taipei', label: 'Asia/Taipei 台北' },
  { value: 'Asia/Tokyo', label: 'Asia/Tokyo 东京' },
  { value: 'Asia/Seoul', label: 'Asia/Seoul 首尔' },
  { value: 'Asia/Singapore', label: 'Asia/Singapore 新加坡' },
  { value: 'Asia/Kolkata', label: 'Asia/Kolkata 加尔各答' },
  { value: 'Asia/Dubai', label: 'Asia/Dubai 迪拜' },
  { value: 'Europe/London', label: 'Europe/London 伦敦' },
  { value: 'Europe/Paris', label: 'Europe/Paris 巴黎' },
  { value: 'Europe/Berlin', label: 'Europe/Berlin 柏林' },
  { value: 'Europe/Moscow', label: 'Europe/Moscow 莫斯科' },
  { value: 'America/New_York', label: 'America/New_York 纽约' },
  { value: 'America/Chicago', label: 'America/Chicago 芝加哥' },
  { value: 'America/Denver', label: 'America/Denver 丹佛' },
  { value: 'America/Los_Angeles', label: 'America/Los_Angeles 洛杉矶' },
  { value: 'America/Sao_Paulo', label: 'America/Sao_Paulo 圣保罗' },
  { value: 'Australia/Sydney', label: 'Australia/Sydney 悉尼' },
  { value: 'Pacific/Auckland', label: 'Pacific/Auckland 奥克兰' },
]

if (!zones.some((zone) => zone.value === localZone)) {
  zones.unshift({ value: localZone, label: t('{zone}（本机时区）', { zone: localZone }) })
}

function pad(value: number) {
  return String(value).padStart(2, '0')
}

function toLocalInput(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

/** 某一时刻在指定时区相对 UTC 的偏移（毫秒） */
function zoneOffset(timeZone: string, date: Date) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).formatToParts(date)

  const map: Record<string, string> = {}
  for (const part of parts) map[part.type] = part.value

  const asUtc = Date.UTC(
    Number(map.year),
    Number(map.month) - 1,
    Number(map.day),
    Number(map.hour) % 24,
    Number(map.minute),
    Number(map.second),
  )

  return asUtc - date.getTime()
}

/** 把「某时区的墙上时间」转成真实时刻 */
function wallTimeToDate(wall: string, timeZone: string) {
  const [datePart, timePart] = wall.split('T')
  const [year, month, day] = datePart.split('-').map(Number)
  const [hour, minute] = timePart.split(':').map(Number)

  const guess = Date.UTC(year, month - 1, day, hour, minute)
  const offset = zoneOffset(timeZone, new Date(guess))
  return new Date(guess - offset)
}

function formatInZone(date: Date, timeZone: string) {
  return new Intl.DateTimeFormat(locale.value === 'zh' ? 'zh-CN' : 'en-GB', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(date)
}

function offsetLabel(timeZone: string, date: Date) {
  const minutes = zoneOffset(timeZone, date) / 60000
  const sign = minutes >= 0 ? '+' : '-'
  const abs = Math.abs(minutes)
  return `UTC${sign}${pad(Math.floor(abs / 60))}:${pad(abs % 60)}`
}

const wall = ref(toLocalInput(new Date()))
const fromZone = ref(localZone)
const toZone = ref('UTC')

const result = computed(() => {
  if (!wall.value) return null
  try {
    const instant = wallTimeToDate(wall.value, fromZone.value)
    if (Number.isNaN(instant.getTime())) return null
    return {
      from: formatInZone(instant, fromZone.value),
      fromOffset: offsetLabel(fromZone.value, instant),
      to: formatInZone(instant, toZone.value),
      toOffset: offsetLabel(toZone.value, instant),
      utc: formatInZone(instant, 'UTC'),
      epoch: Math.floor(instant.getTime() / 1000),
      instant,
    }
  } catch {
    return null
  }
})

const diffLabel = computed(() => {
  if (!result.value) return ''
  const diff = (zoneOffset(toZone.value, result.value.instant) - zoneOffset(fromZone.value, result.value.instant)) / 3_600_000
  const sign = diff >= 0 ? '+' : '-'
  const abs = Math.abs(diff)
  const hours = Math.floor(abs)
  const minutes = Math.round((abs - hours) * 60)
  if (diff === 0) {
    return t('{to} 与 {from} 相同', { to: toZone.value, from: fromZone.value })
  }

  return t('{to} 比 {from} {direction} {hours} 小时{minutes}', {
    to: toZone.value,
    from: fromZone.value,
    direction: t(sign === '+' ? '快' : '慢'),
    hours,
    minutes: minutes ? t(' {n} 分', { n: minutes }) : '',
  })
})
</script>

<template>
  <section class="panel">
    <div class="cols">
      <label class="field">
        <span class="label">{{ t('时间') }}</span>
        <input v-model="wall" class="input" type="datetime-local" />
      </label>

      <div class="field">
        <span class="label">{{ t('源时区') }}</span>
        <select v-model="fromZone" class="select">
          <option v-for="zone in zones" :key="zone.value" :value="zone.value">
            {{ t(zone.label) }}
          </option>
        </select>
      </div>
    </div>

    <div class="field">
      <span class="label">{{ t('目标时区') }}</span>
      <select v-model="toZone" class="select">
        <option v-for="zone in zones" :key="zone.value" :value="zone.value">
          {{ t(zone.label) }}
        </option>
      </select>
    </div>

    <div v-if="result" class="stat-grid">
      <div class="stat">
        <span class="stat__label">{{ fromZone }}（{{ result.fromOffset }}）</span>
        <span class="stat__value">{{ result.from }}</span>
      </div>
      <div class="stat">
        <span class="stat__label">{{ toZone }}（{{ result.toOffset }}）</span>
        <span class="stat__value">{{ result.to }}</span>
      </div>
      <div class="stat">
        <span class="stat__label">UTC</span>
        <span class="stat__value">{{ result.utc }}</span>
      </div>
      <div class="stat">
        <span class="stat__label">{{ t('Unix 时间戳') }}</span>
        <span class="stat__value">{{ result.epoch }}</span>
      </div>
    </div>

    <p v-if="diffLabel" class="hint">{{ diffLabel }}</p>

    <div class="row">
      <CopyButton :text="result?.to ?? ''" :label="t('复制目标时间')" />
      <CopyButton :text="result ? String(result.epoch) : ''" :label="t('复制时间戳')" />
    </div>
  </section>
</template>
