<template>
  <div class="space-y-4">
    <div class="grid gap-4">
      <div>
        <h3 class="font-medium">{{ matter.name }}</h3>
        <p class="text-sm text-muted-foreground">{{ matter.client.name }}</p>
      </div>
      
      <div class="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span class="font-medium">Status:</span>
          <span class="ml-2">{{ matter.status }}</span>
        </div>
        <div>
          <span class="font-medium">Priority:</span>
          <span class="ml-2">{{ matter.priority }}</span>
        </div>
        <div>
          <span class="font-medium">Coordinator:</span>
          <span class="ml-2">{{ matter.coordinator.name }}</span>
        </div>
        <div>
          <span class="font-medium">Budget:</span>
          <span class="ml-2">${{ matter.estimatedBudget.toLocaleString() }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Matter } from '@/types'

defineProps<{
  matter: Matter
}>()
</script>
