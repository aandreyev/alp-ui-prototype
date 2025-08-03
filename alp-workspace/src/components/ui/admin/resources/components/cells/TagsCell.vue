<template>
  <div class="flex items-center gap-1 min-w-0">
    <div v-if="visibleTags.length === 0" class="text-sm text-muted-foreground">—</div>
    
    <template v-else>
      <Badge 
        v-for="tag in visibleTags" 
        :key="tag"
        variant="secondary" 
        class="text-xs px-2 py-0 h-5"
      >
        {{ tag }}
      </Badge>
      
      <Badge 
        v-if="hiddenCount > 0"
        variant="outline" 
        class="text-xs px-2 py-0 h-5 text-muted-foreground"
        :title="`${hiddenCount} more tags: ${hiddenTags.join(', ')}`"
      >
        +{{ hiddenCount }}
      </Badge>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Badge } from '@/lib/registry/new-york/ui/badge'

interface Props {
  value: string[]
  maxVisible?: number
}

const props = withDefaults(defineProps<Props>(), {
  maxVisible: 3
})

/**
 * Tags that will be visible
 */
const visibleTags = computed(() => {
  if (!props.value || !Array.isArray(props.value)) return []
  return props.value.slice(0, props.maxVisible)
})

/**
 * Tags that are hidden due to space constraints
 */
const hiddenTags = computed(() => {
  if (!props.value || !Array.isArray(props.value)) return []
  return props.value.slice(props.maxVisible)
})

/**
 * Number of hidden tags
 */
const hiddenCount = computed(() => hiddenTags.value.length)
</script>