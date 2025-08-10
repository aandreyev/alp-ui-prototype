<template>
    <div 
      class="resource-summary"
      @click="handleClick"
      :class="{ 'cursor-pointer hover:bg-gray-50': clickable }"
    >
      <div class="flex items-center space-x-3">
        <!-- Resource Icon -->
        <component 
          :is="resourceIcon" 
          class="resource-icon"
        />
        
        <!-- Resource Content -->
        <div class="flex-1 min-w-0">
          <h4 class="resource-name">{{ resource.name }}</h4>
          <p v-if="resource.description" class="resource-description">
            {{ resource.description }}
          </p>
          
          <!-- Tags (if shown) -->
          <div v-if="showTags && resource.metadata?.tags?.length" class="resource-tags">
            <span 
              v-for="tag in resource.metadata.tags.slice(0, maxTags)" 
              :key="tag"
              class="resource-tag"
            >
              {{ tag }}
            </span>
            <span v-if="resource.metadata.tags.length > maxTags" class="resource-tag-more">
              +{{ resource.metadata.tags.length - maxTags }}
            </span>
          </div>
        </div>
        
        <!-- Actions -->
        <div class="resource-actions" @click.stop>
          <button
            v-for="action in visibleActions"
            :key="action"
            @click="handleAction(action)"
            class="action-button"
            :title="getActionTitle(action)"
          >
            <component :is="getActionIcon(action)" class="w-4 h-4" />
          </button>
          
          <!-- More actions dropdown if needed -->
          <button
            v-if="actions.length > maxVisibleActions"
            @click="toggleMoreActions"
            class="action-button"
            title="More actions"
          >
            <MoreHorizontal class="w-4 h-4" />
          </button>
        </div>
      </div>
      
      
    </div>
  </template>
  
  <script setup lang="ts">
  import { computed } from 'vue'
  import { 
  FileText, 
  Link, 
  Eye, 
  ExternalLink, 
  Copy, 
  MoreHorizontal,
  Play,
  Trash2,
  File,
  CheckSquare,
  Mail,
  Video,
  FolderOpen
} from 'lucide-vue-next'
  
  import type { Resource } from '@/alp-types/resources.types'
  
  // Props
  interface Props {
    resource: Resource
    actions?: string[]
    maxVisibleActions?: number
    hierarchyPath?: string
    showHierarchyPath?: boolean
    showTags?: boolean
    maxTags?: number
    clickable?: boolean
  }
  
  const props = withDefaults(defineProps<Props>(), {
    actions: () => ['preview', 'open', 'copy'],
    maxVisibleActions: 3,
    showHierarchyPath: false,
    showTags: true,
    maxTags: 3,
    clickable: true
  })
  
  // Events
  const emit = defineEmits<{
    click: [resource: Resource]
    action: [action: string, resource: Resource]
  }>()
  
  // Computed
  const resourceIcon = computed(() => {
  switch (props.resource.type) {
    case 'form':
      return CheckSquare
    case 'document':
      return File
    case 'url':
      return Link
    case 'template':
    case 'emailTemplate':
      return Mail
    case 'video':
      return Video
    case 'vdFolder':
      return FolderOpen
    default:
      return FileText
  }
})
  
  const visibleActions = computed(() => {
    return props.actions.slice(0, props.maxVisibleActions)
  })
  
  // Methods
  const getActionIcon = (action: string) => {
    const icons = {
      preview: Eye,
      open: ExternalLink,
      copy: Copy,
      play: Play,
      delete: Trash2
    }
    return icons[action as keyof typeof icons] || Eye
  }
  
  const getActionTitle = (action: string) => {
    const titles = {
      preview: 'Preview resource',
      open: 'Open resource',
      copy: 'Copy link',
      play: 'Play video',
      delete: 'Delete resource'
    }
    return titles[action as keyof typeof titles] || action
  }
  
  const handleClick = () => {
    if (props.clickable) {
      emit('click', props.resource)
    }
  }
  
  const handleAction = (action: string) => {
    emit('action', action, props.resource)
  }
  
  const toggleMoreActions = () => {
    // Could implement dropdown menu for additional actions
    console.log('More actions for', props.resource.name)
  }
  </script>
  
  <style scoped>
  .resource-summary {
  @apply p-3 bg-blue-50 border border-blue-200 rounded-md shadow-sm hover:shadow-md hover:bg-blue-100 transition-all cursor-pointer;
}
  
  
  
  .resource-icon {
  @apply h-5 w-5 text-blue-600 flex-shrink-0;
}
  
  .resource-name {
    @apply text-sm font-medium text-gray-800 truncate;
  }
  
  .resource-description {
    @apply text-xs text-gray-600 mt-1 line-clamp-2;
  }
  
  .resource-tags {
    @apply flex items-center gap-1 mt-2;
  }
  
  .resource-tag {
    @apply inline-block px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded;
  }
  
  .resource-tag-more {
    @apply inline-block px-2 py-1 text-xs bg-gray-200 text-gray-600 rounded;
  }
  
  .resource-actions {
    @apply flex space-x-1 flex-shrink-0;
  }
  
  .action-button {
  @apply p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors;
}
  
  
  
  /* Tailwind line-clamp utility */
.line-clamp-2 {
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
}
  </style>