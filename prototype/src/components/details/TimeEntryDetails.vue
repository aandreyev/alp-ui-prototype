<template>
  <div class="space-y-4">
    <p class="text-sm text-muted-foreground">Time Entry details placeholder - to be implemented</p>
  </div>
</template>

<script setup lang="ts">
import type { TimeEntry } from '@/types'

defineProps<{
  timeEntry: TimeEntry
}>()
</script>
