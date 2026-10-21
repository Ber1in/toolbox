<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import QRCode from 'qrcode'
import { useI18n } from '../i18n'

const { t } = useI18n()

const text = ref('https://example.com')
const size = ref(256)
const level = ref<'L' | 'M' | 'Q' | 'H'>('M')
const canvas = ref<HTMLCanvasElement | null>(null)
const dataUrl = ref('')
const error = ref('')

async function render() {
  if (!canvas.value) return

  if (!text.value.trim()) {
    error.value = t('请输入要生成二维码的文本')
    dataUrl.value = ''
    return
  }

  try {
    await QRCode.toCanvas(canvas.value, text.value, {
      width: size.value,
      margin: 2,
      errorCorrectionLevel: level.value,
      color: { dark: '#111111', light: '#ffffff' },
    })
    dataUrl.value = canvas.value.toDataURL('image/png')
    error.value = ''
  } catch (reason) {
    error.value = reason instanceof Error ? reason.message : String(reason)
    dataUrl.value = ''
  }
}

onMounted(render)
watch([text, size, level], render)
</script>

<template>
  <div class="stack">
    <section class="panel">
      <label class="field">
        <span class="label">{{ t('内容') }}</span>
        <textarea
          v-model="text"
          class="textarea"
          :placeholder="t('输入网址或任意文本')"
          spellcheck="false"
        />
      </label>

      <div class="cols">
        <label class="field">
          <span class="label">{{ t('尺寸（px）') }}</span>
          <select v-model.number="size" class="select">
            <option :value="160">160 × 160</option>
            <option :value="256">256 × 256</option>
            <option :value="320">320 × 320</option>
            <option :value="512">512 × 512</option>
          </select>
        </label>

        <label class="field">
          <span class="label">{{ t('容错级别') }}</span>
          <select v-model="level" class="select">
            <option value="L">L（7%）</option>
            <option value="M">M（15%）</option>
            <option value="Q">Q（25%）</option>
            <option value="H">H（30%）</option>
          </select>
        </label>
      </div>

      <div class="row">
        <a v-if="dataUrl" class="btn btn--primary" :href="dataUrl" download="qrcode.png">
          {{ t('下载 PNG') }}
        </a>
      </div>

      <p v-if="error" class="error">{{ error }}</p>
    </section>

    <section class="panel qr-panel">
      <div class="qr-box">
        <canvas ref="canvas" />
      </div>
      <p class="hint">{{ t('容错级别越高，二维码越密集但越耐遮挡。') }}</p>
    </section>
  </div>
</template>

<style scoped>
.stack {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.qr-panel {
  align-items: center;
}

.qr-box {
  padding: 16px;
  border-radius: 12px;
  background: #ffffff;
  box-shadow: inset 0 0 0 1px var(--color-border);
}

.qr-box canvas {
  display: block;
  max-width: 100%;
  height: auto;
}
</style>
