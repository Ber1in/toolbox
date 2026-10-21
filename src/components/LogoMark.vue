<script setup lang="ts">
withDefaults(defineProps<{ size?: number }>(), { size: 18.67 })
</script>

<template>
  <svg
    :width="size"
    :height="size * (11.67 / 18.67)"
    viewBox="0 0 18.67 11.67"
    fill="none"
    aria-hidden="true"
    focusable="false"
  >
    <path
      d="M1 1h16.67M1 5.83h16.67M1 10.67h10.4"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
    />
  </svg>
</template>
