<template>
  <div class="resources-tab p-6 space-y-6">
    <!-- Header Section -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-semibold tracking-tight">Matter Resources</h2>
        <p class="text-muted-foreground">
          Access all resources associated with this matter at the point of need
        </p>
      </div>
      
      <!-- Quick Actions -->
      <div class="flex items-center space-x-2">
        <Button variant="outline" size="sm" @click="refreshResources">
          <RefreshCw class="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="space-y-4">
      <div class="animate-pulse">
        <div class="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div class="space-y-3">
          <div class="h-20 bg-gray-200 rounded"></div>
          <div class="h-20 bg-gray-200 rounded"></div>
          <div class="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="rounded-lg border border-red-200 bg-red-50 p-4">
      <div class="flex items-center">
        <AlertTriangle class="h-5 w-5 text-red-600 mr-3" />
        <div>
          <h3 class="text-sm font-medium text-red-800">Unable to load resources</h3>
          <p class="text-sm text-red-700 mt-1">{{ error }}</p>
        </div>
      </div>
      <div class="mt-4">
        <Button variant="outline" size="sm" @click="refreshResources">
          Try Again
        </Button>
      </div>
    </div>

    <!-- Main Content -->
    <div v-else class="space-y-6">
      <!-- VD Offering Folder -->
      <VDOfferingFolder 
        v-if="offeringData?.offering?.vdFolderUrl"
        :offering="offeringData.offering"
      />

      <!-- Resource Filters -->
      <ResourceFilters 
        v-model="filterState"
        :total-resources="totalResourceCount"
      />

      <!-- Resource Hierarchy -->
      <ResourceHierarchy 
        v-if="offeringData?.outcomes?.length"
        :outcomes="filteredOutcomes"
        @resource-click="handleResourceClick"
      />

      <!-- Empty State -->
      <div v-else class="text-center py-12">
        <FolderOpen class="mx-auto h-12 w-12 text-gray-400" />
        <h3 class="mt-2 text-sm font-medium text-gray-900">No resources available</h3>
        <p class="mt-1 text-sm text-gray-500">
          This matter doesn't have any associated resources yet.
        </p>
      </div>
    </div>

    <!-- Resource Modal -->
    <ResourceModal 
      v-if="selectedResource"
      :resource="selectedResource"
      :visible="modalVisible"
      @close="closeResourceModal"
      @action="handleResourceAction"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { AlertTriangle, RefreshCw, FolderOpen } from 'lucide-vue-next'

// Import types
import type { 
  OfferingWithResources, 
  Resource, 
  ResourceFilterState,
  MatterElementWithResources,
  ResourceError 
} from '@/alp-types/resources.types'

// Import components (will be created next)
import VDOfferingFolder from './VDOfferingFolder.vue'
import ResourceFilters from './ResourceFilters.vue'
import ResourceHierarchy from './ResourceHierarchy.vue'
import ResourceModal from './ResourceModal.vue'
import { Button } from '@/lib/registry/new-york/ui/button'

// Props
interface Props {
  matterId: string
}

const props = defineProps<Props>()

// State
const loading = ref(false)
const error = ref<string>()
const offeringData = ref<OfferingWithResources>()
const selectedResource = ref<Resource>()
const modalVisible = ref(false)

// Filter state
const filterState = ref<ResourceFilterState>({
  type: 'all',
  level: 'all',
  search: ''
})

// Computed properties
const totalResourceCount = computed(() => {
  if (!offeringData.value?.outcomes) return 0
  
  return offeringData.value.outcomes.reduce((total, outcome) => {
    const outcomeResources = outcome.resources?.length || 0
    const componentResources = outcome.children?.reduce((sum, component) => 
      sum + (component.resources?.length || 0), 0) || 0
    return total + outcomeResources + componentResources
  }, 0)
})

const filteredOutcomes = computed(() => {
  if (!offeringData.value?.outcomes) return []
  
  return offeringData.value.outcomes.map(outcome => ({
    ...outcome,
    resources: filterResources(outcome.resources || []),
    children: outcome.children?.map(component => ({
      ...component,
      resources: filterResources(component.resources || [])
    })).filter(component => 
      component.resources.length > 0 || filterState.value.search === ''
    )
  })).filter(outcome => 
    (outcome.resources?.length || 0) > 0 || 
    (outcome.children?.length || 0) > 0 ||
    filterState.value.search === ''
  )
})

// Methods
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
             resource.metadata.tags?.some(tag => tag.toLowerCase().includes(searchLower))
    }
    
    return true
  })
}

const loadMatterResources = async () => {
  try {
    loading.value = true
    error.value = undefined
    
    // Load matter elements
    const matterElementsResponse = await import('@/alp-data/resources/matter-elements.json')
    const matterElements = matterElementsResponse.default.filter(
      (element: any) => element.matterId === props.matterId
    )
    
    // Load offering resources
    const offeringResourcesResponse = await import('@/alp-data/resources/offering-resources.json')
    const offeringResources = offeringResourcesResponse.default
    
    // Load offering info
    const offeringsResponse = await import('@/alp-data/resources/offerings.json')
    const offering = offeringsResponse.default[0] // Using first offering for prototype
    
    // Build hierarchy with resources
    const outcomes = matterElements
      .filter((element: any) => element.type === 'outcome')
      .map((outcome: any) => {
        // Get resources for this outcome
        const outcomeResourceData = offeringResources.find(
          (or: any) => or.offeringElementId === outcome.linkedOfferingElementId
        )
        
        // Get child components
        const components = matterElements
          .filter((element: any) => element.type === 'component' && element.parentId === outcome.id)
          .map((component: any) => {
            const componentResourceData = offeringResources.find(
              (or: any) => or.offeringElementId === component.linkedOfferingElementId
            )
            
            return {
              ...component,
              resources: componentResourceData?.resources || []
            }
          })
        
        return {
          ...outcome,
          resources: outcomeResourceData?.resources || [],
          children: components
        }
      })
    
    offeringData.value = {
      offering,
      outcomes
    }
    
  } catch (err) {
    console.error('Failed to load matter resources:', err)
    error.value = 'Failed to load resources. Please try again.'
  } finally {
    loading.value = false
  }
}

const refreshResources = () => {
  loadMatterResources()
}

const handleResourceClick = (resource: Resource) => {
  selectedResource.value = resource
  modalVisible.value = true
}

const closeResourceModal = () => {
  modalVisible.value = false
  selectedResource.value = undefined
}

const handleResourceAction = (action: string, resource: Resource) => {
  console.log(`Resource action: ${action}`, resource)
  
  switch (action) {
    case 'open':
      if (resource.url) {
        window.open(resource.url, '_blank', 'noopener,noreferrer')
      }
      break
    case 'copy':
      if (resource.url) {
        navigator.clipboard.writeText(resource.url)
        // Could show toast notification here
      }
      break
    // Handle other actions...
  }
}

// Lifecycle
onMounted(() => {
  loadMatterResources()
})

// Watch for matter changes
watch(() => props.matterId, () => {
  loadMatterResources()
})
</script>

<style scoped>
.resources-tab {
  min-height: 600px;
}
</style>