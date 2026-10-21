<script setup lang="ts">
import { Check, Copy } from 'lucide-vue-next'
import { useCopy } from '../../composables/useCopy'

const props = withDefaults(
  defineProps<{
    text: string
    label?: string
  }>(),
  { label: '复制' },
)

const { copied, copy } = useCopy()
</script>

<template>
  <button class="btn btn--sm" type="button" :disabled="!props.text" @click="copy(props.text)">
    <Check v-if="copied" :size="14" :stroke-width="2" />
    <Copy v-else :size="14" :stroke-width="2" />
    {{ copied ? '已复制' : props.label }}
  </button>
</template>
