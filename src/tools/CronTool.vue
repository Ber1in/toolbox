<script setup lang="ts">
import { computed, ref } from 'vue'

interface FieldDef {
  key: string
  label: string
  min: number
  max: number
  names?: Record<string, number>
}

interface ParsedField {
  values: number[]
  wildcard: boolean
  raw: string
}

const MONTHS: Record<string, number> = {
  JAN: 1, FEB: 2, MAR: 3, APR: 4, MAY: 5, JUN: 6,
  JUL: 7, AUG: 8, SEP: 9, OCT: 10, NOV: 11, DEC: 12,
}

const WEEKDAYS: Record<string, number> = {
  SUN: 0, MON: 1, TUE: 2, WED: 3, THU: 4, FRI: 5, SAT: 6,
}

const FIELDS: FieldDef[] = [
  { key: 'minute', label: '分钟', min: 0, max: 59 },
  { key: 'hour', label: '小时', min: 0, max: 23 },
  { key: 'day', label: '日', min: 1, max: 31 },
  { key: 'month', label: '月', min: 1, max: 12, names: MONTHS },
  { key: 'weekday', label: '星期', min: 0, max: 6, names: WEEKDAYS },
]

const expr = ref('*/5 * * * *')

const presets = [
  { label: '每分钟', value: '* * * * *' },
  { label: '每小时', value: '0 * * * *' },
  { label: '每天 0 点', value: '0 0 * * *' },
  { label: '工作日 9:30', value: '30 9 * * 1-5' },
  { label: '每周一 9 点', value: '0 9 * * 1' },
  { label: '每月 1 号', value: '0 0 1 * *' },
]

function parseValue(raw: string, def: FieldDef) {
  const named = def.names?.[raw.toUpperCase()]
  const value = named ?? Number(raw)

  if (!Number.isInteger(value) || value < def.min || value > def.max) {
    throw new Error(`${def.label}取值不合法：${raw}（范围 ${def.min}-${def.max}）`)
  }
  return value
}

function parseField(raw: string, def: FieldDef): ParsedField {
  const values = new Set<number>()
  let wildcard = false

  for (const part of raw.split(',')) {
    if (!part) throw new Error(`${def.label}存在空字段`)

    const [base, stepRaw] = part.split('/')
    const step = stepRaw === undefined ? 1 : Number(stepRaw)

    if (!Number.isInteger(step) || step <= 0) {
      throw new Error(`${def.label}的步长不合法：${part}`)
    }

    let start = def.min
    let end = def.max

    if (base === '*') {
      wildcard = true
    } else if (base.includes('-')) {
      const [from, to] = base.split('-')
      start = parseValue(from, def)
      end = parseValue(to, def)
    } else {
      start = parseValue(base, def)
      end = stepRaw === undefined ? start : def.max
    }

    if (start > end) throw new Error(`${def.label}范围不合法：${part}`)

    for (let value = start; value <= end; value += step) values.add(value)
  }

  return { values: [...values].sort((a, b) => a - b), wildcard, raw }
}

const parsed = computed(() => {
  const fields = expr.value.trim().split(/\s+/).filter(Boolean)

  if (fields.length !== 5) {
    return { error: `Cron 表达式需要 5 个字段（分 时 日 月 周），当前 ${fields.length} 个` }
  }

  try {
    const result: Record<string, ParsedField> = {}
    FIELDS.forEach((def, index) => {
      result[def.key] = parseField(fields[index], def)
    })
    return { result }
  } catch (error) {
    return { error: error instanceof Error ? error.message : String(error) }
  }
})

function pad(value: number) {
  return String(value).padStart(2, '0')
}

const WEEK_LABELS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

function formatDate(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())} ${WEEK_LABELS[date.getDay()]}`
}

const nextRuns = computed(() => {
  if (!('result' in parsed.value) || !parsed.value.result) return []

  const fields = parsed.value.result
  const minutes = fields.minute.values
  const hours = fields.hour.values
  const days = new Set(fields.day.values)
  const months = new Set(fields.month.values)
  const weekdays = new Set(fields.weekday.values)

  const cursor = new Date()
  cursor.setSeconds(0, 0)
  cursor.setMinutes(cursor.getMinutes() + 1)

  const runs: Date[] = []

  for (let offset = 0; offset <= 400 && runs.length < 5; offset += 1) {
    const day = new Date(cursor)
    day.setDate(day.getDate() + offset)
    day.setHours(0, 0, 0, 0)

    if (!months.has(day.getMonth() + 1)) continue

    const dayMatches = days.has(day.getDate())
    const weekdayMatches = weekdays.has(day.getDay())
    const matched =
      fields.day.wildcard && fields.weekday.wildcard
        ? true
        : fields.day.wildcard
          ? weekdayMatches
          : fields.weekday.wildcard
            ? dayMatches
            : dayMatches || weekdayMatches

    if (!matched) continue

    for (const hour of hours) {
      for (const minute of minutes) {
        const candidate = new Date(day)
        candidate.setHours(hour, minute, 0, 0)
        if (candidate.getTime() < cursor.getTime()) continue
        runs.push(candidate)
        if (runs.length >= 5) break
      }
      if (runs.length >= 5) break
    }
  }

  return runs
})

const fieldSummary = computed(() => {
  if (!('result' in parsed.value) || !parsed.value.result) return []
  const fields = parsed.value.result

  return FIELDS.map((def) => {
    const field = fields[def.key]
    const values =
      field.values.length > 12
        ? `${field.values.slice(0, 12).join(', ')} …（共 ${field.values.length} 个）`
        : field.values.join(', ')

    let meaning = values
    if (field.raw === '*') {
      meaning = `每个${def.label}`
    } else if (/^\*\/\d+$/.test(field.raw)) {
      meaning = `每 ${field.raw.slice(2)} ${def.label}`
    }

    return {
      label: def.label,
      raw: field.raw,
      meaning,
    }
  })
})
</script>

<template>
  <section class="panel">
    <label class="field">
      <span class="label">Cron 表达式（分 时 日 月 周）</span>
      <input v-model="expr" class="input mono" type="text" spellcheck="false" />
    </label>

    <div class="row">
      <button
        v-for="preset in presets"
        :key="preset.value"
        class="btn btn--sm btn--ghost"
        type="button"
        @click="expr = preset.value"
      >
        {{ preset.label }}
      </button>
    </div>

    <p v-if="'error' in parsed" class="error">{{ parsed.error }}</p>

    <template v-else>
      <div class="table-wrap">
        <table class="table">
          <thead>
            <tr>
              <th>字段</th>
              <th>取值</th>
              <th>含义</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in fieldSummary" :key="row.label">
              <td>{{ row.label }}</td>
              <td class="mono">{{ row.raw }}</td>
              <td class="muted">{{ row.meaning }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="field">
        <span class="label">接下来 5 次执行时间（本地时区）</span>
        <ol class="runs">
          <li v-for="run in nextRuns" :key="run.getTime()" class="mono">{{ formatDate(run) }}</li>
        </ol>
        <p v-if="!nextRuns.length" class="hint">未来 400 天内没有匹配的执行时间。</p>
      </div>
    </template>

    <p class="hint">
      支持 <code class="mono">*</code>、<code class="mono">*/n</code>、<code class="mono">a-b</code>、
      <code class="mono">a-b/n</code>、<code class="mono">a,b</code>，月份与星期支持 JAN / MON 这类英文缩写。
    </p>
  </section>
</template>

<style scoped>
.runs {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding-left: 20px;
  font-size: 14px;
  line-height: 20px;
}
</style>
