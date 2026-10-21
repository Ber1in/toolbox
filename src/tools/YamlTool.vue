<script setup lang="ts">
import { computed, ref } from 'vue'
import { parse as parseYaml, stringify as stringifyYaml } from 'yaml'
import CopyButton from '../components/tool/CopyButton.vue'
import { useI18n } from '../i18n'

const { t } = useI18n()
const input = ref('')
const mode = ref<'toJson' | 'toYaml' | 'format'>('toJson')

const result = computed(() => {
  if (!input.value.trim()) return { value: '', error: '' }

  try {
    if (mode.value === 'toJson') {
      return { value: JSON.stringify(parseYaml(input.value), null, 2), error: '' }
    }

    if (mode.value === 'toYaml') {
      const data: unknown = JSON.parse(input.value)
      return { value: stringifyYaml(data, { indent: 2, lineWidth: 0 }), error: '' }
    }

    return { value: stringifyYaml(parseYaml(input.value), { indent: 2, lineWidth: 0 }), error: '' }
  } catch (error) {
    return {
      value: '',
      error: t('解析失败：{message}', {
        message: error instanceof Error ? error.message : String(error),
      }),
    }
  }
})

const placeholder = computed(() => {
  if (mode.value === 'toJson') {
    return 'name: toolbox\nversion: 1.0.0\ntools:\n  - base64\n  - json'
  }
  if (mode.value === 'toYaml') {
    return '{"name":"toolbox","version":"1.0.0","tools":["base64","json"]}'
  }
  return 'name:   toolbox\nversion:    1.0.0'
})
</script>

<template>
  <section class="panel">
    <div class="row">
      <div class="segmented">
        <button
          :class="{ 'is-active': mode === 'toJson' }"
          type="button"
          @click="mode = 'toJson'"
        >
          YAML → JSON
        </button>
        <button
          :class="{ 'is-active': mode === 'toYaml' }"
          type="button"
          @click="mode = 'toYaml'"
        >
          JSON → YAML
        </button>
        <button
          :class="{ 'is-active': mode === 'format' }"
          type="button"
          @click="mode = 'format'"
        >
          {{ t('格式化 YAML') }}
        </button>
      </div>
    </div>

    <label class="field">
      <span class="label">{{ t('输入') }}</span>
      <textarea v-model="input" class="textarea" :placeholder="placeholder" spellcheck="false" />
    </label>

    <div class="field">
      <div class="row row--end">
        <CopyButton :text="result.value" />
        <button class="btn btn--sm" type="button" :disabled="!input" @click="input = ''">
          {{ t('清空') }}
        </button>
      </div>
      <pre class="output output--tall">{{ result.value }}</pre>
      <p v-if="result.error" class="error">{{ result.error }}</p>
    </div>
  </section>
</template>
