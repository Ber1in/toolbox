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
      const encoded = Array.from(input.value)
        .map((char) => {
          const code = char.codePointAt(0) ?? 0
          // Keep printable ASCII as-is; escape everything else as \uXXXX / \u{XXXXX}.
          if (code >= 0x20 && code <= 0x7e) return char
          return code > 0xffff
            ? `\\u{${code.toString(16)}}`
            : `\\u${code.toString(16).padStart(4, '0')}`
        })
        .join('')
      return { value: encoded, error: '' }
    }

    const decoded = input.value.replace(
      /\\u\{([0-9a-fA-F]{1,6})\}|\\u([0-9a-fA-F]{4})/g,
      (_match, braced: string | undefined, plain: string | undefined) =>
        String.fromCodePoint(parseInt(braced ?? plain ?? '0', 16)),
    )
    return { value: decoded, error: '' }
  } catch {
    return { value: '', error: t('转换失败：请检查 \\uXXXX 或 \\u{XXXXX} 的写法') }
  }
})
</script>

<template>
  <section class="panel">
    <div class="row">
      <div class="segmented">
        <button :class="{ 'is-active': mode === 'encode' }" type="button" @click="mode = 'encode'">
          {{ t('转义') }}
        </button>
        <button :class="{ 'is-active': mode === 'decode' }" type="button" @click="mode = 'decode'">
          {{ t('还原') }}
        </button>
      </div>
      <span class="hint">{{ t('ASCII 字符保持原样，中文 / Emoji 转成 \\uXXXX 或 \\u{XXXXX}') }}</span>
    </div>

    <label class="field">
      <span class="label">{{ t('输入') }}</span>
      <textarea
        v-model="input"
        class="textarea"
        :placeholder="t(mode === 'encode' ? '输入文本，例如：你好 😀' : '输入转义序列，例如：\\u4f60\\u597d')"
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
