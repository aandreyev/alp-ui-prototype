<template>
  <div class="space-y-4">
    <div class="grid gap-4">
      <div>
        <h3 class="font-medium">{{ client.name }}</h3>
        <p class="text-sm text-muted-foreground">{{ client.email }}</p>
      </div>
      
      <div class="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span class="font-medium">Status:</span>
          <span class="ml-2">{{ client.status }}</span>
        </div>
        <div>
          <span class="font-medium">Phone:</span>
          <span class="ml-2">{{ client.phone || 'Not provided' }}</span>
        </div>
        <div>
          <span class="font-medium">Contact Person:</span>
          <span class="ml-2">{{ client.contactPerson || 'Not specified' }}</span>
        </div>
        <div>
          <span class="font-medium">Total Billed:</span>
          <span class="ml-2">${{ (client.totalBilled || 0).toLocaleString() }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Client } from '@/types'

defineProps<{
  client: Client
}>()
</script>
