<template>
  <div class="min-h-screen bg-background">
    <!-- Application Header (Simulated ALP Context) -->
    <header class="bg-white border-b border-gray-200 px-6 py-4">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold text-gray-900">ALP Legal Practice Management</h1>
        <div class="text-sm text-gray-600">Admin Panel - Resource Management</div>
      </div>
      <nav class="mt-4">
        <ul class="flex space-x-6">
          <li><a href="#" class="text-blue-600 font-semibold border-b-2 border-blue-600 pb-2">Resource Management</a></li>
          <li><a href="#" class="text-gray-600 hover:text-gray-900 pb-2">User Management</a></li>
          <li><a href="#" class="text-gray-600 hover:text-gray-900 pb-2">System Settings</a></li>
          <li><a href="#" class="text-gray-600 hover:text-gray-900 pb-2">Reports</a></li>
        </ul>
      </nav>
    </header>

    <!-- Main Content - Resource Types Management -->
    <main class="p-6 max-w-7xl mx-auto">
      <div class="mb-8">
        <h2 class="text-3xl font-bold text-gray-900 mb-2">Resource Management System</h2>
        <p class="text-gray-600">Configuration-driven resource management for all resource types</p>
      </div>
      
      <!-- Resource Type Selector -->
      <div class="mb-6">
        <h3 class="text-xl font-semibold mb-4">Select Resource Type</h3>
        <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
          <button
            v-for="(config, type) in resourceConfigs"
            :key="type"
            @click="selectedResourceType = type"
            :class="[
              'flex items-center gap-3 p-4 border rounded-lg transition-colors',
              selectedResourceType === type 
                ? 'border-blue-500 bg-blue-50 text-blue-700' 
                : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
            ]"
          >
            <component :is="config.icon" class="w-5 h-5" />
            <div class="text-left">
              <div class="font-medium">{{ config.pluralLabel }}</div>
              <div class="text-xs text-gray-600">{{ config.description.split(',')[0] }}</div>
            </div>
          </button>
        </div>
      </div>

      <!-- Selected Resource Type Management -->
      <div v-if="selectedResourceType" class="bg-white border border-gray-200 rounded-lg p-6">
        <h4 class="text-lg font-semibold mb-4">{{ selectedConfig.pluralLabel }} Management</h4>
        <ResourceListPage :resource-type="selectedResourceType" />
      </div>

      <!-- Default state -->
      <div v-else class="text-center py-12 text-gray-500">
        <p class="text-lg mb-2">Select a resource type above to get started</p>
        <p class="text-sm">Choose from documents, URLs, forms, email templates, videos, or VD folders</p>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import ResourceListPage from '@/components/ui/admin/resources/components/ResourceListPage.vue'
import { resourceConfigs } from '@/components/ui/admin/resources/config/resourceConfigs'
import type { ResourceType } from '@/alp-types/resources.types'

// Reactive state
const selectedResourceType = ref<ResourceType | null>('document')

// Computed properties
const selectedConfig = computed(() => {
  return selectedResourceType.value ? resourceConfigs[selectedResourceType.value] : null
})
</script>

<style scoped>
/* Resource Types Prototype Specific Styles */
</style>
