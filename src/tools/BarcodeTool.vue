<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue'
import JsBarcode from 'jsbarcode'
import { useI18n } from '../i18n'

const { t } = useI18n()

const text = ref('123456789012')
const format = ref('CODE128')
const svg = ref<SVGSVGElement | null>(null)
const error = ref('')

const formats = [
  { value: 'CODE128', label: 'CODE128（通用）' },
  { value: 'EAN13', label: 'EAN-13（13 位数字）' },
  { value: 'EAN8', label: 'EAN-8（8 位数字）' },
  { value: 'UPC', label: 'UPC-A（12 位数字）' },
  { value: 'CODE39', label: 'CODE39（字母数字）' },
  { value: 'ITF14', label: 'ITF-14（14 位数字）' },
]

watchEffect(() => {
  if (!svg.value) return

  if (!text.value) {
    error.value = t('请输入条形码内容')
    return
  }

  try {
    JsBarcode(svg.value, text.value, {
      format: format.value,
      displayValue: true,
      width: 2,
      height: 80,
      margin: 12,
      fontSize: 14,
      lineColor: '#111111',
      background: '#ffffff',
    })
    error.value = ''
  } catch (reason) {
    error.value = reason instanceof Error ? reason.message : String(reason)
  }
})

const downloadUrl = computed(() => {
  if (!svg.value || error.value) return ''
  const xml = new XMLSerializer().serializeToString(svg.value)
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(xml)}`
})
</script>

<template>
  <div class="stack">
    <section class="panel">
      <label class="field">
        <span class="label">{{ t('内容') }}</span>
        <input v-model="text" class="input mono" type="text" spellcheck="false" />
      </label>

      <label class="field">
        <span class="label">{{ t('条码格式') }}</span>
        <select v-model="format" class="select">
          <option v-for="item in formats" :key="item.value" :value="item.value">
            {{ t(item.label) }}
          </option>
        </select>
      </label>

      <div class="row">
        <a v-if="downloadUrl" class="btn btn--primary" :href="downloadUrl" download="barcode.svg">
          {{ t('下载 SVG') }}
        </a>
      </div>

      <p v-if="error" class="error">{{ error }}</p>
      <p class="hint">
        {{ t('EAN / UPC 对长度和校验位有要求，输入不合法时会提示；CODE128 支持任意 ASCII 字符。') }}
      </p>
    </section>

    <section class="panel barcode-panel">
      <div class="barcode-box">
        <svg ref="svg" />
      </div>
    </section>
  </div>
</template>

<style scoped>
.stack {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.barcode-panel {
  align-items: center;
}

.barcode-box {
  max-width: 100%;
  padding: 12px;
  overflow-x: auto;
  border-radius: 12px;
  background: #ffffff;
  box-shadow: inset 0 0 0 1px var(--color-border);
}

.barcode-box svg {
  display: block;
  max-width: 100%;
  height: auto;
}
</style>
