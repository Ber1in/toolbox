<script setup lang="ts">
import { computed, ref } from 'vue'
import CopyButton from '../components/tool/CopyButton.vue'

const mode = ref<'encode' | 'decode'>('encode')
const scope = ref<'component' | 'uri'>('component')
const input = ref('')

const result = computed(() => {
  if (!input.value) return { value: '', error: '' }

  try {
    if (mode.value === 'encode') {
      return {
        value: scope.value === 'component' ? encodeURIComponent(input.value) : encodeURI(input.value),
        error: '',
      }
    }
    return {
      value: scope.value === 'component' ? decodeURIComponent(input.value) : decodeURI(input.value),
      error: '',
    }
  } catch {
    return { value: '', error: '解码失败：包含非法的百分号转义（如 %ZZ）' }
  }
})
</script>

<template>
  <section class="panel">
    <div class="row">
      <div class="segmented">
        <button :class="{ 'is-active': mode === 'encode' }" type="button" @click="mode = 'encode'">
          编码
        </button>
        <button :class="{ 'is-active': mode === 'decode' }" type="button" @click="mode = 'decode'">
          解码
        </button>
      </div>

      <div class="segmented">
        <button
          :class="{ 'is-active': scope === 'component' }"
          type="button"
          @click="scope = 'component'"
        >
          Component
        </button>
        <button :class="{ 'is-active': scope === 'uri' }" type="button" @click="scope = 'uri'">
          整条 URI
        </button>
      </div>
    </div>

    <p class="hint">
      Component 会把 <code class="mono">/ ? &amp; =</code> 等分隔符也编码；整条 URI 则保留它们。
    </p>

    <label class="field">
      <span class="label">输入</span>
      <textarea
        v-model="input"
        class="textarea"
        :placeholder="
          mode === 'encode'
            ? '输入要编码的文本或链接，例如：https://example.com/搜索?q=你好'
            : '粘贴含 %XX 转义的字符串'
        "
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
