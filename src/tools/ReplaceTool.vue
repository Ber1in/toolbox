<script setup lang="ts">
import { computed, ref } from 'vue'
import CopyButton from '../components/tool/CopyButton.vue'
import { useI18n } from '../i18n'

const { t } = useI18n()

const input = ref('')
const find = ref('')
const replacement = ref('')
const useRegex = ref(false)
const ignoreCase = ref(false)

function escapeRegExp(text: string) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

const result = computed(() => {
  if (!find.value) return { value: input.value, count: 0, error: '' }

  try {
    const source = useRegex.value ? find.value : escapeRegExp(find.value)
    const regex = new RegExp(source, ignoreCase.value ? 'gi' : 'g')
    const count = [...input.value.matchAll(regex)].length
    const value = useRegex.value
      ? input.value.replace(regex, replacement.value)
      : input.value.replace(regex, () => replacement.value)

    return { value, count, error: '' }
  } catch (error) {
    return {
      value: '',
      count: 0,
      error: t('正则不合法：{message}', {
        message: error instanceof Error ? error.message : String(error),
      }),
    }
  }
})
</script>

<template>
  <section class="panel">
    <div class="cols">
      <label class="field">
        <span class="label">{{ t('查找') }}</span>
        <input v-model="find" class="input" type="text" :placeholder="t('要查找的内容')" />
      </label>

      <label class="field">
        <span class="label">{{ t('替换为') }}</span>
        <input v-model="replacement" class="input" type="text" :placeholder="t('留空表示删除')" />
      </label>
    </div>

    <div class="row">
      <label class="checkbox">
        <input v-model="useRegex" type="checkbox" />
        {{ t('使用正则表达式') }}
      </label>
      <label class="checkbox">
        <input v-model="ignoreCase" type="checkbox" />
        {{ t('忽略大小写') }}
      </label>
      <span v-if="find" class="hint">{{ t('替换 {n} 处', { n: result.count }) }}</span>
    </div>

    <label class="field">
      <span class="label">{{ t('原文') }}</span>
      <textarea v-model="input" class="textarea" :placeholder="t('粘贴需要替换的文本')" spellcheck="false" />
    </label>

    <div class="field">
      <div class="row row--end">
        <CopyButton :text="result.value" />
        <button
          class="btn btn--sm"
          type="button"
          :disabled="!input"
          @click="(input = ''), (find = ''), (replacement = '')"
        >
          {{ t('清空') }}
        </button>
      </div>
      <pre class="output output--tall">{{ result.value }}</pre>
      <p v-if="result.error" class="error">{{ result.error }}</p>
    </div>
  </section>
</template>
