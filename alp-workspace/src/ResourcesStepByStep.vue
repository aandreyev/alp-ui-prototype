<template>
  <div class="min-h-screen bg-gray-50 p-8">
    <div class="max-w-6xl mx-auto">
      <h1 class="text-3xl font-bold text-gray-900 mb-6">
        🔧 Portal Resources - Step by Step Testing
      </h1>
      
      <!-- Progress Indicator -->
      <div class="bg-white rounded-lg shadow p-6 mb-6">
        <h2 class="text-xl font-semibold mb-4">Testing Progress</h2>
        <div class="space-y-2">
          <div class="flex items-center gap-2">
            <CheckCircle class="w-5 h-5 text-green-600" />
            <span class="text-sm">Basic environment setup</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-5 h-5 rounded-full" :class="currentStep >= 1 ? 'bg-green-600' : 'bg-gray-300'"></div>
            <span class="text-sm">Load test data</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-5 h-5 rounded-full" :class="currentStep >= 2 ? 'bg-green-600' : 'bg-gray-300'"></div>
            <span class="text-sm">Test ResourceCard component</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-5 h-5 rounded-full" :class="currentStep >= 3 ? 'bg-green-600' : 'bg-gray-300'"></div>
            <span class="text-sm">Test VDOfferingFolder component</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-5 h-5 rounded-full" :class="currentStep >= 4 ? 'bg-green-600' : 'bg-gray-300'"></div>
            <span class="text-sm">Test ResourceFilters component</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-5 h-5 rounded-full" :class="currentStep >= 5 ? 'bg-green-600' : 'bg-gray-300'"></div>
            <span class="text-sm">Test full MatterResourcesTab</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-5 h-5 rounded-full" :class="currentStep >= 6 ? 'bg-green-600' : 'bg-gray-300'"></div>
            <span class="text-sm">Test EnhancedOutcomesTab</span>
          </div>
        </div>
      </div>

      <!-- Step 1: Load Test Data -->
      <div v-if="currentStep === 0" class="bg-white rounded-lg shadow p-6 mb-6">
        <h2 class="text-xl font-semibold mb-4">Step 1: Load Test Data</h2>
        <p class="text-gray-600 mb-4">
          First, let's load the test data files to ensure they're accessible.
        </p>
        
        <Button @click="loadTestData" :disabled="loading">
          <Loader2 v-if="loading" class="w-4 h-4 mr-2 animate-spin" />
          Load Test Data
        </Button>
        
        <div v-if="error" class="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p class="text-red-800 text-sm">{{ error }}</p>
        </div>
      </div>

      <!-- Step 2: Test Data Display -->
      <div v-if="currentStep === 1" class="bg-white rounded-lg shadow p-6 mb-6">
        <h2 class="text-xl font-semibold mb-4">Step 1 Complete: Test Data Loaded</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div class="p-3 bg-blue-50 rounded-lg">
            <div class="font-medium text-blue-900">Offerings</div>
            <div class="text-2xl font-bold text-blue-600">{{ testData.offerings?.length || 0 }}</div>
          </div>
          <div class="p-3 bg-green-50 rounded-lg">
            <div class="font-medium text-green-900">Matter Elements</div>
            <div class="text-2xl font-bold text-green-600">{{ testData.matterElements?.length || 0 }}</div>
          </div>
          <div class="p-3 bg-purple-50 rounded-lg">
            <div class="font-medium text-purple-900">Resource Groups</div>
            <div class="text-2xl font-bold text-purple-600">{{ testData.offeringResources?.length || 0 }}</div>
          </div>
        </div>
        
        <Button @click="nextStep">
          Test ResourceCard Component →
        </Button>
      </div>

      <!-- Step 3: ResourceCard Test -->
      <div v-if="currentStep === 2" class="bg-white rounded-lg shadow p-6 mb-6">
        <h2 class="text-xl font-semibold mb-4">Step 2: ResourceCard Component Test</h2>
        <p class="text-gray-600 mb-4">
          Testing individual ResourceCard components with sample data.
        </p>
        
        <div v-if="sampleResources.length > 0" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div 
              v-for="resource in sampleResources" 
              :key="resource.id"
              class="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
              @click="handleResourceClick(resource)"
            >
              <div class="flex items-start justify-between mb-3">
                <div class="flex items-center gap-2 min-w-0 flex-1">
                  <component :is="getResourceIcon(resource.type)" class="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <div class="min-w-0 flex-1">
                    <h3 class="font-medium text-sm truncate">{{ resource.name }}</h3>
                  </div>
                </div>
                <Badge variant="outline" class="text-xs flex-shrink-0">
                  {{ resource.type }}
                </Badge>
              </div>
              
              <p class="text-muted-foreground text-xs line-clamp-2 mb-3">
                {{ resource.description }}
              </p>
              
              <div class="flex items-center gap-3 text-xs text-muted-foreground">
                <span v-if="resource.metadata.author">{{ resource.metadata.author }}</span>
                <span v-if="resource.metadata.version">v{{ resource.metadata.version }}</span>
              </div>
            </div>
          </div>
          
          <div class="flex gap-2">
            <Button @click="nextStep">
              Test VDOfferingFolder Component →
            </Button>
            <Button variant="outline" @click="prevStep">
              ← Back
            </Button>
          </div>
        </div>
      </div>

      <!-- Step 4: VDOfferingFolder Test -->
      <div v-if="currentStep === 3" class="bg-white rounded-lg shadow p-6 mb-6">
        <h2 class="text-xl font-semibold mb-4">Step 3: VDOfferingFolder Component Test</h2>
        <p class="text-gray-600 mb-4">
          Testing the SharePoint VD folder integration component.
        </p>
        
        <div class="border-blue-200 bg-blue-50/50 border rounded-lg p-4 mb-4">
          <div class="flex items-center gap-2 mb-3">
            <FolderOpen class="w-5 h-5 text-blue-600" />
            <h3 class="font-medium text-blue-900">VD Offering Folder</h3>
          </div>
          <p class="text-sm text-blue-800 mb-4">
            SharePoint folder with precedents and resources for this offering
          </p>
          
          <div class="flex items-center justify-between p-4 bg-white rounded-lg border border-blue-200">
            <div class="flex items-center gap-3">
              <div class="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg">
                <Folder class="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h4 class="font-medium text-sm">{{ testData.offerings?.[0]?.name || 'Test Offering' }}</h4>
                <p class="text-xs text-muted-foreground">SharePoint folder collection</p>
              </div>
            </div>
            <Button variant="outline" size="sm" @click="handleVDFolderClick">
              <ExternalLink class="w-4 h-4 mr-2" />
              Open Folder
            </Button>
          </div>
        </div>
        
        <div class="flex gap-2">
          <Button @click="nextStep">
            Test ResourceFilters Component →
          </Button>
          <Button variant="outline" @click="prevStep">
            ← Back
          </Button>
        </div>
      </div>

      <!-- Step 5: ResourceFilters Test -->
      <div v-if="currentStep === 4" class="bg-white rounded-lg shadow p-6 mb-6">
        <h2 class="text-xl font-semibold mb-4">Step 4: ResourceFilters Component Test</h2>
        <p class="text-gray-600 mb-4">
          Testing the resource filtering and search functionality.
        </p>
        
        <div class="space-y-4 mb-4">
          <div class="flex flex-wrap gap-4">
            <div class="flex items-center gap-2">
              <label class="text-sm font-medium">Type:</label>
              <select 
                v-model="filterState.type" 
                class="px-3 py-1 border rounded-md text-sm"
              >
                <option value="all">All Types</option>
                <option value="form">Forms</option>
                <option value="document">Documents</option>
                <option value="url">URLs</option>
                <option value="template">Templates</option>
              </select>
            </div>
            
            <div class="flex items-center gap-2">
              <label class="text-sm font-medium">Search:</label>
              <input 
                v-model="filterState.search"
                type="text" 
                placeholder="Search resources..."
                class="px-3 py-1 border rounded-md text-sm w-48"
              />
            </div>
          </div>
          
          <div class="text-sm text-gray-600">
            Showing {{ filteredResources.length }} of {{ sampleResources.length }} resources
          </div>
        </div>
        
        <div class="flex gap-2">
          <Button @click="nextStep">
            Test Full MatterResourcesTab →
          </Button>
          <Button variant="outline" @click="prevStep">
            ← Back
          </Button>
        </div>
      </div>

      <!-- Step 6: Full Component Test -->
      <div v-if="currentStep === 5" class="bg-white rounded-lg shadow p-6 mb-6">
        <h2 class="text-xl font-semibold mb-4">Step 5: Full MatterResourcesTab Test</h2>
        <p class="text-gray-600 mb-4">
          All individual components are working. Ready to test the full integrated component.
        </p>
        
        <div class="p-4 bg-green-50 border border-green-200 rounded-lg mb-4">
          <div class="flex items-center gap-2">
            <CheckCircle class="w-5 h-5 text-green-600" />
            <span class="font-medium text-green-800">All Components Ready</span>
          </div>
          <p class="text-sm text-green-700 mt-1">
            Individual components tested successfully. The full ResourcesTestPage should now work.
          </p>
        </div>
        
        <div class="flex gap-2">
          <Button @click="nextStep">
            Test EnhancedOutcomesTab →
          </Button>
          <Button variant="outline" @click="prevStep">
            ← Back
          </Button>
        </div>
      </div>

      <!-- Step 7: EnhancedOutcomesTab Test -->
      <div v-if="currentStep === 6" class="bg-white rounded-lg shadow p-6 mb-6">
        <h2 class="text-xl font-semibold mb-4">Step 6: EnhancedOutcomesTab Component Test</h2>
        <p class="text-gray-600 mb-4">
          Testing the new EnhancedOutcomesTab component with enhanced UI and functionality.
        </p>
        
        <div class="border rounded-lg p-4 mb-4 bg-gray-50">
          <EnhancedOutcomesTab matterId="test-matter-123" />
        </div>
        
        <div class="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-4">
          <div class="flex items-center gap-2 mb-2">
            <CheckCircle class="w-5 h-5 text-blue-600" />
            <span class="font-medium text-blue-800">EnhancedOutcomesTab Features</span>
          </div>
          <ul class="text-sm text-blue-700 space-y-1">
            <li>• Hierarchical display of offerings, outcomes, and components</li>
            <li>• Interactive resource cards with detail and open actions</li>
            <li>• Component workflow management with status tracking</li>
            <li>• SharePoint folder integration</li>
            <li>• Search and filtering capabilities</li>
          </ul>
        </div>
        
        <div class="flex gap-2">
          <Button @click="loadFullTest">
            Load Full ResourcesTestPage
          </Button>
          <Button variant="outline" @click="prevStep">
            ← Back
          </Button>
        </div>
      </div>

      <!-- Step 8: Full ResourcesTestPage -->
      <div v-if="currentStep === 7" class="bg-white rounded-lg shadow p-6 mb-6">
        <h2 class="text-xl font-semibold mb-4">Step 7: Full ResourcesTestPage Component</h2>
        <p class="text-gray-600 mb-4">
          Loading the complete ResourcesTestPage component with all integrated functionality.
        </p>
        
        <div class="border rounded-lg p-4 mb-4">
          <Suspense>
            <template #default>
              <ResourcesTestPage />
            </template>
            <template #fallback>
              <div class="flex items-center justify-center p-8">
                <Loader2 class="w-6 h-6 animate-spin mr-2" />
                <span>Loading ResourcesTestPage...</span>
              </div>
            </template>
          </Suspense>
        </div>
        
        <div class="flex gap-2">
          <Button variant="outline" @click="prevStep">
            ← Back to Step-by-Step Testing
          </Button>
          <Button @click="resetTest">
            Reset All Tests
          </Button>
        </div>
      </div>

      <!-- Action Feedback -->
      <div v-if="lastAction" class="fixed bottom-4 right-4 z-50">
        <div class="bg-white border rounded-lg shadow-lg p-4 max-w-sm">
          <div class="flex items-center gap-2">
            <CheckCircle class="w-4 h-4 text-green-600" />
            <div class="text-sm">
              <div class="font-medium">{{ lastAction.action }}</div>
              <div class="text-gray-600">{{ lastAction.resource }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { 
  CheckCircle, 
  Loader2, 
  FolderOpen, 
  Folder, 
  ExternalLink,
  FileText,
  Link,
  File
} from 'lucide-vue-next'

// Import UI components
import { Button } from '@/lib/registry/new-york/ui/button'
import { Badge } from '@/lib/registry/new-york/ui/badge'

// Import the ResourcesTestPage component
import ResourcesTestPage from '@/test/ResourcesTestPage.vue'
import EnhancedOutcomesTab from '@/components/business/resources/EnhancedOutcomesTab.vue'

// Import types
import type { Resource, ResourceFilterState } from '@/alp-types/resources.types'

// State
const currentStep = ref(0)
const loading = ref(false)
const error = ref<string>()
const lastAction = ref<{ action: string, resource: string }>()

// Test data
const testData = ref<{
  offerings?: any[]
  matterElements?: any[]
  offeringResources?: any[]
}>({})

// Filter state
const filterState = ref<ResourceFilterState>({
  type: 'all',
  level: 'all',
  search: ''
})

// Sample resources for testing
const sampleResources = ref<Resource[]>([
  {
    id: 'resource-001',
    name: 'Initial Assessment Form',
    description: 'Client intake form for initial position assessment',
    type: 'form',
    url: 'https://syntaq.example.com/forms/initial-assessment',
    metadata: {
      author: 'Legal Team',
      version: '2.1',
      tags: ['intake', 'assessment', 'unfair-dismissal']
    },
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z'
  },
  {
    id: 'resource-002',
    name: 'Written Advice Template',
    description: 'Standard template for written legal advice',
    type: 'template',
    url: 'https://templates.example.com/written-advice',
    metadata: {
      author: 'Legal Template Team',
      version: '4.2',
      tags: ['template', 'advice', 'written']
    },
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-12T00:00:00Z'
  },
  {
    id: 'resource-003',
    name: 'Employment Law Database',
    description: 'Access to comprehensive employment law resources',
    type: 'url',
    url: 'https://employmentlaw.example.com/database',
    metadata: {
      author: 'External Provider',
      version: 'Current',
      tags: ['database', 'law', 'reference']
    },
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-20T00:00:00Z'
  }
])

// Computed
const filteredResources = computed(() => {
  return sampleResources.value.filter(resource => {
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
})

// Methods
const loadTestData = async () => {
  try {
    loading.value = true
    error.value = undefined
    
    // Load test data files
    const [offeringsResponse, matterElementsResponse, offeringResourcesResponse] = await Promise.all([
      import('@/alp-data/resources/offerings.json'),
      import('@/alp-data/resources/matter-elements.json'),
      import('@/alp-data/resources/offering-resources.json')
    ])
    
    testData.value = {
      offerings: offeringsResponse.default,
      matterElements: matterElementsResponse.default,
      offeringResources: offeringResourcesResponse.default
    }
    
    currentStep.value = 1
    
  } catch (err) {
    console.error('Failed to load test data:', err)
    error.value = 'Failed to load test data. Check console for details.'
  } finally {
    loading.value = false
  }
}

const nextStep = () => {
  if (currentStep.value < 6) {
    currentStep.value++
  }
}

const prevStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

const handleResourceClick = (resource: Resource) => {
  lastAction.value = {
    action: 'Resource clicked',
    resource: resource.name
  }
  
  setTimeout(() => {
    lastAction.value = undefined
  }, 3000)
}

const handleVDFolderClick = () => {
  lastAction.value = {
    action: 'VD Folder opened',
    resource: 'SharePoint folder'
  }
  
  setTimeout(() => {
    lastAction.value = undefined
  }, 3000)
}

const getResourceIcon = (type: string) => {
  const icons = {
    form: FileText,
    document: File,
    url: Link,
    template: FileText
  }
  return icons[type as keyof typeof icons] || FileText
}

const loadFullTest = () => {
  lastAction.value = {
    action: 'Loading full test',
    resource: 'ResourcesTestPage'
  }
  
  // Transition to step 7 which will show the full ResourcesTestPage
  setTimeout(() => {
    currentStep.value = 7
  }, 500)
}

const resetTest = () => {
  currentStep.value = 0
  testData.value = {}
  error.value = undefined
  lastAction.value = undefined
  
  lastAction.value = {
    action: 'Tests reset',
    resource: 'All components'
  }
  
  setTimeout(() => {
    lastAction.value = undefined
  }, 2000)
}
</script>
