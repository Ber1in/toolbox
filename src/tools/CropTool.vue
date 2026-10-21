<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useI18n } from '../i18n'

const { t } = useI18n()

const file = ref<File | null>(null)
const sourceUrl = ref('')
const resultUrl = ref('')
const sourceWidth = ref(0)
const sourceHeight = ref(0)
const width = ref(0)
const height = ref(0)
const keepRatio = ref(true)
const mode = ref<'cover' | 'stretch'>('cover')
const error = ref('')

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error(t('图片加载失败')))
    image.src = src
  })
}

async function render() {
  if (!sourceUrl.value || !width.value || !height.value) return

  try {
    const image = await loadImage(sourceUrl.value)
    const canvas = document.createElement('canvas')
    canvas.width = width.value
    canvas.height = height.value

    const context = canvas.getContext('2d')
    if (!context) throw new Error(t('当前浏览器不支持 Canvas'))

    if (mode.value === 'stretch') {
      context.drawImage(image, 0, 0, canvas.width, canvas.height)
    } else {
      // cover: scale proportionally, then crop from the center.
      const scale = Math.max(canvas.width / image.naturalWidth, canvas.height / image.naturalHeight)
      const drawWidth = image.naturalWidth * scale
      const drawHeight = image.naturalHeight * scale
      context.drawImage(
        image,
        (canvas.width - drawWidth) / 2,
        (canvas.height - drawHeight) / 2,
        drawWidth,
        drawHeight,
      )
    }

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'))
    if (!blob) throw new Error(t('裁剪失败'))

    if (resultUrl.value) URL.revokeObjectURL(resultUrl.value)
    resultUrl.value = URL.createObjectURL(blob)
    error.value = ''
  } catch (reason) {
    error.value = reason instanceof Error ? reason.message : String(reason)
  }
}

async function onFileChange(event: Event) {
  const selected = (event.target as HTMLInputElement).files?.[0]
  if (!selected) return

  if (!selected.type.startsWith('image/')) {
    error.value = t('请选择图片文件')
    return
  }

  if (sourceUrl.value) URL.revokeObjectURL(sourceUrl.value)
  if (resultUrl.value) URL.revokeObjectURL(resultUrl.value)

  file.value = selected
  sourceUrl.value = URL.createObjectURL(selected)
  resultUrl.value = ''

  const image = await loadImage(sourceUrl.value)
  sourceWidth.value = image.naturalWidth
  sourceHeight.value = image.naturalHeight
  width.value = image.naturalWidth
  height.value = image.naturalHeight
  await render()
}

watch(width, (value) => {
  if (!keepRatio.value || !sourceWidth.value) return
  height.value = Math.round((value * sourceHeight.value) / sourceWidth.value)
})

watch(height, (value) => {
  if (!keepRatio.value || !sourceHeight.value) return
  width.value = Math.round((value * sourceWidth.value) / sourceHeight.value)
})

const downloadName = computed(() => {
  const base = file.value?.name.replace(/\.[^.]+$/, '') ?? 'image'
  return `${base}-${width.value}x${height.value}.png`
})

onBeforeUnmount(() => {
  if (sourceUrl.value) URL.revokeObjectURL(sourceUrl.value)
  if (resultUrl.value) URL.revokeObjectURL(resultUrl.value)
})
</script>

<template>
  <div class="stack">
    <section class="panel">
      <label class="field">
        <span class="label">{{ t('选择图片') }}</span>
        <input class="input" type="file" accept="image/*" @change="onFileChange" />
      </label>

      <p v-if="sourceWidth" class="hint">
        {{ t('原始尺寸：{w} × {h} px', { w: sourceWidth, h: sourceHeight }) }}
      </p>

      <div class="cols">
        <label class="field">
          <span class="label">{{ t('输出宽度（px）') }}</span>
          <input v-model.number="width" class="input" type="number" min="1" step="1" />
        </label>

        <label class="field">
          <span class="label">{{ t('输出高度（px）') }}</span>
          <input v-model.number="height" class="input" type="number" min="1" step="1" />
        </label>
      </div>

      <div class="row">
        <label class="checkbox">
          <input v-model="keepRatio" type="checkbox" />
          {{ t('保持原始比例') }}
        </label>

        <div class="segmented">
          <button :class="{ 'is-active': mode === 'cover' }" type="button" @click="mode = 'cover'">
            {{ t('居中裁剪') }}
          </button>
          <button :class="{ 'is-active': mode === 'stretch' }" type="button" @click="mode = 'stretch'">
            {{ t('拉伸') }}
          </button>
        </div>
      </div>

      <div class="row">
        <button class="btn btn--primary" type="button" :disabled="!file" @click="render">
          {{ t('应用裁剪') }}
        </button>
        <a v-if="resultUrl" class="btn" :href="resultUrl" :download="downloadName">{{ t('下载 PNG') }}</a>
      </div>

      <p v-if="error" class="error">{{ error }}</p>
    </section>

    <section v-if="resultUrl" class="panel">
      <img class="result" :src="resultUrl" :alt="t('裁剪结果预览')" />
    </section>
  </div>
</template>

<style scoped>
.stack {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.result {
  width: 100%;
  max-height: 420px;
  object-fit: contain;
  border-radius: 10px;
  background: var(--color-chip);
}
</style>
