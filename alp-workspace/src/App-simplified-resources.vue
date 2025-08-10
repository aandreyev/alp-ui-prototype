<template>
  <div class="min-h-screen bg-background">
    <!-- Header -->
    <header class="border-b bg-white">
      <div class="container mx-auto px-6 py-4">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold">Simplified Resource Modals</h1>
            <p class="text-muted-foreground">Test the simplified resource creation and editing interface</p>
          </div>
          <div class="flex items-center gap-2">
            <Button @click="currentView = 'test'" :variant="currentView === 'test' ? 'default' : 'outline'">
              Modal Test
            </Button>
            <Button @click="currentView = 'designer'" :variant="currentView === 'designer' ? 'default' : 'outline'">
              Designer Integration
            </Button>
          </div>
        </div>
      </div>
    </header>

    <!-- Content -->
    <main class="container mx-auto px-6 py-8">
      <!-- Modal Test View -->
      <SimplifiedResourceModalTest v-if="currentView === 'test'" />
      
      <!-- Designer Integration View -->
      <SimplifiedOfferingDesigner v-else-if="currentView === 'designer'" />
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// UI Components
import { Button } from '@/lib/registry/new-york/ui/button'

// Test Components
import SimplifiedResourceModalTest from '@/components/business/resources-add-edit/SimplifiedResourceModalTest.vue'
import SimplifiedOfferingDesigner from '@/components/business/resource-association/SimplifiedOfferingDesigner.vue'

// Reactive state
const currentView = ref<'test' | 'designer'>('test')
</script>
