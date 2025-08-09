<template>
  <div class="resource-association-prototype">
    <!-- Prototype Header -->
    <header class="prototype-header">
      <div class="max-w-7xl mx-auto px-6 py-4">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">Resource Association Prototype</h1>
            <p class="text-gray-600 mt-1">Simplified offering designer with three-level resource association</p>
          </div>
          <div class="prototype-status">
            <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              Phase 1: Foundation
            </span>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="prototype-content">
      <SimplifiedOfferingDesigner />
    </main>

    <!-- Development Notes (only visible in prototype) -->
    <div class="development-notes">
      <div class="max-w-7xl mx-auto px-6 py-4">
        <details class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <summary class="cursor-pointer font-medium text-yellow-800 mb-2">
            🚧 Development Notes - Phase 1 Implementation
          </summary>
          <div class="text-sm text-yellow-700 space-y-2">
            <p><strong>✅ Implemented:</strong></p>
            <ul class="list-disc list-inside ml-4 space-y-1">
              <li>Three-level hierarchy display (Offering → Outcome → Component)</li>
              <li>Resource display using existing ResourceSummary component</li>
              <li>Inline outcome title and description editing</li>
              <li>Placeholder buttons for all major interactions</li>
              <li>Mock data structure with realistic content</li>
            </ul>
            
            <p><strong>🔄 Coming Next (Phase 2):</strong></p>
            <ul class="list-disc list-inside ml-4 space-y-1">
              <li>Component Designer Drawer (90% screen overlay)</li>
              <li>Resource Association Modal (unified for all levels)</li>
              <li>Resource creation workflow integration</li>
              <li>Enhanced interactions and state management</li>
            </ul>
            
            <p><strong>💡 Try These Features:</strong></p>
            <ul class="list-disc list-inside ml-4 space-y-1">
              <li>Click on outcome titles/descriptions to edit inline</li>
              <li>Click "Edit" buttons to see placeholder alerts</li>
              <li>Click "Add Resource" buttons at different levels</li>
              <li>Click on resource cards to see actions</li>
            </ul>
          </div>
        </details>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import SimplifiedOfferingDesigner from '@/components/business/resource-association/SimplifiedOfferingDesigner.vue'
</script>

<style scoped>
.resource-association-prototype {
  @apply min-h-screen bg-gray-50;
}

.prototype-header {
  @apply bg-white shadow-sm border-b border-gray-200;
}

.prototype-status {
  @apply flex items-center;
}

.prototype-content {
  @apply flex-1;
}

.development-notes {
  @apply border-t border-gray-200 bg-gray-50;
}

/* Override the padding from SimplifiedOfferingDesigner since we have our own header */
.resource-association-prototype :deep(.simplified-offering-designer) {
  @apply pt-0;
}
</style>
