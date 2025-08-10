<template>
  <div class="simplified-offering-designer">
    <!-- Offering Header -->
    <div class="offering-header-section">
      <div class="offering-title-section">
        <h1 class="offering-title">{{ offering.name }}</h1>
        <p class="offering-category">{{ offering.category }}</p>
      </div>
      
      <div class="offering-actions">
        <Button variant="outline" size="sm" @click="openSharePointFolder">
          <Folder class="h-4 w-4 mr-2" />
          SharePoint Folder
        </Button>
        <Button variant="outline" size="sm" @click="duplicateOffering">
          <Copy class="h-4 w-4 mr-2" />
          Duplicate Offering
        </Button>
      </div>
    </div>

    <!-- Offering-Level Resources -->
    <div v-if="offering.associatedResources.length > 0" class="offering-resources-section">
      <div class="section-header">
        <h3 class="section-title">Offering Resources ({{ offering.resourceCount }})</h3>
        <Button variant="outline" size="sm" @click="addOfferingResource">
          <Plus class="h-4 w-4 mr-2" />
          Add Offering Resource
        </Button>
      </div>
      <div class="resources-container">
        <ResourceSummary
          v-for="resource in offering.associatedResources"
          :key="resource.id"
          :resource="resource"
          :actions="['preview', 'open', 'delete']"
          @click="openEditResource(resource)"
          @action="(action, res) => handleOfferingResourceAction(action, res)"
        />
      </div>
    </div>

    <!-- Add Offering Resource (if no resources) -->
    <div v-else class="empty-resources-section">
  <Button variant="outline" size="sm" @click="addOfferingResource">
        <Plus class="h-4 w-4 mr-2" />
        Add Offering Resource
      </Button>
    </div>

    <!-- Outcomes Section -->
    <div class="outcomes-section">
      <div class="section-header">
        <h2 class="section-title">Outcomes ({{ offering.outcomes.length }})</h2>
      </div>

      <!-- Outcome Containers -->
      <div class="outcomes-container">
        <div
          v-for="outcome in offering.outcomes"
          :key="outcome.id"
          class="outcome-container"
        >
          <!-- Outcome Header with Actions -->
          <div class="outcome-header">
            <div class="outcome-header-content">
              <div class="outcome-order-controls">
                <Button variant="ghost" size="sm" @click="moveOutcomeUp(outcome)" :disabled="isFirstOutcome(outcome)">
                  <ChevronUp class="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" @click="moveOutcomeDown(outcome)" :disabled="isLastOutcome(outcome)">
                  <ChevronDown class="h-4 w-4" />
                </Button>
              </div>
              <h3 
                class="outcome-title"
                contenteditable="true"
                @blur="updateOutcomeTitle(outcome, $event)"
                @keydown.enter.prevent="($event.target as HTMLElement)?.blur()"
              >
                {{ outcome.title }}
              </h3>
              <div class="outcome-budget-info">
                ${{ getOutcomeBudget(outcome).toLocaleString() }} ({{ getOutcomeUnits(outcome) }} units)
              </div>
            </div>
              <div class="outcome-actions">
              <Button variant="outline" size="sm" @click="removeOutcome(outcome)">
                <Trash2 class="h-4 w-4 mr-2" />
                Remove
              </Button>
              <Button variant="outline" size="sm" @click="moveOutcome(outcome)">
                <ArrowRight class="h-4 w-4 mr-2" />
                Move
              </Button>
              <Button variant="outline" size="sm" @click="mergeOutcome(outcome)">
                <Merge class="h-4 w-4 mr-2" />
                Merge
              </Button>
                <Button variant="ghost" size="sm" class="ml-1" @click="toggleOutcomeCollapse(outcome)" :aria-label="outcome.collapsed ? 'Expand components' : 'Collapse components'">
                  <ChevronRight v-if="outcome.collapsed" class="h-4 w-4" />
                  <ChevronDown v-else class="h-4 w-4" />
                </Button>
            </div>
          </div>

          <!-- Outcome Description (Inline Editable) -->
          <div 
            class="outcome-description"
            contenteditable="true"
            @blur="updateOutcomeDescription(outcome, $event)"
            @keydown.enter.prevent="($event.target as HTMLElement)?.blur()"
          >
            {{ outcome.description }}
          </div>

          <!-- Outcome-Level Resources -->
          <div v-if="!outcome.collapsed && outcome.associatedResources.length > 0" class="outcome-resources-section">
            <div class="subsection-header">
              <h4 class="subsection-title">Associated Resources ({{ outcome.resourceCount }})</h4>
              <Button variant="outline" size="sm" @click="addOutcomeResource(outcome)">
                <Plus class="h-4 w-4 mr-2" />
                Add Resource
              </Button>
            </div>
            <div class="resources-container">
              <ResourceSummary
                v-for="resource in outcome.associatedResources"
                :key="resource.id"
                :resource="resource"
                :actions="['preview', 'open', 'delete']"
                @click="openEditResource(resource)"
                @action="(action, res) => handleOutcomeResourceAction(action, res, outcome)"
              />
            </div>
          </div>

          <!-- Add Outcome Resource (if no resources) -->
          <div v-else-if="!outcome.collapsed" class="empty-resources-section">
            <Button variant="outline" size="sm" @click="addOutcomeResource(outcome)">
              <Plus class="h-4 w-4 mr-2" />
              Add Resource
            </Button>
          </div>

          <!-- Components Section (collapsible) -->
          <div class="components-section" v-if="!outcome.collapsed">
            <div class="subsection-header">
              <h4 class="subsection-title">Components ({{ outcome.components.length }})</h4>
            </div>

            <!-- Component Cards -->
            <div class="components-container">
              <div
                v-for="component in outcome.components"
                :key="component.id"
                class="component-card"
              >
                <!-- Component Header -->
                <div class="component-header">
                  <div class="component-order-controls" v-if="outcome.components.length > 1">
                    <Button variant="ghost" size="sm" @click="moveComponentUp(component, outcome)" :disabled="isFirstComponent(component, outcome)">
                      <ChevronUp class="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" @click="moveComponentDown(component, outcome)" :disabled="isLastComponent(component, outcome)">
                      <ChevronDown class="h-4 w-4" />
                    </Button>
                  </div>
                  <div class="component-info">
                    <h5 class="component-name">{{ component.name }}</h5>
                    <p class="component-summary">
                      {{ component.units }} units • ${{ component.budget.toLocaleString() }} • {{ component.lawArea }}
                    </p>
                    <p class="component-description">{{ component.description }}</p>
                  </div>
                  <div class="component-actions">
                    <Button variant="outline" size="sm" @click="removeComponent(component, outcome)">
                      <Trash2 class="h-4 w-4 mr-2" />
                      Remove
                    </Button>
                    <Button variant="outline" size="sm" @click="moveComponent(component)">
                      <ArrowRight class="h-4 w-4 mr-2" />
                      Move
                    </Button>
                    <Button variant="outline" size="sm" @click="mergeComponent(component)">
                      <Merge class="h-4 w-4 mr-2" />
                      Merge
                    </Button>
                    <Button variant="outline" size="sm" @click="editComponent(component)">
                      <Edit class="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  </div>
                </div>

                <!-- Component Resources -->
                <div v-if="component.associatedResources.length > 0" class="component-resources-section">
                  <div class="component-resources-header">
                    <h6 class="component-resources-title">Associated Resources ({{ component.resourceCount }})</h6>
                    <Button variant="outline" size="sm" @click="addComponentResource(outcome, component)">
                      <Plus class="h-4 w-4 mr-2" />
                      Add Resource
                    </Button>
                  </div>
                  <div class="resources-container">
                    <ResourceSummary
                      v-for="resource in component.associatedResources"
                      :key="resource.id"
                      :resource="resource"
                      :actions="['preview', 'open', 'delete']"
                      @click="openEditResource(resource)"
                      @action="(action, res) => handleComponentResourceAction(action, res, component)"
                    />
                  </div>
                </div>

                <!-- No Resources Message -->
                <div v-else class="no-resources-message">
                  <div class="component-resources-header">
                    <h6 class="component-resources-title">Associated Resources (0)</h6>
                    <Button variant="outline" size="sm" @click="addComponentResource(outcome, component)">
                      <Plus class="h-4 w-4 mr-2" />
                      Add Resource
                    </Button>
                  </div>
                  <p class="text-sm text-gray-500">No resources associated with this component</p>
                </div>
              </div>
            </div>

            <!-- Add Component moved below the list -->
            <div class="components-footer">
              <Button variant="outline" size="sm" @click="addComponent(outcome)">
                <Plus class="h-4 w-4 mr-2" />
                Add Component
              </Button>
            </div>
          </div>
        </div>
      </div>
      <!-- Create Outcome moved to bottom -->
      <div class="flex justify-end mt-4">
        <Button variant="outline" @click="createOutcome">
          <Plus class="h-4 w-4 mr-2" />
          Create Outcome
        </Button>
      </div>
    </div>

    <!-- Component Designer Drawer -->
    <ComponentDesignerDrawer
      :is-open="showComponentDesigner"
      :component="selectedComponent"
      @close="closeComponentDesigner"
      @save="saveComponent"
    />
    
    <!-- Standardized Resource Add/Edit Modal -->
    <SimplifiedResourceModal
      :is-open="resourceModal.isOpen"
      :mode="resourceModal.mode"
      :resource-type="resourceModal.resourceType"
      :resource="resourceModal.resource"
      @close="resourceModal.isOpen = false"
      @created="onResourceCreated"
      @updated="onResourceUpdated"
    />

    <!-- Unified Resource Association Modal -->
    <ResourceAssociationModal
      :is-open="showAssociationModal"
      :context-type="associationContext.type"
      :context-name="associationContext.name"
      @close="showAssociationModal = false"
      @associate="onAssociateResources"
      @open-create="onOpenCreateFromAssociation"
    />

    <!-- Delete resource confirmation -->
    <ConfirmDialog
      v-model:open="confirmState.open"
      title="Remove resource"
      :description="confirmDescription"
      confirmText="Remove"
      cancelText="Cancel"
      @confirm="performDelete"
    />

    <!-- Remove component confirmation -->
    <ConfirmDialog
      v-model:open="removeComponentState.open"
      title="Remove component"
      :description="removeComponentDescription"
      confirmText="Remove"
      cancelText="Cancel"
      @confirm="performRemoveComponent"
    />

    <!-- Remove outcome confirmation -->
    <ConfirmDialog
      v-model:open="removeOutcomeState.open"
      title="Remove outcome"
      :description="removeOutcomeDescription"
      confirmText="Remove"
      cancelText="Cancel"
      @confirm="performRemoveOutcome"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { Button } from '@/lib/registry/new-york/ui/button'
import { 
  Plus, 
  Folder, 
  Copy,
  Edit,
  ArrowRight,
  Merge,
  Trash2,
  ChevronUp,
  ChevronDown,
  ChevronRight
} from 'lucide-vue-next'
import ResourceSummary from '@/components/business/resource-matters/ResourceSummary.vue'
import ComponentDesignerDrawer from './ComponentDesignerDrawer.vue'
// @ts-ignore - Volar will resolve .vue at runtime
import ResourceAssociationModal from './ResourceAssociationModal.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import type { Resource } from '@/alp-types/resources.types'

// Shared offerings loader and standard resource modal
import { loadSimplifiedOfferings, type SimplifiedOfferingsData } from '@/alp-data/resource-association/loadSimplifiedOfferings'
import SimplifiedResourceModal from '@/components/business/resources-add-edit/SimplifiedResourceModal.vue'

// Interfaces matching our data structure
interface SimplifiedOffering {
  id: string
  name: string
  description: string
  category: string
  sharePointUrl: string
  resourceCount: number
  associatedResources: Resource[]
  outcomes: SimplifiedOutcome[]
}

interface SimplifiedOutcome {
  id: string
  title: string
  description: string
  collapsed?: boolean
  resourceCount: number
  associatedResources: Resource[]
  components: SimplifiedComponent[]
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

// Reactive state
const offering = ref<SimplifiedOffering>({
  id: '',
  name: '',
  description: '',
  category: '',
  sharePointUrl: '#',
  resourceCount: 0,
  associatedResources: [],
  outcomes: []
})
const showComponentDesigner = ref(false)
const selectedComponent = ref<SimplifiedComponent | null>(null)
type ResourceType = 'document' | 'url' | 'form' | 'emailTemplate' | 'video' | 'vdFolder'
const resourceModal = ref<{ isOpen: boolean; mode: 'create'|'edit'; resourceType: ResourceType; resource: any | null }>({
  isOpen: false,
  mode: 'create',
  resourceType: 'document',
  resource: null,
})
const addTarget = ref<{ level: 'offering' | 'outcome' | 'component'; outcomeId?: string; componentId?: string } | null>(null)

// Association modal state
const showAssociationModal = ref(false)
const associationContext = reactive<{ type: 'offering' | 'outcome' | 'component'; name: string }>({ type: 'offering', name: '' })

// Track the outcome for a newly created component
const newComponentOutcomeId = ref<string | null>(null)

// Methods - Placeholder implementations
const openSharePointFolder = () => {
  window.open(offering.value.sharePointUrl, '_blank')
}

const duplicateOffering = () => {
  alert('Duplicate Offering functionality - Coming Soon!')
}

const addOfferingResource = () => {
  addTarget.value = { level: 'offering' }
  associationContext.type = 'offering'
  associationContext.name = offering.value.name
  showAssociationModal.value = true
}

const addOutcomeResource = (outcome: SimplifiedOutcome) => {
  addTarget.value = { level: 'outcome', outcomeId: outcome.id }
  associationContext.type = 'outcome'
  associationContext.name = outcome.title
  showAssociationModal.value = true
}

const addComponentResource = (outcome: SimplifiedOutcome, component: SimplifiedComponent) => {
  addTarget.value = { level: 'component', outcomeId: outcome.id, componentId: component.id }
  associationContext.type = 'component'
  associationContext.name = component.name
  showAssociationModal.value = true
}

const addComponent = (outcome: SimplifiedOutcome) => {
  // Open drawer in create mode with defaults
  selectedComponent.value = {
    id: `new-${Date.now()}`,
    name: '',
    description: '',
    type: 'task',
    units: 1,
    budget: 0,
    lawArea: 'general',
    lawSubArea: 'intellectual-property',
    instructions: '',
    templateName: '',
    resourceCount: 0,
    associatedResources: []
  }
  newComponentOutcomeId.value = outcome.id
  showComponentDesigner.value = true
}

const editComponent = (component: SimplifiedComponent) => {
  // Ensure component has all required properties for the drawer
  selectedComponent.value = {
    ...component,
    type: component.type || 'task',
    lawSubArea: component.lawSubArea || 'intellectual-property',
    instructions: component.instructions || '',
    templateName: component.templateName || ''
  }
  showComponentDesigner.value = true
}

const closeComponentDesigner = () => {
  showComponentDesigner.value = false
  selectedComponent.value = null
}

const saveComponent = (updatedComponent: SimplifiedComponent) => {
  // Find and update the component in the offering data
  let updated = false
  offering.value.outcomes.forEach(outcome => {
    const componentIndex = outcome.components.findIndex(c => c.id === updatedComponent.id)
    if (componentIndex !== -1) {
      outcome.components[componentIndex] = updatedComponent
      updated = true
    }
  })
  // If not found, treat as create and append to the target outcome
  if (!updated) {
    const targetOutcomeId = newComponentOutcomeId.value
    const targetOutcome = offering.value.outcomes.find(o => o.id === targetOutcomeId)
    if (targetOutcome) {
      targetOutcome.components.push(updatedComponent)
    }
  }
  
  console.log('Component saved:', updatedComponent.name)
  closeComponentDesigner()
}

const createOutcome = () => {
  const nextIndex = offering.value.outcomes.length + 1
  const newOutcome: SimplifiedOutcome = {
    id: `outcome-${Date.now()}`,
    title: `New Outcome ${nextIndex}`,
    description: '',
  collapsed: false,
    resourceCount: 0,
    associatedResources: [],
    components: [],
  }
  // Append to the end
  offering.value.outcomes.push(newOutcome)
  console.log('Created new outcome at end:', newOutcome.title)
}

const updateOutcomeTitle = (outcome: SimplifiedOutcome, event: Event) => {
  const target = event.target as HTMLElement
  outcome.title = target.textContent || outcome.title
  console.log('Updated outcome title:', outcome.title)
}

const updateOutcomeDescription = (outcome: SimplifiedOutcome, event: Event) => {
  const target = event.target as HTMLElement
  outcome.description = target.textContent || outcome.description
  console.log('Updated outcome description:', outcome.description)
}

const openResourceDetail = (resource: Resource) => {
  // Keep for preview actions; edit uses openEditResource
  console.log('Opening resource detail:', resource.name)
}

const handleResourceAction = (action: string, resource: Resource) => {
  console.log('Resource action:', action, resource.name)
  if (action === 'open') {
    window.open(resource.url, '_blank')
  }
}

// Context-aware action handlers for deletions
const handleOfferingResourceAction = (action: string, resource: Resource) => {
  if (action === 'delete') return confirmDelete('offering', resource)
  handleResourceAction(action, resource)
}

const handleOutcomeResourceAction = (action: string, resource: Resource, outcome: SimplifiedOutcome) => {
  if (action === 'delete') return confirmDelete('outcome', resource, outcome)
  handleResourceAction(action, resource)
}

const handleComponentResourceAction = (action: string, resource: Resource, component: SimplifiedComponent) => {
  if (action === 'delete') return confirmDelete('component', resource, undefined, component)
  handleResourceAction(action, resource)
}

// Styled confirmation dialog state
const confirmState = ref<{
  open: boolean
  scope: 'offering' | 'outcome' | 'component'
  resource: Resource | null
  outcome?: SimplifiedOutcome | null
  component?: SimplifiedComponent | null
}>({ open: false, scope: 'offering', resource: null, outcome: null, component: null })

const confirmDelete = (
  scope: 'offering' | 'outcome' | 'component',
  resource: Resource,
  outcome?: SimplifiedOutcome,
  component?: SimplifiedComponent
) => {
  confirmState.value = { open: true, scope, resource, outcome: outcome || null, component: component || null }
}

const performDelete = () => {
  const state = confirmState.value
  const res = state.resource
  if (!res) return
  if (state.scope === 'offering') {
    offering.value.associatedResources = offering.value.associatedResources.filter(r => r.id !== res.id)
    offering.value.resourceCount = offering.value.associatedResources.length
  } else if (state.scope === 'outcome' && state.outcome) {
    state.outcome.associatedResources = state.outcome.associatedResources.filter(r => r.id !== res.id)
    state.outcome.resourceCount = state.outcome.associatedResources.length
  } else if (state.scope === 'component' && state.component) {
    state.component.associatedResources = state.component.associatedResources.filter(r => r.id !== res.id)
    state.component.resourceCount = state.component.associatedResources.length
  }
  confirmState.value.open = false
}

const confirmDescription = computed(() => {
  const s = confirmState.value
  if (!s.resource) return ''
  return `Are you sure you want to remove "${s.resource.name}" from the ${s.scope}?`
})

// Remove component confirmation state
const removeComponentState = ref<{ open: boolean; component: SimplifiedComponent | null; outcome: SimplifiedOutcome | null }>({ open: false, component: null, outcome: null })
const removeComponentDescription = computed(() => {
  const s = removeComponentState.value
  return s.component ? `Are you sure you want to remove component "${s.component.name}"?` : ''
})

const openEditResource = (resource: Resource) => {
  resourceModal.value = {
    isOpen: true,
    mode: 'edit',
    resourceType: (resource.type as ResourceType) || 'document',
    resource,
  }
}

const onResourceCreated = (created: any) => {
  const c = created as Resource
  if (!addTarget.value) return
  if (addTarget.value.level === 'offering') {
    offering.value.associatedResources.push(c)
    offering.value.resourceCount = offering.value.associatedResources.length
  } else if (addTarget.value.level === 'outcome' && addTarget.value.outcomeId) {
    const outcome = offering.value.outcomes.find(o => o.id === addTarget.value!.outcomeId)
    if (outcome) {
      outcome.associatedResources.push(c)
      outcome.resourceCount = outcome.associatedResources.length
    }
  } else if (addTarget.value.level === 'component' && addTarget.value.outcomeId && addTarget.value.componentId) {
    const outcome = offering.value.outcomes.find(o => o.id === addTarget.value!.outcomeId)
    const component = outcome?.components.find(c => c.id === addTarget.value!.componentId)
    if (component) {
      // Add the newly created resource if not already present
      if (!component.associatedResources.find(r => r.id === c.id)) {
        component.associatedResources.push(c)
        component.resourceCount = component.associatedResources.length
      }
    }
  }
  resourceModal.value.isOpen = false
  addTarget.value = null
}

const onResourceUpdated = (updated: any) => {
  const u = updated as Resource
  // Update in offering-level resources
  offering.value.associatedResources = offering.value.associatedResources.map(r => r.id === u.id ? u : r)
  // Update in each outcome and component
  offering.value.outcomes.forEach(out => {
    out.associatedResources = out.associatedResources.map(r => r.id === u.id ? u : r)
    out.components.forEach(c => {
      c.associatedResources = c.associatedResources.map(r => r.id === u.id ? u : r)
    })
  })
  resourceModal.value.isOpen = false
}

// Handle association modal completion
const onAssociateResources = (resources: Resource[]) => {
  if (!addTarget.value || !resources?.length) {
    showAssociationModal.value = false
    return
  }
  if (addTarget.value.level === 'offering') {
    const existingIds = new Set(offering.value.associatedResources.map(r => r.id))
    resources.forEach(r => { if (!existingIds.has(r.id)) offering.value.associatedResources.push(r) })
    offering.value.resourceCount = offering.value.associatedResources.length
  } else if (addTarget.value.level === 'outcome' && addTarget.value.outcomeId) {
    const outcome = offering.value.outcomes.find(o => o.id === addTarget.value!.outcomeId)
    if (outcome) {
      const existingIds = new Set(outcome.associatedResources.map(r => r.id))
      resources.forEach(r => { if (!existingIds.has(r.id)) outcome.associatedResources.push(r) })
      outcome.resourceCount = outcome.associatedResources.length
    }
  } else if (addTarget.value.level === 'component' && addTarget.value.outcomeId && addTarget.value.componentId) {
    const outcome = offering.value.outcomes.find(o => o.id === addTarget.value!.outcomeId)
    const component = outcome?.components.find(c => c.id === addTarget.value!.componentId)
    if (component) {
      const existingIds = new Set(component.associatedResources.map(r => r.id))
      resources.forEach((r: Resource) => { if (!existingIds.has(r.id)) component.associatedResources.push(r) })
      component.resourceCount = component.associatedResources.length
    }
  }
  addTarget.value = null
  showAssociationModal.value = false
}

const onOpenCreateFromAssociation = (resourceType: ResourceType) => {
  // Close association modal and open the create resource modal
  showAssociationModal.value = false
  resourceModal.value = { isOpen: true, mode: 'create', resourceType: resourceType || 'document', resource: null }
}

// Outcome action methods
const moveOutcomeUp = (outcome: SimplifiedOutcome) => {
  const outcomes = offering.value.outcomes
  const currentIndex = outcomes.findIndex(o => o.id === outcome.id)
  if (currentIndex > 0) {
    const temp = outcomes[currentIndex]
    outcomes[currentIndex] = outcomes[currentIndex - 1]
    outcomes[currentIndex - 1] = temp
    console.log('Moved outcome up:', outcome.title)
  }
}

const moveOutcomeDown = (outcome: SimplifiedOutcome) => {
  const outcomes = offering.value.outcomes
  const currentIndex = outcomes.findIndex(o => o.id === outcome.id)
  if (currentIndex < outcomes.length - 1) {
    const temp = outcomes[currentIndex]
    outcomes[currentIndex] = outcomes[currentIndex + 1]
    outcomes[currentIndex + 1] = temp
    console.log('Moved outcome down:', outcome.title)
  }
}

const isFirstOutcome = (outcome: SimplifiedOutcome) => {
  return offering.value.outcomes.findIndex(o => o.id === outcome.id) === 0
}

const isLastOutcome = (outcome: SimplifiedOutcome) => {
  const outcomes = offering.value.outcomes
  return outcomes.findIndex(o => o.id === outcome.id) === outcomes.length - 1
}

const moveOutcome = (outcome: SimplifiedOutcome) => {
  alert(`Move Outcome "${outcome.title}" to another offering - Coming Soon!`)
}

const mergeOutcome = (outcome: SimplifiedOutcome) => {
  alert(`Merge Outcome "${outcome.title}" with another outcome - Coming Soon!`)
}


const getOutcomeBudget = (outcome: SimplifiedOutcome) => {
  return outcome.components.reduce((total, component) => total + component.budget, 0)
}

const getOutcomeUnits = (outcome: SimplifiedOutcome) => {
  return outcome.components.reduce((total, component) => total + component.units, 0)
}

const toggleOutcomeCollapse = (outcome: SimplifiedOutcome) => {
  outcome.collapsed = !outcome.collapsed
}

// Component action methods
const removeComponent = (component: SimplifiedComponent, outcome: SimplifiedOutcome) => {
  removeComponentState.value.open = true
  removeComponentState.value.component = component
  removeComponentState.value.outcome = outcome
}

const performRemoveComponent = () => {
  const s = removeComponentState.value
  if (!s.component || !s.outcome) return
  const idx = s.outcome.components.findIndex(c => c.id === s.component!.id)
  if (idx !== -1) {
    s.outcome.components.splice(idx, 1)
    console.log('Removed component:', s.component.name)
  }
  removeComponentState.value.open = false
}

const moveComponent = (component: SimplifiedComponent) => {
  alert(`Move Component "${component.name}" to another outcome - Coming Soon!`)
}

const mergeComponent = (component: SimplifiedComponent) => {
  alert(`Merge Component "${component.name}" with another component - Coming Soon!`)
}

// Component reordering methods
const moveComponentUp = (component: SimplifiedComponent, outcome: SimplifiedOutcome) => {
  const components = outcome.components
  const currentIndex = components.findIndex(c => c.id === component.id)
  if (currentIndex > 0) {
    const temp = components[currentIndex]
    components[currentIndex] = components[currentIndex - 1]
    components[currentIndex - 1] = temp
    console.log('Moved component up:', component.name)
  }
}

const moveComponentDown = (component: SimplifiedComponent, outcome: SimplifiedOutcome) => {
  const components = outcome.components
  const currentIndex = components.findIndex(c => c.id === component.id)
  if (currentIndex < components.length - 1) {
    const temp = components[currentIndex]
    components[currentIndex] = components[currentIndex + 1]
    components[currentIndex + 1] = temp
    console.log('Moved component down:', component.name)
  }
}

const isFirstComponent = (component: SimplifiedComponent, outcome: SimplifiedOutcome) => {
  return outcome.components.findIndex(c => c.id === component.id) === 0
}

const isLastComponent = (component: SimplifiedComponent, outcome: SimplifiedOutcome) => {
  const components = outcome.components
  return components.findIndex(c => c.id === component.id) === components.length - 1
}

// Outcome removal state and handlers
const removeOutcomeState = ref<{ open: boolean; outcome: SimplifiedOutcome | null }>({ open: false, outcome: null })
const removeOutcomeDescription = computed(() => {
  const s = removeOutcomeState.value
  return s.outcome ? `Are you sure you want to remove outcome "${s.outcome.title}"?` : ''
})

const removeOutcome = (outcome: SimplifiedOutcome) => {
  removeOutcomeState.value.open = true
  removeOutcomeState.value.outcome = outcome
}

const performRemoveOutcome = () => {
  const s = removeOutcomeState.value
  if (!s.outcome) return
  const idx = offering.value.outcomes.findIndex(o => o.id === s.outcome!.id)
  if (idx !== -1) {
    offering.value.outcomes.splice(idx, 1)
    console.log('Removed outcome:', s.outcome.title)
  }
  removeOutcomeState.value.open = false
}

onMounted(() => {
  loadSimplifiedOfferings<Resource>().then((data: SimplifiedOfferingsData<Resource>) => {
    if (data.offerings && data.offerings.length > 0) {
      offering.value = data.offerings[0] as unknown as SimplifiedOffering
    }
  })
  console.log('SimplifiedOfferingDesigner mounted')
})
</script>

<style scoped lang="postcss">
.simplified-offering-designer {
  @apply p-6 bg-gray-50 min-h-screen;
}

/* Offering Header */
.offering-header-section {
  @apply flex items-start justify-between mb-6 p-6 bg-white rounded-lg shadow-sm border border-gray-200;
}

.offering-title-section {
  @apply flex-1;
}

.offering-title {
  @apply text-3xl font-bold text-gray-900 mb-2;
}

.offering-category {
  @apply text-lg text-gray-600;
}

.offering-actions {
  @apply flex space-x-3;
}

/* Section Headers */
.section-header {
  @apply flex items-center justify-between mb-4;
}

.section-title {
  @apply text-xl font-semibold text-gray-800;
}

.subsection-header {
  @apply flex items-center justify-between mb-3;
}

.subsection-title {
  @apply text-base font-medium text-gray-700;
}

/* Offering Resources */
.offering-resources-section {
  @apply mb-6 p-4 bg-white rounded-lg shadow-sm border border-gray-200 border-l-4 border-l-blue-500;
}

.empty-resources-section {
  @apply mb-6 p-4 bg-white rounded-lg shadow-sm border border-gray-200 border-l-4 border-l-gray-300;
}

.resources-container {
  @apply space-y-2;
}

/* Outcomes */
.outcomes-section {
  @apply space-y-6;
}

.outcomes-container {
  @apply space-y-6;
}

.outcome-container {
  @apply border border-gray-200 rounded-lg p-6 bg-white shadow-md border-l-4 border-l-green-500;
}

.outcome-header {
  @apply mb-4;
}

.outcome-header-content {
  @apply flex items-center space-x-4 mb-2;
}

.outcome-order-controls {
  @apply flex flex-col space-y-1;
}

.outcome-title {
  @apply text-xl font-bold text-gray-900 flex-1 p-2 rounded hover:bg-gray-50 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500;
}

.outcome-budget-info {
  @apply text-sm text-gray-600 font-medium;
}

.outcome-actions {
  @apply flex items-center space-x-2;
}

.outcome-description {
  @apply text-gray-700 mb-4 p-2 rounded hover:bg-gray-50 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed;
}

.outcome-resources-section {
  @apply mb-6 p-4 bg-slate-50 rounded-md border border-gray-200;
}

/* Components */
.components-section {
  @apply space-y-4;
}

.components-container {
  @apply space-y-4;
}

.component-card {
  @apply border border-gray-300 rounded-md p-4 bg-white shadow-sm hover:shadow-md transition-shadow border-l-4 border-l-purple-500;
}

.component-header {
  @apply flex items-start justify-between mb-4;
}

.component-order-controls {
  @apply flex flex-col space-y-1 mr-4;
}

.component-info {
  @apply flex-1;
}

.component-actions {
  @apply flex items-center space-x-2;
}

.components-footer {
  @apply mt-3 flex justify-end;
}

.component-resources-header {
  @apply flex items-center justify-between mb-2;
}

.component-name {
  @apply text-lg font-semibold text-gray-900 mb-1;
}

.component-summary {
  @apply text-sm text-gray-600 mb-2;
}

.component-description {
  @apply text-sm text-gray-700 leading-relaxed;
}

.component-resources-section {
  @apply mt-4 pt-4 border-t border-gray-200;
}

.component-resources-title {
  @apply text-sm font-medium text-gray-700 mb-3;
}

.no-resources-message {
  @apply mt-4 pt-4 border-t border-gray-200;
}
</style>
