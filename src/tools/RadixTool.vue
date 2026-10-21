<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import CopyButton from '../components/tool/CopyButton.vue'
import { useI18n } from '../i18n'

const { t } = useI18n()

const DIGITS = '0123456789abcdefghijklmnopqrstuvwxyz'
const STANDARD_BASES = [2, 8, 10, 16]
const PREFIXES: Record<number, string> = { 2: '0b', 8: '0o', 16: '0x' }
const BASE_NAMES: Record<number, string> = {
  2: '二进制',
  8: '八进制',
  10: '十进制',
  16: '十六进制',
}

const baseOptions = Array.from({ length: 35 }, (_, index) => index + 2)

const sourceBase = ref(10)
const input = ref('255')
const uppercaseHex = ref(true)
const groupBinary = ref(true)
const showPrefix = ref(false)

type ParseResult = { ok: true; value: bigint } | { ok: false; error: string }

function parse(raw: string, base: number): ParseResult {
  let text = raw.trim().toLowerCase().replace(/[\s_,]/g, '')
  if (!text) return { ok: false, error: t('请输入要转换的数值') }

  let negative = false
  if (text.startsWith('-')) {
    negative = true
    text = text.slice(1)
  } else if (text.startsWith('+')) {
    text = text.slice(1)
  }

  const prefix = PREFIXES[base]
  if (prefix && text.startsWith(prefix)) text = text.slice(2)
  if (!text) return { ok: false, error: t('请输入要转换的数值') }

  let value = 0n
  for (const char of text) {
    const digit = DIGITS.indexOf(char)
    if (digit < 0 || digit >= base) {
      return {
        ok: false,
        error: t('「{char}」不是 {base} 进制的合法数字', { char, base }),
      }
    }
    value = value * BigInt(base) + BigInt(digit)
  }

  return { ok: true, value: negative ? -value : value }
}

function format(
  value: bigint,
  base: number,
  options: { upper?: boolean; group?: boolean; prefix?: boolean } = {},
) {
  const negative = value < 0n
  let rest = negative ? -value : value
  let out = ''

  if (rest === 0n) out = '0'
  while (rest > 0n) {
    out = DIGITS[Number(rest % BigInt(base))] + out
    rest /= BigInt(base)
  }

  if (options.upper && base > 10) out = out.toUpperCase()
  if (options.group && base === 2) out = out.replace(/\B(?=(.{4})+$)/g, ' ')
  if (options.prefix) out = (PREFIXES[base] ?? '') + out

  return negative ? `-${out}` : out
}

const parsed = computed(() => parse(input.value, sourceBase.value))
const errorText = computed(() => (parsed.value.ok ? '' : parsed.value.error))

const outputs = computed(() => {
  const result = parsed.value
  if (!result.ok) return []

  return STANDARD_BASES.filter((base) => base !== sourceBase.value).map((base) => ({
    base,
    label: BASE_NAMES[base],
    display: format(result.value, base, {
      upper: uppercaseHex.value,
      group: groupBinary.value,
      prefix: showPrefix.value,
    }),
    // 复制时去掉二进制分组空格，避免粘贴出多余空白
    copy: format(result.value, base, {
      upper: uppercaseHex.value,
      prefix: showPrefix.value,
    }),
  }))
})

const allBases = computed(() => {
  const result = parsed.value
  if (!result.ok) return []

  return baseOptions.map((base) => ({
    base,
    name: BASE_NAMES[base] ?? '',
    display: format(result.value, base, {
      upper: uppercaseHex.value,
      group: groupBinary.value,
      prefix: showPrefix.value,
    }),
  }))
})

const bitLength = computed(() => {
  const result = parsed.value
  if (!result.ok) return 0
  return format(result.value, 2).replace('-', '').length
})

const placeholder = computed(() => {
  switch (sourceBase.value) {
    case 2:
      return t('例如 1111 1111')
    case 8:
      return t('例如 377')
    case 16:
      return t('例如 ff 或 0xFF')
    default:
      return t('例如 255')
  }
})

// 切换源进制时保留数值本身：把当前输入换算成新进制
watch(sourceBase, (next, previous) => {
  if (!input.value.trim()) return
  const result = parse(input.value, previous)
  if (!result.ok) return
  input.value = format(result.value, next)
})
</script>

<template>
  <div class="stack">
    <section class="panel">
      <div class="cols">
        <label class="field">
          <span class="label">{{ t('源进制') }}</span>
          <select v-model.number="sourceBase" class="select">
            <option v-for="base in baseOptions" :key="base" :value="base">
              {{ base }}{{ BASE_NAMES[base] ? ` · ${t(BASE_NAMES[base])}` : '' }}
            </option>
          </select>
        </label>

        <label class="field">
          <span class="label">{{ t('数值') }}</span>
          <input
            v-model="input"
            class="input mono"
            type="text"
            :placeholder="placeholder"
            spellcheck="false"
            autocomplete="off"
          />
        </label>
      </div>

      <div class="row">
        <label class="checkbox">
          <input v-model="uppercaseHex" type="checkbox" />
          {{ t('十六进制大写') }}
        </label>
        <label class="checkbox">
          <input v-model="groupBinary" type="checkbox" />
          {{ t('二进制每 4 位分组') }}
        </label>
        <label class="checkbox">
          <input v-model="showPrefix" type="checkbox" />
          {{ t('显示 0b / 0o / 0x 前缀') }}
        </label>

        <button
          class="btn btn--sm"
          type="button"
          style="margin-left: auto"
          :disabled="!input"
          @click="input = ''"
        >
          {{ t('清空') }}
        </button>
      </div>

      <p v-if="errorText" class="error">{{ errorText }}</p>
      <p v-else class="hint">
        {{ t('支持 2–36 进制，可带 0b / 0o / 0x 前缀，空格与下划线会被忽略；使用 BigInt 计算，不会丢精度。') }}
      </p>
    </section>

    <section v-if="!errorText" class="panel">
      <div class="row">
        <p class="panel__title">{{ t('对应值') }}</p>
        <span class="hint">{{ t('二进制共 {n} 位', { n: bitLength }) }}</span>
      </div>

      <div class="stat-grid outputs">
        <div v-for="item in outputs" :key="item.base" class="stat">
          <div class="stat__head">
            <span class="stat__label">{{ t('{label}（{base} 进制）', { label: t(item.label), base: item.base }) }}</span>
            <CopyButton :text="item.copy" label="复制" />
          </div>
          <span class="stat__value">{{ item.display }}</span>
        </div>
      </div>
    </section>

    <section v-if="!errorText" class="panel">
      <div class="row">
        <p class="panel__title">{{ t('全部进制（2–36）') }}</p>
        <span class="hint">{{ t('上下滚动查看全部 35 种进制') }}</span>
      </div>

      <div class="table-wrap bases">
        <table class="table">
          <thead>
            <tr>
              <th>{{ t('进制') }}</th>
              <th>{{ t('对应值') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="item in allBases"
              :key="item.base"
              :class="{ 'is-source': item.base === sourceBase }"
            >
              <td class="bases__name">
                {{ item.base }}
                <span v-if="item.name" class="muted">· {{ t(item.name) }}</span>
                <span v-if="item.base === sourceBase" class="bases__tag">{{ t('源') }}</span>
              </td>
              <td class="mono">{{ item.display }}</td>
            </tr>
          </tbody>
        </table>
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

.stat__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.stat__head :deep(.btn) {
  height: 24px;
  padding: 0 8px;
  font-size: 12px;
}

.outputs {
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
}

.bases {
  max-height: 360px;
  overflow-y: auto;
}

.bases th,
.bases td {
  padding: 6px 12px;
}

.bases__name {
  white-space: nowrap;
}

.bases__tag {
  margin-left: 8px;
  padding: 1px 6px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--color-accent) 12%, transparent);
  color: var(--color-accent);
  font-size: 11px;
  font-weight: 600;
}

tbody tr.is-source td {
  background: color-mix(in srgb, var(--color-accent) 6%, transparent);
}
</style>
