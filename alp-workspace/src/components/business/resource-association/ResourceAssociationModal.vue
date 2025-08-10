<template>
  <!-- Modal Overlay -->
  <div 
    v-if="isOpen" 
    class="modal-overlay"
    @click="handleOverlayClick"
  >
    <!-- Modal Content -->
    <div class="modal-content" @click.stop>
      <!-- Modal Header -->
      <div class="modal-header">
        <div class="header-content">
          <h2 class="modal-title">Add Resources to: {{ contextName }}</h2>
          <p class="modal-subtitle">Select existing resources or create new ones</p>
        </div>
        <Button variant="ghost" size="sm" @click="closeModal">
          <X class="h-4 w-4" />
        </Button>
      </div>

      <!-- Tab Navigation -->
      <div class="tab-navigation">
        <button 
          :class="['tab-button', { active: activeTab === 'existing' }]"
          @click="activeTab = 'existing'"
        >
          Existing Resources
        </button>
        <button 
          :class="['tab-button', { active: activeTab === 'create' }]"
          @click="activeTab = 'create'"
        >
          Create New
        </button>
      </div>

      <!-- Tab Content -->
      <div class="tab-content">
        <!-- Existing Resources Tab -->
        <div v-if="activeTab === 'existing'" class="existing-resources-tab">
          <!-- Search and Filters -->
          <div class="search-filters">
            <div class="search-bar">
              <Search class="h-4 w-4 text-gray-400" />
              <input 
                v-model="searchQuery"
                type="text"
                placeholder="Search resources..."
                class="search-input"
              />
            </div>
            
            <div class="filters">
              <select v-model="selectedType" class="filter-select">
                <option value="">All Types</option>
                <option value="document">Documents</option>
                <option value="url">URLs</option>
                <option value="form">Forms</option>
                <option value="emailTemplate">Email Templates</option>
                <option value="video">Videos</option>
                <option value="vdFolder">VD Folders</option>
              </select>
              
              <Button variant="outline" size="sm" @click="refreshResources">
                <RefreshCw class="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>

          <!-- Type Filters -->
          <div class="type-filters">
            <label class="filter-checkbox">
              <input 
                type="checkbox" 
                :checked="isAllSelected"
                @change="toggleSelectAll"
              />
              <span class="checkbox-label">Select All</span>
            </label>
            
            <label class="filter-checkbox">
              <input 
                type="checkbox" 
                value="document"
                v-model="typeFilters"
              />
              <span class="checkbox-label">Documents</span>
            </label>
            
            <label class="filter-checkbox">
              <input 
                type="checkbox" 
                value="url"
                v-model="typeFilters"
              />
              <span class="checkbox-label">URLs</span>
            </label>
            
            <label class="filter-checkbox">
              <input 
                type="checkbox" 
                value="form"
                v-model="typeFilters"
              />
              <span class="checkbox-label">Forms</span>
            </label>
            
            <label class="filter-checkbox">
              <input 
                type="checkbox" 
                value="emailTemplate"
                v-model="typeFilters"
              />
              <span class="checkbox-label">Email</span>
            </label>
            
            <label class="filter-checkbox">
              <input 
                type="checkbox" 
                value="video"
                v-model="typeFilters"
              />
              <span class="checkbox-label">Video</span>
            </label>
            
            <label class="filter-checkbox">
              <input 
                type="checkbox" 
                value="vdFolder"
                v-model="typeFilters"
              />
              <span class="checkbox-label">VD Folder</span>
            </label>
          </div>

          <!-- Resources List -->
          <div class="resources-list">
            <div
              v-for="resource in filteredResources"
              :key="resource.id"
              class="resource-item"
              :class="{ selected: selectedResources.includes(resource.id) }"
              @click="toggleResourceSelection(resource.id)"
            >
              <div class="resource-checkbox">
                <input 
                  type="checkbox"
                  :checked="selectedResources.includes(resource.id)"
                  @change="toggleResourceSelection(resource.id)"
                />
              </div>
              
              <div class="resource-icon">
                <FileText v-if="resource.type === 'document'" class="h-5 w-5 text-blue-600" />
                <Link v-else-if="resource.type === 'url'" class="h-5 w-5 text-green-600" />
                <FileCheck v-else-if="resource.type === 'form'" class="h-5 w-5 text-purple-600" />
                <Mail v-else-if="resource.type === 'emailTemplate'" class="h-5 w-5 text-orange-600" />
                <Video v-else-if="resource.type === 'video'" class="h-5 w-5 text-red-600" />
                <Folder v-else-if="resource.type === 'vdFolder'" class="h-5 w-5 text-gray-600" />
                <FileText v-else class="h-5 w-5 text-gray-600" />
              </div>
              
              <div class="resource-content">
                <h4 class="resource-name">{{ resource.name }}</h4>
                <p class="resource-meta">
                  {{ resource.type }} • {{ getResourceCategory(resource) }} • {{ formatFileSize(resource) }}
                </p>
              </div>
            </div>
          </div>

          <!-- Load More -->
          <div v-if="hasMoreResources" class="load-more">
            <Button variant="outline" @click="loadMoreResources">
              Load More ({{ totalResources - displayedResources.length }} remaining)
            </Button>
          </div>
        </div>

        <!-- Create New Tab -->
        <div v-if="activeTab === 'create'" class="create-new-tab">
          <div class="create-placeholder">
            <div class="placeholder-icon">
              <Plus class="h-12 w-12 text-gray-400" />
            </div>
            <h3 class="placeholder-title">Create New Resource</h3>
            <div class="mt-4 flex items-center gap-3">
              <label class="text-sm text-gray-600">Resource type</label>
              <select v-model="createType" class="border rounded px-2 py-1 text-sm">
                <option value="document">Document</option>
                <option value="url">URL</option>
                <option value="form">Form</option>
                <option value="emailTemplate">Email Template</option>
                <option value="video">Video</option>
                <option value="vdFolder">VD Folder</option>
              </select>
              <Button @click="emit('open-create', createType)">
                <Plus class="h-4 w-4 mr-2" />
                Create
              </Button>
            </div>
            <p class="placeholder-description mt-2 text-gray-500">
              You'll create the resource and it will be associated automatically.
            </p>
          </div>
        </div>
      </div>

      <!-- Modal Footer -->
      <div class="modal-footer">
        <div class="footer-info">
          <span class="selected-count">{{ selectedResources.length }} resources selected</span>
        </div>
        <div class="footer-actions">
          <Button variant="outline" @click="closeModal">
            Cancel
          </Button>
          <Button 
            @click="associateResources"
            :disabled="selectedResources.length === 0"
          >
            Associate Selected ({{ selectedResources.length }})
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { Button } from '@/lib/registry/new-york/ui/button'
import { 
  X, 
  Search, 
  RefreshCw, 
  Plus,
  FileText, 
  Link, 
  FileCheck, 
  Mail, 
  Video, 
  Folder
} from 'lucide-vue-next'
import type { Resource } from '@/alp-types/resources.types'
import { loadAllResources } from '@/alp-data/resources/loadAllResources'

// Props and emits
interface ResourceAssociationModalProps {
  isOpen: boolean
  contextType: 'offering' | 'outcome' | 'component'
  contextName: string
}

const props = defineProps<ResourceAssociationModalProps>()
const emit = defineEmits<{
  close: []
  associate: [resources: Resource[]]
  'open-create': [
    resourceType: 'document' | 'url' | 'form' | 'emailTemplate' | 'video' | 'vdFolder'
  ]
}>()

// Reactive state
const activeTab = ref<'existing' | 'create'>('existing')
const createType = ref<'document' | 'url' | 'form' | 'emailTemplate' | 'video' | 'vdFolder'>('document')
const searchQuery = ref('')
const selectedType = ref('')
const typeFilters = ref<string[]>(['document', 'url', 'form', 'emailTemplate', 'video', 'vdFolder'])
const selectedResources = ref<string[]>([])
const allResources = ref<Resource[]>([])
const displayedResources = ref<Resource[]>([])
const totalResources = ref(0)

// Computed properties
const filteredResources = computed(() => {
  let filtered = displayedResources.value

  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(resource => 
      resource.name.toLowerCase().includes(query) ||
      resource.description?.toLowerCase().includes(query)
    )
  }

  // Apply type filter
  if (selectedType.value) {
    filtered = filtered.filter(resource => resource.type === selectedType.value)
  }

  // Apply checkbox type filters
  if (typeFilters.value.length > 0) {
    filtered = filtered.filter(resource => typeFilters.value.includes(resource.type))
  }

  return filtered
})

const isAllSelected = computed(() => {
  return filteredResources.value.length > 0 && 
         filteredResources.value.every(resource => selectedResources.value.includes(resource.id))
})

const hasMoreResources = computed(() => {
  return displayedResources.value.length < totalResources.value
})

// Methods
const closeModal = () => {
  emit('close')
}

const handleOverlayClick = (event: MouseEvent) => {
  if (event.target === event.currentTarget) {
    closeModal()
  }
}

const toggleResourceSelection = (resourceId: string) => {
  const index = selectedResources.value.indexOf(resourceId)
  if (index > -1) {
    selectedResources.value.splice(index, 1)
  } else {
    selectedResources.value.push(resourceId)
  }
}

const toggleSelectAll = () => {
  if (isAllSelected.value) {
    // Deselect all filtered resources
    filteredResources.value.forEach(resource => {
      const index = selectedResources.value.indexOf(resource.id)
      if (index > -1) {
        selectedResources.value.splice(index, 1)
      }
    })
  } else {
    // Select all filtered resources
    filteredResources.value.forEach(resource => {
      if (!selectedResources.value.includes(resource.id)) {
        selectedResources.value.push(resource.id)
      }
    })
  }
}

const refreshResources = () => {
  loadResources()
}

const loadMoreResources = () => {
  // Simulate loading more resources
  const remaining = allResources.value.slice(displayedResources.value.length, displayedResources.value.length + 10)
  displayedResources.value.push(...remaining)
}

const associateResources = () => {
  const resourcesToAssociate = allResources.value.filter(resource => 
    selectedResources.value.includes(resource.id)
  )
  emit('associate', resourcesToAssociate)
}

const loadResources = async () => {
  // Load unified resources catalog
  const resources = await loadAllResources<Resource>()
  allResources.value = resources
  totalResources.value = allResources.value.length
  displayedResources.value = allResources.value.slice(0, 10) // Initial load
}

const getResourceCategory = (resource: Resource) => {
  // Extract category from metadata tags or use type
  return resource.metadata?.tags?.[0] || resource.type
}

const formatFileSize = (resource: Resource) => {
  const size = resource.metadata?.fileSize
  if (!size) return ''
  
  if (size < 1024) return `${size}B`
  if (size < 1024 * 1024) return `${Math.round(size / 1024)}KB`
  return `${Math.round(size / (1024 * 1024))}MB`
}

// Lifecycle
onMounted(() => {
  loadResources()
})

// Freeze background scroll only while the modal is open
const prevHtmlOverflow = ref<string | null>(null)
const prevBodyOverflow = ref<string | null>(null)

const lockScroll = () => {
  const html = document.documentElement
  const body = document.body
  // Save only once
  if (prevHtmlOverflow.value === null) prevHtmlOverflow.value = html.style.overflow
  if (prevBodyOverflow.value === null) prevBodyOverflow.value = body.style.overflow
  html.style.overflow = 'hidden'
  body.style.overflow = 'hidden'
}

const unlockScroll = () => {
  const html = document.documentElement
  const body = document.body
  if (prevHtmlOverflow.value !== null) html.style.overflow = prevHtmlOverflow.value
  if (prevBodyOverflow.value !== null) body.style.overflow = prevBodyOverflow.value
  prevHtmlOverflow.value = null
  prevBodyOverflow.value = null
}

watch(() => props.isOpen, (open) => {
  if (open) lockScroll()
  else unlockScroll()
}, { immediate: true })

onUnmounted(() => {
  // Ensure scroll is unlocked if component unmounts while open
  unlockScroll()
})
</script>

<style scoped lang="postcss">
.modal-overlay {
  @apply fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4;
}

.modal-content {
  @apply bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col;
}

/* Header */
.modal-header {
  @apply flex items-start justify-between p-6 border-b border-gray-200;
}

.header-content {
  @apply flex-1;
}

.modal-title {
  @apply text-xl font-semibold text-gray-900 mb-1;
}

.modal-subtitle {
  @apply text-sm text-gray-600;
}

/* Tab Navigation */
.tab-navigation {
  @apply flex border-b border-gray-200;
}

.tab-button {
  @apply px-6 py-3 text-sm font-medium text-gray-500 hover:text-gray-700 border-b-2 border-transparent hover:border-gray-300 transition-colors;
}

.tab-button.active {
  @apply text-blue-600 border-blue-600;
}

/* Tab Content */
.tab-content {
  @apply flex-1 overflow-y-auto;
}

.existing-resources-tab {
  @apply h-full flex flex-col;
}

/* Search and Filters */
.search-filters {
  @apply flex items-center justify-between p-4 border-b border-gray-200;
}

.search-bar {
  @apply relative flex-1 max-w-md;
}

.search-bar svg {
  @apply absolute left-3 top-1/2 transform -translate-y-1/2;
}

.search-input {
  @apply w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500;
}

.filters {
  @apply flex items-center space-x-3;
}

.filter-select {
  @apply px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500;
}

/* Type Filters */
.type-filters {
  @apply flex items-center space-x-4 p-4 bg-gray-50 border-b border-gray-200;
}

.filter-checkbox {
  @apply flex items-center space-x-2 cursor-pointer;
}

.filter-checkbox input[type="checkbox"] {
  @apply rounded border-gray-300 text-blue-600 focus:ring-blue-500;
}

.checkbox-label {
  @apply text-sm text-gray-700;
}

/* Resources List */
.resources-list {
  @apply p-4 space-y-2;
}

.resource-item {
  @apply flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors;
}

.resource-item.selected {
  @apply bg-blue-50 border-blue-200;
}

.resource-checkbox input[type="checkbox"] {
  @apply rounded border-gray-300 text-blue-600 focus:ring-blue-500;
}

.resource-icon {
  @apply flex-shrink-0;
}

.resource-content {
  @apply flex-1 min-w-0;
}

.resource-name {
  @apply font-medium text-gray-900 truncate;
}

.resource-meta {
  @apply text-sm text-gray-500;
}

/* Load More */
.load-more {
  @apply p-4 text-center border-t border-gray-200;
}

/* Create New Tab */
.create-new-tab {
  @apply h-full flex items-center justify-center p-8;
}

.create-placeholder {
  @apply text-center;
}

.placeholder-icon {
  @apply flex justify-center mb-4;
}

.placeholder-title {
  @apply text-lg font-medium text-gray-900 mb-2;
}

.placeholder-description {
  @apply text-gray-500 mb-6;
}

/* Footer */
.modal-footer {
  @apply flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50;
}

.footer-info {
  @apply text-sm text-gray-600;
}

.footer-actions {
  @apply flex items-center space-x-3;
}

.selected-count {
  @apply font-medium;
}
</style>
