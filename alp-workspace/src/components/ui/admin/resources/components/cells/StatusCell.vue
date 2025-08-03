<template>
  <Badge :variant="badgeVariant" class="text-xs">
    <div v-if="showIcon" :class="iconClass" class="w-2 h-2 rounded-full mr-1.5"></div>
    {{ displayText }}
  </Badge>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Badge } from '@/lib/registry/new-york/ui/badge'

interface Props {
  value: string
  type?: 'general' | 'health' | 'sync' | 'publish'
  showIcon?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'general',
  showIcon: true
})

/**
 * Status configuration by type
 */
const statusConfig = {
  general: {
    active: { variant: 'default', text: 'Active', icon: 'bg-green-500' },
    inactive: { variant: 'secondary', text: 'Inactive', icon: 'bg-gray-400' },
    draft: { variant: 'outline', text: 'Draft', icon: 'bg-yellow-500' },
    archived: { variant: 'secondary', text: 'Archived', icon: 'bg-gray-400' }
  },
  health: {
    healthy: { variant: 'default', text: 'Healthy', icon: 'bg-green-500' },
    warning: { variant: 'destructive', text: 'Warning', icon: 'bg-yellow-500' },
    error: { variant: 'destructive', text: 'Error', icon: 'bg-red-500' },
    unknown: { variant: 'secondary', text: 'Unknown', icon: 'bg-gray-400' }
  },
  sync: {
    synced: { variant: 'default', text: 'Synced', icon: 'bg-green-500' },
    syncing: { variant: 'outline', text: 'Syncing', icon: 'bg-blue-500' },
    error: { variant: 'destructive', text: 'Sync Error', icon: 'bg-red-500' },
    pending: { variant: 'secondary', text: 'Pending', icon: 'bg-yellow-500' }
  },
  publish: {
    published: { variant: 'default', text: 'Published', icon: 'bg-green-500' },
    draft: { variant: 'outline', text: 'Draft', icon: 'bg-yellow-500' },
    scheduled: { variant: 'secondary', text: 'Scheduled', icon: 'bg-blue-500' },
    unpublished: { variant: 'secondary', text: 'Unpublished', icon: 'bg-gray-400' }
  }
} as const

/**
 * Get status configuration
 */
const statusInfo = computed(() => {
  const config = statusConfig[props.type]
  const status = props.value?.toLowerCase() || 'unknown'
  
  // Find exact match or fallback
  return config[status as keyof typeof config] || 
         config.unknown || 
         { variant: 'secondary', text: props.value || 'Unknown', icon: 'bg-gray-400' }
})

/**
 * Badge variant
 */
const badgeVariant = computed(() => statusInfo.value.variant as 'default' | 'secondary' | 'destructive' | 'outline')

/**
 * Display text
 */
const displayText = computed(() => statusInfo.value.text)

/**
 * Icon class
 */
const iconClass = computed(() => statusInfo.value.icon)
</script>