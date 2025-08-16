<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Show prototype selector or selected prototype -->
    <div v-if="!selectedPrototype" class="prototype-selector">
      <!-- ALP Header -->
      <header class="bg-white shadow-sm border-b border-gray-200">
        <div class="max-w-7xl mx-auto px-6 py-4">
          <h1 class="text-3xl font-bold text-gray-900">ALP UI Prototypes</h1>
          <p class="text-gray-600 mt-1">Select a prototype to view and test</p>
        </div>
      </header>

      <!-- Prototype Selection Cards -->
      <main class="max-w-7xl mx-auto px-6 py-12">
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          <!-- Portal Resources Prototype -->
          <div class="prototype-card" @click="selectPrototype('portal-resources')">
            <div class="prototype-icon">
              <svg class="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
              </svg>
            </div>
            <h2 class="prototype-title">Portal Resources</h2>
            <p class="prototype-description">
              Hierarchical resource management for legal matters. View resources organized by 
              offerings, outcomes, and components with advanced filtering and search capabilities.
            </p>
            <div class="prototype-features">
              <span class="feature-tag">Matter-based</span>
              <span class="feature-tag">Hierarchical</span>
              <span class="feature-tag">Advanced Filters</span>
            </div>
            <div class="prototype-cta">
              <span>View Prototype →</span>
            </div>
          </div>

          <!-- Resource Types Prototype -->
          <div class="prototype-card" @click="selectPrototype('resource-types')">
            <div class="prototype-icon">
              <svg class="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"/>
              </svg>
            </div>
            <h2 class="prototype-title">Resource Types Management</h2>
            <p class="prototype-description">
              Administrative interface for managing different resource types. Configure and manage 
              documents, URLs, forms, email templates, videos, and VD SharePoint folders.
            </p>
            <div class="prototype-features">
              <span class="feature-tag">Admin Interface</span>
              <span class="feature-tag">Type-specific Forms</span>
              <span class="feature-tag">CRUD Operations</span>
            </div>
            <div class="prototype-cta">
              <span>View Prototype →</span>
            </div>
          </div>

          <!-- Resource Association Prototype -->
          <div class="prototype-card" @click="selectPrototype('resource-association')">
            <div class="prototype-icon">
              <svg class="w-12 h-12 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/>
              </svg>
            </div>
            <h2 class="prototype-title">Resource Association</h2>
            <p class="prototype-description">
              Simplified offering designer with three-level resource association. Clean hierarchy 
              display with unified resource management across offerings, outcomes, and components.
            </p>
            <div class="prototype-features">
              <span class="feature-tag">Three-Level Hierarchy</span>
              <span class="feature-tag">Unified Modal</span>
              <span class="feature-tag">Phase 1</span>
            </div>
            <div class="prototype-cta">
              <span>View Prototype →</span>
            </div>
          </div>

          <!-- Simplified Resources Prototype -->
          <div class="prototype-card" @click="selectPrototype('simplified-resources')">
            <div class="prototype-icon">
              <svg class="w-12 h-12 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
            </div>
            <h2 class="prototype-title">Simplified Resource Modals</h2>
            <p class="prototype-description">
              Streamlined resource creation and editing modals with type-specific configurations. 
              Test all resource types including documents, URLs, forms, email templates, videos, and SharePoint folders.
            </p>
            <div class="prototype-features">
              <span class="feature-tag">Type-Specific Forms</span>
              <span class="feature-tag">Unified Interface</span>
              <span class="feature-tag">Test Suite</span>
            </div>
            <div class="prototype-cta">
              <span>View Prototype →</span>
            </div>
          </div>

          <!-- Draft Time Entries Prototype -->
          <div class="prototype-card" @click="selectPrototype('time-entries-draft')">
            <div class="prototype-icon">
              <svg class="w-12 h-12 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <h2 class="prototype-title">Draft Time Entries</h2>
            <p class="prototype-description">
              Time entry automation and management system. Create, edit, and manage draft time entries 
              with automated workflows, client/matter association, and bulk operations.
            </p>
            <div class="prototype-features">
              <span class="feature-tag">Time Tracking</span>
              <span class="feature-tag">Automation</span>
              <span class="feature-tag">Bulk Operations</span>
            </div>
            <div class="prototype-cta">
              <span>View Prototype →</span>
            </div>
          </div>

        </div>

        <!-- URL Instructions -->
        <div class="mt-12 p-6 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 class="text-lg font-semibold text-blue-900 mb-2">Direct Access URLs</h3>
          <p class="text-blue-800 mb-3">You can also access prototypes directly via URL parameters:</p>
          <div class="space-y-2 text-sm font-mono">
            <div class="text-blue-700">
              <strong>Portal Resources:</strong> 
              <span class="ml-2 text-blue-600">?prototype=portal-resources</span>
            </div>
            <div class="text-blue-700">
              <strong>Resource Types:</strong> 
              <span class="ml-2 text-blue-600">?prototype=resource-types</span>
            </div>
            <div class="text-blue-700">
              <strong>Resource Association:</strong> 
              <span class="ml-2 text-blue-600">?prototype=resource-association</span>
            </div>
            <div class="text-blue-700">
              <strong>Simplified Resources:</strong> 
              <span class="ml-2 text-blue-600">?prototype=simplified-resources</span>
            </div>
            <div class="text-blue-700">
              <strong>Draft Time Entries:</strong> 
              <span class="ml-2 text-blue-600">?prototype=time-entries-draft</span>
            </div>
          </div>
        </div>
      </main>
    </div>

    <!-- Selected Prototype Display -->
    <div v-else class="prototype-display">
      <!-- Back to Selector Button -->
      <div class="fixed top-4 left-4 z-50">
        <button 
          @click="selectedPrototype = null" 
          class="back-button"
          title="Back to Prototype Selector"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
          </svg>
          <span class="ml-2">Prototypes</span>
        </button>
      </div>

      <!-- Load Selected Prototype -->
      <component :is="selectedPrototypeComponent" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import AppPortalResources from './App-portal-resources.vue'
import AppResourceTypes from './App-resource-types.vue'
import AppResourceAssociation from './App-resource-association.vue'
import AppSimplifiedResources from './App-simplified-resources.vue'
import DraftTimeEntriesPage from '@/components/business/time-entries-draft/DraftTimeEntriesPage.vue'

// Reactive state
const selectedPrototype = ref<string | null>(null)

// Component mapping
const prototypeComponents = {
  'portal-resources': AppPortalResources,
  'resource-types': AppResourceTypes,
  'resource-association': AppResourceAssociation,
  'simplified-resources': AppSimplifiedResources,
  'time-entries-draft': DraftTimeEntriesPage
}

// Computed properties
const selectedPrototypeComponent = computed(() => {
  if (selectedPrototype.value && selectedPrototype.value in prototypeComponents) {
    return prototypeComponents[selectedPrototype.value as keyof typeof prototypeComponents]
  }
  return null
})

// Methods
const selectPrototype = (prototype: string) => {
  selectedPrototype.value = prototype
  // Update URL without page reload
  const url = new URL(window.location.href)
  url.searchParams.set('prototype', prototype)
  window.history.pushState({}, '', url.toString())
}

// Check URL params on mount
onMounted(() => {
  const urlParams = new URLSearchParams(window.location.search)
  const prototypeParam = urlParams.get('prototype')
  if (prototypeParam && prototypeParam in prototypeComponents) {
    selectedPrototype.value = prototypeParam
  }
})
</script>

<style scoped>
.prototype-selector {
  @apply min-h-screen bg-gray-50;
}

.prototype-card {
  @apply bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 cursor-pointer border border-gray-100 hover:border-blue-200;
}

.prototype-card:hover {
  @apply transform -translate-y-1;
}

.prototype-icon {
  @apply mb-6;
}

.prototype-title {
  @apply text-2xl font-bold text-gray-900 mb-4;
}

.prototype-description {
  @apply text-gray-600 mb-6 leading-relaxed;
}

.prototype-features {
  @apply flex flex-wrap gap-2 mb-6;
}

.feature-tag {
  @apply px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full;
}

.prototype-cta {
  @apply text-blue-600 font-semibold;
}

.prototype-card:hover .prototype-cta {
  @apply text-blue-700;
}

.back-button {
  @apply flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 hover:shadow-md transition-all text-gray-700 hover:text-gray-900;
}

.prototype-display {
  @apply min-h-screen;
}
</style>
