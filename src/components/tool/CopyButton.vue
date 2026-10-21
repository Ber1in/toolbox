<script setup lang="ts">
import { Check, Copy } from 'lucide-vue-next'
import { useCopy } from '../../composables/useCopy'
import { useI18n } from '../../i18n'

const { t } = useI18n()

const props = withDefaults(
  defineProps<{
    text: string
    label?: string
  }>(),
  { label: '' },
)

const { copied, copy } = useCopy()
</script>

<template>
  <button class="btn btn--sm" type="button" :disabled="!props.text" @click="copy(props.text)">
    <Check v-if="copied" :size="14" :stroke-width="2" />
    <Copy v-else :size="14" :stroke-width="2" />
    {{ copied ? t('已复制') : t(props.label || '复制') }}
  </button>
</template>
