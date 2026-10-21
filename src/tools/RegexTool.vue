<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from '../i18n'

const { t } = useI18n()

const pattern = ref('\\d+')
const text = ref(t('订单 A1001 金额 299 元，订单 B1002 金额 1580 元。'))
const flags = ref<string[]>(['g'])

const flagOptions = [
  { key: 'g', label: 'g 全局' },
  { key: 'i', label: 'i 忽略大小写' },
  { key: 'm', label: 'm 多行' },
  { key: 's', label: 's . 匹配换行' },
  { key: 'u', label: 'u Unicode' },
]

const compiled = computed(() => {
  if (!pattern.value) return { regex: null, error: '' }
  try {
    return { regex: new RegExp(pattern.value, flags.value.join('')), error: '' }
  } catch (error) {
    return {
      regex: null,
      error: t('正则不合法：{message}', {
        message: error instanceof Error ? error.message : String(error),
      }),
    }
  }
})

function globalRegex(regex: RegExp) {
  return new RegExp(regex.source, regex.flags.includes('g') ? regex.flags : `${regex.flags}g`)
}

const matches = computed(() => {
  const regex = compiled.value.regex
  if (!regex || !text.value) return []

  const re = globalRegex(regex)
  const list: { value: string; index: number; groups: string[] }[] = []
  let match: RegExpExecArray | null
  let guard = 0

  while ((match = re.exec(text.value)) !== null && guard < 300) {
    list.push({
      value: match[0],
      index: match.index,
      groups: match.slice(1).map((group) => group ?? ''),
    })
    if (match[0] === '') re.lastIndex += 1
    guard += 1
  }

  return list
})

const segments = computed(() => {
  const regex = compiled.value.regex
  if (!regex || !text.value) return []

  const re = globalRegex(regex)
  const parts: { text: string; hit: boolean }[] = []
  let last = 0
  let match: RegExpExecArray | null
  let guard = 0

  while ((match = re.exec(text.value)) !== null && guard < 300) {
    if (match.index > last) parts.push({ text: text.value.slice(last, match.index), hit: false })
    parts.push({ text: match[0], hit: true })
    last = match.index + match[0].length
    if (match[0] === '') re.lastIndex += 1
    guard += 1
  }

  if (last < text.value.length) parts.push({ text: text.value.slice(last), hit: false })
  return parts
})
</script>

<template>
  <div class="stack">
    <section class="panel">
      <label class="field">
        <span class="label">{{ t('正则表达式') }}</span>
        <input v-model="pattern" class="input mono" type="text" spellcheck="false" />
      </label>

      <div class="row">
        <label v-for="flag in flagOptions" :key="flag.key" class="checkbox">
          <input v-model="flags" type="checkbox" :value="flag.key" />
          {{ t(flag.label) }}
        </label>
      </div>

      <p v-if="compiled.error" class="error">{{ compiled.error }}</p>
      <p v-else class="hint">
        {{ t('匹配到 {n} 处{truncated}', {
          n: matches.length,
          truncated: matches.length >= 300 ? t('（已截断）') : '',
        }) }}
      </p>
    </section>

    <section class="panel">
      <label class="field">
        <span class="label">{{ t('测试文本') }}</span>
        <textarea v-model="text" class="textarea" spellcheck="false" />
      </label>

      <div class="field">
        <span class="label">{{ t('匹配高亮') }}</span>
        <div class="highlight mono">
          <template v-for="(part, index) in segments" :key="index">
            <mark v-if="part.hit">{{ part.text }}</mark>
            <span v-else>{{ part.text }}</span>
          </template>
        </div>
      </div>
    </section>

    <section v-if="matches.length" class="panel">
      <p class="panel__title">{{ t('匹配明细') }}</p>
      <div class="table-wrap">
        <table class="table">
          <thead>
            <tr>
              <th>#</th>
              <th>{{ t('位置') }}</th>
              <th>{{ t('匹配内容') }}</th>
              <th>{{ t('分组') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(match, index) in matches" :key="index">
              <td>{{ index + 1 }}</td>
              <td class="mono">{{ match.index }}</td>
              <td class="mono">{{ match.value || t('（空匹配）') }}</td>
              <td class="mono muted">{{ match.groups.join(' | ') || '-' }}</td>
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

.highlight {
  min-height: 120px;
  padding: 12px 14px;
  border-radius: 10px;
  background: var(--color-chip);
  font-size: 13px;
  line-height: 21px;
  white-space: pre-wrap;
  word-break: break-word;
}
</style>
