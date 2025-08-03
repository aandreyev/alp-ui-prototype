<template>
  <div class="min-h-screen bg-background">
    <!-- Simple Header -->
    <header class="bg-white border-b border-gray-200 px-6 py-4">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold text-gray-900">Resource Management System</h1>
        
        <!-- Resource Type Switcher -->
        <div class="flex items-center gap-4">
          <label class="text-sm font-medium text-gray-700">Resource Type:</label>
          <select 
            v-model="selectedResourceType" 
            class="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="document">Documents</option>
            <option value="url">URLs</option>
            <option value="form">Forms</option>
            <option value="emailTemplate">Email Templates</option>
            <option value="vdFolder">VD Folders</option>
            <option value="video">Videos</option>
          </select>
        </div>
      </div>
    </header>

    <!-- Main Content - Production ResourceListPage Component -->
    <main class="p-6">
      <ResourceListPage :resource-type="selectedResourceType" />
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { ResourceType } from '@/alp-types/admin-resources.types'
import ResourceListPage from '@/components/ui/admin/resources/components/ResourceListPage.vue'

// Simple state for UI demo
const selectedResourceType = ref<ResourceType>('document')
</script>
