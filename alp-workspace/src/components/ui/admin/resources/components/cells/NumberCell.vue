<template>
  <span class="text-sm text-foreground">
    {{ formattedNumber }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  value: number | string
  format?: 'default' | 'compact' | 'currency' | 'percentage'
  decimals?: number
}

const props = withDefaults(defineProps<Props>(), {
  format: 'default',
  decimals: 0
})

/**
 * Format number based on specified format
 */
const formattedNumber = computed(() => {
  const num = typeof props.value === 'string' ? parseFloat(props.value) : props.value
  
  if (isNaN(num)) return '—'
  
  switch (props.format) {
    case 'compact':
      // Format large numbers compactly (1K, 1M, etc.)
      if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
      if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
      return num.toString()
      
    case 'currency':
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: props.decimals,
        maximumFractionDigits: props.decimals
      }).format(num)
      
    case 'percentage':
      return new Intl.NumberFormat('en-US', {
        style: 'percent',
        minimumFractionDigits: props.decimals,
        maximumFractionDigits: props.decimals
      }).format(num / 100)
      
    default:
      return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: props.decimals,
        maximumFractionDigits: props.decimals
      }).format(num)
  }
})
</script>