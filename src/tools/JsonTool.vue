<script setup lang="ts">
import { computed, ref } from 'vue'
import CopyButton from '../components/tool/CopyButton.vue'

const input = ref('')
const mode = ref<'format' | 'minify'>('format')
const indent = ref(2)

const result = computed(() => {
  if (!input.value.trim()) return { value: '', error: '', stats: '' }

  try {
    const data: unknown = JSON.parse(input.value)
    const value = JSON.stringify(data, null, mode.value === 'format' ? indent.value : 0)
    const lines = value.split('\n').length
    return {
      value,
      error: '',
      stats: `${lines} 行 · ${new Blob([value]).size} 字节`,
    }
  } catch (error) {
    return {
      value: '',
      error: `JSON 解析失败：${error instanceof Error ? error.message : String(error)}`,
      stats: '',
    }
  }
})
</script>

<template>
  <section class="panel">
    <div class="row">
      <div class="segmented">
        <button
          :class="{ 'is-active': mode === 'format' }"
          type="button"
          @click="mode = 'format'"
        >
          格式化
        </button>
        <button
          :class="{ 'is-active': mode === 'minify' }"
          type="button"
          @click="mode = 'minify'"
        >
          压缩
        </button>
      </div>

      <label v-if="mode === 'format'" class="checkbox">
        <input v-model.number="indent" type="radio" :value="2" />
        2 空格
      </label>
      <label v-if="mode === 'format'" class="checkbox">
        <input v-model.number="indent" type="radio" :value="4" />
        4 空格
      </label>

      <span v-if="result.stats" class="hint">{{ result.stats }}</span>
    </div>

    <label class="field">
      <span class="label">输入</span>
      <textarea
        v-model="input"
        class="textarea"
        placeholder='粘贴 JSON，例如：{"name":"toolbox","tools":[1,2,3]}'
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
      <p v-else-if="input.trim()" class="hint">JSON 合法 ✓</p>
    </div>
  </section>
</template>
