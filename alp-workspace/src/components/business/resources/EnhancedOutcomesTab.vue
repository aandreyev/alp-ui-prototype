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
              :actions="['preview', 'open']"
              @click="openResourceDetail"
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
                :actions="['preview', 'open']"
                @click="openResourceDetail"
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
                    :actions="['preview', 'open']"
                    @click="openResourceDetail"
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Button } from '@/lib/registry/new-york/ui/button'
import { Input } from '@/lib/registry/new-york/ui/input'
import { Checkbox } from '@/lib/registry/new-york/ui/checkbox'
import { 
  Plus, 
  Folder, 
  Play, 
  Trash2
} from 'lucide-vue-next'
import ComponentResourcesModal from './ComponentResourcesModal.vue'
import ResourceDetailModal from './ResourceDetailModal.vue'
import ResourceCard from './ResourceCard.vue'
import ResourceFilters from './ResourceFilters.vue'
import ResourceSummary from './ResourceSummary.vue'
import type { Resource, ResourceMetadata, ResourceFilterState } from '@/alp-types/resources.types'

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

// Sample data - in real implementation, this would come from API
const offerings = ref<EnhancedOffering[]>([
  {
    id: 'offering-1',
    name: 'Make a claim for unfair dismissal',
    sharePointUrl: 'https://sharepoint.example.com/unfair-dismissal',
    resources: [
      {
        id: 'offering-resource-1',
        name: 'Unfair Dismissal Overview',
        description: 'Complete overview of unfair dismissal laws, procedures, and your rights as an employee. Essential reading before proceeding with any claim.',
        type: 'document',
        url: '/documents/unfair-dismissal-overview.pdf',
        metadata: {
          author: 'Employment Law Team',
          version: 'v3.0',
          lastModified: '2024-01-20',
          tags: ['unfair dismissal', 'overview', 'employee rights']
        },
        createdAt: '2024-01-10T00:00:00Z',
        updatedAt: '2024-01-20T00:00:00Z'
      },
      {
        id: 'offering-resource-2',
        name: 'Initial Assessment Checklist',
        description: 'Pre-screening checklist to determine if you have grounds for an unfair dismissal claim. Complete this before booking a consultation.',
        type: 'form',
        url: '/forms/initial-assessment',
        metadata: {
          author: 'Legal Assessment Team',
          version: 'v2.5',
          lastModified: '2024-01-18',
          tags: ['assessment', 'checklist', 'pre-screening']
        },
        createdAt: '2024-01-05T00:00:00Z',
        updatedAt: '2024-01-18T00:00:00Z'
      }
    ],
    outcomes: [
      {
        id: 'outcome-1',
        title: 'You would like us to act as your executor and/or trustee.',
        offeringId: 'offering-1',
        resources: [
          {
            id: 'resource-1',
            name: 'Executor Appointment Guide',
            description: 'Comprehensive guide covering the legal requirements and responsibilities for executor appointments, including step-by-step procedures and compliance requirements.',
            type: 'document',
            url: '/documents/executor-guide.pdf',
            metadata: {
              author: 'Legal Team',
              version: 'v2.1',
              lastModified: '2024-01-15',
              tags: ['executor', 'appointment', 'guide']
            },
            createdAt: '2024-01-15T00:00:00Z',
            updatedAt: '2024-01-15T00:00:00Z'
          },
          {
            id: 'resource-2',
            name: 'Trustee Responsibilities Checklist',
            description: 'Interactive checklist outlining all trustee duties and responsibilities, with checkboxes for tracking completion of required tasks.',
            type: 'form',
            url: '/forms/trustee-checklist.pdf',
            metadata: {
              author: 'Legal Team',
              version: 'v1.3',
              lastModified: '2024-01-10',
              tags: ['trustee', 'responsibilities', 'checklist']
            },
            createdAt: '2024-01-10T00:00:00Z',
            updatedAt: '2024-01-10T00:00:00Z'
          }
        ],
        components: [
          {
            id: 'component-1',
            title: "'Charging Letter' for executor role",
            status: 'pending',
            units: { completed: 0, total: 0 },
            dueDate: undefined,
            resources: [
              {
                id: 'resource-3',
                name: 'Executor Charging Letter Template',
                type: 'template',
                url: '/templates/executor-charging-letter.docx',
                metadata: {
                  author: 'Legal Template Team',
                  version: 'v1.0',
                  lastModified: '2024-01-05',
                  tags: ['executor', 'charging', 'letter', 'template']
                },
                createdAt: '2024-01-05T00:00:00Z',
                updatedAt: '2024-01-05T00:00:00Z'
              },
              {
                id: 'resource-4',
                name: 'Fee Structure Guidelines',
                type: 'document',
                url: '/documents/fee-structure.pdf',
                metadata: {
                  author: 'Finance Team',
                  version: 'v2.0',
                  lastModified: '2024-01-12',
                  tags: ['fees', 'structure', 'guidelines']
                },
                createdAt: '2024-01-12T00:00:00Z',
                updatedAt: '2024-01-12T00:00:00Z'
              }
            ]
          }
        ]
      },
      {
        id: 'outcome-2',
        title: 'You would like to update your estate planning documents to pass on your wealth when you die, including an update to your Will and associated documents.',
        offeringId: 'offering-1',
        resources: [
          {
            id: 'resource-5',
            name: 'Estate Planning Overview',
            type: 'document',
            url: '/documents/estate-planning-overview.pdf',
            metadata: {
              author: 'Estate Planning Team',
              version: 'v3.1',
              lastModified: '2024-01-20',
              tags: ['estate', 'planning', 'overview']
            },
            createdAt: '2024-01-20T00:00:00Z',
            updatedAt: '2024-01-20T00:00:00Z'
          },
          {
            id: 'resource-6',
            name: 'Estate Planning Resources Database',
            type: 'url',
            url: 'https://resources.example.com/estate-planning',
            metadata: {
              author: 'External Provider',
              version: 'vCurrent',
              lastModified: '2024-01-25',
              tags: ['estate', 'planning', 'database', 'external']
            },
            createdAt: '2024-01-25T00:00:00Z',
            updatedAt: '2024-01-25T00:00:00Z'
          }
        ],
        components: [
          {
            id: 'component-2',
            title: 'Prepare an update to existing Wills',
            status: 'in-progress',
            units: { completed: 0, total: 22 },
            dueDate: undefined,
            resources: [
              {
                id: 'resource-7',
                name: 'Will Amendment Template',
                type: 'template',
                url: '/templates/will-amendment.docx',
                metadata: {
                  author: 'Legal Template Team',
                  version: 'v2.1',
                  lastModified: '2024-01-18',
                  tags: ['will', 'amendment', 'template']
                },
                createdAt: '2024-01-18T00:00:00Z',
                updatedAt: '2024-01-18T00:00:00Z'
              },
              {
                id: 'resource-8',
                name: 'Will Review Checklist',
                type: 'form',
                url: '/forms/will-review-checklist.pdf',
                metadata: {
                  author: 'Legal Team',
                  version: 'v1.5',
                  lastModified: '2024-01-16',
                  tags: ['will', 'review', 'checklist']
                },
                createdAt: '2024-01-16T00:00:00Z',
                updatedAt: '2024-01-16T00:00:00Z'
              },
              {
                id: 'resource-9',
                name: 'Legal Precedents Database',
                type: 'url',
                url: 'https://precedents.example.com/wills',
                metadata: {
                  author: 'Legal Research Team',
                  version: 'vCurrent',
                  lastModified: '2024-01-22',
                  tags: ['legal', 'precedents', 'database']
                },
                createdAt: '2024-01-22T00:00:00Z',
                updatedAt: '2024-01-22T00:00:00Z'
              }
            ]
          },
          {
            id: 'component-3',
            title: 'Prepare a Codicil',
            status: 'pending',
            units: { completed: 0, total: 22 },
            dueDate: undefined,
            resources: [
              {
                id: 'resource-10',
                name: 'Codicil Template',
                type: 'template',
                url: '/templates/codicil.docx',
                metadata: {
                  author: 'Legal Template Team',
                  version: 'v1.2',
                  lastModified: '2024-01-14',
                  tags: ['codicil', 'template']
                },
                createdAt: '2024-01-14T00:00:00Z',
                updatedAt: '2024-01-14T00:00:00Z'
              },
              {
                id: 'resource-11',
                name: 'Codicil Drafting Guidelines',
                type: 'document',
                url: '/documents/codicil-guidelines.pdf',
                metadata: {
                  author: 'Legal Team',
                  version: 'v1.8',
                  lastModified: '2024-01-19',
                  tags: ['codicil', 'drafting', 'guidelines']
                },
                createdAt: '2024-01-19T00:00:00Z',
                updatedAt: '2024-01-19T00:00:00Z'
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'offering-2',
    name: 'TEST Offering',
    sharePointUrl: 'https://sharepoint.example.com/test-offering',
    outcomes: [
      {
        id: 'outcome-3',
        title: 'TEST Offering Outcome',
        offeringId: 'offering-2',
        resources: [
          {
            id: 'resource-12',
            name: 'Test Resource Document',
            type: 'document',
            url: '/documents/test-resource.pdf',
            metadata: {
              author: 'Test Team',
              version: 'v1.0',
              lastModified: '2024-01-01',
              tags: ['test', 'resource']
            },
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z'
          }
        ],
        components: [
          {
            id: 'component-4',
            title: 'TEST DELETE ME',
            status: 'pending',
            units: { completed: 0, total: 10 },
            dueDate: undefined,
            resources: [
              {
                id: 'resource-13',
                name: 'Test Component Template',
                type: 'template',
                url: '/templates/test-component.docx',
                metadata: {
                  author: 'Test Team',
                  version: 'v1.0',
                  lastModified: '2024-01-01',
                  tags: ['test', 'component', 'template']
                },
                createdAt: '2024-01-01T00:00:00Z',
                updatedAt: '2024-01-01T00:00:00Z'
              },
              {
                id: 'resource-14',
                name: 'Test External Link',
                type: 'url',
                url: 'https://example.com/test',
                metadata: {
                  author: 'External',
                  version: 'vCurrent',
                  lastModified: '2024-01-01',
                  tags: ['test', 'external', 'link']
                },
                createdAt: '2024-01-01T00:00:00Z',
                updatedAt: '2024-01-01T00:00:00Z'
              }
            ]
          }
        ]
      }
    ]
  }
])

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

const openResourceDetail = (resource: Resource) => {
  selectedResource.value = resource
  resourceDetailModalVisible.value = true
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
      // For documents, forms, and templates, open in new tab or download
      window.open(resource.url, '_blank')
      break
    default:
      console.log('Opening resource:', resource.name)
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
  console.log('Deleting component:', component.title)
  // Handle component deletion
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
    openResourceDetail(resource)
  }
}

const closeResourceDetailModal = () => {
  resourceDetailModalVisible.value = false
  selectedResource.value = null
}

const handleResourceAction = (action: string, resource: Resource) => {
  console.log('Resource action:', action, resource.name)
  // Handle resource actions from ResourceCard
  if (action === 'preview') {
    openResourceDetail(resource)
  } else if (action === 'open') {
    openResource(resource)
  }
}

const handleResourceDetailAction = (action: string, resource: Resource) => {
  console.log('Resource detail action:', action, resource.name)
  // Handle resource detail actions (open, copy, etc.)
}
</script>

<style scoped>
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
  @apply border border-gray-200 rounded-md p-5 bg-slate-50 shadow-sm mb-4;
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
  @apply border border-gray-300 rounded-md p-4 bg-white shadow-sm hover:shadow-md transition-shadow mb-3;
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
