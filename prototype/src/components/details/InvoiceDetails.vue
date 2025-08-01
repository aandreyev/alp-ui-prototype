<template>
  <div class="space-y-4">
    <p class="text-sm text-muted-foreground">Invoice details placeholder - to be implemented</p>
  </div>
</template>

<script setup lang="ts">
import type { Invoice } from '@/types'

defineProps<{
  invoice: Invoice
}>()
</script>
