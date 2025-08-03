# Technical Architecture & Implementation Strategy

**Document Purpose**: Define the technical implementation approach for the enhanced resource type system, ensuring production-ready integration with existing ALP patterns.

---

## Architecture Overview

Based on our Phase 1 analysis and the ALP prototyping methodology, the technical architecture follows these core principles:

1. **Extend, Don't Replace**: Build upon existing ALP components and patterns
2. **Type-Safe Implementation**: Leverage TypeScript for robust type checking
3. **Performance-First**: Optimize for real-world usage patterns
4. **Integration-Ready**: Seamless integration with existing portal resources system

---

## Technology Stack

### Frontend Framework
- **Vue 3** with Composition API
- **TypeScript** for type safety
- **Vite** for development and build tooling
- **Tailwind CSS** for styling (following ALP patterns)

### UI Components
- **shadcn/ui** components (existing ALP implementation)
- **Lucide Vue** for icons
- **Headless UI** for complex interactions

### State Management
- **Pinia** for centralized state management
- **Vue Query/TanStack Query** for server state management
- **Local Storage** for user preferences and caching

### External Integrations
- **Syntaq API** for form management
- **SharePoint Graph API** for folder synchronization
- **Azure Blob Storage** for file hosting
- **Video hosting platforms** (YouTube, Vimeo, Azure Media Services)

---

## Component Architecture Implementation

### 1. Enhanced ResourceCard.vue Implementation

```typescript
// Enhanced ResourceCard.vue
<template>
  <Card class="resource-card" :class="cardClasses">
    <!-- Common header -->
    <CardHeader class="pb-3">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <ResourceTypeIcon :type="resource.type" />
          <CardTitle class="text-sm">{{ resource.name }}</CardTitle>
        </div>
        <ResourceActions 
          :resource="resource" 
          :context="context"
          @action="handleAction"
        />
      </div>
    </CardHeader>

    <!-- Type-specific content -->
    <CardContent class="pt-0">
      <Suspense>
        <component 
          :is="resourceComponent"
          :resource="resource"
          :context="context"
          :compact="compact"
          @action="handleAction"
        />
        <template #fallback>
          <div class="flex items-center justify-center h-20">
            <Loader2 class="w-4 h-4 animate-spin" />
          </div>
        </template>
      </Suspense>
    </CardContent>

    <!-- Common footer -->
    <CardFooter v-if="showMetadata" class="pt-3 border-t">
      <ResourceMetadata :resource="resource" :compact="compact" />
    </CardFooter>
  </Card>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Loader2 } from 'lucide-vue-next'
import type { Resource, ResourceContext } from '@/types/resources'

interface Props {
  resource: Resource
  context: ResourceContext
  compact?: boolean
  showMetadata?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  compact: false,
  showMetadata: true
})

// Lazy-loaded type-specific components
const resourceComponents = {
  document: defineAsyncComponent(() => import('./DocumentResourceCard.vue')),
  url: defineAsyncComponent(() => import('./UrlResourceCard.vue')),
  form: defineAsyncComponent(() => import('./FormResourceCard.vue')),
  emailTemplate: defineAsyncComponent(() => import('./EmailTemplateResourceCard.vue')),
  vdFolder: defineAsyncComponent(() => import('./VDFolderResourceCard.vue')),
  video: defineAsyncComponent(() => import('./VideoResourceCard.vue'))
}

const resourceComponent = computed(() => {
  return resourceComponents[props.resource.type] || 'div'
})

const cardClasses = computed(() => [
  'transition-all duration-200 hover:shadow-md',
  {
    'h-auto': !props.compact,
    'h-32': props.compact
  }
])

const emit = defineEmits<{
  action: [{ action: string; payload: any; resourceId: number }]
}>()

const handleAction = (action: string, payload: any) => {
  emit('action', { action, payload, resourceId: props.resource.id })
}
</script>
```

### 2. Resource Store Implementation (Pinia)

```typescript
// stores/resourceStore.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { 
  Resource, 
  ResourceFilters, 
  ResourceSorting, 
  ResourceListResponse,
  ResourceError 
} from '@/types/resources'

export const useResourceStore = defineStore('resources', () => {
  // State
  const resources = ref<Record<number, Resource>>({})
  const resourcesByEntity = ref<Record<string, number[]>>({})
  const loading = ref({
    list: false,
    detail: {} as Record<number, boolean>,
    create: false,
    update: {} as Record<number, boolean>,
    delete: {} as Record<number, boolean>
  })
  const errors = ref({
    list: null as ResourceError | null,
    detail: {} as Record<number, ResourceError>,
    create: null as ResourceError | null,
    update: {} as Record<number, ResourceError>,
    delete: {} as Record<number, ResourceError>
  })
  const filters = ref<ResourceFilters>({})
  const searchQuery = ref('')
  const sorting = ref<ResourceSorting>({
    field: 'updatedAt',
    direction: 'desc'
  })
  const pagination = ref({
    page: 1,
    pageSize: 20,
    totalCount: 0,
    totalPages: 0
  })

  // Getters
  const getResourcesByEntity = computed(() => {
    return (entityType: string, entityId: number) => {
      const key = `${entityType}:${entityId}`
      const resourceIds = resourcesByEntity.value[key] || []
      return resourceIds.map(id => resources.value[id]).filter(Boolean)
    }
  })

  const getResourceById = computed(() => {
    return (id: number) => resources.value[id]
  })

  const filteredResources = computed(() => {
    let result = Object.values(resources.value)
    
    // Apply filters
    if (filters.value.resourceTypes?.length) {
      result = result.filter(r => filters.value.resourceTypes!.includes(r.type))
    }
    
    if (filters.value.categories?.length) {
      result = result.filter(r => 
        r.categories?.some(cat => filters.value.categories!.includes(cat))
      )
    }
    
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      result = result.filter(r => 
        r.name.toLowerCase().includes(query) ||
        r.description?.toLowerCase().includes(query)
      )
    }
    
    // Apply sorting
    result.sort((a, b) => {
      const field = sorting.value.field
      const direction = sorting.value.direction === 'asc' ? 1 : -1
      
      if (field === 'name') {
        return a.name.localeCompare(b.name) * direction
      }
      
      const aValue = a[field] as any
      const bValue = b[field] as any
      
      if (aValue < bValue) return -1 * direction
      if (aValue > bValue) return 1 * direction
      return 0
    })
    
    return result
  })

  // Actions
  const fetchResources = async (entityType: string, entityId: number) => {
    loading.value.list = true
    errors.value.list = null
    
    try {
      const response = await fetch(
        `/api/resources/${entityType}/${entityId}?` + 
        new URLSearchParams({
          page: pagination.value.page.toString(),
          pageSize: pagination.value.pageSize.toString(),
          ...filters.value,
          search: searchQuery.value,
          sortField: sorting.value.field,
          sortDirection: sorting.value.direction
        })
      )
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const data: ResourceListResponse = await response.json()
      
      // Update state
      data.resources.forEach(resource => {
        resources.value[resource.id] = resource
      })
      
      const key = `${entityType}:${entityId}`
      resourcesByEntity.value[key] = data.resources.map(r => r.id)
      
      pagination.value = data.pagination
      
      return data.resources
    } catch (error) {
      errors.value.list = {
        code: 'FETCH_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error'
      }
      throw error
    } finally {
      loading.value.list = false
    }
  }

  const createResource = async (payload: any) => {
    loading.value.create = true
    errors.value.create = null
    
    try {
      const response = await fetch('/api/resources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const resource: Resource = await response.json()
      resources.value[resource.id] = resource
      
      // Update entity association
      const key = `${resource.entityType}:${resource.entityId}`
      if (!resourcesByEntity.value[key]) {
        resourcesByEntity.value[key] = []
      }
      resourcesByEntity.value[key].push(resource.id)
      
      return resource
    } catch (error) {
      errors.value.create = {
        code: 'CREATE_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error'
      }
      throw error
    } finally {
      loading.value.create = false
    }
  }

  const updateResource = async (id: number, payload: Partial<Resource>) => {
    loading.value.update[id] = true
    delete errors.value.update[id]
    
    try {
      const response = await fetch(`/api/resources/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const resource: Resource = await response.json()
      resources.value[id] = resource
      
      return resource
    } catch (error) {
      errors.value.update[id] = {
        code: 'UPDATE_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error'
      }
      throw error
    } finally {
      delete loading.value.update[id]
    }
  }

  const deleteResource = async (id: number) => {
    loading.value.delete[id] = true
    delete errors.value.delete[id]
    
    try {
      const response = await fetch(`/api/resources/${id}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      // Remove from state
      const resource = resources.value[id]
      if (resource) {
        const key = `${resource.entityType}:${resource.entityId}`
        const entityResources = resourcesByEntity.value[key] || []
        resourcesByEntity.value[key] = entityResources.filter(rid => rid !== id)
      }
      
      delete resources.value[id]
    } catch (error) {
      errors.value.delete[id] = {
        code: 'DELETE_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error'
      }
      throw error
    } finally {
      delete loading.value.delete[id]
    }
  }

  // Type-specific actions
  const downloadDocument = async (id: number): Promise<Blob> => {
    const response = await fetch(`/api/resources/${id}/download`)
    if (!response.ok) {
      throw new Error(`Download failed: ${response.statusText}`)
    }
    return response.blob()
  }

  const syncVDFolder = async (id: number): Promise<void> => {
    const response = await fetch(`/api/resources/${id}/sync`, {
      method: 'POST'
    })
    if (!response.ok) {
      throw new Error(`Sync failed: ${response.statusText}`)
    }
    
    // Refresh resource data
    const updatedResource = await fetch(`/api/resources/${id}`).then(r => r.json())
    resources.value[id] = updatedResource
  }

  const trackResourceView = async (id: number): Promise<void> => {
    // Fire and forget analytics tracking
    fetch(`/api/resources/${id}/view`, { method: 'POST' }).catch(() => {
      // Silently fail analytics tracking
    })
    
    // Update local view count optimistically
    const resource = resources.value[id]
    if (resource) {
      resource.viewCount = (resource.viewCount || 0) + 1
      resource.lastAccessedAt = new Date()
    }
  }

  return {
    // State
    resources,
    resourcesByEntity,
    loading,
    errors,
    filters,
    searchQuery,
    sorting,
    pagination,
    
    // Getters
    getResourcesByEntity,
    getResourceById,
    filteredResources,
    
    // Actions
    fetchResources,
    createResource,
    updateResource,
    deleteResource,
    downloadDocument,
    syncVDFolder,
    trackResourceView
  }
})
```

### 3. Type-Specific Component Implementation

```typescript
// DocumentResourceCard.vue
<template>
  <div class="document-resource-card space-y-3">
    <!-- File Information -->
    <div class="flex items-center gap-3">
      <div class="flex-shrink-0">
        <FileIcon :extension="resource.fileExtension" class="w-8 h-8" />
      </div>
      <div class="flex-1 min-w-0">
        <p class="text-sm font-medium truncate">{{ resource.fileName }}</p>
        <div class="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{{ formatFileSize(resource.fileSize) }}</span>
          <span>•</span>
          <span>{{ resource.fileExtension.toUpperCase() }}</span>
          <DocumentStatusBadge :status="resource.reviewStatus" />
        </div>
      </div>
    </div>

    <!-- Document Metadata -->
    <div v-if="!compact" class="grid grid-cols-2 gap-2 text-xs">
      <div v-if="resource.version" class="flex justify-between">
        <span class="text-muted-foreground">Version:</span>
        <span class="font-medium">{{ resource.version }}</span>
      </div>
      <div v-if="resource.pageCount" class="flex justify-between">
        <span class="text-muted-foreground">Pages:</span>
        <span class="font-medium">{{ resource.pageCount }}</span>
      </div>
      <div v-if="resource.language" class="flex justify-between">
        <span class="text-muted-foreground">Language:</span>
        <span class="font-medium">{{ resource.language }}</span>
      </div>
      <div class="flex justify-between">
        <span class="text-muted-foreground">Modified:</span>
        <span class="font-medium">{{ formatDate(resource.updatedAt) }}</span>
      </div>
    </div>

    <!-- Actions -->
    <div class="flex gap-2">
      <Button 
        size="sm" 
        variant="outline" 
        @click="handlePreview"
        :disabled="!canPreview"
      >
        <Eye class="w-4 h-4 mr-1" />
        Preview
      </Button>
      <Button 
        size="sm" 
        @click="handleDownload"
        :disabled="downloading"
      >
        <Download v-if="!downloading" class="w-4 h-4 mr-1" />
        <Loader2 v-else class="w-4 h-4 mr-1 animate-spin" />
        Download
      </Button>
    </div>

    <!-- Usage Analytics -->
    <div v-if="showAnalytics && !compact" class="pt-3 border-t">
      <div class="grid grid-cols-3 gap-2 text-xs text-center">
        <div>
          <p class="font-semibold text-blue-600">{{ resource.downloadCount || 0 }}</p>
          <p class="text-muted-foreground">Downloads</p>
        </div>
        <div>
          <p class="font-semibold text-green-600">{{ resource.viewCount || 0 }}</p>
          <p class="text-muted-foreground">Views</p>
        </div>
        <div>
          <p class="font-semibold text-purple-600">{{ resource.shareCount || 0 }}</p>
          <p class="text-muted-foreground">Shares</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Button } from '@/components/ui/button'
import { Eye, Download, Loader2 } from 'lucide-vue-next'
import { useResourceStore } from '@/stores/resourceStore'
import { useToast } from '@/components/ui/use-toast'
import type { EnhancedDocumentResource, ResourceContext } from '@/types/resources'

interface Props {
  resource: EnhancedDocumentResource & { type: 'document' }
  context: ResourceContext
  compact?: boolean
  showAnalytics?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  compact: false,
  showAnalytics: true
})

const emit = defineEmits<{
  action: [action: string, payload: any]
}>()

const resourceStore = useResourceStore()
const { toast } = useToast()
const downloading = ref(false)

const canPreview = computed(() => {
  const previewableTypes = ['.pdf', '.txt', '.md', '.html']
  return previewableTypes.includes(props.resource.fileExtension.toLowerCase())
})

const handlePreview = () => {
  emit('action', 'preview', { resourceId: props.resource.id })
  resourceStore.trackResourceView(props.resource.id)
}

const handleDownload = async () => {
  downloading.value = true
  try {
    const blob = await resourceStore.downloadDocument(props.resource.id)
    
    // Create download link
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = props.resource.fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    
    emit('action', 'download', { resourceId: props.resource.id })
    resourceStore.trackResourceView(props.resource.id)
    
    toast({
      title: 'Download Started',
      description: `${props.resource.fileName} is being downloaded.`
    })
  } catch (error) {
    toast({
      title: 'Download Failed',
      description: 'Unable to download the document. Please try again.',
      variant: 'destructive'
    })
  } finally {
    downloading.value = false
  }
}

// Utility functions
const formatFileSize = (bytes: number): string => {
  const sizes = ['B', 'KB', 'MB', 'GB']
  if (bytes === 0) return '0 B'
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
}

const formatDate = (date: Date | string): string => {
  const d = new Date(date)
  return d.toLocaleDateString('en-AU', { 
    day: 'numeric', 
    month: 'short',
    year: d.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
  })
}
</script>
```

---

## Performance Optimization Strategy

### 1. Component Lazy Loading

```typescript
// Lazy load type-specific components to reduce initial bundle size
const resourceComponents = {
  document: defineAsyncComponent({
    loader: () => import('./DocumentResourceCard.vue'),
    loadingComponent: ResourceCardSkeleton,
    errorComponent: ResourceCardError,
    delay: 200,
    timeout: 3000
  }),
  // ... other types
}
```

### 2. Virtual Scrolling for Large Lists

```typescript
// VirtualResourceList.vue
<template>
  <div class="virtual-resource-list" ref="containerRef">
    <div :style="{ height: totalHeight + 'px' }" class="relative">
      <div 
        v-for="item in visibleItems" 
        :key="item.id"
        :style="{ 
          position: 'absolute',
          top: item.offsetTop + 'px',
          left: 0,
          right: 0,
          height: itemHeight + 'px'
        }"
      >
        <ResourceCard 
          :resource="item.resource" 
          :context="context"
          compact
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import type { Resource, ResourceContext } from '@/types/resources'

interface Props {
  resources: Resource[]
  context: ResourceContext
  itemHeight?: number
}

const props = withDefaults(defineProps<Props>(), {
  itemHeight: 120
})

const containerRef = ref<HTMLElement>()
const scrollTop = ref(0)
const containerHeight = ref(0)

const totalHeight = computed(() => props.resources.length * props.itemHeight)

const visibleItems = computed(() => {
  const startIndex = Math.floor(scrollTop.value / props.itemHeight)
  const endIndex = Math.min(
    startIndex + Math.ceil(containerHeight.value / props.itemHeight) + 1,
    props.resources.length
  )
  
  return props.resources.slice(startIndex, endIndex).map((resource, index) => ({
    id: resource.id,
    resource,
    offsetTop: (startIndex + index) * props.itemHeight
  }))
})

const handleScroll = () => {
  if (containerRef.value) {
    scrollTop.value = containerRef.value.scrollTop
  }
}

const handleResize = () => {
  if (containerRef.value) {
    containerHeight.value = containerRef.value.clientHeight
  }
}

onMounted(() => {
  if (containerRef.value) {
    containerRef.value.addEventListener('scroll', handleScroll)
    window.addEventListener('resize', handleResize)
    handleResize()
  }
})

onUnmounted(() => {
  if (containerRef.value) {
    containerRef.value.removeEventListener('scroll', handleScroll)
  }
  window.removeEventListener('resize', handleResize)
})
</script>
```

### 3. Intelligent Caching Strategy

```typescript
// composables/useResourceCache.ts
import { ref, computed } from 'vue'
import type { Resource } from '@/types/resources'

interface CacheEntry {
  data: Resource[]
  timestamp: Date
  entityKey: string
}

const cache = ref<Map<string, CacheEntry>>(new Map())
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export function useResourceCache() {
  const getCacheKey = (entityType: string, entityId: number, filters?: any) => {
    const filterKey = filters ? JSON.stringify(filters) : ''
    return `${entityType}:${entityId}:${filterKey}`
  }

  const isCacheValid = (entry: CacheEntry): boolean => {
    return Date.now() - entry.timestamp.getTime() < CACHE_DURATION
  }

  const getCachedResources = (entityType: string, entityId: number, filters?: any) => {
    const key = getCacheKey(entityType, entityId, filters)
    const entry = cache.value.get(key)
    
    if (entry && isCacheValid(entry)) {
      return entry.data
    }
    
    return null
  }

  const setCachedResources = (
    entityType: string, 
    entityId: number, 
    resources: Resource[], 
    filters?: any
  ) => {
    const key = getCacheKey(entityType, entityId, filters)
    cache.value.set(key, {
      data: resources,
      timestamp: new Date(),
      entityKey: `${entityType}:${entityId}`
    })
  }

  const invalidateCache = (entityType?: string, entityId?: number) => {
    if (entityType && entityId) {
      const entityKey = `${entityType}:${entityId}`
      for (const [key, entry] of cache.value.entries()) {
        if (entry.entityKey === entityKey) {
          cache.value.delete(key)
        }
      }
    } else {
      cache.value.clear()
    }
  }

  const cleanupExpiredCache = () => {
    for (const [key, entry] of cache.value.entries()) {
      if (!isCacheValid(entry)) {
        cache.value.delete(key)
      }
    }
  }

  // Cleanup expired entries every minute
  setInterval(cleanupExpiredCache, 60 * 1000)

  return {
    getCachedResources,
    setCachedResources,
    invalidateCache
  }
}
```

---

## Error Handling & Resilience

### 1. Global Error Handler

```typescript
// composables/useErrorHandler.ts
import { ref } from 'vue'
import { useToast } from '@/components/ui/use-toast'
import type { ResourceError } from '@/types/resources'

export function useErrorHandler() {
  const { toast } = useToast()
  const errors = ref<ResourceError[]>([])

  const handleError = (error: ResourceError | Error, context?: string) => {
    let resourceError: ResourceError

    if (error instanceof Error) {
      resourceError = {
        code: 'UNKNOWN_ERROR',
        message: error.message,
        details: { context, stack: error.stack }
      }
    } else {
      resourceError = error
    }

    errors.value.push(resourceError)

    // Show user-friendly toast
    const userMessage = getUserFriendlyMessage(resourceError)
    toast({
      title: 'Error',
      description: userMessage,
      variant: 'destructive'
    })

    // Log to console in development
    if (import.meta.env.DEV) {
      console.error('Resource Error:', resourceError)
    }

    // Send to error tracking service in production
    if (import.meta.env.PROD) {
      // sendToErrorTracking(resourceError)
    }
  }

  const getUserFriendlyMessage = (error: ResourceError): string => {
    const messages: Record<string, string> = {
      RESOURCE_NOT_FOUND: 'The requested resource could not be found.',
      PERMISSION_DENIED: 'You do not have permission to access this resource.',
      VALIDATION_ERROR: 'Please check your input and try again.',
      SYNC_ERROR: 'Unable to synchronize with external service.',
      PROCESSING_ERROR: 'An error occurred while processing your request.',
      EXTERNAL_SERVICE_ERROR: 'External service is temporarily unavailable.',
      DOCUMENT_LOCKED: 'This document is currently being edited by another user.',
      INVALID_FILE_TYPE: 'This file type is not supported.',
      FILE_TOO_LARGE: 'The file is too large to upload.',
      SYNTAQ_API_ERROR: 'Unable to connect to form service.',
      SHAREPOINT_SYNC_FAILED: 'SharePoint synchronization failed.',
      VIDEO_PROCESSING_FAILED: 'Video processing failed.'
    }

    return messages[error.code] || error.message || 'An unexpected error occurred.'
  }

  const clearErrors = () => {
    errors.value = []
  }

  return {
    errors,
    handleError,
    clearErrors
  }
}
```

### 2. Retry Logic for External Services

```typescript
// utils/retryLogic.ts
interface RetryOptions {
  maxAttempts: number
  delay: number
  backoff: number
  retryCondition?: (error: any) => boolean
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {
    maxAttempts: 3,
    delay: 1000,
    backoff: 2
  }
): Promise<T> {
  let lastError: any
  let delay = options.delay

  for (let attempt = 1; attempt <= options.maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error
      
      // Check if we should retry
      if (
        attempt === options.maxAttempts ||
        (options.retryCondition && !options.retryCondition(error))
      ) {
        throw error
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay))
      delay *= options.backoff
    }
  }

  throw lastError
}

// Usage example
const syncVDFolder = async (id: number) => {
  return withRetry(
    () => fetch(`/api/resources/${id}/sync`, { method: 'POST' }),
    {
      maxAttempts: 3,
      delay: 1000,
      backoff: 2,
      retryCondition: (error) => error.status >= 500 || error.status === 429
    }
  )
}
```

---

## Testing Strategy

### 1. Component Testing with Vitest

```typescript
// tests/components/ResourceCard.test.ts
import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import ResourceCard from '@/components/business/resources/ResourceCard.vue'
import type { Resource, ResourceContext } from '@/types/resources'

const mockDocument: Resource = {
  id: 1,
  type: 'document',
  name: 'Test Document.pdf',
  description: 'A test document',
  fileName: 'Test Document.pdf',
  fileExtension: '.pdf',
  fileSize: 1024000,
  version: '1.0',
  reviewStatus: 'approved',
  downloadCount: 5,
  viewCount: 10,
  shareCount: 2,
  // ... other required fields
} as Resource

const mockContext: ResourceContext = {
  entityType: 'offering',
  entityId: 1,
  displayMode: 'card',
  allowActions: true,
  showMetadata: true
}

describe('ResourceCard', () => {
  it('renders document resource correctly', () => {
    const wrapper = mount(ResourceCard, {
      props: {
        resource: mockDocument,
        context: mockContext
      },
      global: {
        plugins: [createPinia()]
      }
    })

    expect(wrapper.find('[data-testid="resource-name"]').text()).toBe('Test Document.pdf')
    expect(wrapper.find('[data-testid="resource-type-icon"]').exists()).toBe(true)
  })

  it('emits action events correctly', async () => {
    const wrapper = mount(ResourceCard, {
      props: {
        resource: mockDocument,
        context: mockContext
      },
      global: {
        plugins: [createPinia()]
      }
    })

    await wrapper.find('[data-testid="download-button"]').trigger('click')
    
    expect(wrapper.emitted('action')).toBeTruthy()
    expect(wrapper.emitted('action')[0]).toEqual([{
      action: 'download',
      payload: { resourceId: 1 },
      resourceId: 1
    }])
  })

  it('handles loading states correctly', () => {
    const wrapper = mount(ResourceCard, {
      props: {
        resource: mockDocument,
        context: mockContext
      },
      global: {
        plugins: [createPinia()]
      }
    })

    // Test loading state
    expect(wrapper.find('[data-testid="loading-spinner"]').exists()).toBe(false)
  })
})
```

### 2. Integration Testing

```typescript
// tests/integration/resourceStore.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useResourceStore } from '@/stores/resourceStore'

// Mock fetch
global.fetch = vi.fn()

describe('Resource Store Integration', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('fetches resources successfully', async () => {
    const mockResponse = {
      resources: [mockDocument],
      pagination: {
        page: 1,
        pageSize: 20,
        totalCount: 1,
        totalPages: 1
      }
    }

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    } as Response)

    const store = useResourceStore()
    const resources = await store.fetchResources('offering', 1)

    expect(resources).toEqual([mockDocument])
    expect(store.resources[1]).toEqual(mockDocument)
  })

  it('handles fetch errors gracefully', async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'))

    const store = useResourceStore()
    
    await expect(store.fetchResources('offering', 1)).rejects.toThrow('Network error')
    expect(store.errors.list).toBeTruthy()
  })
})
```

### 3. E2E Testing with Playwright

```typescript
// tests/e2e/resourceManagement.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Resource Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/offerings/1')
  })

  test('displays resource cards correctly', async ({ page }) => {
    await expect(page.locator('[data-testid="resource-card"]')).toBeVisible()
    await expect(page.locator('[data-testid="resource-name"]')).toContainText('Test Document')
  })

  test('downloads document resource', async ({ page }) => {
    const downloadPromise = page.waitForEvent('download')
    await page.click('[data-testid="download-button"]')
    const download = await downloadPromise
    expect(download.suggestedFilename()).toBe('Test Document.pdf')
  })

  test('filters resources by type', async ({ page }) => {
    await page.click('[data-testid="filter-button"]')
    await page.check('[data-testid="filter-document"]')
    await page.click('[data-testid="apply-filters"]')
    
    await expect(page.locator('[data-testid="resource-card"]')).toHaveCount(1)
  })

  test('searches resources', async ({ page }) => {
    await page.fill('[data-testid="search-input"]', 'Test Document')
    await page.press('[data-testid="search-input"]', 'Enter')
    
    await expect(page.locator('[data-testid="resource-card"]')).toHaveCount(1)
  })
})
```

---

## Deployment Strategy

### 1. Build Configuration

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@/components': resolve(__dirname, 'src/components'),
      '@/types': resolve(__dirname, 'src/types'),
      '@/stores': resolve(__dirname, 'src/stores'),
      '@/composables': resolve(__dirname, 'src/composables')
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate chunks for better caching
          'resource-types': [
            'src/components/business/resources/DocumentResourceCard.vue',
            'src/components/business/resources/UrlResourceCard.vue',
            'src/components/business/resources/FormResourceCard.vue',
            'src/components/business/resources/EmailTemplateResourceCard.vue',
            'src/components/business/resources/VDFolderResourceCard.vue',
            'src/components/business/resources/VideoResourceCard.vue'
          ],
          'ui-components': [
            'src/components/ui/button.vue',
            'src/components/ui/card.vue',
            'src/components/ui/input.vue'
          ]
        }
      }
    }
  },
  optimizeDeps: {
    include: ['vue', 'pinia', 'lucide-vue-next']
  }
})
```

### 2. Environment Configuration

```typescript
// .env.development
VITE_API_BASE_URL=http://localhost:5000/api
VITE_SYNTAQ_API_URL=https://api.syntaq.com
VITE_SHAREPOINT_SITE_URL=https://yourcompany.sharepoint.com/sites/alp
VITE_VIDEO_HOSTING_PROVIDER=azure
VITE_ENABLE_ANALYTICS=true
VITE_CACHE_DURATION=300000

// .env.production
VITE_API_BASE_URL=https://api.alp.com.au
VITE_SYNTAQ_API_URL=https://api.syntaq.com
VITE_SHAREPOINT_SITE_URL=https://yourcompany.sharepoint.com/sites/alp
VITE_VIDEO_HOSTING_PROVIDER=azure
VITE_ENABLE_ANALYTICS=true
VITE_CACHE_DURATION=300000
```

### 3. Progressive Enhancement Strategy

```typescript
// Progressive enhancement for older browsers
// utils/featureDetection.ts
export const supportsWebP = (): boolean => {
  const canvas = document.createElement('canvas')
  canvas.width = 1
  canvas.height = 1
  return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0
}

export const supportsIntersectionObserver = (): boolean => {
  return 'IntersectionObserver' in window
}

export const supportsResizeObserver = (): boolean => {
  return 'ResizeObserver' in window
}

// Polyfill loading
export const loadPolyfills = async (): Promise<void> => {
  const polyfills = []

  if (!supportsIntersectionObserver()) {
    polyfills.push(import('intersection-observer'))
  }

  if (!supportsResizeObserver()) {
    polyfills.push(import('resize-observer-polyfill'))
  }

  await Promise.all(polyfills)
}
```

---

## Security Considerations

### 1. Content Security Policy

```typescript
// Security headers configuration
const securityHeaders = {
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://api.syntaq.com",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "connect-src 'self' https://api.syntaq.com https://graph.microsoft.com",
    "frame-src 'self' https://www.youtube.com https://player.vimeo.com",
    "media-src 'self' https:"
  ].join('; '),
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin'
}
```

### 2. Input Sanitization

```typescript
// utils/sanitization.ts
import DOMPurify from 'dompurify'

export const sanitizeHtml = (html: string): string => {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'ol', 'ul', 'li'],
    ALLOWED_ATTR: []
  })
}

export const sanitizeFileName = (fileName: string): string => {
  return fileName.replace(/[^a-zA-Z0-9.-]/g, '_')
}

export const validateFileType = (fileName: string, allowedTypes: string[]): boolean => {
  const extension = fileName.toLowerCase().split('.').pop()
  return allowedTypes.includes(`.${extension}`)
}
```

### 3. Authentication Integration

```typescript
// composables/useAuth.ts
import { ref, computed } from 'vue'
import type { User } from '@/types/auth'

const currentUser = ref<User | null>(null)
const isAuthenticated = computed(() => !!currentUser.value)

export function useAuth() {
  const hasPermission = (resource: Resource, action: string): boolean => {
    if (!currentUser.value) return false

    // Check resource-specific permissions
    const userPermissions = resource.permissions?.find(
      p => p.userId === currentUser.value!.id
    )

    if (userPermissions) {
      return checkActionPermission(userPermissions.permissionType, action)
    }

    // Check access level permissions
    return checkAccessLevelPermission(resource.accessLevel, action)
  }

  const checkActionPermission = (permissionType: string, action: string): boolean => {
    const permissionMatrix = {
      read: ['view', 'download'],
      write: ['view', 'download', 'edit', 'share'],
      admin: ['view', 'download', 'edit', 'share', 'delete', 'manage']
    }

    return permissionMatrix[permissionType]?.includes(action) || false
  }

  const checkAccessLevelPermission = (accessLevel: string, action: string): boolean => {
    if (accessLevel === 'public') return ['view', 'download'].includes(action)
    if (accessLevel === 'restricted') return currentUser.value?.role === 'admin'
    return false
  }

  return {
    currentUser,
    isAuthenticated,
    hasPermission
  }
}
```

---

## Monitoring & Analytics

### 1. Performance Monitoring

```typescript
// utils/performance.ts
export class PerformanceMonitor {
  private static instance: PerformanceMonitor
  private metrics: Map<string, number[]> = new Map()

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor()
    }
    return PerformanceMonitor.instance
  }

  startTiming(label: string): void {
    performance.mark(`${label}-start`)
  }

  endTiming(label: string): number {
    performance.mark(`${label}-end`)
    performance.measure(label, `${label}-start`, `${label}-end`)
    
    const measure = performance.getEntriesByName(label)[0]
    const duration = measure.duration

    if (!this.metrics.has(label)) {
      this.metrics.set(label, [])
    }
    this.metrics.get(label)!.push(duration)

    return duration
  }

  getAverageTime(label: string): number {
    const times = this.metrics.get(label) || []
    return times.reduce((sum, time) => sum + time, 0) / times.length
  }

  reportMetrics(): void {
    const report = {}
    for (const [label, times] of this.metrics.entries()) {
      report[label] = {
        average: this.getAverageTime(label),
        count: times.length,
        min: Math.min(...times),
        max: Math.max(...times)
      }
    }

    console.table(report)
    
    // Send to analytics service
    if (import.meta.env.PROD) {
      // sendToAnalytics(report)
    }
  }
}

// Usage in components
export function usePerformanceMonitoring() {
  const monitor = PerformanceMonitor.getInstance()

  const trackComponentLoad = (componentName: string) => {
    monitor.startTiming(`component-${componentName}`)
    
    onMounted(() => {
      monitor.endTiming(`component-${componentName}`)
    })
  }

  const trackAction = (actionName: string, fn: () => Promise<any>) => {
    return async () => {
      monitor.startTiming(`action-${actionName}`)
      try {
        return await fn()
      } finally {
        monitor.endTiming(`action-${actionName}`)
      }
    }
  }

  return {
    trackComponentLoad,
    trackAction
  }
}
```

### 2. User Analytics

```typescript
// composables/useAnalytics.ts
import { ref } from 'vue'

interface AnalyticsEvent {
  event: string
  category: string
  action: string
  label?: string
  value?: number
  userId?: number
  timestamp: Date
}

export function useAnalytics() {
  const events = ref<AnalyticsEvent[]>([])

  const track = (
    category: string,
    action: string,
    label?: string,
    value?: number
  ) => {
    const event: AnalyticsEvent = {
      event: 'user_action',
      category,
      action,
      label,
      value,
      timestamp: new Date()
    }

    events.value.push(event)

    // Send to analytics service
    if (import.meta.env.VITE_ENABLE_ANALYTICS === 'true') {
      sendAnalyticsEvent(event)
    }
  }

  const trackResourceView = (resource: Resource) => {
    track('resource', 'view', resource.type, resource.id)
  }

  const trackResourceAction = (resource: Resource, action: string) => {
    track('resource', action, resource.type, resource.id)
  }

  const trackSearchQuery = (query: string, resultCount: number) => {
    track('search', 'query', query, resultCount)
  }

  const sendAnalyticsEvent = async (event: AnalyticsEvent) => {
    try {
      await fetch('/api/analytics/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event)
      })
    } catch (error) {
      console.warn('Failed to send analytics event:', error)
    }
  }

  return {
    track,
    trackResourceView,
    trackResourceAction,
    trackSearchQuery
  }
}
```

---

## Conclusion

This technical architecture provides:

1. **Production-Ready Implementation**: Complete Vue 3 + TypeScript architecture
2. **Performance Optimization**: Lazy loading, virtual scrolling, intelligent caching
3. **Error Handling & Resilience**: Comprehensive error handling and retry logic
4. **Testing Strategy**: Unit, integration, and E2E testing approaches
5. **Security Considerations**: CSP, input sanitization, authentication integration
6. **Monitoring & Analytics**: Performance monitoring and user analytics
7. **Deployment Strategy**: Build configuration and progressive enhancement

The architecture ensures:
- **Seamless ALP Integration**: Builds upon existing patterns and components
- **Type Safety**: Comprehensive TypeScript implementation
- **Scalability**: Optimized for large datasets and concurrent users
- **Maintainability**: Clean architecture with separation of concerns
- **Extensibility**: Easy to add new resource types and features

---

**Document Status**: ✅ Complete  
**Related Documents**: 
- [Component Architecture](./component-architecture.md) - Vue component specifications
- [Data Models](./data-models.md) - TypeScript interfaces and structures
- [Integration Plan](./integration-plan.md) - ALP integration strategy
- [Resource Field Analysis](../01-discovery-analysis/Resource_Field_Analysis.md) - Metadata structures
