<template>
  <div class="p-6 max-w-7xl mx-auto">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-foreground mb-2">Resource Management System - Phase 2 Demo</h1>
      <p class="text-muted-foreground">
        Testing the core components with all 6 resource types. This demonstrates the configuration-driven architecture.
      </p>
    </div>

    <!-- Resource Type Selector -->
    <div class="mb-6">
      <h2 class="text-xl font-semibold mb-4">Select Resource Type to Test</h2>
      <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
        <button
          v-for="(config, type) in resourceConfigs"
          :key="type"
          @click="selectedResourceType = type"
          :class="[
            'flex items-center gap-3 p-4 border rounded-lg transition-colors',
            selectedResourceType === type 
              ? 'border-primary bg-primary/10 text-primary' 
              : 'border-border hover:border-primary/50 hover:bg-muted/50'
          ]"
        >
          <component :is="config.icon" class="w-5 h-5" />
          <div class="text-left">
            <div class="font-medium">{{ config.pluralLabel }}</div>
            <div class="text-xs text-muted-foreground">{{ config.description.split(',')[0] }}</div>
          </div>
        </button>
      </div>
    </div>

    <!-- Component Demo -->
    <div class="space-y-8">
      <!-- Configuration Display -->
      <div class="bg-muted/50 border rounded-lg p-4">
        <h3 class="font-semibold mb-2">Current Configuration</h3>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span class="text-muted-foreground">Type:</span>
            <span class="ml-2 font-medium">{{ selectedConfig.label }}</span>
          </div>
          <div>
            <span class="text-muted-foreground">Columns:</span>
            <span class="ml-2 font-medium">{{ selectedConfig.tableColumns.length }}</span>
          </div>
          <div>
            <span class="text-muted-foreground">Actions:</span>
            <span class="ml-2 font-medium">{{ selectedConfig.actions.length }}</span>
          </div>
          <div>
            <span class="text-muted-foreground">Config Component:</span>
            <span class="ml-2 font-medium">{{ selectedConfig.configComponent }}</span>
          </div>
        </div>
      </div>

      <!-- Demo Controls -->
      <div class="flex flex-wrap gap-4">
        <Button @click="showAddModal = true" class="bg-primary text-primary-foreground">
          <Plus class="w-4 h-4 mr-2" />
          Test Add Modal
        </Button>
        <Button @click="showEditModal = true" variant="outline">
          <Edit class="w-4 h-4 mr-2" />
          Test Edit Modal
        </Button>
        <Button @click="showTagInput = !showTagInput" variant="outline">
          <Tag class="w-4 h-4 mr-2" />
          Test Tag Input
        </Button>
        <Button @click="refreshDemoData" variant="outline">
          <RotateCcw class="w-4 h-4 mr-2" />
          Refresh Demo Data
        </Button>
      </div>

      <!-- Tag Input Demo -->
      <div v-if="showTagInput" class="border rounded-lg p-4">
        <h3 class="font-semibold mb-4">TagInput Component Demo</h3>
        <div class="max-w-md">
          <label class="text-sm font-medium text-foreground mb-2 block">Test Tags</label>
          <TagInput 
            :value="demoTags"
            @update:value="demoTags = $event"
            placeholder="Add demo tags..."
            :maxTags="8"
          />
          <p class="text-xs text-muted-foreground mt-2">
            Current tags: {{ demoTags.length }} | Try typing and pressing Enter or comma
          </p>
        </div>
      </div>

      <!-- Resource List Page Demo -->
      <div class="border rounded-lg p-4">
        <h3 class="font-semibold mb-4">Configuration Preview</h3>
        <div class="bg-muted/30 p-4 rounded">
          <p class="text-sm text-muted-foreground mb-4">
            The ResourceListPage component would render here with this configuration:
          </p>
          <div class="space-y-2 text-sm">
            <div><strong>Table Columns:</strong> {{ selectedConfig.tableColumns.map(c => c.label).join(', ') }}</div>
            <div><strong>Available Actions:</strong> {{ selectedConfig.actions.join(', ') }}</div>
            <div><strong>Search Placeholder:</strong> "{{ selectedConfig.searchPlaceholder }}"</div>
            <div><strong>Config Component:</strong> {{ selectedConfig.configComponent }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <ResourceAddModal 
      :is-open="showAddModal"
      :resource-type="selectedResourceType"
      @close="showAddModal = false"
      @created="handleResourceCreated"
    />
    
    <ResourceEditModal 
      :is-open="showEditModal"
      :resource="demoResource"
      @close="showEditModal = false"
      @updated="handleResourceUpdated"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Plus, Edit, Tag, RotateCcw } from 'lucide-vue-next'

// Import components
import { Button } from '@/lib/registry/new-york/ui/button'
import TagInput from '@/components/ui/admin/resources/components/TagInput.vue'

// Add Label import
const Label = 'label' // Simple label for demo

// Import our resource system
import { resourceConfigs, type ResourceType } from '@/components/ui/admin/resources/config/resourceConfigs'
import type { Resource } from '@/alp-types/admin-resources.types'

// Import the actual components for demo
import ResourceAddModal from '@/components/ui/admin/resources/components/ResourceAddModal.vue'
import ResourceEditModal from '@/components/ui/admin/resources/components/ResourceEditModal.vue'

// State
const selectedResourceType = ref<ResourceType>('document')
const showAddModal = ref(false)
const showEditModal = ref(false)
const showTagInput = ref(false)
const demoTags = ref(['demo', 'testing', 'vue'])

// Computed
const selectedConfig = computed(() => resourceConfigs[selectedResourceType.value])

// Demo data
const demoResource = computed((): Resource => ({
  id: 1,
  type: selectedResourceType.value,
  name: `Sample ${selectedConfig.value.label}`,
  description: `This is a demo ${selectedConfig.value.label.toLowerCase()} for testing purposes.`,
  insertedAt: new Date('2024-01-15'),
  updatedAt: new Date('2024-01-20'),
  insertedById: 1,
  lastUpdatedById: 1,
  isDeleted: false,
  metadata: {
    name: `Sample ${selectedConfig.value.label}`,
    tags: ['demo', 'test', selectedResourceType.value],
    categories: ['testing'],
    entityType: 'offering' as const,
    entityId: 1,
    accessLevel: 'public' as const,
    viewCount: 42,
    lastAccessedAt: new Date('2024-01-19'),
    author: 'Demo User',
    lastModified: new Date('2024-01-20')
  },
  // Type-specific properties (simplified)
  ...(selectedResourceType.value === 'document' && {
    url: '/demo/document.pdf',
    fileName: 'demo-document.pdf',
    fileSize: 1024000,
    mimeType: 'application/pdf',
    version: '1.0',
    isLatestVersion: true,
    downloadCount: 15,
    printCount: 3,
    shareCount: 7
  }),
  ...(selectedResourceType.value === 'url' && {
    url: 'https://example.com/demo-resource',
    domain: 'example.com',
    isExternal: true,
    isActive: true,
    clickCount: 23,
    uniqueVisitors: 18
  }),
  ...(selectedResourceType.value === 'form' && {
    syntaqFormId: 'demo-form-123',
    formVersion: '2.1',
    isPublished: true,
    fieldCount: 8,
    requiredFieldCount: 3,
    submissionCount: 47,
    gdprCompliant: true,
    consentRequired: false
  }),
  ...(selectedResourceType.value === 'emailTemplate' && {
    subject: 'Demo Email Template',
    htmlContent: '<p>This is a demo email template</p>',
    variables: [],
    requiredVariables: [],
    optionalVariables: [],
    sendCount: 12,
    includesUnsubscribe: true,
    gdprCompliant: true,
    canSpamCompliant: true
  }),
  ...(selectedResourceType.value === 'vdFolder' && {
    sharePointSiteUrl: 'https://example.sharepoint.com/sites/demo',
    sharePointFolderId: 'demo-folder-456',
    sharePointFolderPath: '/Demo/Resources',
    subfolderCount: 3,
    totalItemCount: 24,
    totalSize: 15728640,
    syncStatus: 'synced' as const,
    sharePointPermissions: [],
    inheritPermissions: true,
    accessCount: 8,
    uniqueAccessors: 5
  }),
  ...(selectedResourceType.value === 'video' && {
    duration: 300,
    format: 'mp4',
    resolution: '1080p',
    chapters: [],
    topics: ['demo', 'tutorial'],
    hostingPlatform: 'youtube' as const,
    videoUrl: 'https://youtube.com/watch?v=demo123',
    hasSubtitles: true,
    subtitleLanguages: ['en'],
    hasTranscript: false,
    viewCount: 156,
    uniqueViewers: 89
  })
} as Resource))

function refreshDemoData() {
  // Simulate refreshing data
  console.log('Demo data refreshed for', selectedResourceType.value)
}

function handleResourceCreated(resource: Resource) {
  console.log('Resource created:', resource)
  showAddModal.value = false
}

function handleResourceUpdated(resource: Resource) {
  console.log('Resource updated:', resource)
  showEditModal.value = false
}
</script>

<style scoped>
/* Component-specific styles */
</style>