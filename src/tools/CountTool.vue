<script setup lang="ts">
import { computed, ref } from 'vue'
import CopyButton from '../components/tool/CopyButton.vue'
import { useI18n } from '../i18n'

const { t } = useI18n()

const input = ref('')

const stats = computed(() => {
  const text = input.value
  if (!text) {
    return {
      chars: 0,
      charsNoSpace: 0,
      words: 0,
      lines: 0,
      paragraphs: 0,
      cjk: 0,
      bytes: 0,
      reading: 0,
    }
  }

  const chars = Array.from(text).length
  const charsNoSpace = Array.from(text.replace(/\s/g, '')).length
  const cjk = (text.match(/[\u3400-\u4dbf\u4e00-\u9fff]/g) ?? []).length
  const latinWords = text
    .replace(/[\u3400-\u4dbf\u4e00-\u9fff]/g, ' ')
    .split(/\s+/)
    .filter((word) => /[a-zA-Z0-9]/.test(word)).length

  return {
    chars,
    charsNoSpace,
    words: cjk + latinWords,
    lines: text.split('\n').length,
    paragraphs: text.split(/\n\s*\n/).filter((part) => part.trim()).length,
    cjk,
    bytes: new TextEncoder().encode(text).length,
    reading: Math.max(1, Math.ceil(chars / 300)),
  }
})

const items = computed(() => [
  { label: '字符数', value: stats.value.chars.toLocaleString() },
  { label: '不含空白', value: stats.value.charsNoSpace.toLocaleString() },
  { label: '单词数', value: stats.value.words.toLocaleString() },
  { label: '行数', value: stats.value.lines.toLocaleString() },
  { label: '段落数', value: stats.value.paragraphs.toLocaleString() },
  { label: '中文字符', value: stats.value.cjk.toLocaleString() },
  { label: 'UTF-8 字节', value: stats.value.bytes.toLocaleString() },
  { label: '预计阅读', value: t('{n} 分钟', { n: stats.value.reading }) },
])
</script>

<template>
  <div class="stack">
    <section class="panel">
      <label class="field">
        <span class="label">{{ t('输入文本') }}</span>
        <textarea
          v-model="input"
          class="textarea"
          :placeholder="t('粘贴或输入文本，统计结果会实时更新')"
          spellcheck="false"
        />
      </label>

      <div class="row">
        <CopyButton :text="input" :label="t('复制原文')" />
        <button class="btn btn--sm" type="button" :disabled="!input" @click="input = ''">
          {{ t('清空') }}
        </button>
      </div>
    </section>

    <section class="panel">
      <p class="panel__title">{{ t('统计结果') }}</p>
      <div class="stat-grid">
        <div v-for="item in items" :key="item.label" class="stat">
          <span class="stat__label">{{ t(item.label) }}</span>
          <span class="stat__value">{{ item.value }}</span>
        </div>
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
