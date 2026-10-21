<script setup lang="ts">
import { computed, ref } from 'vue'
import CopyButton from '../components/tool/CopyButton.vue'

const input = ref('')
const trimLines = ref(true)
const collapseSpaces = ref(true)
const removeBlankLines = ref(false)
const removeAllSpaces = ref(false)
const removeLineBreaks = ref(false)

const result = computed(() => {
  let text = input.value

  if (trimLines.value) {
    text = text
      .split('\n')
      .map((line) => line.trim())
      .join('\n')
  }

  if (collapseSpaces.value) {
    text = text.replace(/[ \t]+/g, ' ')
  }

  if (removeBlankLines.value) {
    text = text
      .split('\n')
      .filter((line) => line.trim() !== '')
      .join('\n')
  }

  if (removeAllSpaces.value) {
    text = text.replace(/[ \t]+/g, '')
  }

  if (removeLineBreaks.value) {
    text = text.replace(/\s*\n+\s*/g, ' ')
  }

  return text.trim()
})

const removed = computed(() => {
  if (!input.value) return 0
  return input.value.length - result.value.length
})
</script>

<template>
  <section class="panel">
    <label class="field">
      <span class="label">输入</span>
      <textarea
        v-model="input"
        class="textarea"
        placeholder="粘贴需要清理的文本"
        spellcheck="false"
      />
    </label>

    <div class="row">
      <label class="checkbox">
        <input v-model="trimLines" type="checkbox" />
        去除每行首尾空格
      </label>
      <label class="checkbox">
        <input v-model="collapseSpaces" type="checkbox" />
        合并连续空格
      </label>
      <label class="checkbox">
        <input v-model="removeBlankLines" type="checkbox" />
        删除空行
      </label>
      <label class="checkbox">
        <input v-model="removeAllSpaces" type="checkbox" />
        删除所有空格
      </label>
      <label class="checkbox">
        <input v-model="removeLineBreaks" type="checkbox" />
        删除所有换行
      </label>
    </div>

    <div class="field">
      <div class="row row--end">
        <span v-if="removed > 0" class="hint">已减少 {{ removed }} 个字符</span>
        <CopyButton :text="result" />
        <button class="btn btn--sm" type="button" :disabled="!input" @click="input = ''">
          清空
        </button>
      </div>
      <pre class="output output--tall">{{ result }}</pre>
    </div>
  </section>
</template>
