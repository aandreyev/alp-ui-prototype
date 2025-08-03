<template>
  <span class="text-sm text-foreground">
    {{ formattedDuration }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  value: number // Duration in seconds
  format?: 'short' | 'long' | 'minimal'
}

const props = withDefaults(defineProps<Props>(), {
  format: 'short'
})

/**
 * Format duration in seconds to human-readable format
 */
const formattedDuration = computed(() => {
  if (!props.value || props.value <= 0) return '—'
  
  const hours = Math.floor(props.value / 3600)
  const minutes = Math.floor((props.value % 3600) / 60)
  const seconds = props.value % 60
  
  if (props.format === 'minimal') {
    // Just show the most significant unit
    if (hours > 0) return `${hours}h`
    if (minutes > 0) return `${minutes}m`
    return `${seconds}s`
  }
  
  if (props.format === 'long') {
    // Full text format
    const parts: string[] = []
    if (hours > 0) parts.push(`${hours} hour${hours !== 1 ? 's' : ''}`)
    if (minutes > 0) parts.push(`${minutes} minute${minutes !== 1 ? 's' : ''}`)
    if (seconds > 0 && hours === 0) parts.push(`${seconds} second${seconds !== 1 ? 's' : ''}`)
    
    if (parts.length === 0) return '0 seconds'
    if (parts.length === 1) return parts[0]
    if (parts.length === 2) return `${parts[0]} and ${parts[1]}`
    return `${parts.slice(0, -1).join(', ')}, and ${parts[parts.length - 1]}`
  }
  
  // Default 'short' format: HH:MM:SS or MM:SS
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }
  
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
})
</script>