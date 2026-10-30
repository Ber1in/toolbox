<script setup lang="ts">
import { useI18n } from '../i18n'

const { t } = useI18n()
</script>

<template>
  <section class="md-tool">
    <p class="panel__hint">{{ t('加载中') }}</p>
  </section>
</template>
