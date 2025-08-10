<template>
  <!-- Drawer Overlay -->
  <div 
    v-if="isOpen" 
    class="component-designer-overlay"
    @click="handleOverlayClick"
  >
    <!-- Drawer Content -->
    <div class="component-designer-drawer" @click.stop>
      <!-- Header Section -->
      <div class="drawer-header">
        <div class="header-left">
          <Button variant="ghost" size="sm" @click="closeDrawer" class="back-button">
            <ArrowLeft class="h-4 w-4 mr-2" />
            Back to Offering
          </Button>
          <div class="component-breadcrumb">
            <span class="breadcrumb-text">Component Designer:</span>
            <input 
              v-model="localComponent.name" 
              class="component-name-input"
              @blur="updateComponentName"
              @keydown.enter.prevent="($event.target as HTMLInputElement)?.blur()"
            />
          </div>
        </div>
        
        <div class="header-right">
          <Button variant="outline" size="sm" @click="saveComponent">
            <Save class="h-4 w-4 mr-2" />
            Save
          </Button>
          <Button variant="ghost" size="sm" @click="closeDrawer">
            <X class="h-4 w-4 mr-2" />
            Cancel
          </Button>
        </div>
      </div>

      <!-- Component Type and Template Info -->
      <div class="component-meta">
        <div class="meta-item">
          <label class="meta-label">Component Type:</label>
          <select v-model="localComponent.type" class="meta-select">
            <option value="task">Task</option>
            <option value="deliverable">Deliverable</option>
            <option value="milestone">Milestone</option>
            <option value="review">Review</option>
          </select>
        </div>
        <div class="meta-item">
          <label class="meta-label">Template:</label>
          <span class="meta-value">{{ localComponent.templateName || 'Custom Component' }}</span>
        </div>
      </div>

      <!-- Main Content Area -->
      <div class="drawer-content">
        <!-- Component Details Section -->
        <div class="details-section">
          <h3 class="section-title">Component Information</h3>
          <div class="details-form">
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Name</label>
                <input 
                  v-model="localComponent.name" 
                  class="form-input"
                  placeholder="Enter component name"
                />
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-group full-width">
                <label class="form-label">Description</label>
                <textarea 
                  v-model="localComponent.description" 
                  class="form-textarea"
                  rows="3"
                  placeholder="Enter component description"
                />
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Type</label>
                <select v-model="localComponent.type" class="form-select">
                  <option value="task">Task</option>
                  <option value="deliverable">Deliverable</option>
                  <option value="milestone">Milestone</option>
                  <option value="review">Review</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Estimated Units</label>
                <input 
                  v-model.number="localComponent.units" 
                  type="number"
                  class="form-input"
                  placeholder="0"
                />
              </div>
              <div class="form-group">
                <label class="form-label">Budget ($)</label>
                <input 
                  v-model.number="localComponent.budget" 
                  type="number"
                  class="form-input"
                  placeholder="0"
                />
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Law Sub-Area</label>
                <select v-model="localComponent.lawSubArea" class="form-select">
                  <option value="intellectual-property">Intellectual Property</option>
                  <option value="commercial-law">Commercial Law</option>
                  <option value="contract-law">Contract Law</option>
                  <option value="corporate-law">Corporate Law</option>
                </select>
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-group full-width">
                <label class="form-label">Instructions</label>
                <textarea 
                  v-model="localComponent.instructions" 
                  class="form-textarea"
                  rows="4"
                  placeholder="Enter detailed component instructions"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Associated Resources Section -->
        <div class="resources-section">
          <div class="resources-header">
            <h3 class="section-title">
              Associated Resources ({{ localComponent.associatedResources.length }})
            </h3>
            <div class="flex items-center gap-2">
              <!-- Add existing resources -->
              <Button @click="openResourceModal">
                <Plus class="h-4 w-4 mr-2" />
                Add Resources
              </Button>

              <!-- Create-new dropdown and button -->
              <div class="flex items-center gap-2">
                <select v-model="createResourceType" class="form-select h-9">
                  <option value="document">Document</option>
                  <option value="url">URL</option>
                  <option value="form">Form</option>
                  <option value="emailTemplate">Email Template</option>
                  <option value="video">Video</option>
                  <option value="vdFolder">VD Folder</option>
                </select>
                <Button variant="outline" @click="handleOpenCreate(createResourceType)">
                  Create New
                </Button>
              </div>
            </div>
          </div>

          <!-- Resources List -->
          <div v-if="localComponent.associatedResources.length > 0" class="resources-list">
            <div
              v-for="resource in localComponent.associatedResources"
              :key="resource.id"
              class="resource-item"
            >
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
                  {{ resource.type }} • Updated {{ formatDate(resource.updatedAt) }} • {{ getResourceCategory(resource) }}
                </p>
              </div>
              
              <div class="resource-actions">
                <Button variant="ghost" size="sm" @click="editResource(resource)">
                  <Edit class="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" @click="removeResource(resource.id)">
                  <Trash2 class="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div v-else class="empty-resources">
            <div class="empty-icon">
              <FileText class="h-12 w-12 text-gray-400" />
            </div>
            <h4 class="empty-title">No resources associated</h4>
            <p class="empty-description">Add resources to help users complete this component</p>
            <Button @click="openResourceModal" class="mt-4">
              <Plus class="h-4 w-4 mr-2" />
              Add First Resource
            </Button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Resource Association Modal -->
  <ResourceAssociationModal
    v-if="showResourceModal"
    :is-open="showResourceModal"
    :context-type="'component'"
    :context-name="localComponent.name"
    @close="closeResourceModal"
    @associate="handleResourceAssociation"
    @open-create="handleOpenCreate"
  />

  <!-- Create New Resource Modal (opened from association modal) -->
  <SimplifiedResourceModal
    v-if="showCreateResourceModal"
    :is-open="showCreateResourceModal"
    mode="create"
    :resource-type="createResourceType"
    @close="showCreateResourceModal = false"
    @created="handleResourceCreated"
  />
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Button } from '@/lib/registry/new-york/ui/button'
import { 
  ArrowLeft, 
  Save, 
  X, 
  Plus, 
  FileText, 
  Link, 
  FileCheck, 
  Mail, 
  Video, 
  Folder,
  Edit,
  Trash2
} from 'lucide-vue-next'
import ResourceAssociationModal from '../resource-association/ResourceAssociationModal.vue'
// @ts-ignore - vue shim types may not resolve in this workspace
import SimplifiedResourceModal from '../resources-add-edit/SimplifiedResourceModal.vue'
import type { Resource } from '@/alp-types/resources.types'

// Component interfaces
interface ComponentDesignerProps {
  isOpen: boolean
  component: SimplifiedComponent | null
}

interface SimplifiedComponent {
  id: string
  name: string
  description: string
  type: string
  units: number
  budget: number
  lawArea: string
  lawSubArea: string
  instructions?: string
  templateName?: string
  resourceCount: number
  associatedResources: Resource[]
}

// Props and emits
const props = defineProps<ComponentDesignerProps>()
const emit = defineEmits<{
  close: []
  save: [component: SimplifiedComponent]
}>()

// Reactive state
const localComponent = ref<SimplifiedComponent>({
  id: '',
  name: '',
  description: '',
  type: 'task',
  units: 0,
  budget: 0,
  lawArea: '',
  lawSubArea: 'intellectual-property',
  instructions: '',
  templateName: '',
  resourceCount: 0,
  associatedResources: []
})

const showResourceModal = ref(false)
type ResourceTypeModal = 'document' | 'url' | 'form' | 'emailTemplate' | 'video' | 'vdFolder'
const showCreateResourceModal = ref(false)
const createResourceType = ref<ResourceTypeModal>('document')

// Watch for component changes
watch(() => props.component, (newComponent) => {
  if (newComponent) {
    localComponent.value = { ...newComponent }
  }
}, { immediate: true })

// Methods
const closeDrawer = () => {
  emit('close')
}

const handleOverlayClick = (event: MouseEvent) => {
  // Only close if clicking the overlay itself, not the drawer content
  if (event.target === event.currentTarget) {
    closeDrawer()
  }
}

const saveComponent = () => {
  // Update resource count
  localComponent.value.resourceCount = localComponent.value.associatedResources.length
  emit('save', localComponent.value)
  closeDrawer()
}

const updateComponentName = () => {
  // Auto-save name changes
  console.log('Component name updated:', localComponent.value.name)
}

const openResourceModal = () => {
  showResourceModal.value = true
}

const closeResourceModal = () => {
  showResourceModal.value = false
}

const handleResourceAssociation = (resources: Resource[]) => {
  // Add new resources to the component
  resources.forEach(resource => {
    if (!localComponent.value.associatedResources.find(r => r.id === resource.id)) {
      localComponent.value.associatedResources.push(resource)
    }
  })
  localComponent.value.resourceCount = localComponent.value.associatedResources.length
  closeResourceModal()
}

const handleOpenCreate = (resourceType: ResourceTypeModal) => {
  // Close the association modal and open the create modal with selected type
  showResourceModal.value = false
  createResourceType.value = resourceType || 'document'
  showCreateResourceModal.value = true
}

const handleResourceCreated = (resource: Resource) => {
  if (!localComponent.value.associatedResources.find(r => r.id === resource.id)) {
    localComponent.value.associatedResources.push(resource)
  }
  localComponent.value.resourceCount = localComponent.value.associatedResources.length
  showCreateResourceModal.value = false
}

const editResource = (resource: Resource) => {
  console.log('Edit resource:', resource.name)
  // Placeholder - would open resource edit modal
  alert(`Edit Resource: ${resource.name} - Coming Soon!`)
}

const removeResource = (resourceId: string) => {
  localComponent.value.associatedResources = localComponent.value.associatedResources.filter(
    r => r.id !== resourceId
  )
  localComponent.value.resourceCount = localComponent.value.associatedResources.length
}

const getResourceCategory = (resource: Resource) => {
  // Extract category from metadata or use type as fallback
  return resource.metadata?.tags?.[0] || resource.type
}

const formatDate = (date: string) => {
  const now = new Date()
  const resourceDate = new Date(date)
  const diffTime = Math.abs(now.getTime() - resourceDate.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 1) return 'yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`
  return `${Math.ceil(diffDays / 30)} months ago`
}
</script>

<style scoped lang="postcss">
.component-designer-overlay {
  @apply fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end;
}

.component-designer-drawer {
  @apply w-[90%] h-full bg-white shadow-2xl flex flex-col;
}

/* Header */
.drawer-header {
  @apply flex items-center justify-between p-6 border-b border-gray-200 bg-white;
}

.header-left {
  @apply flex items-center space-x-4;
}

.back-button {
  @apply text-gray-600 hover:text-gray-900;
}

.component-breadcrumb {
  @apply flex items-center space-x-2;
}

.breadcrumb-text {
  @apply text-sm text-gray-500;
}

.component-name-input {
  @apply text-xl font-semibold text-gray-900 bg-transparent border-none outline-none focus:bg-gray-50 focus:ring-2 focus:ring-blue-500 rounded px-2 py-1;
}

.header-right {
  @apply flex items-center space-x-2;
}

/* Component Meta */
.component-meta {
  @apply flex items-center space-x-6 px-6 py-3 bg-gray-50 border-b border-gray-200;
}

.meta-item {
  @apply flex items-center space-x-2;
}

.meta-label {
  @apply text-sm font-medium text-gray-700;
}

.meta-select {
  @apply text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500;
}

.meta-value {
  @apply text-sm text-gray-600;
}

/* Main Content */
.drawer-content {
  @apply flex-1 overflow-y-auto p-6 space-y-8;
}

/* Details Section */
.details-section {
  @apply space-y-4;
}

.section-title {
  @apply text-lg font-semibold text-gray-900;
}

.details-form {
  @apply space-y-4;
}

.form-row {
  @apply flex space-x-4;
}

.form-group {
  @apply flex-1 space-y-1;
}

.form-group.full-width {
  @apply w-full;
}

.form-label {
  @apply block text-sm font-medium text-gray-700;
}

.form-input, .form-select {
  @apply w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500;
}

.form-textarea {
  @apply w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none;
}

/* Resources Section */
.resources-section {
  @apply space-y-4;
}

.resources-header {
  @apply flex items-center justify-between;
}

.resources-list {
  @apply space-y-3;
}

.resource-item {
  @apply flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50;
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

.resource-actions {
  @apply flex items-center space-x-1;
}

/* Empty State */
.empty-resources {
  @apply text-center py-12;
}

.empty-icon {
  @apply flex justify-center mb-4;
}

.empty-title {
  @apply text-lg font-medium text-gray-900 mb-2;
}

.empty-description {
  @apply text-gray-500;
}
</style>
