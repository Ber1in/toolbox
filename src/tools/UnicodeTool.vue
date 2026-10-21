<script setup lang="ts">
import { computed, ref } from 'vue'
import CopyButton from '../components/tool/CopyButton.vue'

const mode = ref<'encode' | 'decode'>('encode')
const input = ref('')

const result = computed(() => {
  if (!input.value) return { value: '', error: '' }

  try {
    if (mode.value === 'encode') {
      const encoded = Array.from(input.value)
        .map((char) => {
          const code = char.codePointAt(0) ?? 0
          // 可打印 ASCII 原样保留，其余转成 \uXXXX / \u{XXXXX}
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
    return { value: '', error: '转换失败：请检查 \\uXXXX 或 \\u{XXXXX} 的写法' }
  }
})
</script>

<template>
  <section class="panel">
    <div class="row">
      <div class="segmented">
        <button :class="{ 'is-active': mode === 'encode' }" type="button" @click="mode = 'encode'">
          转义
        </button>
        <button :class="{ 'is-active': mode === 'decode' }" type="button" @click="mode = 'decode'">
          还原
        </button>
      </div>
      <span class="hint">ASCII 字符保持原样，中文 / Emoji 转成 \uXXXX 或 \u{XXXXX}</span>
    </div>

    <label class="field">
      <span class="label">输入</span>
      <textarea
        v-model="input"
        class="textarea"
        :placeholder="mode === 'encode' ? '输入文本，例如：你好 😀' : '输入转义序列，例如：\\u4f60\\u597d'"
        spellcheck="false"
      />
    </label>

    <div class="field">
      <div class="row row--end">
        <CopyButton :text="result.value" />
        <button class="btn btn--sm" type="button" :disabled="!input" @click="input = ''">
          清空
        </button>
      </div>
      <pre class="output output--tall">{{ result.value }}</pre>
      <p v-if="result.error" class="error">{{ result.error }}</p>
    </div>
  </section>
</template>
