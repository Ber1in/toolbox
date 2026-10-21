<script setup lang="ts">
import { computed, ref } from 'vue'
import { diffLines } from 'diff'
import CopyButton from '../components/tool/CopyButton.vue'
import { useI18n } from '../i18n'

const { t } = useI18n()
const left = ref('')
const right = ref('')
const ignoreWhitespace = ref(false)

const changes = computed(() => {
  if (!left.value && !right.value) return []
  return diffLines(left.value, right.value, { ignoreWhitespace: ignoreWhitespace.value })
})

const rows = computed(() => {
  const result: { type: 'add' | 'del' | 'same'; text: string }[] = []

  for (const change of changes.value) {
    const lines = change.value.split('\n')
    if (lines[lines.length - 1] === '') lines.pop()
    for (const line of lines) {
      result.push({
        type: change.added ? 'add' : change.removed ? 'del' : 'same',
        text: line,
      })
    }
  }

  return result
})

const stats = computed(() => ({
  added: rows.value.filter((row) => row.type === 'add').length,
  removed: rows.value.filter((row) => row.type === 'del').length,
}))

const unified = computed(() =>
  rows.value
    .map((row) => `${row.type === 'add' ? '+' : row.type === 'del' ? '-' : ' '} ${row.text}`)
    .join('\n'),
)
</script>

<template>
  <section class="panel">
    <div class="cols">
      <label class="field">
        <span class="label">{{ t('原文') }}</span>
        <textarea v-model="left" class="textarea" :placeholder="t('粘贴原始文本')" spellcheck="false" />
      </label>

      <label class="field">
        <span class="label">{{ t('对比文本') }}</span>
        <textarea v-model="right" class="textarea" :placeholder="t('粘贴修改后的文本')" spellcheck="false" />
      </label>
    </div>

    <div class="row">
      <label class="checkbox">
        <input v-model="ignoreWhitespace" type="checkbox" />
        {{ t('忽略空白差异') }}
      </label>

      <span class="hint">
        <span style="color: #10b981">+{{ stats.added }}</span>
        ·
        <span style="color: #ff4d4f">-{{ stats.removed }}</span>
      </span>

      <div class="row row--end" style="margin-left: auto">
        <CopyButton :text="unified" :label="t('复制差异')" />
        <button
          class="btn btn--sm"
          type="button"
          :disabled="!left && !right"
          @click="(left = ''), (right = '')"
        >
          {{ t('清空') }}
        </button>
      </div>
    </div>

    <div class="diff-view">
      <p v-if="!rows.length" class="hint">{{ t('在上方输入两段文本后，这里会逐行显示差异。') }}</p>
      <div
        v-for="(row, index) in rows"
        :key="index"
        class="diff-line"
        :class="{
          'diff-line--add': row.type === 'add',
          'diff-line--del': row.type === 'del',
        }"
      >
        <span class="diff-line__sign">{{ row.type === 'add' ? '+' : row.type === 'del' ? '-' : ' ' }}</span>
        <span>{{ row.text || ' ' }}</span>
      </div>
    </div>
  </section>
</template>
