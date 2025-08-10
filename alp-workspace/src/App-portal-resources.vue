<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Application Header -->
    <header class="bg-white border-b border-gray-200 shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <div class="flex items-center space-x-4">
            <div class="flex-shrink-0">
              <h1 class="text-xl font-semibold text-gray-900">ALP Portal Resources</h1>
            </div>
            <div class="hidden md:block">
              <div class="text-sm text-gray-500">Point-of-need resource delivery system</div>
            </div>
          </div>
          
          <!-- Matter Context (simulated) -->
          <div class="flex items-center space-x-4">
            <div class="text-sm text-gray-600">
              <span class="font-medium">Matter:</span> Property Purchase - Smith Family
            </div>
            <div class="text-sm text-gray-600">
              <span class="font-medium">Matter #:</span> 2024-001
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- Tab Navigation (simulated ALP tab structure) -->
    <div class="bg-white border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav class="flex space-x-8">
          <button 
            class="border-b-2 border-blue-500 py-2 px-1 text-sm font-medium text-blue-600"
          >
            Outcomes & Resources
          </button>
          <button 
            class="border-b-2 border-transparent py-2 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
          >
            Matter Details
          </button>
          <button 
            class="border-b-2 border-transparent py-2 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
          >
            Documents
          </button>
          <button 
            class="border-b-2 border-transparent py-2 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
          >
            Time & Billing
          </button>
        </nav>
      </div>
    </div>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div class="bg-white rounded-lg shadow">
        <div class="p-6">
          <!-- Tab Content Header -->
          <div class="mb-6">
            <h2 class="text-lg font-medium text-gray-900 mb-2">Outcomes & Resources</h2>
            <p class="text-sm text-gray-600">
              Access all resources associated with this matter's outcomes and components at the point of need.
            </p>
          </div>

          <!-- Enhanced Outcomes Tab Component -->
          <EnhancedOutcomesTab />
        </div>
      </div>
    </main>

    <!-- Footer -->
    <footer class="bg-white border-t border-gray-200 mt-12">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <p class="text-xs text-gray-500 text-center">
          ALP Portal Resources Prototype - Point-of-need resource delivery system
        </p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import EnhancedOutcomesTab from '@/components/business/resource-matters/EnhancedOutcomesTab.vue'
</script>

<style scoped>
/* Application-level styles */
.min-h-screen {
  min-height: 100vh;
}

/* Ensure proper spacing and layout */
main {
  flex: 1;
}
</style>
