<template>
  <div class="flex items-center gap-2 min-w-0">
    <a 
      v-if="url"
      :href="url"
      target="_blank"
      rel="noopener noreferrer"
      class="text-sm text-primary hover:text-primary/80 underline underline-offset-4 truncate max-w-[200px]"
      :title="url"
    >
      {{ displayText }}
    </a>
    <span v-else class="text-sm text-muted-foreground">—</span>
    
    <ExternalLink 
      v-if="url && showIcon" 
      class="w-3 h-3 text-muted-foreground flex-shrink-0" 
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ExternalLink } from 'lucide-vue-next'

interface Props {
  value: string
  showIcon?: boolean
  maxLength?: number
  showDomain?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showIcon: true,
  maxLength: 40,
  showDomain: false
})

/**
 * Ensure URL is valid
 */
const url = computed(() => {
  if (!props.value) return ''
  
  // Add protocol if missing
  if (!props.value.startsWith('http://') && !props.value.startsWith('https://')) {
    return `https://${props.value}`
  }
  
  return props.value
})

/**
 * Display text for the link
 */
const displayText = computed(() => {
  if (!url.value) return ''
  
  try {
    const urlObj = new URL(url.value)
    
    if (props.showDomain) {
      return urlObj.hostname
    }
    
    // Use the original value but truncate if needed
    let text = props.value
    if (text.length > props.maxLength) {
      text = text.substring(0, props.maxLength - 3) + '...'
    }
    
    return text
  } catch {
    // If URL parsing fails, use original value with truncation
    let text = props.value
    if (text.length > props.maxLength) {
      text = text.substring(0, props.maxLength - 3) + '...'
    }
    return text
  }
})
</script>