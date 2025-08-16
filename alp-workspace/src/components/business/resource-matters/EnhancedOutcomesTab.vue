<template>
  <div class="enhanced-outcomes-tab">
    <!-- Filters and Actions Header -->
    <div class="space-y-4 mb-6">
      <!-- Actions -->
      <div class="flex justify-end">
        <Button>
          <Plus class="h-4 w-4 mr-2" />
          Add Outcome
        </Button>
      </div>
      
      <!-- Resource Filters -->
      <ResourceFilters 
        v-model="filterState"
        :total-resources="totalResourceCount"
      />
    </div>

    <!-- Offerings with Outcomes -->
    <div class="space-y-6">
      <div
        v-for="offering in filteredOfferings"
        :key="offering.id"
        class="offering-container"
      >
        <!-- Offering Header -->
        <div class="offering-header">
          <button
            @click="openSharePointFolder(offering.sharePointUrl)"
            class="flex items-center space-x-2 text-lg font-medium text-blue-600 hover:text-blue-800 transition-colors"
          >
            <Folder class="h-5 w-5" />
            <span>{{ offering.name }}</span>
          </button>
          <Button
            variant="outline"
            size="sm"
            @click="openSharePointFolder(offering.sharePointUrl)"
            class="ml-auto"
          >
            <Folder class="h-4 w-4 mr-2" />
            Open SharePoint Folder
          </Button>
        </div>

        <!-- Offering-Level Resources -->
        <div v-if="offering.resources && offering.resources.length > 0" class="offering-resources-section">
          <h4 class="offering-resources-title">Offering Resources</h4>
          <div class="offering-resources-container">
            <ResourceSummary
              v-for="resource in offering.resources"
              :key="resource.id"
              :resource="resource"
              :actions="['view', 'edit']"
              @click="openResource(resource)"
              @action="handleResourceAction"
            />
          </div>
        </div>

        <!-- Outcomes within Offering -->
        <div class="outcomes-container">
          <div
            v-for="outcome in offering.outcomes"
            :key="outcome.id"
            class="outcome-container"
          >
            <!-- Outcome Title -->
            <h3 class="outcome-title">{{ outcome.title }}</h3>

            <!-- Outcome-Level Resources -->
            <div v-if="outcome.resources.length > 0" class="resources-section">
              <ResourceSummary
                v-for="resource in outcome.resources"
                :key="resource.id"
                :resource="resource"
                :actions="['view', 'edit']"
                @click="openResource(resource)"
                @action="handleResourceAction"
              />
            </div>

            <!-- Components within Outcome -->
            <div class="components-section">
              <div
                v-for="component in outcome.components"
                :key="component.id"
                class="component-container"
              >
                <!-- Component Header -->
                <div class="component-header">
                  <div class="flex items-center space-x-3 flex-1">
                    <Checkbox
                      :checked="component.status === 'completed'"
                      @update:checked="updateComponentStatus(component, $event)"
                    />
                    <button 
                      class="component-title component-title-button"
                      @click="openComponentResources(component)"
                    >
                      {{ component.title }}
                    </button>
                  </div>
                  
                  <div class="flex items-center space-x-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      class="text-green-600 hover:text-green-700"
                      @click="startComponentWorkflow(component)"
                    >
                      <Play class="h-4 w-4" />
                    </Button>
                    
                    <span class="text-sm text-gray-600">
                      {{ component.units.completed }} / {{ component.units.total }} units
                    </span>
                    
                    <div class="w-24 text-sm text-gray-500">
                      {{ component.dueDate ? formatDate(component.dueDate) : 'Due Date' }}
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      class="text-red-600 hover:text-red-700"
                      @click="deleteComponent(component)"
                    >
                      <Trash2 class="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <!-- Component-Level Resources -->
                <div v-if="component.resources.length > 0" class="component-resources-container">
                  <ResourceSummary
                    v-for="resource in component.resources"
                    :key="resource.id"
                    :resource="resource"
                    :actions="['view', 'edit']"
                    @click="openResource(resource)"
                    @action="handleResourceAction"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Component Resources Modal -->
    <ComponentResourcesModal
      :visible="componentModalVisible"
      :component="selectedComponent"
      @close="closeComponentModal"
      @resourceAction="handleComponentResourceAction"
    />

    <!-- Resource Detail Modal -->
    <ResourceDetailModal
      :visible="resourceDetailModalVisible"
      :resource="selectedResource"
      @close="closeResourceDetailModal"
      @action="handleResourceDetailAction"
    />

    <!-- Standardized Resource Add/Edit Modal -->
    <SimplifiedResourceModal
      :is-open="resourceModal.isOpen"
      :mode="resourceModal.mode"
      :resource-type="resourceModal.resourceType"
      :resource="resourceModal.resource"
      @close="resourceModal.isOpen = false"
      @updated="onResourceUpdated"
    />

    <!-- Delete component confirmation -->
    <ConfirmDialog
      v-model:open="removeComponentState.open"
      title="Remove component"
      :description="removeComponentDescription"
      confirmText="Remove"
      cancelText="Cancel"
      @confirm="performRemoveComponent"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Button } from '@/lib/registry/new-york/ui/button'
import { Input } from '@/lib/registry/new-york/ui/input'
import { Checkbox } from '@/lib/registry/new-york/ui/checkbox'
import { 
  Plus, 
  Folder, 
  Play, 
  Trash2
} from 'lucide-vue-next'
import ComponentResourcesModal from '../resource-matters/ComponentResourcesModal.vue'
import ResourceDetailModal from '../resource-matters/ResourceDetailModal.vue'
import ResourceCard from '../resource-matters/ResourceCard.vue'
import ResourceFilters from '../resource-matters/ResourceFilters.vue'
import ResourceSummary from '../resource-matters/ResourceSummary.vue'
import type { Resource, ResourceMetadata, ResourceFilterState, ResourceType as GlobalResourceType } from '@/alp-types/resources.types'
import SimplifiedResourceModal from '@/components/business/resources-add-edit/SimplifiedResourceModal.vue'
import { loadSimplifiedOfferings } from '@/alp-data/resource-association/loadSimplifiedOfferings'
import { normalizeOfferings } from '@/alp-data/resource-association/normalizeOfferings'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'

// Enhanced interfaces for the outcomes tab
interface EnhancedOffering {
  id: string
  name: string
  sharePointUrl: string
  resources?: Resource[]
  outcomes: EnhancedOutcome[]
}

interface EnhancedOutcome {
  id: string
  title: string
  offeringId: string
  resources: Resource[]
  components: EnhancedComponent[]
}

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
  matterId?: string
}

const props = withDefaults(defineProps<Props>(), {
  matterId: 'matter-123'
})

// Reactive state
const filterState = ref<ResourceFilterState>({
  type: 'all',
  search: ''
})
const selectedComponent = ref<EnhancedComponent | null>(null)
const componentModalVisible = ref(false)
const selectedResource = ref<Resource | null>(null)
const resourceDetailModalVisible = ref(false)

// Load standardized offerings/outcomes/components from shared JSON
const offerings = ref<EnhancedOffering[]>([])
onMounted(async () => {
  const data = await loadSimplifiedOfferings<Resource>()
  const normalized = normalizeOfferings<Resource>(data)
  offerings.value = normalized.map(o => ({
    id: o.id,
    name: o.name,
    sharePointUrl: o.sharePointUrl,
    resources: o.resources || [],
    outcomes: o.outcomes.map(out => ({
      id: out.id,
      title: out.title,
      offeringId: o.id,
      resources: out.resources || [],
      components: out.components.map(c => ({
        id: c.id,
        title: (c as any).title || (c as any).name || 'Component',
        status: 'pending',
        units: typeof (c as any).units === 'number' ? { completed: 0, total: (c as any).units } : { completed: 0, total: ((c as any).units?.total ?? 0) },
        dueDate: undefined,
        resources: (c as any).resources || [],
      }))
    }))
  }))
})

// Computed properties
const totalResourceCount = computed(() => {
  return offerings.value.reduce((total, offering) => {
    const offeringResources = offering.resources?.length || 0
    const outcomeResources = offering.outcomes.reduce((outcomeTotal, outcome) => {
      const outcomeResourceCount = outcome.resources?.length || 0
      const componentResources = outcome.components.reduce((compTotal, component) => 
        compTotal + (component.resources?.length || 0), 0)
      return outcomeTotal + outcomeResourceCount + componentResources
    }, 0)
    return total + offeringResources + outcomeResources
  }, 0)
})

const filteredOfferings = computed(() => {
  return offerings.value.map(offering => ({
    ...offering,
    resources: filterResources(offering.resources || []),
    outcomes: offering.outcomes.map(outcome => ({
      ...outcome,
      resources: filterResources(outcome.resources || []),
      components: outcome.components.map(component => ({
        ...component,
        resources: filterResources(component.resources || [])
      })).filter(component => 
        // Show component if it has filtered resources or if no search is applied
        component.resources.length > 0 || filterState.value.search === ''
      )
    })).filter(outcome =>
      // Show outcome if it has filtered resources, filtered components, or if no search is applied
      (outcome.resources?.length || 0) > 0 || 
      outcome.components.length > 0 ||
      filterState.value.search === ''
    )
  })).filter(offering =>
    // Show offering if it has filtered resources, filtered outcomes, or if no search is applied  
    (offering.resources?.length || 0) > 0 || 
    offering.outcomes.length > 0 || 
    filterState.value.search === ''
  )
})

const filterResources = (resources: Resource[]): Resource[] => {
  return resources.filter(resource => {
    // Filter by type
    if (filterState.value.type !== 'all' && resource.type !== filterState.value.type) {
      return false
    }
    
    // Filter by search
    if (filterState.value.search) {
      const searchLower = filterState.value.search.toLowerCase()
      return resource.name.toLowerCase().includes(searchLower) ||
             resource.description?.toLowerCase().includes(searchLower) ||
             resource.metadata?.tags?.some(tag => tag.toLowerCase().includes(searchLower))
    }
    
    return true
  })
}

// Methods

const openSharePointFolder = (url: string) => {
  window.open(url, '_blank')
}

// Standardized resource edit modal
type ModalResourceType = Exclude<GlobalResourceType, 'template'>
const resourceModal = ref<{ isOpen: boolean; mode: 'create' | 'edit' | 'view'; resourceType: ModalResourceType; resource: any | null }>({
  isOpen: false,
  mode: 'edit',
  resourceType: 'document',
  resource: null,
})

const openEditResource = (resource: Resource) => {
  const modalType = (resource.type === 'template' ? 'document' : resource.type) as ModalResourceType
  resourceModal.value = {
    isOpen: true,
    mode: 'edit',
    resourceType: modalType,
    resource,
  }
}

const openResource = (resource: Resource) => {
  // Handle different resource types - open the actual resource
  switch (resource.type) {
    case 'url':
      window.open(resource.url, '_blank')
      break
    case 'document':
    case 'form':
    case 'template':
    case 'emailTemplate':
      // For documents, forms, and templates, open in new tab or download
      window.open(resource.url, '_blank')
      break
    default:
      console.log('Opening resource:', resource.name)
  }
}

const openResourceInViewMode = (resource: Resource) => {
  // Open resource in view mode modal (read-only)
  const modalType = (resource.type === 'template' ? 'document' : resource.type) as ModalResourceType
  resourceModal.value = {
    isOpen: true,
    mode: 'view',
    resourceType: modalType,
    resource,
  }
}


const updateComponentStatus = (component: EnhancedComponent, checked: boolean) => {
  component.status = checked ? 'completed' : 'pending'
}

const startComponentWorkflow = (component: EnhancedComponent) => {
  console.log('Starting workflow for:', component.title)
  // Handle workflow start
}

const deleteComponent = (component: EnhancedComponent) => {
  removeComponentState.value.open = true
  removeComponentState.value.component = component
}

const formatDate = (date: Date) => {
  return date.toLocaleDateString()
}

const openComponentResources = (component: EnhancedComponent) => {
  selectedComponent.value = component
  componentModalVisible.value = true
}

const closeComponentModal = () => {
  componentModalVisible.value = false
  selectedComponent.value = null
}

const handleComponentResourceAction = (action: string, resource: Resource) => {
  console.log('Component resource action:', action, resource.name)
  // Handle component resource actions
  if (action === 'detail') {
  openEditResource(resource)
  }
}

const closeResourceDetailModal = () => {
  resourceDetailModalVisible.value = false
  selectedResource.value = null
}

const handleResourceAction = (action: string, resource: Resource) => {
  console.log('Resource action:', action, resource.name)
  // Handle resource actions from ResourceCard
  if (action === 'view') {
    openResourceInViewMode(resource)
  } else if (action === 'edit') {
    openEditResource(resource)
  }
}

const handleResourceDetailAction = (action: string, resource: Resource) => {
  console.log('Resource detail action:', action, resource.name)
  // Handle resource detail actions (open, copy, etc.)
}

// When SimplifiedResourceModal emits updated, replace the resource in-place everywhere
const onResourceUpdated = (updated: any) => {
  const u = updated as Resource
  offerings.value.forEach(offering => {
    if (offering.resources && offering.resources.length) {
      offering.resources = offering.resources.map(r => (r.id === u.id ? u : r))
    }
    offering.outcomes.forEach(out => {
      out.resources = out.resources.map(r => (r.id === u.id ? u : r))
      out.components.forEach(c => {
        c.resources = c.resources.map(r => (r.id === u.id ? u : r))
      })
    })
  })
  resourceModal.value.isOpen = false
}

// Remove component confirmation state and handler
const removeComponentState = ref<{ open: boolean; component: EnhancedComponent | null }>({ open: false, component: null })
const removeComponentDescription = computed(() => {
  const s = removeComponentState.value
  return s.component ? `Are you sure you want to remove component "${s.component.title}"?` : ''
})

const performRemoveComponent = () => {
  const s = removeComponentState.value
  if (!s.component) return
  // Find and remove the component from the appropriate outcome
  offerings.value.forEach(offering => {
    offering.outcomes.forEach(outcome => {
      const idx = outcome.components.findIndex(c => c.id === s.component!.id)
      if (idx !== -1) {
        outcome.components.splice(idx, 1)
      }
    })
  })
  removeComponentState.value.open = false
  removeComponentState.value.component = null
}
</script>

<style scoped lang="postcss">
.enhanced-outcomes-tab {
  @apply p-6 bg-gray-50 min-h-screen;
}

/* Level 1: Offering Container - Major Section with Blue Accent */
.offering-container {
  @apply border border-gray-200 rounded-lg p-6 bg-white shadow-md border-l-4 border-l-blue-500 mb-6;
}

.offering-header {
  @apply flex items-center justify-between mb-4 pb-3 border-b border-gray-200;
}

.offering-header button {
  @apply text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors;
}

.offering-resources-section {
  @apply mb-6;
}

.offering-resources-title {
  @apply text-base font-semibold text-gray-800 mb-3;
}

.offering-resources-container {
  @apply space-y-2;
}

.outcomes-container {
  @apply space-y-5;
}

/* Level 2: Outcome Container - Organized Groups */
.outcome-container {
  @apply border border-gray-200 rounded-md p-5 bg-slate-50 shadow-sm mb-4 border-l-4 border-l-green-500;
}

.outcome-title {
  @apply text-lg font-bold text-gray-800 mb-4;
}

.resources-section {
  @apply mb-4 space-y-2;
}

/* Level 2: Outcome-level Resource Items - Individual boxes */
.resource-item {
  @apply p-3 bg-white border border-gray-200 rounded-md shadow-sm;
}

.resource-icon {
  @apply h-4 w-4 text-gray-600;
}

.resource-name {
  @apply text-sm font-medium text-gray-800;
}

.resource-description {
  @apply text-xs text-gray-600 mt-1 line-clamp-2;
}

.resource-actions {
  @apply flex space-x-2 ml-auto flex-shrink-0;
}

.components-section {
  @apply space-y-4;
}

/* Level 3: Component Container - Clean Workspace Areas */
.component-container {
  @apply border border-gray-300 rounded-md p-4 bg-white shadow-sm hover:shadow-md transition-shadow mb-3 border-l-4 border-l-purple-500;
}

.component-header {
  @apply flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-200 mb-3;
}

.component-title {
  @apply text-base font-semibold text-gray-900;
}

.component-title-button {
  @apply text-left hover:text-blue-600 hover:underline transition-all cursor-pointer hover:bg-blue-50 rounded px-2 py-1 -mx-2 -my-1;
}

/* Level 4: Component Resources Container */
.component-resources-container {
  @apply space-y-2 mt-3;
}

/* Level 4: Component-level Resource Items - Darkest individual boxes */
.component-resource-box {
  @apply p-3 bg-gray-50 border border-gray-300 rounded-md shadow-sm;
}
</style>
