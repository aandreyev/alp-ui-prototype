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
        <Button size="sm" @click="addOfferingResource">
          <Plus class="h-4 w-4 mr-2" />
          Add Offering Resource
        </Button>
      </div>
      <div class="resources-container">
        <ResourceSummary
          v-for="resource in offering.associatedResources"
          :key="resource.id"
          :resource="resource"
          :actions="['preview', 'open']"
          @click="openResourceDetail"
          @action="handleResourceAction"
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
        <Button @click="createOutcome">
          <Plus class="h-4 w-4 mr-2" />
          Create Outcome
        </Button>
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
              <Button variant="outline" size="sm" @click="moveOutcome(outcome)">
                <ArrowRight class="h-4 w-4 mr-2" />
                Move
              </Button>
              <Button variant="outline" size="sm" @click="mergeOutcome(outcome)">
                <Merge class="h-4 w-4 mr-2" />
                Merge
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
          <div v-if="outcome.associatedResources.length > 0" class="outcome-resources-section">
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
                :actions="['preview', 'open']"
                @click="openResourceDetail"
                @action="handleResourceAction"
              />
            </div>
          </div>

          <!-- Add Outcome Resource (if no resources) -->
          <div v-else class="empty-resources-section">
            <Button variant="outline" size="sm" @click="addOutcomeResource(outcome)">
              <Plus class="h-4 w-4 mr-2" />
              Add Resource
            </Button>
          </div>

          <!-- Components Section -->
          <div class="components-section">
            <div class="subsection-header">
              <h4 class="subsection-title">Components ({{ outcome.components.length }})</h4>
              <Button variant="outline" size="sm" @click="addComponent(outcome)">
                <Plus class="h-4 w-4 mr-2" />
                Add Component
              </Button>
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
                  <h6 class="component-resources-title">Associated Resources ({{ component.resourceCount }})</h6>
                  <div class="resources-container">
                    <ResourceSummary
                      v-for="resource in component.associatedResources"
                      :key="resource.id"
                      :resource="resource"
                      :actions="['preview', 'open']"
                      @click="openResourceDetail"
                      @action="handleResourceAction"
                    />
                  </div>
                </div>

                <!-- No Resources Message -->
                <div v-else class="no-resources-message">
                  <p class="text-sm text-gray-500">No resources associated with this component</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Component Designer Drawer -->
    <ComponentDesignerDrawer
      :is-open="showComponentDesigner"
      :component="selectedComponent"
      @close="closeComponentDesigner"
      @save="saveComponent"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
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
  ChevronDown
} from 'lucide-vue-next'
import ResourceSummary from '@/components/business/resources/ResourceSummary.vue'
import ComponentDesignerDrawer from './ComponentDesignerDrawer.vue'
import type { Resource } from '@/alp-types/resources.types'

// Import mock data
import simplifiedOfferingsData from '@/alp-data/resource-association/simplified-offerings.json'

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
const offering = ref<SimplifiedOffering>(simplifiedOfferingsData.offerings[0] as SimplifiedOffering)
const showComponentDesigner = ref(false)
const selectedComponent = ref<SimplifiedComponent | null>(null)

// Methods - Placeholder implementations
const openSharePointFolder = () => {
  window.open(offering.value.sharePointUrl, '_blank')
}

const duplicateOffering = () => {
  alert('Duplicate Offering functionality - Coming Soon!')
}

const addOfferingResource = () => {
  alert('Resource Association Modal (Offering Level) - Coming Soon!')
}

const addOutcomeResource = (outcome: SimplifiedOutcome) => {
  alert(`Resource Association Modal (Outcome: ${outcome.title}) - Coming Soon!`)
}

const addComponent = (outcome: SimplifiedOutcome) => {
  alert(`Add Component to Outcome: ${outcome.title} - Coming Soon!`)
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
  offering.value.outcomes.forEach(outcome => {
    const componentIndex = outcome.components.findIndex(c => c.id === updatedComponent.id)
    if (componentIndex !== -1) {
      outcome.components[componentIndex] = updatedComponent
    }
  })
  
  console.log('Component saved:', updatedComponent.name)
  closeComponentDesigner()
}

const createOutcome = () => {
  alert('Create New Outcome - Coming Soon!')
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
  console.log('Opening resource detail:', resource.name)
  // Placeholder - would open resource detail modal
}

const handleResourceAction = (action: string, resource: Resource) => {
  console.log('Resource action:', action, resource.name)
  if (action === 'open') {
    window.open(resource.url, '_blank')
  }
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

// Component action methods
const removeComponent = (component: SimplifiedComponent, outcome: SimplifiedOutcome) => {
  const componentIndex = outcome.components.findIndex(c => c.id === component.id)
  if (componentIndex !== -1) {
    if (confirm(`Are you sure you want to remove "${component.name}"?`)) {
      outcome.components.splice(componentIndex, 1)
      console.log('Removed component:', component.name)
    }
  }
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

onMounted(() => {
  console.log('SimplifiedOfferingDesigner mounted with offering:', offering.value.name)
})
</script>

<style scoped>
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
  @apply border border-gray-300 rounded-md p-4 bg-white shadow-sm hover:shadow-md transition-shadow;
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
