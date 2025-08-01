<template>
  <div class="min-h-screen bg-background">
    <!-- AI Prototype Header -->
    <header class="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div class="container flex h-14 items-center">
        <h1 class="text-lg font-semibold">🤖 ALP AI Prototype Playground</h1>
      </div>
    </header>

    <!-- AI Component Testing Area -->
    <main class="container py-8 space-y-8">
      
      <!-- Quick Component Tests - AI can add components here -->
      <section class="space-y-4">
        <h2 class="text-xl font-semibold">🧪 Component Tests</h2>
        
        <!-- Example: AI builds components and tests them here -->
        <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <MatterCard 
            v-for="matter in displayMatters" 
            :key="matter.id" 
            :matter="matter" 
          />
        </div>
      </section>

      <!-- Component Variants - AI can test different states -->
      <section class="space-y-4">
        <h2 class="text-xl font-semibold">🎯 Variant Testing</h2>
        
        <div class="flex flex-wrap gap-2">
          <Button>Default</Button>
          <Button variant="destructive">Delete</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
        </div>
      </section>

      <!-- AI Experiments Section -->
      <section class="space-y-4">
        <h2 class="text-xl font-semibold">🚧 AI Experiments</h2>
        <div class="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
          <p class="text-muted-foreground">AI can build and test new components here</p>
        </div>
      </section>
      
    </main>

    <!-- Modal System -->
    <PrototypeModals />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Button from '@/lib/registry/new-york/ui/button/Button.vue'
import MatterCard from '@/components/business/MatterCard.vue'
import PrototypeModals from '@/components/modals/PrototypeModals.vue'
import { useData } from '@/composables/useData'

// Use JSON data instead of hardcoded data
const { getMatters, matterStats, clientStats } = useData()

// Get first few matters for display
const displayMatters = computed(() => getMatters.value.slice(0, 3))
</script>
