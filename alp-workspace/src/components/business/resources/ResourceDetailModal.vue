<template>
  <div v-if="visible" class="fixed inset-0 z-50 flex items-center justify-center">
    <!-- Backdrop -->
    <div 
      class="fixed inset-0 bg-black/50 backdrop-blur-sm"
      @click="$emit('close')"
    ></div>
    
    <!-- Modal Content -->
    <div class="relative bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-auto">
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b">
        <h2 class="text-lg font-semibold text-gray-900">Resource Details</h2>
        <button
          @click="$emit('close')"
          class="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X class="h-5 w-5" />
        </button>
      </div>
      
      <!-- Content: Just the ResourceCard -->
      <div class="p-6">
        <ResourceCard
          v-if="resource"
          :resource="resource"
          :compact="false"
          @click="handleResourceClick"
          @action="handleResourceAction"
        />
      </div>
      
      <!-- Footer Actions -->
      <div class="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
        <Button variant="outline" @click="$emit('close')">
          Close
        </Button>
        <Button @click="openResource" class="bg-blue-600 hover:bg-blue-700">
          <ExternalLink class="h-4 w-4 mr-2" />
          Open Resource
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { X, ExternalLink } from 'lucide-vue-next'
import ResourceCard from './ResourceCard.vue'
import { Button } from '@/lib/registry/new-york/ui/button'
import { Badge } from '@/lib/registry/new-york/ui/badge'
import type { Resource } from '@/alp-types/resources.types'

// Props
interface Props {
  visible: boolean
  resource: Resource | null
}

const props = defineProps<Props>()

// Events
const emit = defineEmits<{
  close: []
  action: [action: string, resource: Resource]
}>()

// Methods
const handleResourceClick = (resource: Resource) => {
  // Handle resource card click if needed
  console.log('Resource card clicked:', resource.name)
}

const handleResourceAction = (action: string, resource: Resource) => {
  emit('action', action, resource)
}

const openResource = () => {
  if (props.resource) {
    // Handle different resource types
    switch (props.resource.type) {
      case 'url':
        window.open(props.resource.url, '_blank')
        break
      case 'document':
      case 'form':
      case 'template':
        // For documents, forms, and templates, open in new tab or download
        window.open(props.resource.url, '_blank')
        break
      default:
        console.log('Opening resource:', props.resource.name)
    }
    emit('action', 'open', props.resource)
  }
}

const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-AU', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return dateString
  }
}
</script>

<style scoped>
/* Modal animations could be added here */
</style>
