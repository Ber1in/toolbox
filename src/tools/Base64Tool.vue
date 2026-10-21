<script setup lang="ts">
import { computed, ref } from 'vue'
import CopyButton from '../components/tool/CopyButton.vue'
import { useI18n } from '../i18n'

const { t } = useI18n()
const mode = ref<'encode' | 'decode'>('encode')
const input = ref('')

const result = computed(() => {
  if (!input.value) return { value: '', error: '' }

  try {
    if (mode.value === 'encode') {
      const bytes = new TextEncoder().encode(input.value)
      let binary = ''
      bytes.forEach((byte) => (binary += String.fromCharCode(byte)))
      return { value: btoa(binary), error: '' }
    }

    const binary = atob(input.value.replace(/\s+/g, ''))
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0))
    return { value: new TextDecoder('utf-8', { fatal: true }).decode(bytes), error: '' }
  } catch {
    return {
      value: '',
      error:
        mode.value === 'decode'
          ? t('不是合法的 Base64 字符串（或解码结果不是 UTF-8 文本）')
          : t('编码失败'),
    }
  }
})
</script>

<template>
  <section class="panel">
    <div class="row">
      <div class="segmented">
        <button :class="{ 'is-active': mode === 'encode' }" type="button" @click="mode = 'encode'">
          {{ t('编码') }}
        </button>
        <button :class="{ 'is-active': mode === 'decode' }" type="button" @click="mode = 'decode'">
          {{ t('解码') }}
        </button>
      </div>
      <span class="hint">{{ t(mode === 'encode' ? '文本 → Base64' : 'Base64 → 文本') }}</span>
    </div>

    <label class="field">
      <span class="label">{{ t('输入') }}</span>
      <textarea
        v-model="input"
        class="textarea"
        :placeholder="t(mode === 'encode' ? '输入要编码的文本，支持中文' : '粘贴 Base64 字符串')"
        spellcheck="false"
      />
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
