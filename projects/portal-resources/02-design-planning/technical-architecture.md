# Technical Architecture - Portal Resources

## System Architecture Overview

The Portal Resources system integrates into the existing ALP architecture using Vue 3 composition patterns, TypeScript interfaces, and established ALP UI components while maintaining clear separation of concerns.

## Technology Stack Alignment

### Core Technologies
- **Vue 3**: Composition API for component logic
- **TypeScript**: Strong typing for data structures and interfaces  
- **Vite**: Build tool integration with existing ALP setup
- **Vue Router**: Integration with existing ALP routing
- **Pinia**: State management following ALP patterns

### UI Framework
- **shadcn/ui (New York variant)**: Component library consistency
- **Tailwind CSS**: Utility-first styling matching ALP
- **Lucide Icons**: Icon library used in existing ALP
- **Class Variance Authority**: Component variant management

---

## Data Architecture

### Test Data Structure

**Critical Architecture Note**: Resources are linked to current offering structures, not copied to matters. See constraints documentation for full details.

```typescript
// /alp-workspace/src/alp-data/resources/
interface ResourceDataStructure {
  offerings: Offering[]
  outcomes: Outcome[]
  components: Component[]
  resources: Resource[]
  resourceAssociations: ResourceAssociation[]
  matterOfferingLinks: MatterOfferingLink[]  // Links matter elements to offering elements
}

interface Offering {
  id: string
  name: string
  description: string
  vdFolderUrl?: string
  createdAt: string
  updatedAt: string
}

interface Outcome {
  id: string
  offeringId: string
  name: string
  description: string
  sequence: number
}

interface Component {
  id: string
  outcomeId: string
  name: string
  description: string
  sequence: number
}

interface Resource {
  id: string
  name: string
  description?: string
  type: ResourceType
  url?: string
  filePath?: string
  metadata: ResourceMetadata
  createdAt: string
  updatedAt: string
}

type ResourceType = 'form' | 'document' | 'url' | 'template'

interface ResourceMetadata {
  fileSize?: number
  mimeType?: string
  tags?: string[]
  author?: string
  version?: string
  lastModified?: string
}

interface ResourceAssociation {
  id: string
  resourceId: string
  associationType: 'offering' | 'outcome' | 'component'
  associationId: string  // Links to CURRENT offering structure
  sequence?: number
}

interface MatterElement {
  id: string
  matterId: string
  type: 'outcome' | 'component'
  name: string                    // Copied from offering at matter creation
  parentId?: string
  sequence: number
  linkedOfferingElementId?: string // Current offering element ID (updated by background process)
  createdAt: string
}

// Simplified - matter elements directly contain the current link
```

### Data Loading Strategy

```typescript
// /alp-workspace/src/composables/useResourcesData.ts
export const useResourcesData = (matterId: string) => {
  const resources = ref<Resource[]>([])
  const offering = ref<OfferingWithResources>()
  const loading = ref(false)
  const error = ref<string>()

  // Load test data from JSON files
  const loadResources = async () => {
    try {
      loading.value = true
      
      // Load static test data
      const [
        offeringsData,
        outcomesData, 
        componentsData,
        resourcesData,
        associationsData
      ] = await Promise.all([
        import('@/alp-data/resources/offerings.json'),
        import('@/alp-data/resources/outcomes.json'),
        import('@/alp-data/resources/components.json'),
        import('@/alp-data/resources/resources.json'),
        import('@/alp-data/resources/associations.json')
      ])

      // Build hierarchical structure
      const hierarchicalData = buildResourceHierarchy(
        offeringsData.default,
        outcomesData.default,
        componentsData.default,
        resourcesData.default,
        associationsData.default,
        matterId
      )

      offering.value = hierarchicalData.offering
      resources.value = hierarchicalData.resources
      
    } catch (err) {
      error.value = 'Failed to load resources'
      console.error('Resource loading error:', err)
    } finally {
      loading.value = false
    }
  }

  const buildResourceHierarchy = async (matterId: string) => {
    // 1. Load matter structure (copied outcomes/components with original names)
    const matterElements = await loadMatterElements(matterId)
    
    // 2. For each matter element, fetch resources from its linked offering element
    const enrichedElements = await Promise.all(
      matterElements.map(async (element) => {
        // Each matter element has linkedOfferingElementId
        const resources = element.linkedOfferingElementId 
          ? await getResourcesForOfferingElement(element.linkedOfferingElementId)
          : [] // Empty if offering element was deleted
          
        return {
          ...element,
          resources
        }
      })
    )
    
    // 3. Build UI hierarchy using matter structure with fetched resources
    // Matter structure never changes, but resources are always current
    return buildUIHierarchy(enrichedElements)
  }

  return {
    resources: readonly(resources),
    offering: readonly(offering),
    loading: readonly(loading),
    error: readonly(error),
    loadResources
  }
}
```

---

## Component Integration Architecture

### ALP Integration Points

#### 1. Router Integration

```typescript
// /alp-workspace/src/router/matter-routes.ts
const matterRoutes = [
  {
    path: '/matters/:matterId',
    component: MatterLayout,
    children: [
      { path: '', redirect: 'overview' },
      { path: 'overview', component: MatterOverview },
      { path: 'info', component: MatterInfo },
      { path: 'outcomes', component: MatterOutcomes },
      { 
        path: 'resources', 
        component: () => import('@/components/business/resources/MatterResourcesTab.vue'),
        props: true 
      },
      // ... other routes
    ]
  }
]
```

#### 2. Tab Navigation Integration

```vue
<!-- Existing MatterLayout.vue enhancement -->
<template>
  <div class="matter-layout">
    <MatterHeader :matter="matter" />
    
    <nav class="matter-tabs">
      <router-link 
        v-for="tab in matterTabs" 
        :key="tab.name"
        :to="`/matters/${matterId}/${tab.path}`"
        class="tab-link"
        :class="{ active: $route.path.includes(tab.path) }"
      >
        <component :is="tab.icon" class="w-4 h-4" />
        {{ tab.label }}
        <span v-if="tab.badge" class="badge">{{ tab.badge }}</span>
      </router-link>
    </nav>

    <div class="matter-content">
      <router-view :matter-id="matterId" />
    </div>
  </div>
</template>

<script setup lang="ts">
// Add Resources tab to existing tabs
const matterTabs = computed(() => [
  { name: 'overview', path: 'overview', label: 'Overview', icon: 'Eye' },
  { name: 'info', path: 'info', label: 'Info', icon: 'Info' },
  { name: 'outcomes', path: 'outcomes', label: 'Outcomes', icon: 'Target' },
  { 
    name: 'resources', 
    path: 'resources', 
    label: 'Resources', 
    icon: 'FolderOpen',
    badge: resourceCount.value > 0 ? resourceCount.value : undefined
  },
  // ... other tabs
])
</script>
```

### State Management Architecture

```typescript
// /alp-workspace/src/stores/resourcesStore.ts
export const useResourcesStore = defineStore('resources', () => {
  // Global resource cache
  const resourceCache = ref<Map<string, OfferingWithResources>>(new Map())
  const filterState = ref<ResourceFilterState>({
    type: 'all',
    level: 'all',
    search: ''
  })

  // Actions
  const cacheResources = (matterId: string, data: OfferingWithResources) => {
    resourceCache.value.set(matterId, data)
  }

  const getCachedResources = (matterId: string) => {
    return resourceCache.value.get(matterId)
  }

  const updateFilterState = (newFilter: Partial<ResourceFilterState>) => {
    filterState.value = { ...filterState.value, ...newFilter }
  }

  return {
    resourceCache: readonly(resourceCache),
    filterState: readonly(filterState),
    cacheResources,
    getCachedResources,
    updateFilterState
  }
})
```

---

## Modal System Integration

### ALP Modal Consistency

```typescript
// /alp-workspace/src/components/business/resources/ResourceModal.vue
<template>
  <Dialog :open="visible" @update:open="handleClose">
    <DialogContent class="max-w-2xl">
      <DialogHeader>
        <DialogTitle class="flex items-center gap-2">
          <component :is="resourceTypeIcon" class="w-5 h-5" />
          {{ resource.name }}
        </DialogTitle>
        <DialogDescription>
          {{ hierarchyPath }}
        </DialogDescription>
      </DialogHeader>

      <div class="space-y-4">
        <ResourceDetails :resource="resource" />
        <ResourceActions 
          :resource="resource" 
          @action="handleResourceAction"
        />
        <RelatedResources 
          v-if="relatedResources?.length"
          :resources="relatedResources"
        />
      </div>

      <DialogFooter>
        <Button variant="outline" @click="handleClose">
          Cancel
        </Button>
        <Button @click="handlePrimaryAction">
          {{ primaryActionLabel }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog'

// Integration with existing ALP modal patterns
</script>
```

---

## Performance Architecture

### Lazy Loading Strategy

```typescript
// Component lazy loading
const ResourceModal = defineAsyncComponent({
  loader: () => import('./ResourceModal.vue'),
  loadingComponent: ModalSkeleton,
  errorComponent: ModalError,
  delay: 200,
  timeout: 3000
})

// Data lazy loading
const useResourcesLazyLoading = () => {
  const loadedChunks = ref<Set<string>>(new Set())
  
  const loadResourceChunk = async (level: 'offering' | 'outcome' | 'component', id: string) => {
    const chunkKey = `${level}-${id}`
    
    if (loadedChunks.value.has(chunkKey)) {
      return // Already loaded
    }

    // Load specific chunk of resources
    const chunkData = await import(`@/alp-data/resources/${level}/${id}.json`)
    loadedChunks.value.add(chunkKey)
    
    return chunkData.default
  }

  return { loadResourceChunk }
}
```

### Caching Strategy

```typescript
// Resource caching with TTL
const useResourceCache = () => {
  const cache = ref<Map<string, CacheEntry>>(new Map())
  const TTL = 5 * 60 * 1000 // 5 minutes

  interface CacheEntry {
    data: any
    timestamp: number
  }

  const set = (key: string, data: any) => {
    cache.value.set(key, {
      data,
      timestamp: Date.now()
    })
  }

  const get = (key: string) => {
    const entry = cache.value.get(key)
    
    if (!entry) return null
    
    if (Date.now() - entry.timestamp > TTL) {
      cache.value.delete(key)
      return null
    }
    
    return entry.data
  }

  return { set, get }
}
```

---

## External Integration Architecture

### SharePoint URL Handling

```typescript
// /alp-workspace/src/utils/external-links.ts
export const handleExternalLink = (url: string, type: 'sharepoint' | 'generic' = 'generic') => {
  // Validate URL
  if (!isValidUrl(url)) {
    throw new Error('Invalid URL provided')
  }

  // Security checks
  if (type === 'sharepoint' && !isSharePointUrl(url)) {
    console.warn('URL does not appear to be a SharePoint URL:', url)
  }

  // Open in new tab/window
  const newWindow = window.open(url, '_blank', 'noopener,noreferrer')
  
  if (!newWindow) {
    // Popup blocked, provide fallback
    navigator.clipboard.writeText(url)
    toast.info('Link copied to clipboard (popup blocked)')
  }

  // Analytics/tracking if needed
  trackExternalLinkClick(url, type)
}

const isValidUrl = (url: string): boolean => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

const isSharePointUrl = (url: string): boolean => {
  return url.includes('sharepoint.com') || url.includes('.sharepoint.')
}
```

### Error Handling Architecture

```typescript
// /alp-workspace/src/composables/useErrorHandling.ts
export const useResourceErrorHandling = () => {
  const handleResourceError = (error: ResourceError, context: string) => {
    console.error(`Resource error in ${context}:`, error)

    switch (error.type) {
      case 'NETWORK_ERROR':
        toast.error('Network connection issue. Please check your connection.')
        break
        
      case 'PERMISSION_DENIED':
        toast.error('You do not have permission to access this resource.')
        break
        
      case 'RESOURCE_NOT_FOUND':
        toast.error('Resource not found. It may have been moved or deleted.')
        break
        
      case 'EXTERNAL_LINK_FAILED':
        toast.error('External link could not be opened. Link copied to clipboard.')
        navigator.clipboard.writeText(error.url || '')
        break
        
      default:
        toast.error('An unexpected error occurred. Please try again.')
    }

    // Report to error tracking service if available
    if (typeof window.errorTracker !== 'undefined') {
      window.errorTracker.captureException(error, { context })
    }
  }

  return { handleResourceError }
}
```

---

## Development Environment Setup

### File Structure

```
/alp-workspace/src/
├── components/
│   └── business/
│       └── resources/
│           ├── MatterResourcesTab.vue
│           ├── VDOfferingFolders.vue
│           ├── ResourceHierarchy.vue
│           ├── ResourceCard.vue
│           ├── ResourceModal.vue
│           └── ResourceFilters.vue
├── composables/
│   ├── useResourcesData.ts
│   ├── useResourceCache.ts
│   └── useResourceErrorHandling.ts
├── stores/
│   └── resourcesStore.ts
├── alp-data/
│   └── resources/
│       ├── offerings.json
│       ├── outcomes.json
│       ├── components.json
│       ├── resources.json
│       └── associations.json
├── types/
│   └── resources.ts
└── utils/
    └── external-links.ts
```

### TypeScript Configuration

```typescript
// /alp-workspace/src/types/resources.ts
export interface ResourcesTypeDefinitions {
  // All TypeScript interfaces for the system
  // Extends existing ALP type patterns
  // Strong typing for all data structures
}

// Import in main type definitions
declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    // Global properties available to all components
  }
}
```

### Build Integration

```typescript
// vite.config.ts additions for resource system
export default defineConfig({
  // ... existing config
  resolve: {
    alias: {
      '@/components/resources': path.resolve(__dirname, 'src/components/business/resources'),
      '@/alp-data': path.resolve(__dirname, 'src/alp-data')
    }
  }
})
```

---

This technical architecture provides a comprehensive foundation for implementing the Portal Resources system while maintaining seamless integration with existing ALP patterns and ensuring optimal performance and maintainability.