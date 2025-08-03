<template>
  <div class="text-sm text-foreground font-mono flex items-center gap-2 min-w-0">
    <FolderOpen class="w-4 h-4 text-muted-foreground flex-shrink-0" />
    <span 
      class="truncate max-w-[200px]" 
      :title="value"
    >
      {{ displayPath }}
    </span>
    <Button 
      v-if="value && copySupported"
      variant="ghost" 
      size="sm"
      @click="copyPath"
      class="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
      :title="copyButtonTitle"
    >
      <Copy v-if="!copied" class="w-3 h-3" />
      <Check v-else class="w-3 h-3 text-green-600" />
    </Button>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { FolderOpen, Copy, Check } from 'lucide-vue-next'
import { Button } from '@/lib/registry/new-york/ui/button'

interface Props {
  value: string
  maxLength?: number
  showCopyButton?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  maxLength: 40,
  showCopyButton: true
})

// State
const copied = ref(false)

/**
 * Check if clipboard API is supported
 */
const copySupported = computed(() => {
  return typeof navigator !== 'undefined' && !!navigator.clipboard
})

/**
 * Display path with truncation
 */
const displayPath = computed(() => {
  if (!props.value) return '—'
  
  if (props.value.length <= props.maxLength) {
    return props.value
  }
  
  // Intelligent truncation for paths
  const parts = props.value.split('/')
  if (parts.length <= 2) {
    // Simple truncation for short paths
    return props.value.substring(0, props.maxLength - 3) + '...'
  }
  
  // For longer paths, show start and end
  const start = parts.slice(0, 2).join('/')
  const end = parts.slice(-1)[0]
  const middle = '...'
  
  const result = `${start}/${middle}/${end}`
  if (result.length <= props.maxLength) {
    return result
  }
  
  // Still too long, do simple truncation
  return props.value.substring(0, props.maxLength - 3) + '...'
})

/**
 * Copy button title
 */
const copyButtonTitle = computed(() => {
  return copied.value ? 'Copied!' : 'Copy path'
})

/**
 * Copy path to clipboard
 */
async function copyPath() {
  if (!props.value || !copySupported.value) return
  
  try {
    await navigator.clipboard.writeText(props.value)
    copied.value = true
    
    // Reset copied state after 2 seconds
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch (error) {
    console.error('Failed to copy path:', error)
  }
}
</script>

<style scoped>
/* Make sure the parent has group class for hover effects to work */
</style>