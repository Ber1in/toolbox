<script setup lang="ts">
import { computed, ref } from 'vue'
import CopyButton from '../components/tool/CopyButton.vue'
import { useI18n } from '../i18n'

const { t } = useI18n()
const input = ref('')
const mode = ref<'format' | 'minify'>('format')
const indent = ref(2)

function formatXml(xml: string, size: number): string {
  const tokens = xml.replace(/>\s*</g, '><').match(/<[^>]+>|[^<]+/g) ?? []
  const lines: string[] = []
  let depth = 0

  for (const token of tokens) {
    const text = token.trim()
    if (!text) continue

    if (text.startsWith('</')) {
      depth = Math.max(depth - 1, 0)
      lines.push(' '.repeat(depth * size) + text)
    } else if (text.startsWith('<')) {
      lines.push(' '.repeat(depth * size) + text)
      const selfClosing = text.endsWith('/>') || text.startsWith('<?') || text.startsWith('<!')
      if (!selfClosing) depth += 1
    } else {
      lines.push(' '.repeat(depth * size) + text)
    }
  }

  return lines.join('\n')
}

const result = computed(() => {
  const xml = input.value.trim()
  if (!xml) return { value: '', error: '' }

  if (!xml.includes('<')) {
    return { value: '', error: t('看起来不是 XML：没有找到标签') }
  }

  const open = (xml.match(/<[^!?/][^>]*[^/]>/g) ?? []).length
  const close = (xml.match(/<\/[^>]+>/g) ?? []).length

  return {
    value: mode.value === 'format' ? formatXml(xml, indent.value) : xml.replace(/>\s+</g, '><'),
    error:
      open !== close
        ? t('标签数量可能不匹配：开始标签 {open} 个，结束标签 {close} 个', { open, close })
        : '',
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
          {{ t('格式化') }}
        </button>
        <button
          :class="{ 'is-active': mode === 'minify' }"
          type="button"
          @click="mode = 'minify'"
        >
          {{ t('压缩') }}
        </button>
      </div>

      <label v-if="mode === 'format'" class="checkbox">
        <input v-model.number="indent" type="radio" :value="2" />
        {{ t('2 空格') }}
      </label>
      <label v-if="mode === 'format'" class="checkbox">
        <input v-model.number="indent" type="radio" :value="4" />
        {{ t('4 空格') }}
      </label>
    </div>

    <label class="field">
      <span class="label">{{ t('输入') }}</span>
      <textarea
        v-model="input"
        class="textarea"
        placeholder='<?xml version="1.0"?><root><item id="1">hello</item></root>'
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
