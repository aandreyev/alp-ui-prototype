<template>
  <div class="text-sm">
    <div class="text-foreground">{{ formattedDate }}</div>
    <div v-if="showTime" class="text-muted-foreground text-xs">{{ formattedTime }}</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  value: string | Date
  showTime?: boolean
  format?: 'short' | 'medium' | 'long' | 'relative'
}

const props = withDefaults(defineProps<Props>(), {
  showTime: false,
  format: 'medium'
})

/**
 * Parse date value
 */
const date = computed(() => {
  if (!props.value) return null
  return new Date(props.value)
})

/**
 * Format date based on specified format
 */
const formattedDate = computed(() => {
  if (!date.value || isNaN(date.value.getTime())) return '—'
  
  const now = new Date()
  const diffMs = now.getTime() - date.value.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  
  // Relative format
  if (props.format === 'relative') {
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
    return `${Math.floor(diffDays / 365)} years ago`
  }
  
  // Standard formats
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: props.format === 'short' ? 'short' : 'long',
    day: 'numeric'
  }
  
  if (props.format === 'short') {
    options.month = 'short'
  } else if (props.format === 'long') {
    options.weekday = 'long'
  }
  
  return new Intl.DateTimeFormat('en-US', options).format(date.value)
})

/**
 * Format time if needed
 */
const formattedTime = computed(() => {
  if (!date.value || !props.showTime) return ''
  
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  }).format(date.value)
})
</script>