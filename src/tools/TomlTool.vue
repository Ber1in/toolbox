<script setup lang="ts">
import { computed, ref } from 'vue'
import { parse as parseToml, stringify as stringifyToml } from 'smol-toml'
import CopyButton from '../components/tool/CopyButton.vue'
import { useI18n } from '../i18n'

const { t } = useI18n()
const input = ref('')
const mode = ref<'toJson' | 'toToml'>('toJson')

const result = computed(() => {
  if (!input.value.trim()) return { value: '', error: '' }

  try {
    if (mode.value === 'toJson') {
      return { value: JSON.stringify(parseToml(input.value), null, 2), error: '' }
    }
    const data: Record<string, unknown> = JSON.parse(input.value)
    return { value: stringifyToml(data), error: '' }
  } catch (error) {
    return {
      value: '',
      error: t('解析失败：{message}', {
        message: error instanceof Error ? error.message : String(error),
      }),
    }
  }
})

const placeholder = computed(() =>
  mode.value === 'toJson'
    ? 'title = "Toolbox"\n\n[owner]\nname = "dev"\nage = 18'
    : '{"title":"Toolbox","owner":{"name":"dev","age":18}}',
)
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
          TOML → JSON
        </button>
        <button
          :class="{ 'is-active': mode === 'toToml' }"
          type="button"
          @click="mode = 'toToml'"
        >
          JSON → TOML
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
