<script setup lang="ts">
import { computed, ref } from 'vue'
import CopyButton from '../components/tool/CopyButton.vue'
import { useI18n } from '../i18n'

const { t } = useI18n()

type Mode =
  | 'upper'
  | 'lower'
  | 'title'
  | 'camel'
  | 'pascal'
  | 'snake'
  | 'kebab'
  | 'constant'

const modes: { key: Mode; label: string }[] = [
  { key: 'upper', label: '大写' },
  { key: 'lower', label: '小写' },
  { key: 'title', label: '标题式' },
  { key: 'camel', label: 'camelCase' },
  { key: 'pascal', label: 'PascalCase' },
  { key: 'snake', label: 'snake_case' },
  { key: 'kebab', label: 'kebab-case' },
  { key: 'constant', label: 'CONSTANT_CASE' },
]

const input = ref('')
const mode = ref<Mode>('upper')

function splitWords(text: string) {
  return text
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_\-./]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
}

function capitalize(word: string) {
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
}

const result = computed(() => {
  const text = input.value
  if (!text) return ''

  const words = splitWords(text)

  switch (mode.value) {
    case 'upper':
      return text.toUpperCase()
    case 'lower':
      return text.toLowerCase()
    case 'title':
      return text.replace(/[\p{L}\p{N}]+/gu, (word) => word.charAt(0).toUpperCase() + word.slice(1))
    case 'camel':
      return words
        .map((word, index) => (index === 0 ? word.toLowerCase() : capitalize(word)))
        .join('')
    case 'pascal':
      return words.map(capitalize).join('')
    case 'snake':
      return words.map((word) => word.toLowerCase()).join('_')
    case 'kebab':
      return words.map((word) => word.toLowerCase()).join('-')
    case 'constant':
      return words.map((word) => word.toUpperCase()).join('_')
    default:
      return text
  }
})
</script>

<template>
  <section class="panel">
    <label class="field">
      <span class="label">{{ t('输入') }}</span>
      <textarea
        v-model="input"
        class="textarea"
        :placeholder="t('输入文本，例如：hello world')"
        spellcheck="false"
      />
    </label>

    <div class="row">
      <button
        v-for="item in modes"
        :key="item.key"
        class="btn btn--sm"
        :class="mode === item.key ? 'btn--primary' : 'btn--ghost'"
        type="button"
        @click="mode = item.key"
      >
        {{ t(item.label) }}
      </button>
    </div>

    <div class="field">
      <div class="row row--end">
        <CopyButton :text="result" />
        <button class="btn btn--sm" type="button" :disabled="!input" @click="input = ''">
          {{ t('清空') }}
        </button>
      </div>
      <pre class="output output--tall">{{ result }}</pre>
    </div>
  </section>
</template>
