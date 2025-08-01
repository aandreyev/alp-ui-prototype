<template>
  <div class="space-y-4">
    <p class="text-sm text-muted-foreground">Time Entry form placeholder - to be implemented</p>
    <div class="flex justify-end gap-2">
      <Button variant="outline" @click="$emit('cancel')">Cancel</Button>
      <Button @click="handleSave">Save</Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Button } from '@/lib/registry/new-york/ui/button'
import type { TimeEntry } from '@/types'

defineProps<{
  timeEntry?: TimeEntry
  mode: 'create' | 'edit'
}>()

const emit = defineEmits<{
  save: [timeEntry: TimeEntry]
  cancel: []
}>()

const handleSave = () => {
  emit('save', { id: Date.now() } as TimeEntry)
}
</script>
