<template>
  <div v-if="visible" class="fixed inset-0 z-50 flex items-center justify-center">
    <!-- Backdrop -->
    <div 
      class="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
      @click="$emit('close')"
    ></div>
    
    <!-- Modal -->
    <div class="relative bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] flex flex-col">
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
        <div>
          <h2 class="text-xl font-semibold text-gray-900">{{ component?.title || 'Component Resources' }}</h2>
          <p class="text-sm text-gray-600 mt-1">
            {{ filteredResources.length }} of {{ totalResources }} resources
          </p>
        </div>
        <button
          @click="$emit('close')"
          class="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X class="h-6 w-6" />
        </button>
      </div>

      <!-- Search and Filter Controls -->
      <div class="p-6 border-b border-gray-200 bg-gray-50 flex-shrink-0">
        <div class="flex flex-col sm:flex-row gap-4">
          <!-- Search -->
          <div class="relative flex-1">
            <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              v-model="searchQuery"
              placeholder="Search resources..."
              class="pl-10"
            />
          </div>
          
          <!-- Type Filter -->
          <div class="flex items-center gap-2">
            <label class="text-sm font-medium text-gray-700">Filter by type:</label>
            <select 
              v-model="selectedType" 
              class="px-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Types</option>
              <option v-for="type in availableTypes" :key="type" :value="type">
                {{ formatTypeName(type) }}
              </option>
            </select>
          </div>
        </div>
      </div>

      <!-- Resources Content -->
      <div class="flex-1 overflow-y-auto p-6 min-h-0">
        <div v-if="filteredResources.length === 0" class="text-center py-12">
          <FileX class="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 class="text-lg font-medium text-gray-900 mb-2">No resources found</h3>
          <p class="text-gray-600">
            {{ searchQuery || selectedType !== 'all' 
              ? 'Try adjusting your search or filter criteria.' 
              : 'No resources are associated with this component.' 
            }}
          </p>
        </div>

        <!-- Resources Grouped by Type -->
        <div v-else class="space-y-6">
          <div
            v-for="(resources, type) in groupedResources"
            :key="type"
            class="resource-type-group"
          >
            <!-- Type Header -->
            <div class="type-header">
              <div class="flex items-center gap-3">
                <component :is="getResourceIcon(type)" class="h-5 w-5 text-gray-600" />
                <h3 class="text-lg font-medium text-gray-900">
                  {{ formatTypeName(type) }}
                </h3>
                <Badge variant="secondary" class="text-xs">
                  {{ resources.length }}
                </Badge>
              </div>
            </div>

            <!-- Resources of this type -->
            <div class="resource-type-content">
              <div class="space-y-3">
                <ResourceCard
                  v-for="resource in resources"
                  :key="resource.id"
                  :resource="resource"
                  :compact="false"
                  @click="handleResourceClick"
                  @action="handleResourceAction"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="flex items-center justify-center p-6 border-t border-gray-200 bg-gray-50">
        <Button variant="outline" @click="$emit('close')">
          Close
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Button } from '@/lib/registry/new-york/ui/button'
import { Input } from '@/lib/registry/new-york/ui/input'
import { Badge } from '@/lib/registry/new-york/ui/badge'
import { 
  X, 
  Search, 
  FileText, 
  Link, 
  File, 
  FileX,
  Info,
  ExternalLink,
  Plus,
  Folder,
  Image,
  Video,
  Archive,
  Eye,
  Copy,
  Download
} from 'lucide-vue-next'
import type { Resource } from '@/alp-types/resources.types'
import ResourceCard from './ResourceCard.vue'

// Enhanced component interface
interface EnhancedComponent {
  id: string
  title: string
  status: 'pending' | 'in-progress' | 'completed'
  units: { completed: number, total: number }
  dueDate?: Date
  resources: Resource[]
}

// Props
interface Props {
  visible: boolean
  component?: EnhancedComponent | null
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  component: null
})

// Emits
const emit = defineEmits<{
  close: []
  resourceAction: [action: string, resource: Resource]
}>()

// Reactive state
const searchQuery = ref('')
const selectedType = ref('all')

// Computed properties
const totalResources = computed(() => props.component?.resources?.length || 0)

const availableTypes = computed(() => {
  if (!props.component?.resources) return []
  const types = new Set(props.component.resources.map(r => r.type))
  return Array.from(types).sort()
})

const filteredResources = computed(() => {
  if (!props.component?.resources) return []
  
  let resources = props.component.resources
  
  // Filter by type
  if (selectedType.value !== 'all') {
    resources = resources.filter(r => r.type === selectedType.value)
  }
  
  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    resources = resources.filter(r => 
      r.name.toLowerCase().includes(query) ||
      r.description?.toLowerCase().includes(query) ||
      r.metadata.tags?.some(tag => tag.toLowerCase().includes(query)) ||
      r.metadata.author?.toLowerCase().includes(query)
    )
  }
  
  return resources
})

const groupedResources = computed(() => {
  const groups: Record<string, Resource[]> = {}
  
  filteredResources.value.forEach(resource => {
    if (!groups[resource.type]) {
      groups[resource.type] = []
    }
    groups[resource.type].push(resource)
  })
  
  // Sort resources within each group by name
  Object.keys(groups).forEach(type => {
    groups[type].sort((a, b) => a.name.localeCompare(b.name))
  })
  
  return groups
})

// Methods
const getResourceIcon = (type: string) => {
  const icons = {
    form: FileText,
    document: File,
    template: FileText,
    url: Link,
    folder: Folder,
    image: Image,
    video: Video,
    archive: Archive
  }
  return icons[type as keyof typeof icons] || FileText
}

const formatTypeName = (type: string) => {
  const typeNames = {
    form: 'Forms',
    document: 'Documents',
    template: 'Templates',
    url: 'URLs',
    folder: 'Folders',
    image: 'Images',
    video: 'Videos',
    archive: 'Archives'
  }
  return typeNames[type as keyof typeof typeNames] || type.charAt(0).toUpperCase() + type.slice(1)
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString()
}

const openResourceDetail = (resource: Resource) => {
  emit('resourceAction', 'detail', resource)
}

const openResource = (resource: Resource) => {
  // Handle different resource types
  switch (resource.type) {
    case 'url':
      window.open(resource.url, '_blank')
      break
    case 'document':
    case 'form':
    case 'template':
      window.open(resource.url, '_blank')
      break
    default:
      console.log('Opening resource:', resource.name)
  }
  
  emit('resourceAction', 'open', resource)
}

const formatDetailedDate = (dateString: string) => {
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

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const formatCompactDate = (dateString: string) => {
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-AU', { 
      day: '2-digit', 
      month: '2-digit', 
      year: '2-digit'
    })
  } catch {
    return dateString
  }
}

const handleResourceClick = (resource: Resource) => {
  // When ResourceCard is clicked, emit detail action
  emit('resourceAction', 'detail', resource)
}

const handleResourceAction = (action: string, resource: Resource) => {
  console.log('Resource action:', action, resource.name)
  emit('resourceAction', action, resource)
}

const addNewResource = () => {
  emit('resourceAction', 'add', {} as Resource)
}

// Reset filters when component changes
watch(() => props.component, () => {
  searchQuery.value = ''
  selectedType.value = 'all'
})
</script>

<style scoped>
/* Resource Type Groups */
.resource-type-group {
  @apply border border-gray-200 rounded-lg bg-gray-50 shadow-sm;
}

.type-header {
  @apply p-4 border-b border-gray-200 bg-gray-100;
}

.resource-type-content {
  @apply p-4;
}

/* Individual Resource Cards */
.resource-item-card {
  @apply p-4 bg-white border border-gray-200 rounded-md shadow-sm hover:shadow-md transition-shadow;
}

.resource-icon {
  @apply h-4 w-4 text-gray-600 flex-shrink-0;
}

.resource-name {
  @apply font-medium text-gray-900 text-sm mb-1;
}

.resource-description {
  @apply text-sm text-gray-600 mb-2 line-clamp-2;
}

.resource-metadata {
  @apply flex flex-wrap gap-2 text-xs text-gray-500 mb-2;
}

.metadata-item {
  @apply bg-gray-100 px-2 py-1 rounded;
}

.resource-tags {
  @apply flex flex-wrap gap-1 items-center;
}

.resource-actions {
  @apply flex items-center gap-2 flex-shrink-0;
}

/* Detailed Metadata Grid */
.metadata-grid {
  @apply grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200;
}

.metadata-field {
  @apply space-y-1;
}

.metadata-label {
  @apply text-xs font-medium text-gray-600;
}

.metadata-value {
  @apply text-sm text-gray-900;
}

/* Compact Metadata Row */
.compact-metadata {
  @apply flex flex-wrap gap-2;
}

.metadata-chip {
  @apply bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-mono;
}

/* Compact Action Buttons Grid */
.compact-actions-grid {
  @apply grid grid-cols-4 gap-2;
}

.compact-action-button {
  @apply text-xs px-2 py-1.5 h-auto justify-center;
}

/* Legacy styles for backward compatibility */
.resource-actions-grid {
  @apply grid grid-cols-2 gap-3;
}

.action-button {
  @apply justify-start h-auto p-3;
}

.action-text {
  @apply text-left;
}

.action-title {
  @apply font-medium text-sm;
}

.action-subtitle {
  @apply text-xs text-gray-500;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .resource-item-card {
    @apply flex-col space-y-3;
  }
  
  .resource-actions {
    @apply w-full justify-end;
  }
  
  .metadata-grid {
    @apply grid-cols-1;
  }
  
  .resource-actions-grid {
    @apply grid-cols-1;
  }
  
  .compact-actions-grid {
    @apply grid-cols-2;
  }
}

@media (max-width: 480px) {
  .compact-actions-grid {
    @apply grid-cols-1;
  }
}
</style>
