<template>
  <div class="p-8 space-y-8">
    <div class="max-w-4xl mx-auto">
      <h1 class="text-3xl font-bold mb-2">Simplified Resource Modals</h1>
      <p class="text-muted-foreground mb-8">
        Test the simplified resource creation and editing modals for all resource types.
      </p>

      <!-- Resource Type Selection -->
      <div class="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <Button
          v-for="(config, type) in resourceTypes"
          :key="type"
          variant="outline"
          class="h-20 flex flex-col items-center gap-2"
          @click="openCreateModal(type as ResourceType)"
        >
          <component :is="config.icon" class="w-6 h-6" />
          <span class="text-sm">Create {{ config.label }}</span>
        </Button>
      </div>

      <!-- Sample Resources for Editing -->
      <div class="space-y-6">
        <h2 class="text-xl font-semibold">Sample Resources (Click to Edit)</h2>
        
        <div class="grid gap-4">
          <div
            v-for="resource in sampleResources"
            :key="resource.id"
            class="border rounded-lg p-4 hover:bg-muted/50 cursor-pointer transition-colors"
            @click="openEditModal(resource)"
          >
            <div class="flex items-center gap-3">
              <component :is="resourceTypes[(resource.type === 'template' ? 'document' : resource.type) as ModalResourceType].icon" class="w-5 h-5" />
              <div class="flex-1">
                <h3 class="font-medium">{{ resource.name }}</h3>
                <p class="text-sm text-muted-foreground">{{ resource.description }}</p>
                <div class="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                  <span>{{ resourceTypes[(resource.type === 'template' ? 'document' : resource.type) as ModalResourceType].label }}</span>
                  <span>•</span>
                  <span>{{ formatDate(resource.updatedAt) }}</span>
                  <span v-if="resource.metadata.tags?.length">•</span>
                  <div v-if="resource.metadata.tags?.length" class="flex gap-1">
                    <span
                      v-for="tag in resource.metadata.tags.slice(0, 3)"
                      :key="tag"
                      class="bg-muted px-1 rounded text-xs"
                    >
                      {{ tag }}
                    </span>
                  </div>
                </div>
              </div>
              <Button variant="ghost" size="sm">
                <Edit class="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <!-- Results Display -->
      <div v-if="lastAction" class="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg">
        <h3 class="font-medium text-green-900 mb-2">{{ lastAction.type }} Successful!</h3>
        <pre class="text-sm text-green-800 overflow-auto">{{ JSON.stringify(lastAction.resource, null, 2) }}</pre>
      </div>
    </div>

    <!-- Simplified Resource Modal -->
    <SimplifiedResourceModal
      :is-open="modalState.isOpen"
      :mode="modalState.mode"
      :resource-type="modalState.resourceType"
      :resource="modalState.resource"
      @close="handleModalClose"
      @created="handleResourceCreated"
      @updated="handleResourceUpdated"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Edit } from 'lucide-vue-next'

// UI Components
import { Button } from '@/lib/registry/new-york/ui/button'

// Simplified Resource Modal
import SimplifiedResourceModal from '@/components/business/resources-add-edit/SimplifiedResourceModal.vue'
import { loadAllResources } from '@/alp-data/resources/loadAllResources'
import type { Resource, ResourceType } from '@/alp-types/resources.types'

// Resource type configurations
import { 
  FileText, 
  Link, 
  FileCheck, 
  Mail, 
  Video, 
  Folder
} from 'lucide-vue-next'

// Use canonical Resource and ResourceType

const resourceTypes: Record<Exclude<ResourceType,'template'>, { label: string; icon: any }> = {
  document: { label: 'Document', icon: FileText },
  url: { label: 'URL', icon: Link },
  form: { label: 'Form', icon: FileCheck },
  emailTemplate: { label: 'Email Template', icon: Mail },
  video: { label: 'Video', icon: Video },
  vdFolder: { label: 'SharePoint Folder', icon: Folder }
}

// Modal state
type ModalResourceType = Exclude<ResourceType,'template'>
const modalState = ref<{
  isOpen: boolean
  mode: 'create' | 'edit'
  resourceType: ModalResourceType
  resource: Resource | null
}>({
  isOpen: false,
  mode: 'create',
  resourceType: 'document',
  resource: null
})

// Last action result
const lastAction = ref<{
  type: string
  resource: Resource
} | null>(null)

// Sample resources for testing (centralized JSON)
const sampleResources = ref<Resource[]>([])

// Lazy-load the JSON to avoid bundling issues and keep parity with other data imports
loadAllResources<Resource>().then(data => {
  sampleResources.value = data
})

/**
 * Open create modal for specific resource type
 */
function openCreateModal(resourceType: ResourceType) {
  modalState.value = {
    isOpen: true,
    mode: 'create',
  resourceType: (resourceType === 'template' ? 'document' : resourceType) as ModalResourceType,
    resource: null
  }
}

/**
 * Open edit modal for existing resource
 */
function openEditModal(resource: Resource) {
  modalState.value = {
    isOpen: true,
    mode: 'edit',
  resourceType: (resource.type === 'template' ? 'document' : resource.type) as ModalResourceType,
    resource
  }
}

/**
 * Handle modal close
 */
function handleModalClose() {
  modalState.value.isOpen = false
}

/**
 * Handle resource created
 */
function handleResourceCreated(resource: any) {
  console.log('Resource created:', resource)
  lastAction.value = {
    type: 'Create',
    resource
  }
  
  // Add to sample resources for demo
  sampleResources.value.unshift(resource)
}

/**
 * Handle resource updated
 */
function handleResourceUpdated(resource: any) {
  console.log('Resource updated:', resource)
  lastAction.value = {
    type: 'Update',
    resource
  }
  
  // Update in sample resources for demo
  const index = sampleResources.value.findIndex(r => r.id === resource.id)
  if (index !== -1) {
    sampleResources.value[index] = resource
  }
}

/**
 * Format date for display
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(date)
}
</script>
