<template>
  <div class="min-h-screen bg-background">
    <header class="bg-white border-b border-gray-200 px-6 py-4">
      <div class="flex items-center justify-between">
        <h1 class="text-xl font-semibold">Resource Types</h1>
        <div class="text-sm text-gray-600">
          Selected: {{ selectedConfig?.pluralLabel }}
        </div>
      </div>
    </header>

    <main class="p-6 max-w-7xl mx-auto">
      <!-- Resource Type Selector -->
      <div class="mb-6">
        <h3 class="text-xl font-semibold mb-4">Select Resource Type</h3>
        <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
          <button
            v-for="item in typedResourceConfigs"
            :key="item.type"
            @click="selectResourceType(item.type)"
            :class="[
              'flex items-center gap-3 p-4 border rounded-lg transition-colors',
              selectedResourceType === item.type
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
            ]"
          >
            <component :is="item.config.icon" class="w-5 h-5" />
            <div class="text-left">
              <div class="font-medium">{{ item.config.pluralLabel }}</div>
              <div class="text-xs text-gray-600">
                {{ item.config.description?.split(',')[0] }}
              </div>
            </div>
          </button>
        </div>
      </div>

      <!-- Selected Resource Type Management -->
      <div class="bg-white border border-gray-200 rounded-lg p-6">
  <ResourceManagementPage :resource-type="selectedResourceType" />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import ResourceManagementPage from '@/components/business/resource-management/ResourceManagementPage.vue'
import { resourceConfigs } from '@/components/ui/admin/resources/config/resourceConfigs'
// Use the ResourceType exported by resourceConfigs to ensure type compatibility
import type { ResourceType } from '@/components/ui/admin/resources/config/resourceConfigs'

// Selected type (keep it always a ResourceType to avoid null checks everywhere)
const selectedResourceType = ref<ResourceType>('document')

// Properly typed array for v-for (fixes key inference issues)
const typedResourceConfigs = computed(() => {
  return (Object.keys(resourceConfigs) as ResourceType[]).map((type) => ({
    type,
    config: resourceConfigs[type],
  }))
})

// Currently selected config (used in header and section title)
const selectedConfig = computed(() => resourceConfigs[selectedResourceType.value])

// Explicitly typed handler (satisfies linter in @click usage)
const selectResourceType = (type: ResourceType) => {
  selectedResourceType.value = type
}
</script>

<style scoped>
/* Resource Types Prototype Specific Styles */
</style>
