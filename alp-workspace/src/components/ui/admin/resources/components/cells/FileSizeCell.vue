<template>
  <span class="text-sm text-muted-foreground">
    {{ formattedSize }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  value: number
}

const props = defineProps<Props>()

/**
 * Format file size in bytes to human-readable format
 */
const formattedSize = computed(() => {
  if (!props.value || props.value === 0) return '0 B'
  
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  let size = props.value
  let unitIndex = 0
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }
  
  return `${size.toFixed(size < 10 && unitIndex > 0 ? 1 : 0)} ${units[unitIndex]}`
})
</script>