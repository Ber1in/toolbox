<script setup lang="ts">
import { computed, ref } from 'vue'
import CopyButton from '../components/tool/CopyButton.vue'

const mode = ref<'encode' | 'decode'>('encode')
const input = ref('')

const result = computed(() => {
  if (!input.value) return { value: '', error: '' }

  try {
    if (mode.value === 'encode') {
      const hex = Array.from(new TextEncoder().encode(input.value))
        .map((byte) => byte.toString(16).padStart(2, '0'))
        .join(' ')
      return { value: hex, error: '' }
    }

    const cleaned = input.value.replace(/0x/gi, '').replace(/[\s,]+/g, '')
    if (!/^[0-9a-f]*$/i.test(cleaned)) {
      return { value: '', error: '包含非十六进制字符' }
    }
    if (cleaned.length % 2 !== 0) {
      return { value: '', error: '十六进制长度必须是偶数（每个字节两位）' }
    }

    const bytes = new Uint8Array(cleaned.match(/.{2}/g)?.map((pair) => parseInt(pair, 16)) ?? [])
    return { value: new TextDecoder('utf-8', { fatal: true }).decode(bytes), error: '' }
  } catch {
    return { value: '', error: '解码失败：结果不是合法的 UTF-8 文本' }
  }
})
</script>

<template>
  <section class="panel">
    <div class="row">
      <div class="segmented">
        <button :class="{ 'is-active': mode === 'encode' }" type="button" @click="mode = 'encode'">
          文本 → Hex
        </button>
        <button :class="{ 'is-active': mode === 'decode' }" type="button" @click="mode = 'decode'">
          Hex → 文本
        </button>
      </div>
      <span class="hint">按 UTF-8 编码，每个字节两位十六进制</span>
    </div>

    <label class="field">
      <span class="label">输入</span>
      <textarea
        v-model="input"
        class="textarea"
        :placeholder="mode === 'encode' ? '输入文本，例如：你好' : '输入十六进制，例如：e4 bd a0 e5 a5 bd'"
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
